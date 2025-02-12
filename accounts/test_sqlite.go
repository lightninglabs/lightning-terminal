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

// NewTestDB is a helper function that creates an BBolt database for testing.
func NewTestDB(t *testing.T, clock clock.Clock) *SQLStore {
	return NewSQLStore(db.NewTestSqliteDB(t).BaseDB, clock)
}

// NewTestDBFromPath is a helper function that creates a new BoltStore with a
// connection to an existing BBolt database for testing.
func NewTestDBFromPath(t *testing.T, dbPath string,
	clock clock.Clock) *SQLStore {

	return NewSQLStore(
		db.NewTestSqliteDbHandleFromPath(t, dbPath).BaseDB, clock,
	)
}
