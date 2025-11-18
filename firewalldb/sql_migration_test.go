package firewalldb

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/binary"
	"encoding/json"
	"errors"
	"fmt"
	"testing"
	"time"

	"github.com/lightninglabs/lightning-terminal/accounts"
	"github.com/lightninglabs/lightning-terminal/db"
	"github.com/lightninglabs/lightning-terminal/db/sqlc"
	"github.com/lightninglabs/lightning-terminal/session"
	"github.com/lightningnetwork/lnd/clock"
	"github.com/lightningnetwork/lnd/fn"
	"github.com/lightningnetwork/lnd/macaroons"
	"github.com/lightningnetwork/lnd/sqldb"
	"github.com/stretchr/testify/require"
	"go.etcd.io/bbolt"
	"golang.org/x/exp/rand"
	"gopkg.in/macaroon-bakery.v2/bakery/checkers"
	"gopkg.in/macaroon.v2"
)

const (
	testRuleName           = "test-rule"
	testRuleName2          = "test-rule-2"
	testFeatureName        = "test-feature"
	testFeatureName2       = "test-feature-2"
	testEntryKey           = "test-entry-key"
	testEntryKey2          = "test-entry-key-2"
	testEntryKey3          = "test-entry-key-3"
	testEntryKey4          = "test-entry-key-4"
	testSessionName        = "test-session"
	testServerAddress      = "foo.bar.baz:1234"
	testActorName          = "test-actor"
	testTrigger            = "test-trigger"
	testIntent             = "test-intent"
	testStructuredJsonData = "{\"test\":\"data\"}"
	testRPCMethod          = "Test.Method"
	testRPCParamsJson      = "{\"test\":\"data\"}"
)

var (
	testEntryValue = []byte{1, 2, 3}
	testActionReq  = AddActionReq{
		ActorName:          "",
		FeatureName:        testFeatureName,
		Trigger:            testTrigger,
		Intent:             testIntent,
		StructuredJsonData: testStructuredJsonData,
		RPCMethod:          testRPCMethod,
		RPCParamsJson:      []byte(testRPCParamsJson),
	}
)

// rootKeyMockStore is a mock implementation of a macaroon service store that
// can be used to generate mock root keys for testing.
type rootKeyMockStore struct {
	// rootKeys is a slice of all root keys that have been added to the
	// store.
	rootKeys [][]byte
}

// addRootKeyFromIDSuffix adds a new root key to the store, using the passed
// 4 byte suffix. The function generates a root key that ends with the 4 byte
// suffix, prefixed by 4 random bytes.
func (r *rootKeyMockStore) addRootKeyFromIDSuffix(suffix [4]byte) uint64 {
	// As a real root key is 8 bytes, we need to generate a random 4 byte
	// prefix to prepend to the passed 4 byte suffix.
	rootKey := append(randomBytes(4), suffix[:]...)
	r.rootKeys = append(r.rootKeys, rootKey)

	return binary.BigEndian.Uint64(rootKey[:])
}

// addRootKeyFromAcctID adds a new root key to the store, using the first 4
// bytes of the passed account ID as the suffix for the root key, prefixed by 4
// random bytes.
func (r *rootKeyMockStore) addRootKeyFromAcctID(id accounts.AccountID) uint64 {
	var acctPrefix [4]byte
	copy(acctPrefix[:], id[:4])

	return r.addRootKeyFromIDSuffix(acctPrefix)
}

// addRandomRootKey adds a new random root key to the store, and returns the
// root key ID as an uint64.
func (r *rootKeyMockStore) addRandomRootKey() uint64 {
	rootKey := randomBytes(8)
	r.rootKeys = append(r.rootKeys, rootKey)

	return binary.BigEndian.Uint64(rootKey[:])
}

// getAllRootKeys returns all root keys that have been added to the store.
func (r *rootKeyMockStore) getAllRootKeys() [][]byte {
	return r.rootKeys
}

// expectedResult represents the expected result of a migration test.
type expectedResult struct {
	kvEntries []*kvEntry
	privPairs privacyPairs
	actions   []*Action
}

