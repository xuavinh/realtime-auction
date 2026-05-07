package logger

import (
	"io"
	"log/slog"
	"os"
	"strings"
)

type Options struct {
	Env    string //development, production
	Level  string
	Output io.Writer
}

func New(opts Options) *slog.Logger {
	if opts.Output == nil {
		opts.Output = os.Stdout
	}

	level := parseLevel(opts.Level)

	handlerOptions := &slog.HandlerOptions{
		Level:     level,
		AddSource: level <= slog.LevelDebug,
	}

	var handler slog.Handler
	if strings.EqualFold(opts.Env, "production") {
		handler = slog.NewJSONHandler(opts.Output, handlerOptions)
	} else {
		handler = slog.NewTextHandler(opts.Output, handlerOptions)
	}
	return slog.New(handler)
}

func parseLevel(s string) slog.Level {
	switch strings.ToLower(s) {
	case "debug":
		return slog.LevelDebug
	case "warn", "warning":
		return slog.LevelWarn
	case "error":
		return slog.LevelError
	default:
		return slog.LevelInfo
	}
}
