package handler

import (
	"context"
	"xuanvinh/internal/validation"

	"github.com/gin-gonic/gin"
)

type auctionService interface {
	Create(ctx context.Context)
	GetByID(ctx context.Context)
}

type AuctionHandler struct {
	srv auctionService
	v   *validation.Validator
}

func NewAuctionHandler(srv auctionService, v *validation.Validator) *AuctionHandler {
	return &AuctionHandler{
		srv: srv,
		v:   v,
	}
}

func (h *AuctionHandler) Create(ctx *gin.Context) {

}

func (h *AuctionHandler) Get(ctx *gin.Context) {

}
