package service

import (
	"context"
	"errors"
	"xuanvinh/internal/config"
	"xuanvinh/internal/dto"
	"xuanvinh/internal/repository"
	"xuanvinh/internal/utils"

	"golang.org/x/crypto/bcrypt"
)

type userRepo interface {
	Create(ctx context.Context, arg repository.CreateUserParams) (repository.CreateUserRow, error)
	ExistsEmail(ctx context.Context, email string) (bool, error)
}

type AuthService struct {
	users userRepo
	cfg   *config.Config
}

func NewAuthService(users userRepo, cfg *config.Config) *AuthService {
	return &AuthService{
		users: users,
		cfg:   cfg,
	}
}

func (s *AuthService) Register(ctx context.Context, in dto.RegisterRequest) (dto.RegisterResponse, error) {
	email := utils.NormalizeEmail(in.Email)
	fullName := utils.SanitizeString(in.FullName)
	exists, err := s.users.ExistsEmail(ctx, email)
	if err != nil {
		return dto.RegisterResponse{}, err
	}
	if exists {
		return dto.RegisterResponse{}, ErrEmailExists
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(in.Password), s.cfg.Auth.BcryptCost)
	if err != nil {
		return dto.RegisterResponse{}, err
	}
	row, err := s.users.Create(ctx, repository.CreateUserParams{
		Email:        email,
		PasswordHash: string(hash),
		FullName:     fullName,
	})
	if err != nil {
		if errors.Is(err, repository.ErrEmailExists) {
			return dto.RegisterResponse{}, ErrEmailExists
		}
		return dto.RegisterResponse{}, err
	}

	return dto.RegisterResponse{
		UserUUID: row.UserUuid.String(),
		Email:    row.Email,
		FullName: row.FullName,
	}, nil
}

func (s *AuthService) Login(ctx context.Context) {

}

func (s *AuthService) Refresh(ctx context.Context) {

}

func (s *AuthService) Logout(ctx context.Context) {

}
