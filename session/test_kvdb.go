package session

import (
	"testing"

	"github.com/lightningnetwork/lnd/clock"
	"github.com/stretchr/testify/require"
)

// NewTestDB is a helper function that creates an BBolt database for testing.
func NewTestDB(t *testing.T, clock clock.Clock) *BoltStore {
	return NewTestDBFromPath(t, t.TempDir(), clock)
}

// NewTestDBFromPath is a helper function that creates a new BoltStore with a
// connection to an existing BBolt database for testing.
func NewTestDBFromPath(t *testing.T, dbPath string,
	clock clock.Clock) *BoltStore {

	store, err := NewDB(dbPath, DBFilename, clock)
	require.NoError(t, err)

	t.Cleanup(func() {
		require.NoError(t, store.DB.Close())
	})

	return store
}
