package app

import (
	"xuanvinh/internal/handler"
	"xuanvinh/internal/repository"
	"xuanvinh/internal/routes"
	"xuanvinh/internal/service"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type CategoryModule struct {
	Repo    *repository.CategoryRepository
	Service *service.CategoryService
	Handler *handler.CategoryHandler
	Routes  *routes.CategoryModuleRoutes
}

func BuildCategoryModule(pool *pgxpool.Pool) *CategoryModule {
	repo := repository.NewCategoryRepository(pool)
	svc := service.NewCategoryService(repo)
	hdl := handler.NewCategoryHandler(svc)

	return &CategoryModule{
		Repo:    repo,
		Service: svc,
		Handler: hdl,
		Routes: &routes.CategoryModuleRoutes{
			Register: func(rg *gin.RouterGroup) {
				routes.RegisterCategoryRoutes(rg, routes.CategoryDeps{
					Handler: hdl,
				})
			},
		},
	}
}
