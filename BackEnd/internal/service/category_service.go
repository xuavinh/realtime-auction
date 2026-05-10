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
	rows, err := s.repo.List(ctx)
	if err != nil {
		return nil, err
	}
	out := make([]dto.CategoryItem, 0, len(rows))
	for _, r := range rows {
		out = append(out, dto.CategoryItem{
			ID:       r.ID,
			Name:     r.Name,
			Slug:     r.Slug,
			Children: []dto.CategoryItem{},
		})
	}
	return out, nil
}
