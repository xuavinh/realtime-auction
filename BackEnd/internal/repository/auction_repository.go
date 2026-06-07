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
	a, err := r.q.GetAuctionByID(ctx, id)
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

func (r *AuctionRepository) List(ctx context.Context, sortMode string, arg ListAuctionsFilterParams) ([]Auction, error) {
	switch sortMode {
	case "newest":
		return r.q.ListAuctionsNewest(ctx, sqlc.ListAuctionsNewestParams(arg))
	case "price_asc":
		return r.q.ListAuctionsPriceAsc(ctx, sqlc.ListAuctionsPriceAscParams(arg))
	case "price_desc":
		return r.q.ListAuctionsPriceDesc(ctx, sqlc.ListAuctionsPriceDescParams(arg))
	case "relevance":
		return r.q.ListAuctionsRelevance(ctx, sqlc.ListAuctionsRelevanceParams(arg))
	default:
		return r.q.ListAuctionsEndingSoon(ctx, arg)
	}
}

func (r *AuctionRepository) Count(ctx context.Context, sortMode string, arg CountAuctionsParams) (int64, error) {
	if sortMode == "ending_soon" {
		return r.q.CountAuctionsEndingSoon(ctx, sqlc.CountAuctionsEndingSoonParams(arg))
	}
	return r.q.CountAuctions(ctx, arg)
}

func (r *AuctionRepository) Update(ctx context.Context, arg UpdateAuctionParams) (Auction, error) {
	a, err := r.q.UpdateAuction(ctx, arg)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			return Auction{}, ErrNotFound
		}
		return Auction{}, err
	}
	return a, nil
}

func (r *AuctionRepository) Delete(ctx context.Context, id int32) error {
	return r.q.DeleteAuction(ctx, id)
}
