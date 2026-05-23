package actor

import (
	"context"
	"errors"
	"log/slog"
	"time"
	"xuanvinh/internal/db/sqlc"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

const (
	inboxSize   = 256
	sendTimeout = 1 * time.Second
)

type AuctionActor struct {
	auctionID       int32
	inbox           chan any
	done            chan struct{}
	currentPrice    int64
	minBidIncrement int64
	version         int64
	endTime         time.Time
	startTime       time.Time
	status          string
	createdBy       int32
	pool            *pgxpool.Pool
	log             *slog.Logger
}

func NewAuctionActor(auctionID int32, row sqlc.GetAuctionForActorRow, pool *pgxpool.Pool, log *slog.Logger) *AuctionActor {
	return &AuctionActor{
		auctionID:       auctionID,
		inbox:           make(chan any, inboxSize),
		done:            make(chan struct{}),
		currentPrice:    row.CurrentPrice,
		minBidIncrement: row.MinBidIncrement,
		version:         row.Version,
		endTime:         row.EndTime,
		startTime:       row.StartTime,
		status:          row.Status,
		createdBy:       row.CreatedBy,
		pool:            pool,
		log:             log.With("auction_id", auctionID),
	}
}

func (a *AuctionActor) Start() {
	go a.run()
}

func (a *AuctionActor) Send(msg any) bool {
	select {
	case <-a.done:
		return false
	case a.inbox <- msg:
		return true
	default:
	}

	timer := time.NewTimer(sendTimeout)
	defer timer.Stop()

	select {
	case <-a.done:
		return false
	case a.inbox <- msg:
		return true
	case <-timer.C:
		return false
	}
}

func (a *AuctionActor) SendWithContext(ctx context.Context, msg any) bool {
	select {
	case <-a.done:
		return false
	case a.inbox <- msg:
		return true
	case <-ctx.Done():
		return false
	}
}

func (a *AuctionActor) run() {
	defer func() {
		close(a.done)
		a.log.Info("auction actor stopped")
	}()

	for {
		select {
		case msg, ok := <-a.inbox:
			if !ok {
				return
			}

			switch m := msg.(type) {
			case PlaceBidMsg:
				a.handlePlaceBid(m)
			case ShutdownMsg:
				a.log.Info("Shutdown message received, stopping actor...")
				return
			}
		}
	}
}

func (a *AuctionActor) handlePlaceBid(m PlaceBidMsg) {
	if a.status != "ACTIVE" {
		m.Reply <- PlaceBidResult{
			ErrorCode: ErrAuctionEnded,
			ErrorMsg:  "Auction is not active",
		}
		return
	}
	if time.Now().UTC().After(a.endTime) {
		m.Reply <- PlaceBidResult{
			ErrorCode: ErrAuctionEnded,
			ErrorMsg:  "Auction has already ended",
		}
		return
	}
	if m.UserID == a.createdBy {
		m.Reply <- PlaceBidResult{ErrorCode: ErrSelfBid, ErrorMsg: "Cannot bid on your own auction"}
		return
	}
	if m.BidPrice < a.currentPrice+a.minBidIncrement {
		m.Reply <- PlaceBidResult{
			ErrorCode: ErrBidTooLow,
			ErrorMsg:  "Bid price is below minimum increment",
			FallbackData: &FallbackData{
				LatestPrice:   a.currentPrice,
				LatestVersion: a.version,
			},
		}
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	tx, err := a.pool.Begin(ctx)
	if err != nil {
		a.log.Error("Failed to begin transaction", slog.Any("err", err))
		m.Reply <- PlaceBidResult{
			ErrorCode: ErrInternal,
			ErrorMsg:  "System is busy",
		}
		return
	}
	defer tx.Rollback(context.Background())

	q := sqlc.New(tx)

	// atomic update auction with anti-sniping
	row, err := q.PlaceBid(ctx, sqlc.PlaceBidParams{
		CurrentPrice: m.BidPrice,
		ID:           a.auctionID,
		CreatedBy:    m.UserID,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			m.Reply <- PlaceBidResult{
				ErrorCode: ErrConflict,
				ErrorMsg:  "Your bid has been outbid by someone else",
				FallbackData: &FallbackData{
					LatestPrice:   a.currentPrice,
					LatestVersion: a.version,
				},
			}
		} else {
			a.log.Error("Database error during update", slog.Any("err", err))
			m.Reply <- PlaceBidResult{
				ErrorCode: ErrInternal,
				ErrorMsg:  "Database error",
			}
		}
		return
	}

	// insert bid record
	bidRow, err := q.InsertBid(ctx, sqlc.InsertBidParams{
		AuctionID:      a.auctionID,
		UserID:         m.UserID,
		BidPrice:       m.BidPrice,
		AuctionVersion: row.Version,
	})
	if err != nil {
		a.log.Error("Failed to insert bid record", slog.Any("err", err))
		m.Reply <- PlaceBidResult{
			ErrorCode: ErrInternal,
			ErrorMsg:  "Failed to record bid",
		}
		return
	}

	if err := tx.Commit(ctx); err != nil {
		a.log.Error("Failed to commit transaction", slog.Any("err", err))
		m.Reply <- PlaceBidResult{
			ErrorCode: ErrInternal,
			ErrorMsg:  "System commit error",
		}
		return
	}

	// đồng bộ trên ram
	a.currentPrice = row.CurrentPrice
	a.version = row.Version
	a.endTime = row.EndTime

	m.Reply <- PlaceBidResult{
		Success:    true,
		BidID:      bidRow.ID,
		NewPrice:   row.CurrentPrice,
		NewVersion: row.Version,
		EndTime:    row.EndTime,
	}
}
