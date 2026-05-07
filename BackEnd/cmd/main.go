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
		log.Fatalf("starting app failed: %v", err)
	}
	defer a.Close()
	if err := a.Run(); err != nil {
		panic(err)
	}
}
