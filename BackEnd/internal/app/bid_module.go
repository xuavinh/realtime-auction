package app

import (
	"log/slog"
	"xuanvinh/internal/actor"
	"xuanvinh/internal/handler"
	"xuanvinh/internal/repository"
	"xuanvinh/internal/routes"
	"xuanvinh/internal/validation"
	"xuanvinh/pkg/auth"
	"xuanvinh/pkg/cache"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type BidModule struct {
	BidRepo *repository.BidRepository
	Handler *handler.BidHandler
	Routes  *routes.BidModuleRoutes
}

func BuildBidModule(pool *pgxpool.Pool, registry *actor.ActorRegistry, v *validation.Validator, log *slog.Logger, jwtMgr *auth.JWTManager, rcache *cache.RedisCache) *BidModule {
	bidRepo := repository.NewBidRepository(pool)
	bidHdl := handler.NewBidHandler(registry, bidRepo, v)

	return &BidModule{
		BidRepo: bidRepo,
		Handler: bidHdl,
		Routes: &routes.BidModuleRoutes{
			Register: func(rg *gin.RouterGroup) {
				routes.RegisterBidRoutes(rg, routes.BidDeps{
					BidHandler: bidHdl,
					JWT:        jwtMgr,
					Cache:      rcache,
					Log:        log,
				})
			},
		},
	}
}
