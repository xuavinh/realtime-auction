package app

import (
	"context"
	"net/http"
	"xuanvinh/internal/config"
	"xuanvinh/internal/db"
	"xuanvinh/internal/routes"
	"xuanvinh/internal/validation"
)

type App struct {
	config     *config.Config
	router     http.Handler
	authModule *AuthModule
}

func New(ctx context.Context) (*App, error) {
	cfg := config.LoadConfig()

	pool, err := db.Connect(ctx, cfg.DB)
	if err != nil {
		return nil, err
	}

	v := validation.New()

	authModule := BuildAuthModule(pool, v, cfg)

	router := routes.Setep(routes.Modules{
		Auth: authModule.Routes,
	})
	return &App{
		config:     cfg,
		router:     router,
		authModule: authModule,
	}, nil
}

func (a *App) Run() error {
	return http.ListenAndServe(":8080", a.router)
}
