package handler

import (
	"context"
	"errors"
	"net/http"
	"time"
	"xuanvinh/internal/config"
	"xuanvinh/internal/dto"
	"xuanvinh/internal/service"
	"xuanvinh/internal/utils"
	"xuanvinh/internal/validation"

	"github.com/gin-gonic/gin"
)

const refreshCookieName = "refresh_token"

const refreshCookiePath = "/api/v1/auth"

type authService interface {
	Register(ctx context.Context, in dto.RegisterRequest) (dto.RegisterResponse, error)
	Login(ctx context.Context, in dto.LoginRequest) (service.LoginResult, error)
	Refresh(ctx context.Context, tokenRaw string) (service.RefreshResult, error)
	Logout(ctx context.Context)
}

type AuthHandler struct {
	svc authService
	v   *validation.Validator
	cfg *config.Config
}

func NewAuthHandler(svc authService, v *validation.Validator, cfg *config.Config) *AuthHandler {
	return &AuthHandler{
		svc: svc,
		v:   v,
		cfg: cfg,
	}
}

func (h *AuthHandler) Register(ctx *gin.Context) {
	var input dto.RegisterRequest
	if err := ctx.ShouldBindJSON(&input); err != nil {
		utils.AbortError(
			ctx,
			http.StatusBadRequest,
			"invalid_json",
			"Invalid JSON body",
		)
		return
	}
	if err := h.v.Struct(input); err != nil {
		utils.AbortValidation(
			ctx,
			h.v.Translate(err),
		)
		return
	}
	resp, err := h.svc.Register(ctx.Request.Context(), input)
	if err != nil {
		utils.AbortAppError(ctx, err)
		return
	}
	utils.SuccessData(ctx, http.StatusCreated, resp)
}

func (h *AuthHandler) Login(ctx *gin.Context) {
	var input dto.LoginRequest
	if err := ctx.ShouldBindJSON(&input); err != nil {
		utils.AbortError(ctx, http.StatusBadRequest, "invalid_request", "Invalid JSON body")
		return
	}
	if err := h.v.Struct(input); err != nil {
		utils.AbortValidation(ctx, h.v.Translate(err))
		return
	}
	res, err := h.svc.Login(ctx.Request.Context(), input)
	if err != nil {
		utils.AbortAppError(ctx, err)
		return
	}
	h.setRefreshCookie(ctx, res.RefreshToken, res.RefreshExpiresAt)
	utils.SuccessData(ctx, http.StatusOK, res.Response)
}

func (h *AuthHandler) Refresh(ctx *gin.Context) {
	tokenRaw, _ := ctx.Cookie(refreshCookieName)
	if tokenRaw == "" {
		var input dto.RefreshRequest
		// omitempty nen khong can check loi
		ctx.ShouldBindJSON(&input)
		tokenRaw = input.RefreshToken
	}
	if tokenRaw == "" {
		utils.AbortError(ctx, http.StatusUnauthorized, "invalid_refresh_token", "Please sign in again")
		return
	}
	res, err := h.svc.Refresh(ctx.Request.Context(), tokenRaw)
	if err != nil {
		if errors.Is(err, service.ErrInvalidRefreshToken) {
			h.clearRefreshCookie(ctx)
			utils.AbortAppError(ctx, err)
			return
		}
		utils.AbortAppError(ctx, err)
		return
	}
	h.setRefreshCookie(ctx, res.RefreshToken, res.RefreshExpiresAt)
	utils.SuccessData(ctx, http.StatusOK, res.Response)
}

func (h *AuthHandler) Logout(ctx *gin.Context) {
	h.svc.Logout(ctx.Request.Context())
}

func (h *AuthHandler) setRefreshCookie(ctx *gin.Context, token string, exp time.Time) {
	maxAge := int(time.Until(exp).Seconds())
	if maxAge < 0 {
		maxAge = 0
	}
	ctx.SetSameSite(http.SameSiteNoneMode)
	ctx.SetCookie(
		refreshCookieName,
		token,
		maxAge,
		refreshCookiePath,
		h.cfg.JWT.CookieDomain,
		h.cfg.JWT.CookieSecure,
		true,
	)
}

func (h *AuthHandler) clearRefreshCookie(ctx *gin.Context) {
	ctx.SetSameSite(http.SameSiteNoneMode)
	ctx.SetCookie(
		refreshCookieName,
		"",
		-1,
		refreshCookiePath,
		h.cfg.JWT.CookieDomain,
		h.cfg.JWT.CookieSecure,
		true,
	)
}
