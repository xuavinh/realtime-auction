package app

import (
	"log"
	"xuanvinh/internal/config"
	"xuanvinh/internal/routes"
	"xuanvinh/internal/validation"

	"github.com/gin-gonic/gin"
)

type Module interface {
	Routes() routes.Route
}

type Application struct {
	config  *config.Config
	router  *gin.Engine
	modules []Module
}

func NewApplication(cfg *config.Config) *Application {
	if err := validation.InitValidator(); err != nil {
		log.Fatalf("Failed to initialize validator: %v", err)
	}

	r := gin.Default()
	modules := []Module{}
	routes.RegisterRoutes(r, getModuleRoutes(modules)...)
	return &Application{
		config:  cfg,
		router:  r,
		modules: modules,
	}
}

func getModuleRoutes(modules []Module) []routes.Route {
	routerList := make([]routes.Route, len(modules))
	for i, module := range modules {
		routerList[i] = module.Routes()
	}
	return routerList
}

func (a *Application) Run() error {
	return a.router.Run(a.config.ServerAddress)
}
