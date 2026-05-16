package handler

import (
	"context"
	"xuanvinh/internal/dto"
	"xuanvinh/internal/service"
)

const MaxImageBytes int64 = 5 * 1024 * 1024 // 5MB

type imageService interface {
	Create(ctx context.Context, in service.CreateImageInput) (dto.AuctionImageItem, error)
	Delete(ctx context.Context, auctionID, imageID int32, auctionStatus string) (string, error)
}

type AuctionImageHandler struct {
	svc       imageService
	uploadDir string
	publicURL string
}

func NewAuctionImageHandler(svc imageService, uploadDir, publicURL string) *AuctionImageHandler {
	return &AuctionImageHandler{
		svc:       svc,
		uploadDir: uploadDir,
		publicURL: publicURL,
	}
}
