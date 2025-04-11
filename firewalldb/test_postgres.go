//go:build test_db_postgres && !test_db_sqlite

package firewalldb

import (
	"testing"

	"github.com/lightninglabs/lightning-terminal/db"
)

// NewTestDB is a helper function that creates an BBolt database for testing.
func NewTestDB(t *testing.T) *SQLDB {
	return NewSQLDB(db.NewTestPostgresDB(t).BaseDB)
}

// NewTestDBFromPath is a helper function that creates a new BoltStore with a
// connection to an existing BBolt database for testing.
func NewTestDBFromPath(t *testing.T, _ string) *SQLDB {
	return NewSQLDB(db.NewTestPostgresDB(t).BaseDB)
}
