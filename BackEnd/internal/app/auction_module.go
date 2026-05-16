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
	imageRepo := repository.NewAuctionImageRepository(pool)

	auctionSvc := service.NewAuctionService(auctionRepo, catRepo, imageRepo, log)
	imageSvc := service.NewAuctionImageService(imageRepo, log)

	auctionHdl := handler.NewAuctionHandler(auctionSvc, v)
	imageHdl := handler.NewAuctionImageHandler(imageSvc, cfg.App.UploadDir, "/uploads")

	return &AuctionModule{
		AuctionRepo:  auctionRepo,
		ImageRepo:    imageRepo,
		Service:      auctionSvc,
		ImageService: imageSvc,
		Handler:      auctionHdl,
		ImageHandler: imageHdl,
		Routes: &routes.AuctionModuleRoutes{
			Register: func(rg *gin.RouterGroup) {
				routes.RegisterAuctionRoutes(rg, routes.AuctionDeps{
					Handler:      auctionHdl,
					ImageHandler: imageHdl,
					JWT:          jwtMgr,
					Cache:        rcache,
					OwnerLoader:  auctionRepo,
					Log:          log,
				})
			},
		},
	}
}
