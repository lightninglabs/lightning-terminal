package itest

import (
	"context"

	"github.com/btcsuite/btcutil"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/stretchr/testify/require"
)

// testModeIntegrated makes sure that in integrated mode all daemons work
// correctly.
func testModeIntegrated(net *NetworkHarness, t *harnessTest) {
	ctx := context.Background()

	// Some very basic functionality tests to make sure lnd is working fine
	// in integrated mode.
	net.SendCoins(t.t, btcutil.SatoshiPerBitcoin, net.Alice)

	// We expect a non-empty alias (truncated node ID) to be returned.
	resp, err := net.Alice.GetInfo(ctx, &lnrpc.GetInfoRequest{})
	require.NoError(t.t, err)
	require.NotEmpty(t.t, resp.Alias)
}
