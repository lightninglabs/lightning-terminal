//go:build !test_db_postgres && !test_db_sqlite

package firewalldb

import (
	"testing"

	"github.com/lightninglabs/lightning-terminal/session"
	"github.com/lightningnetwork/lnd/clock"
	"github.com/stretchr/testify/require"
)

// NewTestDB is a helper function that creates an BBolt database for testing.
func NewTestDB(t *testing.T, clock clock.Clock) *BoltDB {
	return NewTestDBFromPath(t, t.TempDir(), clock)
}

// NewTestDBFromPath is a helper function that creates a new BoltStore with a
// connection to an existing BBolt database for testing.
func NewTestDBFromPath(t *testing.T, dbPath string, clock clock.Clock) *BoltDB {
	return newDBFromPathWithSessions(t, dbPath, nil, clock)
}

// NewTestDBWithSessions creates a new test BoltDB Store with access to an
// existing sessions DB.
func NewTestDBWithSessions(t *testing.T, sessStore session.Store,
	clock clock.Clock) *BoltDB {

	return newDBFromPathWithSessions(t, t.TempDir(), sessStore, clock)
}

func newDBFromPathWithSessions(t *testing.T, dbPath string,
	sessStore session.Store, clock clock.Clock) *BoltDB {

	store, err := NewBoltDB(dbPath, DBFilename, sessStore, clock)
	require.NoError(t, err)

	t.Cleanup(func() {
		require.NoError(t, store.DB.Close())
	})

	return store
}
