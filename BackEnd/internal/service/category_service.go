package service

import (
	"context"
	"xuanvinh/internal/dto"
	"xuanvinh/internal/repository"
)

type categoryRepo interface {
	List(ctx context.Context) ([]repository.ListCategoriesRow, error)
}

type CategoryService struct {
	repo categoryRepo
}

func NewCategoryService(repo categoryRepo) *CategoryService {
	return &CategoryService{repo: repo}
}

func (s *CategoryService) List(ctx context.Context) ([]dto.CategoryItem, error) {
	return []dto.CategoryItem{}, nil
}
