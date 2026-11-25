package terminal

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/lightninglabs/lightning-terminal/litrpc"
	"github.com/lightninglabs/lightning-terminal/perms"
	"github.com/lightninglabs/lightning-terminal/queue"
	"github.com/lightninglabs/lightning-terminal/status"
	"github.com/lightninglabs/lightning-terminal/subservers"
	"github.com/lightningnetwork/lnd/build"
	"github.com/lightningnetwork/lnd/signal"
	"github.com/stretchr/testify/require"
)

// waitClosed asserts that the given channel is closed within a short timeout.
func waitClosed(t *testing.T, c <-chan struct{}) {
	t.Helper()

	select {
	case <-c:
	case <-time.After(5 * time.Second):
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

// TestWaitForShutdown checks that waitForShutdown reports sub-server errors
// and an lnd stop on the LIT status, and returns once litd shuts down.
func TestWaitForShutdown(t *testing.T) {
	permsMgr, err := perms.NewManager(false)
	require.NoError(t, err)

	statusMgr := status.NewStatusManager()
	require.NoError(t, statusMgr.RegisterAndEnableSubServer(subservers.LIT))
	statusMgr.SetRunning(subservers.LIT)

	g := &LightningTerminal{
		statusMgr:    statusMgr,
		subServerMgr: subservers.NewManager(permsMgr, statusMgr),
		errQueue:     queue.NewConcurrentQueue[error](1),
		shutdown:     newShutdownSource(),
	}
	g.errQueue.Start()
	t.Cleanup(g.errQueue.Stop)
	t.Cleanup(g.shutdown.Stop)

	litError := func() string {
		resp, err := statusMgr.SubServerStatus(
			context.Background(), &litrpc.SubServerStatusReq{},
		)
		require.NoError(t, err)

		return resp.SubServers[subservers.LIT].Error
	}

	lndQuit := make(chan struct{})
	done := make(chan struct{})
	go func() {
		defer close(done)
		g.waitForShutdown(lndQuit)
	}()

	g.errQueue.ChanIn() <- errors.New("middleware failed")
	require.Eventually(t, func() bool {
		return litError() == "error from subsystem: middleware failed"
	}, 5*time.Second, 10*time.Millisecond)

	close(lndQuit)
	lndStopped := "lit was stopped as lnd was shut down"
	require.Eventually(t, func() bool {
		return litError() == lndStopped
	}, 5*time.Second, 10*time.Millisecond)

	// An error after lnd stopped must not hide lnd as the cause.
	g.errQueue.ChanIn() <- errors.New("fallout")
	require.Never(t, func() bool {
		return litError() != lndStopped
	}, 200*time.Millisecond, 10*time.Millisecond)

	g.shutdown.RequestShutdown()
	waitClosed(t, done)
}

// TestSetupLoggersCriticalStopsLitd checks that a critical log in one of litd's
// own subsystems requests litd's shutdown.
func TestSetupLoggersCriticalStopsLitd(t *testing.T) {
	litdShutdown := newShutdownSource()
	t.Cleanup(litdShutdown.Stop)

	SetupLoggers(
		build.NewSubLoggerManager(), signal.Interceptor{}, litdShutdown,
	)

	log.Critical("critical test log")
	waitClosed(t, litdShutdown.ShutdownChannel())
}
