//go:build test_db_sqlite && !test_db_postgres

package firewalldb

import (
	"testing"

	"github.com/lightninglabs/lightning-terminal/db"
	"github.com/lightningnetwork/lnd/clock"
	"github.com/lightningnetwork/lnd/sqldb/v2"
)

// isSqlite is true if the test_db_sqlite build flag is set.
var isSqlite = true

// NewTestDB is a helper function that creates an BBolt database for testing.
func NewTestDB(t *testing.T, clock clock.Clock) FirewallDBs {
	return createStore(
		t, sqldb.NewTestSqliteDB(t, db.LitdMigrationStreams).BaseDB,
		clock,
	)
}

// NewTestDBFromPath is a helper function that creates a new BoltStore with a
// connection to an existing BBolt database for testing.
func NewTestDBFromPath(t *testing.T, dbPath string,
	clock clock.Clock) FirewallDBs {

	tDb := sqldb.NewTestSqliteDBFromPath(t, dbPath, db.LitdMigrationStreams)

	return createStore(t, tDb.BaseDB, clock)
}
