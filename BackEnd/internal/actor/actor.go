package actor

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"time"
	"xuanvinh/internal/db/sqlc"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

const (
	inboxSize   = 256
	idleTimeout = 5 * time.Minute
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
	extensionCount  int32
	status          string
	createdBy       int32
	pool            *pgxpool.Pool
	log             *slog.Logger

	clients  map[*Client]bool
	onRemove func(int32) //callback
}

func NewAuctionActor(auctionID int32, row sqlc.GetAuctionForActorRow, pool *pgxpool.Pool, log *slog.Logger, onRemove func(int32)) *AuctionActor {
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
		extensionCount:  row.ExtensionCount,
		clients:         make(map[*Client]bool),
		createdBy:       row.CreatedBy,
		pool:            pool,
		log:             log.With("auction_id", auctionID),
		onRemove:        onRemove,
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
		a.onRemove(a.auctionID)
		close(a.done)
		for c := range a.clients {
			close(c.send)
		}
		a.clients = nil
		a.drainInbox(ErrServerShutdown)
	}()

	idleTimer := time.NewTimer(idleTimeout)
	defer idleTimer.Stop()

	for {
		select {
		case msg, ok := <-a.inbox:
			if !ok {
				return
			}

			if !idleTimer.Stop() {
				select {
				case <-idleTimer.C:
				default:
				}
			}
			idleTimer.Reset(idleTimeout)

			switch m := msg.(type) {
			case PlaceBidMsg:
				a.handlePlaceBid(m)
			case RegisterClientMsg:
				a.handleRegister(m)
			case UnregisterClientMsg:
				a.handleUnregister(m)
			case SyncRequestMsg:
				a.handleSync(m)
			case ActivateAuctionMsg:
				a.handleActivateAuction()
			case EndAuctionMsg:
				a.handleEndAuction(m)
				return
			case ShutdownMsg:
				a.log.Info("Shutdown message received, stopping actor...")
				return
			}
		case <-idleTimer.C:
			if a.canIdleShutdown() {
				a.log.Info("actor idle shutdown")
				return
			}
			idleTimer.Reset(idleTimeout)
		}
	}
}

func (a *AuctionActor) canIdleShutdown() bool {
	return len(a.clients) == 0 && len(a.inbox) == 0
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

	event := WSEnvelope{
		Event: "NEW_BID",
		Payload: NewBidPayload{
			AuctionID:  a.auctionID,
			BidderName: m.UserName,
			NewPrice:   a.currentPrice,
			Version:    a.version,
			EndTime:    row.EndTime.UTC().Format(time.RFC3339),
		},
		ServerTime: time.Now().UTC().Format(time.RFC3339),
	}
	a.broadcast(event)

	m.Reply <- PlaceBidResult{
		Success:    true,
		BidID:      bidRow.ID,
		NewPrice:   row.CurrentPrice,
		NewVersion: row.Version,
		EndTime:    row.EndTime,
	}
}

func (a *AuctionActor) handleRegister(m RegisterClientMsg) {
	a.clients[m.Client] = true
	go m.Client.writePump()
	a.sendSync(m.Client)
	go m.Client.readPump()
	a.log.Info("client registered",
		slog.Int("user_id", int(m.Client.UserID)),
		slog.Int("total_clients", len(a.clients)))
}

func (a *AuctionActor) handleUnregister(m UnregisterClientMsg) {
	if _, ok := a.clients[m.Client]; ok {
		delete(a.clients, m.Client)
		close(m.Client.send)
		a.log.Info("client unregistered",
			slog.Int("user_id", int(m.Client.UserID)),
			slog.Int("total_clients", len(a.clients)))
	}
}

func (a *AuctionActor) handleSync(m SyncRequestMsg) {
	a.sendSync(m.Client)
}

func (a *AuctionActor) sendSync(c *Client) {
	event := WSEnvelope{
		Event: "SYNC",
		Payload: SyncPayload{
			CurrentPrice:    a.currentPrice,
			MinBidIncrement: a.minBidIncrement,
			Version:         a.version,
			Status:          a.status,
			EndTime:         a.endTime.UTC().Format(time.RFC3339),
			ExtensionCount:  a.extensionCount,
		},
		ServerTime: time.Now().UTC().Format(time.RFC3339),
	}
	data, _ := json.Marshal(event)
	select {
	case c.send <- data:
	default:
		delete(a.clients, c)
		close(c.send)
	}
}
func (a *AuctionActor) broadcast(event WSEnvelope) {
	data, _ := json.Marshal(event)
	var slowClients []*Client

	for c := range a.clients {
		select {
		case c.send <- data:
		default:
			slowClients = append(slowClients, c)
		}
	}

	if len(slowClients) > 0 {
		go func(victims []*Client) {
			for _, c := range victims {
				c.conn.Close()
			}
		}(slowClients)
	}
}

func (a *AuctionActor) handleActivateAuction() {
	if a.status == "PENDING" {
		a.status = "ACTIVE"
		event := WSEnvelope{
			Event: "AUCTION_ACTIVE",
			Payload: map[string]any{
				"auction_id": a.auctionID,
				"status":     a.status,
				"end_time":   a.endTime.UTC().Format(time.RFC3339),
			},
			ServerTime: time.Now().UTC().Format(time.RFC3339),
		}
		a.broadcast(event)
		a.log.Info("actor status transitioned to ACTIVE")
	}
}

func (a *AuctionActor) handleEndAuction(m EndAuctionMsg) {
	a.status = "ENDED"
	event := WSEnvelope{
		Event: "AUCTION_ENDED",
		Payload: AuctionEndedPayload{
			AuctionID:  a.auctionID,
			FinalPrice: m.FinalPrice,
			WinnerID:   m.WinnerID,
			Version:    a.version,
		},
		ServerTime: time.Now().UTC().Format(time.RFC3339),
	}
	a.broadcast(event)
}

func (a *AuctionActor) drainInbox(reason BidErrCode) {
	for {
		select {
		case msg, ok := <-a.inbox:
			if !ok {
				return
			}

			switch m := msg.(type) {
			case PlaceBidMsg:
				m.Reply <- PlaceBidResult{
					ErrorCode: reason,
					ErrorMsg:  "Auction is no longer available",
				}
			case RegisterClientMsg:
				if m.Client != nil {
					m.Client.conn.Close()
				}
			}
		default:
			return
		}
	}
}
