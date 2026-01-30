package scripting

import (
	"context"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"sync"
	"time"

	"github.com/lightninglabs/lightning-terminal/litrpc"
	"github.com/lightningnetwork/lnd/lnrpc"
)

// MacaroonBaker is the interface for baking macaroons.
type MacaroonBaker interface {
	// BakeMacaroon creates a new macaroon with the specified permissions.
	BakeMacaroon(ctx context.Context, perms []*lnrpc.MacaroonPermission) (string, error)
}

// Manager handles script CRUD operations and macaroon management.
type Manager struct {
	store      Store
	kvStore    KVStore
	macBaker   MacaroonBaker
	rpcCaller  RPCCaller
	lndClients *LNDClients

	// runners tracks currently running scripts.
	runners   map[string]*Runner
	runnersMu sync.RWMutex
}

// NewManager creates a new script manager.
func NewManager(store Store, kvStore KVStore, macBaker MacaroonBaker, rpcCaller RPCCaller) *Manager {
	return &Manager{
		store:     store,
		kvStore:   kvStore,
		macBaker:  macBaker,
		rpcCaller: rpcCaller,
		runners:   make(map[string]*Runner),
	}
}

// SetMacaroonBaker sets the macaroon baker after initialization.
// This is used when the baker needs to be set after LND connects.
func (m *Manager) SetMacaroonBaker(baker MacaroonBaker) {
	m.macBaker = baker
}

// SetLNDClients sets the LND clients for script RPC access.
func (m *Manager) SetLNDClients(clients *LNDClients) {
	m.lndClients = clients
}

// CreateScript creates a new script with the specified permissions.
func (m *Manager) CreateScript(ctx context.Context, req *litrpc.CreateScriptRequest) (*Script, error) {
	// Validate the source.
	result := ValidateScript(req.Source)
	if !result.Valid {
		return nil, fmt.Errorf("invalid script: %s", result.Error)
	}

	// Bake a macaroon with the specified permissions.
	var lnPerms []*lnrpc.MacaroonPermission
	for _, perm := range req.Permissions {
		lnPerms = append(lnPerms, &lnrpc.MacaroonPermission{
			Entity: perm.Entity,
			Action: perm.Action,
		})
	}

	macaroon, err := m.macBaker.BakeMacaroon(ctx, lnPerms)
	if err != nil {
		return nil, fmt.Errorf("failed to bake macaroon: %w", err)
	}

	// Set defaults.
	maxMemory := req.MaxMemoryBytes
	if maxMemory == 0 {
		maxMemory = DefaultMaxMemoryBytes
	}

	now := time.Now()
	script := &Script{
		Name:           req.Name,
		Description:    req.Description,
		Source:         req.Source,
		Macaroon:       macaroon,
		TimeoutSecs:    req.TimeoutSecs,
		MaxMemoryBytes: maxMemory,
		AllowedURLs:    req.AllowedUrls,
		AllowedBuckets: req.AllowedBuckets,
		CreatedAt:      now,
		UpdatedAt:      now,
	}

	if err := m.store.CreateScript(ctx, script); err != nil {
		return nil, fmt.Errorf("failed to create script: %w", err)
	}

	return script, nil
}

// UpdateScript updates an existing script.
func (m *Manager) UpdateScript(ctx context.Context, req *litrpc.UpdateScriptRequest) (*Script, error) {
	// Get the existing script.
	script, err := m.store.GetScript(ctx, req.Name)
	if err != nil {
		return nil, fmt.Errorf("script not found: %w", err)
	}

	// Check if script is running.
	running, err := m.store.IsScriptRunning(ctx, script.ID)
	if err != nil {
		return nil, err
	}
	if running {
		return nil, fmt.Errorf("cannot update running script")
	}

	// Update fields if provided.
	if req.Description != "" {
		script.Description = req.Description
	}

	if req.Source != "" {
		// Validate new source.
		result := ValidateScript(req.Source)
		if !result.Valid {
			return nil, fmt.Errorf("invalid script: %s", result.Error)
		}
		script.Source = req.Source
	}

	// If permissions are changing, bake a new macaroon.
	if len(req.Permissions) > 0 {
		var lnPerms []*lnrpc.MacaroonPermission
		for _, perm := range req.Permissions {
			lnPerms = append(lnPerms, &lnrpc.MacaroonPermission{
				Entity: perm.Entity,
				Action: perm.Action,
			})
		}

		macaroon, err := m.macBaker.BakeMacaroon(ctx, lnPerms)
		if err != nil {
			return nil, fmt.Errorf("failed to bake macaroon: %w", err)
		}
		script.Macaroon = macaroon
	}

	script.TimeoutSecs = req.TimeoutSecs

	if req.MaxMemoryBytes > 0 {
		script.MaxMemoryBytes = req.MaxMemoryBytes
	}

	if len(req.AllowedUrls) > 0 {
		script.AllowedURLs = req.AllowedUrls
	}

	if len(req.AllowedBuckets) > 0 {
		script.AllowedBuckets = req.AllowedBuckets
	}

	script.UpdatedAt = time.Now()

	if err := m.store.UpdateScript(ctx, script); err != nil {
		return nil, fmt.Errorf("failed to update script: %w", err)
	}

	return script, nil
}

