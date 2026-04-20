package handler

import "xuanvinh/internal/service"

type AuthHandler struct {
	authService service.AuthUseCase
}

func NewAuthHandler(authService service.AuthUseCase) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

func (h *AuthHandler) Register() {
	h.authService.Register()
}

func (h *AuthHandler) Login() {
	h.authService.Login()
}
