package service

import (
	"context"
	"log/slog"
	"time"
	"xuanvinh/internal/repository"
)

type auctionRepo interface {
	Create(ctx context.Context, arg repository.CreateAuctionParams) (repository.Auction, error)
	GetByID(ctx context.Context, id int32) (repository.Auction, error)
	GetOwner(ctx context.Context, id int32) (repository.GetAuctionOwnerRow, error)
}

type categoryGuard interface {
	Exists(ctx context.Context, id int32) (bool, error)
}

const minAuctionDuration = 30 * time.Minute

type AuctionService struct {
	auctions auctionRepo
	cats     categoryGuard
	log      *slog.Logger
}

func NewAuctionService(auctions auctionRepo, cats categoryGuard, log *slog.Logger) *AuctionService {
	return &AuctionService{
		auctions: auctions,
		cats:     cats,
		log:      log.With(slog.String("component", "auction_service")),
	}
}

func (s *AuctionService) Create(ctx context.Context) {

}

func (s *AuctionService) GetByID(ctx context.Context) {

}
