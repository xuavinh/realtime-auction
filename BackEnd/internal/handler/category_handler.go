package handler

import (
	"context"
	"net/http"
	"xuanvinh/internal/dto"
	"xuanvinh/internal/utils"

	"github.com/gin-gonic/gin"
)

type categoryService interface {
	List(ctx context.Context) ([]dto.CategoryItem, error)
}

type CategoryHandler struct {
	svc categoryService
}

func NewCategoryHandler(svc categoryService) *CategoryHandler {
	return &CategoryHandler{svc: svc}
}
func (h *CategoryHandler) List(ctx *gin.Context) {
	items, err := h.svc.List(ctx.Request.Context())
	if err != nil {
		utils.AbortError(ctx, http.StatusInternalServerError, "internal", "Please try again")
		return
	}
	ctx.Header("Cache-Control", "public, max-age=300, stale-while-revalidate=86400")
	utils.SuccessData(ctx, http.StatusOK, items)
}
