package routes

import "github.com/gin-gonic/gin"

type Route interface {
	Register(*gin.RouterGroup)
}

func RegisterRoutes(r *gin.Engine, routes ...Route) {
	api := r.Group("/api/v1")
	for _, route := range routes {
		route.Register(api)
	}
}