// DeleteScript deletes a script.
func (m *Manager) DeleteScript(ctx context.Context, name string, deleteKVData bool) error {
	// Get the script.
	script, err := m.store.GetScript(ctx, name)
	if err != nil {
		return fmt.Errorf("script not found: %w", err)
	}

	// Stop if running.
	if err := m.StopScript(ctx, name); err != nil {
		log.Warnf("Error stopping script before delete: %v", err)
	}

	// Delete KV data if requested.
	if deleteKVData {
		if kvStoreDB, ok := m.kvStore.(*SQLKVStore); ok {
			if err := kvStoreDB.DeleteBucket(name); err != nil {
				log.Warnf("Error deleting KV bucket: %v", err)
			}
		}
	}

	return m.store.DeleteScript(ctx, script.Name)
}

// GetScript retrieves a script by name.
func (m *Manager) GetScript(ctx context.Context, name string) (*Script, bool, error) {
	script, err := m.store.GetScript(ctx, name)
	if err != nil {
		return nil, false, nil
	}

	// Check if running.
	running, _ := m.store.IsScriptRunning(ctx, script.ID)

	return script, running, nil
}

// ListScripts returns all scripts.
func (m *Manager) ListScripts(ctx context.Context) ([]*Script, error) {
	return m.store.ListScripts(ctx)
}

// StartScript starts a script execution.
func (m *Manager) StartScript(ctx context.Context, name string, argsJSON string) (uint64, string, error) {
	// Get the script.
	script, err := m.store.GetScript(ctx, name)
	if err != nil {
		return 0, "", fmt.Errorf("script not found: %w", err)
	}

	// Check if already running.
	running, err := m.store.IsScriptRunning(ctx, script.ID)
	if err != nil {
		return 0, "", err
	}
	if running {
		return 0, "", fmt.Errorf("script is already running")
	}

	// Parse arguments.
	var args map[string]interface{}
	if argsJSON != "" {
		if err := json.Unmarshal([]byte(argsJSON), &args); err != nil {
			return 0, "", fmt.Errorf("invalid args JSON: %w", err)
		}
	}

	// Create execution record.
	exec := &ScriptExecution{
		ScriptID:   script.ID,
		ScriptName: script.Name,
		StartedAt:  time.Now(),
		State:      StateRunning,
	}

	if err := m.store.CreateExecution(ctx, exec); err != nil {
		return 0, "", fmt.Errorf("failed to create execution: %w", err)
	}

	// Mark as running.
	if err := m.store.MarkRunning(ctx, script.ID, exec.ID); err != nil {
		return 0, "", fmt.Errorf("failed to mark running: %w", err)
	}

	// Create and start runner.
	runner := NewRunner(m, script, exec.ID, m.kvStore, m.rpcCaller, m.lndClients)

	m.runnersMu.Lock()
	m.runners[name] = runner
	m.runnersMu.Unlock()

	// Start execution.
	resultChan := make(chan *ExecutionResult, 1)
	go func() {
		result := runner.Run(ctx, args)
		resultChan <- result

		// Update execution record.
		m.completeExecution(context.Background(), script, exec.ID, result)

		// Remove from runners.
		m.runnersMu.Lock()
		delete(m.runners, name)
		m.runnersMu.Unlock()
	}()

	// For scripts with a timeout, wait for completion.
	if script.TimeoutSecs > 0 {
		select {
		case result := <-resultChan:
			if result.Error != "" {
				return uint64(exec.ID), "", fmt.Errorf("script error: %s", result.Error)
			}
			return uint64(exec.ID), result.ResultJSON, nil
		case <-ctx.Done():
			runner.Stop()
			return uint64(exec.ID), "", ctx.Err()
		}
	}

	// For long-running scripts, return immediately.
	return uint64(exec.ID), "", nil
}

