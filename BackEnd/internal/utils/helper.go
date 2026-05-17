package utils

import (
	"crypto/rand"
	"encoding/hex"
	"strings"
	"xuanvinh/internal/repository"

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

func DedupeInt32(in []int32) []int32 {
	if len(in) == 0 {
		return nil
	}
	seen := make(map[int32]struct{}, len(in))
	out := make([]int32, 0, len(in))
	for _, id := range in {
		if _, ok := seen[id]; ok {
			continue
		}
		seen[id] = struct{}{}
		out = append(out, id)
	}
	return out
}

func CoverImageURL(imgs []repository.AuctionImage) string {
	if len(imgs) == 0 {
		return ""
	}
	for _, im := range imgs {
		if im.IsPrimary {
			return im.Url
		}
	}
	return imgs[0].Url
}
