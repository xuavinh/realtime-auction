package repository

import "xuanvinh/internal/db/sqlc"

type (
	CreateUserParams  = sqlc.CreateUserParams
	CreateUserRow     = sqlc.User
	GetUserByEmailRow = sqlc.User
	GetUserByIDRow    = sqlc.GetUserByIDRow
)
