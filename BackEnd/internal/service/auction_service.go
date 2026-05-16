package service

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"time"
	"xuanvinh/internal/dto"
	"xuanvinh/internal/repository"
	"xuanvinh/internal/utils"
)

type auctionRepo interface {
	Create(ctx context.Context, arg repository.CreateAuctionParams) (repository.Auction, error)
	GetByID(ctx context.Context, id int32) (repository.Auction, error)
	GetOwner(ctx context.Context, id int32) (repository.GetAuctionOwnerRow, error)
}

type auctionCategoryDeps interface {
	Exists(ctx context.Context, id int32) (bool, error)
	GetByIDs(ctx context.Context, ids []int32) (map[int32]repository.GetCategoryByIDsRow, error)
}

type auctionImageReader interface {
	ListByAuction(ctx context.Context, auctionID int32) ([]repository.AuctionImage, error)
}

const minAuctionDuration = 30 * time.Minute

type AuctionService struct {
	auctions auctionRepo
	cats     auctionCategoryDeps
	images   auctionImageReader
	log      *slog.Logger
}

func NewAuctionService(auctions auctionRepo, cats auctionCategoryDeps, images auctionImageReader, log *slog.Logger) *AuctionService {
	return &AuctionService{
		auctions: auctions,
		cats:     cats,
		images:   images,
		log:      log.With(slog.String("component", "auction_service")),
	}
}

func (s *AuctionService) Create(ctx context.Context, userID int32, in dto.CreateAuctionRequest) (dto.AuctionResponse, error) {
	title := utils.SanitizeString(in.Title)
	desc := utils.SanitizeString(in.Description)

	if len(title) < 10 || len(title) > 255 {
		return dto.AuctionResponse{}, fmt.Errorf("%w: title length", ErrInvalidAuction)
	}

	startUTC := in.StartTime.UTC()
	endUTC := in.EndTime.UTC()

	now := time.Now().UTC()
	if !startUTC.After(now) {
		return dto.AuctionResponse{}, fmt.Errorf("%w: start_time must be future", ErrInvalidAuction)
	}
	if !endUTC.After(startUTC) {
		return dto.AuctionResponse{}, fmt.Errorf("%w: end_time must be > start_time", ErrInvalidAuction)
	}
	if endUTC.Sub(startUTC) < minAuctionDuration {
		return dto.AuctionResponse{}, fmt.Errorf("%w: duration < 30m", ErrInvalidAuction)
	}

	if in.CategoryID != nil {
		ok, err := s.cats.Exists(ctx, *in.CategoryID)
		if err != nil {
			return dto.AuctionResponse{}, fmt.Errorf("auction.Create: cat exists: %w", err)
		}
		if !ok {
			return dto.AuctionResponse{}, ErrCategoryNotFound
		}
	}

	var descPtr *string
	if desc != "" {
		descPtr = &desc
	}

	a, err := s.auctions.Create(ctx, repository.CreateAuctionParams{
		Title:           title,
		Description:     descPtr,
		CategoryID:      in.CategoryID,
		StartPrice:      in.StartPrice,
		MinBidIncrement: in.MinBidIncrement,
		StartTime:       startUTC,
		EndTime:         endUTC,
		CreatedBy:       userID,
	})
	if err != nil {
		return dto.AuctionResponse{}, fmt.Errorf("auction.Create: %w", err)
	}

	s.log.Info("auction created",
		slog.Int("auction_id", int(a.ID)),
		slog.Int("user_id", int(userID)),
	)
	catMap, err := s.loadCategoryMap(ctx, a)
	if err != nil {
		return dto.AuctionResponse{}, fmt.Errorf("auction.Create: categories: %w", err)
	}
	return toAuctionResponse(a, nil, catMap), nil
}

func (s *AuctionService) GetByID(ctx context.Context, id int32) (dto.AuctionResponse, error) {
	if id <= 0 {
		return dto.AuctionResponse{}, fmt.Errorf("%w: invalid id", ErrInvalidAuction)
	}
	a, err := s.auctions.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return dto.AuctionResponse{}, ErrAuctionNotFound
		}
		return dto.AuctionResponse{}, fmt.Errorf("auction.GetByID: %w", err)
	}

	imgs, err := s.images.ListByAuction(ctx, id)
	if err != nil {
		s.log.Warn("list images failed", slog.Int("auction_id", int(a.ID)), slog.Any("err", err))
		imgs = nil
	}

	catMap, err := s.loadCategoryMap(ctx, a)
	if err != nil {
		return dto.AuctionResponse{}, fmt.Errorf("auction.GetByID: categories: %w", err)
	}

	return toAuctionResponse(a, imgs, catMap), nil
}

func toAuctionResponse(a repository.Auction, imgs []repository.AuctionImage, catMap map[int32]repository.GetCategoryByIDsRow) dto.AuctionResponse {
	desc := ""
	if a.Description != nil {
		desc = *a.Description
	}

	out := dto.AuctionResponse{
		ID:              a.ID,
		Title:           a.Title,
		Description:     desc,
		CategoryID:      a.CategoryID,
		StartPrice:      a.StartPrice,
		CurrentPrice:    a.CurrentPrice,
		MinBidIncrement: a.MinBidIncrement,
		StartTime:       a.StartTime.UTC(),
		EndTime:         a.EndTime.UTC(),
		Status:          string(a.Status),
		CreatedBy:       a.CreatedBy,
		WinnerID:        a.WinnerID,
		CreatedAt:       a.CreatedAt.UTC(),
		UpdatedAt:       a.UpdatedAt.UTC(),
	}
	if a.CategoryID != nil && catMap != nil {
		if row, ok := catMap[*a.CategoryID]; ok {
			out.Category = &dto.AuctionCategoryRef{
				ID:   row.ID,
				Name: row.Name,
				Slug: row.Slug,
			}
		}
	}
	if len(imgs) > 0 {
		out.Images = make([]dto.AuctionImageItem, 0, len(imgs))
		for _, im := range imgs {
			out.Images = append(out.Images, dto.AuctionImageItem{
				ID:        im.ID,
				URL:       im.Url,
				Filename:  im.Filename,
				SizeBytes: im.SizeBytes,
				MimeType:  im.MimeType,
				SortOrder: im.SortOrder,
				IsPrimary: im.IsPrimary,
				CreatedAt: im.CreatedAt.UTC(),
			})
		}
	}
	return out
}

func (s *AuctionService) loadCategoryMap(ctx context.Context, a repository.Auction) (map[int32]repository.GetCategoryByIDsRow, error) {
	if a.CategoryID == nil {
		return nil, nil
	}
	return s.cats.GetByIDs(ctx, []int32{*a.CategoryID})
}
