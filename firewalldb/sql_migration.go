package firewalldb

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/binary"
	"errors"
	"fmt"
	"reflect"
	"sort"
	"time"

	"github.com/davecgh/go-spew/spew"
	"github.com/lightninglabs/lightning-terminal/accounts"
	"github.com/lightninglabs/lightning-terminal/db/sqlc"
	"github.com/lightninglabs/lightning-terminal/session"
	"github.com/lightningnetwork/lnd/fn"
	"github.com/lightningnetwork/lnd/sqldb"
	"github.com/pmezard/go-difflib/difflib"
	"go.etcd.io/bbolt"
)

// kvEntry represents a single KV entry inserted into the BoltDB.
type kvEntry struct {
	perm     bool
	ruleName string
	key      string
	value    []byte

	// groupAlias is the legacy session group alias that the entry is
	// associated with. For global entries, this will be fn.None[[]byte].
	groupAlias fn.Option[[]byte]

	// featureName is the name of the feature that the entry is associated
	// with. If the entry is not feature specific, this will be
	// fn.None[string].
	featureName fn.Option[string]
}

// sqlKvEntry represents a single KV entry inserted into the SQL DB, containing
// the same fields as the kvEntry, but with additional fields that represent the
// SQL IDs of the rule, session group, and feature.
type sqlKvEntry struct {
	*kvEntry

	ruleID int64

	// groupID is the sql session group ID that the entry is associated
	// with. For global entries, this will be Valid=false.
	groupID sql.NullInt64

	// featureID is the sql feature ID that the entry is associated with.
	// This is only set if the entry is feature specific, and will be
	// Valid=false for other types entries. If this is set, then groupID
	// will also be set.
	featureID sql.NullInt64
}

// namespacedKey returns a string representation of the kvEntry purely used for
// logging purposes.
func (e *kvEntry) namespacedKey() string {
	ns := fmt.Sprintf("perm: %t, rule: %s", e.perm, e.ruleName)

	e.groupAlias.WhenSome(func(alias []byte) {
		ns += fmt.Sprintf(", group: %s", alias)
	})

	e.featureName.WhenSome(func(feature string) {
		ns += fmt.Sprintf(", feature: %s", feature)
	})

	ns += fmt.Sprintf(", key: %s", e.key)

	return ns
}

// privacyPairs is a type alias for a map that holds the privacy pairs, where
// the outer key is the group ID, and the value is a map of real to pseudo
// values.
type privacyPairs = map[int64]map[string]string

// MigrateFirewallDBToSQL runs the migration of the firwalldb stores from the
// bbolt database to a SQL database. The migration is done in a single
// transaction to ensure that all rows in the stores are migrated or none at
// all.
//
// NOTE: As sessions may contain linked sessions and accounts, the sessions and
// accounts sql migration MUST be run prior to this migration.
func MigrateFirewallDBToSQL(ctx context.Context, kvStore *bbolt.DB,
	sqlTx SQLQueries, sessionDB session.SQLQueries,
	accountDB accounts.SQLQueries, macRootKeyIDs [][]byte) error {

	log.Infof("Starting migration of the rules DB to SQL")

	sessions, err := sessionDB.ListSessions(ctx)
	if err != nil {
		return fmt.Errorf("listing sessions failed: %w", err)
	}

	sessionMap, err := mapSessions(sessions)
	if err != nil {
		return fmt.Errorf("mapping sessions failed: %w", err)
	}

	err = migrateKVStoresDBToSQL(ctx, kvStore, sqlTx, sessionMap)
	if err != nil {
		return err
	}

	err = migratePrivacyMapperDBToSQL(ctx, kvStore, sqlTx, sessionMap)
	if err != nil {
		return err
	}

	err = migrateActionsToSQL(
		ctx, kvStore, sqlTx, sessionDB, accountDB, macRootKeyIDs,
		sessionMap,
	)
	if err != nil {
		return err
	}

	log.Infof("The rules DB has been migrated from KV to SQL.")

	return nil
}

// migrateKVStoresDBToSQL runs the migration of all KV stores from the KV
// database to the SQL database. The function also asserts that the
// migrated values match the original values in the KV store.
func migrateKVStoresDBToSQL(ctx context.Context, kvStore *bbolt.DB,
	sqlTx SQLQueries, sessMap map[[4]byte]sqlc.Session) error {

	log.Infof("Starting migration of the KV stores to SQL")

	var pairs []*kvEntry

	// 1) Collect all key-value pairs from the KV store.
	err := kvStore.View(func(tx *bbolt.Tx) error {
		var err error
		pairs, err = collectAllPairs(sessMap, tx)
		return err
	})
	if err != nil {
		return fmt.Errorf("collecting all kv pairs failed: %w", err)
	}

	var insertedPairs []*sqlKvEntry

	// 2) Insert all collected key-value pairs into the SQL database.
	for _, entry := range pairs {
		insertedPair, err := insertPair(ctx, sqlTx, sessMap, entry)
		if err != nil {
			return fmt.Errorf("inserting kv pair %v failed: %w",
				entry.key, err)
		}

		insertedPairs = append(insertedPairs, insertedPair)
	}

	// 3) Validate the migrated values against the original values.
	for _, insertedPair := range insertedPairs {
		// Fetch the appropriate SQL entry's value.
		migratedValue, err := getSQLValue(ctx, sqlTx, insertedPair)
		if err != nil {
			return fmt.Errorf("getting SQL value for key %s "+
				"failed: %w", insertedPair.namespacedKey(), err)
		}

		// Compare the value of the migrated entry with the original
		// value from the KV store.
		// NOTE: if the insert a []byte{} value into the sqldb as the
		// entry value, and then retrieve it, the value will be
		// returned as nil. The bytes.Equal will pass in that case,
		// and therefore such cases won't error out. The kvdb instance
		// can store []byte{} values.
		if !bytes.Equal(migratedValue, insertedPair.value) {
			return fmt.Errorf("migrated value for key %s "+
				"does not match original value: "+
				"migrated %x, original %x",
				insertedPair.namespacedKey(), migratedValue,
				insertedPair.value)
		}
	}

	log.Infof("Migration of the KV stores to SQL completed. Total number "+
		"of rows migrated: %d", len(pairs))

	return nil
}

