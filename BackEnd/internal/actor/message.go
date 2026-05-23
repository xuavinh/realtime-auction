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
	ErrorCode    string
	ErrorMsg     string
	FallbackData *FallbackData
}

type FallbackData struct {
	LatestPrice   int64
	LatestVersion int64
}

type ShutdownMsg struct{}
