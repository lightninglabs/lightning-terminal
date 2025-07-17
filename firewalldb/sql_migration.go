package firewalldb

import (
	"bytes"
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/lightninglabs/lightning-terminal/db/sqlc"
	"github.com/lightningnetwork/lnd/fn"
	"github.com/lightningnetwork/lnd/sqldb"
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

// MigrateFirewallDBToSQL runs the migration of the firwalldb stores from the
// bbolt database to a SQL database. The migration is done in a single
// transaction to ensure that all rows in the stores are migrated or none at
// all.
//
// Note that this migration currently only migrates the kvstores, but will be
// extended in the future to also migrate the privacy mapper and action stores.
//
// NOTE: As sessions may contain linked sessions and accounts, the sessions and
// accounts sql migration MUST be run prior to this migration.
func MigrateFirewallDBToSQL(ctx context.Context, kvStore *bbolt.DB,
	sqlTx SQLQueries) error {

	log.Infof("Starting migration of the rules DB to SQL")

	err := migrateKVStoresDBToSQL(ctx, kvStore, sqlTx)
	if err != nil {
		return err
	}

	log.Infof("The rules DB has been migrated from KV to SQL.")

	// TODO(viktor): Add migration for the privacy mapper and the action
	// stores.

	return nil
}

// migrateKVStoresDBToSQL runs the migration of all KV stores from the KV
// database to the SQL database. The function also asserts that the
// migrated values match the original values in the KV store.
func migrateKVStoresDBToSQL(ctx context.Context, kvStore *bbolt.DB,
	sqlTx SQLQueries) error {

	log.Infof("Starting migration of the KV stores to SQL")

	var pairs []*kvEntry

	// 1) Collect all key-value pairs from the KV store.
	err := kvStore.View(func(tx *bbolt.Tx) error {
		var err error
		pairs, err = collectAllPairs(tx)
		return err
	})
	if err != nil {
		return fmt.Errorf("collecting all kv pairs failed: %w", err)
	}

	var insertedPairs []*sqlKvEntry

	// 2) Insert all collected key-value pairs into the SQL database.
	for _, entry := range pairs {
		insertedPair, err := insertPair(ctx, sqlTx, entry)
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
func collectAllPairs(tx *bbolt.Tx) ([]*kvEntry, error) {
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
				ruleBucket, perm, string(rule),
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
func collectRulePairs(bkt *bbolt.Bucket, perm bool, rule string) ([]*kvEntry,
	error) {

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
	entry *kvEntry) (*sqlKvEntry, error) {

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
		var groupID int64
		groupID, err = tx.GetSessionIDByAlias(ctx, alias)
		if err != nil {
			err = fmt.Errorf("getting group id by alias %x "+
				"failed: %w", alias, err)
			return
		}

		p.GroupID = sqldb.SQLInt64(groupID)
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
