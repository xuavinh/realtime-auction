package main

import (
	"context"
	"log"
	"xuanvinh/internal/app"
)

func main() {
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
