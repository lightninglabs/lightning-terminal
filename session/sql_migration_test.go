package session

import (
	"context"
	"database/sql"
	"fmt"
	"testing"
	"time"

	"github.com/lightninglabs/lightning-terminal/accounts"
	"github.com/lightninglabs/lightning-terminal/db"
	"github.com/lightningnetwork/lnd/clock"
	"github.com/lightningnetwork/lnd/macaroons"
	"github.com/lightningnetwork/lnd/sqldb"
	"github.com/stretchr/testify/require"
	"gopkg.in/macaroon-bakery.v2/bakery/checkers"
	"gopkg.in/macaroon.v2"
)

// TestSessionsStoreMigration tests the migration of session store from a bolt
// backend to a SQL database. Note that this test does not attempt to be a
// complete migration test.
func TestSessionsStoreMigration(t *testing.T) {
	t.Parallel()

	ctx := context.Background()
	clock := clock.NewTestClock(time.Now())

	// When using build tags that creates a kvdb store for NewTestDB, we
	// skip this test as it is only applicable for postgres and sqlite tags.
	store := NewTestDB(t, clock)
	if _, ok := store.(*BoltStore); ok {
		t.Skipf("Skipping session store migration test for kvdb build")
	}

	makeSQLDB := func(t *testing.T, acctStore accounts.Store) (*SQLStore,
		*db.TransactionExecutor[SQLQueries]) {

		// Create a sql store with a linked account store.
		testDBStore := NewTestDBWithAccounts(t, clock, acctStore)

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

	// assertMigrationResults asserts that the sql store contains the
	// same sessions as the passed kv store sessions. This is intended to be
	// run after the migration.
	assertMigrationResults := func(t *testing.T, sqlStore *SQLStore,
		kvSessions []*Session) {

		for _, kvSession := range kvSessions {
			// Fetch the migrated session from the sql store.
			sqlSession, err := sqlStore.GetSession(
				ctx, kvSession.ID,
			)
			require.NoError(t, err)

			// Since the SQL store can't represent a session with
			// a non-nil MacaroonRecipe, but with nil caveats and
			// perms, we need to override the macaroon recipe if the
			// kvSession has such a recipe stored.
			overrideMacaroonRecipe(kvSession, sqlSession)

			assertEqualSessions(t, kvSession, sqlSession)
		}

		// Finally we ensure that the sql store doesn't contain more
		// sessions than the kv store.
		sqlSessions, err := sqlStore.ListAllSessions(ctx)
		require.NoError(t, err)
		require.Equal(t, len(kvSessions), len(sqlSessions))
	}

	tests := []struct {
		name       string
		populateDB func(
			t *testing.T, kvStore *BoltStore,
			accountStore accounts.Store,
		)
	}{
		{
			name: "empty",
			populateDB: func(t *testing.T, store *BoltStore,
				_ accounts.Store) {

				// Don't populate the DB.
			},
		},
		{
			name: "one session no options",
			populateDB: func(t *testing.T, store *BoltStore,
				_ accounts.Store) {

				_, err := store.NewSession(
					ctx, "test", TypeMacaroonAdmin,
					time.Unix(1000, 0), "",
				)
				require.NoError(t, err)
			},
		},
		{
			name: "multiple sessions no options",
			populateDB: func(t *testing.T, store *BoltStore,
				_ accounts.Store) {

				_, err := store.NewSession(
					ctx, "session1", TypeMacaroonAdmin,
					time.Unix(1000, 0), "",
				)
				require.NoError(t, err)

				_, err = store.NewSession(
					ctx, "session2", TypeMacaroonAdmin,
					time.Unix(1000, 0), "",
				)
				require.NoError(t, err)

				_, err = store.NewSession(
					ctx, "session3", TypeMacaroonAdmin,
					time.Unix(1000, 0), "",
				)
				require.NoError(t, err)
			},
		},
		{
			name: "one session with one privacy flag",
			populateDB: func(t *testing.T, store *BoltStore,
				_ accounts.Store) {

				_, err := store.NewSession(
					ctx, "test", TypeMacaroonAdmin,
					time.Unix(1000, 0), "",
					WithPrivacy(PrivacyFlags{ClearPubkeys}),
				)
				require.NoError(t, err)
			},
		},
		{
			name: "one session with multiple privacy flags",
			populateDB: func(t *testing.T, store *BoltStore,
				_ accounts.Store) {

				_, err := store.NewSession(
					ctx, "test", TypeMacaroonAdmin,
					time.Unix(1000, 0), "",
					WithPrivacy(PrivacyFlags{
						ClearChanInitiator, ClearHTLCs,
						ClearClosingTxIds,
					}),
				)
				require.NoError(t, err)
			},
		},
		{
			name: "one session with a feature config",
			populateDB: func(t *testing.T, store *BoltStore,
				_ accounts.Store) {

				featureConfig := map[string][]byte{
					"AutoFees":      {1, 2, 3, 4},
					"AutoSomething": {4, 3, 4, 5, 6, 6},
				}

				_, err := store.NewSession(
					ctx, "test", TypeMacaroonAdmin,
					time.Unix(1000, 0), "",
					WithFeatureConfig(featureConfig),
				)
				require.NoError(t, err)
			},
		},
		{
			name: "one session with dev server",
			populateDB: func(t *testing.T, store *BoltStore,
				_ accounts.Store) {

				_, err := store.NewSession(
					ctx, "test", TypeMacaroonAdmin,
					time.Unix(1000, 0), "",
					WithDevServer(),
				)
				require.NoError(t, err)
			},
		},
		{
			name: "one session with macaroon recipe",
			populateDB: func(t *testing.T, store *BoltStore,
				_ accounts.Store) {

				// this test uses caveats & perms from the
				// tlv_test.go
				_, err := store.NewSession(
					ctx, "test", TypeMacaroonAdmin,
					time.Unix(1000, 0), "foo.bar.baz:1234",
					WithMacaroonRecipe(caveats, perms),
				)
				require.NoError(t, err)
			},
		},
		{
			name: "one session with macaroon recipe nil caveats",
			populateDB: func(t *testing.T, store *BoltStore,
				_ accounts.Store) {

				// this test uses perms from the tlv_test.go
				_, err := store.NewSession(
					ctx, "test", TypeMacaroonAdmin,
					time.Unix(1000, 0), "foo.bar.baz:1234",
					WithMacaroonRecipe(nil, perms),
				)
				require.NoError(t, err)
			},
		},
		{
			name: "one session with macaroon recipe nil perms",
			populateDB: func(t *testing.T, store *BoltStore,
				_ accounts.Store) {

				// this test uses caveats from the tlv_test.go
				_, err := store.NewSession(
					ctx, "test", TypeMacaroonAdmin,
					time.Unix(1000, 0), "foo.bar.baz:1234",
					WithMacaroonRecipe(caveats, nil),
				)
				require.NoError(t, err)
			},
		},
		{
			name: "macaroon recipe with nil perms and caveats",
			populateDB: func(t *testing.T, store *BoltStore,
				_ accounts.Store) {

				_, err := store.NewSession(
					ctx, "test", TypeMacaroonAdmin,
					time.Unix(1000, 0), "foo.bar.baz:1234",
					WithMacaroonRecipe(nil, nil),
				)
				require.NoError(t, err)
			},
		},
		{
			name: "one session with a linked account",
			populateDB: func(t *testing.T, store *BoltStore,
				acctStore accounts.Store) {

				// Create an account with balance
				acct, err := acctStore.NewAccount(
					ctx, 1234, time.Now().Add(time.Hour),
					"",
				)
				require.NoError(t, err)
				require.False(t, acct.HasExpired())

				// For now, we manually add the account caveat
				// for bbolt compatibility.
				accountCaveat := checkers.Condition(
					macaroons.CondLndCustom,
					fmt.Sprintf("%s %x",
						accounts.CondAccount,
						acct.ID[:],
					),
				)

				sessCaveats := []macaroon.Caveat{
					{
						Id: []byte(accountCaveat),
					},
				}

				_, err = store.NewSession(
					ctx, "test", TypeMacaroonAccount,
					time.Unix(1000, 0), "",
					WithAccount(acct.ID),
					WithMacaroonRecipe(sessCaveats, nil),
				)
				require.NoError(t, err)
			},
		},
		{
			name: "linked session",
			populateDB: func(t *testing.T, store *BoltStore,
				_ accounts.Store) {

				// First create the initial session for the
				// group.
				sess1, err := store.NewSession(
					ctx, "initSession", TypeMacaroonAdmin,
					time.Unix(1000, 0), "",
				)
				require.NoError(t, err)

				// As the store won't allow us to link a
				// session before all sessions in the group have
				// been revoked, we revoke the session before
				// creating a new session that links to the
				// initial session.
				err = store.ShiftState(
					ctx, sess1.ID, StateCreated,
				)
				require.NoError(t, err)

				err = store.ShiftState(
					ctx, sess1.ID, StateRevoked,
				)
				require.NoError(t, err)

				_, err = store.NewSession(
					ctx, "linkedSession", TypeMacaroonAdmin,
					time.Unix(1000, 0), "",
					WithLinkedGroupID(&sess1.ID),
				)
				require.NoError(t, err)
			},
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			t.Parallel()

			// First let's create an account store to link to in
			// the sessions store. Note that this is will be a sql
			// store due to the build tags enabled when running this
			// test, which means that we won't need to migrate the
			// account store in this test.
			accountStore := accounts.NewTestDB(t, clock)

			kvStore, err := NewDB(
				t.TempDir(), DBFilename, clock, accountStore,
			)
			require.NoError(t, err)

			t.Cleanup(func() {
				require.NoError(t, kvStore.Close())
			})

			// populate the kvStore with the test data, in
			// preparation for the test.
			test.populateDB(t, kvStore, accountStore)

			// Before we migrate the sessions, we fetch all sessions
			// from the kv store, to ensure that the migration
			// function doesn't mutate the bbolt store sessions.
			// We can then compare them to the sql sessions after
			// the migration has been executed.
			kvSessions, err := kvStore.ListAllSessions(ctx)
			require.NoError(t, err)

			// Proceed to create the sql store and execute the
			// migration.
			sqlStore, txEx := makeSQLDB(t, accountStore)

			var opts sqldb.MigrationTxOptions
			err = txEx.ExecTx(
				ctx, &opts, func(tx SQLQueries) error {
					return MigrateSessionStoreToSQL(
						ctx, kvStore.DB, tx,
					)
				},
			)
			require.NoError(t, err)

			// The migration function will check if the inserted
			// sessions equals the migrated ones, but as a sanity
			// check we'll also fetch migrated sessions from the sql
			// store and compare them to the original.
			assertMigrationResults(t, sqlStore, kvSessions)
		})
	}
}
