package routes

import (
	"log/slog"
	"xuanvinh/internal/middleware"

	"github.com/gin-gonic/gin"
)

type Modules struct {
	Auth     *AuthModuleRoutes
	Category *CategoryModuleRoutes
	Auction  *AuctionModuleRoutes
}

type AuthModuleRoutes struct {
	Register func(rg *gin.RouterGroup)
}

type CategoryModuleRoutes struct {
	Register func(rg *gin.RouterGroup)
}

type AuctionModuleRoutes struct {
	Register func(rg *gin.RouterGroup)
}

type Route interface {
	Register(*gin.RouterGroup)
}

func Setep(log *slog.Logger, m Modules) *gin.Engine {
	r := gin.Default()

	r.Use(middleware.Trace())
	r.Use(middleware.Recovery(log))
	r.Use(middleware.Logger(log))
	r.Use(middleware.CORS(*middleware.DefaultCORSConfig()))

	api := r.Group("/api/v1")
	if m.Auth != nil {
		m.Auth.Register(api)
	}
	if m.Category != nil {
		m.Category.Register(api)
	}
	if m.Auction != nil {
		m.Auction.Register(api)
	}
	return r
}
