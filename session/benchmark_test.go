package session

import (
	"context"
	"path/filepath"
	"testing"
	"time"

	"github.com/btcsuite/btcd/btcec/v2"
	"github.com/lightninglabs/lightning-terminal/accounts"
	"github.com/lightninglabs/lightning-terminal/db"
	"github.com/lightninglabs/lightning-terminal/db/sqlc"
	"github.com/lightningnetwork/lnd/clock"
	"github.com/lightningnetwork/lnd/sqldb/v2"
	"github.com/stretchr/testify/require"
)

// NOTE: Set this to true if you also want to benchmark with a postgres backend.
var benchPostgres = false

// BenchmarkSessionStore benchmarks common session store operations across
// supported DB backends.
func BenchmarkSessionStore(b *testing.B) {
	for _, backend := range sessionBenchBackends(b) {
		backend := backend
		b.Run(backend.name, func(b *testing.B) {
			runSessionBench(
				b, backend, "NewSession", benchmarkSessionNew,
			)
			runSessionBench(
				b, backend, "GetSession", benchmarkSessionGet,
			)
			runSessionBench(
				b, backend, "GetSessionByLocalPub",
				benchmarkSessionGetByLocalPub,
			)
			runSessionBench(
				b, backend, "ListSessions",
				benchmarkSessionList,
			)
			runSessionBench(
				b, backend, "ListSessionsByType",
				benchmarkSessionListByType,
			)
			runSessionBench(
				b, backend, "ListSessionsByState",
				benchmarkSessionListByState,
			)
			runSessionBench(
				b, backend, "ShiftState",
				benchmarkSessionShiftState,
			)
			runSessionBench(
				b, backend, "UpdateRemoteKey",
				benchmarkSessionUpdateRemoteKey,
			)
			runSessionBench(
				b, backend, "DeleteReservedSession",
				benchmarkSessionDeleteReservedSession,
			)
			runSessionBench(
				b, backend, "DeleteReservedSessions",
				benchmarkSessionDeleteReservedSessions,
			)
			runSessionBench(
				b, backend, "GetGroupID",
				benchmarkSessionGetGroupID,
			)
			runSessionBench(
				b, backend, "GetSessionIDs",
				benchmarkSessionGetSessionIDs,
			)
		})
	}
}

type sessionBenchBackend struct {
	name      string
	newStores func(b *testing.B) (Store, func())
}

func runSessionBench(b *testing.B, backend sessionBenchBackend, name string,
	fn func(b *testing.B, store Store)) {

	b.Run(name, func(b *testing.B) {
		store, cleanup := backend.newStores(b)
		b.Cleanup(cleanup)

		fn(b, store)
	})
}

func sessionBenchBackends(b *testing.B) []sessionBenchBackend {
	backends := []sessionBenchBackend{
		{
			name: "kvdb-bbolt",
			newStores: func(b *testing.B) (Store, func()) {
				clk := clock.NewTestClock(time.Now())
				dir := b.TempDir()

				acctStore, err := accounts.NewBoltStore(
					dir, accounts.DBFilename, clk,
				)
				require.NoError(b, err)

				sessStore, err := NewDB(
					dir, DBFilename, clk, acctStore,
				)
				require.NoError(b, err)

				cleanup := func() {
					require.NoError(b, sessStore.Close())
					require.NoError(b, acctStore.Close())
				}

				return sessStore, cleanup
			},
		},
		{
			name: "native-sqlite",
			newStores: func(b *testing.B) (Store, func()) {
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
				sessStore := NewSQLStore(
					sqlStore.BaseDB, queries, clk,
				)

				cleanup := func() {
					require.NoError(b, sessStore.Close())
				}

				return sessStore, cleanup
			},
		},
	}

	if benchPostgres {
		backends = append(backends, sessionBenchBackend{
			name: "native-postgres",
			newStores: func(b *testing.B) (Store, func()) {
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
				sessStore := NewSQLStore(
					sqlStore.BaseDB, queries, clk,
				)

				cleanup := func() {
					require.NoError(b, sessStore.Close())
				}

				return sessStore, cleanup
			},
		})
	}

	return backends
}

// benchmarkSessionNew measures session creation performance.
func benchmarkSessionNew(b *testing.B, store Store) {
	ctx := context.Background()
	expiry := time.Now().Add(time.Hour)

	b.ReportAllocs()
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		_, err := store.NewSession(
			ctx, "bench", TypeMacaroonAdmin, expiry,
			"mailbox.test",
		)
		require.NoError(b, err)
	}
}

