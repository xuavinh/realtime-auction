package middleware

import (
	"fmt"
	"log/slog"
	"net/http"
	"sync"
	"time"
	"xuanvinh/internal/utils"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

type rlClient struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

var (
	rlMu          sync.Mutex
	rlClients     = make(map[string]*rlClient)
	rlCleanupOnce sync.Once
)

const rlIdleTTL = 3 * time.Minute

func startRLCleanup() {
	go func() {
		t := time.NewTicker(time.Minute)
		defer t.Stop()
		for range t.C {
			rlMu.Lock()
			for k, cl := range rlClients {
				if time.Since(cl.lastSeen) > rlIdleTTL {
					delete(rlClients, k)
				}
			}
			rlMu.Unlock()
		}
	}()
}

func rateLimitKey(endpoint, identifier string) string {
	return fmt.Sprintf("rl:%s:%s", endpoint, identifier)
}

func getLimiter(key string, limit int, window time.Duration) *rate.Limiter {
	rlCleanupOnce.Do(startRLCleanup)

	sec := window.Seconds()
	if sec <= 0 {
		sec = 1
	}
	lim := limit
	if lim < 1 {
		lim = 1
	}
	r := rate.Limit(float64(lim) / sec)

	rlMu.Lock()
	defer rlMu.Unlock()
	c, ok := rlClients[key]
	if !ok {
		c = &rlClient{
			limiter:  rate.NewLimiter(r, lim),
			lastSeen: time.Now(),
		}
		rlClients[key] = c
		return c.limiter
	}
	c.lastSeen = time.Now()
	return c.limiter
}

func RateLimit(log *slog.Logger, endpoint string, limit int, window time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		identifier := identifierFor(c)
		key := rateLimitKey(endpoint, identifier)
		limiter := getLimiter(key, limit, window)

		if !limiter.Allow() {
			if shouldLogRateLimit(key) {
				log.Warn("rate limit exceeded",
					slog.String("endpoint", endpoint),
					slog.String("identifier", identifier),
					slog.String("method", c.Request.Method),
					slog.String("path", c.Request.URL.Path),
					slog.String("client_ip", c.ClientIP()),
				)
			}
			utils.AbortError(c, http.StatusTooManyRequests, "rate_limited",
				"Too many requests, please try again later")
			return
		}
		c.Next()
	}
}

var (
	rateLimitLogMu sync.Mutex
	rateLimitLogAt = make(map[string]time.Time)
)

const rateLimitLogTTL = 20 * time.Second

func shouldLogRateLimit(key string) bool {
	now := time.Now()
	rateLimitLogMu.Lock()
	defer rateLimitLogMu.Unlock()
	if t, ok := rateLimitLogAt[key]; ok && now.Sub(t) < rateLimitLogTTL {
		return false
	}
	rateLimitLogAt[key] = now
	return true
}

func identifierFor(c *gin.Context) string {
	if uid, ok := UserIDFrom(c); ok {
		return fmt.Sprintf("user:%d", uid)
	}
	return "ip:" + c.ClientIP()
}