// TestFirewallDBMigration tests the migration of firewalldb from a bolt
// backend to a SQL database. Note that this test does not attempt to be a
// complete migration test.
func TestFirewallDBMigration(t *testing.T) {
	t.Parallel()

	ctx := context.Background()
	clock := clock.NewTestClock(time.Now())

	// When using build tags that creates a kvdb store for NewTestDB, we
	// skip this test as it is only applicable for postgres and sqlite tags.
	store := NewTestDB(t, clock)
	if _, ok := store.(*BoltDB); ok {
		t.Skipf("Skipping Firewall DB migration test for kvdb build")
	}

	makeSQLDB := func(t *testing.T, sessionsStore session.Store) (*SQLDB,
		*db.TransactionExecutor[SQLQueries]) {

		testDBStore := NewTestDBWithSessions(t, sessionsStore, clock)

		store, ok := testDBStore.(*SQLDB)
		require.True(t, ok)

		baseDB := store.BaseDB

		genericExecutor := db.NewTransactionExecutor(
			baseDB, func(tx *sql.Tx) SQLQueries {
				return baseDB.WithTx(tx)
			},
		)

		return store, genericExecutor
	}

	// The assertKvStoreMigrationResults function will currently assert that
	// the migrated kv stores entries in the SQLDB match the original kv
	// stores entries in the BoltDB.
	assertKvStoreMigrationResults := func(t *testing.T, sqlStore *SQLDB,
		kvEntries []*kvEntry) {

		var (
			ruleIDs    = make(map[string]int64)
			groupIDs   = make(map[string]int64)
			featureIDs = make(map[string]int64)
			err        error
		)

		getRuleID := func(ruleName string) int64 {
			ruleID, ok := ruleIDs[ruleName]
			if !ok {
				ruleID, err = sqlStore.GetRuleID(ctx, ruleName)
				require.NoError(t, err)

				ruleIDs[ruleName] = ruleID
			}

			return ruleID
		}

		getGroupID := func(groupAlias []byte) int64 {
			groupID, ok := groupIDs[string(groupAlias)]
			if !ok {
				groupID, err = sqlStore.GetSessionIDByAlias(
					ctx, groupAlias,
				)
				require.NoError(t, err)

				groupIDs[string(groupAlias)] = groupID
			}

			return groupID
		}

		getFeatureID := func(featureName string) int64 {
			featureID, ok := featureIDs[featureName]
			if !ok {
				featureID, err = sqlStore.GetFeatureID(
					ctx, featureName,
				)
				require.NoError(t, err)

				featureIDs[featureName] = featureID
			}

			return featureID
		}

		// First we extract all migrated kv entries from the SQLDB,
		// in order to be able to compare them to the original kv
		// entries, to ensure that the migration was successful.
		sqlKvEntries, err := sqlStore.ListAllKVStoresRecords(ctx)
		require.NoError(t, err)
		require.Equal(t, len(kvEntries), len(sqlKvEntries))

		// We then iterate over the original kv entries that were
		// migrated from the BoltDB to the SQLDB, and assert that they
		// match the migrated SQL kv entries.
		// NOTE: when fetching kv entries that were inserted into the
		// sql store with the entry value []byte{}, a nil value is
		// returned. Therefore, require.Equal would error on such cases,
		// while bytes.Equal would not. Therefore, the comparison below
		// uses bytes.Equal to compare the values.
		for _, entry := range kvEntries {
			ruleID := getRuleID(entry.ruleName)

			if entry.groupAlias.IsNone() {
				sqlVal, err := sqlStore.GetGlobalKVStoreRecord(
					ctx,
					sqlc.GetGlobalKVStoreRecordParams{
						Key:    entry.key,
						Perm:   entry.perm,
						RuleID: ruleID,
					},
				)
				require.NoError(t, err)
				// See docs for the loop above on why
				// bytes.Equal is used here.
				require.True(
					t, bytes.Equal(entry.value, sqlVal),
				)
			} else if entry.featureName.IsNone() {
				groupAlias := entry.groupAlias.UnwrapOrFail(t)
				groupID := getGroupID(groupAlias[:])

				v, err := sqlStore.GetGroupKVStoreRecord(
					ctx,
					sqlc.GetGroupKVStoreRecordParams{
						Key:    entry.key,
						Perm:   entry.perm,
						RuleID: ruleID,
						GroupID: sql.NullInt64{
							Int64: groupID,
							Valid: true,
						},
					},
				)
				require.NoError(t, err)
				// See docs for the loop above on why
				// bytes.Equal is used here.
				require.True(
					t, bytes.Equal(entry.value, v),
				)
			} else {
				groupAlias := entry.groupAlias.UnwrapOrFail(t)
				groupID := getGroupID(groupAlias[:])
				featureID := getFeatureID(
					entry.featureName.UnwrapOrFail(t),
				)

				sqlVal, err := sqlStore.GetFeatureKVStoreRecord(
					ctx,
					sqlc.GetFeatureKVStoreRecordParams{
						Key:    entry.key,
						Perm:   entry.perm,
						RuleID: ruleID,
						GroupID: sql.NullInt64{
							Int64: groupID,
							Valid: true,
						},
						FeatureID: sql.NullInt64{
							Int64: featureID,
							Valid: true,
						},
					},
				)
				require.NoError(t, err)
				// See docs for the loop above on why
				// bytes.Equal is used here.
				require.True(
					t, bytes.Equal(entry.value, sqlVal),
				)
			}
		}
	}

	// assertPrivacyMapperMigrationResults asserts that the migrated
	// privacy pairs in the SQLDB match the original privacy pairs in the
	// BoltDB. It also asserts that the SQL DB does not contain any other
	// privacy pairs than the expected ones.
	assertPrivacyMapperMigrationResults := func(t *testing.T,
		sqlStore *SQLDB, privPairs privacyPairs) {

		var totalExpectedPairs, totalPairs int

		// First assert that the SQLDB contains the expected privacy
		// pairs.
		for groupID, groupPairs := range privPairs {
			storePairs, err := sqlStore.GetAllPrivacyPairs(
				ctx, groupID,
			)
			require.NoError(t, err)
			require.Len(t, storePairs, len(groupPairs))

			totalExpectedPairs += len(storePairs)

			for _, storePair := range storePairs {
				// Assert that the store pair is in the
				// original pairs.
				pseudo, ok := groupPairs[storePair.RealVal]
				require.True(t, ok)

				// Assert that the pseudo value matches
				// the one in the store.
				require.Equal(t, pseudo, storePair.PseudoVal)
			}
		}

		// Then assert that SQLDB doesn't contain any other privacy
		// pairs than the expected ones.
		sessions, err := sqlStore.ListSessions(ctx)
		require.NoError(t, err)

		for _, dbSession := range sessions {
			sessionPairs, err := sqlStore.GetAllPrivacyPairs(
				ctx, dbSession.ID,
			)
			if errors.Is(err, sql.ErrNoRows) {
				// If there are no pairs for this session, we
				// can skip it.
				continue
			}
			require.NoError(t, err)

			totalPairs += len(sessionPairs)
		}

		require.Equal(t, totalExpectedPairs, totalPairs)
	}

	// assertActionsMigrationResults asserts that the migrated actions in
	// the SQLDB match the original expected actions. It also asserts that
	// the SQL DB does not contain any other actions than the expected ones.
	assertActionsMigrationResults := func(t *testing.T, sqlStore *SQLDB,
		expectedActions []*Action) {

		// First assert that the SQLDB contains the expected number of
		// actions.
		dbActions, _, _, err := sqlStore.ListActions(
			ctx, &ListActionsQuery{},
		)
		require.NoError(t, err)

		require.Equal(t, len(expectedActions), len(dbActions))
		if len(expectedActions) == 0 {
			return
		}

		// Then assert that the actions in the SQLDB match the
		// expected actions.
		for i, migratedAction := range dbActions {
			expAction := expectedActions[i]

			assertEqualActions(t, expAction, migratedAction)
		}
	}

	// The assertMigrationResults asserts that the migrated entries in the
	// firewall SQLDB match the expected results which should represent the
	// original entries in the BoltDB.
	assertMigrationResults := func(t *testing.T, sqlStore *SQLDB,
		expRes *expectedResult) {

		// Assert that the kv store migration results match the expected
		// results.
		assertKvStoreMigrationResults(t, sqlStore, expRes.kvEntries)

		// Assert that the privacy mapper migration results match the
		// expected results.
		assertPrivacyMapperMigrationResults(
			t, sqlStore, expRes.privPairs,
		)

		assertActionsMigrationResults(t, sqlStore, expRes.actions)
	}

	// The tests slice contains all the tests that we will run for the
	// migration of the firewalldb from a BoltDB to a SQLDB.
	tests := []struct {
		name       string
		populateDB func(t *testing.T, ctx context.Context,
			boltDB *BoltDB, sessionStore session.Store,
			accountsStore accounts.Store,
			rKeyStore *rootKeyMockStore) *expectedResult
	}{
		{
			name: "empty",
			populateDB: func(t *testing.T, ctx context.Context,
				boltDB *BoltDB, sessionStore session.Store,
				accountsStore accounts.Store,
				rKeyStore *rootKeyMockStore) *expectedResult {

				// Don't populate the DB, and return empty kv
				// records and privacy pairs.
				return &expectedResult{
					kvEntries: []*kvEntry{},
					privPairs: make(privacyPairs),
					actions:   []*Action{},
				}
			},
		},
		{
			name:       "global kv entries",
			populateDB: globalEntries,
		},
		{
			name:       "session specific kv entries",
			populateDB: sessionSpecificEntries,
		},
		{
			name:       "session specific kv entries deleted session",
			populateDB: sessionSpecificEntriesDeletedSession,
		},
		{
			name:       "session specific kv entries deleted and existing sessions",
			populateDB: sessionSpecificEntriesDeletedAndExistingSessions,
		},
		{
			name:       "feature specific kv entries",
			populateDB: featureSpecificEntries,
		},
		{
			name:       "feature specific kv entries deleted session",
			populateDB: featureSpecificEntriesDeletedSession,
		},
		{
			name:       "feature specific kv entries deleted and existing sessions",
			populateDB: featureSpecificEntriesDeletedAndExistingSessions,
		},
		{
			name:       "all kv entry combinations",
			populateDB: allEntryCombinations,
		},
		{
			name:       "random kv entries",
			populateDB: randomKVEntries,
		},
		{
			name:       "one session and privacy pair",
			populateDB: oneSessionAndPrivPair,
		},
		{
			name:       "one sessions with multiple privacy pair",
			populateDB: oneSessionsMultiplePrivPairs,
		},
		{
			name:       "multiple sessions and privacy pairs",
			populateDB: multipleSessionsAndPrivacyPairs,
		},
		{
			name:       "deleted session with privacy pair",
			populateDB: deletedSessionWithPrivPair,
		},
		{
			name:       "deleted and existing sessions with privacy pairs",
			populateDB: deletedAndExistingSessionsWithPrivPairs,
		},
		{
			name:       "random privacy pairs",
			populateDB: randomPrivacyPairs,
		},
		{
			name:       "action with no session or account",
			populateDB: actionNoSessionOrAccount,
		},
		{
			name:       "action with empty RPCParamsJson",
			populateDB: actionEmptyRPCParamsJson,
		},
		{
			name:       "action with session but no account",
			populateDB: actionWithSessionNoAccount,
		},
		{
			name:       "action with filtered session",
			populateDB: actionsWithFilteredSession,
		},
		{
			name:       "action with session with linked account",
			populateDB: actionWithSessionWithLinkedAccount,
		},
		{
			name:       "action with account",
			populateDB: actionWithAccount,
		},
		{
			name:       "actions with filtered account",
			populateDB: actionsWithFilteredAccount,
		},
		{
			name:       "action with multiple accounts",
			populateDB: actionWithMultipleAccounts,
		},
		{
			name:       "action with session and account",
			populateDB: actionWithSessionAndAccount,
		},
		{
			name:       "action with session with linked account and account",
			populateDB: actionWithSessionWithLinkedAccountAndAccount,
		},
		{
			name:       "random actions",
			populateDB: randomActions,
		},
		{
			name:       "random firewalldb entries",
			populateDB: randomFirewallDBEntries,
		},
	}

	for _, test := range tests {
		tc := test

		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			// First let's create a sessions store to link to in
			// the kvstores DB. In order to create the sessions
			// store though, we also need to create an accounts
			// store, that we link to the sessions store.
			// Note that both of these stores will be sql stores due
			// to the build tags enabled when running this test,
			// which means we can also pass the sessions store to
			// the sql version of the kv stores that we'll create
			// in test, without also needing to migrate it.
			accountStore := accounts.NewTestDB(t, clock)
			acctSQLStore, ok := accountStore.(*accounts.SQLStore)
			require.True(t, ok)

			sessionsStore := session.NewTestDBWithAccounts(
				t, clock, accountStore,
			)
			sessSQLStore, ok := sessionsStore.(*session.SQLStore)
			require.True(t, ok)

			// Create a new firewall store to populate with test
			// data.
			firewallStore, err := NewBoltDB(
				t.TempDir(), DBFilename, sessionsStore,
				accountStore, clock,
			)
			require.NoError(t, err)
			t.Cleanup(func() {
				require.NoError(t, firewallStore.Close())
			})

			rootKeyStore := &rootKeyMockStore{}

			// Populate the kv store.
			entries := test.populateDB(
				t, ctx, firewallStore, sessionsStore,
				accountStore, rootKeyStore,
			)

			// Create the SQL store that we will migrate the data
			// to.
			sqlStore, txEx := makeSQLDB(t, sessionsStore)

			// Perform the migration.
			err = txEx.ExecTx(ctx, sqldb.WriteTxOpt(),
				func(tx SQLQueries) error {
					return MigrateFirewallDBToSQL(
						ctx, firewallStore.DB, tx,
						acctSQLStore, sessSQLStore,
						rootKeyStore.getAllRootKeys(),
					)
				},
			)
			require.NoError(t, err)

			// Assert migration results.
			assertMigrationResults(t, sqlStore, entries)
		})
	}
}

// globalEntries populates the kv store with one global entry for the temp
// store, and one for the perm store.
func globalEntries(t *testing.T, ctx context.Context, boltDB *BoltDB,
	_ session.Store, _ accounts.Store,
	_ *rootKeyMockStore) *expectedResult {

	return insertTempAndPermEntry(
		t, ctx, boltDB, testRuleName, fn.None[[]byte](),
		fn.None[string](), testEntryKey, testEntryValue,
	)
}

// sessionSpecificEntries populates the kv store with one session specific
// entry for the local temp store, and one session specific entry for the perm
// local store.
func sessionSpecificEntries(t *testing.T, ctx context.Context, boltDB *BoltDB,
	sessionStore session.Store, _ accounts.Store,
	_ *rootKeyMockStore) *expectedResult {

	groupAlias := getNewSessionAlias(t, ctx, sessionStore)

	return insertTempAndPermEntry(
		t, ctx, boltDB, testRuleName, groupAlias, fn.None[string](),
		testEntryKey, testEntryValue,
	)
}

