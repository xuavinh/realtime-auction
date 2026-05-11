package routes

import (
	"log/slog"
	"time"
	"xuanvinh/internal/handler"
	"xuanvinh/internal/middleware"
	"xuanvinh/pkg/auth"
	"xuanvinh/pkg/cache"

	"github.com/gin-gonic/gin"
)

type AuthDeps struct {
	Handler *handler.AuthHandler
	JWT     *auth.JWTManager
	Cache   *cache.RedisCache
	Log     *slog.Logger
}

func RegisterAuthRoutes(rg *gin.RouterGroup, d AuthDeps) {
	g := rg.Group("/auth")

	g.POST("/register",
		middleware.RateLimit(d.Log, "register", 5, time.Minute),
		d.Handler.Register,
	)
	g.POST("/login",
		middleware.RateLimit(d.Log, "login", 10, time.Minute),
		d.Handler.Login,
	)
	g.POST("/refresh",
		middleware.RateLimit(d.Log, "refresh", 10, time.Minute),
		d.Handler.Refresh,
	)
	g.POST("/logout", middleware.AuthMiddleware(d.JWT, d.Cache), d.Handler.Logout)
}
