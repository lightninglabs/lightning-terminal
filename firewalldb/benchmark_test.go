package firewalldb

import (
	"context"
	"fmt"
	"path/filepath"
	"strconv"
	"testing"
	"time"

	"github.com/lightninglabs/lightning-terminal/accounts"
	"github.com/lightninglabs/lightning-terminal/db"
	"github.com/lightninglabs/lightning-terminal/db/sqlc"
	"github.com/lightninglabs/lightning-terminal/session"
	"github.com/lightningnetwork/lnd/clock"
	"github.com/lightningnetwork/lnd/sqldb/v2"
	"github.com/stretchr/testify/require"
)

// NOTE: Set this to true if also you want to benchmark with a postgres backend.
var benchPostgres = false

// BenchmarkFirewallDB benchmarks common firewall DB operations across
// supported DB backends.
func BenchmarkFirewallDB(b *testing.B) {
	for _, backend := range firewallBenchBackends(b) {
		backend := backend
		b.Run(backend.name, func(b *testing.B) {
			runFirewallBench(
				b, backend, "AddAction",
				benchmarkAddAction,
			)
			runFirewallBench(
				b, backend, "SetActionState",
				benchmarkSetActionState,
			)
			runFirewallBench(
				b, backend, "ListActions",
				benchmarkListActions,
			)
			runFirewallBench(
				b, backend, "KVStoreSet",
				benchmarkKVStoreSet,
			)
			runFirewallBench(
				b, backend, "KVStoreGet",
				benchmarkKVStoreGet,
			)
			runFirewallBench(
				b, backend, "KVStoreDel",
				benchmarkKVStoreDel,
			)
			runFirewallBench(
				b, backend, "DeleteTempKVStores",
				benchmarkDeleteTempKVStores,
			)
			runFirewallBench(
				b, backend, "PrivacyNewPair",
				benchmarkPrivacyNewPair,
			)
			runFirewallBench(
				b, backend, "PrivacyRealToPseudo",
				benchmarkPrivacyRealToPseudo,
			)
			runFirewallBench(
				b, backend, "PrivacyPseudoToReal",
				benchmarkPrivacyPseudoToReal,
			)
			runFirewallBench(
				b, backend, "PrivacyFetchAllPairs",
				benchmarkPrivacyFetchAllPairs,
			)
		})
	}
}

type firewallBenchBackend struct {
	name      string
	newStores func(b *testing.B) (FirewallDBs, session.Store, func())
}

func runFirewallBench(b *testing.B, backend firewallBenchBackend, name string,
	fn func(b *testing.B, store FirewallDBs, sessStore session.Store)) {

	b.Run(name, func(b *testing.B) {
		store, sessStore, cleanup := backend.newStores(b)
		b.Cleanup(cleanup)

		fn(b, store, sessStore)
	})
}

func firewallBenchBackends(b *testing.B) []firewallBenchBackend {
	backends := []firewallBenchBackend{
		{
			name: "kvdb-bbolt",
			newStores: func(b *testing.B) (FirewallDBs,
				session.Store, func()) {

				clk := clock.NewTestClock(time.Now())
				dir := b.TempDir()

				acctStore, err := accounts.NewBoltStore(
					dir, accounts.DBFilename, clk,
				)
				require.NoError(b, err)

				sessStore, err := session.NewDB(
					dir, session.DBFilename, clk, acctStore,
				)
				require.NoError(b, err)

				firewallStore, err := NewBoltDB(
					dir, DBFilename, sessStore, acctStore,
					clk,
				)
				require.NoError(b, err)

				cleanup := func() {
					require.NoError(
						b, firewallStore.Close(),
					)
					require.NoError(b, sessStore.Close())
					require.NoError(b, acctStore.Close())
				}

				return firewallStore, sessStore, cleanup
			},
		},
		{
			name: "native-sqlite",
			newStores: func(b *testing.B) (FirewallDBs,
				session.Store, func()) {

				clk := clock.NewTestClock(time.Now())
				dbFile := filepath.Join(
					b.TempDir(), "litd.sqlite",
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
						db.MakeTestMigrationStreams(),
					),
				)

				queries := sqlc.NewForType(
					sqlStore.BaseDB,
					sqlStore.BaseDB.BackendType,
				)
				sessStore := session.NewSQLStore(
					sqlStore.BaseDB, queries, clk,
				)
				firewallStore := NewSQLDB(
					sqlStore.BaseDB, queries, clk,
				)

				cleanup := func() {
					require.NoError(
						b, firewallStore.Close(),
					)
				}

				return firewallStore, sessStore, cleanup
			},
		},
	}

	if benchPostgres {
		backends = append(backends, firewallBenchBackend{
			name: "native-postgres",
			newStores: func(b *testing.B) (FirewallDBs,
				session.Store, func()) {

				clk := clock.NewTestClock(time.Now())
				fixture := sqldb.NewTestPgFixture(
					b, db.DefaultPostgresFixtureLifetime,
				)
				b.Cleanup(func() {
					fixture.TearDown(b)
				})

				sqlStore := sqldb.NewTestPostgresDB(
					b, fixture,
					db.MakeTestMigrationStreams(),
				)

				queries := sqlc.NewForType(
					sqlStore.BaseDB,
					sqlStore.BaseDB.BackendType,
				)
				sessStore := session.NewSQLStore(
					sqlStore.BaseDB, queries, clk,
				)
				firewallStore := NewSQLDB(
					sqlStore.BaseDB, queries, clk,
				)

				cleanup := func() {
					require.NoError(
						b, firewallStore.Close(),
					)
				}

				return firewallStore, sessStore, cleanup
			},
		})
	}

	return backends
}

