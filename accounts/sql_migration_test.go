package accounts

import (
	"context"
	"database/sql"
	"errors"
	"testing"
	"time"

	"github.com/lightninglabs/lightning-terminal/db"
	"github.com/lightningnetwork/lnd/clock"
	"github.com/lightningnetwork/lnd/fn"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/lntypes"
	"github.com/lightningnetwork/lnd/sqldb"
	"github.com/stretchr/testify/require"
)

// TestAccountStoreMigration tests the migration of account store from a bolt
// backed to a SQL database. Note that this test does not attempt to be a
// complete migration test.
func TestAccountStoreMigration(t *testing.T) {
	t.Parallel()

	ctx := context.Background()

	// When using build tags that creates a kvdb store for NewTestDB, we
	// skip this test as it is only applicable for postgres and sqlite tags.
	store := NewTestDB(t, clock.NewTestClock(time.Now()))
	if _, ok := store.(*BoltStore); ok {
		t.Skipf("Skipping account store migration test for kvdb build")
	}

	makeSQLDB := func(t *testing.T, clock *clock.TestClock) (*SQLStore,
		*db.TransactionExecutor[SQLQueries]) {

		testDBStore := NewTestDB(t, clock)
		store, ok := testDBStore.(*SQLStore)
		require.True(t, ok)

		baseDB := store.BaseDB

		genericExecutor := db.NewTransactionExecutor(
			baseDB, func(tx *sql.Tx) SQLQueries {
				return baseDB.WithTx(tx)
			},
		)

		return store, genericExecutor
	}

	migrationTest := func(t *testing.T, kvStore *BoltStore,
		clock *clock.TestClock, expectLastIndex bool) {

		sqlStore, txEx := makeSQLDB(t, clock)

		var opts sqldb.MigrationTxOptions
		err := txEx.ExecTx(
			ctx, &opts, func(tx SQLQueries) error {
				return MigrateAccountStoreToSQL(
					ctx, kvStore, tx,
				)
			},
		)
		require.NoError(t, err)

		// MigrateAccountStoreToSQL will check if the inserted accounts
		// and indices equals the migrated ones, but as a sanity check
		// we'll also fetch the accounts and indices from the store and
		// compare them to the original.
		// First we compare the migrated accounts to the original ones.
		kvAccounts, err := kvStore.Accounts(ctx)
		require.NoError(t, err)
		numAccounts := len(kvAccounts)

		sqlAccounts, err := sqlStore.Accounts(ctx)
		require.NoError(t, err)
		require.Equal(t, numAccounts, len(sqlAccounts))

		for i := 0; i < numAccounts; i++ {
			assertEqualAccounts(t, kvAccounts[i], sqlAccounts[i])
		}

		// After that we compare the migrated indices.
		kvAddIndex, kvSettleIndex, err := kvStore.LastIndexes(ctx)
		if errors.Is(err, ErrNoInvoiceIndexKnown) {
			// If the db doesn't have any indices, we can't compare
			// them.
			require.False(t, expectLastIndex)
			return
		} else {
			require.NoError(t, err)
			require.True(t, expectLastIndex)
		}

		sqlAddIndex, sqlSettleIndex, err := sqlStore.LastIndexes(ctx)
		require.NoError(t, err)

		require.Equal(t, kvAddIndex, sqlAddIndex)
		require.Equal(t, kvSettleIndex, sqlSettleIndex)
	}

	tests := []struct {
		name            string
		expectLastIndex bool
		populateDB      func(t *testing.T, kvStore *BoltStore)
	}{
		{
			"empty",
			false,
			// Don't populate the DB.
			func(t *testing.T, kvStore *BoltStore) {},
		},
		{
			"account no expiry",
			false,
			func(t *testing.T, kvStore *BoltStore) {
				// Create an account that does not expire.
				acct1, err := kvStore.NewAccount(
					ctx, 0, time.Time{}, "foo",
				)
				require.NoError(t, err)
				require.False(t, acct1.HasExpired())
			},
		},
		{
			"account with expiry",
			false,
			func(t *testing.T, kvStore *BoltStore) {
				// Create an account that does expire.
				acct1, err := kvStore.NewAccount(
					ctx, 0, time.Now().Add(time.Hour),
					"foo",
				)
				require.NoError(t, err)
				require.False(t, acct1.HasExpired())
			},
		},
		{
			"account with updated expiry",
			false,
			func(t *testing.T, kvStore *BoltStore) {
				// Create an account that does expire.
				acct1, err := kvStore.NewAccount(
					ctx, 0, time.Now().Add(time.Hour),
					"foo",
				)
				require.NoError(t, err)
				require.False(t, acct1.HasExpired())

				err = kvStore.UpdateAccountBalanceAndExpiry(
					ctx, acct1.ID, fn.None[int64](),
					fn.Some(time.Now().Add(time.Minute)),
				)
				require.NoError(t, err)
			},
		},
		{
			"account with balance",
			false,
			func(t *testing.T, kvStore *BoltStore) {
				// Create an account with balance
				acct1, err := kvStore.NewAccount(
					ctx, 100000, time.Time{}, "foo",
				)
				require.NoError(t, err)
				require.False(t, acct1.HasExpired())
			},
		},
		{
			"account with updated balance",
			false,
			func(t *testing.T, kvStore *BoltStore) {
				// Create an account with balance
				acct1, err := kvStore.NewAccount(
					ctx, 100000, time.Time{}, "foo",
				)
				require.NoError(t, err)
				require.False(t, acct1.HasExpired())

				err = kvStore.CreditAccount(
					ctx, acct1.ID, 10000,
				)
				require.NoError(t, err)

				err = kvStore.DebitAccount(
					ctx, acct1.ID, 20000,
				)
				require.NoError(t, err)
			},
		},
		{
			"account with invoices",
			true,
			func(t *testing.T, kvStore *BoltStore) {
				// Create an account with balance
				acct1, err := kvStore.NewAccount(
					ctx, 0, time.Time{}, "foo",
				)
				require.NoError(t, err)
				require.False(t, acct1.HasExpired())

				hash1 := lntypes.Hash{1, 2, 3, 4}
				err = kvStore.AddAccountInvoice(
					ctx, acct1.ID, hash1,
				)
				require.NoError(t, err)

				err = kvStore.StoreLastIndexes(ctx, 1, 0)
				require.NoError(t, err)

				hash2 := lntypes.Hash{1, 2, 3, 4, 5}
				err = kvStore.AddAccountInvoice(
					ctx, acct1.ID, hash2,
				)
				require.NoError(t, err)

				err = kvStore.StoreLastIndexes(ctx, 2, 1)
				require.NoError(t, err)
			},
		},
		{
			"account with payments",
			false,
			func(t *testing.T, kvStore *BoltStore) {
				// Create an account with balance
				acct1, err := kvStore.NewAccount(
					ctx, 0, time.Time{}, "foo",
				)
				require.NoError(t, err)
				require.False(t, acct1.HasExpired())

				hash1 := lntypes.Hash{1, 1, 1, 1}
				known, err := kvStore.UpsertAccountPayment(
					ctx, acct1.ID, hash1, 100,
					lnrpc.Payment_UNKNOWN,
				)
				require.NoError(t, err)
				require.False(t, known)

				hash2 := lntypes.Hash{2, 2, 2, 2}
				known, err = kvStore.UpsertAccountPayment(
					ctx, acct1.ID, hash2, 200,
					lnrpc.Payment_IN_FLIGHT,
				)
				require.NoError(t, err)
				require.False(t, known)

				hash3 := lntypes.Hash{3, 3, 3, 3}
				known, err = kvStore.UpsertAccountPayment(
					ctx, acct1.ID, hash3, 200,
					lnrpc.Payment_SUCCEEDED,
				)
				require.NoError(t, err)
				require.False(t, known)

				hash4 := lntypes.Hash{4, 4, 4, 4}
				known, err = kvStore.UpsertAccountPayment(
					ctx, acct1.ID, hash4, 200,
					lnrpc.Payment_FAILED,
				)
				require.NoError(t, err)
				require.False(t, known)
			},
		},
		{
			"multiple accounts",
			true,
			func(t *testing.T, kvStore *BoltStore) {
				// Create two accounts with balance and that
				// expires.
				acct1, err := kvStore.NewAccount(
					ctx, 100000, time.Now().Add(time.Hour),
					"foo",
				)
				require.NoError(t, err)
				require.False(t, acct1.HasExpired())

				acct2, err := kvStore.NewAccount(
					ctx, 200000, time.Now().Add(time.Hour),
					"bar",
				)
				require.NoError(t, err)
				require.False(t, acct2.HasExpired())

				// Create invoices for both accounts.
				hash1 := lntypes.Hash{1, 1, 1, 1}
				err = kvStore.AddAccountInvoice(
					ctx, acct1.ID, hash1,
				)
				require.NoError(t, err)

				err = kvStore.StoreLastIndexes(ctx, 1, 0)
				require.NoError(t, err)

				hash2 := lntypes.Hash{2, 2, 2, 2}
				err = kvStore.AddAccountInvoice(
					ctx, acct2.ID, hash2,
				)
				require.NoError(t, err)

				err = kvStore.StoreLastIndexes(ctx, 2, 0)
				require.NoError(t, err)

				// Create payments for both accounts.
				hash3 := lntypes.Hash{3, 3, 3, 3}
				known, err := kvStore.UpsertAccountPayment(
					ctx, acct1.ID, hash3, 100,
					lnrpc.Payment_SUCCEEDED,
				)
				require.NoError(t, err)
				require.False(t, known)

				hash4 := lntypes.Hash{4, 4, 4, 4}
				known, err = kvStore.UpsertAccountPayment(
					ctx, acct2.ID, hash4, 200,
					lnrpc.Payment_IN_FLIGHT,
				)
				require.NoError(t, err)
				require.False(t, known)
			},
		},
	}

	for _, test := range tests {
		tc := test

		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			var kvStore *BoltStore
			testClock := clock.NewTestClock(time.Now())

			kvStore, err := NewBoltStore(
				t.TempDir(), DBFilename, testClock,
			)
			require.NoError(t, err)

			tc.populateDB(t, kvStore)

			t.Cleanup(func() {
				require.NoError(t, kvStore.db.Close())
			})

			migrationTest(t, kvStore, testClock, tc.expectLastIndex)
		})
	}
}
