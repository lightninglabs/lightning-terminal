package accounts

import (
	"context"
	"database/sql"
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
	clock := clock.NewTestClock(time.Now())

	// When using build tags that creates a kvdb store for NewTestDB, we
	// skip this test as it is only applicable for postgres and sqlite tags.
	store := NewTestDB(t, clock)
	if _, ok := store.(*BoltStore); ok {
		t.Skipf("Skipping account store migration test for kvdb build")
	}

	makeSQLDB := func(t *testing.T) (*SQLStore,
		*db.TransactionExecutor[SQLQueries]) {

		testDBStore := NewTestDB(t, clock)
		t.Cleanup(func() {
			require.NoError(t, testDBStore.Close())
		})

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

	assertMigrationResults := func(t *testing.T, sqlStore *SQLStore,
		kvAccounts []*OffChainBalanceAccount, kvAddIndex uint64,
		kvSettleIndex uint64, expectLastIndex bool) {

		// The migration function will check if the inserted accounts
		// and indices equals the migrated ones, but as a sanity check
		// we'll also fetch the accounts and indices from the sql store
		// and compare them to the original.
		// First we compare the migrated accounts to the original ones.
		sqlAccounts, err := sqlStore.Accounts(ctx)
		require.NoError(t, err)
		require.Equal(t, len(kvAccounts), len(sqlAccounts))

		for i := 0; i < len(kvAccounts); i++ {
			assertEqualAccounts(t, kvAccounts[i], sqlAccounts[i])
		}

		// After that we compare the migrated indices. However, if we
		// don't expect the last indexes to be set, we don't need to
		// compare them.
		if !expectLastIndex {
			return
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
			name:            "empty",
			expectLastIndex: false,
			populateDB: func(t *testing.T, kvStore *BoltStore) {
				// Don't populate the DB.
			},
		},
		{
			name:            "account no expiry",
			expectLastIndex: false,
			populateDB: func(t *testing.T, kvStore *BoltStore) {
				// Create an account that does not expire.
				acct1, err := kvStore.NewAccount(
					ctx, 0, time.Time{}, "foo",
				)
				require.NoError(t, err)
				require.False(t, acct1.HasExpired())
			},
		},
		{
			name:            "account with expiry",
			expectLastIndex: false,
			populateDB: func(t *testing.T, kvStore *BoltStore) {
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
			name:            "account with set UpdatedAt",
			expectLastIndex: false,
			populateDB: func(t *testing.T, kvStore *BoltStore) {
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
			name:            "account with balance",
			expectLastIndex: false,
			populateDB: func(t *testing.T, kvStore *BoltStore) {
				// Create an account with balance
				acct1, err := kvStore.NewAccount(
					ctx, 100000, time.Time{}, "foo",
				)
				require.NoError(t, err)
				require.False(t, acct1.HasExpired())
			},
		},
		{
			name:            "account with invoices",
			expectLastIndex: true,
			populateDB: func(t *testing.T, kvStore *BoltStore) {
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
			name:            "account with payments",
			expectLastIndex: false,
			populateDB: func(t *testing.T, kvStore *BoltStore) {
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
			name:            "multiple accounts",
			expectLastIndex: true,
			populateDB: func(t *testing.T, kvStore *BoltStore) {
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
		t.Run(test.name, func(t *testing.T) {
			t.Parallel()

			// Create a new kvdb store to populate with test data.
			kvStore, err := NewBoltStore(
				t.TempDir(), DBFilename, clock,
			)
			require.NoError(t, err)
			t.Cleanup(func() {
				require.NoError(t, kvStore.db.Close())
			})

			// Populate the kv store.
			test.populateDB(t, kvStore)

			// Create the SQL store that we will migrate the data
			// to.
			sqlStore, txEx := makeSQLDB(t)

			// We fetch the accounts and indices from the kvStore
			// before migrating them to the SQL store, just to
			// ensure that the migration doesn't affect the original
			// data.
			kvAccounts, err := kvStore.Accounts(ctx)
			require.NoError(t, err)

			kvAddIndex, kvSettleIndex, err := kvStore.LastIndexes(
				ctx,
			)

			if !test.expectLastIndex {
				// If the test expects there to be no invoices
				// indices, we also verify that the database
				// contains none.
				require.ErrorIs(t, err, ErrNoInvoiceIndexKnown)
			} else {
				require.NoError(t, err)
			}

			// Perform the migration.
			var opts sqldb.MigrationTxOptions
			err = txEx.ExecTx(ctx, &opts,
				func(tx SQLQueries) error {
					return MigrateAccountStoreToSQL(
						ctx, kvStore, tx,
					)
				},
			)
			require.NoError(t, err)

			// Assert migration results.
			assertMigrationResults(
				t, sqlStore, kvAccounts, kvAddIndex,
				kvSettleIndex, test.expectLastIndex,
			)
		})
	}
}
