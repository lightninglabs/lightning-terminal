//go:build test_db_postgres || test_db_sqlite

package session

import (
	"testing"

	"github.com/lightninglabs/lightning-terminal/accounts"
	"github.com/lightningnetwork/lnd/clock"
	"github.com/stretchr/testify/require"
)

func NewTestDBWithAccounts(t *testing.T, clock clock.Clock,
	acctStore accounts.Store) *SQLStore {

	accounts, ok := acctStore.(*accounts.SQLStore)
	require.True(t, ok)

	return NewSQLStore(accounts.BaseDB, clock)
}