// benchmarkSessionGet measures session lookup performance.
func benchmarkSessionGet(b *testing.B, store Store) {
	ctx := context.Background()

	b.ReportAllocs()
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		b.StopTimer()

		sess, err := store.NewSession(
			ctx, "bench", TypeMacaroonAdmin,
			time.Now().Add(time.Hour), "mailbox.test",
		)
		require.NoError(b, err)

		b.StartTimer()

		_, err = store.GetSession(ctx, sess.ID)
		require.NoError(b, err)
	}
}

// benchmarkSessionGetByLocalPub measures local pub key lookups.
func benchmarkSessionGetByLocalPub(b *testing.B, store Store) {
	ctx := context.Background()

	sess, err := store.NewSession(
		ctx, "bench", TypeMacaroonAdmin,
		time.Now().Add(time.Hour), "mailbox.test",
	)
	require.NoError(b, err)

	b.ReportAllocs()
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		_, err := store.GetSessionByLocalPub(ctx, sess.LocalPublicKey)
		require.NoError(b, err)
	}
}

// benchmarkSessionList measures list performance with seeded data.
func benchmarkSessionList(b *testing.B, store Store) {
	ctx := context.Background()
	expiry := time.Now().Add(time.Hour)

	const seedCount = 100
	for i := 0; i < seedCount; i++ {
		_, err := store.NewSession(
			ctx, "bench", TypeMacaroonAdmin, expiry,
			"mailbox.test",
		)
		require.NoError(b, err)
	}

	b.ReportAllocs()
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		_, err := store.ListAllSessions(ctx)
		require.NoError(b, err)
	}
}

// benchmarkSessionListByType measures list-by-type performance.
func benchmarkSessionListByType(b *testing.B, store Store) {
	ctx := context.Background()
	expiry := time.Now().Add(time.Hour)

	const seedCount = 100
	for i := 0; i < seedCount; i++ {
		_, err := store.NewSession(
			ctx, "bench", TypeMacaroonAdmin, expiry,
			"mailbox.test",
		)
		require.NoError(b, err)
	}

	const otherCount = 50
	for i := 0; i < otherCount; i++ {
		_, err := store.NewSession(
			ctx, "bench", TypeMacaroonReadonly, expiry,
			"mailbox.test",
		)
		require.NoError(b, err)
	}

	b.ReportAllocs()
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		_, err := store.ListSessionsByType(
			ctx, TypeMacaroonAdmin,
		)
		require.NoError(b, err)
	}
}

// benchmarkSessionListByState measures list-by-state performance.
func benchmarkSessionListByState(b *testing.B, store Store) {
	ctx := context.Background()
	expiry := time.Now().Add(time.Hour)

	const seedCount = 100
	for i := 0; i < seedCount; i++ {
		_, err := store.NewSession(
			ctx, "bench", TypeMacaroonAdmin, expiry,
			"mailbox.test",
		)
		require.NoError(b, err)
	}

	const createdCount = 50
	for i := 0; i < createdCount; i++ {
		sess, err := store.NewSession(
			ctx, "bench", TypeMacaroonAdmin, expiry,
			"mailbox.test",
		)
		require.NoError(b, err)

		err = store.ShiftState(ctx, sess.ID, StateCreated)
		require.NoError(b, err)
	}

	runByState := func(b *testing.B, state State) {
		b.ReportAllocs()
		b.ResetTimer()

		for i := 0; i < b.N; i++ {
			_, err := store.ListSessionsByState(ctx, state)
			require.NoError(b, err)
		}
	}

	b.Run("Reserved", func(b *testing.B) {
		runByState(b, StateReserved)
	})

	b.Run("Created", func(b *testing.B) {
		runByState(b, StateCreated)
	})
}

// benchmarkSessionShiftState measures reserved->created transitions.
func benchmarkSessionShiftState(b *testing.B, store Store) {
	ctx := context.Background()
	expiry := time.Now().Add(time.Hour)

	b.ReportAllocs()
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		// As this function should benchmark the ShiftState
		// function, ensure that the timer isn't running when NewSession
		// is executed.
		b.StopTimer()
		sess, err := store.NewSession(
			ctx, "bench", TypeMacaroonAdmin, expiry,
			"mailbox.test",
		)
		require.NoError(b, err)
		b.StartTimer()

		err = store.ShiftState(ctx, sess.ID, StateCreated)
		require.NoError(b, err)
	}
}

