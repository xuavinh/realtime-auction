package utils

import (
	"crypto/rand"
	"encoding/hex"
	"strings"

	"github.com/microcosm-cc/bluemonday"
)

// xóa HTML tags
var strictPolicy = bluemonday.StrictPolicy()

// gọi cho mọi input string từ client
func SanitizeString(s string) string {
	return strings.TrimSpace(strictPolicy.Sanitize(s))
}

func NormalizeEmail(s string) string {
	return strings.ToLower(strings.TrimSpace(s))
}

func RandomHex(n int) string {
	b := make([]byte, n)
	if _, err := rand.Read(b); err != nil {
		return ""
	}
	return hex.EncodeToString(b)
}
