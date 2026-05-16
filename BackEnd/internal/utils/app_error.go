package utils

import (
	"errors"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type AppError struct {
	Status  int
	Code    string
	Message string
	Err     error
}

var ErrInternal = NewAppError(
	http.StatusInternalServerError,
	"internal",
	"Please try again",
)

func (e *AppError) Error() string {
	if e.Err != nil {
		return e.Err.Error()
	}
	return e.Code
}

func (e *AppError) Unwrap() error {
	return e.Err
}

func NewAppError(status int, code, message string) *AppError {
	return &AppError{Status: status, Code: code, Message: message}
}

func WrapAppError(err error, status int, code, message string) *AppError {
	return &AppError{Status: status, Code: code, Message: message, Err: err}
}

func AbortInternal(c *gin.Context) {
	AbortError(c, ErrInternal.Status, ErrInternal.Code, ErrInternal.Message)
}

func AbortAppError(c *gin.Context, err error) {
	var appErr *AppError
	if errors.As(err, &appErr) {
		AbortError(c, appErr.Status, appErr.Code, appErr.Message)
		return
	}
	AbortInternal(c)
}

func SuccessDataWithServerNow(c *gin.Context, status int, data any) {
	c.JSON(status, gin.H{
		"data":       data,
		"server_now": time.Now().UTC().Format(time.RFC3339),
	})
}
