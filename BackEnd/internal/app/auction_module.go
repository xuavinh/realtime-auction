package app

import (
	"log/slog"
	"xuanvinh/internal/config"
	"xuanvinh/internal/handler"
	"xuanvinh/internal/repository"
	"xuanvinh/internal/routes"
	"xuanvinh/internal/service"
	"xuanvinh/internal/validation"
	"xuanvinh/pkg/auth"
	"xuanvinh/pkg/cache"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type AuctionModule struct {
	AuctionRepo *repository.AuctionRepository
	Service     *service.AuctionService
	Handler     *handler.AuctionHandler
	Routes      *routes.AuctionModuleRoutes
}

func BuildAuctionModule(pool *pgxpool.Pool, jwtMgr *auth.JWTManager, rcache *cache.RedisCache, v *validation.Validator, cfg *config.Config, log *slog.Logger, catRepo *repository.CategoryRepository) *AuctionModule {
	auctionRepo := repository.NewAuctionRepository(pool)
	auctionSvc := service.NewAuctionService(auctionRepo, catRepo, log)
	auctionHdl := handler.NewAuctionHandler(auctionSvc, v)
	return &AuctionModule{
		AuctionRepo: auctionRepo,
		Service:     auctionSvc,
		Handler:     auctionHdl,
		Routes: &routes.AuctionModuleRoutes{
			Register: func(rg *gin.RouterGroup) {
				routes.RegisterAuctionRoutes(rg, routes.AuctionDeps{
					Handler: auctionHdl,
					JWT:     jwtMgr,
					Cache:   rcache,
					Log:     log,
				})
			},
		},
	}
}
