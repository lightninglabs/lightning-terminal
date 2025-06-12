//go:build test_db_postgres || test_db_sqlite

package session

import (
	"testing"

	"github.com/lightninglabs/lightning-terminal/accounts"
	"github.com/lightninglabs/lightning-terminal/db"
	"github.com/lightningnetwork/lnd/clock"
	"github.com/stretchr/testify/require"
)

func NewTestDBWithAccounts(t *testing.T, clock clock.Clock,
	acctStore accounts.Store) Store {

	accounts, ok := acctStore.(*accounts.SQLStore)
	require.True(t, ok)

	return createStore(t, accounts.BaseDB, clock)
}

// createStore is a helper function that creates a new SQLStore and ensure that
// it is closed when during the test cleanup.
func createStore(t *testing.T, sqlDB *db.BaseDB, clock clock.Clock) *SQLStore {
	store := NewSQLStore(sqlDB, clock)
	t.Cleanup(func() {
		require.NoError(t, store.Close())
	})

	return store
}
