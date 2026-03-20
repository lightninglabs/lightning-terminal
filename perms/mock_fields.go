package perms

import "reflect"

// setFieldIfPresent sets a struct field when it exists on the given config.
func setFieldIfPresent(cfg interface{}, fieldName string, value interface{}) {
	cfgValue := reflect.ValueOf(cfg)
	if cfgValue.Kind() != reflect.Ptr || cfgValue.IsNil() {
		return
	}

	elem := cfgValue.Elem()
	if elem.Kind() != reflect.Struct {
		return
	}

	field := elem.FieldByName(fieldName)
	if !field.IsValid() || !field.CanSet() {
		return
	}

	if value == nil {
		if isNillable(field.Kind()) {
			field.Set(reflect.Zero(field.Type()))
		}
		return
	}

	valueField := reflect.ValueOf(value)

	if valueField.Type().AssignableTo(field.Type()) {
		field.Set(valueField)
		return
	}

	if valueField.Type().ConvertibleTo(field.Type()) {
		field.Set(valueField.Convert(field.Type()))
	}
}

func isNillable(kind reflect.Kind) bool {
	switch kind {
	case reflect.Chan, reflect.Func, reflect.Interface, reflect.Map, reflect.Ptr, reflect.Slice, reflect.UnsafePointer:
		return true
	default:
		return false
	}
}
