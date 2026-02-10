package scripting

import (
	"fmt"

	"go.starlark.net/resolve"
	"go.starlark.net/starlark"
	"go.starlark.net/syntax"
)

func init() {
	// Enable useful Starlark features.
	resolve.AllowSet = true
	resolve.AllowLambda = true
	resolve.AllowRecursion = true
}

// ValidationResult contains the result of script validation.
type ValidationResult struct {
	// Valid indicates if the script is syntactically valid.
	Valid bool

	// Error contains the error message if validation failed.
	Error string

	// Warnings contains non-fatal issues found during validation.
	Warnings []string

	// Functions lists the top-level functions defined in the script.
	Functions []string

	// HasMain indicates if the script has a main() function.
	HasMain bool
}

// ValidateScript checks if a Starlark script is syntactically valid.
func ValidateScript(source string) *ValidationResult {
	result := &ValidationResult{
		Warnings:  make([]string, 0),
		Functions: make([]string, 0),
	}

	// Parse the script.
	f, err := syntax.Parse("script.star", source, 0)
	if err != nil {
		result.Valid = false
		result.Error = fmt.Sprintf("syntax error: %v", err)
		return result
	}

	// Check for top-level function definitions.
	for _, stmt := range f.Stmts {
		if def, ok := stmt.(*syntax.DefStmt); ok {
			result.Functions = append(result.Functions, def.Name.Name)
			if def.Name.Name == "main" {
				result.HasMain = true
			}
		}
	}

	// Try to compile the script with our predeclared names to catch
	// resolution errors.
	predeclared := getValidationPredeclared()

	_, err = starlark.ExecFileOptions(
		&syntax.FileOptions{},
		&starlark.Thread{Name: "validator"},
		"script.star",
		source,
		predeclared,
	)

	if err != nil {
		// Check if it's a runtime error vs a compile error.
		if _, ok := err.(*starlark.EvalError); ok {
			// Runtime errors during validation are okay - the script
			// may depend on runtime values.
			result.Valid = true
			result.Warnings = append(result.Warnings,
				fmt.Sprintf("runtime warning: %v", err))
		} else {
			result.Valid = false
			result.Error = fmt.Sprintf("compile error: %v", err)
			return result
		}
	} else {
		result.Valid = true
	}

	// Add warnings for common issues.
	if !result.HasMain {
		result.Warnings = append(result.Warnings,
			"script does not define a main() function")
	}

	return result
}

// getValidationPredeclared returns a minimal set of predeclared names for
// validation. These are stubs that allow the validator to check that scripts
// reference valid builtins.
func getValidationPredeclared() starlark.StringDict {
	// Create stub functions for all our builtins.
	stubFunc := starlark.NewBuiltin("stub", func(
		thread *starlark.Thread,
		fn *starlark.Builtin,
		args starlark.Tuple,
		kwargs []starlark.Tuple,
	) (starlark.Value, error) {
		return starlark.None, nil
	})

	predeclared := starlark.StringDict{
		// Standard builtins.
		"print":       stubFunc,
		"log":         stubFunc,
		"sleep":       stubFunc,
		"now":         stubFunc,
		"json_encode": stubFunc,
		"json_decode": stubFunc,

		// HTTP builtins.
		"http_get": stubFunc,

		// KV builtins.
		"kv_get":    stubFunc,
		"kv_put":    stubFunc,
		"kv_delete": stubFunc,
		"kv_list":   stubFunc,
	}

	// Create stub modules for RPC namespaces.
	for _, moduleName := range []string{"lnd", "loop", "pool", "faraday", "taproot_assets"} {
		module := NewStarlarkModule(moduleName)
		// Add common stub methods.
		module.AddFunc("__stub__", stubFunc)
		predeclared[moduleName] = module.Struct()
	}

	return predeclared
}

// ValidateScriptSource is a simpler validation that only checks syntax.
func ValidateScriptSource(source string) error {
	_, err := syntax.Parse("script.star", source, 0)
	if err != nil {
		return fmt.Errorf("syntax error: %w", err)
	}
	return nil
}
