package itest

import (
	"context"
	"fmt"
	"time"

	"github.com/btcsuite/btcd/btcutil"
	"github.com/lightninglabs/lightning-terminal/litrpc"
	"github.com/lightninglabs/lightning-terminal/subservers"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/lntest"
	"github.com/lightningnetwork/lnd/lntest/wait"
	"github.com/stretchr/testify/require"
)

const (
	// sweepMaturityBlocks is the number of blocks we mine while the node
	// under test is stopped, so that the CSV lock on the commitment's
	// to_local output has matured by the time the node comes back up. That
	// makes lnd's TxPublisher attempt the sweep on the very first blockbeat
	// after the restart, which is what reaches into tapd.
	sweepMaturityBlocks = 10

	// tapdStartupBudget is how long tapd may take to report itself as
	// running after the restart. A healthy startup takes a few seconds. A
	// startup that blocks on lnd's blockbeat dispatcher takes at least one
	// DefaultProcessBlockTimeout, which is 60s in lnd v0.21, so this
	// separates the two cleanly while leaving headroom for slow CI
	// runners.
	tapdStartupBudget = 45 * time.Second

	// stallObservationWindow bounds how long we watch for tapd so that a
	// stalled startup is measured and reported rather than just timing out
	// at the budget above.
	stallObservationWindow = 3 * time.Minute

	// maxResolutionBlocks bounds how many blocks we mine to drive the force
	// close to resolution. Each block gives the sweeper another blockbeat
	// to retry on, so this also bounds how many retries we are willing to
	// wait for.
	maxResolutionBlocks = 15

	// resolutionPollInterval is how long we wait for the channel to resolve
	// after each block before mining the next one.
	resolutionPollInterval = 5 * time.Second
)

// testTapdStartupStall asserts that litd brings tapd up promptly when lnd has
// an unresolved on-chain contract at startup.
//
// With both lnd and tapd integrated, litd hands tapd's server to lnd as its
// AuxSweeper before either is started. tapd's AuxSweeper answers
// DeriveSweepAddr by sending on an unbuffered channel whose only receiver is
// started by tapd itself, so any sweep attempted before tapd is started parks
// the caller. The caller is lnd's TxPublisher, a blockbeat consumer, so the
// parked sweep also stops lnd's blockbeat dispatcher from advancing. Because
// the dispatcher serves height queries from the same goroutine that notifies
// consumers, everything that asks lnd for its sync state blocks too, including
// GetInfo. Nothing recovers until the dispatcher gives up on the consumer after
// DefaultProcessBlockTimeout, so anything on the startup path that waits for
// lnd's sync state before tapd runs costs a full 60s.
//
// Note that lnd asks every configured aux sweeper for an extra sweep output
// regardless of whether any input carries assets, so a vanilla channel force
// close is enough to reach into tapd here; no asset channel is needed.
func testTapdStartupStall(ctx context.Context, net *NetworkHarness,
	t *harnessTest) {

	// Both nodes are dedicated to this test. The node under test is left
	// with a deliberately unresolved force close, and its counterparty sees
	// the same channel as pending, so neither role can be filled by the
	// shared Alice/Bob pair without leaking that state into later tests.
	node, err := net.NewNode(t.t, "Stalled", nil, false, true)
	require.NoError(t.t, err)
	defer shutdownAndAssert(net, t, node)

	peer, err := net.NewNode(t.t, "StalledPeer", nil, false, true)
	require.NoError(t.t, err)
	defer shutdownAndAssert(net, t, peer)

	const (
		initialBalance = btcutil.SatoshiPerBitcoin
		fundingAmt     = 1_000_000
	)

	net.SendCoins(t.t, initialBalance, node)
	net.EnsureConnected(t.t, node, peer)

	chanPoint := openChannelAndAssert(
		t, net, node, peer, lntest.OpenChannelParams{
			Amt: fundingAmt,
		},
	)

	// We force close from our own side so that the commitment leaves us
	// with a CSV locked to_local output. That output is the on-chain
	// contract that makes lnd sweep, and therefore call into tapd's aux
	// sweeper, while litd is still starting up.
	_, closeTxid, err := net.CloseChannel(node, chanPoint, true)
	require.NoError(t.t, err, "unable to force close channel")

	// Confirm the commitment so that the CSV clock starts running, but
	// leave the sweep itself unresolved.
	block := mineBlocks(t, net, 1, 1)[0]
	assertTxInBlock(t, block, closeTxid)

	// Guard the precondition explicitly: with no contract to resolve there
	// is nothing to reach into tapd and the assertion below would hold
	// trivially, whether or not the startup path is correct.
	err = wait.NoError(func() error {
		resp, err := node.PendingChannels(
			ctx, &lnrpc.PendingChannelsRequest{},
		)
		if err != nil {
			return err
		}

		if len(resp.PendingForceClosingChannels) != 1 {
			return fmt.Errorf("expected 1 pending force closing "+
				"channel, got %d",
				len(resp.PendingForceClosingChannels))
		}

		return nil
	}, defaultTimeout)
	require.NoError(t.t, err, "no pending force close to resolve")

	// Stop the node, mature the sweep while it is down, then start it again
	// without waiting for the startup to complete. The harness' own startup
	// wait would itself block on the stall we are measuring, so we poll
	// litd's status server instead.
	err = net.RestartNodeNoUnlock(node, func() error {
		net.Miner.GenerateBlocks(sweepMaturityBlocks)

		return nil
	}, false)
	require.NoError(t.t, err, "unable to restart node")

	// We skipped the harness' startup bookkeeping above, so it has to be
	// restored before anything uses the node's clients again, and on the
	// way out even if an assertion fails: the deferred shutdown needs a
	// working client. Failures are only logged because this also runs
	// while a failed assertion is already unwinding the test.
	restored := false
	restore := func() {
		if restored {
			return
		}
		restored = true

		conn, err := node.ConnectRPC(true)
		if err != nil {
			t.t.Logf("could not reconnect to node: %v", err)

			return
		}

		err = node.WaitUntilStarted(conn, stallObservationWindow)
		if err != nil {
			t.t.Logf("node did not finish starting up: %v", err)

			return
		}

		if err := node.initLightningClient(conn); err != nil {
			t.t.Logf("could not re-init lnd client: %v", err)
		}
	}
	defer restore()

	// Measure rather than just bound the startup, so that a stall shows up
	// as a duration in the test output instead of an anonymous deadline.
	elapsed := waitForSubServerRunning(
		t, node, subservers.TAP, stallObservationWindow,
	)
	t.t.Logf("tapd reported running %v after the restart", elapsed)

	require.Lessf(
		t.t, elapsed, tapdStartupBudget, "tapd took %v to start, "+
			"which means the startup waited for lnd's blockbeat "+
			"dispatcher to give up on the sweep parked in tapd's "+
			"unstarted aux sweeper; skipping the chain sync wait "+
			"is not sufficient as long as anything that queries "+
			"lnd's sync state runs before tapd is started",
		elapsed,
	)

	// Starting promptly is only half of what we need. Any fix that keeps
	// the startup moving by failing the aux call that arrived too early
	// trades the stall for a failed sweep attempt, so the sweep has to be
	// retried once tapd is up. Drive the force close all the way to
	// resolution to prove that happens: a change that removed the stall by
	// permanently failing the sweep would pass every assertion above.
	restore()
	assertForceCloseResolved(t, net, node)
}

