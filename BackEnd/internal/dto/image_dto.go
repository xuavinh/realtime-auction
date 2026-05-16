package dto

import "time"

type AuctionImageItem struct {
	ID        int32     `json:"id"`
	URL       string    `json:"url"`
	Filename  string    `json:"filename"`
	SizeBytes int32     `json:"size_bytes"`
	MimeType  string    `json:"mime_type"`
	SortOrder int32     `json:"sort_order"`
	IsPrimary bool      `json:"is_primary"`
	CreatedAt time.Time `json:"created_at"`
}

type UploadImageResponse = AuctionImageItem
