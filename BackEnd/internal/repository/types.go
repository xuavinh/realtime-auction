package repository

import "xuanvinh/internal/db/sqlc"

type (
	CreateUserParams  = sqlc.CreateUserParams
	CreateUserRow     = sqlc.User
	GetUserByEmailRow = sqlc.User
	GetUserByIDRow    = sqlc.GetUserByIDRow
)

// categories
type (
	ListCategoriesRow  = sqlc.ListCategoriesRow
	GetCategoryByIDRow = sqlc.GetCategoryByIDRow
)

// auctions
type (
	Auction             = sqlc.Auction
	AuctionStatus       = string
	CreateAuctionParams = sqlc.CreateAuctionParams
	GetAuctionOwnerRow  = sqlc.GetAuctionOwnerRow
)
