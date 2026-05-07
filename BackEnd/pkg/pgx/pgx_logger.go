package pgx

import (
	"context"
	"fmt"
	"log/slog"
	"reflect"
	"regexp"
	"strconv"
	"strings"
	"time"
	"xuanvinh/internal/middleware"

	"github.com/jackc/pgx/v5/tracelog"
)

type SlogAdapter struct {
	l              *slog.Logger
	slowQueryLimit time.Duration
}

func NewSlogAdapter(l *slog.Logger) *SlogAdapter {
	return &SlogAdapter{
		l:              l.With(slog.String("component", "pgx")),
		slowQueryLimit: 500 * time.Millisecond,
	}
}

func (a *SlogAdapter) Log(ctx context.Context, level tracelog.LogLevel, msg string, data map[string]any) {
	if msg != "Query" {
		return
	}

	queryInfo := parseSQL(getString(data, "sql"))
	args := getArgs(data)
	duration := getDuration(data)
	requestID := middleware.RequestIDFromContext(ctx)
	finalSQL := queryInfo.CleanSQL
	if len(args) > 0 {
		finalSQL = replacePlaceholders(queryInfo.CleanSQL, args)
	}

	logLevel := slog.LevelInfo
	event := "query"
	errText := getErrorText(data)
	if errText != "" {
		logLevel = slog.LevelError
		event = "query_error"
	} else if duration > a.slowQueryLimit {
		logLevel = slog.LevelWarn
		event = "slow_query"
	}

	a.l.LogAttrs(ctx, logLevel, "sql_executed",
		slog.String("event", event),
		slog.String("request_id", requestID),
		slog.Float64("duration_ms", float64(duration.Nanoseconds())/1e6),
		slog.String("query_name", queryInfo.QueryName),
		slog.String("operation", queryInfo.OperationType),
		slog.String("sql", finalSQL),
		slog.String("sql_original", queryInfo.OriginalSQL),
		slog.String("command_tag", getString(data, "commandTag")),
		slog.Int64("pid", getInt64(data, "pid")),
		slog.String("error", errText),
		slog.Any("args", args),
	)
}

type QueryInfo struct {
	QueryName     string
	OperationType string
	CleanSQL      string
	OriginalSQL   string
}

var (
	sqlcNameRegex    = regexp.MustCompile(`-- name:\s*(\w+)\s*:(\w+)`)
	spaceRegex       = regexp.MustCompile(`\s+`)
	commentRegex     = regexp.MustCompile(`-- [^\r\n]*`)
	placeholderRegex = regexp.MustCompile(`\$(\d+)`)
)

func parseSQL(sql string) QueryInfo {
	info := QueryInfo{OriginalSQL: sql}

	if matches := sqlcNameRegex.FindStringSubmatch(sql); len(matches) == 3 {
		info.QueryName = matches[1]
		info.OperationType = strings.ToUpper(matches[2])
	}

	cleanSQL := commentRegex.ReplaceAllString(sql, "")
	cleanSQL = strings.TrimSpace(cleanSQL)
	cleanSQL = spaceRegex.ReplaceAllString(cleanSQL, " ")
	info.CleanSQL = cleanSQL

	return info
}

func replacePlaceholders(sql string, args []any) string {
	return placeholderRegex.ReplaceAllStringFunc(sql, func(match string) string {
		numStr := strings.TrimPrefix(match, "$")

		n, err := strconv.Atoi(numStr)
		if err != nil {
			return match
		}

		if n < 1 || n > len(args) {
			return match
		}

		return formatArg(args[n-1])
	})
}

func formatArg(arg any) string {
	if arg == nil {
		return "NULL"
	}

	val := reflect.ValueOf(arg)
	if val.Kind() == reflect.Ptr {
		if val.IsNil() {
			return "NULL"
		}
		arg = val.Elem().Interface()
	}

	switch v := arg.(type) {
	case string:
		return "'" + strings.ReplaceAll(v, "'", "''") + "'"
	case bool:
		return strconv.FormatBool(v)
	case int:
		return strconv.Itoa(v)
	case int8, int16, int32, int64:
		return fmt.Sprintf("%d", v)
	case uint, uint8, uint16, uint32, uint64:
		return fmt.Sprintf("%d", v)
	case float32, float64:
		return fmt.Sprintf("%v", v)
	case time.Time:
		return "'" + v.Format(time.RFC3339) + "'"
	default:
		return "'" + strings.ReplaceAll(fmt.Sprintf("%v", v), "'", "''") + "'"
	}
}

func getString(data map[string]any, key string) string {
	if v, ok := data[key].(string); ok {
		return v
	}
	return ""
}

func getArgs(data map[string]any) []any {
	if v, ok := data["args"].([]any); ok {
		return v
	}
	return nil
}

func getDuration(data map[string]any) time.Duration {
	switch v := data["time"].(type) {
	case time.Duration:
		return v
	case int64:
		return time.Duration(v)
	case int:
		return time.Duration(v)
	case float64:
		return time.Duration(v)
	default:
		return 0
	}
}

func getErrorText(data map[string]any) string {
	if v, ok := data["err"]; ok && v != nil {
		return fmt.Sprintf("%v", v)
	}
	if v, ok := data["error"]; ok && v != nil {
		return fmt.Sprintf("%v", v)
	}
	return ""
}

func getInt64(data map[string]any, key string) int64 {
	switch v := data[key].(type) {
	case int64:
		return v
	case int:
		return int64(v)
	case int32:
		return int64(v)
	case uint64:
		return int64(v)
	case uint32:
		return int64(v)
	case float64:
		return int64(v)
	default:
		return 0
	}
}
