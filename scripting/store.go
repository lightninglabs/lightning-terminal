package scripting

import (
	"context"
	"fmt"
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

// InMemoryStore implements Store with in-memory storage.
// This is useful for testing and development.
type InMemoryStore struct {
	scripts    map[string]*Script
	executions []*ScriptExecution
	running    map[int64]*RunningScript
	nextID     int64
	nextExecID int64
}

// NewInMemoryStore creates a new in-memory script store.
func NewInMemoryStore() *InMemoryStore {
	return &InMemoryStore{
		scripts: make(map[string]*Script),
		running: make(map[int64]*RunningScript),
		nextID:  1,
	}
}

func (s *InMemoryStore) CreateScript(ctx context.Context, script *Script) error {
	if _, exists := s.scripts[script.Name]; exists {
		return fmt.Errorf("script %s already exists", script.Name)
	}
	script.ID = s.nextID
	s.nextID++
	s.scripts[script.Name] = script
	return nil
}

func (s *InMemoryStore) UpdateScript(ctx context.Context, script *Script) error {
	if _, exists := s.scripts[script.Name]; !exists {
		return fmt.Errorf("script %s not found", script.Name)
	}
	s.scripts[script.Name] = script
	return nil
}

func (s *InMemoryStore) DeleteScript(ctx context.Context, name string) error {
	delete(s.scripts, name)
	return nil
}

func (s *InMemoryStore) GetScript(ctx context.Context, name string) (*Script, error) {
	script, exists := s.scripts[name]
	if !exists {
		return nil, fmt.Errorf("script %s not found", name)
	}
	return script, nil
}

func (s *InMemoryStore) GetScriptByID(ctx context.Context, id int64) (*Script, error) {
	for _, script := range s.scripts {
		if script.ID == id {
			return script, nil
		}
	}
	return nil, fmt.Errorf("script with ID %d not found", id)
}

func (s *InMemoryStore) ListScripts(ctx context.Context) ([]*Script, error) {
	result := make([]*Script, 0, len(s.scripts))
	for _, script := range s.scripts {
		result = append(result, script)
	}
	return result, nil
}

func (s *InMemoryStore) CreateExecution(ctx context.Context, exec *ScriptExecution) error {
	s.nextExecID++
	exec.ID = s.nextExecID
	s.executions = append(s.executions, exec)
	return nil
}

func (s *InMemoryStore) UpdateExecution(ctx context.Context, exec *ScriptExecution) error {
	for i, e := range s.executions {
		if e.ID == exec.ID {
			s.executions[i] = exec
			return nil
		}
	}
	return fmt.Errorf("execution %d not found", exec.ID)
}

func (s *InMemoryStore) GetExecution(ctx context.Context, id int64) (*ScriptExecution, error) {
	for _, e := range s.executions {
		if e.ID == id {
			return e, nil
		}
	}
	return nil, fmt.Errorf("execution %d not found", id)
}

func (s *InMemoryStore) ListExecutions(ctx context.Context, scriptName string, limit, offset uint32) ([]*ScriptExecution, error) {
	var result []*ScriptExecution
	for _, e := range s.executions {
		if scriptName == "" || e.ScriptName == scriptName {
			result = append(result, e)
		}
	}
	// Simple pagination
	start := int(offset)
	if start >= len(result) {
		return nil, nil
	}
	end := start + int(limit)
	if end > len(result) {
		end = len(result)
	}
	return result[start:end], nil
}

func (s *InMemoryStore) MarkRunning(ctx context.Context, scriptID, executionID int64) error {
	script, err := s.GetScriptByID(ctx, scriptID)
	if err != nil {
		return err
	}
	s.running[scriptID] = &RunningScript{
		ScriptID:    scriptID,
		ScriptName:  script.Name,
		ExecutionID: executionID,
		StartedAt:   time.Now(),
	}
	return nil
}

func (s *InMemoryStore) MarkStopped(ctx context.Context, scriptID int64) error {
	delete(s.running, scriptID)
	return nil
}

func (s *InMemoryStore) GetRunningScripts(ctx context.Context) ([]*RunningScript, error) {
	result := make([]*RunningScript, 0, len(s.running))
	for _, r := range s.running {
		result = append(result, r)
	}
	return result, nil
}

func (s *InMemoryStore) IsScriptRunning(ctx context.Context, scriptID int64) (bool, error) {
	_, exists := s.running[scriptID]
	return exists, nil
}

func (s *InMemoryStore) Close() error {
	return nil
}

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
