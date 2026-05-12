package routes

import (
	"log/slog"
	"xuanvinh/internal/handler"
	"xuanvinh/internal/middleware"
	"xuanvinh/pkg/auth"
	"xuanvinh/pkg/cache"

	"github.com/gin-gonic/gin"
)

type AuctionDeps struct {
	Handler *handler.AuctionHandler
	JWT     *auth.JWTManager
	Cache   *cache.RedisCache
	Log     *slog.Logger
}

func RegisterAuctionRoutes(rg *gin.RouterGroup, d AuctionDeps) {
	g := rg.Group("/auctions")

	g.GET("/:id", d.Handler.Get)

	// Protected routes
	authed := g.Group("")
	authed.Use(middleware.AuthMiddleware(d.JWT, d.Cache))

	authed.POST("", d.Handler.Create)
}
