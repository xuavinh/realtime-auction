package handler

import (
	"context"
	"net/http"
	"strconv"
	"xuanvinh/internal/dto"
	"xuanvinh/internal/middleware"
	"xuanvinh/internal/service"
	"xuanvinh/internal/utils"
	"xuanvinh/internal/validation"

	"github.com/gin-gonic/gin"
)

type auctionService interface {
	Create(ctx context.Context, userID int32, in dto.CreateAuctionRequest) (dto.AuctionResponse, error)
	GetByID(ctx context.Context, id int32) (dto.AuctionResponse, error)
	List(ctx context.Context, q dto.ListAuctionsQuery) (service.ListResult, int32, int32, error)
	Update(ctx context.Context, userID, id int32, in dto.UpdateAuctionRequest) (dto.AuctionResponse, error)
	Delete(ctx context.Context, userID, id int32) error
}

type AuctionHandler struct {
	svc auctionService
	v   *validation.Validator
}

func NewAuctionHandler(svc auctionService, v *validation.Validator) *AuctionHandler {
	return &AuctionHandler{
		svc: svc,
		v:   v,
	}
}

func (h *AuctionHandler) Create(ctx *gin.Context) {
	uid, ok := middleware.UserIDFrom(ctx)
	if !ok {
		utils.AbortError(ctx, http.StatusUnauthorized, "unauthorized", "Please sign in")
		return
	}

	var req dto.CreateAuctionRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.AbortError(ctx, http.StatusBadRequest, "invalid_request", "Invalid JSON body")
		return
	}
	if err := h.v.Struct(req); err != nil {
		utils.AbortValidation(ctx, h.v.Translate(err))
		return
	}
	resp, err := h.svc.Create(ctx.Request.Context(), uid, req)
	if err != nil {
		utils.AbortAppError(ctx, err)
		return
	}
	utils.SuccessData(ctx, http.StatusOK, resp)
}

func (h *AuctionHandler) Get(ctx *gin.Context) {
	id, ok := parseAuctionID(ctx)
	if !ok {
		return
	}
	resp, err := h.svc.GetByID(ctx.Request.Context(), id)
	if err != nil {
		utils.AbortAppError(ctx, err)
		return
	}
	utils.SuccessDataWithServerNow(ctx, http.StatusOK, resp)
}

func (h *AuctionHandler) List(c *gin.Context) {
	var q dto.ListAuctionsQuery
	if err := c.ShouldBindQuery(&q); err != nil {
		utils.AbortError(c, http.StatusBadRequest, "invalid_request", "Invalid query parameters")
		return
	}
	if err := h.v.Struct(q); err != nil {
		utils.AbortValidation(c, h.v.Translate(err))
		return
	}
	res, page, limit, err := h.svc.List(c.Request.Context(), q)
	if err != nil {
		utils.AbortAppError(c, err)
		return
	}
	utils.SuccessPaginated(c, http.StatusOK, res.Items, utils.Pagination{
		Page: page, Limit: limit, Total: res.Total,
	})
}

func (h *AuctionHandler) Update(ctx *gin.Context) {
	uid, id, ok := authUserAndAuctionID(ctx)
	if !ok {
		return
	}
	var req dto.UpdateAuctionRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.AbortError(ctx, http.StatusBadRequest, "invalid_request", "Invalid JSON body")
		return
	}
	if err := h.v.Struct(req); err != nil {
		utils.AbortValidation(ctx, h.v.Translate(err))
		return
	}
	resp, err := h.svc.Update(ctx.Request.Context(), uid, id, req)
	if err != nil {
		utils.AbortAppError(ctx, err)
		return
	}
	utils.SuccessData(ctx, http.StatusOK, resp)
}
func (h *AuctionHandler) Delete(ctx *gin.Context) {
	uid, id, ok := authUserAndAuctionID(ctx)
	if !ok {
		return
	}

	if err := h.svc.Delete(ctx.Request.Context(), uid, id); err != nil {
		utils.AbortAppError(ctx, err)
		return
	}
	utils.SuccessMessage(ctx, http.StatusOK, "Auction deleted successfully")
}

func authUserAndAuctionID(ctx *gin.Context) (userID, auctionID int32, ok bool) {
	userID, ok = middleware.UserIDFrom(ctx)
	if !ok {
		utils.AbortError(ctx, http.StatusUnauthorized, "unauthorized", "Please sign in")
		return 0, 0, false
	}
	auctionID, ok = parseAuctionID(ctx)
	return userID, auctionID, ok
}

func parseAuctionID(ctx *gin.Context) (int32, bool) {
	idStr := ctx.Param("id")
	idInt, err := strconv.ParseInt(idStr, 10, 32)
	if err != nil || idInt <= 0 {
		utils.AbortError(ctx, http.StatusBadRequest, "invalid_request", "Invalid ID")
		return 0, false
	}
	return int32(idInt), true
}
