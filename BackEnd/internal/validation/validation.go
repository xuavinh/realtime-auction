package validation

import (
	"errors"
	"reflect"
	"strconv"
	"strings"
	"unicode"
	"xuanvinh/internal/utils"

	"github.com/go-playground/validator/v10"
)

type Validator struct {
	v *validator.Validate
}

func New() *Validator {
	v := validator.New(validator.WithRequiredStructEnabled())

	registerCustom(v)

	return &Validator{
		v: v,
	}
}

func (vd *Validator) Struct(s any) error {
	return vd.v.Struct(s)
}

func (vd *Validator) Translate(err error) []utils.ErrorDetail {
	var ve validator.ValidationErrors

	if !errors.As(err, &ve) {
		return []utils.ErrorDetail{{
			Field:   "",
			Message: err.Error(),
		}}
	}

	out := make([]utils.ErrorDetail, 0, len(ve))

	for _, fe := range ve {
		field := toSnakePath(fe.Namespace())

		out = append(out, utils.ErrorDetail{
			Field:   field,
			Message: messageFor(fe, field),
		})
	}

	return out
}

// RegisterRequest.Items[0].UnitPrice
// -> items[0].unit_price
func toSnakePath(ns string) string {
	if ns == "" {
		return ""
	}

	parts := strings.Split(ns, ".")

	if len(parts) <= 1 {
		return toSnakeWithIndex(ns)
	}

	// bỏ root struct name
	parts = parts[1:]

	for i := range parts {
		parts[i] = toSnakeWithIndex(parts[i])
	}

	return strings.Join(parts, ".")
}

func toSnakeWithIndex(s string) string {
	if idx := strings.Index(s, "["); idx >= 0 {
		return camelToSnake(s[:idx]) + s[idx:]
	}

	return camelToSnake(s)
}

func camelToSnake(s string) string {
	if s == "" {
		return s
	}

	var b strings.Builder
	b.Grow(len(s) + 4)

	for i, r := range s {
		if unicode.IsUpper(r) {
			if i > 0 {
				b.WriteByte('_')
			}

			b.WriteRune(unicode.ToLower(r))
			continue
		}

		b.WriteRune(unicode.ToLower(r))
	}

	return b.String()
}

func minMaxUnit(fe validator.FieldError) string {
	switch fe.Kind() {

	case reflect.String:
		return "ký tự"

	case reflect.Slice, reflect.Array, reflect.Map:
		return "phần tử"

	default:
		return ""
	}
}

func parseIntSafe(s string) int64 {
	n, _ := strconv.ParseInt(s, 10, 64)
	return n
}
