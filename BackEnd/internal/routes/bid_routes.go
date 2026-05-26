package routes

import (
	"log/slog"
	"xuanvinh/internal/handler"
	"xuanvinh/internal/middleware"
	"xuanvinh/pkg/auth"
	"xuanvinh/pkg/cache"

	"github.com/gin-gonic/gin"
)

type BidDeps struct {
	BidHandler *handler.BidHandler
	WsHandler  *handler.WsHandler
	JWT        *auth.JWTManager
	Cache      *cache.RedisCache
	Log        *slog.Logger
}

func RegisterBidRoutes(rg *gin.RouterGroup, d BidDeps) {
	auctions := rg.Group("/auctions")
	auctions.GET("/:id/bids", d.BidHandler.ListBids)

	auctionsAuth := auctions.Group("", middleware.AuthMiddleware(d.JWT, d.Cache))
	auctionsAuth.POST("/:id/bids", d.BidHandler.PlaceBid)
}

func RegisterWsRoutes(r *gin.Engine, d BidDeps) {
	ws := r.Group("/ws", middleware.WsAuthMiddleware(d.JWT, d.Cache))
	ws.GET("/auctions/:id", d.WsHandler.Upgrade)
}