// sessionSpecificEntriesDeletedSession populates the kv store with one session
// specific entry for the local temp store, and one session specific entry for
// the perm local store. Once populated, the session that the entries are linked
// to is deleted. When migrating, we therefore expect that the kv entries linked
// to the deleted session are not migrated.
func sessionSpecificEntriesDeletedSession(t *testing.T, ctx context.Context,
	boltDB *BoltDB, sessionStore session.Store, _ accounts.Store,
	_ *rootKeyMockStore) *expectedResult {

	groupAlias := getNewSessionAlias(t, ctx, sessionStore)

	_ = insertTempAndPermEntry(
		t, ctx, boltDB, testRuleName, groupAlias, fn.None[string](),
		testEntryKey, testEntryValue,
	)

	err := sessionStore.DeleteReservedSessions(ctx)
	require.NoError(t, err)

	return &expectedResult{
		// Since the session the kx entries were linked to has been
		// deleted, we expect no kv entries to be migrated.
		kvEntries: []*kvEntry{},
		privPairs: make(privacyPairs),
		actions:   []*Action{},
	}
}

// sessionSpecificEntriesDeletedAndExistingSessions populates the kv store with
// two sessions and their corresponding kv entries.
// One of the sessions is deleted prior to the migration though, and therefore
// the migration should only migrate the kv entries linked to the still existing
// session.
func sessionSpecificEntriesDeletedAndExistingSessions(t *testing.T,
	ctx context.Context, boltDB *BoltDB, sessionStore session.Store,
	_ accounts.Store, _ *rootKeyMockStore) *expectedResult {

	groupAlias1 := getNewSessionAlias(t, ctx, sessionStore)

	_ = insertTempAndPermEntry(
		t, ctx, boltDB, testRuleName, groupAlias1, fn.None[string](),
		testEntryKey, testEntryValue,
	)

	err := sessionStore.DeleteReservedSessions(ctx)
	require.NoError(t, err)

	groupAlias2 := getNewSessionAlias(t, ctx, sessionStore)

	return insertTempAndPermEntry(
		t, ctx, boltDB, testRuleName2, groupAlias2, fn.None[string](),
		testEntryKey2, testEntryValue,
	)
}

// featureSpecificEntries populates the kv store with one feature specific
// entry for the local temp store, and one feature specific entry for the perm
// local store.
func featureSpecificEntries(t *testing.T, ctx context.Context, boltDB *BoltDB,
	sessionStore session.Store, _ accounts.Store,
	_ *rootKeyMockStore) *expectedResult {

	groupAlias := getNewSessionAlias(t, ctx, sessionStore)

	return insertTempAndPermEntry(
		t, ctx, boltDB, testRuleName, groupAlias,
		fn.Some(testFeatureName), testEntryKey, testEntryValue,
	)
}

// featureSpecificEntriesDeletedSession populates the kv store with one feature
// specific entry for the local temp store, and one feature specific entry for
// the perm local store. Once populated, the session that the entries are linked
// to is deleted. When migrating, we therefore expect that the kv entries linked
// to the deleted session are not migrated.
func featureSpecificEntriesDeletedSession(t *testing.T, ctx context.Context,
	boltDB *BoltDB, sessionStore session.Store, _ accounts.Store,
	_ *rootKeyMockStore) *expectedResult {

	groupAlias := getNewSessionAlias(t, ctx, sessionStore)

	_ = insertTempAndPermEntry(
		t, ctx, boltDB, testRuleName, groupAlias,
		fn.Some(testFeatureName), testEntryKey, testEntryValue,
	)

	err := sessionStore.DeleteReservedSessions(ctx)
	require.NoError(t, err)

	return &expectedResult{
		// Since the session the kv entries were linked to has been
		// deleted, we expect no kv entries to be migrated.
		kvEntries: []*kvEntry{},
		privPairs: make(privacyPairs),
		actions:   []*Action{},
	}
}

// featureSpecificEntriesDeletedAndExistingSessions populates the kv store with
// two sessions and their corresponding feature specific kv entries.
// One of the sessions is deleted prior to the migration though, and therefore
// the migration should only migrate the kv entries linked to the still existing
// session.
func featureSpecificEntriesDeletedAndExistingSessions(t *testing.T,
	ctx context.Context, boltDB *BoltDB, sessionStore session.Store,
	_ accounts.Store, _ *rootKeyMockStore) *expectedResult {

	groupAlias1 := getNewSessionAlias(t, ctx, sessionStore)

	_ = insertTempAndPermEntry(
		t, ctx, boltDB, testRuleName, groupAlias1,
		fn.Some(testFeatureName), testEntryKey, testEntryValue,
	)

	err := sessionStore.DeleteReservedSessions(ctx)
	require.NoError(t, err)

	groupAlias2 := getNewSessionAlias(t, ctx, sessionStore)

	return insertTempAndPermEntry(
		t, ctx, boltDB, testRuleName2, groupAlias2,
		fn.Some(testFeatureName2), testEntryKey2, testEntryValue,
	)
}

// allEntryCombinations adds all types of different entries at all possible
// levels of the kvstores, including multple entries with the same
// ruleName, groupAlias and featureName. The test aims to cover all possible
// combinations of entries in the kvstores, including nil and empty entry
// values. That therefore ensures that the migrations don't overwrite or miss
// any entries when the entry set is more complex than just a single entry at
// each level.
func allEntryCombinations(t *testing.T, ctx context.Context, boltDB *BoltDB,
	sessionStore session.Store, acctStore accounts.Store,
	rStore *rootKeyMockStore) *expectedResult {

	var result []*kvEntry
	add := func(entry *expectedResult) {
		result = append(result, entry.kvEntries...)
	}

	// First lets create standard entries at all levels, which represents
	// the entries added by other tests.
	add(globalEntries(t, ctx, boltDB, sessionStore, acctStore, rStore))
	add(sessionSpecificEntries(
		t, ctx, boltDB, sessionStore, acctStore, rStore,
	))
	add(featureSpecificEntries(
		t, ctx, boltDB, sessionStore, acctStore, rStore,
	))

	groupAlias := getNewSessionAlias(t, ctx, sessionStore)

	// Now lets add a few more entries at with different rule names and
	// features, just to ensure that we cover entries in different rule and
	// feature tables.
	add(insertTempAndPermEntry(
		t, ctx, boltDB, testRuleName2, fn.None[[]byte](),
		fn.None[string](), testEntryKey, testEntryValue,
	))
	add(insertTempAndPermEntry(
		t, ctx, boltDB, testRuleName2, groupAlias,
		fn.None[string](), testEntryKey, testEntryValue,
	))
	add(insertTempAndPermEntry(
		t, ctx, boltDB, testRuleName2, groupAlias,
		fn.Some(testFeatureName), testEntryKey, testEntryValue,
	))
	// Let's also create an entry with a different feature name that's still
	// referencing the same group ID as the previous entry.
	add(insertTempAndPermEntry(
		t, ctx, boltDB, testRuleName2, groupAlias,
		fn.Some(testFeatureName2), testEntryKey, testEntryValue,
	))

	// Finally, lets add a few entries with nil and empty values set for the
	// actual key value, at all different levels, to ensure that tests don't
	// break if the value is nil or empty. Note that both nilValue and
	// nilSliceValue are equivalent in the below tests, but we include both
	// to make it clear that they are equivalent, and setting the value
	// to either alternative is covered.
	var (
		nilValue      []byte = nil
		nilSliceValue        = []byte(nil)
		emptyValue           = []byte{}
	)

	add(insertTempAndPermEntry(
		t, ctx, boltDB, testRuleName2, fn.None[[]byte](),
		fn.None[string](), testEntryKey2, nilValue,
	))
	add(insertTempAndPermEntry(
		t, ctx, boltDB, testRuleName2, fn.None[[]byte](),
		fn.None[string](), testEntryKey3, nilSliceValue,
	))
	add(insertTempAndPermEntry(
		t, ctx, boltDB, testRuleName2, fn.None[[]byte](),
		fn.None[string](), testEntryKey4, emptyValue,
	))

	add(insertTempAndPermEntry(
		t, ctx, boltDB, testRuleName2, groupAlias,
		fn.None[string](), testEntryKey2, nilValue,
	))
	add(insertTempAndPermEntry(
		t, ctx, boltDB, testRuleName2, groupAlias,
		fn.None[string](), testEntryKey3, nilSliceValue,
	))
	add(insertTempAndPermEntry(
		t, ctx, boltDB, testRuleName2, groupAlias,
		fn.None[string](), testEntryKey4, emptyValue,
	))

	add(insertTempAndPermEntry(
		t, ctx, boltDB, testRuleName2, groupAlias,
		fn.Some(testFeatureName), testEntryKey2, nilValue,
	))
	add(insertTempAndPermEntry(
		t, ctx, boltDB, testRuleName2, groupAlias,
		fn.Some(testFeatureName), testEntryKey3, nilSliceValue,
	))
	add(insertTempAndPermEntry(
		t, ctx, boltDB, testRuleName2, groupAlias,
		fn.Some(testFeatureName), testEntryKey4, emptyValue,
	))

	return &expectedResult{
		kvEntries: result,
		privPairs: make(privacyPairs),
		actions:   []*Action{},
	}
}

func getNewSessionAlias(t *testing.T, ctx context.Context,
	sessionStore session.Store) fn.Option[[]byte] {

	sess, err := sessionStore.NewSession(
		ctx, "test", session.TypeAutopilot,
		time.Unix(1000, 0), "something",
	)
	require.NoError(t, err)

	return fn.Some(sess.GroupID[:])
}

