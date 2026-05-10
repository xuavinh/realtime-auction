package middleware

import (
	"context"
	"errors"
	"net/http"
	"strings"
	"time"
	"xuanvinh/internal/utils"
	"xuanvinh/pkg/auth"

	"github.com/gin-gonic/gin"
)

type tokenVerifier interface {
	VerifyAccess(ctx context.Context, raw string) (*auth.Claims, error)
}

type blacklistChecker interface {
	Exists(ctx context.Context, key string) (bool, error)
}

const (
	CtxUserID   = "user_id"
	CtxUserUUID = "user_uuid"
	CtxEmail    = "email"
	CtxJTI      = "jti"
	CtxTokenExp = "token_exp"
)

func AuthMiddleware(verifer tokenVerifier, bl blacklistChecker) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		context := ctx.Request.Context()
		header := ctx.GetHeader("Authorization")
		if header == "" || !strings.HasPrefix(header, "Bearer ") {
			utils.AbortError(ctx, http.StatusUnauthorized, "unauthorized", "Please sign in")
			return
		}
		raw := strings.TrimSpace(strings.TrimPrefix(header, "Bearer "))
		if raw == "" {
			utils.AbortError(ctx, http.StatusUnauthorized, "unauthorized", "Please sign in")
			return
		}

		claims, err := verifer.VerifyAccess(context, raw)
		if err != nil {
			switch {
			case errors.Is(err, auth.ErrTokenExpired):
				utils.AbortError(ctx, http.StatusUnauthorized, "token_expired", "Session has expired")
			default:
				utils.AbortError(ctx, http.StatusUnauthorized, "unauthorized", "Please sign in")
			}
			return
		}

		blKey := "blacklist:" + claims.JTI
		exists, err := bl.Exists(context, blKey)
		if err != nil {
			utils.AbortError(ctx, http.StatusInternalServerError, "redis_error", "Unable to validate session")
			return
		}
		if exists {
			utils.AbortError(ctx, http.StatusUnauthorized, "token_revoked", "Session has been revoked")
			return
		}
		ctx.Set(CtxUserID, claims.UserID)
		ctx.Set(CtxUserUUID, claims.UserUUID)
		ctx.Set(CtxEmail, claims.Email)
		ctx.Set(CtxJTI, claims.JTI)
		ctx.Set(CtxTokenExp, claims.ExpiresAt)

		ctx.Next()
	}
}

func UserIDFrom(ctx *gin.Context) (int32, bool) {
	uid, exists := ctx.Get(CtxUserID)
	if !exists {
		return 0, false
	}
	uidInt, ok := uid.(int32)
	return uidInt, ok
}

func JTIFrom(c *gin.Context) (string, bool) {
	v, ok := c.Get(CtxJTI)
	if !ok {
		return "", false
	}
	s, ok := v.(string)
	return s, ok
}

func TokenExpFrom(c *gin.Context) (time.Time, bool) {
	v, ok := c.Get(CtxTokenExp)
	if !ok {
		return time.Time{}, false
	}
	t, ok := v.(time.Time)
	return t, ok
}
