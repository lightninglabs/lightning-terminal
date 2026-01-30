package scripting

import (
	"context"
	"encoding/json"
	"fmt"
	"sync"

	"go.starlark.net/starlark"
	"go.starlark.net/syntax"
)

// OutputCallback is called when the script produces output.
type OutputCallback func(level, message string)

// RPCCaller is the interface for making RPC calls from scripts.
type RPCCaller interface {
	// Call invokes an RPC method with the given request and returns the
	// response.
	Call(ctx context.Context, method string, req interface{}) (interface{}, error)
}

// EngineConfig contains configuration for the Starlark engine.
type EngineConfig struct {
	// ScriptName is the name of the script being executed.
	ScriptName string

	// Source is the Starlark source code.
	Source string

	// Macaroon is the hex-encoded macaroon for RPC authentication.
	Macaroon string

	// AllowedURLs is the list of URL patterns the script can access.
	AllowedURLs []string

	// AllowedBuckets is the list of KV buckets the script can access.
	AllowedBuckets []string

	// Limits are the resource limits for the script.
	Limits ResourceLimits

	// KVStore is the key-value store for script state.
	KVStore KVStore

	// RPCCaller is used to make RPC calls.
	RPCCaller RPCCaller

	// OutputCallback is called when the script produces output.
	OutputCallback OutputCallback
}

// Engine executes Starlark scripts in a sandboxed environment.
type Engine struct {
	scriptName     string
	source         string
	macaroon       string
	allowedURLs    []string
	allowedBuckets []string

	sandbox        *Sandbox
	kvStore        KVStore
	rpcCaller      RPCCaller
	outputCallback OutputCallback

	// thread is the Starlark execution thread.
	thread *starlark.Thread

	// globals holds the script's global variables after execution.
	globals starlark.StringDict

	// predeclared holds the predeclared functions and modules.
	predeclared starlark.StringDict

	// mu protects concurrent access to engine state.
	mu sync.Mutex

	// subscriptionWg tracks active subscription goroutines.
	subscriptionWg sync.WaitGroup

	// subscriptionHandlers stores handlers for subscription events.
	subscriptionHandlers map[string]starlark.Callable
}

// NewEngine creates a new Starlark execution engine.
func NewEngine(ctx context.Context, cfg EngineConfig) *Engine {
	sandbox := NewSandbox(ctx, cfg.Limits)

	e := &Engine{
		scriptName:           cfg.ScriptName,
		source:               cfg.Source,
		macaroon:             cfg.Macaroon,
		allowedURLs:          cfg.AllowedURLs,
		allowedBuckets:       cfg.AllowedBuckets,
		sandbox:              sandbox,
		kvStore:              cfg.KVStore,
		rpcCaller:            cfg.RPCCaller,
		outputCallback:       cfg.OutputCallback,
		subscriptionHandlers: make(map[string]starlark.Callable),
	}

	// Build predeclared functions.
	e.predeclared = make(starlark.StringDict)
	e.registerStandardBuiltins(e.predeclared)
	e.registerHTTPBuiltins(e.predeclared)
	e.registerKVBuiltins(e.predeclared)

	return e
}

