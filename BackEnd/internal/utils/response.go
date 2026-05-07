package utils

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type ErrorDetail struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

type ErrorResponse struct {
	Error   string        `json:"error"`
	Message string        `json:"message,omitempty"`
	Details []ErrorDetail `json:"details,omitempty"`
}

func SuccessData(c *gin.Context, status int, data any) {
	c.JSON(status, gin.H{"data": data})
}

func SuccessMessage(c *gin.Context, status int, msg string) {
	c.JSON(status, gin.H{"message": msg})
}

func AbortError(c *gin.Context, status int, errorKey, msg string) {
	c.AbortWithStatusJSON(status, ErrorResponse{Error: errorKey, Message: msg})
}

func AbortValidation(c *gin.Context, details []ErrorDetail) {
	c.AbortWithStatusJSON(http.StatusBadRequest, ErrorResponse{
		Error:   "invalid_request",
		Details: details,
	})
}
