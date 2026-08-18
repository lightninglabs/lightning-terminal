package subservers

import (
	"testing"

	"github.com/stretchr/testify/require"
)

// TestStartOrder tests that tapd is always started first, and that the
// remaining sub-servers are started in a stable order. tapd has to come first
// because lnd's block processing can be blocked on tapd's aux components, which
// makes any sub-server that queries lnd's chain state on startup stall until
// lnd gives up on the blocked consumer.
func TestStartOrder(t *testing.T) {
	t.Parallel()

	servers := map[string]*subServerWrapper{
		LOOP:    {},
		POOL:    {},
		FARADAY: {},
		TAP:     {},
	}
	mgr := &Manager{servers: servers}

	// We run this a couple of times, as the bug this guards against was
	// Go's randomized map iteration order.
	for range 10 {
		order := mgr.startOrder()
		require.Len(t, order, len(servers))

		require.Same(t, servers[TAP], order[0])
		require.Same(t, servers[FARADAY], order[1])
		require.Same(t, servers[LOOP], order[2])
		require.Same(t, servers[POOL], order[3])
	}
}

// TestStartOrderWithoutTapd tests that the start order is also stable if tapd
// isn't part of the manager's sub-servers at all.
func TestStartOrderWithoutTapd(t *testing.T) {
	t.Parallel()

	servers := map[string]*subServerWrapper{
		LOOP:    {},
		FARADAY: {},
	}
	mgr := &Manager{servers: servers}

	order := mgr.startOrder()
	require.Len(t, order, len(servers))

	require.Same(t, servers[FARADAY], order[0])
	require.Same(t, servers[LOOP], order[1])
}
