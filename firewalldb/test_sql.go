//go:build test_db_postgres || test_db_sqlite

package firewalldb

import (
	"testing"

	"github.com/lightninglabs/lightning-terminal/session"
	"github.com/stretchr/testify/require"
)

// NewTestDBWithSessions creates a new test SQLDB Store with access to an
// existing sessions DB.
func NewTestDBWithSessions(t *testing.T, sessionStore session.Store) *SQLDB {
	sessions, ok := sessionStore.(*session.SQLStore)
	require.True(t, ok)

	return NewSQLDB(sessions.BaseDB)
}
