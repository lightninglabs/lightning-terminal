package accounts

import (
	"context"
	"testing"
	"time"

	"github.com/lightningnetwork/lnd/fn"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/lntypes"
	"github.com/lightningnetwork/lnd/lnwire"
	"github.com/stretchr/testify/require"
)

// TestAccountStore tests that accounts can be stored and retrieved correctly.
func TestAccountStore(t *testing.T) {
	t.Parallel()
	ctx := context.Background()

	store := NewTestDB(t)

	// Create an account that does not expire.
	acct1, err := store.NewAccount(ctx, 0, time.Time{}, "foo")
	require.NoError(t, err)
	require.False(t, acct1.HasExpired())

	dbAccount, err := store.Account(ctx, acct1.ID)
	require.NoError(t, err)

	assertEqualAccounts(t, acct1, dbAccount)

	// Make sure we cannot create a second account with the same label.
	_, err = store.NewAccount(ctx, 123, time.Time{}, "foo")
	require.ErrorIs(t, err, ErrLabelAlreadyExists)

	// Make sure we cannot set a label that looks like an account ID.
	_, err = store.NewAccount(ctx, 123, time.Time{}, "0011223344556677")
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
	err = store.UpdateAccount(ctx, acct1)
	require.NoError(t, err)

	dbAccount, err = store.Account(ctx, acct1.ID)
	require.NoError(t, err)
	assertEqualAccounts(t, acct1, dbAccount)

	// Sleep just a tiny bit to make sure we are never too quick to measure
	// the expiry, even though the time is nanosecond scale and writing to
	// the store and reading again should take at least a couple of
	// microseconds.
	time.Sleep(5 * time.Millisecond)
	require.True(t, acct1.HasExpired())

	// Test listing and deleting accounts.
	accounts, err := store.Accounts(ctx)
	require.NoError(t, err)
	require.Len(t, accounts, 1)

	err = store.RemoveAccount(ctx, acct1.ID)
	require.NoError(t, err)

	accounts, err = store.Accounts(ctx)
	require.NoError(t, err)
	require.Len(t, accounts, 0)

	_, err = store.Account(ctx, acct1.ID)
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

// TestAccountUpdateMethods tests that all the Store methods that update an
// account work correctly.
func TestAccountUpdateMethods(t *testing.T) {
	t.Parallel()
	ctx := context.Background()

	t.Run("UpdateAccountBalanceAndExpiry", func(t *testing.T) {
		store := NewTestDB(t)

		// Ensure that the function errors out if we try update an
		// account that does not exist.
		err := store.UpdateAccountBalanceAndExpiry(
			ctx, AccountID{}, fn.None[lnwire.MilliSatoshi](),
			fn.None[time.Time](),
		)
		require.ErrorIs(t, err, ErrAccNotFound)

		acct, err := store.NewAccount(ctx, 0, time.Time{}, "foo")
		require.NoError(t, err)

		assertBalanceAndExpiry := func(balance lnwire.MilliSatoshi,
			expiry time.Time) {

			dbAcct, err := store.Account(ctx, acct.ID)
			require.NoError(t, err)
			require.EqualValues(t, balance, dbAcct.CurrentBalance)
			require.WithinDuration(
				t, expiry, dbAcct.ExpirationDate, 0,
			)
		}

		// Get the account from the store and check to see what its
		// initial balance and expiry fields are set to.
		assertBalanceAndExpiry(0, time.Time{})

		// Now, update just the balance of the account.
		newBalance := lnwire.MilliSatoshi(123)
		err = store.UpdateAccountBalanceAndExpiry(
			ctx, acct.ID, fn.Some(newBalance), fn.None[time.Time](),
		)
		require.NoError(t, err)
		assertBalanceAndExpiry(newBalance, time.Time{})

		// Now update just the expiry of the account.
		newExpiry := time.Now().Add(time.Hour)
		err = store.UpdateAccountBalanceAndExpiry(
			ctx, acct.ID, fn.None[lnwire.MilliSatoshi](),
			fn.Some(newExpiry),
		)
		require.NoError(t, err)
		assertBalanceAndExpiry(newBalance, newExpiry)

		// Update both the balance and expiry of the account.
		newBalance = 456
		newExpiry = time.Now().Add(2 * time.Hour)
		err = store.UpdateAccountBalanceAndExpiry(
			ctx, acct.ID, fn.Some(newBalance), fn.Some(newExpiry),
		)
		require.NoError(t, err)
		assertBalanceAndExpiry(newBalance, newExpiry)

		// Finally, test an update that has no net changes to the
		// balance or expiry.
		err = store.UpdateAccountBalanceAndExpiry(
			ctx, acct.ID, fn.None[lnwire.MilliSatoshi](),
			fn.None[time.Time](),
		)
		require.NoError(t, err)
		assertBalanceAndExpiry(newBalance, newExpiry)
	})

	t.Run("AddAccountInvoice", func(t *testing.T) {
		store := NewTestDB(t)

		acct, err := store.NewAccount(ctx, 0, time.Time{}, "foo")
		require.NoError(t, err)

		assertInvoices := func(invoices ...lntypes.Hash) {
			dbAcct, err := store.Account(ctx, acct.ID)
			require.NoError(t, err)

			// First make sure the number of invoices match before
			// de-duping the hashes.
			require.Len(t, dbAcct.Invoices, len(invoices))

			dbInvs := make([]lntypes.Hash, 0, len(dbAcct.Invoices))
			for hash := range dbAcct.Invoices {
				dbInvs = append(dbInvs, hash)
			}

			require.ElementsMatch(t, invoices, dbInvs)
		}

		// The account initially has no invoices.
		assertInvoices()

		// Adding an invoice to an account that doesnt exist yet should
		// error out.
		err = store.AddAccountInvoice(ctx, AccountID{}, lntypes.Hash{})
		require.ErrorIs(t, err, ErrAccNotFound)

		// Add an invoice to the account.
		hash1 := lntypes.Hash{1, 2, 3, 4}
		err = store.AddAccountInvoice(ctx, acct.ID, hash1)
		require.NoError(t, err)

		assertInvoices(hash1)

		// Assert that adding the same invoice again does not change the
		// state.
		err = store.AddAccountInvoice(ctx, acct.ID, hash1)
		require.NoError(t, err)

		assertInvoices(hash1)

		// Now add a second invoice.
		hash2 := lntypes.Hash{5, 6, 7, 8}
		err = store.AddAccountInvoice(ctx, acct.ID, hash2)
		require.NoError(t, err)

		assertInvoices(hash1, hash2)
	})

	t.Run("IncreaseAccountBalance", func(t *testing.T) {
		store := NewTestDB(t)

		// Increasing the balance of an account that doesn't exist
		// should error out.
		err := store.IncreaseAccountBalance(ctx, AccountID{}, 100)
		require.ErrorIs(t, err, ErrAccNotFound)

		acct, err := store.NewAccount(ctx, 123, time.Time{}, "foo")
		require.NoError(t, err)

		assertBalance := func(balance int64) {
			dbAcct, err := store.Account(ctx, acct.ID)
			require.NoError(t, err)
			require.EqualValues(t, balance, dbAcct.CurrentBalance)
		}

		// The account initially has a balance of 123.
		assertBalance(123)

		// Increase the balance by 100 and assert that the new balance
		// is 223.
		err = store.IncreaseAccountBalance(ctx, acct.ID, 100)
		require.NoError(t, err)

		assertBalance(223)
	})
}

// TestLastInvoiceIndexes makes sure the last known invoice indexes can be
// stored and retrieved correctly.
func TestLastInvoiceIndexes(t *testing.T) {
	t.Parallel()
	ctx := context.Background()

	store := NewTestDB(t)

	_, _, err := store.LastIndexes(ctx)
	require.ErrorIs(t, err, ErrNoInvoiceIndexKnown)

	require.NoError(t, store.StoreLastIndexes(ctx, 7, 99))

	add, settle, err := store.LastIndexes(ctx)
	require.NoError(t, err)
	require.EqualValues(t, 7, add)
	require.EqualValues(t, 99, settle)
}
