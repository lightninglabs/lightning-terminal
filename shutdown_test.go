package terminal

import (
	"testing"
	"time"

	"github.com/stretchr/testify/require"
)

// waitClosed asserts that the given channel is closed within a short timeout.
func waitClosed(t *testing.T, c <-chan struct{}) {
	t.Helper()

	select {
	case <-c:
	case <-time.After(time.Second):
		require.FailNow(t, "shutdown channel was not closed in time")
	}
}

// requireOpen asserts that the given channel is not yet closed.
func requireOpen(t *testing.T, c <-chan struct{}) {
	t.Helper()

	select {
	case <-c:
		require.FailNow(t, "shutdown channel closed unexpectedly")
	default:
	}
}

// TestShutdownSourceRequestShutdown checks that RequestShutdown closes the
// shutdown channel and that calling it again is a safe no-op.
func TestShutdownSourceRequestShutdown(t *testing.T) {
	t.Parallel()

	s := newShutdownSource()
	defer s.Stop()

	// The channel should start open.
	requireOpen(t, s.ShutdownChannel())

	// Requesting a shutdown should close it.
	s.RequestShutdown()
	waitClosed(t, s.ShutdownChannel())

	// A second call must not panic on a double close.
	require.NotPanics(t, s.RequestShutdown)
	waitClosed(t, s.ShutdownChannel())
}

// TestShutdownSourceChannelStable checks that ShutdownChannel returns the same
// channel across calls, before and after a shutdown is requested, so callers
// can select on it repeatedly without spawning a goroutine per call.
func TestShutdownSourceChannelStable(t *testing.T) {
	t.Parallel()

	s := newShutdownSource()
	defer s.Stop()

	first := s.ShutdownChannel()
	require.Equal(t, first, s.ShutdownChannel())

	s.RequestShutdown()

	require.Equal(t, first, s.ShutdownChannel())
}
