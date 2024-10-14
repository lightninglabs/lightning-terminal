package itest

import (
	"context"
	"os"
	"testing"

	"github.com/stretchr/testify/require"
)

// testStatelessInitMode runs various authentication tests against a node that
// is running in stateless-init mode.
func testStatelessInitMode(_ context.Context, net *NetworkHarness,
	t *harnessTest) {

	// Set up a new node (charlie) in stateless init mode (create and
	// unlock).
	walletPassword := []byte("stateless")
	charlie, adminMac := net.NewNodeWithSeed(
		t.t, "Charlie", nil, walletPassword, false, true,
	)
	defer shutdownAndAssert(net, t, charlie)

	// assertNoFiles is a helper that can be used to assert that a set of
	// files does not exist.
	assertNoFiles := func(paths ...string) {
		for _, path := range paths {
			_, err := os.Stat(path)
			require.Error(t.t, err)
		}
	}

	// Assert that there are no macaroon on the file system.
	assertNoFiles(
		// LND macaroons.
		charlie.Cfg.AdminMacPath,
		charlie.Cfg.ReadMacPath,
		charlie.Cfg.InvoiceMacPath,
		// LiT macaroon.
		charlie.Cfg.LitMacPath,
		// Sub-server macaroons
		charlie.Cfg.LoopMacPath, charlie.Cfg.PoolMacPath,
		charlie.Cfg.FaradayMacPath, charlie.Cfg.TapMacPath,
	)

	// Show that UI functions work as expected.
	t.t.Run("UI password auth check", func(tt *testing.T) {
		uiPasswordAuthCheck(tt, charlie.Cfg, false, false, true)
	})

	// Baking a super macaroon using the admin macaroon we received on
	// wallet creation and performing the calls with that macaroon should
	// work.
	t.t.Run("gRPC super macaroon auth check", func(tt *testing.T) {
		superMacaroonAuth(
			tt, charlie.Cfg, false, true,
			func(t *testing.T, config *LitNodeConfig) []byte {
				return adminMac
			},
		)
	})
}
