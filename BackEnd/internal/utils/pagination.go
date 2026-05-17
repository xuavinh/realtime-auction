package utils

import (
	"time"

	"github.com/gin-gonic/gin"
)

type Pagination struct {
	Page       int32 `json:"page"`
	Limit      int32 `json:"limit"`
	Total      int64 `json:"total"`
	TotalPages int32 `json:"total_pages"`
	HasNext    bool  `json:"has_next"`
	HasPrev    bool  `json:"has_prev"`
}

func ClampPagination(page, limit int32) (int32, int32) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}
	return page, limit
}

func Offset(page, limit int32) int32 {
	return (page - 1) * limit
}

func SuccessPaginated(ctx *gin.Context, status int, data any, p Pagination) {

	if p.Limit <= 0 {
		p.Limit = 10
	}
	if p.Page < 1 {
		p.Page = 1
	}
	totalPages := int32(0)
	if p.Total > 0 {
		totalPages = int32((p.Total + int64(p.Limit) - 1) / int64(p.Limit))
	}
	p.TotalPages = totalPages
	p.HasPrev = p.Page > 1
	p.HasNext = p.Page < p.TotalPages

	ctx.JSON(status, gin.H{
		"data":       data,
		"pagination": p,
		"server_now": time.Now().UTC().Format(time.RFC3339),
	})
}
