package firewalldb

import (
	"bytes"
	"context"
	"database/sql"
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

// TestFirewallDBMigration tests the migration of firewalldb from a bolt
// backend to a SQL database. Note that this test does not attempt to be a
// complete migration test.
// This test only tests the migration of the KV stores currently, but will
// be extended in the future to also test the migration of the privacy mapper
// and the actions store in the future.
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

	// The assertMigrationResults function will currently assert that
	// the migrated kv stores entries in the SQLDB match the original kv
	// stores entries in the BoltDB.
	assertMigrationResults := func(t *testing.T, sqlStore *SQLDB,
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

	// The tests slice contains all the tests that we will run for the
	// migration of the firewalldb from a BoltDB to a SQLDB.
	// Note that the tests currently only test the migration of the KV
	// stores, but will be extended in the future to also test the migration
	// of the privacy mapper and the actions store.
	tests := []struct {
		name       string
		populateDB func(t *testing.T, ctx context.Context,
			boltDB *BoltDB, sessionStore session.Store) []*kvEntry
	}{
		{
			name: "empty",
			populateDB: func(t *testing.T, ctx context.Context,
				boltDB *BoltDB,
				sessionStore session.Store) []*kvEntry {

				// Don't populate the DB.
				return make([]*kvEntry, 0)
			},
		},
		{
			name:       "global entries",
			populateDB: globalEntries,
		},
		{
			name:       "session specific entries",
			populateDB: sessionSpecificEntries,
		},
		{
			name:       "feature specific entries",
			populateDB: featureSpecificEntries,
		},
		{
			name:       "all entry combinations",
			populateDB: allEntryCombinations,
		},
		{
			name:       "random entries",
			populateDB: randomKVEntries,
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

			// Populate the kv store.
			entries := test.populateDB(
				t, ctx, firewallStore, sessionsStore,
			)

			// Create the SQL store that we will migrate the data
			// to.
			sqlStore, txEx := makeSQLDB(t, sessionsStore)

			// Perform the migration.
			var opts sqldb.MigrationTxOptions
			err = txEx.ExecTx(ctx, &opts,
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
	_ session.Store) []*kvEntry {

	return insertTempAndPermEntry(
		t, ctx, boltDB, testRuleName, fn.None[[]byte](),
		fn.None[string](), testEntryKey, testEntryValue,
	)
}

// sessionSpecificEntries populates the kv store with one session specific
// entry for the local temp store, and one session specific entry for the perm
// local store.
func sessionSpecificEntries(t *testing.T, ctx context.Context, boltDB *BoltDB,
	sessionStore session.Store) []*kvEntry {

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
	sessionStore session.Store) []*kvEntry {

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
	sessionStore session.Store) []*kvEntry {

	var result []*kvEntry
	add := func(entry []*kvEntry) {
		result = append(result, entry...)
	}

	// First lets create standard entries at all levels, which represents
	// the entries added by other tests.
	add(globalEntries(t, ctx, boltDB, sessionStore))
	add(sessionSpecificEntries(t, ctx, boltDB, sessionStore))
	add(featureSpecificEntries(t, ctx, boltDB, sessionStore))

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
	// break if the value is nil or empty.
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

	return result
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
	entryValue []byte) []*kvEntry {

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

	return []*kvEntry{tempKvEntry, permKvEntry}
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
	boltDB *BoltDB, sessionStore session.Store) []*kvEntry {

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

	return insertedEntries
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
