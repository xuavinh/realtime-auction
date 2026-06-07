package dto

import "time"

type CreateAuctionRequest struct {
	Title           string    `json:"title" validate:"required,min=10,max=255"`
	Description     string    `json:"description" validate:"omitempty,max=2000"`
	CategoryID      *int32    `json:"category_id" validate:"omitempty,gt=0"`
	StartPrice      int64     `json:"start_price" validate:"required,min=10000"`
	MinBidIncrement int64     `json:"min_bid_increment" validate:"required,min=10000"`
	StartTime       time.Time `json:"start_time" validate:"required"`
	EndTime         time.Time `json:"end_time" validate:"required"`
}

type UpdateAuctionRequest struct {
	Title           *string    `json:"title,omitempty"             validate:"omitempty,min=10,max=255"`
	Description     *string    `json:"description,omitempty"       validate:"omitempty,max=5000"`
	CategoryID      *int32     `json:"category_id,omitempty"       validate:"omitempty,gt=0"`
	StartPrice      *int64     `json:"start_price,omitempty"       validate:"omitempty,min=10000"`
	MinBidIncrement *int64     `json:"min_bid_increment,omitempty" validate:"omitempty,min=10000"`
	StartTime       *time.Time `json:"start_time,omitempty"`
	EndTime         *time.Time `json:"end_time,omitempty"`
}

type AuctionCategoryRef struct {
	ID   int32  `json:"id"`
	Name string `json:"name"`
	Slug string `json:"slug"`
}

type AuctionResponse struct {
	ID              int32               `json:"id"`
	Title           string              `json:"title"`
	Description     string              `json:"description"`
	CategoryID      *int32              `json:"category_id"`
	Category        *AuctionCategoryRef `json:"category,omitempty"`
	StartPrice      int64               `json:"start_price"`
	CurrentPrice    int64               `json:"current_price"`
	MinBidIncrement int64               `json:"min_bid_increment"`
	StartTime       time.Time           `json:"start_time"`
	EndTime         time.Time           `json:"end_time"`
	Status          string              `json:"status"`
	CreatedBy       int32               `json:"created_by"`
	WinnerID        *int32              `json:"winner_id"`
	PrimaryImageURL *string             `json:"primary_image_url"`
	Images          []AuctionImageItem  `json:"images,omitempty"`
	CreatedAt       time.Time           `json:"created_at"`
	UpdatedAt       time.Time           `json:"updated_at"`
}

type AuctionListItem struct {
	ID              int32               `json:"id"`
	Title           string              `json:"title"`
	Category        *AuctionCategoryRef `json:"category,omitempty"`
	CurrentPrice    int64               `json:"current_price"`
	Status          string              `json:"status"`
	StartTime       time.Time           `json:"start_time"`
	EndTime         time.Time           `json:"end_time"`
	PrimaryImageURL *string             `json:"primary_image_url"`
}

type ListAuctionsQuery struct {
	Page       int32   `form:"page"`
	Limit      int32   `form:"limit"`
	Status     string  `form:"status"`
	CategoryID *int32  `form:"category_id"`
	MinPrice   *int64  `form:"min_price" validate:"omitempty,min=10000"`
	MaxPrice   *int64  `form:"max_price" validate:"omitempty,min=10000"`
	Sort       string  `form:"sort"`
	OwnerID    *int32  `form:"owner_id"`
	Search     *string `form:"search" validate:"omitempty,max=20"`
}

type CreateAuctionResponse = AuctionResponse
