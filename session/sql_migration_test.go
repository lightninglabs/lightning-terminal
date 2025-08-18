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
	"github.com/lightningnetwork/lnd/lnwire"
	"github.com/lightningnetwork/lnd/macaroons"
	"github.com/lightningnetwork/lnd/sqldb"
	"github.com/stretchr/testify/require"
	"go.etcd.io/bbolt"
	"golang.org/x/exp/rand"
	"gopkg.in/macaroon-bakery.v2/bakery"
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
		) []*Session
	}{
		{
			name: "empty",
			populateDB: func(t *testing.T, store *BoltStore,
				_ accounts.Store) []*Session {

				// Don't populate the DB.
				return []*Session{}
			},
		},
		{
			name: "one session no options",
			populateDB: func(t *testing.T, store *BoltStore,
				_ accounts.Store) []*Session {

				_, err := store.NewSession(
					ctx, "test", TypeMacaroonAdmin,
					time.Unix(1000, 0), "",
				)
				require.NoError(t, err)

				return getBoltStoreSessions(t, store)
			},
		},
		{
			name: "multiple sessions no options",
			populateDB: func(t *testing.T, store *BoltStore,
				_ accounts.Store) []*Session {

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

				return getBoltStoreSessions(t, store)
			},
		},
		{
			name: "one session with one privacy flag",
			populateDB: func(t *testing.T, store *BoltStore,
				_ accounts.Store) []*Session {

				_, err := store.NewSession(
					ctx, "test", TypeMacaroonAdmin,
					time.Unix(1000, 0), "",
					WithPrivacy(PrivacyFlags{ClearPubkeys}),
				)
				require.NoError(t, err)

				return getBoltStoreSessions(t, store)
			},
		},
		{
			name: "one session with multiple privacy flags",
			populateDB: func(t *testing.T, store *BoltStore,
				_ accounts.Store) []*Session {

				_, err := store.NewSession(
					ctx, "test", TypeMacaroonAdmin,
					time.Unix(1000, 0), "",
					WithPrivacy(PrivacyFlags{
						ClearChanInitiator, ClearHTLCs,
						ClearClosingTxIds,
					}),
				)
				require.NoError(t, err)

				return getBoltStoreSessions(t, store)
			},
		},
		{
			name: "one session with a feature config",
			populateDB: func(t *testing.T, store *BoltStore,
				_ accounts.Store) []*Session {

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

				return getBoltStoreSessions(t, store)
			},
		},
		{
			name: "one session with dev server",
			populateDB: func(t *testing.T, store *BoltStore,
				_ accounts.Store) []*Session {

				_, err := store.NewSession(
					ctx, "test", TypeMacaroonAdmin,
					time.Unix(1000, 0), "",
					WithDevServer(),
				)
				require.NoError(t, err)

				return getBoltStoreSessions(t, store)
			},
		},
		{
			name: "one session with macaroon recipe",
			populateDB: func(t *testing.T, store *BoltStore,
				_ accounts.Store) []*Session {

				// this test uses caveats & perms from the
				// tlv_test.go
				_, err := store.NewSession(
					ctx, "test", TypeMacaroonAdmin,
					time.Unix(1000, 0), "foo.bar.baz:1234",
					WithMacaroonRecipe(caveats, perms),
				)
				require.NoError(t, err)

				return getBoltStoreSessions(t, store)
			},
		},
		{
			name: "one session with macaroon recipe nil caveats",
			populateDB: func(t *testing.T, store *BoltStore,
				_ accounts.Store) []*Session {

				// this test uses perms from the tlv_test.go
				_, err := store.NewSession(
					ctx, "test", TypeMacaroonAdmin,
					time.Unix(1000, 0), "foo.bar.baz:1234",
					WithMacaroonRecipe(nil, perms),
				)
				require.NoError(t, err)

				return getBoltStoreSessions(t, store)
			},
		},
		{
			name: "one session with macaroon recipe nil perms",
			populateDB: func(t *testing.T, store *BoltStore,
				_ accounts.Store) []*Session {

				// this test uses caveats from the tlv_test.go
				_, err := store.NewSession(
					ctx, "test", TypeMacaroonAdmin,
					time.Unix(1000, 0), "foo.bar.baz:1234",
					WithMacaroonRecipe(caveats, nil),
				)
				require.NoError(t, err)

				return getBoltStoreSessions(t, store)
			},
		},
		{
			name: "macaroon recipe with nil perms and caveats",
			populateDB: func(t *testing.T, store *BoltStore,
				_ accounts.Store) []*Session {

				_, err := store.NewSession(
					ctx, "test", TypeMacaroonAdmin,
					time.Unix(1000, 0), "foo.bar.baz:1234",
					WithMacaroonRecipe(nil, nil),
				)
				require.NoError(t, err)

				return getBoltStoreSessions(t, store)
			},
		},
		{
			name: "one session with a linked account",
			populateDB: func(t *testing.T, store *BoltStore,
				acctStore accounts.Store) []*Session {

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

				return getBoltStoreSessions(t, store)
			},
		},
		{
			name: "linked session",
			populateDB: func(t *testing.T, store *BoltStore,
				_ accounts.Store) []*Session {

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

				return getBoltStoreSessions(t, store)
			},
		},
		{
			name: "multiple sessions with the same ID",
			populateDB: func(t *testing.T, store *BoltStore,
				_ accounts.Store) []*Session {

				// We first add one session which has no other
				// session with same ID, to test that this is
				// correctly migrated, and included in the
				// migration result.
				sess1, err := store.NewSession(
					ctx, "session1", TypeMacaroonAdmin,
					time.Unix(1000, 0), "",
				)
				require.NoError(t, err)

				sess2, err := store.NewSession(
					ctx, "session2", TypeMacaroonAdmin,
					time.Unix(1000, 0), "",
				)
				require.NoError(t, err)

				// Then add two sessions with the same ID, to
				// test that only the latest session is included
				// in the migration result.
				sess3, err := store.NewSession(
					ctx, "session3", TypeMacaroonAdmin,
					time.Unix(1000, 0), "",
				)
				require.NoError(t, err)

				// During the addition of the session linking
				// functionality, logic was added in the
				// NewSession function to ensure we can't create
				// multiple sessions with the same ID. Therefore
				// we need to manually override the ID of
				// the second session to match the first
				// session, to simulate such a scenario that
				// could occur prior to the addition of that
				// logic.
				// We also need to update the CreatedAt time
				// as the execution of this function is too
				// fast for the CreatedAt time of sess2 and
				// sess3 to differ.
				err = updateSessionIDAndCreatedAt(
					store, sess3.ID, sess2.MacaroonRootKey,
					sess2.CreatedAt.Add(time.Minute),
				)
				require.NoError(t, err)

				// Finally, we add three sessions with the same
				// ID, to test we can handle more than two
				// sessions with the same ID.
				sess4, err := store.NewSession(
					ctx, "session4", TypeMacaroonAdmin,
					time.Unix(1000, 0), "",
				)
				require.NoError(t, err)

				sess5, err := store.NewSession(
					ctx, "session5", TypeMacaroonAdmin,
					time.Unix(1000, 0), "",
				)
				require.NoError(t, err)

				sess6, err := store.NewSession(
					ctx, "session6", TypeMacaroonAdmin,
					time.Unix(1000, 0), "",
				)
				require.NoError(t, err)

				err = updateSessionIDAndCreatedAt(
					store, sess5.ID, sess4.MacaroonRootKey,
					sess4.CreatedAt.Add(time.Minute),
				)
				require.NoError(t, err)

				err = updateSessionIDAndCreatedAt(
					store, sess6.ID, sess4.MacaroonRootKey,
					sess4.CreatedAt.Add(time.Minute*2),
				)
				require.NoError(t, err)

				// Now fetch the updated sessions from the kv
				// store, so that we are sure that the new IDs
				// have really been persisted in the DB.
				kvSessions := getBoltStoreSessions(t, store)
				require.Len(t, kvSessions, 6)

				getSessionByName := func(name string) *Session {
					for _, session := range kvSessions {
						if session.Label == name {
							return session
						}
					}

					t.Fatalf("session %s not found", name)
					return nil
				}

				// When multiple sessions with the same ID
				// exist, we expect only the session with the
				// latest creation time to be migrated.
				return []*Session{
					getSessionByName(sess1.Label),
					getSessionByName(sess3.Label),
					getSessionByName(sess6.Label),
				}
			},
		},
		{
			name:       "randomized sessions",
			populateDB: randomizedSessions,
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
			kvSessions := test.populateDB(t, kvStore, accountStore)

			// Proceed to create the sql store and execute the
			// migration.
			sqlStore, txEx := makeSQLDB(t, accountStore)

			err = txEx.ExecTx(
				ctx, sqldb.WriteTxOpt(),
				func(tx SQLQueries) error {
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

// randomizedSessions adds 100 randomized sessions to the kvStore, where 25% of
// them will contain up to 10 linked sessions. The rest of the session will have
// the rest of the session options randomized.
func randomizedSessions(t *testing.T, kvStore *BoltStore,
	accountsStore accounts.Store) []*Session {

	ctx := context.Background()

	var (
		// numberOfSessions is set to 100 to add enough sessions to get
		// enough variation between randomized sessions, but kept low
		// enough for the test not take too long to run, as the test
		// time increases drastically by the number of sessions we
		// migrate.
		numberOfSessions = 100
	)

	for i := range numberOfSessions {
		var (
			opts       []Option
			serverAddr string
		)
		macType := macaroonType(i)
		expiry := time.Unix(rand.Int63n(10000), rand.Int63n(10000))
		label := fmt.Sprintf("session%d", i+1)

		// Half of the sessions will get a set server address.
		if rand.Intn(2) == 0 {
			serverAddr = "foo.bar.baz:1234"
		}

		// Every 10th session will get no added options.
		if i%10 != 0 {
			// Add random privacy flags to 50% of the sessions.
			if rand.Intn(2) == 0 {
				opts = append(
					opts, WithPrivacy(randomPrivacyFlags()),
				)
			}

			// Add random feature configs to 50% of the sessions.
			if rand.Intn(2) == 0 {
				opts = append(
					opts,
					WithFeatureConfig(
						randomFeatureConfig(),
					),
				)
			}

			// Set that the session uses a dev server for 50% of the
			// sessions.
			if rand.Intn(2) == 0 {
				opts = append(opts, WithDevServer())
			}

			// Add a random macaroon recipe to 50% of the sessions.
			if rand.Intn(2) == 0 {
				// In 50% of those cases, we add a random
				// macaroon recipe with caveats and perms,
				// and for the other 50% we added a linked
				// account with the correct macaroon recipe (to
				// simulate realistic data).
				if rand.Intn(2) == 0 {
					opts = append(
						opts, randomMacaroonRecipe(),
					)
				} else {
					acctOpts := randomAccountOptions(
						ctx, t, accountsStore,
					)

					opts = append(opts, acctOpts...)
				}
			}
		}

		// We insert the session with the randomized params and options.
		activeSess, err := kvStore.NewSession(
			ctx, label, macType, expiry, serverAddr, opts...,
		)
		require.NoError(t, err)

		// For 25% of the sessions, we link a random number of sessions
		// to the session.
		if rand.Intn(4) == 0 {
			// Link up to 10 sessions to the session, and set the
			// same opts as the initial group session.
			for j := range rand.Intn(10) {
				// We first need to revoke the previous session
				// before we can create a new session that links
				// to the session.
				err = kvStore.ShiftState(
					ctx, activeSess.ID, StateCreated,
				)
				require.NoError(t, err)

				err = kvStore.ShiftState(
					ctx, activeSess.ID, StateRevoked,
				)
				require.NoError(t, err)

				opts = []Option{
					WithLinkedGroupID(&activeSess.GroupID),
				}

				if activeSess.DevServer {
					opts = append(opts, WithDevServer())
				}

				if activeSess.FeatureConfig != nil {
					opts = append(opts, WithFeatureConfig(
						*activeSess.FeatureConfig,
					))
				}

				if activeSess.PrivacyFlags != nil {
					opts = append(opts, WithPrivacy(
						activeSess.PrivacyFlags,
					))
				}

				if activeSess.MacaroonRecipe != nil {
					macRec := activeSess.MacaroonRecipe
					opts = append(opts, WithMacaroonRecipe(
						macRec.Caveats,
						macRec.Permissions,
					))
				}

				activeSess.AccountID.WhenSome(
					func(alias accounts.AccountID) {
						opts = append(
							opts,
							WithAccount(alias),
						)
					},
				)

				label = fmt.Sprintf("linkedSession%d", j+1)

				activeSess, err = kvStore.NewSession(
					ctx, label, activeSess.Type,
					time.Unix(1000, 0),
					activeSess.ServerAddr, opts...,
				)
				require.NoError(t, err)
			}
		}

		// Finally, we shift the active session to a random state.
		// As the state we set may be a state that's no longer set
		// through the current code base, or be an illegal state
		// transition, we use an alternative test state shifting method
		// that doesn't check that we transition the state in the legal
		// order.
		err = shiftStateUnsafe(kvStore, activeSess.ID, lastState(i))
		require.NoError(t, err)
	}

	return getBoltStoreSessions(t, kvStore)
}

// macaroonType returns a macaroon type based on the given index by taking the
// index modulo 6. This ensures an approximately equal distribution of macaroon
// types.
func macaroonType(i int) Type {
	switch i % 6 {
	case 0:
		return TypeMacaroonReadonly
	case 1:
		return TypeMacaroonAdmin
	case 2:
		return TypeMacaroonCustom
	case 3:
		return TypeUIPassword
	case 4:
		return TypeAutopilot
	default:
		return TypeMacaroonAccount
	}
}

// lastState returns a state based on the given index by taking the index modulo
// 5. This ensures an approximately equal distribution of states.
func lastState(i int) State {
	switch i % 5 {
	case 0:
		return StateCreated
	case 1:
		return StateInUse
	case 2:
		return StateRevoked
	case 3:
		return StateExpired
	default:
		return StateReserved
	}
}

// randomPrivacyFlags returns a random set of privacy flags.
func randomPrivacyFlags() PrivacyFlags {
	allFlags := []PrivacyFlag{
		ClearPubkeys,
		ClearChanIDs,
		ClearTimeStamps,
		ClearChanInitiator,
		ClearHTLCs,
		ClearClosingTxIds,
		ClearNetworkAddresses,
	}

	var privFlags []PrivacyFlag
	for _, flag := range allFlags {
		if rand.Intn(2) == 0 {
			privFlags = append(privFlags, flag)
		}
	}

	return privFlags
}

// randomFeatureConfig returns a random feature config with a random number of
// features. The feature names are generated as "feature0", "feature1", etc.
func randomFeatureConfig() FeaturesConfig {
	featureConfig := make(FeaturesConfig)
	for i := range rand.Intn(10) {
		featureName := fmt.Sprintf("feature%d", i)
		featureValue := []byte{byte(rand.Int31())}
		featureConfig[featureName] = featureValue
	}

	return featureConfig
}

// randomMacaroonRecipe returns a random macaroon recipe with a random number of
// caveats and permissions. The returned macaroon recipe may have nil set for
// either the caveats or permissions, but not both.
func randomMacaroonRecipe() Option {
	var (
		macCaveats []macaroon.Caveat
		macPerms   []bakery.Op
	)

	loopLen := rand.Intn(10) + 1

	if rand.Intn(2) == 0 {
		for range loopLen {
			var macCaveat macaroon.Caveat

			// We always have a caveat.Id, but the rest are
			// randomized if they exist or not.
			macCaveat.Id = randomBytes(rand.Intn(10) + 1)

			if rand.Intn(2) == 0 {
				macCaveat.VerificationId =
					randomBytes(rand.Intn(32) + 1)
			}

			if rand.Intn(2) == 0 {
				macCaveat.Location =
					randomString(rand.Intn(10) + 1)
			}

			macCaveats = append(macCaveats, macCaveat)
		}
	} else {
		macCaveats = nil
	}

	// We can't do both nil caveats and nil perms, so if we have nil
	// caveats, we set perms to a value.
	if rand.Intn(2) == 0 || macCaveats == nil {
		for range loopLen {
			var macPerm bakery.Op

			macPerm.Action = randomString(rand.Intn(10) + 1)
			macPerm.Entity = randomString(rand.Intn(10) + 1)

			macPerms = append(macPerms, macPerm)
		}
	} else {
		macPerms = nil
	}

	return WithMacaroonRecipe(macCaveats, macPerms)
}

// randomAccountOptions creates a random account with a random balance and
// expiry time, that's linked in the returned options. The returned options also
// returns the macaroon recipe with the account caveat.
func randomAccountOptions(ctx context.Context, t *testing.T,
	acctStore accounts.Store) []Option {

	balance := lnwire.MilliSatoshi(rand.Int63())

	// randomize expiry from 10 to 10,000 minutes
	expiry := time.Now().Add(
		time.Minute * time.Duration(rand.Intn(10000-10)+10),
	)

	// As the store has a unique constraint for inserting labels, we suffix
	// it with a sufficiently large random number avoid collisions.
	label := fmt.Sprintf("account:%d", rand.Int63())

	// Create an account with balance
	acct, err := acctStore.NewAccount(ctx, balance, expiry, label)
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

	sessCaveats := []macaroon.Caveat{}
	sessCaveats = append(
		sessCaveats,
		macaroon.Caveat{
			Id: []byte(accountCaveat),
		},
	)

	opts := []Option{
		WithAccount(acct.ID), WithMacaroonRecipe(sessCaveats, nil),
	}

	return opts
}

// randomBytes generates a random byte array of the passed length n.
func randomBytes(n int) []byte {
	b := make([]byte, n)
	for i := range b {
		b[i] = byte(rand.Intn(256)) // Random int between 0-255, then cast to byte
	}
	return b
}

// randomString generates a random string of the passed length n.
func randomString(n int) string {
	letterBytes := "abcdefghijklmnopqrstuvwxyz"

	b := make([]byte, n)
	for i := range b {
		b[i] = letterBytes[rand.Intn(len(letterBytes))]
	}
	return string(b)
}

// getBoltStoreSessions is a helper function that fetches all sessions
// from the kv store, while already asserting that there no error occurs
// when retrieving the sessions.
func getBoltStoreSessions(t *testing.T, db *BoltStore) []*Session {
	kvSessions, err := getBBoltSessions(db.DB)
	require.NoError(t, err)

	return kvSessions
}

// shiftStateUnsafe updates the state of the session with the given ID to the
// "dest" state, without checking if the state transition is legal.
//
// NOTE: this function should only be used for testing purposes.
func shiftStateUnsafe(db *BoltStore, id ID, dest State) error {
	return db.Update(func(tx *bbolt.Tx) error {
		sessionBucket, err := getBucket(tx, sessionBucketKey)
		if err != nil {
			return err
		}

		session, err := getSessionByID(sessionBucket, id)
		if err != nil {
			return err
		}

		// If the session is already in the desired state, we return
		// with no error to maintain idempotency.
		if session.State == dest {
			return nil
		}

		session.State = dest

		// If the session is terminal, we set the revoked at time to the
		// current time.
		if dest.Terminal() {
			session.RevokedAt = db.clock.Now().UTC()
		}

		return putSession(sessionBucket, session)
	})
}

// updateSessionIDAndCreatedAt can be used to update the ID, the GroupID,
// the MacaroonRootKey and the CreatedAt time a session in the BoltStore.
//
// NOTE: this function should only be used for testing purposes. Also note that
// we pass the macaroon root key to set the new session ID, as the
// DeserializeSession function derives the session ID from the
// session.MacaroonRootKey.
func updateSessionIDAndCreatedAt(db *BoltStore, oldID ID, newIdRootKey uint64,
	newCreatedAt time.Time) error {

	newId := IDFromMacRootKeyID(newIdRootKey)

	if oldID == newId {
		return fmt.Errorf("can't update session ID to the same ID: %s",
			oldID)
	}

	return db.Update(func(tx *bbolt.Tx) error {
		// Get the main session bucket.
		sessionBkt, err := getBucket(tx, sessionBucketKey)
		if err != nil {
			return err
		}

		// Look up the session using the old ID.
		sess, err := getSessionByID(sessionBkt, oldID)
		if err != nil {
			return err
		}

		// Update the session.
		sess.ID = newId
		sess.GroupID = newId
		sess.MacaroonRootKey = newIdRootKey
		sess.CreatedAt = newCreatedAt

		// Write it back under the same key (local pubkey).
		return putSession(sessionBkt, sess)
	})
}
