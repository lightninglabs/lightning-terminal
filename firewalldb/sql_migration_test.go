package firewalldb

import (
	"context"
	"database/sql"
	"fmt"
	"github.com/lightningnetwork/lnd/fn"
	"testing"
	"time"

	"github.com/lightninglabs/lightning-terminal/accounts"
	"github.com/lightninglabs/lightning-terminal/db"
	"github.com/lightninglabs/lightning-terminal/db/sqlc"
	"github.com/lightninglabs/lightning-terminal/session"
	"github.com/lightningnetwork/lnd/clock"
	"github.com/lightningnetwork/lnd/sqldb"
	"github.com/stretchr/testify/require"
	"golang.org/x/exp/rand"
)

// kvStoreRecord represents a single KV entry inserted into the BoltDB.
type kvStoreRecord struct {
	Perm        bool
	RuleName    string
	EntryKey    string
	Global      bool
	GroupID     *session.ID
	FeatureName fn.Option[string] // Set if the record is feature specific
	Value       []byte
}

// TestFirewallDBMigration tests the migration of firewalldb from a bolt
// backed to a SQL database. Note that this test does not attempt to be a
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
	// the migrated kv stores records in the SQLDB match the original kv
	// stores records in the BoltDB.
	assertMigrationResults := func(t *testing.T, sqlStore *SQLDB,
		kvRecords []kvStoreRecord) {

		var (
			ruleIDs    = make(map[string]int64)
			groupIDs   = make(map[string]int64)
			featureIDs = make(map[string]int64)
			err        error
		)

		getRuleID := func(ruleName string) int64 {
			ruleID, ok := ruleIDs[ruleName]
			if !ok {
				ruleID, err = sqlStore.GetRuleID(
					ctx, ruleName,
				)
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

		// First we extract all migrated kv records from the SQLDB,
		// in order to be able to compare them to the original kv
		// records, to ensure that the migration was successful.
		sqlKvRecords, err := sqlStore.ListAllKVStoresRecords(ctx)
		require.NoError(t, err)
		require.Equal(t, len(kvRecords), len(sqlKvRecords))

		for _, kvRecord := range kvRecords {
			ruleID := getRuleID(kvRecord.RuleName)

			if kvRecord.Global {
				sqlVal, err := sqlStore.GetGlobalKVStoreRecord(
					ctx,
					sqlc.GetGlobalKVStoreRecordParams{
						Key:    kvRecord.EntryKey,
						Perm:   kvRecord.Perm,
						RuleID: ruleID,
					},
				)
				require.NoError(t, err)
				require.Equal(t, kvRecord.Value, sqlVal)
			} else if kvRecord.FeatureName.IsNone() {
				groupID := getGroupID(kvRecord.GroupID[:])

				sqlVal, err := sqlStore.GetSessionKVStoreRecord(
					ctx,
					sqlc.GetSessionKVStoreRecordParams{
						Key:    kvRecord.EntryKey,
						Perm:   kvRecord.Perm,
						RuleID: ruleID,
						SessionID: sql.NullInt64{
							Int64: groupID,
							Valid: true,
						},
					},
				)
				require.NoError(t, err)
				require.Equal(t, kvRecord.Value, sqlVal)
			} else {
				groupID := getGroupID(kvRecord.GroupID[:])
				featureID := getFeatureID(
					kvRecord.FeatureName.UnwrapOrFail(t),
				)

				sqlVal, err := sqlStore.GetFeatureKVStoreRecord(
					ctx,
					sqlc.GetFeatureKVStoreRecordParams{
						Key:    kvRecord.EntryKey,
						Perm:   kvRecord.Perm,
						RuleID: ruleID,
						SessionID: sql.NullInt64{
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
				require.Equal(t, kvRecord.Value, sqlVal)
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
			boltDB *BoltDB,
			sessionStore session.Store) []kvStoreRecord
	}{
		{
			name: "empty",
			populateDB: func(t *testing.T, ctx context.Context,
				boltDB *BoltDB,
				sessionStore session.Store) []kvStoreRecord {

				// Don't populate the DB.
				return make([]kvStoreRecord, 0)
			},
		},
		{
			name:       "global records",
			populateDB: globalRecords,
		},
		{
			name:       "session specific records",
			populateDB: sessionSpecificRecords,
		},
		{
			name:       "feature specific records",
			populateDB: featureSpecificRecords,
		},
		{
			name:       "records at all levels",
			populateDB: recordsAtAllLevels,
		},
		{
			name:       "random records",
			populateDB: randomKVRecords,
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
			records := test.populateDB(
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
			assertMigrationResults(t, sqlStore, records)
		})
	}
}

// globalRecords populates the kv store with one global record for the temp
// store, and one for the perm store.
func globalRecords(t *testing.T, ctx context.Context,
	boltDB *BoltDB, sessionStore session.Store) []kvStoreRecord {

	return insertTestKVRecords(
		t, ctx, boltDB, sessionStore, true, fn.None[string](),
	)
}

// sessionSpecificRecords populates the kv store with one session specific
// record for the local temp store, and one session specific record for the perm
// local store.
func sessionSpecificRecords(t *testing.T, ctx context.Context,
	boltDB *BoltDB, sessionStore session.Store) []kvStoreRecord {

	return insertTestKVRecords(
		t, ctx, boltDB, sessionStore, false, fn.None[string](),
	)
}

// featureSpecificRecords populates the kv store with one feature specific
// record for the local temp store, and one feature specific record for the perm
// local store.
func featureSpecificRecords(t *testing.T, ctx context.Context,
	boltDB *BoltDB, sessionStore session.Store) []kvStoreRecord {

	return insertTestKVRecords(
		t, ctx, boltDB, sessionStore, false, fn.Some("test-feature"),
	)
}

// recordsAtAllLevels uses adds a record at all possible levels of the kvstores,
// by utilizing all the other helper functions that populates the kvstores at
// different levels.
func recordsAtAllLevels(t *testing.T, ctx context.Context,
	boltDB *BoltDB, sessionStore session.Store) []kvStoreRecord {

	gRecords := globalRecords(t, ctx, boltDB, sessionStore)
	sRecords := sessionSpecificRecords(t, ctx, boltDB, sessionStore)
	fRecords := featureSpecificRecords(t, ctx, boltDB, sessionStore)

	return append(gRecords, append(sRecords, fRecords...)...)
}

// insertTestKVRecords populates the kv store with one record for the local temp
// store, and one record for the local store. The records will be feature
// specific if the featureNameOpt is set, otherwise they will be session
// specific. Both of the records will be inserted with the same
// session.GroupID, which is created in this function, as well as the same
// ruleName, entryKey and entryVal.
func insertTestKVRecords(t *testing.T, ctx context.Context,
	boltDB *BoltDB, sessionStore session.Store, global bool,
	featureNameOpt fn.Option[string]) []kvStoreRecord {

	var (
		ruleName = "test-rule"
		entryKey = "test1"
		entryVal = []byte{1, 2, 3}
	)

	// Create a session that we can reference.
	sess, err := sessionStore.NewSession(
		ctx, "test", session.TypeAutopilot,
		time.Unix(1000, 0), "something",
	)
	require.NoError(t, err)

	tempKvRecord := kvStoreRecord{
		RuleName:    ruleName,
		GroupID:     &sess.GroupID,
		FeatureName: featureNameOpt,
		EntryKey:    entryKey,
		Value:       entryVal,
		Perm:        false,
		Global:      global,
	}

	insertKvRecord(t, ctx, boltDB, tempKvRecord)

	permKvRecord := kvStoreRecord{
		RuleName:    ruleName,
		GroupID:     &sess.GroupID,
		FeatureName: featureNameOpt,
		EntryKey:    entryKey,
		Value:       entryVal,
		Perm:        true,
		Global:      global,
	}

	insertKvRecord(t, ctx, boltDB, permKvRecord)

	return []kvStoreRecord{tempKvRecord, permKvRecord}
}

// insertTestKVRecords populates the kv store with passed record, and asserts
// that the record is inserted correctly.
func insertKvRecord(t *testing.T, ctx context.Context,
	boltDB *BoltDB, record kvStoreRecord) {

	if record.Global && record.FeatureName.IsSome() {
		t.Fatalf("cannot set both global and feature specific at the " +
			"same time")
	}

	kvStores := boltDB.GetKVStores(
		record.RuleName, *record.GroupID,
		record.FeatureName.UnwrapOr(""),
	)

	err := kvStores.Update(ctx, func(ctx context.Context,
		tx KVStoreTx) error {

		switch {
		case record.Global && !record.Perm:
			return tx.GlobalTemp().Set(
				ctx, record.EntryKey, record.Value,
			)
		case record.Global && record.Perm:
			return tx.Global().Set(
				ctx, record.EntryKey, record.Value,
			)
		case !record.Global && !record.Perm:
			return tx.LocalTemp().Set(
				ctx, record.EntryKey, record.Value,
			)
		case !record.Global && record.Perm:
			return tx.Local().Set(
				ctx, record.EntryKey, record.Value,
			)
		default:
			return fmt.Errorf("unexpected global/perm "+
				"combination: global=%v, perm=%v",
				record.Global, record.Perm)
		}
	})
	require.NoError(t, err)
}

// randomKVRecords populates the kv store with random kv records that span
// across all possible combinations of different levels of records in the kv
// store. All values and different bucket names are randomly generated.
func randomKVRecords(t *testing.T, ctx context.Context,
	boltDB *BoltDB, sessionStore session.Store) []kvStoreRecord {

	var (
		// We set the number of records to insert to 1000, as that
		// should be enough to cover as many different
		// combinations of records as possible, while still being
		// fast enough to run in a reasonable time.
		numberOfRecords = 1000
		insertedRecords = make([]kvStoreRecord, 0)
		ruleName        = "initial-rule"
		groupId         *session.ID
		featureName     = "initial-feature"
	)

	// Create a random session that we can reference for the initial group
	// ID.
	sess, err := sessionStore.NewSession(
		ctx, "initial-session", session.Type(uint8(rand.Intn(5))),
		time.Unix(1000, 0), randomString(rand.Intn(10)+1),
	)
	require.NoError(t, err)

	groupId = &sess.GroupID

	// Generate random records. Note that many records will use the same
	// rule name, group ID and feature name, to simulate the real world
	// usage of the kv stores as much as possible.
	for i := 0; i < numberOfRecords; i++ {
		// On average, we will generate a new rule which will be used
		// for the kv store record 10% of the time.
		if rand.Intn(10) == 0 {
			ruleName = fmt.Sprintf(
				"rule-%s-%d", randomString(rand.Intn(30)+1), i,
			)
		}

		// On average, we use the global store 25% of the time.
		global := rand.Intn(4) == 0

		// We'll use the perm store 50% of the time.
		perm := rand.Intn(2) == 0

		// For the non-global records, we will generate a new group ID
		// 25% of the time.
		if !global && rand.Intn(4) == 0 {
			newSess, err := sessionStore.NewSession(
				ctx, fmt.Sprintf("session-%d", i),
				session.Type(uint8(rand.Intn(5))),
				time.Unix(1000, 0),
				randomString(rand.Intn(10)+1),
			)
			require.NoError(t, err)

			groupId = &newSess.GroupID
		}

		featureNameOpt := fn.None[string]()

		// For 50% of the non-global records, we insert a feature
		// specific record. The other 50% will be session specific
		// records.
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

		kvEntry := kvStoreRecord{
			RuleName:    ruleName,
			GroupID:     groupId,
			FeatureName: featureNameOpt,
			EntryKey:    fmt.Sprintf("key-%d", i),
			Perm:        perm,
			Global:      global,
			// We'll generate a random value for all records,
			Value: []byte(randomString(rand.Intn(100) + 1)),
		}

		// Insert the record into the kv store.
		insertKvRecord(t, ctx, boltDB, kvEntry)

		// Add the record to the list of inserted records.
		insertedRecords = append(insertedRecords, kvEntry)
	}

	return insertedRecords
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
