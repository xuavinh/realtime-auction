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
