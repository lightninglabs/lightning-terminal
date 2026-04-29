//go:build dev

package terminal

import (
	"context"
	"path/filepath"
	"testing"

	"github.com/lightninglabs/lightning-terminal/accounts"
	"github.com/lightninglabs/lightning-terminal/firewalldb"
	"github.com/lightninglabs/lightning-terminal/session"
	"github.com/lightningnetwork/lnd/clock"
	"github.com/stretchr/testify/require"
)

// TestNewStoresUnsafeRemoveDeprecatedKVDBMarkers verifies that the explicit
// unsafe flag clears all kvdb deprecation markers before the bbolt backend is
// reopened. The test also verifies that reopening the bbolt stores fails while
// the deprecation markers are still present.
func TestNewStoresUnsafeRemoveDeprecatedKVDBMarkers(t *testing.T) {
	t.Parallel()

	cfg := defaultConfig()
	cfg.LitDir = t.TempDir()
	cfg.Network = "regtest"
	cfg.DatabaseBackend = DatabaseBackendBbolt
	cfg.MacaroonPath = filepath.Join(
		cfg.LitDir, cfg.Network, DefaultMacaroonFilename,
	)

	dbDir := filepath.Dir(cfg.MacaroonPath)
	err := makeDirectories(dbDir)
	require.NoError(t, err)

	clk := clock.NewDefaultClock()

	accountStore, err := accounts.NewBoltStore(
		dbDir, accounts.DBFilename, clk,
	)
	require.NoError(t, err)

	sessionStore, err := session.NewDB(
		dbDir, session.DBFilename, clk, accountStore,
	)
	require.NoError(t, err)

	firewallStore, err := firewalldb.NewBoltDB(
		dbDir, firewalldb.DBFilename, sessionStore, accountStore, clk,
	)
	require.NoError(t, err)

	require.NoError(t, firewallStore.Close())
	require.NoError(t, sessionStore.Close())
	require.NoError(t, accountStore.Close())

	require.NoError(t, accounts.DeprecateKVDB(
		filepath.Join(dbDir, accounts.DBFilename),
	))
	require.NoError(t, session.DeprecateKVDB(
		filepath.Join(dbDir, session.DBFilename),
	))
	require.NoError(t, firewalldb.DeprecateKVDB(
		filepath.Join(dbDir, firewalldb.DBFilename),
	))

	_, err = NewStores(context.Background(), cfg, nil, clk)
	require.ErrorIs(t, err, accounts.ErrKVDBDeprecated)
	require.ErrorContains(t, err, accounts.DBFilename)

	cfg.UnsafeRemoveDeprecatedKVDBMarkers = true

	stores, err := NewStores(context.Background(), cfg, nil, clk)
	require.NoError(t, err)

	t.Cleanup(func() {
		require.NoError(t, stores.close())
	})
}