// collectAllPairs collects all key-value pairs from the KV store, and returns
// them as a slice of kvEntry structs. The function expects the KV store to be
// stuctured as described in the comment in the firewalldb/kvstores_kvdb.go
// file. Any other structure will result in an error.
// Note that this function and the subsequent functions are intentionally
// designed to iterate over all buckets and values that exist in the KV store.
// That ensures that we find all stores and values that exist in the KV store,
// and can be sure that the kv store actually follows the expected structure.
func collectAllPairs(sessMap map[[4]byte]sqlc.Session,
	tx *bbolt.Tx) ([]*kvEntry, error) {

	var entries []*kvEntry
	for _, perm := range []bool{true, false} {
		mainBucket, err := getMainBucket(tx, false, perm)
		if err != nil {
			return nil, err
		}

		if mainBucket == nil {
			// If the mainBucket doesn't exist, there are no entries
			// to migrate under that bucket, therefore we don't
			// error, and just proceed to not migrate any entries
			// under that bucket.
			continue
		}

		// Loop over each rule-name bucket.
		err = mainBucket.ForEach(func(rule, v []byte) error {
			if v != nil {
				return errors.New("expected only " +
					"buckets under main bucket")
			}

			ruleBucket := mainBucket.Bucket(rule)
			if ruleBucket == nil {
				return fmt.Errorf("rule bucket %s not found",
					rule)
			}

			pairs, err := collectRulePairs(
				sessMap, ruleBucket, perm, string(rule),
			)
			if err != nil {
				return err
			}

			entries = append(entries, pairs...)

			return nil
		})
		if err != nil {
			return nil, err
		}
	}

	return entries, nil
}

// collectRulePairs processes a single rule bucket, which should contain the
// global and session-kv-store key buckets.
func collectRulePairs(sessMap map[[4]byte]sqlc.Session, bkt *bbolt.Bucket,
	perm bool, rule string) ([]*kvEntry, error) {

	var params []*kvEntry

	err := verifyBktKeys(
		bkt, true, globalKVStoreBucketKey, sessKVStoreBucketKey,
	)
	if err != nil {
		return params, fmt.Errorf("verifying rule bucket %s keys "+
			"failed: %w", rule, err)
	}

	if globalBkt := bkt.Bucket(globalKVStoreBucketKey); globalBkt != nil {
		p, err := collectKVPairs(
			globalBkt, true, perm, rule,
			fn.None[[]byte](), fn.None[string](),
		)
		if err != nil {
			return nil, fmt.Errorf("collecting global kv pairs "+
				"failed: %w", err)
		}

		params = append(params, p...)
	}

	if sessBkt := bkt.Bucket(sessKVStoreBucketKey); sessBkt != nil {
		err := sessBkt.ForEach(func(groupAlias, v []byte) error {
			if v != nil {
				return fmt.Errorf("expected only buckets "+
					"under %s bucket", sessKVStoreBucketKey)
			}

			var alias [4]byte
			copy(alias[:], groupAlias)
			if _, ok := sessMap[alias]; !ok {
				// If we can't find the session group in the
				// SQL db, that indicates that the session was
				// never migrated from KVDB. This likely means
				// that the user deleted their session.db file,
				// but kept the rules.db file. As the KV entries
				// are useless when the session no longer
				// exists, we can just skip the migration of the
				// KV entries for this group.
				log.Warnf("Skipping migration of KV store "+
					"entries for session group %x, as the "+
					"session group was not found",
					groupAlias)

				return nil
			}

			groupBucket := sessBkt.Bucket(groupAlias)
			if groupBucket == nil {
				return fmt.Errorf("group bucket for group "+
					"alias %s not found", groupAlias)
			}

			kvPairs, err := collectKVPairs(
				groupBucket, false, perm, rule,
				fn.Some(groupAlias), fn.None[string](),
			)
			if err != nil {
				return fmt.Errorf("collecting group kv "+
					"pairs failed: %w", err)
			}

			params = append(params, kvPairs...)

			err = verifyBktKeys(
				groupBucket, false, featureKVStoreBucketKey,
			)
			if err != nil {
				return fmt.Errorf("verification of group "+
					"bucket %s keys failed: %w", groupAlias,
					err)
			}

			ftBkt := groupBucket.Bucket(featureKVStoreBucketKey)
			if ftBkt == nil {
				return nil
			}

			return ftBkt.ForEach(func(ftName, v []byte) error {
				if v != nil {
					return fmt.Errorf("expected only "+
						"buckets under %s bucket",
						featureKVStoreBucketKey)
				}

				// The feature name should exist, as per the
				// verification above.
				featureBucket := ftBkt.Bucket(ftName)
				if featureBucket == nil {
					return fmt.Errorf("feature bucket "+
						"%s not found", ftName)
				}

				featurePairs, err := collectKVPairs(
					featureBucket, true, perm, rule,
					fn.Some(groupAlias),
					fn.Some(string(ftName)),
				)
				if err != nil {
					return fmt.Errorf("collecting "+
						"feature kv pairs failed: %w",
						err)
				}

				params = append(params, featurePairs...)

				return nil
			})
		})
		if err != nil {
			return nil, fmt.Errorf("collecting session kv pairs "+
				"failed: %w", err)
		}
	}

	return params, nil
}

// collectKVPairs collects all key-value pairs from the given bucket, and
// returns them as a slice of kvEntry structs. If the errorOnBuckets parameter
// is set to true, then the function will return an error if the bucket
// contains any sub-buckets. Note that when the errorOnBuckets parameter is
// set to false, the function will not collect any key-value pairs from the
// sub-buckets, and will just ignore them.
func collectKVPairs(bkt *bbolt.Bucket, errorOnBuckets, perm bool,
	ruleName string, groupAlias fn.Option[[]byte],
	featureName fn.Option[string]) ([]*kvEntry, error) {

	var params []*kvEntry

	return params, bkt.ForEach(func(key, value []byte) error {
		// If the value is nil, then this is a bucket, which we
		// don't want to process here, as we only want to collect
		// the key-value pairs, not the buckets. If we should
		// error on buckets, then we return an error here.
		if value == nil {
			if errorOnBuckets {
				return fmt.Errorf("unexpected bucket %s found "+
					"in when collecting kv pairs", key)
			}

			return nil
		}

		params = append(params, &kvEntry{
			perm:        perm,
			ruleName:    ruleName,
			key:         string(key),
			featureName: featureName,
			groupAlias:  groupAlias,
			value:       value,
		})

		return nil
	})
}

// insertPair inserts a single key-value pair into the SQL database.
func insertPair(ctx context.Context, tx SQLQueries,
	sessMap map[[4]byte]sqlc.Session, entry *kvEntry) (*sqlKvEntry, error) {

	ruleID, err := tx.GetOrInsertRuleID(ctx, entry.ruleName)
	if err != nil {
		return nil, err
	}

	p := sqlc.InsertKVStoreRecordParams{
		Perm:     entry.perm,
		RuleID:   ruleID,
		EntryKey: entry.key,
		Value:    entry.value,
	}

	entry.groupAlias.WhenSome(func(alias []byte) {
		var groupAlias [4]byte
		copy(groupAlias[:], alias)

		sess, ok := sessMap[groupAlias]
		if !ok {
			// This should be unreachable, as we check for the
			// existence of the session group when collecting
			// the kv pairs.
			err = fmt.Errorf("session group %x not found in map",
				alias)
		}

		p.GroupID = sess.GroupID
	})
	if err != nil {
		return nil, err
	}

	entry.featureName.WhenSome(func(feature string) {
		var featureID int64
		featureID, err = tx.GetOrInsertFeatureID(ctx, feature)
		if err != nil {
			err = fmt.Errorf("getting/inserting feature id for %s "+
				"failed: %w", feature, err)
			return
		}

		p.FeatureID = sqldb.SQLInt64(featureID)
	})
	if err != nil {
		return nil, err
	}

	err = tx.InsertKVStoreRecord(ctx, p)
	if err != nil {
		return nil, err
	}

	return &sqlKvEntry{
		kvEntry:   entry,
		ruleID:    p.RuleID,
		groupID:   p.GroupID,
		featureID: p.FeatureID,
	}, nil
}