// Execute runs the script and calls main() with optional arguments.
func (e *Engine) Execute(args map[string]interface{}) (*ExecutionResult, error) {
	e.mu.Lock()
	defer e.mu.Unlock()

	// Create the execution thread.
	e.thread = &starlark.Thread{
		Name: fmt.Sprintf("script:%s", e.scriptName),
		Print: func(thread *starlark.Thread, msg string) {
			log.Infof("[script:%s] %s", e.scriptName, msg)
			if e.outputCallback != nil {
				e.outputCallback("print", msg)
			}
		},
	}

	// Set up cancellation check.
	e.thread.SetLocal("sandbox", e.sandbox)

	// Execute the script file to define functions.
	globals, err := starlark.ExecFileOptions(
		&syntax.FileOptions{},
		e.thread,
		e.scriptName+".star",
		e.source,
		e.predeclared,
	)
	if err != nil {
		return nil, fmt.Errorf("script execution failed: %w", err)
	}

	e.globals = globals

	// Look for main() function.
	mainFn, ok := globals["main"]
	if !ok {
		// No main function, script just defines variables/functions.
		return &ExecutionResult{
			Success: true,
			Output:  "Script executed (no main function)",
		}, nil
	}

	callable, ok := mainFn.(starlark.Callable)
	if !ok {
		return nil, fmt.Errorf("main is not callable")
	}

	// Convert args to Starlark kwargs.
	var kwargs []starlark.Tuple
	if args != nil {
		for k, v := range args {
			sv, err := toStarlarkValue(v)
			if err != nil {
				return nil, fmt.Errorf("cannot convert arg %s: %w", k, err)
			}
			kwargs = append(kwargs, starlark.Tuple{
				starlark.String(k), sv,
			})
		}
	}

	// Call main().
	result, err := starlark.Call(e.thread, callable, nil, kwargs)
	if err != nil {
		if evalErr, ok := err.(*starlark.EvalError); ok {
			return &ExecutionResult{
				Success: false,
				Error:   evalErr.Error(),
			}, nil
		}
		return nil, fmt.Errorf("main() failed: %w", err)
	}

	// Convert result to JSON.
	var resultJSON string
	if result != starlark.None {
		goResult, err := fromStarlarkValue(result)
		if err != nil {
			resultJSON = result.String()
		} else {
			jsonBytes, err := json.Marshal(goResult)
			if err != nil {
				resultJSON = result.String()
			} else {
				resultJSON = string(jsonBytes)
			}
		}
	}

	return &ExecutionResult{
		Success:    true,
		ResultJSON: resultJSON,
	}, nil
}

// Stop gracefully stops the script execution.
func (e *Engine) Stop() {
	e.sandbox.Stop()

	// Wait for subscription goroutines to finish.
	e.subscriptionWg.Wait()
}

// Context returns the sandbox context.
func (e *Engine) Context() context.Context {
	return e.sandbox.Context()
}

// IsStopped returns whether the engine has been stopped.
func (e *Engine) IsStopped() bool {
	return e.sandbox.IsStopped()
}

// RegisterSubscriptionHandler registers a Starlark callback for a subscription.
func (e *Engine) RegisterSubscriptionHandler(name string, handler starlark.Callable) {
	e.mu.Lock()
	defer e.mu.Unlock()
	e.subscriptionHandlers[name] = handler
}

// CallHandler safely calls a Starlark handler function.
func (e *Engine) CallHandler(handler starlark.Callable, args ...starlark.Value) error {
	e.mu.Lock()
	defer e.mu.Unlock()

	if e.sandbox.IsStopped() {
		return context.Canceled
	}

	_, err := starlark.Call(e.thread, handler, args, nil)
	if err != nil {
		if evalErr, ok := err.(*starlark.EvalError); ok {
			log.Errorf("[script:%s] handler error: %s", e.scriptName, evalErr.Error())
		}
		return err
	}

	return nil
}

// AddSubscriptionGoroutine adds a goroutine to the subscription wait group.
func (e *Engine) AddSubscriptionGoroutine() {
	e.subscriptionWg.Add(1)
}

// DoneSubscriptionGoroutine marks a subscription goroutine as done.
func (e *Engine) DoneSubscriptionGoroutine() {
	e.subscriptionWg.Done()
}

// GetGlobal returns a global variable from the script.
func (e *Engine) GetGlobal(name string) (starlark.Value, bool) {
	e.mu.Lock()
	defer e.mu.Unlock()

	if e.globals == nil {
		return nil, false
	}

	val, ok := e.globals[name]
	return val, ok
}

// ExecutionResult contains the result of script execution.
type ExecutionResult struct {
	// Success indicates if the script executed successfully.
	Success bool

	// ResultJSON is the JSON-encoded return value of main().
	ResultJSON string

	// Output contains any print/log output.
	Output string

	// Error contains the error message if execution failed.
	Error string
}
