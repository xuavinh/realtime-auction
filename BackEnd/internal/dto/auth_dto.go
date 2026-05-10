package dto

type RegisterRequest struct {
	Email    string `json:"email"     validate:"required,email,max=100"`
	Password string `json:"password"  validate:"required,password"`
	FullName string `json:"full_name" validate:"required,min=2,max=100"`
}

type RegisterResponse struct {
	UserUUID string `json:"user_uuid"`
	Email    string `json:"email"`
	FullName string `json:"full_name"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email,max=100"`
	Password string `json:"password" validate:"required,min=8,max=72"`
}

type LoginResponse struct {
	UserUUID    string `json:"user_uuid"`
	AccessToken string `json:"access_token"`
	ExpiresIn   int64  `json:"expires_in"`
}

// optional
type RefreshRequest struct {
	RefreshToken string `json:"refresh_token,omitempty"`
}

type RefreshResponse struct {
	UserUUID    string `json:"user_uuid"`
	AccessToken string `json:"access_token"`
	ExpiresIn   int64  `json:"expires_in"`
}

type LogoutMessage struct {
	Message string `json:"message"`
}
