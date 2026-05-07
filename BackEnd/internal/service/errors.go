package service

import (
	"net/http"
	"xuanvinh/internal/utils"
)

var (
	ErrEmailExists = utils.NewAppError(http.StatusConflict, "email_exists", "Email already exists")
)