// benchmarkSessionDeleteReservedSession measures delete-by-id performance.
func benchmarkSessionDeleteReservedSession(b *testing.B, store Store) {
	ctx := context.Background()
	expiry := time.Now().Add(time.Hour)

	b.ReportAllocs()
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		// As this function should benchmark the DeleteReservedSession
		// function, ensure that the timer isn't running when NewSession
		// is executed.
		b.StopTimer()
		sess, err := store.NewSession(
			ctx, "bench", TypeMacaroonAdmin, expiry,
			"mailbox.test",
		)
		require.NoError(b, err)
		b.StartTimer()

		err = store.DeleteReservedSession(ctx, sess.ID)
		require.NoError(b, err)
	}
}

// benchmarkSessionDeleteReservedSessions measures bulk delete performance.
func benchmarkSessionDeleteReservedSessions(b *testing.B, store Store) {
	ctx := context.Background()
	expiry := time.Now().Add(time.Hour)

	const batchSize = 10

	b.ReportAllocs()
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		// As this function should benchmark the DeleteReservedSessions
		// function, ensure that the timer isn't running when NewSession
		// is executed.
		b.StopTimer()
		for j := 0; j < batchSize; j++ {
			_, err := store.NewSession(
				ctx, "bench", TypeMacaroonAdmin, expiry,
				"mailbox.test",
			)
			require.NoError(b, err)
		}
		b.StartTimer()

		err := store.DeleteReservedSessions(ctx)
		require.NoError(b, err)
	}
}

// benchmarkSessionUpdateRemoteKey measures remote key updates.
func benchmarkSessionUpdateRemoteKey(b *testing.B, store Store) {
	ctx := context.Background()

	sess, err := store.NewSession(
		ctx, "bench", TypeMacaroonAdmin,
		time.Now().Add(time.Hour), "mailbox.test",
	)
	require.NoError(b, err)

	b.ReportAllocs()
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		b.StopTimer()
		priv, err := btcec.NewPrivateKey()
		require.NoError(b, err)
		b.StartTimer()

		err = store.UpdateSessionRemotePubKey(
			ctx, sess.ID, priv.PubKey(),
		)
		require.NoError(b, err)
	}
}

// benchmarkSessionGetGroupID measures group ID lookups.
func benchmarkSessionGetGroupID(b *testing.B, store Store) {
	ctx := context.Background()
	expiry := time.Now().Add(time.Hour)

	root, err := newTerminalSession(ctx, store, expiry)
	require.NoError(b, err)

	child, err := store.NewSession(
		ctx, "bench", TypeMacaroonAdmin, expiry,
		"mailbox.test", WithLinkedGroupID(&root.ID),
	)
	require.NoError(b, err)

	b.ReportAllocs()
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		_, err := store.GetGroupID(ctx, child.ID)
		require.NoError(b, err)
	}
}

// benchmarkSessionGetSessionIDs measures group session listing performance.
func benchmarkSessionGetSessionIDs(b *testing.B, store Store) {
	ctx := context.Background()
	expiry := time.Now().Add(time.Hour)

	root, err := newTerminalSession(ctx, store, expiry)
	require.NoError(b, err)

	const linkedCount = 10
	for i := 0; i < linkedCount; i++ {
		linked, err := store.NewSession(
			ctx, "bench", TypeMacaroonAdmin, expiry,
			"mailbox.test", WithLinkedGroupID(&root.ID),
		)
		require.NoError(b, err)

		err = store.ShiftState(ctx, linked.ID, StateCreated)
		require.NoError(b, err)

		err = store.ShiftState(ctx, linked.ID, StateRevoked)
		require.NoError(b, err)
	}

	b.ReportAllocs()
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		_, err := store.GetSessionIDs(ctx, root.ID)
		require.NoError(b, err)
	}
}

func newTerminalSession(ctx context.Context, store Store,
	expiry time.Time) (*Session, error) {

	sess, err := store.NewSession(
		ctx, "bench", TypeMacaroonAdmin, expiry,
		"mailbox.test",
	)
	if err != nil {
		return nil, err
	}

	err = store.ShiftState(ctx, sess.ID, StateCreated)
	if err != nil {
		return nil, err
	}

	err = store.ShiftState(ctx, sess.ID, StateRevoked)
	if err != nil {
		return nil, err
	}

	return sess, nil
}
