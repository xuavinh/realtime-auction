package repository

import (
	"xuanvinh/internal/db/sqlc"

	"github.com/jackc/pgx/v5/pgxpool"
)

type UserRepository struct {
	q *sqlc.Queries
}

func NewUserRepository(pool *pgxpool.Pool) *UserRepository {
	return &UserRepository{
		q: sqlc.New(pool),
	}
}
