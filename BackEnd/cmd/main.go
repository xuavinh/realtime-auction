package main

import (
	"xuanvinh/internal/app"
	"xuanvinh/internal/config"
)

func main() {
	cfg := config.LoadConfig()
	application := app.NewApplication(cfg)
	if err := application.Run(); err != nil {
		panic(err)
	}
}