// benchmarkAddAction measures action insertion performance.
func benchmarkAddAction(b *testing.B, store FirewallDBs,
	_ session.Store) {

	ctx := context.Background()

	b.ReportAllocs()
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		_, err := store.AddAction(ctx, &AddActionReq{
			RPCMethod: "/lnrpc.Lightning/GetInfo",
		})
		require.NoError(b, err)
	}
}

// benchmarkSetActionState measures state update performance.
func benchmarkSetActionState(b *testing.B, store FirewallDBs,
	_ session.Store) {

	ctx := context.Background()

	b.ReportAllocs()
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		b.StopTimer()
		locator, err := store.AddAction(ctx, &AddActionReq{
			RPCMethod: "/lnrpc.Lightning/GetInfo",
		})
		require.NoError(b, err)
		b.StartTimer()

		err = store.SetActionState(
			ctx, locator, ActionStateDone, "",
		)
		require.NoError(b, err)
	}
}

// benchmarkListActions measures list performance with seeded data.
func benchmarkListActions(b *testing.B, store FirewallDBs,
	_ session.Store) {

	ctx := context.Background()

	const seedCount = 100
	for i := 0; i < seedCount; i++ {
		_, err := store.AddAction(ctx, &AddActionReq{
			RPCMethod: "/lnrpc.Lightning/GetInfo",
		})
		require.NoError(b, err)
	}

	query := &ListActionsQuery{
		CountAll: true,
	}

	b.ReportAllocs()
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		_, _, _, err := store.ListActions(ctx, query)
		require.NoError(b, err)
	}
}

// benchmarkKVStoreSet measures KV store Set performance.
func benchmarkKVStoreSet(b *testing.B, store FirewallDBs,
	_ session.Store) {

	ctx := context.Background()
	groupID := session.ID{1, 2, 3, 4}

	kvStores := store.GetKVStores("bench", groupID, "feature")

	b.ReportAllocs()
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		key := strconv.Itoa(i)
		value := []byte("value")

		err := kvStores.Update(ctx, func(ctx context.Context,
			tx KVStoreTx) error {

			return tx.Global().Set(ctx, key, value)
		})
		require.NoError(b, err)
	}
}

// benchmarkKVStoreGet measures KV store Get performance.
func benchmarkKVStoreGet(b *testing.B, store FirewallDBs,
	_ session.Store) {

	ctx := context.Background()
	groupID := session.ID{1, 2, 3, 4}

	kvStores := store.GetKVStores("bench", groupID, "feature")

	err := kvStores.Update(ctx, func(ctx context.Context,
		tx KVStoreTx) error {

		return tx.Global().Set(ctx, "key", []byte("value"))
	})
	require.NoError(b, err)

	b.ReportAllocs()
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		err := kvStores.View(ctx, func(ctx context.Context,
			tx KVStoreTx) error {

			_, err := tx.Global().Get(ctx, "key")
			return err
		})
		require.NoError(b, err)
	}
}

// benchmarkKVStoreDel measures KV store Del performance.
func benchmarkKVStoreDel(b *testing.B, store FirewallDBs,
	_ session.Store) {

	ctx := context.Background()
	groupID := session.ID{1, 2, 3, 4}

	kvStores := store.GetKVStores("bench", groupID, "feature")

	const keyCount = 128
	keys := make([]string, keyCount)
	for i := 0; i < keyCount; i++ {
		keys[i] = fmt.Sprintf("key-%d", i)
	}

	reseed := func() {
		for _, key := range keys {
			err := kvStores.Update(ctx,
				func(ctx context.Context, tx KVStoreTx) error {
					return tx.Global().Set(
						ctx, key, []byte("value"),
					)
				},
			)
			require.NoError(b, err)
		}
	}

	reseed()

	b.ReportAllocs()
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		key := keys[i%keyCount]
		err := kvStores.Update(ctx, func(ctx context.Context,
			tx KVStoreTx) error {

			return tx.Global().Del(ctx, key)
		})
		require.NoError(b, err)

		if i%keyCount == keyCount-1 {
			b.StopTimer()
			reseed()
			b.StartTimer()
		}
	}
}