// getSQLValue retrieves the key value for the given kvEntry from the SQL
// database.
func getSQLValue(ctx context.Context, tx SQLQueries,
	entry *sqlKvEntry) ([]byte, error) {

	switch {
	case entry.featureID.Valid && entry.groupID.Valid:
		return tx.GetFeatureKVStoreRecord(
			ctx, sqlc.GetFeatureKVStoreRecordParams{
				Perm:      entry.perm,
				RuleID:    entry.ruleID,
				GroupID:   entry.groupID,
				FeatureID: entry.featureID,
				Key:       entry.key,
			},
		)
	case entry.groupID.Valid:
		return tx.GetGroupKVStoreRecord(
			ctx, sqlc.GetGroupKVStoreRecordParams{
				Perm:    entry.perm,
				RuleID:  entry.ruleID,
				GroupID: entry.groupID,
				Key:     entry.key,
			},
		)
	case !entry.featureID.Valid && !entry.groupID.Valid:
		return tx.GetGlobalKVStoreRecord(
			ctx, sqlc.GetGlobalKVStoreRecordParams{
				Perm:   entry.perm,
				RuleID: entry.ruleID,
				Key:    entry.key,
			},
		)
	default:
		return nil, fmt.Errorf("invalid combination of feature and "+
			"session ID: featureID valid: %v, groupID valid: %v",
			entry.featureID.Valid, entry.groupID.Valid)
	}
}

// verifyBktKeys checks that the given bucket only contains buckets with the
// passed keys, and optionally also key-value pairs. If the errorOnKeyValues
// parameter is set to true, the function will error if it finds key-value pairs
// in the bucket.
func verifyBktKeys(bkt *bbolt.Bucket, errorOnKeyValues bool,
	keys ...[]byte) error {

	return bkt.ForEach(func(key, v []byte) error {
		if v != nil {
			// If we allow key-values, then we can just continue
			// to the next key. Else we need to error out, as we
			// only expect buckets under the passed bucket.
			if errorOnKeyValues {
				return fmt.Errorf("unexpected key-value pair "+
					"found: key=%s, value=%x", key, v)
			}

			return nil
		}

		for _, expectedKey := range keys {
			if bytes.Equal(key, expectedKey) {
				// If this is an expected key, we can continue
				// to the next key.
				return nil
			}
		}

		return fmt.Errorf("unexpected key found: %s", key)
	})
}

// migratePrivacyMapperDBToSQL runs the migration of the privacy mapper store
// from the KV database to the SQL database. The function also asserts that the
// migrated values match the original values in the privacy mapper store.
func migratePrivacyMapperDBToSQL(ctx context.Context, kvStore *bbolt.DB,
	sqlTx SQLQueries, sessMap map[[4]byte]sqlc.Session) error {

	log.Infof("Starting migration of the privacy mapper store to SQL")

	// 1) Collect all privacy pairs from the KV store.
	privPairs, err := collectPrivacyPairs(kvStore, sessMap)
	if err != nil {
		return fmt.Errorf("error migrating privacy mapper store: %w",
			err)
	}

	// 2) Insert all collected privacy pairs into the SQL database.
	err = insertPrivacyPairs(ctx, sqlTx, privPairs)
	if err != nil {
		return fmt.Errorf("insertion of privacy pairs failed: %w", err)
	}

	// 3) Validate that all inserted privacy pairs match the original values
	// in the KV store. Note that this is done after all values have been
	// inserted, to ensure that the migration doesn't overwrite any values
	// after they were inserted.
	err = validatePrivacyPairsMigration(ctx, sqlTx, privPairs)
	if err != nil {
		return fmt.Errorf("migration validation of privacy pairs "+
			"failed: %w", err)
	}

	log.Infof("Migration of the privacy mapper stores to SQL completed. "+
		"Total number of rows migrated: %d", len(privPairs))

	return nil
}

// collectPrivacyPairs collects all privacy pairs from the KV store.
func collectPrivacyPairs(kvStore *bbolt.DB,
	sessMap map[[4]byte]sqlc.Session) (privacyPairs, error) {

	groupPairs := make(privacyPairs)

	return groupPairs, kvStore.View(func(kvTx *bbolt.Tx) error {
		bkt := kvTx.Bucket(privacyBucketKey)
		if bkt == nil {
			// If we haven't generated any privacy bucket yet,
			// we can skip the migration, as there are no privacy
			// pairs to migrate.
			return nil
		}

		return bkt.ForEach(func(groupId, v []byte) error {
			if v != nil {
				return fmt.Errorf("expected only buckets "+
					"under %s bkt, but found value %s",
					privacyBucketKey, v)
			}

			gBkt := bkt.Bucket(groupId)
			if gBkt == nil {
				return fmt.Errorf("group bkt for group id "+
					"%s not found", groupId)
			}

			var groupAlias [4]byte
			copy(groupAlias[:], groupId)

			sess, ok := sessMap[groupAlias]
			if !ok {
				// If we can't find the session group in the SQL
				// db, that indicates that the session was never
				// migrated from KVDB. This likely means that
				// the user deleted their session.db file, but
				// kept the rules.db file. As the privacy pairs
				// are useless when the session no longer
				// exists, we can just skip the migration of the
				// privacy pairs for this group.
				log.Warnf("Skipping migration of privacy "+
					"pairs for session group %x, as the "+
					"session group was not found", groupId)

				return nil
			}

			if !sess.GroupID.Valid {
				return fmt.Errorf("session group id for "+
					"session %d is not set ", sess.ID)
			}

			groupRealToPseudoPairs, err := collectGroupPairs(gBkt)
			if err != nil {
				return fmt.Errorf("processing group bkt "+
					"for group id %s (sqlID %d) failed: %w",
					groupId, sess.GroupID.Int64, err)
			}

			groupPairs[sess.GroupID.Int64] = groupRealToPseudoPairs

			return nil
		})
	})
}

