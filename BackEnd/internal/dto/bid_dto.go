package dto

import "time"

type PlaceBidRequest struct {
	BidPrice int64 `json:"bid_price" validate:"required,min=10000"`
}

type PlaceBidResponse struct {
	BidID        int64     `json:"bid_id"`
	CurrentPrice int64     `json:"current_price"`
	Version      int64     `json:"version"`
	EndTime      time.Time `json:"end_time"`
}

type BidListItem struct {
	ID             int64     `json:"id"`
	BidderName     string    `json:"bidder_name"`
	BidPrice       int64     `json:"bid_price"`
	AuctionVersion int64     `json:"auction_version"`
	CreatedAt      time.Time `json:"created_at"`
}

type ListBidsQuery struct {
	Page  int32 `form:"page"`
	Limit int32 `form:"limit"`
}
