package firewalldb

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/binary"
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
	"github.com/lightningnetwork/lnd/sqldb"
	"github.com/stretchr/testify/require"
	"golang.org/x/exp/rand"
)

const (
	testRuleName     = "test-rule"
	testRuleName2    = "test-rule-2"
	testFeatureName  = "test-feature"
	testFeatureName2 = "test-feature-2"
	testEntryKey     = "test-entry-key"
	testEntryKey2    = "test-entry-key-2"
	testEntryKey3    = "test-entry-key-3"
	testEntryKey4    = "test-entry-key-4"
)

var (
	testEntryValue = []byte{1, 2, 3}
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
			name:       "feature specific kv entries",
			populateDB: featureSpecificEntries,
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
			name:       "random privacy pairs",
			populateDB: randomPrivacyPairs,
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
			sessionsStore := session.NewTestDBWithAccounts(
				t, clock, accountStore,
			)

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

// randomFirewallDBEntries populates the firewalldb with random entries for all
// types entries that are currently supported in the firewalldb.
//
// TODO(viktor): Extend this function to also populate it with random action
// entries, once the actions migration has been implemented.
func randomFirewallDBEntries(t *testing.T, ctx context.Context,
	boltDB *BoltDB, sessionStore session.Store, acctStore accounts.Store,
	rStore *rootKeyMockStore) *expectedResult {

	kvEntries := randomKVEntries(
		t, ctx, boltDB, sessionStore, acctStore, rStore,
	)
	privPairs := randomPrivacyPairs(
		t, ctx, boltDB, sessionStore, acctStore, rStore,
	)

	return &expectedResult{
		kvEntries: kvEntries.kvEntries,
		privPairs: privPairs.privPairs,
		actions:   []*Action{},
	}
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
