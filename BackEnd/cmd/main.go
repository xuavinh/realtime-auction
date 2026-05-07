package main

import (
	"context"
	"log"
	"xuanvinh/internal/app"

	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load("../.env"); err != nil {
		log.Printf("No .env file found: %v", err)
	}

	ctx := context.Background()
	a, err := app.New(ctx)
	if err != nil {
		log.Fatal("starting app failed: %v", err)
	}
	if err := a.Run(); err != nil {
		panic(err)
	}
	defer a.Close()
}