// insertTempAndPermEntry populates the kv store with one entry for the temp
// store, and one entry for the perm store. Both of the entries will be inserted
// with the same groupAlias, ruleName, entryKey and entryValue.
func insertTempAndPermEntry(t *testing.T, ctx context.Context,
	boltDB *BoltDB, ruleName string, groupAlias fn.Option[[]byte],
	featureNameOpt fn.Option[string], entryKey string,
	entryValue []byte) *expectedResult {

	tempKvEntry := &kvEntry{
		ruleName:    ruleName,
		groupAlias:  groupAlias,
		featureName: featureNameOpt,
		key:         entryKey,
		value:       entryValue,
		perm:        false,
	}

	insertKvEntry(t, ctx, boltDB, tempKvEntry)

	permKvEntry := &kvEntry{
		ruleName:    ruleName,
		groupAlias:  groupAlias,
		featureName: featureNameOpt,
		key:         entryKey,
		value:       entryValue,
		perm:        true,
	}

	insertKvEntry(t, ctx, boltDB, permKvEntry)

	return &expectedResult{
		kvEntries: []*kvEntry{tempKvEntry, permKvEntry},
		// No privacy pairs are inserted in this test.
		privPairs: make(privacyPairs),
		actions:   []*Action{},
	}
}

// insertKvEntry populates the kv store with passed entry, and asserts that the
// entry is inserted correctly.
func insertKvEntry(t *testing.T, ctx context.Context,
	boltDB *BoltDB, entry *kvEntry) {

	if entry.groupAlias.IsNone() && entry.featureName.IsSome() {
		t.Fatalf("cannot set both global and feature specific at the " +
			"same time")
	}

	// We get the kv stores that the entry will be inserted into. Note that
	// we set an empty group ID if the entry is global, as the group ID
	// will not be used when fetching the actual kv store that's used for
	// global entries.
	groupID := [4]byte{}
	if entry.groupAlias.IsSome() {
		copy(groupID[:], entry.groupAlias.UnwrapOrFail(t))
	}

	kvStores := boltDB.GetKVStores(
		entry.ruleName, groupID, entry.featureName.UnwrapOr(""),
	)

	err := kvStores.Update(ctx, func(ctx context.Context,
		tx KVStoreTx) error {

		store := tx.Global()

		switch {
		case entry.groupAlias.IsNone() && !entry.perm:
			store = tx.GlobalTemp()
		case entry.groupAlias.IsSome() && !entry.perm:
			store = tx.LocalTemp()
		case entry.groupAlias.IsSome() && entry.perm:
			store = tx.Local()
		}

		return store.Set(ctx, entry.key, entry.value)
	})
	require.NoError(t, err)
}

// randomKVEntries populates the kv store with random kv entries that span
// across all possible combinations of different levels of entries in the kv
// store. All values and different bucket names are randomly generated.
func randomKVEntries(t *testing.T, ctx context.Context,
	boltDB *BoltDB, sessionStore session.Store, _ accounts.Store,
	_ *rootKeyMockStore) *expectedResult {

	var (
		// We set the number of entries to insert to 1000, as that
		// should be enough to cover as many different
		// combinations of entries as possible, while still being
		// fast enough to run in a reasonable time.
		numberOfEntries = 1000
		insertedEntries = make([]*kvEntry, 0)
		ruleName        = "initial-rule"
		groupAlias      []byte
		featureName     = "initial-feature"
	)

	// Create a random session that we can reference for the initial group
	// ID.
	sess, err := sessionStore.NewSession(
		ctx, "initial-session", session.Type(1), time.Unix(1000, 0),
		"serverAddr.test",
	)
	require.NoError(t, err)

	groupAlias = sess.GroupID[:]

	// Generate random entries. Note that many entries will use the same
	// rule name, group ID and feature name, to simulate the real world
	// usage of the kv stores as much as possible.
	for i := 0; i < numberOfEntries; i++ {
		// On average, we will generate a new rule which will be used
		// for the kv store entry 10% of the time.
		if rand.Intn(10) == 0 {
			ruleName = fmt.Sprintf(
				"rule-%s-%d", randomString(rand.Intn(30)+1), i,
			)
		}

		// On average, we use the global store 25% of the time.
		global := rand.Intn(4) == 0

		// We'll use the perm store 50% of the time.
		perm := rand.Intn(2) == 0

		// For the non-global entries, we will generate a new group
		// alias 25% of the time.
		if !global && rand.Intn(4) == 0 {
			newSess, err := sessionStore.NewSession(
				ctx, fmt.Sprintf("session-%d", i),
				session.Type(uint8(rand.Intn(5))),
				time.Unix(1000, 0),
				randomString(rand.Intn(10)+1),
			)
			require.NoError(t, err)

			groupAlias = newSess.GroupID[:]
		}

		featureNameOpt := fn.None[string]()

		// For 50% of the non-global entries, we insert a feature
		// specific entry. The other 50% will be session specific
		// entries.
		if !global && rand.Intn(2) == 0 {
			// 25% of the time, we will generate a new feature name.
			if rand.Intn(4) == 0 {
				featureName = fmt.Sprintf(
					"feature-%s-%d",
					randomString(rand.Intn(30)+1), i,
				)
			}

			featureNameOpt = fn.Some(featureName)
		}

		groupAliasOpt := fn.None[[]byte]()
		if !global {
			// If the entry is not global, we set the group ID
			// to the latest session's group ID.
			groupAliasOpt = fn.Some(groupAlias[:])
		}

		entry := &kvEntry{
			ruleName:    ruleName,
			groupAlias:  groupAliasOpt,
			featureName: featureNameOpt,
			key:         fmt.Sprintf("key-%d", i),
			perm:        perm,
		}

		// When setting a value for the entry, 25% of the time, we will
		// set a nil or empty value.
		if rand.Intn(4) == 0 {
			// in 50% of these cases, we will set the value to nil,
			// and in the other 50% we will set it to an empty
			// value
			if rand.Intn(2) == 0 {
				entry.value = nil
			} else {
				entry.value = []byte{}
			}
		} else {
			// Else generate a random value for all entries,
			entry.value = []byte(randomString(rand.Intn(100) + 1))
		}

		// Insert the entry into the kv store.
		insertKvEntry(t, ctx, boltDB, entry)

		// Add the entry to the list of inserted entries.
		insertedEntries = append(insertedEntries, entry)
	}

	return &expectedResult{
		kvEntries: insertedEntries,
		// No privacy pairs are inserted in this test.
		privPairs: make(privacyPairs),
		actions:   []*Action{},
	}
}

// oneSessionAndPrivPair inserts 1 session with 1 privacy pair into the
// boltDB.
func oneSessionAndPrivPair(t *testing.T, ctx context.Context,
	boltDB *BoltDB, sessionStore session.Store, _ accounts.Store,
	_ *rootKeyMockStore) *expectedResult {

	return createPrivacyPairs(t, ctx, boltDB, sessionStore, 1, 1)
}

// deletedSessionWithPrivPair inserts 1 session with a linked 1 privacy pair
// into the boltDB, and then deletes the session from the sessions store, to
// simulate the case where a session has been deleted, but the privacy pairs
// still exist. This can happen if the user deletes their session db but not
// their firewall db.
func deletedSessionWithPrivPair(t *testing.T, ctx context.Context,
	boltDB *BoltDB, sessionStore session.Store, _ accounts.Store,
	_ *rootKeyMockStore) *expectedResult {

	_ = createPrivacyPairs(t, ctx, boltDB, sessionStore, 1, 1)

	// Now we delete the session that the privacy pair was linked to.
	err := sessionStore.DeleteReservedSessions(ctx)
	require.NoError(t, err)

	return &expectedResult{
		kvEntries: []*kvEntry{},
		// Since the session the privacy pair was linked to has been
		// deleted, we expect no privacy pairs to be migrated.
		privPairs: make(privacyPairs),
		actions:   []*Action{},
	}
}

// deletedAndExistingSessionsWithPrivPairs generates 2 different privacy pairs,
// each linked to a different sessions. However, one of the sessions is deleted
// prior to the migration, to test that only one of the privacy pairs should be
// migrated, while the other one should be ignored since its session has been
// deleted.
func deletedAndExistingSessionsWithPrivPairs(t *testing.T, ctx context.Context,
	boltDB *BoltDB, sessionStore session.Store, _ accounts.Store,
	_ *rootKeyMockStore) *expectedResult {

	// First generate one privacy pair linked to a session that will be
	// deleted.
	_ = createPrivacyPairs(t, ctx, boltDB, sessionStore, 1, 1)

	// Delete the linked session.
	err := sessionStore.DeleteReservedSessions(ctx)
	require.NoError(t, err)

	// Now generate another privacy pair linked to a session that won't be
	// deleted prior to the migration. Therefore, this privacy pair should
	// be migrated.
	return createPrivacyPairs(t, ctx, boltDB, sessionStore, 1, 1)
}

// oneSessionsMultiplePrivPairs inserts 1 session with 10 privacy pairs into the
// boltDB.
func oneSessionsMultiplePrivPairs(t *testing.T, ctx context.Context,
	boltDB *BoltDB, sessionStore session.Store, _ accounts.Store,
	_ *rootKeyMockStore) *expectedResult {

	return createPrivacyPairs(t, ctx, boltDB, sessionStore, 1, 10)
}

// multipleSessionsAndPrivacyPairs inserts 5 sessions with 10 privacy pairs
// per session into the boltDB.
func multipleSessionsAndPrivacyPairs(t *testing.T, ctx context.Context,
	boltDB *BoltDB, sessionStore session.Store, _ accounts.Store,
	_ *rootKeyMockStore) *expectedResult {

	return createPrivacyPairs(t, ctx, boltDB, sessionStore, 5, 10)
}

