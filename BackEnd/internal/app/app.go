package app

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"xuanvinh/internal/config"
	"xuanvinh/internal/db"
	"xuanvinh/internal/routes"
	"xuanvinh/internal/validation"
	"xuanvinh/pkg/auth"
	"xuanvinh/pkg/cache"
	"xuanvinh/pkg/logger"

	"github.com/jackc/pgx/v5/pgxpool"
)

type App struct {
	config     *config.Config
	logger     *slog.Logger
	pool       *pgxpool.Pool
	cache      *cache.RedisCache
	jwt        *auth.JWTManager
	router     http.Handler
	authModule *AuthModule
	appLogFile *os.File
	dbLogFile  *os.File
}

func New(ctx context.Context) (*App, error) {
	cfg := config.LoadConfig()

	err := os.MkdirAll("../logs", 0755)
	if err != nil {
		return nil, err
	}
	appLogFile, err := os.OpenFile("../logs/app.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return nil, err
	}
	dbLogFile, err := os.OpenFile("../logs/db.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		_ = appLogFile.Close()
		return nil, err
	}
	log := logger.New(logger.Options{
		Env:    "production",
		Level:  os.Getenv("LOG_LEVEL"),
		Output: appLogFile,
	})
	dbLog := logger.New(logger.Options{
		Env:    "production",
		Level:  os.Getenv("LOG_LEVEL"),
		Output: dbLogFile,
	})
	pool, err := db.Connect(ctx, cfg.DB, dbLog)
	if err != nil {
		_ = appLogFile.Close()
		_ = dbLogFile.Close()
		return nil, err
	}

	rcache, err := cache.New(ctx, cache.Options{
		Addr:         cfg.Redis.Addr,
		Password:     cfg.Redis.Password,
		DB:           cfg.Redis.DB,
		PoolSize:     cfg.Redis.PoolSize,
		MinIdleConns: cfg.Redis.MinIdleConns,
		DialTimeout:  cfg.Redis.DialTimeout,
		ReadTimeout:  cfg.Redis.ReadTimeout,
		WriteTimeout: cfg.Redis.WriteTimeout,
	})
	if err != nil {
		pool.Close()
		return nil, err
	}
	log.Info("redis connected", slog.String("addr", cfg.Redis.Addr))

	jwtMgr := auth.NewJWTManager(auth.JWTOptions{
		AccessSecret:  cfg.JWT.AccesSecret,
		AccessTTL:     cfg.JWT.AccessTTL,
		RefreshSecret: cfg.JWT.RefreshSecret,
		RefreshTTL:    cfg.JWT.RefreshTTL,
		Issuer:        cfg.JWT.Issuer,
	})

	v := validation.New()

	authModule := BuildAuthModule(pool, jwtMgr, rcache, v, cfg)

	router := routes.Setep(log, routes.Modules{
		Auth: authModule.Routes,
	})
	return &App{
		config:     cfg,
		logger:     log,
		pool:       pool,
		jwt:        jwtMgr,
		router:     router,
		authModule: authModule,
		appLogFile: appLogFile,
		dbLogFile:  dbLogFile,
	}, nil
}

func (a *App) Run() error {
	return http.ListenAndServe(":8080", a.router)
}

func (a *App) Close() error {
	if a.appLogFile != nil {
		if err := a.appLogFile.Close(); err != nil {
			return err
		}
	}
	if a.dbLogFile != nil {
		if err := a.dbLogFile.Close(); err != nil {
			return err
		}
	}
	return nil
}
