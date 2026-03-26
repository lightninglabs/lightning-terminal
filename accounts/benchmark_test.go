package accounts

import (
	"context"
	"encoding/binary"
	"path/filepath"
	"testing"
	"time"

	"github.com/lightninglabs/lightning-terminal/db"
	"github.com/lightninglabs/lightning-terminal/db/sqlc"
	"github.com/lightningnetwork/lnd/clock"
	"github.com/lightningnetwork/lnd/fn"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/lntypes"
	"github.com/lightningnetwork/lnd/lnwire"
	"github.com/lightningnetwork/lnd/sqldb/v2"
	"github.com/stretchr/testify/require"
)

// NOTE: Set this to true if you also want to benchmark with a postgres backend.
var benchPostgres = false

// BenchmarkAccountStore benchmarks common account store operations across
// supported DB backends.
func BenchmarkAccountStore(b *testing.B) {
	for _, backend := range accountBenchBackends(b) {
		backend := backend
		b.Run(backend.name, func(b *testing.B) {
			runAccountBench(
				b, backend, "NewAccount", benchmarkAccountNew,
			)
			runAccountBench(
				b, backend, "UpdateBalance",
				benchmarkAccountUpdateBalance,
			)
			runAccountBench(
				b, backend, "AddInvoice",
				benchmarkAccountAddInvoice,
			)
			runAccountBench(
				b, backend, "CreditAccount",
				benchmarkAccountCredit,
			)
			runAccountBench(
				b, backend, "DebitAccount",
				benchmarkAccountDebit,
			)
			runAccountBench(
				b, backend, "UpsertPayment",
				benchmarkAccountUpsertPayment,
			)
			runAccountBench(
				b, backend, "DeletePayment",
				benchmarkAccountDeletePayment,
			)
			runAccountBench(
				b, backend, "RemoveAccount",
				benchmarkAccountRemove,
			)
			runAccountBench(
				b, backend, "GetAccount",
				benchmarkAccountGet,
			)
			runAccountBench(
				b, backend, "ListAccounts",
				benchmarkAccountList,
			)
			runAccountBench(
				b, backend, "StoreLastIndexes",
				benchmarkAccountStoreLastIndexes,
			)
			runAccountBench(
				b, backend, "LastIndexes",
				benchmarkAccountLastIndexes,
			)
		})
	}
}

type accountBenchBackend struct {
	name     string
	newStore func(b *testing.B) Store
}

func runAccountBench(b *testing.B, backend accountBenchBackend, name string,
	fn func(b *testing.B, store Store)) {

	b.Run(name, func(b *testing.B) {
		store := backend.newStore(b)
		b.Cleanup(func() {
			require.NoError(b, store.Close())
		})

		fn(b, store)
	})
}

func accountBenchBackends(b *testing.B) []accountBenchBackend {
	backends := []accountBenchBackend{
		{
			name: "kvdb-bbolt",
			newStore: func(b *testing.B) Store {
				clk := clock.NewTestClock(time.Now())
				dir := b.TempDir()
				store, err := NewBoltStore(dir, DBFilename, clk)
				require.NoError(b, err)
				return store
			},
		},
		{
			name: "native-sqlite",
			newStore: func(b *testing.B) Store {
				clk := clock.NewTestClock(time.Now())
				dbFile := filepath.Join(
					b.TempDir(), "accounts.sqlite",
				)

				sqlStore, err := sqldb.NewSqliteStore(
					&sqldb.SqliteConfig{
						SkipMigrations: false,
					},
					dbFile,
				)
				require.NoError(b, err)

				require.NoError(
					b,
					sqldb.ApplyAllMigrations(
						sqlStore,
						db.MakeTestMigrationSets(),
					),
				)

				queries := sqlc.NewForType(
					sqlStore.BaseDB,
					sqlStore.BaseDB.BackendType,
				)
				return NewSQLStore(
					sqlStore.BaseDB, queries, clk,
				)
			},
		},
	}

	if benchPostgres {
		backends = append(backends, accountBenchBackend{
			name: "native-postgres",
			newStore: func(b *testing.B) Store {
				clk := clock.NewTestClock(time.Now())
				fixture := sqldb.NewTestPgFixture(
					b, db.DefaultPostgresFixtureLifetime,
				)
				b.Cleanup(func() {
					fixture.TearDown(b)
				})

				sqlStore := sqldb.NewTestPostgresDB(
					b, fixture,
					db.MakeTestMigrationSets(),
				)

				queries := sqlc.NewForType(
					sqlStore.BaseDB,
					sqlStore.BaseDB.BackendType,
				)
				return NewSQLStore(
					sqlStore.BaseDB, queries, clk,
				)
			},
		})
	}

	return backends
}

// benchmarkAccountNew measures account creation performance.
func benchmarkAccountNew(b *testing.B, store Store) {
	ctx := context.Background()

	b.ReportAllocs()
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		_, err := store.NewAccount(
			ctx, 1000, time.Time{}, "",
		)
		require.NoError(b, err)
	}
}

// benchmarkAccountUpdateBalance measures balance update performance.
func benchmarkAccountUpdateBalance(b *testing.B, store Store) {
	ctx := context.Background()

	acct, err := store.NewAccount(ctx, 1000, time.Time{}, "")
	require.NoError(b, err)

	b.ReportAllocs()
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		newBalance := fn.Some(int64(i))
		err := store.UpdateAccountBalanceAndExpiry(
			ctx, acct.ID, newBalance, fn.None[time.Time](),
		)
		require.NoError(b, err)
	}
}

