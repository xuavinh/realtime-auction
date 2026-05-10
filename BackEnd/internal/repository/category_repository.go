package repository

import (
	"context"
	"errors"
	"xuanvinh/internal/db/sqlc"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type CategoryRepository struct {
	q *sqlc.Queries
}

func NewCategoryRepository(pool *pgxpool.Pool) *CategoryRepository {
	return &CategoryRepository{q: sqlc.New(pool)}
}

func (r *CategoryRepository) List(ctx context.Context) ([]ListCategoriesRow, error) {
	return r.q.ListCategories(ctx)
}

func (r *CategoryRepository) GetByID(ctx context.Context, id int32) (GetCategoryByIDRow, error) {
	row, err := r.q.GetCategoryByID(ctx, id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return GetCategoryByIDRow{}, ErrNotFound
		}
		return GetCategoryByIDRow{}, err
	}
	return row, nil
}

func (r *CategoryRepository) Exists(ctx context.Context, id int32) (bool, error) {
	return r.q.CategoryExists(ctx, id)
}
