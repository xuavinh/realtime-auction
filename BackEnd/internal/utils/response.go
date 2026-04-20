package utils

type ErrorCode string

const (
	ErrNotFound ErrorCode = "NOT_FOUND"
)

type AppError struct {
	Message string
	Code    ErrorCode
	Err     error
}
