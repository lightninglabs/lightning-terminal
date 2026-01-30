package scripting

import (
	"encoding/json"
	"fmt"
	"sort"

	"go.starlark.net/starlark"
)

// toStarlarkValue converts a Go value to a Starlark value.
func toStarlarkValue(v interface{}) (starlark.Value, error) {
	switch val := v.(type) {
	case nil:
		return starlark.None, nil
	case bool:
		return starlark.Bool(val), nil
	case int:
		return starlark.MakeInt(val), nil
	case int32:
		return starlark.MakeInt(int(val)), nil
	case int64:
		return starlark.MakeInt64(val), nil
	case uint:
		return starlark.MakeUint(val), nil
	case uint32:
		return starlark.MakeUint(uint(val)), nil
	case uint64:
		return starlark.MakeUint64(val), nil
	case float32:
		return starlark.Float(val), nil
	case float64:
		return starlark.Float(val), nil
	case string:
		return starlark.String(val), nil
	case []byte:
		return starlark.Bytes(val), nil
	case []interface{}:
		list := make([]starlark.Value, len(val))
		for i, item := range val {
			sv, err := toStarlarkValue(item)
			if err != nil {
				return nil, err
			}
			list[i] = sv
		}
		return starlark.NewList(list), nil
	case map[string]interface{}:
		dict := starlark.NewDict(len(val))
		for k, v := range val {
			sv, err := toStarlarkValue(v)
			if err != nil {
				return nil, err
			}
			if err := dict.SetKey(starlark.String(k), sv); err != nil {
				return nil, err
			}
		}
		return dict, nil
	default:
		// Try JSON marshaling as a fallback for complex types.
		jsonBytes, err := json.Marshal(val)
		if err != nil {
			return nil, fmt.Errorf("cannot convert %T to starlark value", v)
		}
		var generic interface{}
		if err := json.Unmarshal(jsonBytes, &generic); err != nil {
			return nil, fmt.Errorf("cannot convert %T to starlark value", v)
		}
		return toStarlarkValue(generic)
	}
}

// fromStarlarkValue converts a Starlark value to a Go value.
func fromStarlarkValue(v starlark.Value) (interface{}, error) {
	switch val := v.(type) {
	case starlark.NoneType:
		return nil, nil
	case starlark.Bool:
		return bool(val), nil
	case starlark.Int:
		i64, ok := val.Int64()
		if ok {
			return i64, nil
		}
		u64, ok := val.Uint64()
		if ok {
			return u64, nil
		}
		return val.BigInt(), nil
	case starlark.Float:
		return float64(val), nil
	case starlark.String:
		return string(val), nil
	case starlark.Bytes:
		return []byte(val), nil
	case *starlark.List:
		result := make([]interface{}, val.Len())
		for i := 0; i < val.Len(); i++ {
			gv, err := fromStarlarkValue(val.Index(i))
			if err != nil {
				return nil, err
			}
			result[i] = gv
		}
		return result, nil
	case starlark.Tuple:
		result := make([]interface{}, len(val))
		for i, item := range val {
			gv, err := fromStarlarkValue(item)
			if err != nil {
				return nil, err
			}
			result[i] = gv
		}
		return result, nil
	case *starlark.Dict:
		result := make(map[string]interface{})
		for _, item := range val.Items() {
			key, ok := item[0].(starlark.String)
			if !ok {
				return nil, fmt.Errorf("dict key must be string, got %T", item[0])
			}
			gv, err := fromStarlarkValue(item[1])
			if err != nil {
				return nil, err
			}
			result[string(key)] = gv
		}
		return result, nil
	case *starlark.Set:
		result := make([]interface{}, 0)
		iter := val.Iterate()
		defer iter.Done()
		var x starlark.Value
		for iter.Next(&x) {
			gv, err := fromStarlarkValue(x)
			if err != nil {
				return nil, err
			}
			result = append(result, gv)
		}
		return result, nil
	default:
		// For custom types, try to get their string representation.
		return val.String(), nil
	}
}

// StarlarkDict is a helper to build Starlark dictionaries.
type StarlarkDict struct {
	dict *starlark.Dict
}

// NewStarlarkDict creates a new StarlarkDict.
func NewStarlarkDict() *StarlarkDict {
	return &StarlarkDict{dict: starlark.NewDict(0)}
}

// Set adds a key-value pair to the dictionary.
func (d *StarlarkDict) Set(key string, value interface{}) error {
	sv, err := toStarlarkValue(value)
	if err != nil {
		return err
	}
	return d.dict.SetKey(starlark.String(key), sv)
}

// SetStarlark adds a Starlark value directly.
func (d *StarlarkDict) SetStarlark(key string, value starlark.Value) error {
	return d.dict.SetKey(starlark.String(key), value)
}

// Dict returns the underlying starlark.Dict.
func (d *StarlarkDict) Dict() *starlark.Dict {
	return d.dict
}

// StarlarkModule creates a Starlark module with the given name and members.
type StarlarkModule struct {
	name    string
	members starlark.StringDict
}

// NewStarlarkModule creates a new module.
func NewStarlarkModule(name string) *StarlarkModule {
	return &StarlarkModule{
		name:    name,
		members: make(starlark.StringDict),
	}
}

// AddFunc adds a builtin function to the module.
func (m *StarlarkModule) AddFunc(name string, fn *starlark.Builtin) {
	m.members[name] = fn
}

// AddValue adds a value to the module.
func (m *StarlarkModule) AddValue(name string, value starlark.Value) {
	m.members[name] = value
}

// Struct returns the module as a starlark.StringDict suitable for use as a
// predeclared value.
func (m *StarlarkModule) Struct() *starlarkStruct {
	return &starlarkStruct{
		name:    m.name,
		members: m.members,
	}
}

// starlarkStruct implements starlark.Value and starlark.HasAttrs for a module.
type starlarkStruct struct {
	name    string
	members starlark.StringDict
}

var (
	_ starlark.Value    = (*starlarkStruct)(nil)
	_ starlark.HasAttrs = (*starlarkStruct)(nil)
)

func (s *starlarkStruct) String() string        { return fmt.Sprintf("<%s module>", s.name) }
func (s *starlarkStruct) Type() string          { return "module" }
func (s *starlarkStruct) Freeze()               { s.members.Freeze() }
func (s *starlarkStruct) Truth() starlark.Bool  { return true }
func (s *starlarkStruct) Hash() (uint32, error) { return 0, fmt.Errorf("unhashable: module") }

func (s *starlarkStruct) Attr(name string) (starlark.Value, error) {
	if v, ok := s.members[name]; ok {
		return v, nil
	}
	return nil, starlark.NoSuchAttrError(
		fmt.Sprintf("module '%s' has no attribute '%s'", s.name, name),
	)
}

func (s *starlarkStruct) AttrNames() []string {
	names := make([]string, 0, len(s.members))
	for name := range s.members {
		names = append(names, name)
	}
	sort.Strings(names)
	return names
}
