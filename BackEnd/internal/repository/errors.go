package repository

import "errors"

var (
	ErrNotFound    = errors.New("repository: not found")
	ErrEmailExists = errors.New("repository: email already exists")
)