// createPrivacyPairs is a helper function that creates a number of sessions
// with a number of privacy pairs per session. It returns an expectedResult
// struct that contains the expected privacy pairs and no kv records.
func createPrivacyPairs(t *testing.T, ctx context.Context,
	boltDB *BoltDB, sessionStore session.Store, numSessions int,
	numPairsPerSession int) *expectedResult {

	pairs := make(privacyPairs)

	sessSQLStore, ok := sessionStore.(*session.SQLStore)
	require.True(t, ok)

	for i := range numSessions {
		sess, err := sessionStore.NewSession(
			ctx, fmt.Sprintf("session-%d", i),
			session.Type(uint8(rand.Intn(5))),
			time.Unix(1000, 0), randomString(rand.Intn(10)+1),
		)
		require.NoError(t, err)

		groupID := sess.GroupID
		sqlGroupID, err := sessSQLStore.GetSessionIDByAlias(
			ctx, groupID[:],
		)
		require.NoError(t, err)

		groupPairs := make(map[string]string)

		for j := range numPairsPerSession {
			// Note that the real values will be the same across the
			// sessions, as with real world data, the real value
			// will often be the same across sessions.
			realKey := fmt.Sprintf("real-%d", j)
			pseudoKey := fmt.Sprintf("pseudo-%d-%d", i, j)

			f := func(ctx context.Context, tx PrivacyMapTx) error {
				return tx.NewPair(ctx, realKey, pseudoKey)
			}

			err := boltDB.PrivacyDB(groupID).Update(ctx, f)
			require.NoError(t, err)

			groupPairs[realKey] = pseudoKey
		}

		pairs[sqlGroupID] = groupPairs
	}

	return &expectedResult{
		kvEntries: []*kvEntry{},
		privPairs: pairs,
		actions:   []*Action{},
	}
}

// randomPrivacyPairs creates a random number of privacy pairs to 10 sessions.
func randomPrivacyPairs(t *testing.T, ctx context.Context,
	boltDB *BoltDB, sessionStore session.Store, _ accounts.Store,
	_ *rootKeyMockStore) *expectedResult {

	numSessions := 10
	maxPairsPerSession := 20
	pairs := make(privacyPairs)

	sessSQLStore, ok := sessionStore.(*session.SQLStore)
	require.True(t, ok)

	for i := range numSessions {
		sess, err := sessionStore.NewSession(
			ctx, fmt.Sprintf("session-%d", i),
			session.Type(uint8(rand.Intn(5))),
			time.Unix(1000, 0), "foo.bar.baz:1234",
		)
		require.NoError(t, err)

		groupID := sess.GroupID
		sqlGroupID, err := sessSQLStore.GetSessionIDByAlias(
			ctx, groupID[:],
		)
		require.NoError(t, err)

		numPairs := rand.Intn(maxPairsPerSession) + 1
		groupPairs := make(map[string]string)

		for range numPairs {
			realKey := fmt.Sprintf("real-%s",
				randomString(rand.Intn(10)+5))
			pseudoKey := fmt.Sprintf("pseudo-%s",
				randomString(rand.Intn(10)+5))

			f := func(ctx context.Context, tx PrivacyMapTx) error {
				return tx.NewPair(ctx, realKey, pseudoKey)
			}

			err := boltDB.PrivacyDB(groupID).Update(ctx, f)
			require.NoError(t, err)

			groupPairs[realKey] = pseudoKey
		}

		pairs[sqlGroupID] = groupPairs
	}

	return &expectedResult{
		kvEntries: []*kvEntry{},
		privPairs: pairs,
		actions:   []*Action{},
	}
}

// actionNoSessionOrAccount adds an action which is not linked to any session or
// account.
func actionNoSessionOrAccount(t *testing.T, ctx context.Context,
	boltDB *BoltDB, _ session.Store, _ accounts.Store,
	rStore *rootKeyMockStore) *expectedResult {

	// As the action is not linked to any session, we add a random root
	// key which we use as the macaroon identifier for the action.
	// This simulates how similar actions would have been created in
	// production.
	rootKey := rStore.addRandomRootKey()

	actionReq := testActionReq
	actionReq.MacaroonRootKeyID = fn.Some(rootKey)
	actionReq.SessionID = fn.None[session.ID]()
	actionReq.AccountID = fn.None[accounts.AccountID]()

	action := addAction(t, ctx, boltDB, &actionReq)

	return &expectedResult{
		kvEntries: []*kvEntry{},
		privPairs: make(privacyPairs),
		actions:   []*Action{action},
	}
}

// actionEmptyRPCParamsJson adds an action which has no RPCParamsJson set.
func actionEmptyRPCParamsJson(t *testing.T, ctx context.Context,
	boltDB *BoltDB, _ session.Store, _ accounts.Store,
	rStore *rootKeyMockStore) *expectedResult {

	// As the action is not linked to any session, we add a random root
	// key which we use as the macaroon identifier for the action.
	// This simulates how similar actions would have been created in
	// production.
	rootKey := rStore.addRandomRootKey()

	actionReq := testActionReq
	actionReq.MacaroonRootKeyID = fn.Some(rootKey)
	actionReq.SessionID = fn.None[session.ID]()
	actionReq.AccountID = fn.None[accounts.AccountID]()
	actionReq.RPCParamsJson = []byte{}

	action := addAction(t, ctx, boltDB, &actionReq)

	return &expectedResult{
		kvEntries: []*kvEntry{},
		privPairs: make(privacyPairs),
		actions:   []*Action{action},
	}
}

// actionWithSessionNoAccount adds an action which is linked a session but no
// account.
func actionWithSessionNoAccount(t *testing.T, ctx context.Context,
	boltDB *BoltDB, sessStore session.Store, _ accounts.Store,
	rStore *rootKeyMockStore) *expectedResult {

	// Create the session that we will link the action to.
	sess := testSession(t, ctx, sessStore)

	// To simulate that the action was created with a macaroon identifier
	// that matches the session ID prefix, we add a root key with an ID
	// that matches the session ID prefix.
	rootKey := rStore.addRootKeyFromIDSuffix(sess.ID)

	actionReq := testActionReq
	actionReq.MacaroonRootKeyID = fn.Some(rootKey)
	// Link the action to the session, but no account.
	actionReq.SessionID = fn.Some(sess.ID)
	actionReq.AccountID = fn.None[accounts.AccountID]()

	action := addAction(t, ctx, boltDB, &actionReq)

	return &expectedResult{
		kvEntries: []*kvEntry{},
		privPairs: make(privacyPairs),
		actions:   []*Action{action},
	}
}

// actionsWithFilteredSession adds actions where a matching session ID do exist,
// but where that session wasn't active at the time of the action event and
// therefore couldn't have been linked to the action. Such sessions are filtered
// out during the migration.
func actionsWithFilteredSession(t *testing.T, ctx context.Context,
	boltDB *BoltDB, sessStore session.Store, _ accounts.Store,
	rStore *rootKeyMockStore) *expectedResult {

	var actions []*Action

	// addActionFromReq is a helper function that adds an action from the
	// passed request, and appends the added action to the actions slice.
	addActionFromReq := func(req AddActionReq) {
		actions = append(actions, addAction(t, ctx, boltDB, &req))
	}

	// First, we add an already expired session, as this should be filtered
	// out during the action migration.
	sess1 := testSessionWithExpiry(
		t, ctx, sessStore, time.Now().Add(-time.Hour),
	)

	// Ensure that the root key ID that's used during the action creation
	// does match the session ID prefix, to simulate that a collision did
	// occur with for the root key ID with an already existing session.
	rootKey1 := rStore.addRootKeyFromIDSuffix(sess1.ID)

	actionReq1 := testActionReq
	actionReq1.MacaroonRootKeyID = fn.Some(rootKey1)
	// However, as the session wasn't active at the time of the action
	// creation, we don't link the session as the action wasn't linked to
	// the session when it was created.
	actionReq1.SessionID = fn.None[session.ID]()
	actionReq1.AccountID = fn.None[accounts.AccountID]()

	addActionFromReq(actionReq1)

	// Next, we add a session that was revoked at the time of the action,
	// and therefore couldn't be the intended session for the action.
	sess2 := testSession(t, ctx, sessStore)

	// Revoke the session.
	err := sessStore.ShiftState(ctx, sess2.ID, session.StateCreated)
	require.NoError(t, err)
	err = sessStore.ShiftState(ctx, sess2.ID, session.StateRevoked)
	require.NoError(t, err)

	rootKey2 := rStore.addRootKeyFromIDSuffix(sess2.ID)
	actionReq2 := testActionReq
	actionReq2.MacaroonRootKeyID = fn.Some(rootKey2)
	actionReq2.SessionID = fn.None[session.ID]()
	actionReq2.AccountID = fn.None[accounts.AccountID]()

	addActionFromReq(actionReq2)

	return &expectedResult{
		kvEntries: []*kvEntry{},
		privPairs: make(privacyPairs),
		actions:   actions,
	}
}

// actionWithSessionWithLinkedAccount adds an action which is linked a session
// where the action itself is linked to an account.
func actionWithSessionWithLinkedAccount(t *testing.T, ctx context.Context,
	boltDB *BoltDB, sessStore session.Store, acctStore accounts.Store,
	rStore *rootKeyMockStore) *expectedResult {

	// Add a session with a linked account.
	sess, acct, _ := testSessionWithAccount(
		t, ctx, sessStore, acctStore,
	)

	rootKey := rStore.addRootKeyFromIDSuffix(sess.ID)
	_ = rStore.addRootKeyFromAcctID(acct.ID)

	actionReq := testActionReq
	actionReq.MacaroonRootKeyID = fn.Some(rootKey)
	// As the session the action is linked to does have a linked account,
	// we also link the action to the account.
	actionReq.SessionID = fn.Some(sess.ID)
	actionReq.AccountID = fn.Some(acct.ID)

	action := addAction(t, ctx, boltDB, &actionReq)

	return &expectedResult{
		kvEntries: []*kvEntry{},
		privPairs: make(privacyPairs),
		actions:   []*Action{action},
	}
}

