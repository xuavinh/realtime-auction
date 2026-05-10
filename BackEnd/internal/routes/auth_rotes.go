package routes

import (
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
}

func RegisterAuthRoutes(rg *gin.RouterGroup, d AuthDeps) {
	g := rg.Group("/auth")

	g.POST("/register", d.Handler.Register)
	g.POST("/login", d.Handler.Login)
	g.POST("/refresh", d.Handler.Refresh)
	g.POST("/logout", middleware.AuthMiddleware(d.JWT, d.Cache), d.Handler.Logout)
}
