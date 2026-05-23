package auth

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

var (
	ErrInvalidToken = errors.New("auth: invalid token")
	ErrTokenExpired = errors.New("auth: token expired")
	ErrTokenRevoked = errors.New("auth: token revoked")
)

type TokenKind string

const (
	TokenAccess  TokenKind = "access"
	TokenRefresh TokenKind = "refresh"
)

type Claims struct {
	UserID    int32
	UserUUID  uuid.UUID
	Email     string
	FullName  string
	JTI       string
	Kind      TokenKind
	IssuedAt  time.Time
	ExpiresAt time.Time
}

type IssuedToken struct {
	Token     string
	JTI       string
	ExpiresAt time.Time
}
