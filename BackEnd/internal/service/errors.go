package service

import (
	"net/http"
	"xuanvinh/internal/utils"
)

var (
	ErrEmailExists         = utils.NewAppError(http.StatusConflict, "email_exists", "Email already exists")
	ErrInvalidCredentials  = utils.NewAppError(http.StatusUnauthorized, "invalid_credentials", "Invalid email or password")
	ErrInvalidRefreshToken = utils.NewAppError(http.StatusUnauthorized, "invalid_refresh_token", "Please sign in again")
)
