package repository

import (
	"context"
	"errors"
	"xuanvinh/internal/db/sqlc"

	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

const pgUniqueViolation = "23505"

type UserRepository struct {
	q *sqlc.Queries
}

func NewUserRepository(pool *pgxpool.Pool) *UserRepository {
	return &UserRepository{
		q: sqlc.New(pool),
	}
}

func (ur *UserRepository) Create(ctx context.Context, arg CreateUserParams) (CreateUserRow, error) {
	row, err := ur.q.CreateUser(ctx, arg)
	if err != nil {
		return CreateUserRow{}, mapCreateErr(err)
	}
	return row, nil
}

func (ur *UserRepository) ExistsEmail(ctx context.Context, email string) (bool, error) {
	return ur.q.ExistsEmail(ctx, email)
}

func mapCreateErr(err error) error {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) && pgErr.Code == pgUniqueViolation {
		return ErrEmailExists
	}
	return err
}
