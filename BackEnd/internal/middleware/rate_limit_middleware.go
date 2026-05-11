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
	lastLog  time.Time
}

var (
	rlMu          sync.Mutex
	rlClients     = make(map[string]*rlClient)
	rlCleanupOnce sync.Once
)

const (
	rlIdleTTL       = 3 * time.Minute
	rateLimitLogTTL = 20 * time.Second
)

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

func getClient(key string, limit int, window time.Duration) *rlClient {
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
		return c
	}
	c.lastSeen = time.Now()
	return c
}

func RateLimit(log *slog.Logger, endpoint string, limit int, window time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		identifier := identifierFor(c)
		key := rateLimitKey(endpoint, identifier)
		client := getClient(key, limit, window)

		if !client.limiter.Allow() {
			if shouldLogRateLimit(client) {
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

func shouldLogRateLimit(cl *rlClient) bool {
	now := time.Now()
	rlMu.Lock()
	defer rlMu.Unlock()

	if now.Sub(cl.lastLog) < rateLimitLogTTL {
		return false
	}
	cl.lastLog = now
	return true
}

func identifierFor(c *gin.Context) string {
	if uid, ok := UserIDFrom(c); ok {
		return fmt.Sprintf("user:%d", uid)
	}
	return "ip:" + c.ClientIP()
}
