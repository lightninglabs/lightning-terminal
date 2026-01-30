package scripting

import (
	"context"
	"fmt"
	"sync"
	"sync/atomic"
	"time"
)

const (
	// DefaultMaxMemoryBytes is the default maximum memory a script can use
	// (100MB).
	DefaultMaxMemoryBytes = 100 * 1024 * 1024

	// DefaultTimeoutSecs is the default execution timeout for scripts.
	// 0 means no timeout (for long-running scripts).
	DefaultTimeoutSecs = 0

	// MaxSleepDuration is the maximum time a script can sleep in a single
	// call.
	MaxSleepDuration = 60 * time.Second
)

// ResourceLimits defines the resource constraints for script execution.
type ResourceLimits struct {
	// MaxMemoryBytes is the maximum memory the script can allocate.
	MaxMemoryBytes uint64

	// TimeoutSecs is the execution timeout in seconds. 0 means no timeout.
	TimeoutSecs uint32
}

// DefaultResourceLimits returns the default resource limits.
func DefaultResourceLimits() ResourceLimits {
	return ResourceLimits{
		MaxMemoryBytes: DefaultMaxMemoryBytes,
		TimeoutSecs:    DefaultTimeoutSecs,
	}
}

// Sandbox enforces resource limits during script execution.
type Sandbox struct {
	limits ResourceLimits

	// ctx is the execution context with cancellation.
	ctx    context.Context
	cancel context.CancelFunc

	// memoryUsed tracks approximate memory usage.
	memoryUsed atomic.Int64

	// startTime is when execution started.
	startTime time.Time

	// stopped indicates if the sandbox has been stopped.
	stopped atomic.Bool

	// mu protects concurrent access.
	mu sync.RWMutex

	// callbacks for cleanup when sandbox is stopped.
	cleanupFuncs []func()
}

// NewSandbox creates a new sandbox with the given limits.
func NewSandbox(ctx context.Context, limits ResourceLimits) *Sandbox {
	sandboxCtx, cancel := context.WithCancel(ctx)

	s := &Sandbox{
		limits:    limits,
		ctx:       sandboxCtx,
		cancel:    cancel,
		startTime: time.Now(),
	}

	// Set up timeout if configured.
	if limits.TimeoutSecs > 0 {
		go func() {
			timeout := time.Duration(limits.TimeoutSecs) * time.Second
			timer := time.NewTimer(timeout)
			defer timer.Stop()

			select {
			case <-timer.C:
				log.Infof("Script execution timed out after %v", timeout)
				s.Stop()
			case <-sandboxCtx.Done():
				// Context cancelled, nothing to do.
			}
		}()
	}

	return s
}

// Context returns the sandbox context.
func (s *Sandbox) Context() context.Context {
	return s.ctx
}

// Stop cancels the sandbox context and runs cleanup functions.
func (s *Sandbox) Stop() {
	if s.stopped.CompareAndSwap(false, true) {
		s.cancel()

		s.mu.Lock()
		cleanups := s.cleanupFuncs
		s.cleanupFuncs = nil
		s.mu.Unlock()

		for _, cleanup := range cleanups {
			cleanup()
		}
	}
}

// IsStopped returns whether the sandbox has been stopped.
func (s *Sandbox) IsStopped() bool {
	return s.stopped.Load()
}

// RegisterCleanup adds a cleanup function to be called when the sandbox stops.
func (s *Sandbox) RegisterCleanup(fn func()) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.stopped.Load() {
		// Already stopped, run cleanup immediately.
		fn()
		return
	}

	s.cleanupFuncs = append(s.cleanupFuncs, fn)
}

// CheckMemory checks if allocating the given amount of memory is allowed.
func (s *Sandbox) CheckMemory(bytes int64) error {
	if s.limits.MaxMemoryBytes == 0 {
		return nil
	}

	newUsage := s.memoryUsed.Add(bytes)
	if newUsage > int64(s.limits.MaxMemoryBytes) {
		s.memoryUsed.Add(-bytes)
		return fmt.Errorf("memory limit exceeded: %d > %d",
			newUsage, s.limits.MaxMemoryBytes)
	}

	return nil
}

// ReleaseMemory releases previously allocated memory.
func (s *Sandbox) ReleaseMemory(bytes int64) {
	s.memoryUsed.Add(-bytes)
}

// MemoryUsed returns the current memory usage.
func (s *Sandbox) MemoryUsed() int64 {
	return s.memoryUsed.Load()
}

// ElapsedTime returns how long the script has been running.
func (s *Sandbox) ElapsedTime() time.Duration {
	return time.Since(s.startTime)
}

// Sleep pauses execution for the given duration, respecting context
// cancellation.
func (s *Sandbox) Sleep(d time.Duration) error {
	if d > MaxSleepDuration {
		return fmt.Errorf("sleep duration %v exceeds maximum %v",
			d, MaxSleepDuration)
	}

	if d <= 0 {
		return nil
	}

	timer := time.NewTimer(d)
	defer timer.Stop()

	select {
	case <-timer.C:
		return nil
	case <-s.ctx.Done():
		return s.ctx.Err()
	}
}

// CheckContext checks if the context has been cancelled.
func (s *Sandbox) CheckContext() error {
	select {
	case <-s.ctx.Done():
		return s.ctx.Err()
	default:
		return nil
	}
}