// actionWithAccount adds an action which is linked an account but no session.
func actionWithAccount(t *testing.T, ctx context.Context,
	boltDB *BoltDB, _ session.Store, acctStore accounts.Store,
	rStore *rootKeyMockStore) *expectedResult {

	// Create the account that we will link the action to.
	acct, _ := testAccount(t, ctx, acctStore)

	// In production, the root key of the macaroon used when an account
	// event triggers an action creation, will start with the first 4 bytes
	// of the account ID. We therefore simulate that here by adding a root
	// key with an ID that matches the account ID prefix.
	rootKey := rStore.addRootKeyFromAcctID(acct.ID)

	actionReq := testActionReq
	actionReq.MacaroonRootKeyID = fn.Some(rootKey)
	// Link the action to the account, but no session.
	actionReq.SessionID = fn.None[session.ID]()
	actionReq.AccountID = fn.Some(acct.ID)

	action := addAction(t, ctx, boltDB, &actionReq)

	return &expectedResult{
		kvEntries: []*kvEntry{},
		privPairs: make(privacyPairs),
		actions:   []*Action{action},
	}
}

// actionsWithFilteredAccount adds actions with a session ID that does match an
// account, but where that account couldn't have been the account triggered the
// action creation. Such accounts are filtered out during the migration, and
// are not linked to the migrated action.
func actionsWithFilteredAccount(t *testing.T, ctx context.Context,
	boltDB *BoltDB, _ session.Store, acctStore accounts.Store,
	rStore *rootKeyMockStore) *expectedResult {

	var actions []*Action

	// addActionFromReq is a helper function that adds an action from the
	// passed request, and appends the added action to the actions slice.
	addActionFromReq := func(req AddActionReq) {
		actions = append(actions, addAction(t, ctx, boltDB, &req))
	}

	// First, we add an already expired account, as this should be filtered
	// out during the action migration.
	acct1, _ := testAccountWithExpiry(
		t, ctx, acctStore, time.Now().Add(-time.Hour),
	)

	// Ensure that the root key ID that's used during the action creation
	// does match the account ID prefix, to simulate that a collision did
	// occur with for the root key ID with an already existing session.
	rootKey1 := rStore.addRootKeyFromAcctID(acct1.ID)

	actionReq1 := testActionReq
	actionReq1.MacaroonRootKeyID = fn.Some(rootKey1)
	actionReq1.SessionID = fn.None[session.ID]()
	// The action doesn't link to any account, as the action wasn't intended
	// for the account when it was created.
	actionReq1.AccountID = fn.None[accounts.AccountID]()

	addActionFromReq(actionReq1)

	// Next, we add an account that was active at the time of the action,
	// but where the action itself had an actor set. This should not be
	// possible if the action was triggered by an account event, and the
	// account should therefore be filtered out during the migration.
	acct2, _ := testAccount(t, ctx, acctStore)

	rootKey2 := rStore.addRootKeyFromAcctID(acct2.ID)

	actionReq2 := testActionReq
	actionReq2.ActorName = testActorName
	actionReq2.MacaroonRootKeyID = fn.Some(rootKey2)
	actionReq2.SessionID = fn.None[session.ID]()
	actionReq2.AccountID = fn.None[accounts.AccountID]()

	addActionFromReq(actionReq2)

	// Lastly, if an action is connected to an RPC endpoint which is either
	// a payment or creation of an invoice, but the account that collides
	// action's macaroon identifier doesn't have any payments or invoices,
	// that account couldn't have been the trigger for the action.
	acct3, _ := testAccount(t, ctx, acctStore)

	rootKey3 := rStore.addRootKeyFromAcctID(acct3.ID)

	actionReq3 := testActionReq
	actionReq3.RPCMethod = "/routerrpc.Router/SendPaymentV2"
	actionReq3.MacaroonRootKeyID = fn.Some(rootKey3)
	actionReq3.SessionID = fn.None[session.ID]()
	actionReq3.AccountID = fn.None[accounts.AccountID]()

	addActionFromReq(actionReq3)

	acct4, _ := testAccount(t, ctx, acctStore)

	rootKey4 := rStore.addRootKeyFromAcctID(acct4.ID)

	actionReq4 := testActionReq
	actionReq4.RPCMethod = "/lnrpc.Lightning/AddInvoice"
	actionReq4.MacaroonRootKeyID = fn.Some(rootKey4)
	actionReq4.SessionID = fn.None[session.ID]()
	actionReq4.AccountID = fn.None[accounts.AccountID]()

	addActionFromReq(actionReq4)

	return &expectedResult{
		kvEntries: []*kvEntry{},
		privPairs: make(privacyPairs),
		actions:   actions,
	}
}

// actionWithMultipleAccounts adds an action where the short macaroon RootKeyID
// collides with multiple different accounts. This test ensures that only one of
// the accounts gets linked, given the filtration rules that are applied during
// the migration.
func actionWithMultipleAccounts(t *testing.T, ctx context.Context,
	boltDB *BoltDB, _ session.Store, acctStore accounts.Store,
	rStore *rootKeyMockStore) *expectedResult {

	// Create two accounts with colliding prefixes, which expires at
	// different times.
	acct1, _ := testAccountWithExpiry(
		t, ctx, acctStore, time.Now().Add(time.Hour*48),
	)
	_, acctID2 := testAccountWithExpiry(
		t, ctx, acctStore, time.Now().Add(time.Hour*24),
	)

	acctSqlStore, ok := acctStore.(*accounts.SQLStore)
	require.True(t, ok)

	// To ensure that the two accounts do collide, we modify the alias
	// of the second account to match the first 4 bytes of acct1's ID.
	var newAcctAlias [8]byte
	copy(newAcctAlias[:4], acct1.ID[:4])
	copy(newAcctAlias[4:], randomBytes(4))

	newAcct2ID := accounts.AccountID(newAcctAlias)
	acctAlias, err := newAcct2ID.ToInt64()
	require.NoError(t, err)

	_, err = acctSqlStore.UpdateAccountAliasForTests(
		ctx, sqlc.UpdateAccountAliasForTestsParams{
			Alias: acctAlias,
			ID:    acctID2,
		},
	)
	require.NoError(t, err)

	// Mock the root keys for both accounts.
	_ = rStore.addRootKeyFromAcctID(acct1.ID)
	rootKey := rStore.addRootKeyFromAcctID(newAcct2ID)

	actionReq := testActionReq
	actionReq.MacaroonRootKeyID = fn.Some(rootKey)
	actionReq.SessionID = fn.None[session.ID]()
	// When two colliding accounts exist, the account with the earliest
	// expiry should be linked to the action. In our case, that's acct2.
	actionReq.AccountID = fn.Some(newAcct2ID)

	action := addAction(t, ctx, boltDB, &actionReq)

	return &expectedResult{
		kvEntries: []*kvEntry{},
		privPairs: make(privacyPairs),
		actions:   []*Action{action},
	}
}

// actionWithSessionAndAccount adds an action where both a session and an
// account exist with IDs that collide with the action's macaroon RootKeyID.
// This test ensures that the action is linked to the session, since sessions
// take precedence over accounts during the migration.
func actionWithSessionAndAccount(t *testing.T, ctx context.Context,
	boltDB *BoltDB, sessStore session.Store, acctStore accounts.Store,
	rStore *rootKeyMockStore) *expectedResult {

	// Create a session and an account that will collide.
	sess := testSession(t, ctx, sessStore)
	_, acctID := testAccount(t, ctx, acctStore)

	acctSqlStore, ok := acctStore.(*accounts.SQLStore)
	require.True(t, ok)

	// Modify the first 4 bytes of the account alias to match the session
	// ID, to ensure that they collide.
	var newAcctAlias [8]byte
	copy(newAcctAlias[:4], sess.ID[:])
	copy(newAcctAlias[4:], randomBytes(4))

	acctAlias, err := accounts.AccountID(newAcctAlias).ToInt64()
	require.NoError(t, err)

	_, err = acctSqlStore.UpdateAccountAliasForTests(
		ctx, sqlc.UpdateAccountAliasForTestsParams{
			Alias: acctAlias,
			ID:    acctID,
		},
	)
	require.NoError(t, err)

	// Note that we set add the "session's" root key ID after we have added
	// the root key for newAcctAlias. During the migration, if two or more
	// root keys exist that have a colliding 4 byte short ID, the last added
	// root key will be chosen, as it's not possible to determine which root
	// key was actually used when creating the action. I.e. if the root key
	// ID for newAcctAlias was added last, that root key would be chosen
	// during the migration. This doesn't change if the action gets linked
	// to the session or the account though, but just for extra correctness
	// we ensure that the session's root key is added last and is therefore
	// used.
	_ = rStore.addRootKeyFromAcctID(newAcctAlias)
	rootKey := rStore.addRootKeyFromIDSuffix(sess.ID)

	actionReq := testActionReq
	actionReq.MacaroonRootKeyID = fn.Some(rootKey)
	// As the session takes precedence over the account, we expect the
	// action to be linked to the session only.
	actionReq.SessionID = fn.Some(sess.ID)
	actionReq.AccountID = fn.None[accounts.AccountID]()

	action := addAction(t, ctx, boltDB, &actionReq)

	return &expectedResult{
		kvEntries: []*kvEntry{},
		privPairs: make(privacyPairs),
		actions:   []*Action{action},
	}
}

