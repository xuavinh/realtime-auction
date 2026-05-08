package cache

import (
	"context"
	"errors"
	"time"

	"github.com/redis/go-redis/v9"
)

var ErrCacheMiss = errors.New("cache: key not found")

type RedisCache struct {
	rdb *redis.Client
}

type Options struct {
	Addr         string
	Password     string
	DB           int
	PoolSize     int
	MinIdleConns int
	DialTimeout  time.Duration
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
}

func New(ctx context.Context, opts Options) (*RedisCache, error) {
	if opts.PoolSize == 0 {
		opts.PoolSize = 20
	}
	if opts.MinIdleConns == 0 {
		opts.MinIdleConns = 10
	}
	if opts.DialTimeout == 0 {
		opts.DialTimeout = 5 * time.Second
	}
	if opts.ReadTimeout == 0 {
		opts.ReadTimeout = 3 * time.Second
	}
	if opts.WriteTimeout == 0 {
		opts.WriteTimeout = 3 * time.Second
	}
	rdb := redis.NewClient(&redis.Options{
		Addr:         opts.Addr,
		Password:     opts.Password,
		DB:           opts.DB,
		PoolSize:     opts.PoolSize,
		MinIdleConns: opts.MinIdleConns,
		DialTimeout:  opts.DialTimeout,
		ReadTimeout:  opts.ReadTimeout,
		WriteTimeout: opts.WriteTimeout,
	})
	pingCtx, cancel := context.WithTimeout(ctx, opts.DialTimeout)
	defer cancel()
	if err := rdb.Ping(pingCtx).Err(); err != nil {
		return nil, err
	}
	return &RedisCache{rdb: rdb}, nil
}

func (c *RedisCache) Close() error {
	return c.rdb.Close()
}

func (c *RedisCache) Set(ctx context.Context, key, val string, ttl time.Duration) error {
	if err := c.rdb.Set(ctx, key, val, ttl).Err(); err != nil {
		return err
	}
	return nil
}

func (c *RedisCache) Get(ctx context.Context, key string) (string, error) {
	v, err := c.rdb.Get(ctx, key).Result()
	if errors.Is(err, redis.Nil) {
		return "", ErrCacheMiss
	}
	if err != nil {
		return "", err
	}
	return v, nil
}

func (c *RedisCache) Del(ctx context.Context, keys ...string) error {
	if len(keys) == 0 {
		return nil
	}
	if err := c.rdb.Del(ctx, keys...).Err(); err != nil {
		return err
	}
	return nil
}

func (c *RedisCache) Exists(ctx context.Context, keys string) (bool, error) {
	n, err := c.rdb.Exists(ctx, keys).Result()
	if err != nil {
		return false, err
	}
	return n > 0, nil
}
