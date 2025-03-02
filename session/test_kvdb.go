//go:build !test_db_postgres && !test_db_sqlite

package session

import (
	"testing"

	"github.com/lightninglabs/lightning-terminal/accounts"
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

	acctStore := accounts.NewTestDB(t, clock)

	return newDBFromPathWithAccounts(t, clock, dbPath, acctStore)
}

// NewTestDBWithAccounts creates a new test session Store with access to an
// existing accounts DB.
func NewTestDBWithAccounts(t *testing.T, clock clock.Clock,
	acctStore accounts.Store) *BoltStore {

	return newDBFromPathWithAccounts(t, clock, t.TempDir(), acctStore)
}

func newDBFromPathWithAccounts(t *testing.T, clock clock.Clock, dbPath string,
	acctStore accounts.Store) *BoltStore {

	store, err := NewDB(dbPath, DBFilename, clock, acctStore)
	require.NoError(t, err)

	t.Cleanup(func() {
		require.NoError(t, store.DB.Close())
	})

	return store
}