// actionWithSessionWithLinkedAccountAndAccount adds an action linked to a
// session (that is itself linked to an account) and where another account
// collides with the action's MacRootKeyID.
// In this scenario, the session should take precedence over the separate
// existing account. As that session do link to a separate account, the action
// should therefore be linked to that session and that session's account.
func actionWithSessionWithLinkedAccountAndAccount(t *testing.T,
	ctx context.Context, boltDB *BoltDB, sessStore session.Store,
	acctStore accounts.Store, rStore *rootKeyMockStore) *expectedResult {

	// Create a session with a linked account.
	sess, acct1, _ := testSessionWithAccount(
		t, ctx, sessStore, acctStore,
	)
	// Also create another account that will collide with the action.
	_, acct2ID := testAccount(t, ctx, acctStore)

	acctSqlStore, ok := acctStore.(*accounts.SQLStore)
	require.True(t, ok)

	// Modify the first 4 bytes of the second account alias to match the
	// session ID, to ensure that they collide.
	var newAcct2Alias [8]byte
	copy(newAcct2Alias[:4], sess.ID[:])
	copy(newAcct2Alias[4:], randomBytes(4))

	acctAlias, err := accounts.AccountID(newAcct2Alias).ToInt64()
	require.NoError(t, err)

	_, err = acctSqlStore.UpdateAccountAliasForTests(
		ctx, sqlc.UpdateAccountAliasForTestsParams{
			Alias: acctAlias,
			ID:    acct2ID,
		},
	)
	require.NoError(t, err)

	// Note that we set add the "session's" root key ID after we have added
	// the root key for newAcct2Alias. During the migration, if two or more
	// root keys exist that have a colliding 4 byte short ID, the last added
	// root key will be chosen, as it's not possible to determine which root
	// key was actually used when creating the action. I.e. if the root key
	// ID for newAcct2Alias was added last, that root key would be chosen
	// during the migration. This doesn't change if the action gets linked
	// to the session or the account though, but just for extra correctness
	// we ensure that the session's root key is added last and is therefore
	// used.
	_ = rStore.addRootKeyFromAcctID(acct1.ID)
	_ = rStore.addRootKeyFromAcctID(newAcct2Alias)
	rootKey := rStore.addRootKeyFromIDSuffix(sess.ID)

	actionReq := testActionReq
	actionReq.MacaroonRootKeyID = fn.Some(rootKey)
	// Link the action to the session and the session's linked account, as
	// the session takes precedence over acct2.
	actionReq.SessionID = fn.Some(sess.ID)
	actionReq.AccountID = fn.Some(acct1.ID)

	action := addAction(t, ctx, boltDB, &actionReq)

	return &expectedResult{
		kvEntries: []*kvEntry{},
		privPairs: make(privacyPairs),
		actions:   []*Action{action},
	}
}

// randomActions creates 1000 actions, which properties are random.
func randomActions(t *testing.T, ctx context.Context, boltDB *BoltDB,
	sessStore session.Store, acctStore accounts.Store,
	rStore *rootKeyMockStore) *expectedResult {

	var actions []*Action

	numActions := 1000
	acctSqlStore, ok := acctStore.(*accounts.SQLStore)
	require.True(t, ok)

	for i := 0; i < numActions; i++ {
		rJson, err := randomJSON(rand.Intn(20))
		require.NoError(t, err)

		actionReq := AddActionReq{
			ActorName:          "",
			FeatureName:        randomString(rand.Intn(20)),
			Trigger:            randomString(rand.Intn(20)),
			Intent:             randomString(rand.Intn(20)),
			StructuredJsonData: rJson,
			RPCMethod:          randomRPCMethod(),
			RPCParamsJson:      []byte(rJson),
			MacaroonRootKeyID:  fn.None[uint64](),
			SessionID:          fn.None[session.ID](),
			AccountID:          fn.None[accounts.AccountID](),
		}

		// 1) 50% of the time, we create a session that may be linked to
		//    the action.
		if rand.Intn(2) == 0 {
			switch rand.Intn(3) {
			// In 1/3 of the cases, we create a session and no
			// account that is linked to the action.
			case 0:
				sess := testSession(t, ctx, sessStore)

				rootKey := rStore.addRootKeyFromIDSuffix(
					sess.ID,
				)
				actionReq.MacaroonRootKeyID = fn.Some(rootKey)
				actionReq.SessionID = fn.Some(sess.ID)

				// In 50% of these cases, we also set an actor
				// name to simulate how an action triggered by
				// the autopilot would look like in production.
				if rand.Intn(2) == 0 {
					actionReq.ActorName = randomString(
						rand.Intn(10) + 1,
					)
				}

			// In 1/3 of the cases, we create a session which will
			// be filtered out during the migration, and therefore
			// not be linked to the action.
			case 1:
				sess := randFilteredSession(t, ctx, sessStore)

				// We still set the actionReq.MacaroonIdentifier
				// to simulate that the action was created
				// to simulate a collision with the session ID,
				// but we don't set the actionReq.SessionID as
				// action wasn't actually linked to the session.
				actionReq.MacaroonRootKeyID = fn.Some(
					rStore.addRootKeyFromIDSuffix(sess.ID),
				)

			// In 1/3 of the cases, we create a session with a
			// linked account, and link both to the action.
			case 2:
				sess, acct, _ := testSessionWithAccount(
					t, ctx, sessStore, acctStore,
				)

				actionReq.MacaroonRootKeyID = fn.Some(
					rStore.addRootKeyFromIDSuffix(sess.ID),
				)
				_ = rStore.addRootKeyFromAcctID(acct.ID)

				actionReq.SessionID = fn.Some(sess.ID)
				actionReq.AccountID = fn.Some(acct.ID)
			}
		}

		// 2) 50% of the time, we create one or more accounts that may
		//    be linked to the action.
		if rand.Intn(2) == 0 {
			for i := 1; i <= rand.Intn(5)+1; i++ {
				var (
					acct   *accounts.OffChainBalanceAccount
					acctID int64

					// To ensure that the earliest expired
					// account created in the loop is the
					// one that may be linked to the action,
					// this new account expires later than
					// any previously created account in the
					// loop. The account will not be linked
					// if another account has already been
					// linked to the action.
					expiry = time.Now().Add(
						time.Hour * time.Duration(i*24),
					)
				)

				// In 50% of the cases, we create an expired
				// account that will be filtered out during the
				// migration though.
				expired := rand.Intn(2) == 0
				if expired {
					expiry = time.Now().Add(-time.Hour)
				}

				acct, acctID = testAccountWithExpiry(
					t, ctx, acctStore, expiry,
				)

				// If the action doesn't already have a
				// MacaroonIdentifier set, we set it to a root
				// key that matches the account ID.
				if actionReq.MacaroonRootKeyID.IsNone() {
					actionReq.MacaroonRootKeyID = fn.Some(
						rStore.addRootKeyFromAcctID(
							acct.ID,
						),
					)
				} else {
					// Else we modify the account ID so
					// that it collides with the existing
					// actionReq.MacaroonIdentifier.
					rootKey := actionReq.MacaroonId()

					var newAcctAlias [8]byte
					copy(newAcctAlias[:4], rootKey[:])
					copy(newAcctAlias[4:], randomBytes(4))

					newAcctID := accounts.AccountID(
						newAcctAlias,
					)
					acctAlias, err := newAcctID.ToInt64()
					require.NoError(t, err)

					_, err = acctSqlStore.UpdateAccountAliasForTests(
						ctx, sqlc.UpdateAccountAliasForTestsParams{
							Alias: acctAlias,
							ID:    acctID,
						},
					)
					require.NoError(t, err)

					acct.ID = newAcctID
				}

				// We link the account to the action if it isn't
				// expired, and when neither a session nor an
				// account already been set for the action. When
				// session has been set, the session takes
				// precedence over accounts, so we don't link
				// the account. If an account has already been
				// set, it will expire earlier than this current
				// account, and therefore has precedence.
				if actionReq.SessionID.IsNone() && !expired &&
					actionReq.AccountID.IsNone() {

					actionReq.AccountID = fn.Some(acct.ID)
				}
			}

			// In 25% of the cases, we modify the actionReq to
			// simulate that the action was created in a way that
			// makes it impossible to have been triggered by an
			// account event, and therefore the account(s) should
			// be filtered out.
			// Note that we only do this if no session is set, as
			// if the session did have a linked account, that
			// session will have precedence and link the action to
			// its account. Such an action must therefore have been
			// triggered by an account event, and filtering out the
			// account in that scenario doesn't make sense.
			if actionReq.SessionID.IsNone() && rand.Intn(4) == 0 {
				actionReq = randAcctFilteringReq(actionReq)
			}
		}

		// 3) If the action doesn't have a MacaroonIdentifier yet, that
		//    means no session or account was created for the action.
		//    In that scenario, we create a random root key to use as
		//    the MacaroonIdentifier, to simulate an action that was
		//    created without any session or account linked to it.
		if actionReq.MacaroonRootKeyID.IsNone() {
			actionReq.MacaroonRootKeyID = fn.Some(
				rStore.addRandomRootKey(),
			)
		}

		// 4) Set the actions session and account IDs to match what we
		//    expect the migrated action to look like.
		action := addAction(t, ctx, boltDB, &actionReq)

		// Append the action to the list of expected actions.
		actions = append(actions, action)
	}

	return &expectedResult{
		kvEntries: []*kvEntry{},
		privPairs: make(privacyPairs),
		actions:   actions,
	}
}

