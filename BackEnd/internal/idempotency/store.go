package idempotency

import (
	"container/list"
	"fmt"
	"sync"
	"time"
)

type Status string

const (
	StatusNew        Status = "NEW"
	StatusInProgress Status = "IN_PROGRESS"
	StatusCompleted  Status = "COMPLETED"
	shardCount              = 32
)

type entry struct {
	Status   Status
	Response []byte
	ExpireAt time.Time
}

type queueItem struct {
	key      string
	expireAt time.Time
}

type shard struct {
	mu sync.Mutex
	m  map[string]*entry
	q  *list.List
}

type Store struct {
	shards [shardCount]*shard
	ttl    time.Duration
}

func New(ttl time.Duration) *Store {
	s := &Store{ttl: ttl}
	for i := 0; i < shardCount; i++ {
		s.shards[i] = &shard{
			m: make(map[string]*entry),
			q: list.New(),
		}
	}
	go s.cleanupLoop()
	return s
}

// FNV-1a hash
func fnv32(key string) uint32 {
	hash := uint32(2166136261)
	const prime32 = 16777619

	for i := 0; i < len(key); i++ {
		hash ^= uint32(key[i])
		hash *= prime32
	}
	return hash
}

func (s *Store) getShard(key string) *shard {
	return s.shards[fnv32(key)%shardCount]
}

func (s *Store) TryAcquire(key string, userID int32) (Status, []byte) {
	compositeKey := fmt.Sprintf("%s:%d", key, userID)
	now := time.Now()
	expire := now.Add(s.ttl)
	sh := s.getShard(compositeKey)
	sh.mu.Lock()
	defer sh.mu.Unlock()

	existing, ok := sh.m[compositeKey]
	if !ok || now.After(existing.ExpireAt) {
		sh.m[compositeKey] = &entry{
			Status:   StatusInProgress,
			ExpireAt: expire,
		}
		// FIFO
		sh.q.PushBack(queueItem{key: compositeKey, expireAt: expire})
		return StatusNew, nil
	}
	return existing.Status, existing.Response
}

func (s *Store) Complete(key string, userID int32, response []byte) {
	compositeKey := fmt.Sprintf("%s:%d", key, userID)
	expire := time.Now().Add(s.ttl)

	sh := s.getShard(compositeKey)
	sh.mu.Lock()
	defer sh.mu.Unlock()

	sh.m[compositeKey] = &entry{
		Status:   StatusCompleted,
		Response: response,
		ExpireAt: expire,
	}
	sh.q.PushBack(queueItem{key: compositeKey, expireAt: expire})
}

func (s *Store) cleanupLoop() {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		now := time.Now()
		for i := 0; i < shardCount; i++ {
			sh := s.shards[i]
			sh.mu.Lock()

			for sh.q.Len() > 0 {
				elem := sh.q.Front()
				item := elem.Value.(queueItem)
				if now.After(item.expireAt) {
					if existing, exists := sh.m[item.key]; exists {
						//Lazy deletion check
						if !existing.ExpireAt.After(item.expireAt) {
							delete(sh.m, item.key)
						}
					}
					sh.q.Remove(elem)
				} else {
					break
				}
			}
			sh.mu.Unlock()
		}
	}
}
