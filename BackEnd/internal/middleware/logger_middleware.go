package middleware

import (
	"log/slog"
	"time"

	"github.com/gin-gonic/gin"
)

func Logger(log *slog.Logger) gin.HandlerFunc {
	httpLog := log.With(slog.String("component", "http"))
	return func(ctx *gin.Context) {
		start := time.Now()

		ctx.Next()

		latency := time.Since(start)
		status := ctx.Writer.Status()
		level := slog.LevelInfo
		switch {
		case status >= 500:
			level = slog.LevelError
		case status >= 400:
			level = slog.LevelWarn
		}
		httpLog.LogAttrs(ctx.Request.Context(), level, "request",
			slog.String("request_id", RequestIDFromContext(ctx.Request.Context())),
			slog.String("method", ctx.Request.Method),
			slog.String("path", ctx.Request.URL.Path),
			slog.Int("status", status),
			slog.Duration("latency", latency),
			slog.String("ip", ctx.ClientIP()),
			slog.String("user_agent", ctx.Request.UserAgent()),
		)

	}
}