// collectGroupPairs collects all privacy pairs for a specific session group,
// i.e. the group buckets under the privacy mapper bucket in the KV store.
// The function returns them as a map, where the key is the real value, and
// the value for the key is the pseudo values.
// It also checks that the pairs are consistent, i.e. that for each real value
// there is a corresponding pseudo value, and vice versa. If the pairs are
// inconsistent, it returns an error indicating the mismatch.
func collectGroupPairs(bkt *bbolt.Bucket) (map[string]string, error) {
	var (
		realToPseudoRes map[string]string
		pseudoToRealRes map[string]string
		err             error
	)

	if realBkt := bkt.Bucket(realToPseudoKey); realBkt != nil {
		realToPseudoRes, err = collectPairs(realBkt)
		if err != nil {
			return nil, fmt.Errorf("fetching real to pseudo pairs "+
				"failed: %w", err)
		}
	} else {
		return nil, fmt.Errorf("%s bucket not found", realToPseudoKey)
	}

	if pseudoBkt := bkt.Bucket(pseudoToRealKey); pseudoBkt != nil {
		pseudoToRealRes, err = collectPairs(pseudoBkt)
		if err != nil {
			return nil, fmt.Errorf("fetching pseudo to real pairs "+
				"failed: %w", err)
		}
	} else {
		return nil, fmt.Errorf("%s bucket not found", pseudoToRealKey)
	}

	if len(realToPseudoRes) != len(pseudoToRealRes) {
		return nil, fmt.Errorf("missmatch between nubmer of pairs in "+
			"%s bucket (pairs found: %d) and %s bucket (pairs "+
			"found: %d)", realToPseudoKey, len(realToPseudoRes),
			pseudoToRealKey, len(pseudoToRealRes))
	}

	for realVal, pseudoVal := range realToPseudoRes {
		if rv, ok := pseudoToRealRes[pseudoVal]; !ok || rv != realVal {
			return nil, fmt.Errorf("the real value %s found in "+
				"the %s bucket doesn't match the value %s "+
				"found in the %s bucket",
				realVal, realToPseudoKey, rv, pseudoToRealKey)
		}
	}

	return realToPseudoRes, nil
}

// collectPairs collects all privacy pairs from a specific realToPseudoKey or
// pseudoToRealKey bucket in the KV store. It returns a map where the key is
// the real value or pseudo value, and the value is the corresponding pseudo
// value or real value, respectively (depending on if the realToPseudo or
// pseudoToReal bucket is passed to the function).
func collectPairs(pairsBucket *bbolt.Bucket) (map[string]string, error) {
	pairsRes := make(map[string]string)

	return pairsRes, pairsBucket.ForEach(func(k, v []byte) error {
		if v == nil {
			return fmt.Errorf("expected only key-values under "+
				"pairs bucket, but found bucket %s", k)
		}

		if len(v) == 0 {
			return fmt.Errorf("empty value stored for privacy "+
				"pairs key %s", k)
		}

		pairsRes[string(k)] = string(v)

		return nil
	})
}

// insertPrivacyPairs inserts the collected privacy pairs into the SQL database.
func insertPrivacyPairs(ctx context.Context, sqlTx SQLQueries,
	pairs privacyPairs) error {

	for groupId, groupPairs := range pairs {
		err := insertGroupPairs(ctx, sqlTx, groupId, groupPairs)
		if err != nil {
			return fmt.Errorf("inserting group pairs for group "+
				"id %d failed: %w", groupId, err)
		}
	}

	return nil
}

// insertGroupPairs inserts the privacy pairs for a specific group into
// the SQL database. It checks for duplicates before inserting, and returns
// an error if a duplicate pair is found. The function takes a map of real
// to pseudo values, where the key is the real value and the value is the
// corresponding pseudo value.
func insertGroupPairs(ctx context.Context, sqlTx SQLQueries, groupID int64,
	pairs map[string]string) error {

	for realVal, pseudoVal := range pairs {
		err := sqlTx.InsertPrivacyPair(
			ctx, sqlc.InsertPrivacyPairParams{
				GroupID:   groupID,
				RealVal:   realVal,
				PseudoVal: pseudoVal,
			},
		)
		if err != nil {
			return fmt.Errorf("inserting privacy pair %s:%s "+
				"failed: %w", realVal, pseudoVal, err)
		}
	}

	return nil
}

// validatePrivacyPairsMigration validates that the migrated privacy pairs
// match the original values in the KV store.
func validatePrivacyPairsMigration(ctx context.Context, sqlTx SQLQueries,
	pairs privacyPairs) error {

	for groupId, groupPairs := range pairs {
		err := validateGroupPairsMigration(
			ctx, sqlTx, groupId, groupPairs,
		)
		if err != nil {
			return fmt.Errorf("migration validation of privacy "+
				"pairs for group %d failed: %w", groupId, err)
		}
	}

	return nil
}

// validateGroupPairsMigration validates that the migrated privacy pairs for
// a specific group match the original values in the KV store. It checks that
// for each real value, the pseudo value in the SQL database matches the
// original pseudo value, and vice versa. If any mismatch is found, it returns
// an error indicating the mismatch.
func validateGroupPairsMigration(ctx context.Context, sqlTx SQLQueries,
	groupID int64, pairs map[string]string) error {

	for realVal, pseudoVal := range pairs {
		resPseudoVal, err := sqlTx.GetPseudoForReal(
			ctx, sqlc.GetPseudoForRealParams{
				GroupID: groupID,
				RealVal: realVal,
			},
		)
		if errors.Is(err, sql.ErrNoRows) {
			return fmt.Errorf("migrated privacy pair %s:%s not "+
				"found for real value", realVal, pseudoVal)
		}
		if err != nil {
			return err
		}

		if resPseudoVal != pseudoVal {
			return fmt.Errorf("pseudo value in db %s, does not "+
				"match original value %s, for real value %s",
				resPseudoVal, pseudoVal, realVal)
		}

		resRealVal, err := sqlTx.GetRealForPseudo(
			ctx, sqlc.GetRealForPseudoParams{
				GroupID:   groupID,
				PseudoVal: pseudoVal,
			},
		)
		if errors.Is(err, sql.ErrNoRows) {
			return fmt.Errorf("migrated privacy pair %s:%s not "+
				"found for pseudo value", realVal, pseudoVal)
		}
		if err != nil {
			return err
		}

		if resRealVal != realVal {
			return fmt.Errorf("real value in db %s, does not "+
				"match original value %s, for pseudo value %s",
				resRealVal, realVal, pseudoVal)
		}
	}

	return nil
}

