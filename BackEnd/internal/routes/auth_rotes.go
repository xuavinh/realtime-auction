package routes

import (
	"xuanvinh/internal/handler"
	"xuanvinh/pkg/auth"

	"github.com/gin-gonic/gin"
)

type AuthDeps struct {
	Handler *handler.AuthHandler
	JWT     *auth.JWTManager
}

func RegisterAuthRoutes(rg *gin.RouterGroup, d AuthDeps) {
	g := rg.Group("/auth")

	g.POST("/register", d.Handler.Register)
	g.POST("/login", d.Handler.Login)
	g.POST("/refresh", d.Handler.Refresh)
	g.POST("/logout", d.Handler.Logout)
}
