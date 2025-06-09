//go:build test_db_postgres || test_db_sqlite

package firewalldb

import (
	"testing"
	"time"

	"github.com/lightninglabs/lightning-terminal/accounts"
	"github.com/lightninglabs/lightning-terminal/db"
	"github.com/lightninglabs/lightning-terminal/session"
	"github.com/lightningnetwork/lnd/clock"
	"github.com/stretchr/testify/require"
)

// NewTestDBWithSessions creates a new test SQLDB Store with access to an
// existing sessions DB.
func NewTestDBWithSessions(t *testing.T, sessionStore session.Store,
	clock clock.Clock) *SQLDB {

	sessions, ok := sessionStore.(*session.SQLStore)
	require.True(t, ok)

	return createStore(t, sessions.BaseDB, clock)
}

// NewTestDBWithSessionsAndAccounts creates a new test SQLDB Store with access
// to an existing sessions DB and accounts DB.
func NewTestDBWithSessionsAndAccounts(t *testing.T, sessionStore SessionDB,
	acctStore AccountsDB, clock clock.Clock) *SQLDB {

	sessions, ok := sessionStore.(*session.SQLStore)
	require.True(t, ok)

	accounts, ok := acctStore.(*accounts.SQLStore)
	require.True(t, ok)

	require.Equal(t, accounts.BaseDB, sessions.BaseDB)

	return createStore(t, sessions.BaseDB, clock)
}

func assertEqualActions(t *testing.T, expected, got *Action) {
	expectedAttemptedAt := expected.AttemptedAt
	actualAttemptedAt := got.AttemptedAt

	expected.AttemptedAt = time.Time{}
	got.AttemptedAt = time.Time{}

	require.Equal(t, expected, got)
	require.Equal(t, expectedAttemptedAt.Unix(), actualAttemptedAt.Unix())

	expected.AttemptedAt = expectedAttemptedAt
	got.AttemptedAt = actualAttemptedAt
}

// createStore is a helper function that creates a new SQLDB and ensure that
// it is closed when during the test cleanup.
func createStore(t *testing.T, sqlDB *db.BaseDB, clock clock.Clock) *SQLDB {
	store := NewSQLDB(sqlDB, clock)
	t.Cleanup(func() {
		require.NoError(t, store.Close())
	})

	return store
}
