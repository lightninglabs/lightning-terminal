//go:build test_db_postgres || test_db_sqlite

package accounts

import (
	"testing"

	"github.com/lightninglabs/lightning-terminal/db/sqlc"
	"github.com/lightningnetwork/lnd/clock"
	"github.com/lightningnetwork/lnd/sqldb/v2"
	"github.com/stretchr/testify/require"
)

// createStore is a helper function that creates a new SQLStore and ensure that
// it is closed when during the test cleanup.
func createStore(t *testing.T, sqlDB *sqldb.BaseDB,
	clock clock.Clock) *SQLStore {

	queries := sqlc.NewForType(sqlDB, sqlDB.BackendType)

	store := NewSQLStore(sqlDB, queries, clock)
	t.Cleanup(func() {
		require.NoError(t, store.Close())
	})

	return store
}
