package repository

import (
	"context"
	"errors"
	"xuanvinh/internal/db/sqlc"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type AuctionRepository struct {
	q *sqlc.Queries
}

func NewAuctionRepository(pool *pgxpool.Pool) *AuctionRepository {
	return &AuctionRepository{
		q: sqlc.New(pool),
	}
}

func (r *AuctionRepository) Create(ctx context.Context, arg CreateAuctionParams) (Auction, error) {
	a, err := r.q.CreateAuction(ctx, arg)
	if err != nil {
		return Auction{}, err
	}
	return a, nil
}

func (r *AuctionRepository) GetByID(ctx context.Context, id int32) (Auction, error) {
	a, err := r.q.GetActionByID(ctx, id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return Auction{}, ErrNotFound
		}
		return Auction{}, err
	}
	return a, nil
}

func (r *AuctionRepository) GetOwner(ctx context.Context, id int32) (GetAuctionOwnerRow, error) {
	row, err := r.q.GetAuctionOwner(ctx, id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return GetAuctionOwnerRow{}, ErrNotFound
		}
		return GetAuctionOwnerRow{}, err
	}
	return row, nil
}
