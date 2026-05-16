package handler

import (
	"context"
	"net/http"
	"xuanvinh/internal/dto"
	"xuanvinh/internal/middleware"
	"xuanvinh/internal/utils"
	"xuanvinh/internal/validation"

	"github.com/gin-gonic/gin"
)

type auctionService interface {
	Create(ctx context.Context, userID int32, in dto.CreateAuctionRequest) (dto.AuctionResponse, error)
	GetByID(ctx context.Context)
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

}
