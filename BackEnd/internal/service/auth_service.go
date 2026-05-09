package service

import (
	"context"
	"errors"
	"fmt"
	"time"
	"xuanvinh/internal/config"
	"xuanvinh/internal/dto"
	"xuanvinh/internal/repository"
	"xuanvinh/internal/utils"
	"xuanvinh/pkg/auth"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type userRepo interface {
	Create(ctx context.Context, arg repository.CreateUserParams) (repository.CreateUserRow, error)
	GetByEmail(ctx context.Context, email string) (repository.GetUserByEmailRow, error)
	ExistsEmail(ctx context.Context, email string) (bool, error)
}

type tokenIssuer interface {
	IssuePair(ctx context.Context, userID int32, userUUID uuid.UUID, email string) (access, refresh auth.IssuedToken, err error)
	VerifyRefresh(ctx context.Context, raw string) (*auth.Claims, error)
	AccessTTL() time.Duration
	RefreshTTL() time.Duration
}

type tokenCache interface {
	Set(ctx context.Context, key, value string, ttl time.Duration) error
	Get(ctx context.Context, key string) (string, error)
	Del(ctx context.Context, keys ...string) error
	Exists(ctx context.Context, key string) (bool, error)
}

const (
	prefixRefresh = "refresh:"
)

func refreshKey(userID int32, jti string) string {
	return fmt.Sprintf("%s%d:%s", prefixRefresh, userID, jti)
}

type AuthService struct {
	users  userRepo
	tokens tokenIssuer
	cache  tokenCache
	cfg    *config.Config
}

func NewAuthService(users userRepo, tokens tokenIssuer, cache tokenCache, cfg *config.Config) *AuthService {
	return &AuthService{
		users:  users,
		tokens: tokens,
		cache:  cache,
		cfg:    cfg,
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

type LoginResult struct {
	Response         dto.LoginResponse
	RefreshToken     string
	RefreshExpiresAt time.Time
}

func (s *AuthService) Login(ctx context.Context, in dto.LoginRequest) (LoginResult, error) {
	email := utils.NormalizeEmail(in.Email)
	user, err := s.users.GetByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return LoginResult{}, ErrInvalidCredentials
		}
		return LoginResult{}, err
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(in.Password)); err != nil {
		return LoginResult{}, ErrInvalidCredentials
	}

	access, refresh, err := s.tokens.IssuePair(ctx, user.UserID, user.UserUuid, user.Email)
	if err != nil {
		return LoginResult{}, err
	}
	// Set refresh:{userID}:{jti} ""
	if err := s.cache.Set(ctx, refreshKey(user.UserID, refresh.JTI), "", s.tokens.RefreshTTL()); err != nil {
		return LoginResult{}, err
	}
	return LoginResult{
		Response: dto.LoginResponse{
			UserUUID:    user.UserUuid.String(),
			AccessToken: access.Token,
			ExpiresIn:   int64(s.tokens.AccessTTL().Seconds()),
		},
		RefreshToken:     refresh.Token,
		RefreshExpiresAt: refresh.ExpiresAt,
	}, nil
}

type RefreshResult struct {
	Response         dto.RefreshResponse
	RefreshToken     string
	RefreshExpiresAt time.Time
}

func (s *AuthService) Refresh(ctx context.Context, tokenRaw string) (RefreshResult, error) {
	if tokenRaw == "" {
		return RefreshResult{}, ErrInvalidRefreshToken
	}

	claims, err := s.tokens.VerifyRefresh(ctx, tokenRaw)
	if err != nil {
		return RefreshResult{}, ErrInvalidRefreshToken
	}
	exists, err := s.cache.Exists(ctx, refreshKey(claims.UserID, claims.JTI))
	if err != nil {
		return RefreshResult{}, err
	}
	if !exists {
		return RefreshResult{}, ErrInvalidRefreshToken
	}
	access, refresh, err := s.tokens.IssuePair(ctx, claims.UserID, claims.UserUUID, claims.Email)
	if err != nil {
		return RefreshResult{}, err
	}
	// Rotate: xoá refresh cũ + lưu refresh mới
	if err := s.cache.Del(ctx, refreshKey(claims.UserID, claims.JTI)); err != nil {
		return RefreshResult{}, err
	}
	if err := s.cache.Set(ctx, refreshKey(claims.UserID, refresh.JTI), "", s.tokens.RefreshTTL()); err != nil {
		return RefreshResult{}, err
	}
	return RefreshResult{
		Response: dto.RefreshResponse{
			UserUUID:    claims.UserUUID.String(),
			AccessToken: access.Token,
			ExpiresIn:   int64(s.tokens.AccessTTL().Seconds()),
		},
		RefreshToken:     refresh.Token,
		RefreshExpiresAt: refresh.ExpiresAt,
	}, nil
}

func (s *AuthService) Logout(ctx context.Context) {

}
