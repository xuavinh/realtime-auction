package auth

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type jwtClaims struct {
	UserID   int32     `json:"user_id"`
	UserUUID string    `json:"user_uuid"`
	Email    string    `json:"email"`
	FullName string    `json:"full_name"`
	Kind     TokenKind `json:"kind"`
	jwt.RegisteredClaims
}

type JWTManager struct {
	accessSecret  []byte
	accessTTL     time.Duration
	refreshSecret []byte
	refreshTTL    time.Duration
	issuer        string
	now           func() time.Time
}

type JWTOptions struct {
	AccessSecret  string
	AccessTTL     time.Duration
	RefreshSecret string
	RefreshTTL    time.Duration
	Issuer        string
}

func NewJWTManager(o JWTOptions) *JWTManager {
	return &JWTManager{
		accessSecret:  []byte(o.AccessSecret),
		accessTTL:     o.AccessTTL,
		refreshSecret: []byte(o.RefreshSecret),
		refreshTTL:    o.RefreshTTL,
		issuer:        o.Issuer,
		now:           time.Now,
	}
}

func (m *JWTManager) AccessTTL() time.Duration {
	return m.accessTTL
}
func (m *JWTManager) RefreshTTL() time.Duration {
	return m.refreshTTL
}

// sinh access+refresh token cùng JTI
func (m *JWTManager) IssuePair(ctx context.Context, userID int32, userUUID uuid.UUID, email string, fullName string) (access, refresh IssuedToken, err error) {
	jti := uuid.NewString()

	access, err = m.issue(ctx, userID, userUUID, email, fullName, TokenAccess, jti, m.accessSecret, m.accessTTL)
	if err != nil {
		return IssuedToken{}, IssuedToken{}, err
	}
	refresh, err = m.issue(ctx, userID, userUUID, email, fullName, TokenRefresh, jti, m.refreshSecret, m.refreshTTL)
	if err != nil {
		return IssuedToken{}, IssuedToken{}, err
	}
	return access, refresh, nil
}

func (m *JWTManager) issue(_ context.Context, userID int32, userUUID uuid.UUID, email string, fullName string, kind TokenKind, jti string, secret []byte, ttl time.Duration) (IssuedToken, error) {
	now := m.now().UTC()
	expiresAt := now.Add(ttl)

	claims := jwtClaims{
		UserID:   userID,
		UserUUID: userUUID.String(),
		Email:    email,
		FullName: fullName,
		Kind:     kind,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    m.issuer,
			ID:        jti,
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(expiresAt),
		},
	}

	tok := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := tok.SignedString(secret)
	if err != nil {
		return IssuedToken{}, fmt.Errorf("auth: sign %s token: %w", kind, err)
	}
	return IssuedToken{Token: signed, JTI: jti, ExpiresAt: expiresAt}, nil
}

// Verify

func (m *JWTManager) VerifyAccess(ctx context.Context, raw string) (*Claims, error) {
	return m.verify(ctx, raw, TokenAccess, m.accessSecret)
}

func (m *JWTManager) VerifyRefresh(ctx context.Context, raw string) (*Claims, error) {
	return m.verify(ctx, raw, TokenRefresh, m.refreshSecret)
}

func (m *JWTManager) verify(_ context.Context, raw string, expect TokenKind, secret []byte) (*Claims, error) {
	parsed, err := jwt.ParseWithClaims(raw, &jwtClaims{}, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			// chống algorithm confusion attack
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return secret, nil
	}, jwt.WithIssuer(m.issuer), jwt.WithValidMethods([]string{"HS256"}))

	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return nil, ErrTokenExpired
		}
		return nil, ErrInvalidToken
	}

	c, ok := parsed.Claims.(*jwtClaims)
	if !ok || !parsed.Valid {
		return nil, ErrInvalidToken
	}
	if c.Kind != expect {
		return nil, ErrInvalidToken
	}
	uu, err := uuid.Parse(c.UserUUID)
	if err != nil || uu == uuid.Nil {
		return nil, ErrInvalidToken
	}
	return &Claims{
		UserID:    c.UserID,
		UserUUID:  uu,
		Email:     c.Email,
		JTI:       c.ID,
		Kind:      c.Kind,
		IssuedAt:  c.IssuedAt.Time,
		ExpiresAt: c.ExpiresAt.Time,
		FullName:  c.FullName,
	}, nil
}
