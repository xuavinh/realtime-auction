package handler

import (
	"context"
	"net/http"
	"xuanvinh/internal/actor"
	"xuanvinh/internal/dto"
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
}