// completeExecution updates the execution record when a script finishes.
func (m *Manager) completeExecution(ctx context.Context, script *Script, execID int64, result *ExecutionResult) {
	now := time.Now()

	exec, err := m.store.GetExecution(ctx, execID)
	if err != nil {
		log.Errorf("Failed to get execution: %v", err)
		return
	}

	exec.EndedAt = now
	exec.DurationMS = now.Sub(exec.StartedAt).Milliseconds()

	if result.Success {
		exec.State = StateCompleted
		exec.ResultJSON = result.ResultJSON
	} else {
		exec.State = StateFailed
		exec.ErrorMessage = result.Error
	}

	if err := m.store.UpdateExecution(ctx, exec); err != nil {
		log.Errorf("Failed to update execution: %v", err)
	}

	if err := m.store.MarkStopped(ctx, script.ID); err != nil {
		log.Errorf("Failed to mark stopped: %v", err)
	}
}

// StopScript stops a running script.
func (m *Manager) StopScript(ctx context.Context, name string) error {
	m.runnersMu.RLock()
	runner, ok := m.runners[name]
	m.runnersMu.RUnlock()

	if !ok {
		// Check if it's marked as running in the DB but not in memory
		// (could happen after a restart).
		script, err := m.store.GetScript(ctx, name)
		if err != nil {
			return nil // Script doesn't exist.
		}

		running, _ := m.store.IsScriptRunning(ctx, script.ID)
		if running {
			// Clear the stale running state.
			return m.store.MarkStopped(ctx, script.ID)
		}

		return nil
	}

	// Stop the runner.
	runner.Stop()

	// Wait briefly for cleanup.
	time.Sleep(100 * time.Millisecond)

	return nil
}

// ListRunningScripts returns all currently running scripts.
func (m *Manager) ListRunningScripts(ctx context.Context) ([]*RunningScript, error) {
	return m.store.GetRunningScripts(ctx)
}

// GetExecutionHistory returns execution history.
func (m *Manager) GetExecutionHistory(ctx context.Context, name string, limit, offset uint32) ([]*ScriptExecution, error) {
	return m.store.ListExecutions(ctx, name, limit, offset)
}

// ValidateScriptSource validates a script without creating it.
func (m *Manager) ValidateScriptSource(source string) *ValidationResult {
	return ValidateScript(source)
}

// IsScriptRunning checks if a script is running.
func (m *Manager) IsScriptRunning(name string) bool {
	m.runnersMu.RLock()
	defer m.runnersMu.RUnlock()
	_, ok := m.runners[name]
	return ok
}

// Stop stops all running scripts and cleans up.
func (m *Manager) Stop() {
	m.runnersMu.Lock()
	defer m.runnersMu.Unlock()

	for name, runner := range m.runners {
		log.Infof("Stopping script: %s", name)
		runner.Stop()
	}

	m.runners = make(map[string]*Runner)
}

// LndMacaroonBaker implements MacaroonBaker using LND's BakeMacaroon RPC.
type LndMacaroonBaker struct {
	client lnrpc.LightningClient
}

// NewLndMacaroonBaker creates a new LND-based macaroon baker.
func NewLndMacaroonBaker(client lnrpc.LightningClient) *LndMacaroonBaker {
	return &LndMacaroonBaker{client: client}
}

// BakeMacaroon creates a new macaroon with the specified permissions.
func (b *LndMacaroonBaker) BakeMacaroon(ctx context.Context, perms []*lnrpc.MacaroonPermission) (string, error) {
	req := &lnrpc.BakeMacaroonRequest{
		Permissions:              perms,
		AllowExternalPermissions: true,
	}

	resp, err := b.client.BakeMacaroon(ctx, req)
	if err != nil {
		return "", err
	}

	// The response contains the macaroon in hex format.
	return resp.Macaroon, nil
}

// TestMacaroonBaker is a mock macaroon baker for testing.
type TestMacaroonBaker struct{}

// BakeMacaroon returns a dummy macaroon for testing.
func (b *TestMacaroonBaker) BakeMacaroon(ctx context.Context, perms []*lnrpc.MacaroonPermission) (string, error) {
	return hex.EncodeToString([]byte("test-macaroon")), nil
}
