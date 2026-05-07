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
	"xuanvinh/pkg/logger"
)

type App struct {
	config     *config.Config
	logger     *slog.Logger
	router     http.Handler
	authModule *AuthModule
	logFile    *os.File
}

func New(ctx context.Context) (*App, error) {
	cfg := config.LoadConfig()

	err := os.MkdirAll("../logs", 0755)
	if err != nil {
		return nil, err
	}
	file, err := os.OpenFile("../logs/app.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return nil, err
	}
	log := logger.New(logger.Options{
		Env:    "production",
		Level:  os.Getenv("LOG_LEVEL"),
		Output: file,
	})
	pool, err := db.Connect(ctx, cfg.DB)
	if err != nil {
		return nil, err
	}

	v := validation.New()

	authModule := BuildAuthModule(pool, v, cfg)

	router := routes.Setep(log, routes.Modules{
		Auth: authModule.Routes,
	})
	return &App{
		config:     cfg,
		logger:     log,
		router:     router,
		authModule: authModule,
		logFile:    file,
	}, nil
}

func (a *App) Run() error {
	return http.ListenAndServe(":8080", a.router)
}

func (a *App) Close() error {
	if a.logFile != nil {
		return a.logFile.Close()
	}
	return nil
}
