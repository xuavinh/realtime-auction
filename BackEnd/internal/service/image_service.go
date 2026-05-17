package service

import (
	"context"
	"errors"
	"log/slog"
	"xuanvinh/internal/dto"
	"xuanvinh/internal/repository"
)

const MaxImagesPerAuction = 10

type imageRepo interface {
	Create(ctx context.Context, arg repository.CreateAuctionImageParams) (repository.AuctionImage, error)
	GetByID(ctx context.Context, id int32) (repository.AuctionImage, error)
	Count(ctx context.Context, auctionID int32) (int32, error)
	Delete(ctx context.Context, arg repository.DeleteAuctionImageParams) (int64, error)
	PromoteFirstToPrimary(ctx context.Context, auctionID int32) (repository.AuctionImage, error)
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
	count, err := s.repo.Count(ctx, in.AuctionID)
	if err != nil {
		return dto.AuctionImageItem{}, err
	}
	if count >= MaxImagesPerAuction {
		return dto.AuctionImageItem{}, ErrTooManyImages
	}

	img, err := s.repo.Create(ctx, repository.CreateAuctionImageParams{
		AuctionID: in.AuctionID,
		Url:       in.URL,
		Filename:  in.Filename,
		SizeBytes: in.SizeBytes,
		MimeType:  in.MimeType,
		SortOrder: count + 1,
		IsPrimary: count == 0,
	})
	if err != nil {
		return dto.AuctionImageItem{}, err
	}

	s.log.Info("image uploaded",
		slog.Int("auction_id", int(in.AuctionID)),
		slog.Int("image_id", int(img.ID)),
		slog.Bool("is_primary", img.IsPrimary),
	)
	return toImageItem(img), nil
}

func (s *AuctionImageService) Delete(ctx context.Context, auctionID, imageID int32, auctionStatus string) (string, error) {
	if err := RequireAuctionPending(auctionStatus); err != nil {
		return "", err
	}

	img, err := s.repo.GetByID(ctx, imageID)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return "", ErrImageNotFound
		}
		return "", err
	}
	if img.AuctionID != auctionID {
		return "", ErrImageNotFound
	}

	rows, err := s.repo.Delete(ctx, repository.DeleteAuctionImageParams{
		ID:        imageID,
		AuctionID: auctionID,
	})
	if err != nil {
		return "", err
	}
	if rows == 0 {
		return "", ErrImageNotFound
	}

	if img.IsPrimary {
		if _, err := s.repo.PromoteFirstToPrimary(ctx, auctionID); err != nil &&
			!errors.Is(err, repository.ErrNotFound) {
			s.log.Warn("promote primary failed",
				slog.Int("auction_id", int(auctionID)), slog.Any("err", err))
		}
	}

	s.log.Info("image deleted",
		slog.Int("auction_id", int(auctionID)),
		slog.Int("image_id", int(imageID)),
	)
	return img.Url, nil
}

func toImageItem(img repository.AuctionImage) dto.AuctionImageItem {
	return dto.AuctionImageItem{
		ID:        img.ID,
		URL:       img.Url,
		Filename:  img.Filename,
		SizeBytes: img.SizeBytes,
		MimeType:  img.MimeType,
		SortOrder: img.SortOrder,
		IsPrimary: img.IsPrimary,
		CreatedAt: img.CreatedAt.UTC(),
	}
}
