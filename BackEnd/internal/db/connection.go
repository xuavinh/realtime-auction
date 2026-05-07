package db

import (
	"context"
	"fmt"
	"log"
	"log/slog"
	"time"
	"xuanvinh/internal/config"
	"xuanvinh/pkg/pgx"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jackc/pgx/v5/tracelog"
)

func Connect(ctx context.Context, cfg config.DBConfig, logger *slog.Logger) (*pgxpool.Pool, error) {
	poolCfg, err := pgxpool.ParseConfig(cfg.DSN)
	if err != nil {
		return nil, fmt.Errorf("Unable to parse DSN: %v", err)
	}

	poolCfg.MaxConns = cfg.MaxConns
	poolCfg.MinConns = cfg.MinConns
	poolCfg.MaxConnLifetime = cfg.MaxConnLifetime
	poolCfg.MaxConnIdleTime = cfg.MaxConnIdleTime
	poolCfg.HealthCheckPeriod = 1 * time.Minute

	poolCfg.ConnConfig.Tracer = &tracelog.TraceLog{
		Logger:   pgx.NewSlogAdapter(logger),
		LogLevel: tracelog.LogLevelInfo,
	}

	pool, err := pgxpool.NewWithConfig(ctx, poolCfg)
	if err != nil {
		return nil, fmt.Errorf("Unable to create connection pool: %v", err)
	}

	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("Unable to ping database: %v", err)
	}
	log.Println("Database connected")
	return pool, nil
}
