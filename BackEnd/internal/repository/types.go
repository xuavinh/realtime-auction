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

const (
	AuctionStatusPENDING AuctionStatus = "PENDING"
	AuctionStatusACTIVE  AuctionStatus = "ACTIVE"
	AuctionStatusENDED   AuctionStatus = "ENDED"
)

// auction_images
type (
	AuctionImage             = sqlc.AuctionImage
	CreateAuctionImageParams = sqlc.CreateAuctionImageParams
)