// migrateActionsToSQL runs the migration of the actions store from the KV
// database to the SQL database. The function also asserts that the migrated
// values match the original values in the actions store.
func migrateActionsToSQL(ctx context.Context, kvStore *bbolt.DB,
	sqlTx SQLQueries, sessionDB session.SQLQueries,
	accountsDB accounts.SQLQueries, macRootKeyIDs [][]byte,
	sessMap map[[4]byte]sqlc.Session) error {

	log.Infof("Starting migration of the actions store to SQL")

	// Start by fetching all accounts and sessions, and map them by their
	// IDs. This will allow us to quickly look up any account(s) and/or
	// session that match a specific action's macaroon identifier.
	accts, err := accountsDB.ListAllAccounts(ctx)
	if err != nil {
		return fmt.Errorf("listing accounts failed: %w", err)
	}

	acctsMap, err := mapAccounts(accts)
	if err != nil {
		return fmt.Errorf("mapping accounts failed: %w", err)
	}

	// Next, as the kvdb actions only have their last 4 bytes set for the
	// MacaroonRootKeyID field, we'll do a best effort attempt fetch the
	// full root key ID (all 8 bytes) from lnd when migrating each action.
	// We do so by mapping the macaroon root key IDs by their 4 byte suffix,
	// to make it easy to look up the full root key ID for each action when
	// we migrate them, as they only have the last 4 bytes set.
	macMap, err := mapMacIds(macRootKeyIDs)
	if err != nil {
		return fmt.Errorf("mapping macaroon root key IDs failed: %w",
			err)
	}

	// Iterate over and migrate all actions in the KVDB. Note that this
	// function migrates each action while iterating over them, instead
	// of first collecting all actions and storing them in memory before
	// migrating them (which is common for other migrations). This is
	// because in comparison to other stores, the actions store may contain
	// a large number of entries.
	err = kvStore.View(func(tx *bbolt.Tx) error {
		actionsBucket := tx.Bucket(actionsBucketKey)
		if actionsBucket == nil {
			return fmt.Errorf("actions bucket not found")
		}

		sessionsBucket := actionsBucket.Bucket(actionsKey)
		if sessionsBucket == nil {
			return fmt.Errorf("actions->sessions bucket not found")
		}

		// Iterate over session ID buckets (i.e. what we should name
		// macaroon IDs).
		return sessionsBucket.ForEach(func(macID []byte, v []byte) error {
			if v != nil {
				return fmt.Errorf("expected only sub-buckets " +
					"in sessions bucket")
			}

			sessBucket := sessionsBucket.Bucket(macID)
			if sessBucket == nil {
				return fmt.Errorf("session bucket for %x not "+
					"found", macID)
			}

			// fetch the full macaroon root key ID based on the
			// macaroon identifier for the action (the last 4 bytes
			// of the root key ID).
			var macIDArr [4]byte
			copy(macIDArr[:], macID)

			macRootKeyID, ok := macMap[macIDArr]
			if !ok {
				// If we don't have a mapping for this macaroon
				// ID, this could mean that the user has deleted
				// the lnd macaroon db, but not the litd
				// firewalldb.
				// As there is no way to recover the full
				// macaroonRootKeyID at this point, we set the
				// first 4 bytes to zeroes, similar to how the
				// action is already persisted for kvdb
				// backends.
				log.Warnf("No macaroon root key ID found for "+
					"macaroon ID %x, using zeroes for "+
					"the first 4 bytes", macID)

				macRootKeyID = make([]byte, 8)
				copy(macRootKeyID[4:], macIDArr[:])
			}

			// Iterate over the actions inside each session/macaroon
			// ID.
			return sessBucket.ForEach(func(actionID,
				actionBytes []byte) error {

				if actionBytes == nil {
					return fmt.Errorf("unexpected nested "+
						"bucket under session %x",
						macID)
				}

				sessionID, err := session.IDFromBytes(macID)
				if err != nil {
					// This should be unreachable, as the
					// macID should always be 4 bytes long.
					return fmt.Errorf("invalid session ID "+
						"format %x: %v", macID, err)
				}

				action, err := DeserializeAction(
					bytes.NewReader(actionBytes), sessionID,
				)
				if err != nil {
					return fmt.Errorf("unable to "+
						"deserialize action in "+
						"session %x: %w", macID, err)
				}

				log.Infof("Migrated Action: Macaroon ID: %x, "+
					"ActionID: %x, Actor: %s, Feature: %s",
					macID, actionID, action.ActorName,
					action.FeatureName)

				// Now proceed to migrate the action, and also
				// validate that the action was correctly
				// migrated.
				err = migrateActionToSQL(
					ctx, sqlTx, sessionDB, accountsDB,
					acctsMap, sessMap, action, macRootKeyID,
				)
				if err != nil {
					return fmt.Errorf("migrating action "+
						"to SQL failed: %w", err)
				}

				return nil
			})
		})
	})
	if err != nil {
		return fmt.Errorf("iterating over actions failed: %w", err)
	}

	log.Infof("Finished iterating actions in KV store (no persistence yet).")

	return nil
}

// migrateActionToSQL migrates a single action to the SQL database, and
// validates that the action was correctly migrated.
func migrateActionToSQL(ctx context.Context, sqlTx SQLQueries,
	sessionDB session.SQLQueries, accountsDB accounts.SQLQueries,
	acctsMap map[[4]byte][]sqlc.Account, sessMap map[[4]byte]sqlc.Session,
	action *Action, macRootKeyID []byte) error {

	var (
		macIDSuffix  [4]byte
		err          error
		insertParams sqlc.InsertActionParams
	)

	// Extract the last 4 bytes of the macaroon root key ID suffix, to find
	// any potential linked account(s) and/or session for the action.
	// Note that the macRootKeyID is guaranteed to be 8 bytes long.
	copy(macIDSuffix[:], macRootKeyID[len(macRootKeyID)-4:])

	actAccounts, hasAccounts := acctsMap[macIDSuffix]
	actSession, hasSessions := sessMap[macIDSuffix]

	// Based on if we found any potential linked account(s) and/or
	// session, link the action to them in the SQL DB.
	// The logic is as follows:
	// 1) If we only find a potential linked session, the action
	//    is linked to the session.
	// 2) If we only find potential linked account(s), the action
	//    is linked the account with the earliest expiry (where accounts
	//    that do not expire is seen as the earliest).
	// 3) If we find both potential linked account(s) and session,
	//    the session is prioritized, and the action is linked
	//    to the session.
	// 4) If we don't find any potential linked account(s) or session,
	//    the action is not linked to any account or session.
	switch {
	case hasAccounts && hasSessions:
		// Alternative (3) above.
		insertParams, err = paramsFromBothSessionAndAccounts(
			ctx, accountsDB, action, actAccounts, actSession,
			macRootKeyID,
		)
	case hasSessions:
		// Alternative (1) above.
		insertParams, err = paramsFromSession(
			action, actSession, macRootKeyID,
		)
	case hasAccounts:
		// Alternative (2) above.
		insertParams, err = paramsFromAccounts(
			ctx, accountsDB, action, actAccounts, macRootKeyID)
	default:
		// Alternative (4) above.
		insertParams = paramsFromAction(action, macRootKeyID)
	}
	if err != nil {
		return fmt.Errorf("getting insert params failed: %w", err)
	}

	// With the insert params ready, we can now insert the action
	// into the SQL DB.
	migratedActionID, err := sqlTx.InsertAction(ctx, insertParams)
	if err != nil {
		return fmt.Errorf(
			"inserting action into SQL DB failed: %w", err,
		)
	}

	// Finally, validate that the action was correctly migrated.
	return validateMigratedAction(
		ctx, sqlTx, sessionDB, action, insertParams, migratedActionID,
	)
}

