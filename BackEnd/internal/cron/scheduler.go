package cron

import (
	"context"
	"log/slog"
	"time"
	"xuanvinh/internal/actor"
	"xuanvinh/internal/db/sqlc"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Scheduler struct {
	pool     *pgxpool.Pool
	registry *actor.ActorRegistry
	log      *slog.Logger
	stopCh   chan struct{}
}

func NewScheduler(pool *pgxpool.Pool, registry *actor.ActorRegistry, log *slog.Logger) *Scheduler {
	return &Scheduler{
		pool:     pool,
		registry: registry,
		log:      log.With(slog.String("component", "scheduler")),
	}
}

func (s *Scheduler) Start() {
	s.stopCh = make(chan struct{})
	go s.activateLoop()
	go s.endLoop()
	s.log.Info("scheduler started")
}

func (s *Scheduler) Stop() {
	close(s.stopCh)
	s.log.Info("scheduler stopped")
}

func (s *Scheduler) activateLoop() {
	ticker := time.NewTicker(10 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			q := sqlc.New(s.pool)
			rows, err := q.ActivateAuctions(ctx)
			if err != nil {
				s.log.Error("activate auctions failed", slog.Any("err", err))
			} else if len(rows) > 0 {
				s.log.Info("auctions activated", slog.Int("count", len(rows)))
				for _, id := range rows {
					s.registry.NotifyActivated(id)
				}
			}
			cancel()
		case <-s.stopCh:
			return
		}
	}
}

func (s *Scheduler) endLoop() {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			q := sqlc.New(s.pool)
			rows, err := q.EndAuctions(ctx)
			if err != nil {
				s.log.Error("end auctions failed", slog.Any("err", err))
			} else {
				for _, row := range rows {
					s.registry.NotifyEnded(row.ID, row.WinnerID, row.CurrentPrice)
					s.log.Info("auction ended", slog.Int("id", int(row.ID)), slog.Any("winner", row.WinnerID))
				}
			}
			cancel()
		case <-s.stopCh:
			return
		}
	}
}
