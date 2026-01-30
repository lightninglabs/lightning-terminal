package scripting

import (
	"encoding/json"
	"fmt"
	"time"

	"go.starlark.net/starlark"
)

// registerStandardBuiltins adds the standard builtin functions to the
// predeclared dictionary.
func (e *Engine) registerStandardBuiltins(predeclared starlark.StringDict) {
	// print(msg) - Print a message to the log.
	predeclared["print"] = starlark.NewBuiltin("print", e.builtinPrint)

	// log(level, msg) - Log a message at the specified level.
	predeclared["log"] = starlark.NewBuiltin("log", e.builtinLog)

	// sleep(seconds) - Pause execution for the specified duration.
	predeclared["sleep"] = starlark.NewBuiltin("sleep", e.builtinSleep)

	// now() - Return the current Unix timestamp.
	predeclared["now"] = starlark.NewBuiltin("now", e.builtinNow)

	// json_encode(value) - Encode a value as JSON.
	predeclared["json_encode"] = starlark.NewBuiltin("json_encode", e.builtinJSONEncode)

	// json_decode(string) - Decode a JSON string.
	predeclared["json_decode"] = starlark.NewBuiltin("json_decode", e.builtinJSONDecode)
}

// builtinPrint implements print(msg).
func (e *Engine) builtinPrint(thread *starlark.Thread, fn *starlark.Builtin,
	args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {

	var msg string
	if err := starlark.UnpackArgs("print", args, kwargs, "msg", &msg); err != nil {
		// If unpacking fails, try to print all arguments.
		parts := make([]string, len(args))
		for i, arg := range args {
			parts[i] = arg.String()
		}
		msg = fmt.Sprint(parts)
	}

	// Log the message and also store it in execution output.
	log.Infof("[script:%s] %s", e.scriptName, msg)

	if e.outputCallback != nil {
		e.outputCallback("print", msg)
	}

	return starlark.None, nil
}

// builtinLog implements log(level, msg).
func (e *Engine) builtinLog(thread *starlark.Thread, fn *starlark.Builtin,
	args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {

	var level, msg string
	if err := starlark.UnpackArgs("log", args, kwargs,
		"level", &level, "msg", &msg); err != nil {
		return nil, err
	}

	// Log at the appropriate level.
	switch level {
	case "debug":
		log.Debugf("[script:%s] %s", e.scriptName, msg)
	case "info":
		log.Infof("[script:%s] %s", e.scriptName, msg)
	case "warn", "warning":
		log.Warnf("[script:%s] %s", e.scriptName, msg)
	case "error":
		log.Errorf("[script:%s] %s", e.scriptName, msg)
	default:
		log.Infof("[script:%s] [%s] %s", e.scriptName, level, msg)
	}

	if e.outputCallback != nil {
		e.outputCallback(level, msg)
	}

	return starlark.None, nil
}

// builtinSleep implements sleep(seconds).
func (e *Engine) builtinSleep(thread *starlark.Thread, fn *starlark.Builtin,
	args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {

	var seconds starlark.Value
	if err := starlark.UnpackArgs("sleep", args, kwargs,
		"seconds", &seconds); err != nil {
		return nil, err
	}

	var duration time.Duration
	switch v := seconds.(type) {
	case starlark.Int:
		i64, ok := v.Int64()
		if !ok {
			return nil, fmt.Errorf("sleep duration too large")
		}
		duration = time.Duration(i64) * time.Second
	case starlark.Float:
		duration = time.Duration(float64(v) * float64(time.Second))
	default:
		return nil, fmt.Errorf("sleep requires int or float, got %s", seconds.Type())
	}

	if err := e.sandbox.Sleep(duration); err != nil {
		return nil, err
	}

	return starlark.None, nil
}

// builtinNow implements now().
func (e *Engine) builtinNow(thread *starlark.Thread, fn *starlark.Builtin,
	args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {

	if err := starlark.UnpackArgs("now", args, kwargs); err != nil {
		return nil, err
	}

	return starlark.MakeInt64(time.Now().Unix()), nil
}

// builtinJSONEncode implements json_encode(value).
func (e *Engine) builtinJSONEncode(thread *starlark.Thread, fn *starlark.Builtin,
	args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {

	var value starlark.Value
	if err := starlark.UnpackArgs("json_encode", args, kwargs,
		"value", &value); err != nil {
		return nil, err
	}

	// Convert Starlark value to Go value.
	goVal, err := fromStarlarkValue(value)
	if err != nil {
		return nil, fmt.Errorf("cannot encode value: %w", err)
	}

	// Encode to JSON.
	jsonBytes, err := json.Marshal(goVal)
	if err != nil {
		return nil, fmt.Errorf("json encoding failed: %w", err)
	}

	return starlark.String(jsonBytes), nil
}

// builtinJSONDecode implements json_decode(string).
func (e *Engine) builtinJSONDecode(thread *starlark.Thread, fn *starlark.Builtin,
	args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {

	var jsonStr string
	if err := starlark.UnpackArgs("json_decode", args, kwargs,
		"value", &jsonStr); err != nil {
		return nil, err
	}

	// Decode JSON to Go value.
	var goVal interface{}
	if err := json.Unmarshal([]byte(jsonStr), &goVal); err != nil {
		return nil, fmt.Errorf("json decoding failed: %w", err)
	}

	// Convert to Starlark value.
	return toStarlarkValue(goVal)
}
