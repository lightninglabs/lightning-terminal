//go:build test_db_postgres || test_db_sqlite

package accounts

import (
	"testing"

	"github.com/lightninglabs/lightning-terminal/db"
	"github.com/lightningnetwork/lnd/clock"
	"github.com/stretchr/testify/require"
)

// createStore is a helper function that creates a new SQLStore and ensure that
// it is closed when during the test cleanup.
func createStore(t *testing.T, sqlDB *db.BaseDB, clock clock.Clock) *SQLStore {
	store := NewSQLStore(sqlDB, clock)
	t.Cleanup(func() {
		require.NoError(t, store.Close())
	})

	return store
}
