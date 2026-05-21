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
	ListCategoriesRow   = sqlc.ListCategoriesRow
	GetCategoryByIDRow  = sqlc.GetCategoryByIDRow
	GetCategoryByIDsRow = sqlc.GetCategoryByIDsRow
)

// auctions
type (
	Auction                  = sqlc.Auction
	AuctionStatus            = string
	CreateAuctionParams      = sqlc.CreateAuctionParams
	GetAuctionOwnerRow       = sqlc.GetAuctionOwnerRow
	ListAuctionsFilterParams = sqlc.ListAuctionsEndingSoonParams
	CountAuctionsParams      = sqlc.CountAuctionsParams
	UpdateAuctionParams      = sqlc.UpdateAuctionParams
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
	DeleteAuctionImageParams = sqlc.DeleteAuctionImageParams
)
