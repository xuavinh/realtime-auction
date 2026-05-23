package handler

import (
	"context"
	"net/http"
	"xuanvinh/internal/actor"
	"xuanvinh/internal/dto"
	"xuanvinh/internal/middleware"
	"xuanvinh/internal/repository"
	"xuanvinh/internal/utils"
	"xuanvinh/internal/validation"

	"github.com/gin-gonic/gin"
)

type bidReader interface {
	ListByAuction(ctx context.Context, repo repository.ListBidsByAuctionParams) ([]dto.BidListItem, error)
	CountByAuction(ctx context.Context, auctionID int32) (int64, error)
}

type BidHandler struct {
	registry *actor.ActorRegistry
	reader   bidReader
	v        *validation.Validator
}

func NewBidHandler(registry *actor.ActorRegistry, reader bidReader, v *validation.Validator) *BidHandler {
	return &BidHandler{
		registry: registry,
		reader:   reader,
		v:        v,
	}
}

func (h *BidHandler) ListBids(ctx *gin.Context) {
	auctionID, ok := parseAuctionID(ctx)
	if !ok {
		return
	}
	var q dto.ListBidsQuery
	if err := ctx.ShouldBindQuery(&q); err != nil {
		utils.AbortError(ctx, http.StatusBadRequest, "invalid_request", "Invalid query parammeters")
		return
	}

	page, limit := utils.ClampPagination(q.Page, q.Limit)
	offset := utils.Offset(page, limit)

	items, err := h.reader.ListByAuction(ctx.Request.Context(), repository.ListBidsByAuctionParams{
		AuctionID: auctionID,
		Limit:     limit,
		Offset:    offset,
	})
	if err != nil {
		utils.AbortError(ctx, http.StatusInternalServerError, "internal_error", "Failed to list bids")
		return
	}
	total, err := h.reader.CountByAuction(ctx.Request.Context(), auctionID)
	if err != nil {
		utils.AbortError(ctx, http.StatusInternalServerError, "internal", "Failed to count bids")
		return
	}

	utils.SuccessPaginated(ctx, http.StatusOK, items, utils.Pagination{
		Page: page, Limit: limit, Total: total,
	})
}

func (h *BidHandler) PlaceBid(ctx *gin.Context) {
	auctionID, ok := parseAuctionID(ctx)
	if !ok {
		return
	}
	userID, ok := middleware.UserIDFrom(ctx)
	if !ok {
		utils.AbortError(ctx, http.StatusUnauthorized, "unauthorized", "Please sign in")
		return
	}
	userName, ok := ctx.Get(middleware.CtxFullName)
	if !ok {
		utils.AbortError(ctx, http.StatusUnauthorized, "unauthorized", "Please sign in")
		return
	}
	userNameStr, ok := userName.(string)
	if !ok {
		utils.AbortError(ctx, http.StatusUnauthorized, "invalid_full_name", "Please sign in")
		return
	}

	var req dto.PlaceBidRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.AbortError(ctx, http.StatusBadRequest, "invalid_request", "Invalid JSON body")
		return
	}
	if err := h.v.Struct(req); err != nil {
		utils.AbortValidation(ctx, h.v.Translate(err))
		return
	}

	a, err := h.registry.GetOrCreate(ctx.Request.Context(), auctionID)
	if err != nil {
		utils.AbortError(ctx, http.StatusNotFound, "auction_not_found", "Auction not found")
		return
	}

	reply := make(chan actor.PlaceBidResult, 1)
	ok = a.SendWithContext(ctx.Request.Context(), actor.PlaceBidMsg{
		UserID:   userID,
		UserName: userNameStr,
		BidPrice: req.BidPrice,
		Reply:    reply,
	})
	if !ok {
		utils.AbortError(ctx, http.StatusServiceUnavailable, "server_busy", "System is busy, please retry")
		return
	}

	select {
	case result := <-reply:
		if result.Success {
			resp := gin.H{
				"message": "Bid placed successfully",
				"data": dto.PlaceBidResponse{
					BidID:        result.BidID,
					CurrentPrice: result.NewPrice,
					Version:      result.NewVersion,
					EndTime:      result.EndTime,
				},
			}
			ctx.JSON(http.StatusOK, resp)
		} else {
			mapBidError(ctx, result)
		}
	case <-ctx.Request.Context().Done():
		utils.AbortError(ctx, http.StatusGatewayTimeout, "timeout", "Request timed out")
	}
}

func mapBidError(c *gin.Context, r actor.PlaceBidResult) {
	switch r.ErrorCode {
	case actor.ErrAuctionEnded:
		utils.AbortError(c, http.StatusUnprocessableEntity, "auction_not_active", r.ErrorMsg)
	case actor.ErrSelfBid:
		utils.AbortError(c, http.StatusUnprocessableEntity, "forbidden_self_bid", r.ErrorMsg)
	case actor.ErrBidTooLow:
		c.AbortWithStatusJSON(http.StatusUnprocessableEntity, gin.H{
			"error":         "bid_too_low",
			"message":       r.ErrorMsg,
			"fallback_data": r.FallbackData,
		})
	case actor.ErrConflict:
		c.AbortWithStatusJSON(http.StatusConflict, gin.H{
			"error":         "conflict",
			"message":       r.ErrorMsg,
			"fallback_data": r.FallbackData,
		})
	default:
		utils.AbortError(c, http.StatusInternalServerError, "internal", r.ErrorMsg)
	}
}
