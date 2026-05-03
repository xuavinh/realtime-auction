package handler

import (
	"xuanvinh/internal/config"
	"xuanvinh/internal/validation"

	"github.com/gin-gonic/gin"
)

type authService interface {
	Register(ctx *gin.Context)
	Login(ctx *gin.Context)
	Refresh(ctx *gin.Context)
	Logout(ctx *gin.Context)
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
	h.svc.Register(ctx)
}

func (h *AuthHandler) Login(ctx *gin.Context) {
	h.svc.Login(ctx)
}

func (h *AuthHandler) Refresh(ctx *gin.Context) {
	h.svc.Refresh(ctx)
}

func (h *AuthHandler) Logout(ctx *gin.Context) {
	h.svc.Logout(ctx)
}
