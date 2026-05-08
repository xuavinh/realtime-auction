package repository

import (
	"context"
	"errors"
	"xuanvinh/internal/db/sqlc"

	"github.com/jackc/pgx/v5"
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

func (ur *UserRepository) GetByEmail(ctx context.Context, email string) (GetUserByEmailRow, error) {
	row, err := ur.q.GetUserByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return GetUserByEmailRow{}, ErrNotFound
		}
		return GetUserByEmailRow{}, err
	}
	return row, nil
}

func (ur *UserRepository) GetByID(ctx context.Context, id int32) (GetUserByIDRow, error) {
	row, err := ur.q.GetUserByID(ctx, id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return GetUserByIDRow{}, ErrNotFound
		}
		return GetUserByIDRow{}, err
	}
	return row, nil
}

func mapCreateErr(err error) error {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) && pgErr.Code == pgUniqueViolation {
		return ErrEmailExists
	}
	return err
}