// benchmarkAccountAddInvoice measures invoice association performance.
func benchmarkAccountAddInvoice(b *testing.B, store Store) {
	ctx := context.Background()

	acct, err := store.NewAccount(ctx, 1000, time.Time{}, "")
	require.NoError(b, err)

	b.ReportAllocs()
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		var hash lntypes.Hash
		binary.BigEndian.PutUint64(hash[:], uint64(i))
		err := store.AddAccountInvoice(ctx, acct.ID, hash)
		require.NoError(b, err)
	}
}

// benchmarkAccountUpsertPayment measures payment upsert performance.
func benchmarkAccountUpsertPayment(b *testing.B, store Store) {
	ctx := context.Background()

	acct, err := store.NewAccount(ctx, 1000, time.Time{}, "")
	require.NoError(b, err)

	b.ReportAllocs()
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		var hash lntypes.Hash
		binary.BigEndian.PutUint64(hash[:], uint64(i))
		_, err := store.UpsertAccountPayment(
			ctx, acct.ID, hash, lnwire.MilliSatoshi(1000),
			lnrpc.Payment_SUCCEEDED,
		)
		require.NoError(b, err)
	}
}

// benchmarkAccountDeletePayment measures payment delete performance.
func benchmarkAccountDeletePayment(b *testing.B, store Store) {
	ctx := context.Background()

	acct, err := store.NewAccount(ctx, 1000, time.Time{}, "")
	require.NoError(b, err)

	b.ReportAllocs()
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		var hash lntypes.Hash
		binary.BigEndian.PutUint64(hash[:], uint64(i))

		// As this function should benchmark the DeleteAccountPayment
		// function, ensure that the timer isn't running when
		// UpsertAccountPayment is executed.
		b.StopTimer()
		_, err := store.UpsertAccountPayment(
			ctx, acct.ID, hash, lnwire.MilliSatoshi(1000),
			lnrpc.Payment_SUCCEEDED,
		)
		require.NoError(b, err)
		b.StartTimer()

		err = store.DeleteAccountPayment(ctx, acct.ID, hash)
		require.NoError(b, err)
	}
}

// benchmarkAccountCredit measures credit performance.
func benchmarkAccountCredit(b *testing.B, store Store) {
	ctx := context.Background()

	acct, err := store.NewAccount(ctx, 1000, time.Time{}, "")
	require.NoError(b, err)

	b.ReportAllocs()
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		err := store.CreditAccount(
			ctx, acct.ID, lnwire.MilliSatoshi(1),
		)
		require.NoError(b, err)
	}
}

// benchmarkAccountDebit measures debit performance.
func benchmarkAccountDebit(b *testing.B, store Store) {
	ctx := context.Background()

	acct, err := store.NewAccount(ctx, 1000000, time.Time{}, "")
	require.NoError(b, err)

	b.ReportAllocs()
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		err := store.DebitAccount(
			ctx, acct.ID, lnwire.MilliSatoshi(1),
		)
		require.NoError(b, err)
	}
}

// benchmarkAccountGet measures account lookup performance.
func benchmarkAccountGet(b *testing.B, store Store) {
	ctx := context.Background()

	acct, err := store.NewAccount(ctx, 1000, time.Time{}, "")
	require.NoError(b, err)

	b.ReportAllocs()
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		_, err := store.Account(ctx, acct.ID)
		require.NoError(b, err)
	}
}

// benchmarkAccountRemove measures account deletion performance.
func benchmarkAccountRemove(b *testing.B, store Store) {
	ctx := context.Background()

	b.ReportAllocs()
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		// As this function should benchmark the RemoveAccount function,
		// ensure that the timer isn't running when NewAccount is
		// executed.
		b.StopTimer()
		acct, err := store.NewAccount(
			ctx, 1000, time.Time{}, "",
		)
		require.NoError(b, err)
		b.StartTimer()

		err = store.RemoveAccount(ctx, acct.ID)
		require.NoError(b, err)
	}
}

// benchmarkAccountList measures listing performance with seeded data.
func benchmarkAccountList(b *testing.B, store Store) {
	ctx := context.Background()

	const seedCount = 100
	for i := 0; i < seedCount; i++ {
		_, err := store.NewAccount(
			ctx, 1000, time.Time{}, "",
		)
		require.NoError(b, err)
	}

	b.ReportAllocs()
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		_, err := store.Accounts(ctx)
		require.NoError(b, err)
	}
}

// benchmarkAccountStoreLastIndexes measures write performance.
func benchmarkAccountStoreLastIndexes(b *testing.B, store Store) {
	ctx := context.Background()

	b.ReportAllocs()
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		err := store.StoreLastIndexes(
			ctx, uint64(i), uint64(i+1),
		)
		require.NoError(b, err)
	}
}

// benchmarkAccountLastIndexes measures read performance.
func benchmarkAccountLastIndexes(b *testing.B, store Store) {
	ctx := context.Background()

	require.NoError(b, store.StoreLastIndexes(ctx, 1, 2))

	b.ReportAllocs()
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		_, _, err := store.LastIndexes(ctx)
		require.NoError(b, err)
	}
}
