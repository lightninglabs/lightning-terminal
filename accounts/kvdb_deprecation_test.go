package accounts

import (
	"errors"
	"os"
	"path/filepath"
	"testing"

	"github.com/lightningnetwork/lnd/clock"
	"github.com/stretchr/testify/require"
)

// TestKVDBDeprecation verifies that a deprecated accounts kvdb file refuses to
// reopen.
func TestKVDBDeprecation(t *testing.T) {
	t.Parallel()

	dbDir := t.TempDir()
	clk := clock.NewDefaultClock()

	store, err := NewBoltStore(dbDir, DBFilename, clk)
	require.NoError(t, err)
	require.NoError(t, store.Close())

	dbPath := filepath.Join(dbDir, DBFilename)

	err = DeprecateKVDB(dbPath)
	require.NoError(t, err)

	_, err = NewBoltStore(dbDir, DBFilename, clk)
	require.Error(t, err)
	require.True(t, errors.Is(err, ErrKVDBDeprecated))
	require.Contains(t, err.Error(), ErrKVDBDeprecated.Error())

	store, err = NewBoltStoreForMigration(dbDir, DBFilename, clk)
	require.NoError(t, err)
	require.NoError(t, store.Close())
}

// TestDeprecateKVDBMissingFile verifies that deprecating a missing accounts
// kvdb file is a no-op.
func TestDeprecateKVDBMissingFile(t *testing.T) {
	t.Parallel()

	dbPath := filepath.Join(t.TempDir(), DBFilename)

	err := DeprecateKVDB(dbPath)
	require.NoError(t, err)

	_, err = os.Stat(dbPath)
	require.ErrorIs(t, err, os.ErrNotExist)
}
