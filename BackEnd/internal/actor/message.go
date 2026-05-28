package actor

import "time"

type PlaceBidMsg struct {
	UserID   int32
	UserName string
	BidPrice int64
	Reply    chan PlaceBidResult
}

type PlaceBidResult struct {
	Success      bool
	BidID        int64
	NewPrice     int64
	NewVersion   int64
	EndTime      time.Time
	ErrorCode    BidErrCode
	ErrorMsg     string
	FallbackData *FallbackData
}

type FallbackData struct {
	LatestPrice   int64
	LatestVersion int64
}
type BidErrCode string

const (
	ErrAuctionEnded BidErrCode = "auction_ended"
	ErrSelfBid      BidErrCode = "self_bid"
	ErrBidTooLow    BidErrCode = "bid_too_low"
	ErrConflict     BidErrCode = "conflict"
	ErrInternal     BidErrCode = "internal"
)

type ShutdownMsg struct{}

type RegisterClientMsg struct {
	Client *Client
}

type UnregisterClientMsg struct {
	Client *Client
}

type SyncRequestMsg struct {
	Client *Client
}

type WSEnvelope struct {
	Event      string `json:"event"`
	Payload    any    `json:"payload"`
	ServerTime string `json:"server_time"`
}

type NewBidPayload struct {
	AuctionID  int32  `json:"auction_id"`
	BidderName string `json:"bidder_name"`
	NewPrice   int64  `json:"new_price"`
	Version    int64  `json:"version"`
	EndTime    string `json:"end_time"`
}

type SyncPayload struct {
	CurrentPrice    int64  `json:"current_price"`
	MinBidIncrement int64  `json:"min_bid_increment"`
	Version         int64  `json:"version"`
	Status          string `json:"status"`
	EndTime         string `json:"end_time"`
	ExtensionCount  int32  `json:"extension_count"`
}
