package utils

import (
	"github.com/gin-gonic/gin"
)

type ErrorCode string

const (
	ErrNotFound ErrorCode = "NOT_FOUND"
)

type ErrDetail struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

func SuccessData(ctx *gin.Context, status int, data any) {
	ctx.JSON(status, gin.H{
		"data": data,
	})
}

func SuccessMessage(ctx *gin.Context, status int, message string) {
	ctx.JSON(status, gin.H{
		"message": message,
	})
}