// validateMigratedAction validates that the migrated action in the SQL DB
// matches the original action in the KV DB. The function takes the original
// action, the insert params used to insert the action into the SQL DB,
// and the ID of the migrated action in the SQL DB.
func validateMigratedAction(ctx context.Context, sqlTx SQLQueries,
	sessionDB session.SQLQueries, kvAction *Action,
	insertParams sqlc.InsertActionParams, migratedActionID int64) error {

	// First, fetch the action back from the SQL DB.
	migAction, err := getAndMarshalAction(ctx, sqlTx, migratedActionID)
	if err != nil {
		return fmt.Errorf("fetching migrated action with id %d from "+
			"SQL DB failed: %w", migratedActionID, err)
	}

	// Before we compare the two actions, we need to override the
	// time zone in the action.
	overrideActionTimeZone(kvAction)
	overrideActionTimeZone(migAction)

	var (
		overriddenSessID = fn.None[session.ID]()
		overriddenAcctID = fn.None[accounts.AccountID]()
	)

	// As the original KVDB action does not persist session and account
	// references correctly, we need to override them to the expected
	// session and account IDs based on what the inserted SQL action's
	// fields were set to. This is required in order to make the KVDB and
	// SQL actions comparable.
	if insertParams.SessionID.Valid {
		sess, err := sessionDB.GetSessionByID(
			ctx, insertParams.SessionID.Int64,
		)
		if err != nil {
			return fmt.Errorf("unable to get session with id %d: %w",
				insertParams.SessionID.Int64, err)
		}

		overriddenSessID = fn.Some(session.ID(sess.Alias))
	}

	if insertParams.AccountID.Valid {
		acct, err := sessionDB.GetAccount(
			ctx, insertParams.AccountID.Int64,
		)
		if err != nil {
			return fmt.Errorf("unable to get account with id %d: %w",
				insertParams.AccountID.Int64, err)
		}

		acctAlias, err := accounts.AccountIDFromInt64(acct.Alias)
		if err != nil {
			return fmt.Errorf("unable to get convert int64 "+
				"account alias to []byte form: %w", err)
		}

		overriddenAcctID = fn.Some(acctAlias)
	}

	overrideActionSessionAndAccount(
		kvAction, overriddenSessID, overriddenAcctID,
	)

	// Finally, we need to override the macaroon ID field in the migrated
	// SQL action, as the KVDB action only has the last 4 bytes set, while
	// the SQL action has the full 8 bytes set.
	overrideMacRootKeyID(migAction)

	// Now that we have overridden the fields that are expected to differ
	// between the original KVDB action and the migrated SQL action, we can
	// compare the two actions to ensure that they match.
	if !reflect.DeepEqual(kvAction, migAction) {
		diff := difflib.UnifiedDiff{
			A: difflib.SplitLines(
				spew.Sdump(kvAction),
			),
			B: difflib.SplitLines(
				spew.Sdump(migAction),
			),
			FromFile: "Expected",
			FromDate: "",
			ToFile:   "Actual",
			ToDate:   "",
			Context:  3,
		}
		diffText, _ := difflib.GetUnifiedDiffString(diff)

		return fmt.Errorf("migrated action does not match original "+
			"action: \n%v", diffText)
	}

	return nil
}

// paramsFromBothSessionAndAccounts handles cases where both potential
// account(s) and session responsible for the action exists. In this case,
// we prioritize linking the action to the session. If the potential linked
// session is not a match for the action, we fall back to linking the action
// to the potential linked account with the earliest expiry (where accounts
// that do not expire is seen as the earliest).
func paramsFromBothSessionAndAccounts(ctx context.Context,
	accountsDB accounts.SQLQueries, action *Action, actAccts []sqlc.Account,
	sess sqlc.Session, macRootKeyID []byte) (sqlc.InsertActionParams,
	error) {

	// Check if the potential linked session and account(s) could actually
	// be responsible for the action, or if they should be filtered out.
	sessOpt := getMatchingSessionForAction(action, sess)
	acctOpt, err := getMatchingAccountForAction(
		ctx, accountsDB, action, actAccts,
	)
	if err != nil {
		return sqlc.InsertActionParams{}, err
	}

	switch {
	case acctOpt.IsSome() && sessOpt.IsSome():
		// If we find both a potential linked account and session, we
		// prio linking the session to the action.
		return paramsFromSession(action, sess, macRootKeyID)
	case acctOpt.IsSome():
		// If the session was filtered out, but we still have an
		// account, we link the action to the account.
		return paramsFromAccounts(
			ctx, accountsDB, action, actAccts, macRootKeyID,
		)
	case sessOpt.IsSome():
		return paramsFromSession(action, sess, macRootKeyID)
	default:
		// If no potential linked account or session were found after
		// filtering, we won't link the action to any of them.
		return paramsFromAction(action, macRootKeyID), nil
	}
}

// paramsFromSession returns the insert params for an action linked to a
// session. If the session is not a match for the action, the action will not be
// linked to the session.
func paramsFromSession(action *Action, actSess sqlc.Session,
	macRootKeyID []byte) (sqlc.InsertActionParams, error) {

	sessOpt := getMatchingSessionForAction(action, actSess)

	params := paramsFromAction(action, macRootKeyID)

	sessOpt.WhenSome(func(sess sqlc.Session) {
		params.SessionID = sqldb.SQLInt64(sess.ID)
		params.AccountID = sess.AccountID
	})

	return params, nil
}

// paramsFromAccounts returns the insert params for an action linked to an
// account. If no matching account is found for the action, the action will not
// be linked to any account.
func paramsFromAccounts(ctx context.Context, accountsDB accounts.SQLQueries,
	action *Action, actAccts []sqlc.Account,
	macRootKeyID []byte) (sqlc.InsertActionParams, error) {

	acctOpt, err := getMatchingAccountForAction(
		ctx, accountsDB, action, actAccts,
	)
	if err != nil {
		return sqlc.InsertActionParams{}, err
	}

	params := paramsFromAction(action, macRootKeyID)

	acctOpt.WhenSome(func(acct sqlc.Account) {
		params.AccountID = sqldb.SQLInt64(acct.ID)
	})

	return params, nil
}

