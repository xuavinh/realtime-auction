package routes

import (
	"log/slog"
	"xuanvinh/internal/handler"
	"xuanvinh/internal/middleware"
	"xuanvinh/internal/repository"
	"xuanvinh/pkg/auth"
	"xuanvinh/pkg/cache"

	"github.com/gin-gonic/gin"
)

type AuctionDeps struct {
	Handler      *handler.AuctionHandler
	ImageHandler *handler.AuctionImageHandler
	JWT          *auth.JWTManager
	Cache        *cache.RedisCache
	OwnerLoader  *repository.AuctionRepository
	Log          *slog.Logger
}

func RegisterAuctionRoutes(rg *gin.RouterGroup, d AuctionDeps) {
	g := rg.Group("/auctions")

	g.GET("/:id", d.Handler.Get)
	g.GET("", d.Handler.List)

	// Protected routes
	authed := g.Group("")
	authed.Use(middleware.AuthMiddleware(d.JWT, d.Cache))

	authed.POST("", d.Handler.Create)

	owner := authed.Group("/:id")
	owner.Use(middleware.OwnerOnly(d.OwnerLoader, "id"))

	// Image routes
	owner.POST("/images", d.ImageHandler.Upload)
	owner.DELETE("/images/:image_id", d.ImageHandler.Delete)
}
