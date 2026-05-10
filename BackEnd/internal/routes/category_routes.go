package routes

import (
	"xuanvinh/internal/handler"

	"github.com/gin-gonic/gin"
)

type CategoryDeps struct {
	Handler *handler.CategoryHandler
}

func RegisterCategoryRoutes(rg *gin.RouterGroup, d CategoryDeps) {
	g := rg.Group("/categories")
	g.GET("", d.Handler.List)
}
