package middleware

import (
	"context"
	"errors"
	"net/http"
	"strconv"
	"xuanvinh/internal/repository"
	"xuanvinh/internal/utils"

	"github.com/gin-gonic/gin"
)

type auctionOwnerLoader interface {
	GetOwner(ctx context.Context, id int32) (repository.GetAuctionOwnerRow, error)
}

const (
	CtxAuctionID     = "auction_id"
	CtxAuctionStatus = "auction_status"
)

func OwnerOnly(loader auctionOwnerLoader, paramName string) gin.HandlerFunc {
	if paramName == "" {
		paramName = "id"
	}
	return func(ctx *gin.Context) {
		idStr := ctx.Param(paramName)
		idInt, err := strconv.ParseInt(idStr, 10, 32)
		if err != nil || idInt <= 0 {
			utils.AbortError(ctx, http.StatusBadRequest, "invalid_request", "Invalid ID")
			return
		}
		auctionID := int32(idInt)

		uid, ok := UserIDFrom(ctx)
		if !ok {
			utils.AbortError(ctx, http.StatusUnauthorized, "unauthorized", "Please sign in")
			return
		}

		row, err := loader.GetOwner(ctx.Request.Context(), auctionID)
		if err != nil {
			if errors.Is(err, repository.ErrNotFound) {
				utils.AbortError(ctx, http.StatusNotFound, "auction_not_found", "Auction not found")
				return
			}
			utils.AbortError(ctx, http.StatusInternalServerError, "internal", "Please try again")
			return
		}

		if row.CreatedBy != uid {
			utils.AbortError(ctx, http.StatusForbidden, "forbidden", "You are not allowed to access this resource")
			return
		}

		ctx.Set(CtxAuctionID, row.ID)
		ctx.Set(CtxAuctionStatus, string(row.Status))
		ctx.Next()
	}
}

func AuctionIDFrom(ctx *gin.Context) (int32, bool) {
	v, ok := ctx.Get(CtxAuctionID)
	if !ok {
		return 0, false
	}
	id, ok := v.(int32)
	return id, ok
}

func AuctionStatusFrom(ctx *gin.Context) (string, bool) {
	v, ok := ctx.Get(CtxAuctionStatus)
	if !ok {
		return "", false
	}
	status, ok := v.(string)
	return status, ok
}
