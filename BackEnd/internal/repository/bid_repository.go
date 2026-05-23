package repository

import (
	"context"
	"xuanvinh/internal/db/sqlc"
	"xuanvinh/internal/dto"

	"github.com/jackc/pgx/v5/pgxpool"
)

type BidRepository struct {
	q *sqlc.Queries
}

func NewBidRepository(pool *pgxpool.Pool) *BidRepository {
	return &BidRepository{q: sqlc.New(pool)}
}

func (r *BidRepository) ListByAuction(ctx context.Context, arg ListBidsByAuctionParams) ([]dto.BidListItem, error) {
	rows, err := r.q.ListBidsByAuction(ctx, arg)
	if err != nil {
		return nil, err
	}
	items := make([]dto.BidListItem, 0, len(rows))
	for _, row := range rows {
		items = append(items, dto.BidListItem{
			ID:             row.ID,
			BidderName:     row.BidderName,
			BidPrice:       row.BidPrice,
			AuctionVersion: row.AuctionVersion,
			CreatedAt:      row.CreatedAt,
		})
	}
	return items, nil
}

func (r *BidRepository) CountByAuction(ctx context.Context, auctionID int32) (int64, error) {
	return r.q.CountBidsByAuction(ctx, auctionID)
}
