package accounts

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"testing"
	"time"

	"github.com/lightninglabs/lightning-terminal/db"
	"github.com/lightningnetwork/lnd/clock"
	"github.com/lightningnetwork/lnd/fn"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/lntypes"
	"github.com/lightningnetwork/lnd/lnwire"
	"github.com/lightningnetwork/lnd/sqldb"
	"github.com/stretchr/testify/require"
	"golang.org/x/exp/rand"
	"pgregory.net/rapid"
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
		{
			"randomized accounts",
			true,
			randomizeAccounts,
		},
		{
			"rapid randomized accounts",
			true,
			rapidRandomizeAccounts,
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

// randomizeAccounts adds 10 randomized accounts to the kvStore, each with
// 50-1000 invoices and payments. The accounts are randomized in terms of
// balance, expiry, number of invoices and payments, and payment status.
func randomizeAccounts(t *testing.T, kvStore *BoltStore) {
	ctx := context.Background()

	var (
		// numberOfAccounts is set to 10 to add enough accounts to get
		// enough variation between number of invoices and payments, but
		// kept low enough for the test not take too long to run, as the
		// test time increases drastically by the number of accounts we
		// migrate.
		numberOfAccounts        = 10
		invoiceCounter   uint64 = 0
	)

	for i := 0; i < numberOfAccounts; i++ {
		label := fmt.Sprintf("account%d", i)

		// randomize balance from 1,000 to 100,000,000
		balance := lnwire.MilliSatoshi(
			rand.Int63n(100000000-1000) + 1000,
		)

		// randomize expiry from 10 to 10,000 minutes
		expiry := time.Now().Add(
			time.Minute * time.Duration(rand.Intn(10000-10)+10),
		)

		acct, err := kvStore.NewAccount(ctx, balance, expiry, label)
		require.NoError(t, err)

		// Add from 50 to 1000 invoices for the account
		numberOfInvoices := rand.Intn(1000-50) + 50
		for j := 0; j < numberOfInvoices; j++ {
			invoiceCounter++

			var rHash lntypes.Hash
			_, err := rand.Read(rHash[:])
			require.NoError(t, err)

			err = kvStore.AddAccountInvoice(ctx, acct.ID, rHash)
			require.NoError(t, err)

			err = kvStore.StoreLastIndexes(ctx, invoiceCounter, 0)
			require.NoError(t, err)
		}

		// Add from 50 to 1000 payments for the account
		numberOfPayments := rand.Intn(1000-50) + 50
		for j := 0; j < numberOfPayments; j++ {
			var rHash lntypes.Hash
			_, err := rand.Read(rHash[:])
			require.NoError(t, err)

			// randomize amt from 1,000 to 100,000,000
			amt := lnwire.MilliSatoshi(
				rand.Int63n(100000000-1000) + 1000,
			)

			// Ensure that we get an almost equal amount of
			// different payment statuses for the payments
			status := paymentStatus(j)

			known, err := kvStore.UpsertAccountPayment(
				ctx, acct.ID, rHash, amt, status,
			)
			require.NoError(t, err)
			require.False(t, known)
		}
	}
}

// RapidRandomizeAccounts is a rapid test that generates randomized
// accounts using rapid, invoices and payments, and inserts them into the
// kvStore. Each account is generated with a random balance, expiry, label,
// and a random number of 20-100 invoices and payments. The invoices and
// payments are also generated with random hashes and amounts.
func rapidRandomizeAccounts(t *testing.T, kvStore *BoltStore) {
	invoiceCounter := uint64(0)

	rapid.Check(t, func(t *rapid.T) {
		ctx := context.Background()

		// Generate the randomized account for this check run.
		acct := makeAccountGen().Draw(t, "account")

		// Then proceed to insert the account with its invoices and
		// payments into the db
		newAcct, err := kvStore.NewAccount(
			ctx, acct.balance, acct.expiry, acct.label,
		)
		require.NoError(t, err)

		for _, invoiceHash := range acct.invoices {
			invoiceCounter++

			err := kvStore.AddAccountInvoice(
				ctx, newAcct.ID, invoiceHash,
			)
			require.NoError(t, err)

			err = kvStore.StoreLastIndexes(ctx, invoiceCounter, 0)
			require.NoError(t, err)
		}

		for _, pmt := range acct.payments {
			// Note that as rapid can generate multiple payments
			// of the same values, we cannot be sure that the
			// payment is unknown.
			_, err := kvStore.UpsertAccountPayment(
				ctx, newAcct.ID, pmt.hash, pmt.amt, pmt.status,
			)
			require.NoError(t, err)
		}
	})
}

// makeAccountGen returns a rapid generator that generates accounts, with
// random labels, balances, expiry times, and between 20-100 randomly generated
// invoices and payments. The invoices and payments are also generated with
// random hashes and amounts.
func makeAccountGen() *rapid.Generator[account] {
	return rapid.Custom[account](func(t *rapid.T) account {
		// As the store has a unique constraint for inserting labels,
		// we don't use rapid to generate it, and instead use
		// sufficiently large random number as the account suffix to
		// avoid collisions.
		label := fmt.Sprintf("account:%d", rand.Int63())

		balance := lnwire.MilliSatoshi(
			rapid.Int64Range(1000, 100000000).Draw(
				t, fmt.Sprintf("balance_%s", label),
			),
		)

		expiry := time.Now().Add(
			time.Duration(
				rapid.IntRange(10, 10000).Draw(
					t, fmt.Sprintf("expiry_%s", label),
				),
			) * time.Minute,
		)

		// Generate the random invoices
		numInvoices := rapid.IntRange(20, 100).Draw(
			t, fmt.Sprintf("numInvoices_%s", label),
		)
		invoices := make([]lntypes.Hash, numInvoices)
		for i := range invoices {
			invoices[i] = randomHash(
				t, fmt.Sprintf("invoiceHash_%s_%d", label, i),
			)
		}

		// Generate the random payments
		numPayments := rapid.IntRange(20, 100).Draw(
			t, fmt.Sprintf("numPayments_%s", label),
		)
		payments := make([]payment, numPayments)
		for i := range payments {
			hashName := fmt.Sprintf("paymentHash_%s_%d", label, i)
			amtName := fmt.Sprintf("amt_%s_%d", label, i)

			payments[i] = payment{
				hash: randomHash(t, hashName),
				amt: lnwire.MilliSatoshi(
					rapid.Int64Range(1000, 100000000).Draw(
						t, amtName,
					),
				),
				status: paymentStatus(i),
			}
		}

		return account{
			label:    label,
			balance:  balance,
			expiry:   expiry,
			invoices: invoices,
			payments: payments,
		}
	})
}

// randomHash generates a random hash of 32 bytes. It uses rapid to generate
// the random bytes, and then copies them into a lntypes.Hash struct.
func randomHash(t *rapid.T, name string) lntypes.Hash {
	hashBytes := rapid.SliceOfN[byte](rapid.Byte(), 32, 32).Draw(t, name)
	var hash lntypes.Hash
	copy(hash[:], hashBytes)
	return hash
}

// paymentStatus returns a payment status based on the given index by taking
// the index modulo 4. This ensures an approximately equal distribution of
// different payment statuses across payments.
func paymentStatus(i int) lnrpc.Payment_PaymentStatus {
	switch i % 4 {
	case 0:
		return lnrpc.Payment_SUCCEEDED
	case 1:
		return lnrpc.Payment_IN_FLIGHT
	case 2:
		return lnrpc.Payment_UNKNOWN
	default:
		return lnrpc.Payment_FAILED
	}
}

type account struct {
	label    string
	balance  lnwire.MilliSatoshi
	expiry   time.Time
	invoices []lntypes.Hash
	payments []payment
}

type payment struct {
	hash   lntypes.Hash
	amt    lnwire.MilliSatoshi
	status lnrpc.Payment_PaymentStatus
}
