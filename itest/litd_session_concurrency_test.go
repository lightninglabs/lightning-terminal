package itest

import (
	"context"
	"fmt"
	"sync"
	"testing"
	"time"

	terminal "github.com/lightninglabs/lightning-terminal"
	"github.com/lightninglabs/lightning-terminal/litrpc"
	"github.com/stretchr/testify/require"
)

// numConcurrentLNCCalls is the number of non-LND calls that are fired
// simultaneously over a single LNC session. It must exceed the SQLite
// connection pool size (2) so that a nested connection acquisition inside an
// open transaction is guaranteed to starve.
const numConcurrentLNCCalls = 4

// testLNCConcurrentNonLNDCalls asserts that a session server can serve several
// non-LND requests at the same time. Every such request resolves its LNC
// session from the session store before it is dispatched, so a session lookup
// that acquires a second database connection while its own transaction is
// still open wedges the whole session: the SQLite pool only hands out two
// connections and each transaction takes the write lock at BEGIN, so two
// racing lookups block each other forever and no non-LND request on that
// session ever completes again.
//
// The test pins the node to SQLite because only a small connection pool makes
// the nested acquisition observable; bbolt allows concurrent readers and
// Postgres has enough connections to hide it at this concurrency.
func testLNCConcurrentNonLNDCalls(ctx context.Context, net *NetworkHarness,
	t *harnessTest) {

	// Start a dedicated node on SQLite regardless of the backend that the
	// itests were invoked with.
	node, err := net.NewNode(
		t.t, "Concurrent", nil, false, true,
		fmt.Sprintf(
			"--databasebackend=%s", terminal.DatabaseBackendSqlite,
		),
	)
	require.NoError(t.t, err)
	defer shutdownAndAssert(net, t, node)

	// Open an LNC session and connect to it through the mailbox, the same
	// way the web UI does.
	ctxt, cancel := context.WithTimeout(ctx, defaultTimeout)
	defer cancel()

	lncConn := setUpLNCConn(
		ctxt, t.t, node.Cfg.LitAddr(), node.Cfg.LitTLSCertPath,
		node.Cfg.LitMacPath, litrpc.SessionType_TYPE_MACAROON_ADMIN,
		nil,
	)
	defer lncConn.Close()

	// Warm the session up with a single sequential call. Serialised lookups
	// never contend, so this must succeed even while the bug is present and
	// tells us the failure below is caused by concurrency alone.
	statusClient := litrpc.NewStatusClient(lncConn)
	_, err = statusClient.SubServerStatus(
		ctxt, &litrpc.SubServerStatusReq{},
	)
	require.NoError(t.t, err)

	// Now fire the same non-LND call from several goroutines at once,
	// released together so that their session lookups overlap.
	var (
		start sync.WaitGroup
		done  = make(chan error, numConcurrentLNCCalls)
	)
	start.Add(1)

	for i := 0; i < numConcurrentLNCCalls; i++ {
		go func() {
			start.Wait()

			_, err := statusClient.SubServerStatus(
				ctx, &litrpc.SubServerStatusReq{},
			)
			done <- err
		}()
	}

	start.Done()

	assertAllCallsReturn(t.t, done, numConcurrentLNCCalls)
}

// assertAllCallsReturn waits for the expected number of results on the given
// channel and fails if any of the calls is still outstanding once the deadline
// passes. A deadlocked session server produces no error at all, it simply
// never answers, so a timeout is the only observable symptom.
func assertAllCallsReturn(t *testing.T, done <-chan error, expected int) {
	t.Helper()

	timeout := time.After(defaultTimeout)

	for i := 0; i < expected; i++ {
		select {
		case err := <-done:
			require.NoError(t, err)

		case <-timeout:
			t.Fatalf("session server stopped serving non-LND "+
				"requests: only %d of %d concurrent calls "+
				"returned", i, expected)
		}
	}
}
