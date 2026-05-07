package middleware

import (
	"context"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ctxKey string

const requestIDKey ctxKey = "request_id"

const HeaderRequestID = "X-Request-ID"

func Trace() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		rid := ctx.GetHeader(HeaderRequestID)
		if rid == "" {
			rid = uuid.NewString()
		}
		context := context.WithValue(ctx.Request.Context(), requestIDKey, rid)
		ctx.Request = ctx.Request.WithContext(context)
		ctx.Set(string(requestIDKey), rid)
		ctx.Writer.Header().Set(HeaderRequestID, rid)
		ctx.Next()
	}
}

func RequestIDFromContext(ctx context.Context) string {
	if v, ok := ctx.Value(requestIDKey).(string); ok {
		return v
	}
	return ""
}
