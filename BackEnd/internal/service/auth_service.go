package service

import "github.com/gin-gonic/gin"

type userRepo interface {
}

type AuthService struct {
	users userRepo
}

func NewAuthService(users userRepo) *AuthService {
	return &AuthService{
		users: users,
	}
}

func (s *AuthService) Register(ctx *gin.Context) {

}

func (s *AuthService) Login(ctx *gin.Context) {

}

func (s *AuthService) Refresh(ctx *gin.Context) {

}

func (s *AuthService) Logout(ctx *gin.Context) {

}
