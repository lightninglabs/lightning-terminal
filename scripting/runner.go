package scripting

import (
	"context"
	"sync"
)

// Runner manages the lifecycle of a running script.
type Runner struct {
	manager     *Manager
	script      *Script
	executionID int64
	kvStore     KVStore
	rpcCaller   RPCCaller

	engine *Engine
	ctx    context.Context
	cancel context.CancelFunc

	mu      sync.Mutex
	stopped bool
	outputs []ScriptOutput
}

// ScriptOutput represents a single output from the script.
type ScriptOutput struct {
	Level   string
	Message string
}

// NewRunner creates a new script runner.
func NewRunner(manager *Manager, script *Script, executionID int64, kvStore KVStore, rpcCaller RPCCaller) *Runner {
	ctx, cancel := context.WithCancel(context.Background())

	return &Runner{
		manager:     manager,
		script:      script,
		executionID: executionID,
		kvStore:     kvStore,
		rpcCaller:   rpcCaller,
		ctx:         ctx,
		cancel:      cancel,
		outputs:     make([]ScriptOutput, 0),
	}
}

// Run executes the script.
func (r *Runner) Run(ctx context.Context, args map[string]interface{}) *ExecutionResult {
	r.mu.Lock()
	if r.stopped {
		r.mu.Unlock()
		return &ExecutionResult{
			Success: false,
			Error:   "runner was stopped before execution",
		}
	}
	r.mu.Unlock()

	// Create the engine.
	cfg := EngineConfig{
		ScriptName:     r.script.Name,
		Source:         r.script.Source,
		Macaroon:       r.script.Macaroon,
		AllowedURLs:    r.script.AllowedURLs,
		AllowedBuckets: r.script.AllowedBuckets,
		Limits: ResourceLimits{
			MaxMemoryBytes: r.script.MaxMemoryBytes,
			TimeoutSecs:    r.script.TimeoutSecs,
		},
		KVStore:   r.kvStore,
		RPCCaller: r.rpcCaller,
		OutputCallback: func(level, message string) {
			r.mu.Lock()
			r.outputs = append(r.outputs, ScriptOutput{
				Level:   level,
				Message: message,
			})
			r.mu.Unlock()
		},
	}

	r.engine = NewEngine(r.ctx, cfg)

	// Execute the script.
	result, err := r.engine.Execute(args)
	if err != nil {
		return &ExecutionResult{
			Success: false,
			Error:   err.Error(),
		}
	}

	return result
}

// Stop gracefully stops the script.
func (r *Runner) Stop() {
	r.mu.Lock()
	if r.stopped {
		r.mu.Unlock()
		return
	}
	r.stopped = true
	r.mu.Unlock()

	// Cancel the context.
	r.cancel()

	// Stop the engine if it exists.
	if r.engine != nil {
		r.engine.Stop()
	}
}

// IsStopped returns whether the runner has been stopped.
func (r *Runner) IsStopped() bool {
	r.mu.Lock()
	defer r.mu.Unlock()
	return r.stopped
}

// GetOutputs returns all collected outputs.
func (r *Runner) GetOutputs() []ScriptOutput {
	r.mu.Lock()
	defer r.mu.Unlock()

	// Return a copy.
	outputs := make([]ScriptOutput, len(r.outputs))
	copy(outputs, r.outputs)
	return outputs
}

// ExecutionID returns the execution ID.
func (r *Runner) ExecutionID() int64 {
	return r.executionID
}

// ScriptName returns the script name.
func (r *Runner) ScriptName() string {
	return r.script.Name
}
