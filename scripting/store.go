package scripting

import (
	"context"
	"time"
)

// Script represents a stored script.
type Script struct {
	// ID is the unique identifier.
	ID int64

	// Name is the user-assigned unique name.
	Name string

	// Description is an optional description.
	Description string

	// Source is the Starlark source code.
	Source string

	// Macaroon is the hex-encoded macaroon for RPC permissions.
	Macaroon string

	// TimeoutSecs is the execution timeout. 0 = no timeout.
	TimeoutSecs uint32

	// MaxMemoryBytes is the memory limit.
	MaxMemoryBytes uint64

	// AllowedURLs is the list of URL patterns the script can access.
	AllowedURLs []string

	// AllowedBuckets is the list of KV buckets the script can access.
	AllowedBuckets []string

	// CreatedAt is when the script was created.
	CreatedAt time.Time

	// UpdatedAt is when the script was last updated.
	UpdatedAt time.Time
}

// ScriptExecution represents a script execution record.
type ScriptExecution struct {
	// ID is the unique identifier.
	ID int64

	// ScriptID is the script that was executed.
	ScriptID int64

	// ScriptName is the name of the script (for convenience).
	ScriptName string

	// StartedAt is when execution started.
	StartedAt time.Time

	// EndedAt is when execution ended. Zero if still running.
	EndedAt time.Time

	// State is the execution state: running, completed, failed, stopped.
	State string

	// ResultJSON is the JSON-encoded result.
	ResultJSON string

	// ErrorMessage is the error if execution failed.
	ErrorMessage string

	// DurationMS is the execution duration in milliseconds.
	DurationMS int64
}

// RunningScript represents a currently running script.
type RunningScript struct {
	// ScriptID is the script that's running.
	ScriptID int64

	// ScriptName is the name of the script.
	ScriptName string

	// ExecutionID is the execution record ID.
	ExecutionID int64

	// StartedAt is when the script was started.
	StartedAt time.Time
}

// Execution states.
const (
	StateRunning   = "running"
	StateCompleted = "completed"
	StateFailed    = "failed"
	StateStopped   = "stopped"
)

// Store defines the interface for script storage.
type Store interface {
	// CreateScript creates a new script.
	CreateScript(ctx context.Context, script *Script) error

	// UpdateScript updates an existing script.
	UpdateScript(ctx context.Context, script *Script) error

	// DeleteScript deletes a script by name.
	DeleteScript(ctx context.Context, name string) error

	// GetScript retrieves a script by name.
	GetScript(ctx context.Context, name string) (*Script, error)

	// GetScriptByID retrieves a script by ID.
	GetScriptByID(ctx context.Context, id int64) (*Script, error)

	// ListScripts returns all scripts.
	ListScripts(ctx context.Context) ([]*Script, error)

	// CreateExecution creates a new execution record.
	CreateExecution(ctx context.Context, exec *ScriptExecution) error

	// UpdateExecution updates an execution record.
	UpdateExecution(ctx context.Context, exec *ScriptExecution) error

	// GetExecution retrieves an execution by ID.
	GetExecution(ctx context.Context, id int64) (*ScriptExecution, error)

	// ListExecutions returns execution history.
	ListExecutions(ctx context.Context, scriptName string, limit, offset uint32) ([]*ScriptExecution, error)

	// MarkRunning marks a script as running.
	MarkRunning(ctx context.Context, scriptID, executionID int64) error

	// MarkStopped removes a script from the running list.
	MarkStopped(ctx context.Context, scriptID int64) error

	// GetRunningScripts returns all currently running scripts.
	GetRunningScripts(ctx context.Context) ([]*RunningScript, error)

	// IsScriptRunning checks if a script is currently running.
	IsScriptRunning(ctx context.Context, scriptID int64) (bool, error)

	// Close closes the store.
	Close() error
}