// paramsFromAction returns the insert params for an action that is not linked
// to any account or session.
func paramsFromAction(action *Action,
	macRootKeyID []byte) sqlc.InsertActionParams {

	return sqlc.InsertActionParams{
		MacaroonIdentifier: macRootKeyID,
		ActorName:          sqldb.SQLStr(action.ActorName),
		FeatureName:        sqldb.SQLStr(action.FeatureName),
		ActionTrigger:      sqldb.SQLStr(action.Trigger),
		Intent:             sqldb.SQLStr(action.Intent),
		StructuredJsonData: []byte(action.StructuredJsonData),
		RpcMethod:          action.RPCMethod,
		RpcParamsJson:      action.RPCParamsJson,
		CreatedAt:          action.AttemptedAt,
		ActionState:        int16(action.State),
		ErrorReason:        sqldb.SQLStr(action.ErrorReason),
	}
}

// getMatchingSessionForAction checks if the potential linked session
// could actually be responsible for the action, or if it should be filtered
// out.
func getMatchingSessionForAction(action *Action,
	sess sqlc.Session) fn.Option[sqlc.Session] {

	attempted := action.AttemptedAt

	// We filter of the session if the session could not have been
	// responsible for the action, based on the action's attempted
	// timestamp.

	// Exclude the session if it was revoked before the attempted at time.
	if sess.RevokedAt.Valid && sess.RevokedAt.Time.Before(attempted) {
		return fn.None[sqlc.Session]()
	}
	// Exclude the session if it was created after the attempt at time.
	if sess.CreatedAt.After(attempted) {
		return fn.None[sqlc.Session]()
	}
	// Exclude the session if it expired before the attempt at time.
	if sess.Expiry.Before(attempted) {
		return fn.None[sqlc.Session]()
	}

	// If we reach this point, the session is a potential match for
	// the action.
	return fn.Some(sess)
}

// getMatchingAccountForAction checks if any of the potential linked account(s)
// could actually be responsible for the action, or if they should be
// filtered out. If multiple accounts remain after filtering, we pick the one
// with the earliest expiration, but where non expiring accounts are picked
// first. The reason for picking the earliest expiration is motivated with the
// reasoning that such accounts were more likely to have existed at the time of
// the action, as we have no way of tracking when the account was created.
func getMatchingAccountForAction(ctx context.Context,
	accountsDB accounts.SQLQueries, action *Action,
	actAccts []sqlc.Account) (fn.Option[sqlc.Account], error) {

	// sendMethods is the RPC methods that trigger payments to be added an
	// account. We use this to filter out accounts that have no payments
	// when the action is triggered by sending a payment.
	var sendMethods = map[string]struct{}{
		"/lnrpc.Lightning/SendPayment":     {},
		"/lnrpc.Lightning/SendPaymentSync": {},
		"/routerrpc.Router/SendPaymentV2":  {},
		"/lnrpc.Lightning/SendToRoute":     {},
		"/lnrpc.Lightning/SendToRouteSync": {},
		"/routerrpc.Router/SendToRouteV2":  {},
	}

	// We cannot have an ActorName set for an action if the action was
	// triggered by an account.
	if action.ActorName != "" {
		return fn.None[sqlc.Account](), nil
	}

	attempted := action.AttemptedAt

	// 1) Do some initial filtering of the accounts.
	filtered := make([]sqlc.Account, 0, len(actAccts))
	for _, a := range actAccts {
		// Exclude the account if it expired before the attempt at time.
		if !a.Expiration.IsZero() && a.Expiration.Before(attempted) {
			continue
		}

		invoices, err := accountsDB.ListAccountInvoices(ctx, a.ID)
		if err != nil && !errors.Is(err, sql.ErrNoRows) {
			return fn.None[sqlc.Account](), fmt.Errorf("listing "+
				"invoices for account %d failed: %w", a.ID, err)
		}
		payments, err := accountsDB.ListAccountPayments(ctx, a.ID)
		if err != nil && !errors.Is(err, sql.ErrNoRows) {
			return fn.None[sqlc.Account](), fmt.Errorf("listing "+
				"payments for account %d failed: %w", a.ID, err)
		}

		// Exclude the account if the action is triggered by creating
		// an invoice, but the account has no invoices.
		if action.RPCMethod == "/lnrpc.Lightning/AddInvoice" {
			if len(invoices) == 0 {
				continue
			}
		}

		// Exclude the account if the action is triggered by sending
		// a payment, but the account has no payments.
		if _, ok := sendMethods[action.RPCMethod]; ok {
			if len(payments) == 0 {
				continue
			}
		}

		filtered = append(filtered, a)
	}

	// 2) If no accounts remain after filtering, no potential linked account
	//    for the action was found.
	if len(filtered) == 0 {
		return fn.None[sqlc.Account](), nil
	}

	// 3) If multiple accounts remain after filtering, we pick the one with
	//    the earliest expiration, but where non expiring accounts are
	//    picked first.
	if len(filtered) > 1 {
		sort.Slice(filtered, func(i, j int) bool {
			zeroI := filtered[i].Expiration.IsZero()
			zeroJ := filtered[j].Expiration.IsZero()

			// If one is zero and the other is not, zero comes first
			if zeroI && !zeroJ {
				return true
			}
			if zeroJ && !zeroI {
				return false
			}

			// Else, both are zero or both are non-zero. If both are
			// non-zero, we pick the earliest expiration first.
			return filtered[i].Expiration.Before(
				filtered[j].Expiration,
			)
		})
	}

	// 4) Return the first account of the filtered list, which has been
	// ordered if multiple accounts remain.
	return fn.Some(filtered[0]), nil
}

// getAndMarshalAction fetches an action by its ID from the SQL DB, and marshals
// it into the Action struct.
func getAndMarshalAction(ctx context.Context, sqlTx SQLQueries, id int64) (
	*Action, error) {

	// First, fetch the action back from the SQL DB.
	dbAction, err := sqlTx.GetAction(ctx, id)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, errors.New("action not found")
	} else if err != nil {
		return nil, err
	}

	return marshalDBAction(ctx, sqlTx, dbAction)
}

