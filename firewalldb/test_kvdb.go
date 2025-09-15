//go:build !test_db_postgres && !test_db_sqlite

package firewalldb

import (
	"encoding/binary"
	"testing"

	"github.com/lightninglabs/lightning-terminal/session"
	"github.com/lightningnetwork/lnd/clock"
	"github.com/lightningnetwork/lnd/fn"
	"github.com/stretchr/testify/require"
)

// NewTestDB is a helper function that creates an BBolt database for testing.
func NewTestDB(t *testing.T, clock clock.Clock) FirewallDBs {
	return NewTestDBFromPath(t, t.TempDir(), clock)
}

// NewTestDBFromPath is a helper function that creates a new BoltStore with a
// connection to an existing BBolt database for testing.
func NewTestDBFromPath(t *testing.T, dbPath string,
	clock clock.Clock) FirewallDBs {

	return newDBFromPathWithSessions(t, dbPath, nil, nil, clock)
}

// NewTestDBWithSessions creates a new test BoltDB Store with access to an
// existing sessions DB.
func NewTestDBWithSessions(t *testing.T, sessStore session.Store,
	clock clock.Clock) FirewallDBs {

	return newDBFromPathWithSessions(t, t.TempDir(), sessStore, nil, clock)
}

// NewTestDBWithSessionsAndAccounts creates a new test BoltDB Store with access
// to an existing sessions DB and accounts DB.
func NewTestDBWithSessionsAndAccounts(t *testing.T, sessStore session.Store,
	acctStore AccountsDB, clock clock.Clock) FirewallDBs {

	return newDBFromPathWithSessions(
		t, t.TempDir(), sessStore, acctStore, clock,
	)
}

func newDBFromPathWithSessions(t *testing.T, dbPath string,
	sessStore session.Store, acctStore AccountsDB,
	clock clock.Clock) FirewallDBs {

	store, err := NewBoltDB(dbPath, DBFilename, sessStore, acctStore, clock)
	require.NoError(t, err)

	t.Cleanup(func() {
		require.NoError(t, store.DB.Close())
	})

	return store
}

func assertEqualActions(t *testing.T, expected, got *Action) {
	// Accounts are not explicitly linked in our bbolt DB implementation.
	actualAccountID := got.AccountID
	got.AccountID = expected.AccountID

	// As the kvdb implementation only stores the last 4 bytes Macaroon Root
	// Key ID, we pad it with 4 zero bytes when comparing.
	expectedMacRootKey := expected.MacaroonRootKeyID

	expectedMacRootKey.WhenSome(func(rootID uint64) {
		// Remove the 4 byte prefix of the actual Macaroon Root Key ID.
		sessID := session.IDFromMacRootKeyID(rootID)

		// Recreate the full 8 byte Macaroon Root Key ID (represented as
		// a uint64) by padding the first 4 bytes with zeroes.
		expected.MacaroonRootKeyID = fn.Some(
			uint64(binary.BigEndian.Uint32(sessID[:])),
		)
	})

	require.Equal(t, expected, got)
	got.AccountID = actualAccountID
	expected.MacaroonRootKeyID = expectedMacRootKey
}
