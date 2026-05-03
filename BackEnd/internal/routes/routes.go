package routes

import "github.com/gin-gonic/gin"

type Modules struct {
	Auth *AuthModuleRoutes
}

type AuthModuleRoutes struct {
	Register func(rg *gin.RouterGroup)
}

type Route interface {
	Register(*gin.RouterGroup)
}

func Setep(m Modules) *gin.Engine {
	r := gin.New()

	api := r.Group("/api/v1")
	if m.Auth != nil {
		m.Auth.Register(api)
	}
	return r
}
