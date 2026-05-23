package handler

import (
	"xuanvinh/internal/actor"
	"xuanvinh/internal/validation"

	"github.com/gin-gonic/gin"
)

type bidReader interface {
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
}

func (h *BidHandler) PlaceBid(ctx *gin.Context) {
}
