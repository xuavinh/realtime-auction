package routes

import (
	"log/slog"
	"xuanvinh/internal/middleware"

	"github.com/gin-gonic/gin"
)

type Modules struct {
	Auth *AuthModuleRoutes
}

type AuthModuleRoutes struct {
	Register func(rg *gin.RouterGroup)
}

type Route interface {
	Register(*gin.RouterGroup)
}

func Setep(log *slog.Logger, m Modules) *gin.Engine {
	r := gin.Default()

	r.Use(middleware.Trace())
	r.Use(middleware.Logger(log))

	api := r.Group("/api/v1")
	if m.Auth != nil {
		m.Auth.Register(api)
	}
	return r
}
