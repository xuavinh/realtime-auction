package middleware

import (
	"bytes"
	"log/slog"
	"net/http"
	"runtime/debug"
	"strings"
	"xuanvinh/internal/utils"

	"github.com/gin-gonic/gin"
)

func Recovery(log *slog.Logger) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		defer func() {
			if rec := recover(); rec != nil {
				log.Error("panic recovered",
					slog.String("request_id", RequestIDFromContext(ctx.Request.Context())),
					slog.String("path", ctx.FullPath()),
					slog.String("method", ctx.Request.Method),
					slog.Any("error", rec),
					slog.String("stack", extractFirstAppStackLine(debug.Stack())),
				)
				if !ctx.Writer.Written() {
					utils.AbortError(ctx, http.StatusInternalServerError, "internal", "Something went wrong")
				}
			}
		}()
		ctx.Next()
	}
}

func extractFirstAppStackLine(stack []byte) string {
	lines := bytes.Split(stack, []byte("\n"))

	for _, line := range lines {
		if bytes.Contains(line, []byte(".go")) &&
			!bytes.Contains(line, []byte("/runtime/")) &&
			!bytes.Contains(line, []byte("/debug/")) &&
			!bytes.Contains(line, []byte("recovery_middleware.go")) {

			return strings.TrimSpace(string(line))
		}
	}
	return ""
}
