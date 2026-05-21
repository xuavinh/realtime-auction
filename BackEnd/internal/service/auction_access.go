package service

import (
	"context"
	"errors"
	"fmt"
	"xuanvinh/internal/repository"
)

type auctionOwnerReader interface {
	GetOwner(ctx context.Context, id int32) (repository.GetAuctionOwnerRow, error)
}

func AssertAuctionOwner(ctx context.Context, r auctionOwnerReader, userID, auctionID int32) (repository.GetAuctionOwnerRow, error) {
	row, err := r.GetOwner(ctx, auctionID)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return repository.GetAuctionOwnerRow{}, ErrAuctionNotFound
		}
		return repository.GetAuctionOwnerRow{}, fmt.Errorf("assert auction owner: %w", err)
	}
	if row.CreatedBy != userID {
		return repository.GetAuctionOwnerRow{}, ErrForbidden
	}
	return row, nil
}
