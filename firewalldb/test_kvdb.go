package firewalldb

import (
	"testing"

	"github.com/lightninglabs/lightning-terminal/session"
	"github.com/stretchr/testify/require"
)

// NewTestDB is a helper function that creates an BBolt database for testing.
func NewTestDB(t *testing.T) *BoltDB {
	return NewTestDBFromPath(t, t.TempDir())
}

// NewTestDBFromPath is a helper function that creates a new BoltStore with a
// connection to an existing BBolt database for testing.
func NewTestDBFromPath(t *testing.T, dbPath string) *BoltDB {
	return newDBFromPathWithSessions(t, dbPath, nil)
}

// NewTestDBWithSessions creates a new test BoltDB Store with access to an
// existing sessions DB.
func NewTestDBWithSessions(t *testing.T, sessStore session.Store) *BoltDB {
	return newDBFromPathWithSessions(t, t.TempDir(), sessStore)
}

func newDBFromPathWithSessions(t *testing.T, dbPath string,
	sessStore session.Store) *BoltDB {

	store, err := NewBoltDB(dbPath, DBFilename, sessStore)
	require.NoError(t, err)

	t.Cleanup(func() {
		require.NoError(t, store.DB.Close())
	})

	return store
}
