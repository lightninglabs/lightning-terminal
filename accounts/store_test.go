package accounts

import (
	"testing"
	"time"

	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/lntypes"
	"github.com/stretchr/testify/require"
)

// TestAccountStore tests that accounts can be stored and retrieved correctly.
func TestAccountStore(t *testing.T) {
	t.Parallel()

	store, err := NewBoltStore(t.TempDir(), DBFilename)
	require.NoError(t, err)

	// An initial balance of 0 is not allowed, but later we can reach a
	// zero balance.
	_, err = store.NewAccount(0, time.Time{}, "")
	require.ErrorContains(t, err, "cannot have balance of 0")

	// Create an account that does not expire.
	acct1, err := store.NewAccount(123, time.Time{}, "foo")
	require.NoError(t, err)
	require.False(t, acct1.HasExpired())

	dbAccount, err := store.Account(acct1.ID)
	require.NoError(t, err)

	assertEqualAccounts(t, acct1, dbAccount)

	// Make sure we cannot create a second account with the same label.
	_, err = store.NewAccount(123, time.Time{}, "foo")
	require.ErrorContains(t, err, "account with the label 'foo' already")

	// Make sure we cannot set a label that looks like an account ID.
	_, err = store.NewAccount(123, time.Time{}, "0011223344556677")
	require.ErrorContains(t, err, "is not allowed as it can be mistaken")

	// Update all values of the account that we can modify.
	acct1.CurrentBalance = -500
	acct1.ExpirationDate = time.Now()
	acct1.Payments[lntypes.Hash{12, 34, 56, 78}] = &PaymentEntry{
		Status:     lnrpc.Payment_FAILED,
		FullAmount: 123456,
	}
	acct1.Payments[lntypes.Hash{34, 56, 78, 90}] = &PaymentEntry{
		Status:     lnrpc.Payment_SUCCEEDED,
		FullAmount: 789456123789,
	}
	acct1.Invoices[lntypes.Hash{12, 34, 56, 78}] = struct{}{}
	acct1.Invoices[lntypes.Hash{34, 56, 78, 90}] = struct{}{}
	err = store.UpdateAccount(acct1)
	require.NoError(t, err)

	dbAccount, err = store.Account(acct1.ID)
	require.NoError(t, err)
	assertEqualAccounts(t, acct1, dbAccount)

	// Sleep just a tiny bit to make sure we are never too quick to measure
	// the expiry, even though the time is nanosecond scale and writing to
	// the store and reading again should take at least a couple of
	// microseconds.
	time.Sleep(5 * time.Millisecond)
	require.True(t, acct1.HasExpired())

	// Test listing and deleting accounts.
	accounts, err := store.Accounts()
	require.NoError(t, err)
	require.Len(t, accounts, 1)

	err = store.RemoveAccount(acct1.ID)
	require.NoError(t, err)

	accounts, err = store.Accounts()
	require.NoError(t, err)
	require.Len(t, accounts, 0)

	_, err = store.Account(acct1.ID)
	require.ErrorIs(t, err, ErrAccNotFound)
}

// assertEqualAccounts asserts that two accounts are equal. This helper function
// is needed because an account contains two time.Time values that cannot be
// compared using reflect.DeepEqual().
func assertEqualAccounts(t *testing.T, expected,
	actual *OffChainBalanceAccount) {

	expectedExpiry := expected.ExpirationDate
	actualExpiry := actual.ExpirationDate
	expectedUpdate := expected.LastUpdate
	actualUpdate := actual.LastUpdate

	expected.ExpirationDate = time.Time{}
	expected.LastUpdate = time.Time{}
	actual.ExpirationDate = time.Time{}
	actual.LastUpdate = time.Time{}

	require.Equal(t, expected, actual)
	require.Equal(t, expectedExpiry.UnixNano(), actualExpiry.UnixNano())
	require.Equal(t, expectedUpdate.UnixNano(), actualUpdate.UnixNano())

	// Restore the old values to not influence the tests.
	expected.ExpirationDate = expectedExpiry
	expected.LastUpdate = expectedUpdate
	actual.ExpirationDate = actualExpiry
	actual.LastUpdate = actualUpdate
}

// TestLastInvoiceIndexes makes sure the last known invoice indexes can be
// stored and retrieved correctly.
func TestLastInvoiceIndexes(t *testing.T) {
	t.Parallel()

	store, err := NewBoltStore(t.TempDir(), DBFilename)
	require.NoError(t, err)

	_, _, err = store.LastIndexes()
	require.ErrorIs(t, err, ErrNoInvoiceIndexKnown)

	require.NoError(t, store.StoreLastIndexes(7, 99))

	add, settle, err := store.LastIndexes()
	require.NoError(t, err)
	require.EqualValues(t, 7, add)
	require.EqualValues(t, 99, settle)
}
