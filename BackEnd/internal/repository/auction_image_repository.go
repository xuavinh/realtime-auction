package repository

import (
	"context"
	"errors"
	"xuanvinh/internal/db/sqlc"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type AuctionImageRepository struct {
	q *sqlc.Queries
}

func NewAuctionImageRepository(pool *pgxpool.Pool) *AuctionImageRepository {
	return &AuctionImageRepository{q: sqlc.New(pool)}
}

func (r *AuctionImageRepository) Create(ctx context.Context, arg CreateAuctionImageParams) (AuctionImage, error) {
	img, err := r.q.CreateAuctionImage(ctx, arg)
	if err != nil {
		return AuctionImage{}, err
	}
	return img, nil
}

func (r *AuctionImageRepository) ListByAuction(ctx context.Context, auctionID int32) ([]AuctionImage, error) {
	return r.q.ListAuctionImages(ctx, auctionID)
}

func (r *AuctionImageRepository) GetByID(ctx context.Context, id int32) (AuctionImage, error) {
	image, err := r.q.GetAuctionImage(ctx, id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return AuctionImage{}, ErrNotFound
		}
		return AuctionImage{}, err
	}
	return image, nil
}

func (r *AuctionImageRepository) Count(ctx context.Context, auctionID int32) (int32, error) {
	return r.q.CountAuctionImages(ctx, auctionID)
}

func (r *AuctionImageRepository) Delete(ctx context.Context, arg DeleteAuctionImageParams) (int64, error) {
	return r.q.DeleteAuctionImage(ctx, arg)
}

func (r *AuctionImageRepository) PromoteFirstToPrimary(ctx context.Context, auctionID int32) (AuctionImage, error) {
	img, err := r.q.PromoteFirstImageToPrimary(ctx, auctionID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return AuctionImage{}, ErrNotFound
		}
		return AuctionImage{}, err
	}
	return img, nil
}
