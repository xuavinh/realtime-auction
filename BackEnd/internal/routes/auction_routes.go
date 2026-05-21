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
	Handler      *handler.AuctionHandler
	ImageHandler *handler.AuctionImageHandler
	JWT          *auth.JWTManager
	Cache        *cache.RedisCache
	Log          *slog.Logger
}

func RegisterAuctionRoutes(rg *gin.RouterGroup, d AuctionDeps) {
	g := rg.Group("/auctions")

	g.GET("/:id", d.Handler.Get)
	g.GET("", d.Handler.List)

	authed := g.Group("")

	authed.Use(middleware.AuthMiddleware(d.JWT, d.Cache))
	authed.POST("", d.Handler.Create)

	authed.PUT("/:id", d.Handler.Update)
	authed.DELETE("/:id", d.Handler.Delete)
	authed.POST("/:id/images", d.ImageHandler.Upload)
	authed.DELETE("/:id/images/:image_id", d.ImageHandler.Delete)
}
