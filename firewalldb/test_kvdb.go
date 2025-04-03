package firewalldb

import (
	"testing"

	"github.com/stretchr/testify/require"
)

// NewTestDB is a helper function that creates an BBolt database for testing.
func NewTestDB(t *testing.T) *BoltDB {
	return NewTestDBFromPath(t, t.TempDir())
}

// NewTestDBFromPath is a helper function that creates a new BoltStore with a
// connection to an existing BBolt database for testing.
func NewTestDBFromPath(t *testing.T, dbPath string) *BoltDB {
	store, err := NewBoltDB(dbPath, DBFilename, nil)
	require.NoError(t, err)

	t.Cleanup(func() {
		require.NoError(t, store.DB.Close())
	})

	return store
}