// benchmarkDeleteTempKVStores measures temp kv store cleanup.
func benchmarkDeleteTempKVStores(b *testing.B, store FirewallDBs,
	_ session.Store) {

	ctx := context.Background()
	groupID := session.ID{9, 9, 9, 9}

	kvStores := store.GetKVStores("bench", groupID, "feature")

	const seedCount = 100

	b.ReportAllocs()
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		b.StopTimer()
		for j := 0; j < seedCount; j++ {
			key := fmt.Sprintf("tmp-%d", j)

			err := kvStores.Update(ctx,
				func(ctx context.Context, tx KVStoreTx) error {
					return tx.GlobalTemp().Set(
						ctx, key, []byte("v"),
					)
				},
			)
			require.NoError(b, err)
		}
		b.StartTimer()

		err := store.DeleteTempKVStores(ctx)
		require.NoError(b, err)
	}
}

// benchmarkPrivacyNewPair measures privacy mapper inserts.
func benchmarkPrivacyNewPair(b *testing.B, store FirewallDBs,
	sessStore session.Store) {

	ctx := context.Background()
	groupID := newPrivacyGroupID(ctx, b, sessStore)

	privacyDB := store.PrivacyDB(groupID)

	b.ReportAllocs()
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		real := fmt.Sprintf("real-%d", i)
		pseudo := fmt.Sprintf("pseudo-%d", i)

		err := privacyDB.Update(ctx,
			func(ctx context.Context, tx PrivacyMapTx) error {
				return tx.NewPair(ctx, real, pseudo)
			},
		)
		require.NoError(b, err)
	}
}

// benchmarkPrivacyRealToPseudo measures privacy mapper lookups by real value.
func benchmarkPrivacyRealToPseudo(b *testing.B, store FirewallDBs,
	sessStore session.Store) {

	ctx := context.Background()
	groupID := newPrivacyGroupID(ctx, b, sessStore)

	privacyDB := store.PrivacyDB(groupID)

	err := privacyDB.Update(ctx,
		func(ctx context.Context, tx PrivacyMapTx) error {
			return tx.NewPair(ctx, "real", "pseudo")
		},
	)
	require.NoError(b, err)

	b.ReportAllocs()
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		err := privacyDB.View(ctx,
			func(ctx context.Context, tx PrivacyMapTx) error {
				_, err := tx.RealToPseudo(ctx, "real")
				return err
			},
		)
		require.NoError(b, err)
	}
}

// benchmarkPrivacyPseudoToReal measures privacy mapper lookups by pseudo.
func benchmarkPrivacyPseudoToReal(b *testing.B, store FirewallDBs,
	sessStore session.Store) {

	ctx := context.Background()
	groupID := newPrivacyGroupID(ctx, b, sessStore)

	privacyDB := store.PrivacyDB(groupID)

	err := privacyDB.Update(ctx,
		func(ctx context.Context, tx PrivacyMapTx) error {
			return tx.NewPair(ctx, "real", "pseudo")
		},
	)
	require.NoError(b, err)

	b.ReportAllocs()
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		err := privacyDB.View(ctx,
			func(ctx context.Context, tx PrivacyMapTx) error {
				_, err := tx.PseudoToReal(ctx, "pseudo")
				return err
			},
		)
		require.NoError(b, err)
	}
}

// benchmarkPrivacyFetchAllPairs measures privacy mapper list performance.
func benchmarkPrivacyFetchAllPairs(b *testing.B, store FirewallDBs,
	sessStore session.Store) {

	ctx := context.Background()
	groupID := newPrivacyGroupID(ctx, b, sessStore)

	privacyDB := store.PrivacyDB(groupID)

	const seedCount = 100
	for i := 0; i < seedCount; i++ {
		real := fmt.Sprintf("real-%d", i)
		pseudo := fmt.Sprintf("pseudo-%d", i)

		err := privacyDB.Update(ctx,
			func(ctx context.Context, tx PrivacyMapTx) error {
				return tx.NewPair(ctx, real, pseudo)
			},
		)
		require.NoError(b, err)
	}

	b.ReportAllocs()
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		err := privacyDB.View(ctx,
			func(ctx context.Context, tx PrivacyMapTx) error {
				_, err := tx.FetchAllPairs(ctx)
				return err
			},
		)
		require.NoError(b, err)
	}
}

func newPrivacyGroupID(ctx context.Context, b *testing.B,
	sessStore session.Store) session.ID {

	expiry := time.Now().Add(time.Hour)
	sess, err := sessStore.NewSession(
		ctx, "bench", session.TypeMacaroonAdmin, expiry,
		"mailbox.test",
	)
	require.NoError(b, err)

	return sess.GroupID
}
