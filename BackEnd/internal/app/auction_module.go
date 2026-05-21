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
	ImageRepo   *repository.AuctionImageRepository

	Service      *service.AuctionService
	ImageService *service.AuctionImageService

	Handler      *handler.AuctionHandler
	ImageHandler *handler.AuctionImageHandler

	Routes *routes.AuctionModuleRoutes
}

func BuildAuctionModule(pool *pgxpool.Pool, jwtMgr *auth.JWTManager, rcache *cache.RedisCache, v *validation.Validator, cfg *config.Config, log *slog.Logger, catRepo *repository.CategoryRepository) *AuctionModule {
	auctionRepo := repository.NewAuctionRepository(pool)
	imgRepo := repository.NewAuctionImageRepository(pool)

	auctionSvc := service.NewAuctionService(auctionRepo, catRepo, imgRepo, log)
	imgSvc := service.NewAuctionImageService(imgRepo, auctionRepo, log)

	auctionHdl := handler.NewAuctionHandler(auctionSvc, v)
	imgHdl := handler.NewAuctionImageHandler(imgSvc, cfg.App.UploadDir, "/uploads")

	return &AuctionModule{
		AuctionRepo:  auctionRepo,
		ImageRepo:    imgRepo,
		Service:      auctionSvc,
		ImageService: imgSvc,
		Handler:      auctionHdl,
		ImageHandler: imgHdl,
		Routes: &routes.AuctionModuleRoutes{
			Register: func(rg *gin.RouterGroup) {
				routes.RegisterAuctionRoutes(rg, routes.AuctionDeps{
					Handler:      auctionHdl,
					ImageHandler: imgHdl,
					JWT:          jwtMgr,
					Cache:        rcache,
					Log:          log,
				})
			},
		},
	}
}
