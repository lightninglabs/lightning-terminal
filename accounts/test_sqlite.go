//go:build test_db_sqlite && !test_db_postgres

package accounts

import (
	"errors"
	"testing"

	"github.com/lightninglabs/lightning-terminal/db"
	"github.com/lightningnetwork/lnd/clock"
)

// ErrDBClosed is an error that is returned when a database operation is
// performed on a closed database.
var ErrDBClosed = errors.New("database is closed")

// NewTestDB is a helper function that creates an SQLStore database for testing.
func NewTestDB(t *testing.T, clock clock.Clock) Store {
	return createStore(t, db.NewTestSqliteDB(t).BaseDB, clock)
}

// NewTestDBFromPath is a helper function that creates a new SQLStore with a
// connection to an existing SQL database for testing.
func NewTestDBFromPath(t *testing.T, dbPath string,
	clock clock.Clock) Store {

	return createStore(
		t, db.NewTestSqliteDbHandleFromPath(t, dbPath).BaseDB, clock,
	)
}
