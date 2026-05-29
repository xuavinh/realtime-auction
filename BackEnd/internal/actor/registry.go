package actor

import (
	"context"
	"log/slog"
	"sync"
	"time"
	"xuanvinh/internal/db/sqlc"

	"github.com/jackc/pgx/v5/pgxpool"
)

type ActorRegistry struct {
	mu     sync.RWMutex
	actors map[int32]*AuctionActor
	pool   *pgxpool.Pool
	log    *slog.Logger
}

func NewActorRegistry(pool *pgxpool.Pool, log *slog.Logger) *ActorRegistry {
	return &ActorRegistry{
		actors: make(map[int32]*AuctionActor),
		pool:   pool,
		log:    log.With(slog.String("component", "actor_registry")),
	}
}

func (r *ActorRegistry) GetOrCreate(ctx context.Context, auctionID int32) (*AuctionActor, error) {
	r.mu.RLock()
	a, exists := r.actors[auctionID]
	if exists {
		select {
		case <-a.done:

		default:
			r.mu.RUnlock()
			return a, nil
		}
	}
	r.mu.RUnlock()

	r.mu.Lock()
	defer r.mu.Unlock()

	// double check xem da co goroutine nao tao actor chua
	if a, exists := r.actors[auctionID]; exists {
		select {
		case <-a.done:
			delete(r.actors, auctionID)
		default:
			return a, nil
		}
	}
	q := sqlc.New(r.pool)
	row, err := q.GetAuctionForActor(ctx, auctionID)
	if err != nil {
		return nil, err
	}

	a = NewAuctionActor(auctionID, row, r.pool, r.log, r.remove)
	a.Start()

	r.actors[auctionID] = a
	return a, nil
}

func (r *ActorRegistry) NotifyActivated(auctionID int32) {
	r.mu.RLock()
	a, ok := r.actors[auctionID]
	r.mu.RUnlock()
	if !ok {
		return
	}
	a.Send(ActivateAuctionMsg{})
}

func (r *ActorRegistry) NotifyEnded(auctionID int32, winnerID *int32, finalPrice int64) {
	r.mu.RLock()
	a, ok := r.actors[auctionID]
	r.mu.RUnlock()
	if !ok {
		return
	}
	msg := EndAuctionMsg{WinnerID: winnerID, FinalPrice: finalPrice}
	if !a.Send(msg) {
		r.log.Warn("failed to notify actor ended", slog.Int("auction_id", int(auctionID)))
		r.remove(auctionID)
		return
	}

	// Wait for actor shutdown with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	select {
	case <-a.done:
	case <-ctx.Done():
		r.log.Error("actor shutdown timeout", slog.Int("auction_id", int(auctionID)))
		r.remove(auctionID)
	}
}

func (r *ActorRegistry) remove(auctionID int32) {
	r.mu.Lock()
	delete(r.actors, auctionID)
	r.mu.Unlock()
}

func (r *ActorRegistry) ShutdownAll() {
	r.mu.Lock()
	tempActors := make(map[int32]*AuctionActor, len(r.actors))
	for id, a := range r.actors {
		tempActors[id] = a
	}
	r.mu.Unlock()

	var wg sync.WaitGroup
	for id, a := range tempActors {
		wg.Add(1)
		go func(aucID int32, act *AuctionActor) {
			defer wg.Done()
			act.Send(ShutdownMsg{})
			select {
			case <-act.done:
				r.log.Info("Actor shutdown gracefully", "auction_id", aucID)
			}
		}(id, a)
	}
	wg.Wait()

	r.mu.Lock()
	r.actors = make(map[int32]*AuctionActor)
	r.mu.Unlock()
	r.log.Info("All actors have been shutdown")
}
