package dto

import "time"

type CreateAuctionRequest struct {
	Title           string    `json:"title" validate:"required,min=10,max=255"`
	Description     string    `json:"description" validate:"omitempty,max=2000"`
	CategoryID      *int32    `json:"category_id" validate:"omitempty,gt=0"`
	StartPrice      int64     `json:"start_price" validate:"required,min=1"`
	MinBidIncrement int64     `json:"min_bid_increment" validate:"required,min=10000"`
	StartTime       time.Time `json:"start_time" validate:"required"`
	EndTime         time.Time `json:"end_time" validate:"required"`
}

type AuctionResponse struct {
	ID              int32              `json:"id"`
	Title           string             `json:"title"`
	Description     string             `json:"description"`
	CategoryID      *int32             `json:"category_id"`
	StartPrice      int64              `json:"start_price"`
	CurrentPrice    int64              `json:"current_price"`
	MinBidIncrement int64              `json:"min_bid_increment"`
	StartTime       time.Time          `json:"start_time"`
	EndTime         time.Time          `json:"end_time"`
	Status          string             `json:"status"`
	CreatedBy       int32              `json:"created_by"`
	WinnerID        *int32             `json:"winner_id"`
	Version         int64              `json:"version"`
	ExtensionCount  int32              `json:"extension_count"`
	Images          []AuctionImageItem `json:"images,omitempty"`
	CreatedAt       time.Time          `json:"created_at"`
	UpdatedAt       time.Time          `json:"updated_at"`
}

type CreateAuctionResponse = AuctionResponse