// assertForceCloseResolved mines blocks until the node reports no pending force
// closing channels, which means its commitment output was swept and confirmed.
// Each block is a fresh blockbeat, so this doubles as a bounded wait for the
// sweeper to retry an attempt that failed earlier.
func assertForceCloseResolved(t *harnessTest, net *NetworkHarness,
	node *HarnessNode) {

	t.t.Helper()

	// If the node's lnd client couldn't be restored after the restart,
	// there is nothing we can assert against here. Fail with that, rather
	// than panicking on a nil client while the test is already unwinding.
	require.NotNil(
		t.t, node.LightningClient, "node has no lnd client, it did "+
			"not finish starting up",
	)

	ctx := context.Background()
	resolved := func() bool {
		resp, err := node.PendingChannels(
			ctx, &lnrpc.PendingChannelsRequest{},
		)
		if err != nil {
			return false
		}

		return len(resp.PendingForceClosingChannels) == 0
	}

	for i := 0; i < maxResolutionBlocks; i++ {
		err := wait.Predicate(resolved, resolutionPollInterval)
		if err == nil {
			t.t.Logf("force close resolved after %d blocks", i)

			return
		}

		net.Miner.GenerateBlocks(1)
	}

	t.Fatalf("force close still pending after %d blocks; the sweep was "+
		"never retried successfully", maxResolutionBlocks)
}

// waitForSubServerRunning waits for litd to report the given sub-server as
// running and returns how long that took. It talks to litd's status server,
// which starts serving as soon as the litd RPC listener is up and therefore
// stays reachable for the whole startup, including while a sub-server is still
// waiting on lnd.
func waitForSubServerRunning(t *harnessTest, node *HarnessNode, name string,
	timeout time.Duration) time.Duration {

	t.t.Helper()

	// Reaching the status server at all is a precondition rather than the
	// behaviour under test, so it gets its own budget and is not counted
	// towards the measured startup time.
	ctxt, cancel := context.WithTimeout(
		context.Background(), defaultTimeout,
	)
	defer cancel()

	rawConn, err := connectLitRPC(
		ctxt, node.Cfg.LitAddr(), node.Cfg.LitTLSCertPath, "",
	)
	require.NoError(t.t, err, "unable to reach litd status server")
	defer rawConn.Close()

	litConn := litrpc.NewStatusClient(rawConn)

	start := time.Now()
	err = wait.NoError(func() error {
		states, err := litConn.SubServerStatus(
			context.Background(), &litrpc.SubServerStatusReq{},
		)
		if err != nil {
			return err
		}

		// The sub-server is only registered with the status manager
		// once litd gets that far, so a missing entry is just a state
		// we have not reached yet.
		state, ok := states.SubServers[name]
		if !ok {
			return fmt.Errorf("sub-server %s not registered yet",
				name)
		}

		if !state.Running {
			return fmt.Errorf("sub-server %s not running: "+
				"err=%q, status=%q", name, state.Error,
				state.CustomStatus)
		}

		return nil
	}, timeout)
	require.NoErrorf(
		t.t, err, "sub-server %s did not start within %v", name,
		timeout,
	)

	return time.Since(start)
}
