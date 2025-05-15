//go:build test_db_sqlite && !test_db_postgres

package firewalldb

import (
	"testing"

	"github.com/lightninglabs/lightning-terminal/db"
	"github.com/lightningnetwork/lnd/clock"
)

// NewTestDB is a helper function that creates an BBolt database for testing.
func NewTestDB(t *testing.T, clock clock.Clock) *SQLDB {
	return NewSQLDB(db.NewTestSqliteDB(t).BaseDB, clock)
}

// NewTestDBFromPath is a helper function that creates a new BoltStore with a
// connection to an existing BBolt database for testing.
func NewTestDBFromPath(t *testing.T, dbPath string, clock clock.Clock) *SQLDB {
	return NewSQLDB(
		db.NewTestSqliteDbHandleFromPath(t, dbPath).BaseDB, clock,
	)
}
