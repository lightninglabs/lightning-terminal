package session

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/lightninglabs/lightning-terminal/accounts"
	"github.com/lightninglabs/lightning-terminal/db/tombstone"
	"github.com/lightningnetwork/lnd/clock"
	"github.com/stretchr/testify/require"
)

// TestKVDBDeprecation verifies that a deprecated session kvdb file refuses to
// reopen.
func TestKVDBDeprecation(t *testing.T) {
	t.Parallel()

	dbDir := t.TempDir()
	clk := clock.NewDefaultClock()

	accountStore, err := accounts.NewBoltStore(
		dbDir, accounts.DBFilename, clk,
	)
	require.NoError(t, err)
	defer accountStore.Close()

	store, err := NewDB(dbDir, DBFilename, clk, accountStore)
	require.NoError(t, err)
	require.NoError(t, store.Close())

	err = DeprecateKVDB(dbDir)
	require.NoError(t, err)

	_, err = NewDB(dbDir, DBFilename, clk, accountStore)
	require.Error(t, err)
	require.ErrorIs(t, err, tombstone.ErrKVDBDeprecated)

	store, err = NewDBForMigration(dbDir, DBFilename, clk, accountStore)
	require.NoError(t, err)
	require.NoError(t, store.Close())
}

// TestDeprecateKVDBMissingFile verifies that deprecating a missing session
// kvdb file is a no-op.
func TestDeprecateKVDBMissingFile(t *testing.T) {
	t.Parallel()

	dbDir := t.TempDir()
	dbPath := filepath.Join(dbDir, DBFilename)

	err := DeprecateKVDB(dbDir)
	require.NoError(t, err)

	_, err = os.Stat(dbPath)
	require.ErrorIs(t, err, os.ErrNotExist)
}