// marshalDBAction marshals a sqlc.Action into the Action struct.
func marshalDBAction(ctx context.Context, sqlTx SQLQueries,
	dbAction sqlc.Action) (*Action, error) {

	var legacySessID fn.Option[session.ID]
	if dbAction.SessionID.Valid {
		legacySessIDB, err := sqlTx.GetAliasBySessionID(
			ctx, dbAction.SessionID.Int64,
		)
		if err != nil {
			return nil, fmt.Errorf("unable to get legacy "+
				"session ID for session ID %d: %w",
				dbAction.SessionID.Int64, err)
		}

		sessID, err := session.IDFromBytes(legacySessIDB)
		if err != nil {
			return nil, err
		}

		legacySessID = fn.Some(sessID)
	}

	var legacyAcctID fn.Option[accounts.AccountID]
	if dbAction.AccountID.Valid {
		acct, err := sqlTx.GetAccount(ctx, dbAction.AccountID.Int64)
		if err != nil {
			return nil, err
		}

		acctID, err := accounts.AccountIDFromInt64(acct.Alias)
		if err != nil {
			return nil, fmt.Errorf("unable to get account ID: %w",
				err)
		}

		legacyAcctID = fn.Some(acctID)
	}

	// Note that we export the full 8 byte macaroon root key ID in the sql
	// actions DB, while the kvdb version persists and exports stored the
	// last 4 bytes only.
	var macRootKeyID fn.Option[uint64]
	if len(dbAction.MacaroonIdentifier) >= 8 {
		macRootKeyID = fn.Some(
			binary.BigEndian.Uint64(dbAction.MacaroonIdentifier),
		)
	}

	return &Action{
		AddActionReq: AddActionReq{
			MacaroonRootKeyID:  macRootKeyID,
			AccountID:          legacyAcctID,
			SessionID:          legacySessID,
			ActorName:          dbAction.ActorName.String,
			FeatureName:        dbAction.FeatureName.String,
			Trigger:            dbAction.ActionTrigger.String,
			Intent:             dbAction.Intent.String,
			StructuredJsonData: string(dbAction.StructuredJsonData),
			RPCMethod:          dbAction.RpcMethod,
			RPCParamsJson:      dbAction.RpcParamsJson,
		},
		AttemptedAt: dbAction.CreatedAt,
		State:       ActionState(dbAction.ActionState),
		ErrorReason: dbAction.ErrorReason.String,
	}, nil
}

// mapMacIds maps the macaroon root key IDs by their 4 byte suffix to make it
// easy to look up the full root key ID for each action based on the macaroon
// identifier (which is the last 4 bytes of the root key ID).
// The function returns a map where the key is the 4 byte suffix, and the
// value is the full root key ID.
func mapMacIds(macRootKeyIDs [][]byte) (map[[4]byte][]byte, error) {
	// Start by converting the macRootKeyIDs to a map that let's us map the
	// macaroon the 4 byte identifiers to the full uint64 RootKeyID.
	macMap := make(map[[4]byte][]byte)

	for _, id := range macRootKeyIDs {
		if len(id) < 4 {
			return nil, fmt.Errorf("expected rootKeyID to be at "+
				"least 4 bytes long, got %d bytes", len(id))
		}

		// Extract the last 4 bytes of the root key ID to use as the
		// key in the map.
		var rootKeyShortID [4]byte
		copy(rootKeyShortID[:], id[len(id)-4:])

		// NOTE: If we already have an entry for this rootKeyShortID,
		// we overwrite it with the new RootKeyID, as we can't determine
		// which one is the correct one.
		macMap[rootKeyShortID] = id
	}

	return macMap, nil
}

// mapAccounts maps the accounts by the 4 byte prefix of their Alias to make
// it easy to look up any potential linked account(s) for each action based
// on the macaroon identifier (which is the last 4 bytes of the root key ID).
// The function returns a map where the key is the 4 byte account prefix, and
// the value is a list of accounts that match that prefix.
func mapAccounts(accts []sqlc.Account) (map[[4]byte][]sqlc.Account, error) {
	acctMap := make(map[[4]byte][]sqlc.Account)

	for _, acct := range accts {
		aliasBytes := make([]byte, 8)

		// Convert the int64 account Alias to bytes (big-endian).
		binary.BigEndian.PutUint64(aliasBytes, uint64(acct.Alias))

		var acctPrefix [4]byte
		copy(acctPrefix[:], aliasBytes[:4])

		if acctList, ok := acctMap[acctPrefix]; ok {
			acctMap[acctPrefix] = append(acctList, acct)
		} else {
			acctMap[acctPrefix] = []sqlc.Account{acct}
		}
	}

	return acctMap, nil
}

// mapSessions maps the sessions by their 4 byte Alias, to make it easy to
// look up any potential linked session for each action based on the macaroon
// identifier (which is the last 4 bytes of the root key ID).
// The function returns a map where the key is the 4 byte Alias, and the
// value is the corresponding session.
func mapSessions(sessions []sqlc.Session) (map[[4]byte]sqlc.Session, error) {
	sessMap := make(map[[4]byte]sqlc.Session)

	for _, sess := range sessions {
		if len(sess.Alias) != 4 {
			return nil, fmt.Errorf("session alias must be 4 "+
				"bytes, got %d bytes", len(sess.Alias))
		}

		var sessAlias [4]byte
		copy(sessAlias[:], sess.Alias[:4])

		if _, ok := sessMap[sessAlias]; ok {
			// NOTE: This should be unreachable, as we shouldn't
			// have multiple sessions with the same Alias, as the
			// sessions store has already been migrated to SQL here,
			// and the session's table has a UNIQUE constraint on
			// the Alias column.
			return nil, fmt.Errorf("shouldn't have multiple "+
				"sessions with the same alias %x", sessAlias)
		} else {
			sessMap[sessAlias] = sess
		}
	}

	return sessMap, nil
}

// overrideActionTimeZone overrides the time zone of the action to the local
// time zone and chops off the nanosecond part for comparison. This is needed
// because KV database stores times as-is which as an unwanted side effect would
// fail migration due to time comparison expecting both the original and
// migrated actions to be in the same local time zone and in microsecond
// precision. Note that PostgresSQL stores times in microsecond precision while
// SQLite can store times in nanosecond precision if using TEXT storage class.
func overrideActionTimeZone(action *Action) {
	fixTime := func(t time.Time) time.Time {
		return t.In(time.Local).Truncate(time.Microsecond)
	}

	if !action.AttemptedAt.IsZero() {
		action.AttemptedAt = fixTime(action.AttemptedAt)
	}
}

// overrideActionSessionAndAccount overrides the session and account IDs of the
// action to the provided values.
func overrideActionSessionAndAccount(action *Action,
	sessID fn.Option[session.ID], acctID fn.Option[accounts.AccountID]) {

	action.SessionID = sessID
	action.AccountID = acctID
}

// overrideMacRootKeyID overrides the MacaroonRootKeyID of the action to only
// contain the last 4 bytes (least significant 32 bits) of the original value.
// The first 4 bytes are set to zeroes.
// This is needed because the KV database only persists the last 4 bytes of the
// root key ID, while the SQL database persists the full 8 bytes.
func overrideMacRootKeyID(action *Action) {
	action.MacaroonRootKeyID.WhenSome(func(macID uint64) {
		// Extract only the last 32 bits (least significant 4 bytes).
		last32 := macID & 0xFFFFFFFF

		action.MacaroonRootKeyID = fn.Some(last32)
	})
}
