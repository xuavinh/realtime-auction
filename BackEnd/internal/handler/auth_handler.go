package handler

import (
	"context"
	"net/http"
	"xuanvinh/internal/config"
	"xuanvinh/internal/dto"
	"xuanvinh/internal/service"
	"xuanvinh/internal/utils"
	"xuanvinh/internal/validation"

	"github.com/gin-gonic/gin"
)

type authService interface {
	Register(ctx context.Context, in dto.RegisterRequest) (dto.RegisterResponse, error)
	Login(ctx context.Context, in dto.LoginRequest) (service.LoginResult, error)
	Refresh(ctx context.Context)
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
	utils.SuccessData(ctx, http.StatusOK, res.Response)
}

func (h *AuthHandler) Refresh(ctx *gin.Context) {
	h.svc.Refresh(ctx.Request.Context())
}

func (h *AuthHandler) Logout(ctx *gin.Context) {
	h.svc.Logout(ctx.Request.Context())
}
