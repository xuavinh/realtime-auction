package handler

import (
	"context"
	"xuanvinh/internal/dto"

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
}
