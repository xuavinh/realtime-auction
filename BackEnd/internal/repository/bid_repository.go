package repository

import (
	"xuanvinh/internal/db/sqlc"

	"github.com/jackc/pgx/v5/pgxpool"
)

type BidRepository struct {
	q *sqlc.Queries
}

func NewBidRepository(pool *pgxpool.Pool) *BidRepository {
	return &BidRepository{q: sqlc.New(pool)}
}
