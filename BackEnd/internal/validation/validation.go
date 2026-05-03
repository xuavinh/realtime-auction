package validation

import (
	"errors"
	"reflect"
	"strings"
	"xuanvinh/internal/utils"

	"github.com/go-playground/validator/v10"
)

type Validator struct {
	v *validator.Validate
}

func New() *Validator {
	v := validator.New(validator.WithRequiredStructEnabled())

	v.RegisterTagNameFunc(func(fld reflect.StructField) string {
		name := strings.SplitN(fld.Tag.Get("json"), ",", 2)[0]
		if name == "-" || name == "" {
			return fld.Name
		}
		return name
	})
	registerCustom(v)
	return &Validator{v: v}
}

func (vd *Validator) Struct(s any) error {
	return vd.v.Struct(s)
}

func (vd *Validator) Translate(err error) []utils.ErrDetail {
	var ve validator.ValidationErrors
	if !errors.As(err, &ve) {
		return []utils.ErrDetail{{Field: "", Message: err.Error()}}
	}

	out := make([]utils.ErrDetail, 0, len(ve))
	for _, fe := range ve {
		out = append(out, utils.ErrDetail{
			Field:   fe.Field(),
			Message: messageFor(fe),
		})
	}
	return out
}