// randomFirewallDBEntries populates the firewalldb with random entries for all
// types entries that are currently supported in the firewalldb.
func randomFirewallDBEntries(t *testing.T, ctx context.Context,
	boltDB *BoltDB, sessionStore session.Store, acctStore accounts.Store,
	rStore *rootKeyMockStore) *expectedResult {

	kvEntries := randomKVEntries(
		t, ctx, boltDB, sessionStore, acctStore, rStore,
	)
	privPairs := randomPrivacyPairs(
		t, ctx, boltDB, sessionStore, acctStore, rStore,
	)
	actions := randomActions(
		t, ctx, boltDB, sessionStore, acctStore, rStore,
	)

	return &expectedResult{
		kvEntries: kvEntries.kvEntries,
		privPairs: privPairs.privPairs,
		actions:   actions.actions,
	}
}

// addAction is a helper function that adds an action to the boltDB from a
// passed AddActionReq. The function returns the added action, but with all the
// fields set that we expect the migrated action to have, i.e. with the full
// MacaroonRootKeyID set, and with the SessionID and AccountID set to the values
// they are expected to be set to after the boltDB action has been migrated to
// SQL.
func addAction(t *testing.T, ctx context.Context, boltDB *BoltDB,
	actionReq *AddActionReq) *Action {

	// We add one second to the clock prior to adding the action, just to
	// ensure that the action timestamp is always after the creation time
	// of a session or account that it might be linked to.
	boltDB.clock = clock.NewTestClock(boltDB.clock.Now().Add(time.Second))

	aLocator, err := boltDB.AddAction(ctx, actionReq)
	require.NoError(t, err)

	locator, ok := aLocator.(*kvdbActionLocator)
	require.True(t, ok)

	// Fetch the action that was just added, so that we can return it.
	var action *Action
	err = boltDB.View(func(tx *bbolt.Tx) error {
		mainActionsBucket, err := getBucket(tx, actionsBucketKey)
		require.NoError(t, err)

		actionsBucket := mainActionsBucket.Bucket(actionsKey)
		require.NotNil(t, actionsBucket)

		action, err = getAction(actionsBucket, locator)
		require.NoError(t, err)

		return nil
	})
	require.NoError(t, err)

	// Since the values for the MacaroonRootKeyID, SessionID and AccountID
	// do differ between boltDB actions and SQL actions, we set them here to
	// what we expect them to be after the migration.
	action.SessionID = actionReq.SessionID
	action.AccountID = actionReq.AccountID
	action.MacaroonRootKeyID = actionReq.MacaroonRootKeyID

	// In case the actionReq's RPCParamsJson wasn't set, we need to set the
	// expected action's RPCParamsJson to nil for Sqlite tests as that's
	// how such RPCParamsJson are represented in the Sqlite database, which
	// the returned expected action should reflect. Note that for Postgres
	// dbs, this param is stored as an empty array and not nil.
	if len(actionReq.RPCParamsJson) == 0 && isSqlite {
		action.RPCParamsJson = nil
	}

	return action
}

// testSession is a helper function that creates and returns a new admin
// macaroon session with a 1 hour expiration.
func testSession(t *testing.T, ctx context.Context,
	sessStore session.Store) *session.Session {

	return testSessionWithExpiry(
		t, ctx, sessStore, time.Now().Add(time.Hour*24),
	)
}

// testSessionWithExpiry is a helper function that creates and returns a new
// admin macaroon session with the specified expiry time.
func testSessionWithExpiry(t *testing.T, ctx context.Context,
	sessStore session.Store, expiry time.Time) *session.Session {

	sess, err := sessStore.NewSession(
		ctx, testSessionName, session.TypeMacaroonAdmin, expiry,
		testServerAddress,
	)
	require.NoError(t, err)

	return sess
}

// testAccount is a helper function that creates and returns a new account
// with a 1 hour expiration. The returned int64 is the SQL ID of the account.
func testAccount(t *testing.T, ctx context.Context,
	acctStore accounts.Store) (*accounts.OffChainBalanceAccount, int64) {

	return testAccountWithExpiry(
		t, ctx, acctStore, time.Now().Add(time.Hour*24),
	)
}

// testAccountWithExpiry is a helper function that creates and returns a new
// account with the specified expiry time. The returned int64 is the SQL ID of
// the account.
func testAccountWithExpiry(t *testing.T, ctx context.Context,
	acctStore accounts.Store,
	expiry time.Time) (*accounts.OffChainBalanceAccount, int64) {

	acct, err := acctStore.NewAccount(ctx, 1234, expiry, "")
	require.NoError(t, err)

	acctSqlStore, ok := acctStore.(*accounts.SQLStore)
	require.True(t, ok)

	aliasInt, err := acct.ID.ToInt64()
	require.NoError(t, err)

	acctSqlID, err := acctSqlStore.GetAccountIDByAlias(ctx, aliasInt)
	require.NoError(t, err)

	return acct, acctSqlID
}

// testSessionWithAccount is a helper function that creates and returns a new
// admin macaroon session with a 1 hour expiry that is linked to a newly created
// account with a 1 hour expiration. The returned int64 is the SQL ID of the
// account.
func testSessionWithAccount(t *testing.T, ctx context.Context,
	sessStore session.Store, acctStore accounts.Store) (*session.Session,
	*accounts.OffChainBalanceAccount, int64) {

	acct, err := acctStore.NewAccount(
		ctx, 1234, time.Now().Add(time.Hour*24), "",
	)
	require.NoError(t, err)
	require.False(t, acct.HasExpired())

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

	sess, err := sessStore.NewSession(
		ctx, testSessionName, session.TypeMacaroonAccount,
		time.Now().Add(time.Hour), testServerAddress,
		session.WithAccount(acct.ID),
		session.WithMacaroonRecipe(sessCaveats, nil),
	)
	require.NoError(t, err)

	acctSqlStore, ok := acctStore.(*accounts.SQLStore)
	require.True(t, ok)

	aliasInt, err := acct.ID.ToInt64()
	require.NoError(t, err)

	acctSqlID, err := acctSqlStore.GetAccountIDByAlias(ctx, aliasInt)
	require.NoError(t, err)

	return sess, acct, acctSqlID
}

// randFilteredSession creates and returns a session that will be filtered out
// during the actions migration. The exact reason why the session will be
// filtered out is random.
func randFilteredSession(t *testing.T, ctx context.Context,
	sessStore session.Store) *session.Session {

	if rand.Intn(2) == 0 {
		// Expired session.
		return testSessionWithExpiry(
			t, ctx, sessStore, time.Now().Add(-time.Hour),
		)
	} else {
		// Revoked session.
		sess := testSession(t, ctx, sessStore)

		err := sessStore.ShiftState(ctx, sess.ID, session.StateCreated)
		require.NoError(t, err)
		err = sessStore.ShiftState(ctx, sess.ID, session.StateRevoked)
		require.NoError(t, err)

		return sess
	}
}

// randAcctFilteringReq randomly modifies the passed AddActionReq to ensure that
// any account that collides with the action's MacaroonIdentifier will be
// filtered out during the migration. The AddActionReq is also modified to
// remove any previously set AccountID, as the action should not be linked to
// any account after the modification.
// The function returns the modified AddActionReq.
func randAcctFilteringReq(currentReq AddActionReq) AddActionReq {
	newReq := currentReq

	switch rand.Intn(8) {
	case 0:
		newReq.ActorName = randomString(rand.Intn(10) + 1)
	case 1:
		newReq.RPCMethod = "/lnrpc.Lightning/AddInvoice"
	case 2:
		newReq.RPCMethod = "/lnrpc.Lightning/SendPayment"
	case 3:
		newReq.RPCMethod = "/lnrpc.Lightning/SendPaymentSync"
	case 4:
		newReq.RPCMethod = "/routerrpc.Router/SendPaymentV2"
	case 5:
		newReq.RPCMethod = "/lnrpc.Lightning/SendToRoute"
	case 6:
		newReq.RPCMethod = "/lnrpc.Lightning/SendToRouteSync"
	case 7:
		newReq.RPCMethod = "/routerrpc.Router/SendToRouteV2"
	}

	newReq.AccountID = fn.None[accounts.AccountID]()

	return newReq
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

// randomBytes generates a random byte array of the passed length n.
func randomBytes(n int) []byte {
	b := make([]byte, n)
	for i := range b {
		b[i] = byte(rand.Intn(256)) // Random int between 0-255, then cast to byte
	}
	return b
}

// RandomJSON generates a JSON string with n random key/value pairs.
// Keys are random strings like "key1", "key2"...
// Values are random ints, floats, or strings.
func randomJSON(n int) (string, error) {
	// When 0 pairs are requested, we can return immediately.
	if n <= 0 {
		return "", nil
	}

	obj := make(map[string]any, n)
	for i := 0; i < n; i++ {
		key := fmt.Sprintf("key%d", i+1)

		// Randomly choose a type for the value
		switch rand.Intn(3) {
		case 0:
			// random int
			obj[key] = rand.Intn(1000)
		case 1:
			// random float
			obj[key] = rand.Float64() * 100
		case 2:
			// random string
			obj[key] = fmt.Sprintf("val%d", rand.Intn(10000))
		}
	}

	bytes, err := json.MarshalIndent(obj, "", "  ")
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

// randomRPCMethod mocks a random RPC method string with 1 to 5 segments, where
// each segment is a random string of 1 to 10 characters, and where a dot
// separates segments.
func randomRPCMethod() string {
	method := randomString(rand.Intn(10) + 1)
	segments := rand.Intn(5)
	for i := 0; i < segments; i++ {
		method += "." + randomString(rand.Intn(10)+1)
	}

	return method
}
