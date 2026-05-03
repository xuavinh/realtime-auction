package validation

import "github.com/go-playground/validator/v10"

func registerCustom(v *validator.Validate) {

}

func messageFor(fe validator.FieldError) string {
	return ""
}
