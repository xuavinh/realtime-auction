package dto

type AuctionImageItem struct {
	ID        int32  `json:"id"`
	URL       string `json:"url"`
	SortOrder int32  `json:"sort_order"`
	IsPrimary bool   `json:"is_primary"`
}

type UploadImageResponse = AuctionImageItem
