package itest

import (
	"context"
	"fmt"

	"github.com/lightninglabs/lightning-terminal/litrpc"
	"github.com/lightninglabs/lightning-terminal/subservers"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/lntest/wait"
	"github.com/stretchr/testify/require"
)

// testLitdSurvivesLndShutdown asserts that when lnd stops in integrated mode,
// litd keeps running and its status endpoint stays reachable, reporting lnd as
// stopped rather than cascading to a full litd shutdown.
func testLitdSurvivesLndShutdown(ctx context.Context, net *NetworkHarness,
	t *harnessTest) {

	// Use a dedicated, throwaway node so that stopping its lnd cannot
	// affect any other test.
	node, err := net.NewNode(
		t.t, "lnd-stop", nil, false, true, "--autopilot.disable",
	)
	require.NoError(t.t, err)

	// The harness ShutdownNode stops litd (via its StopDaemon) and waits
	// for the process to exit, so no manual litd shutdown is needed here.
	defer func() {
		_ = net.ShutdownNode(node)
	}()

	ctxt, cancel := context.WithTimeout(ctx, defaultTimeout)
	defer cancel()

	rawConn, err := connectLitRPC(
		ctxt, node.Cfg.LitAddr(), node.Cfg.LitTLSCertPath,
		node.Cfg.LitMacPath,
	)
	require.NoError(t.t, err)
	defer func() { _ = rawConn.Close() }()

	statusClient := litrpc.NewStatusClient(rawConn)

	// lnd should be running before we stop it.
	resp, err := statusClient.SubServerStatus(
		ctxt, &litrpc.SubServerStatusReq{},
	)
	require.NoError(t.t, err)

	lndStatus, ok := resp.SubServers[subservers.LND]
	require.True(t.t, ok, "expected lnd sub-server status")
	require.True(t.t, lndStatus.Running, "lnd should be running initially")

	// Stop lnd (but not litd) via the lnrpc StopDaemon. The call may return
	// an error as the connection is torn down, which is expected.
	_, _ = node.LightningClient.StopDaemon(ctxt, &lnrpc.StopRequest{})

	// litd's status endpoint must remain reachable and must report lnd as
	// no longer running, with an error explaining why. We poll because lnd
	// shutdown is asynchronous.
	err = wait.NoError(func() error {
		ctxs, cancels := context.WithTimeout(
			context.Background(), defaultTimeout,
		)
		defer cancels()

		resp, err := statusClient.SubServerStatus(
			ctxs, &litrpc.SubServerStatusReq{},
		)
		if err != nil {
			return fmt.Errorf("litd status endpoint unreachable "+
				"after lnd stopped: %w", err)
		}

		lndStatus, ok := resp.SubServers[subservers.LND]
		if !ok {
			return fmt.Errorf("no lnd sub-server status returned")
		}

		if lndStatus.Running {
			return fmt.Errorf("lnd still reported as running")
		}

		if lndStatus.Error == "" {
			return fmt.Errorf("lnd error message not yet set")
		}

		return nil
	}, defaultTimeout)
	require.NoError(t.t, err)

	// litd's process itself must keep running after lnd has stopped: its
	// status endpoint stays reachable. The LIT sub-server is reported as no
	// longer running, since litd cannot function without lnd, but the
	// endpoint continuing to answer at all is what proves litd did not
	// cascade down with lnd. Check this holds over time.
	err = wait.InvariantNoError(func() error {
		ctxs, cancels := context.WithTimeout(
			context.Background(), defaultTimeout,
		)
		defer cancels()

		resp, err := statusClient.SubServerStatus(
			ctxs, &litrpc.SubServerStatusReq{},
		)
		if err != nil {
			return fmt.Errorf("litd status endpoint must stay "+
				"reachable after lnd stopped: %w", err)
		}

		litStatus, ok := resp.SubServers[subservers.LIT]
		if !ok {
			return fmt.Errorf("no lit sub-server status returned")
		}

		if litStatus.Running {
			return fmt.Errorf("lit sub-server should be reported " +
				"as stopped once lnd has stopped")
		}

		if litStatus.Error == "" {
			return fmt.Errorf("lit sub-server error message not set")
		}

		return nil
	}, defaultTimeout)
	require.NoError(t.t, err)
}
