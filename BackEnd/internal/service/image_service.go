package service

import (
	"context"
	"log/slog"
	"xuanvinh/internal/dto"
	"xuanvinh/internal/repository"
)

const MaxImagesPerAuction = 10

type imageRepo interface {
	Create(ctx context.Context, arg repository.CreateAuctionImageParams) (repository.AuctionImage, error)
	GetByID(ctx context.Context, id int32) (repository.AuctionImage, error)
}

type AuctionImageService struct {
	repo imageRepo
	log  *slog.Logger
}

func NewAuctionImageService(repo imageRepo, log *slog.Logger) *AuctionImageService {
	return &AuctionImageService{
		repo: repo,
		log:  log.With(slog.String("component", "image_service")),
	}
}

func RequireAuctionPending(status string) error {
	if status != string(repository.AuctionStatusPENDING) {
		return ErrAuctionNotEditable
	}
	return nil
}

type CreateImageInput struct {
	AuctionID     int32
	AuctionStatus string
	URL           string
	Filename      string
	SizeBytes     int32
	MimeType      string
}

func (s *AuctionImageService) Create(ctx context.Context, in CreateImageInput) (dto.AuctionImageItem, error) {
	if err := RequireAuctionPending(in.AuctionStatus); err != nil {
		return dto.AuctionImageItem{}, err
	}
	return dto.AuctionImageItem{}, nil
}

func (s *AuctionImageService) Delete(ctx context.Context, auctionID, imageID int32, auctionStatus string) (string, error) {
	return "", nil
}
