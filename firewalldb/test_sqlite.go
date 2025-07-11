//go:build test_db_sqlite && !test_db_postgres

package firewalldb

import (
	"testing"

	"github.com/lightninglabs/lightning-terminal/db/migrationstreams"
	"github.com/lightningnetwork/lnd/clock"
	"github.com/lightningnetwork/lnd/sqldb/v2"
)

// NewTestDB is a helper function that creates an BBolt database for testing.
func NewTestDB(t *testing.T, clock clock.Clock) FirewallDBs {
	return createStore(
		t,
		sqldb.NewTestSqliteDB(t, migrationstreams.LitdMigrationStreams).BaseDB,
		clock,
	)
}

// NewTestDBFromPath is a helper function that creates a new BoltStore with a
// connection to an existing BBolt database for testing.
func NewTestDBFromPath(t *testing.T, dbPath string,
	clock clock.Clock) FirewallDBs {

	tDb := sqldb.NewTestSqliteDBFromPath(
		t, dbPath, migrationstreams.LitdMigrationStreams,
	)

	return createStore(t, tDb.BaseDB, clock)
}
