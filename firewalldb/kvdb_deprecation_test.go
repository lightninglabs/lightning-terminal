package firewalldb

import (
	"errors"
	"os"
	"path/filepath"
	"testing"

	"github.com/lightninglabs/lightning-terminal/accounts"
	"github.com/lightninglabs/lightning-terminal/session"
	"github.com/lightningnetwork/lnd/clock"
	"github.com/stretchr/testify/require"
)

// TestKVDBDeprecation verifies that a deprecated rules kvdb file refuses to
// reopen until the explicit marker is removed again.
func TestKVDBDeprecation(t *testing.T) {
	t.Parallel()

	dbDir := t.TempDir()
	clk := clock.NewDefaultClock()

	accountStore, err := accounts.NewBoltStore(
		dbDir, accounts.DBFilename, clk,
	)
	require.NoError(t, err)
	defer accountStore.Close()

	sessionStore, err := session.NewDB(
		dbDir, session.DBFilename, clk, accountStore,
	)
	require.NoError(t, err)
	defer sessionStore.Close()

	store, err := NewBoltDB(
		dbDir, DBFilename, sessionStore, accountStore, clk,
	)
	require.NoError(t, err)
	require.NoError(t, store.Close())

	dbPath := filepath.Join(dbDir, DBFilename)

	err = DeprecateKVDB(dbPath)
	require.NoError(t, err)

	_, err = NewBoltDB(dbDir, DBFilename, sessionStore, accountStore, clk)
	require.Error(t, err)
	require.True(t, errors.Is(err, ErrKVDBDeprecated))
	require.Contains(t, err.Error(), ErrKVDBDeprecated.Error())

	store, err = NewBoltDBForMigration(
		dbDir, DBFilename, sessionStore, accountStore, clk,
	)
	require.NoError(t, err)
	require.NoError(t, store.Close())

	err = RemoveKVDBDeprecation(dbPath)
	require.NoError(t, err)

	store, err = NewBoltDB(
		dbDir, DBFilename, sessionStore, accountStore, clk,
	)
	require.NoError(t, err)
	require.NoError(t, store.Close())
}

// TestDeprecateKVDBMissingFile verifies that deprecating a missing rules kvdb
// file is a no-op.
func TestDeprecateKVDBMissingFile(t *testing.T) {
	t.Parallel()

	dbPath := filepath.Join(t.TempDir(), DBFilename)

	err := DeprecateKVDB(dbPath)
	require.NoError(t, err)

	_, err = os.Stat(dbPath)
	require.ErrorIs(t, err, os.ErrNotExist)
}
