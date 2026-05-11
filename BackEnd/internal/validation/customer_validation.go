package validation

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"
	"unicode"

	"github.com/go-playground/validator/v10"
)

var (
	slugRegex    = regexp.MustCompile(`^[a-z0-9]+(?:[-.][a-z0-9]+)*$`)
	searchRegex  = regexp.MustCompile(`^[a-zA-Z0-9\s]+$`)
	lowerRegex   = regexp.MustCompile(`[a-z]`)
	upperRegex   = regexp.MustCompile(`[A-Z]`)
	digitRegex   = regexp.MustCompile(`[0-9]`)
	specialRegex = regexp.MustCompile(`[!@#\$%\^&\*\(\)_\+\-=\[\]\{\};:'",.<>?/\\|]`)
)

func registerCustom(v *validator.Validate) {
	v.RegisterValidation("password", func(fl validator.FieldLevel) bool {
		s := fl.Field().String()
		if len(s) < 8 || len(s) > 72 {
			return false
		}
		var hasUpper, hasLower, hasDigit bool
		for _, r := range s {
			switch {
			case unicode.IsUpper(r):
				hasUpper = true
			case unicode.IsLower(r):
				hasLower = true
			case unicode.IsDigit(r):
				hasDigit = true
			}
		}
		return hasUpper && hasLower && hasDigit
	})

	v.RegisterValidation("password_strong", func(fl validator.FieldLevel) bool {
		password := fl.Field().String()
		if len(password) < 8 {
			return false
		}
		return lowerRegex.MatchString(password) &&
			upperRegex.MatchString(password) &&
			digitRegex.MatchString(password) &&
			specialRegex.MatchString(password)
	})

	v.RegisterValidation("slug", func(fl validator.FieldLevel) bool {
		return slugRegex.MatchString(fl.Field().String())
	})
	v.RegisterValidation("search", func(fl validator.FieldLevel) bool {
		return searchRegex.MatchString(fl.Field().String())
	})
	v.RegisterValidation("min_int", func(fl validator.FieldLevel) bool {
		minVal, err := strconv.ParseInt(fl.Param(), 10, 64)
		if err != nil {
			return false
		}
		return fl.Field().Int() >= minVal
	})
	v.RegisterValidation("max_int", func(fl validator.FieldLevel) bool {
		maxVal, err := strconv.ParseInt(fl.Param(), 10, 64)
		if err != nil {
			return false
		}
		return fl.Field().Int() <= maxVal
	})
}
func messageFor(fe validator.FieldError, field string) string {
	tag := fe.Tag()
	switch field {
	case "email":
		switch tag {
		case "required":
			return "Email is required"
		case "email":
			return "Invalid email"
		case "max":
			return "Email must be at most 100 characters"
		}
	case "password":
		switch tag {
		case "required":
			return "Password is required"
		case "password":
			return "Password must be 8-72 characters and include uppercase, lowercase, and a number"
		}
	case "full_name":
		switch tag {
		case "required":
			return "Full name is required"
		case "min", "max":
			return "Full name must be 2-100 characters"
		}
	}

	// Fallback generic
	switch tag {
	case "required":
		return fmt.Sprintf("%s is required", field)
	case "email":
		return "Invalid email"
	case "min":
		unit := minMaxUnit(fe)
		if unit == "" {
			return fmt.Sprintf("%s must be >= %s", field, fe.Param())
		}
		return fmt.Sprintf("%s must be at least %s %s", field, fe.Param(), unit)
	case "max":
		unit := minMaxUnit(fe)
		if unit == "" {
			return fmt.Sprintf("%s must be <= %s", field, fe.Param())
		}
		return fmt.Sprintf("%s must be at most %s %s", field, fe.Param(), unit)
	case "gt":
		return fmt.Sprintf("%s must be greater than %s", field, fe.Param())
	case "lt":
		return fmt.Sprintf("%s must be less than %s", field, fe.Param())
	case "gte":
		return fmt.Sprintf("%s must be greater than or equal to %s", field, fe.Param())
	case "lte":
		return fmt.Sprintf("%s must be less than or equal to %s", field, fe.Param())
	case "uuid":
		return fmt.Sprintf("%s must be a valid UUID", field)
	case "slug":
		return fmt.Sprintf("%s can only contain lowercase letters, numbers, hyphens, or dots", field)
	case "min_int":
		return fmt.Sprintf("%s must be greater than or equal to %d", field, parseIntSafe(fe.Param()))
	case "max_int":
		return fmt.Sprintf("%s must be less than or equal to %d", field, parseIntSafe(fe.Param()))
	case "oneof":
		return fmt.Sprintf("%s must be one of: %s", field, strings.Join(strings.Split(fe.Param(), " "), ", "))
	case "search":
		return fmt.Sprintf("%s can only contain letters, numbers, and spaces", field)
	case "datetime":
		return fmt.Sprintf("%s must be in YYYY-MM-DD format", field)
	case "email_advanced":
		return fmt.Sprintf("%s has a disallowed domain", field)
	case "password_strong":
		return fmt.Sprintf("%s must be at least 8 characters and include lowercase, uppercase, number, and special character", field)
	case "file_ext":
		return fmt.Sprintf("%s only allows extensions: %s", field, strings.Join(strings.Split(fe.Param(), " "), ", "))
	case "decimal_string":
		return fmt.Sprintf("%s must be a decimal > 0 with up to 4 fractional digits", field)
	default:
		return fmt.Sprintf("%s is invalid", field)
	}
}
