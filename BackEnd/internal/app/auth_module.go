package app

import (
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

type AuthModule struct {
	UserRepo *repository.UserRepository
	Service  *service.AuthService
	Handler  *handler.AuthHandler
	Routes   *routes.AuthModuleRoutes
}

func BuildAuthModule(pool *pgxpool.Pool, jwtMgr *auth.JWTManager, rcache *cache.RedisCache, v *validation.Validator, cfg *config.Config) *AuthModule {
	userRepo := repository.NewUserRepository(pool)
	authService := service.NewAuthService(userRepo, jwtMgr, rcache, cfg)
	authHandler := handler.NewAuthHandler(authService, v, cfg)
	return &AuthModule{
		UserRepo: userRepo,
		Service:  authService,
		Handler:  authHandler,
		Routes: &routes.AuthModuleRoutes{
			Register: func(rg *gin.RouterGroup) {
				routes.RegisterAuthRoutes(rg, routes.AuthDeps{
					Handler: authHandler,
					JWT:     jwtMgr,
					Cache:   rcache,
				})
			},
		},
	}

}
