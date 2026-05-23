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
