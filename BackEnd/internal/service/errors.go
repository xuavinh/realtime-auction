package service

import (
	"net/http"
	"xuanvinh/internal/utils"
)

var (
	ErrEmailExists         = utils.NewAppError(http.StatusConflict, "email_exists", "Email already exists")
	ErrInvalidCredentials  = utils.NewAppError(http.StatusUnauthorized, "invalid_credentials", "Invalid email or password")
	ErrInvalidRefreshToken = utils.NewAppError(http.StatusUnauthorized, "invalid_refresh_token", "Please sign in again")
	ErrForbidden           = utils.NewAppError(http.StatusForbidden, "forbidden", "You are not allowed to access this resource")
)

// Auction + Image
var (
	ErrAuctionNotFound    = utils.NewAppError(http.StatusNotFound, "auction_not_found", "Auction not found")
	ErrAuctionNotEditable = utils.NewAppError(http.StatusUnprocessableEntity, "auction_not_editable", "Auction can only be edited while status is PENDING")
	ErrInvalidAuction     = utils.NewAppError(http.StatusUnprocessableEntity, "invalid_auction", "Invalid auction data")
	ErrCategoryNotFound   = utils.NewAppError(http.StatusNotFound, "category_not_found", "Category not found")
	ErrTooManyImages      = utils.NewAppError(http.StatusUnprocessableEntity, "too_many_images", "Auction supports up to 10 images")
	ErrInvalidImage       = utils.NewAppError(http.StatusUnprocessableEntity, "invalid_image", "Invalid image data")
	ErrImageNotFound      = utils.NewAppError(http.StatusNotFound, "image_not_found", "Image not found")
)
