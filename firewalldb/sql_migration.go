package firewalldb

import (
	"bytes"
	"context"
	"database/sql"
	"errors"
	"fmt"
	"github.com/lightninglabs/lightning-terminal/db/sqlc"
	"go.etcd.io/bbolt"
)

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
func MigrateFirewallDBToSQL(ctx context.Context, kvStore *BoltDB,
	tx SQLQueries) error {

	log.Infof("Starting migration of the rules DB to SQL")

	err := migrateKVStoresDBToSQL(ctx, kvStore, tx)
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
// See the illustration in the firwalldb/kvstores_kvdb.go file to understand
// the structure of the KV stores, and why we process the buckets in the
// order we do.
// Note that this function and the subsequent functions are intentionally
// designed to loop over all buckets and values that exist in the KV store,
// so that we are sure that we actually find all stores and values that
// exist in the KV store, and can be sure that the kv store actually follows
// the expected structure.
func migrateKVStoresDBToSQL(ctx context.Context, kvStore *BoltDB,
	sqlTx SQLQueries) error {

	log.Infof("Starting migration of the KV stores to SQL")

	var totalRows int
	err := kvStore.Update(func(kvTx *bbolt.Tx) error {
		for _, perm := range []bool{true, false} {
			mainBucket, err := getMainBucket(kvTx, true, perm)
			if err != nil {
				return err
			}

			err = mainBucket.ForEach(func(k, v []byte) error {
				if v != nil {
					return errors.New("expected only " +
						"buckets under main bucket")
				}

				ruleName := k
				ruleNameBucket := mainBucket.Bucket(k)
				if ruleNameBucket == nil {
					return fmt.Errorf("rule bucket %s "+
						"not found", string(k))
				}

				ruleId, err := sqlTx.GetOrInsertRuleID(
					ctx, string(ruleName),
				)
				if err != nil {
					return err
				}

				return processRuleBucket(
					ctx, sqlTx, perm, ruleId,
					ruleNameBucket,
				)
			})
			if err != nil {
				return err
			}
		}

		return nil
	})
	if err != nil {
		return err
	}

	log.Infof("Migration of the KV stores to SQL completed. Total number "+
		"of rows migrated: %d", totalRows)

	return nil
}

// processRuleBucket processes a single rule bucket, which contains the
// global and session-kv-store key buckets.
func processRuleBucket(ctx context.Context, sqlTx SQLQueries, perm bool,
	ruleSqlId int64, ruleBucket *bbolt.Bucket) error {

	err := ruleBucket.ForEach(func(k, v []byte) error {
		if v != nil {
			return errors.New("expected only buckets under " +
				"rule-name bucket")
		}

		if bytes.Equal(k, globalKVStoreBucketKey) {
			globalBucket := ruleBucket.Bucket(
				globalKVStoreBucketKey,
			)
			if globalBucket == nil {
				return fmt.Errorf("global bucket %s for rule "+
					"id %d not found", string(k), ruleSqlId)
			}

			return processGlobalRuleBucket(
				ctx, sqlTx, perm, ruleSqlId, globalBucket,
			)
		} else if bytes.Equal(k, sessKVStoreBucketKey) {
			sessionBucket := ruleBucket.Bucket(
				sessKVStoreBucketKey,
			)
			if sessionBucket == nil {
				return fmt.Errorf("session bucket %s for rule "+
					"id %d not found", string(k), ruleSqlId)
			}

			return processSessionBucket(
				ctx, sqlTx, perm, ruleSqlId, sessionBucket,
			)
		} else {
			return fmt.Errorf("unexpected bucket %s under "+
				"rule-name bucket", string(k))
		}
	})

	return err
}

// processRuleBucket processes the global bucket under a rule bucket,
// which contains the global key-value store records for the rule.
// It inserts the records into the SQL database and asserts that
// the migrated values match the original values in the KV store.
func processGlobalRuleBucket(ctx context.Context, sqlTx SQLQueries, perm bool,
	ruleSqlId int64, globalBucket *bbolt.Bucket) error {

	return globalBucket.ForEach(func(k, v []byte) error {
		if v == nil {
			return errors.New("expected only key-values under " +
				"global rule-name bucket")
		}

		globalInsertParams := sqlc.InsertKVStoreRecordParams{
			EntryKey: string(k),
			Value:    v,
			Perm:     perm,
			RuleID:   ruleSqlId,
		}

		err := sqlTx.InsertKVStoreRecord(ctx, globalInsertParams)
		if err != nil {
			return fmt.Errorf("inserting global kv store "+
				"record failed %w", err)
		}

		migratedValue, err := sqlTx.GetGlobalKVStoreRecord(
			ctx,
			sqlc.GetGlobalKVStoreRecordParams{
				Key:    globalInsertParams.EntryKey,
				Perm:   globalInsertParams.Perm,
				RuleID: globalInsertParams.RuleID,
			},
		)
		if err != nil {
			return fmt.Errorf("retreiving of migrated global kv "+
				"store record failed %w", err)
		}

		if !bytes.Equal(migratedValue, v) {
			return fmt.Errorf("migrated global kv record value %x "+
				"does not match original value %x",
				migratedValue, v)
		}

		return nil
	})
}

// processSessionBucket processes the session-kv-store bucket under a rule
// bucket, which contains the group-id buckets for that rule.
func processSessionBucket(ctx context.Context, sqlTx SQLQueries, perm bool,
	ruleSqlId int64, mainSessionBucket *bbolt.Bucket) error {

	return mainSessionBucket.ForEach(func(k, v []byte) error {
		if v != nil {
			return fmt.Errorf("expected only buckets under "+
				"%s bucket", string(sessKVStoreBucketKey))
		}

		groupId := k

		groupBucket := mainSessionBucket.Bucket(groupId)
		if groupBucket == nil {
			return fmt.Errorf("group bucket for group id %s"+
				"not found", string(groupId))
		}

		return processGroupBucket(
			ctx, sqlTx, perm, ruleSqlId, groupId, groupBucket,
		)
	})
}

// processGroupBucket processes a single group bucket, which contains the
// session-wide kv records and as well as the feature-kv-stores key bucket for
// that group. For the session-wide kv records, it inserts the records into the
// SQL database and asserts that the migrated values match the original values.
func processGroupBucket(ctx context.Context, sqlTx SQLQueries, perm bool,
	ruleSqlId int64, groupAlias []byte, groupBucket *bbolt.Bucket) error {

	groupSqlId, err := sqlTx.GetSessionIDByAlias(
		ctx, groupAlias,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return fmt.Errorf("session with group id %x "+
			"not found in sql db", groupAlias)
	} else if err != nil {
		return err
	}

	return groupBucket.ForEach(func(k, v []byte) error {
		if v != nil {
			// This is a non-feature specific k:v store for the
			// session, i.e. the session-wide store.
			sessWideParams := sqlc.InsertKVStoreRecordParams{
				EntryKey: string(k),
				Value:    v,
				Perm:     perm,
				RuleID:   ruleSqlId,
				SessionID: sql.NullInt64{
					Int64: groupSqlId,
					Valid: true,
				},
			}

			err := sqlTx.InsertKVStoreRecord(ctx, sessWideParams)
			if err != nil {
				return fmt.Errorf("inserting session wide kv "+
					"store record failed %w", err)
			}

			migratedValue, err := sqlTx.GetSessionKVStoreRecord(
				ctx,
				sqlc.GetSessionKVStoreRecordParams{
					Key:       sessWideParams.EntryKey,
					Perm:      sessWideParams.Perm,
					RuleID:    sessWideParams.RuleID,
					SessionID: sessWideParams.SessionID,
				},
			)
			if err != nil {
				return fmt.Errorf("retreiving of migrated "+
					"session wide kv store record "+
					"failed %w", err)
			}

			if !bytes.Equal(migratedValue, v) {
				return fmt.Errorf("migrated session wide kv "+
					"record value %x does not match "+
					"original value %x", migratedValue, v)
			}

			return nil
		} else if bytes.Equal(k, featureKVStoreBucketKey) {
			// This is a feature specific k:v store for the
			// session, which will be stored under the feature-name
			// under this bucket.

			featureStoreBucket := groupBucket.Bucket(
				featureKVStoreBucketKey,
			)
			if featureStoreBucket == nil {
				return fmt.Errorf("feature store bucket %s "+
					"for group id %s not found",
					string(featureKVStoreBucketKey),
					string(groupAlias))
			}

			return processFeatureStoreBucket(
				ctx, sqlTx, perm, ruleSqlId, groupSqlId,
				featureStoreBucket,
			)
		} else {
			return fmt.Errorf("unexpected bucket %s found under "+
				"the %s bucket", string(k),
				string(sessKVStoreBucketKey))
		}
	})
}

// processFeatureStoreBucket processes the feature-kv-store bucket under a
// group bucket, which contains the feature specific buckets for that group.
func processFeatureStoreBucket(ctx context.Context, sqlTx SQLQueries, perm bool,
	ruleSqlId int64, groupSqlId int64,
	featureStoreBucket *bbolt.Bucket) error {

	return featureStoreBucket.ForEach(func(k, v []byte) error {
		if v != nil {
			return fmt.Errorf("expected only buckets under " +
				"feature stores bucket")
		}

		featureName := k
		featureNameBucket := featureStoreBucket.Bucket(featureName)
		if featureNameBucket == nil {
			return fmt.Errorf("feature bucket %s not found",
				string(featureName))
		}

		featureSqlId, err := sqlTx.GetOrInsertFeatureID(
			ctx, string(featureName),
		)
		if err != nil {
			return err
		}

		return processFeatureNameBucket(
			ctx, sqlTx, perm, ruleSqlId, groupSqlId, featureSqlId,
			featureNameBucket,
		)
	})
}

// processFeatureNameBucket processes a single feature name bucket, which
// contains the feature specific key-value store records for that group.
// It inserts the records into the SQL database and asserts that
// the migrated values match the original values in the KV store.
func processFeatureNameBucket(ctx context.Context,
	sqlTx SQLQueries, perm bool, ruleSqlId int64, groupSqlId int64,
	featureSqlId int64, featureNameBucket *bbolt.Bucket) error {

	return featureNameBucket.ForEach(func(k, v []byte) error {
		if v == nil {
			return fmt.Errorf("expected only key-values under "+
				"feature name bucket, but found bucket %s",
				string(k))
		}

		featureParams := sqlc.InsertKVStoreRecordParams{
			EntryKey: string(k),
			Value:    v,
			Perm:     perm,
			RuleID:   ruleSqlId,
			SessionID: sql.NullInt64{
				Int64: groupSqlId,
				Valid: true,
			},
			FeatureID: sql.NullInt64{
				Int64: featureSqlId,
				Valid: true,
			},
		}

		err := sqlTx.InsertKVStoreRecord(ctx, featureParams)
		if err != nil {
			return fmt.Errorf("inserting feature specific kv "+
				"store record failed %w", err)
		}

		migratedValue, err := sqlTx.GetFeatureKVStoreRecord(
			ctx,
			sqlc.GetFeatureKVStoreRecordParams{
				Key:       featureParams.EntryKey,
				Perm:      featureParams.Perm,
				RuleID:    featureParams.RuleID,
				SessionID: featureParams.SessionID,
				FeatureID: featureParams.FeatureID,
			},
		)
		if err != nil {
			return fmt.Errorf("retreiving of migrated "+
				"feature specific kv store record "+
				"failed %w", err)
		}

		if !bytes.Equal(migratedValue, v) {
			return fmt.Errorf("migrated feature specific kv "+
				"record value %x does not match original "+
				"value %x", migratedValue, v)
		}

		return nil
	})
}
