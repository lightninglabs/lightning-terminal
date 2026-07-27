//go:build !windows

package terminal

import (
	"syscall"
	"testing"

	"github.com/stretchr/testify/require"
)

// TestShutdownSourceSignal checks that an OS termination signal closes the
// shutdown channel. The signal is captured by signal.Notify, so it does not
// terminate the test process.
//
// This lives in a Unix-only file because syscall.Kill is not available on
// Windows.
func TestShutdownSourceSignal(t *testing.T) {
	// Not parallel: this sends a process-wide signal, which every
	// registered shutdownSource would observe.
	s := newShutdownSource()
	defer s.Stop()

	requireOpen(t, s.ShutdownChannel())

	require.NoError(t, syscall.Kill(syscall.Getpid(), syscall.SIGTERM))

	waitClosed(t, s.ShutdownChannel())
}
