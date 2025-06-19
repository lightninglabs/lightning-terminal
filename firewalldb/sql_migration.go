package firewalldb

import (
	"bytes"
	"context"
	"database/sql"
	"errors"
	"fmt"
	"github.com/lightninglabs/lightning-terminal/db/sqlc"
	"github.com/lightningnetwork/lnd/sqldb"
	"go.etcd.io/bbolt"
)

// kvParams is a type alias for the InsertKVStoreRecordParams, to shorten the
// line length in the migration code.
type kvParams = sqlc.InsertKVStoreRecordParams

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
func migrateKVStoresDBToSQL(ctx context.Context, kvStore *bbolt.DB,
	sqlTx SQLQueries) error {

	log.Infof("Starting migration of the KV stores to SQL")

	// allParams will hold all the kvParams that are inserted into the
	// SQL database during the migration.
	var allParams []kvParams

	err := kvStore.View(func(kvTx *bbolt.Tx) error {
		for _, perm := range []bool{true, false} {
			mainBucket, err := getMainBucket(kvTx, false, perm)
			if err != nil {
				return err
			}

			if mainBucket == nil {
				// If the mainBucket doesn't exist, there are no
				// records to migrate under that bucket,
				// therefore we don't error, and just proceed
				// to not migrate any records under that bucket.
				continue
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

				params, err := processRuleBucket(
					ctx, sqlTx, perm, ruleId,
					ruleNameBucket,
				)
				if err != nil {
					return err
				}

				allParams = append(allParams, params...)

				return nil
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

	// After the migration is done, we validate that all inserted kvParams
	// can match the original values in the KV store. Note that this is done
	// after all values have been inserted, in order to ensure that the
	// migration doesn't overwrite any values after they were inserted.
	for _, param := range allParams {
		switch {
		case param.FeatureID.Valid && param.SessionID.Valid:
			migratedValue, err := sqlTx.GetFeatureKVStoreRecord(
				ctx,
				sqlc.GetFeatureKVStoreRecordParams{
					Key:       param.EntryKey,
					Perm:      param.Perm,
					RuleID:    param.RuleID,
					SessionID: param.SessionID,
					FeatureID: param.FeatureID,
				},
			)
			if err != nil {
				return fmt.Errorf("retreiving of migrated "+
					"feature specific kv store record "+
					"failed %w", err)
			}

			if !bytes.Equal(migratedValue, param.Value) {
				return fmt.Errorf("migrated feature specific  "+
					"kv record value %x does not match "+
					"original value %x", migratedValue,
					param.Value)
			}

		case param.SessionID.Valid:
			migratedValue, err := sqlTx.GetSessionKVStoreRecord(
				ctx,
				sqlc.GetSessionKVStoreRecordParams{
					Key:       param.EntryKey,
					Perm:      param.Perm,
					RuleID:    param.RuleID,
					SessionID: param.SessionID,
				},
			)
			if err != nil {
				return fmt.Errorf("retreiving of migrated "+
					"session wide kv store record "+
					"failed %w", err)
			}

			if !bytes.Equal(migratedValue, param.Value) {
				return fmt.Errorf("migrated session wide kv "+
					"record value %x does not match "+
					"original value %x", migratedValue,
					param.Value)
			}

		case !param.FeatureID.Valid && !param.SessionID.Valid:
			migratedValue, err := sqlTx.GetGlobalKVStoreRecord(
				ctx,
				sqlc.GetGlobalKVStoreRecordParams{
					Key:    param.EntryKey,
					Perm:   param.Perm,
					RuleID: param.RuleID,
				},
			)
			if err != nil {
				return fmt.Errorf("retreiving of migrated "+
					"global kv store record failed %w", err)
			}

			if !bytes.Equal(migratedValue, param.Value) {
				return fmt.Errorf("migrated global kv record "+
					"value %x does not match original "+
					"value %x", migratedValue, param.Value)
			}

		default:
			return fmt.Errorf("unexpected combination of "+
				"FeatureID and SessionID for: %v", param)
		}
	}

	log.Infof("Migration of the KV stores to SQL completed. Total number "+
		"of rows migrated: %d", len(allParams))

	return nil
}

// processRuleBucket processes a single rule bucket, which contains the
// global and session-kv-store key buckets.
func processRuleBucket(ctx context.Context, sqlTx SQLQueries, perm bool,
	ruleSqlId int64, ruleBucket *bbolt.Bucket) ([]kvParams, error) {

	var params []kvParams

	return params, ruleBucket.ForEach(func(k, v []byte) error {
		switch {
		case v != nil:
			return errors.New("expected only buckets under " +
				"rule-name bucket")
		case bytes.Equal(k, globalKVStoreBucketKey):
			globalBucket := ruleBucket.Bucket(
				globalKVStoreBucketKey,
			)
			if globalBucket == nil {
				return fmt.Errorf("global bucket %s for rule "+
					"id %d not found", string(k), ruleSqlId)
			}

			p, err := processGlobalRuleBucket(
				ctx, sqlTx, perm, ruleSqlId, globalBucket,
			)
			if err != nil {
				return err
			}

			params = append(params, p...)

			return nil
		case bytes.Equal(k, sessKVStoreBucketKey):
			sessionBucket := ruleBucket.Bucket(
				sessKVStoreBucketKey,
			)
			if sessionBucket == nil {
				return fmt.Errorf("session bucket %s for rule "+
					"id %d not found", string(k), ruleSqlId)
			}

			p, err := processSessionBucket(
				ctx, sqlTx, perm, ruleSqlId, sessionBucket,
			)
			if err != nil {
				return err
			}

			params = append(params, p...)

			return nil
		default:
			return fmt.Errorf("unexpected bucket %s under "+
				"rule-name bucket", string(k))
		}
	})
}

// processGlobalRuleBucket processes the global bucket under a rule bucket,
// which contains the global key-value store records for the rule.
// It inserts the records into the SQL database and asserts that
// the migrated values match the original values in the KV store.
func processGlobalRuleBucket(ctx context.Context, sqlTx SQLQueries, perm bool,
	ruleSqlId int64, globalBucket *bbolt.Bucket) ([]kvParams, error) {

	var params []kvParams

	return params, globalBucket.ForEach(func(k, v []byte) error {
		if v == nil {
			return errors.New("expected only key-values under " +
				"global rule-name bucket")
		}

		globalInsertParams := kvParams{
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

		params = append(params, globalInsertParams)

		return nil
	})
}

// processSessionBucket processes the session-kv-store bucket under a rule
// bucket, which contains the group-id buckets for that rule.
func processSessionBucket(ctx context.Context, sqlTx SQLQueries, perm bool,
	ruleSqlId int64, mainSessionBucket *bbolt.Bucket) ([]kvParams, error) {

	var params []kvParams

	return params, mainSessionBucket.ForEach(func(groupId, v []byte) error {
		if v != nil {
			return fmt.Errorf("expected only buckets under "+
				"%s bucket", string(sessKVStoreBucketKey))
		}

		groupBucket := mainSessionBucket.Bucket(groupId)
		if groupBucket == nil {
			return fmt.Errorf("group bucket for group id %s"+
				"not found", string(groupId))
		}

		p, err := processGroupBucket(
			ctx, sqlTx, perm, ruleSqlId, groupId, groupBucket,
		)
		if err != nil {
			return err
		}

		params = append(params, p...)

		return nil
	})
}

// processGroupBucket processes a single group bucket, which contains the
// session-wide kv records and as well as the feature-kv-stores key bucket for
// that group. For the session-wide kv records, it inserts the records into the
// SQL database and asserts that the migrated values match the original values.
func processGroupBucket(ctx context.Context, sqlTx SQLQueries, perm bool,
	ruleSqlId int64, groupAlias []byte,
	groupBucket *bbolt.Bucket) ([]kvParams, error) {

	groupSqlId, err := sqlTx.GetSessionIDByAlias(
		ctx, groupAlias,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, fmt.Errorf("session with group id %x "+
			"not found in sql db", groupAlias)
	} else if err != nil {
		return nil, err
	}

	var params []kvParams

	return params, groupBucket.ForEach(func(k, v []byte) error {
		switch {
		case v != nil:
			// This is a non-feature specific k:v store for the
			// session, i.e. the session-wide store.
			sessWideParams := kvParams{
				EntryKey:  string(k),
				Value:     v,
				Perm:      perm,
				RuleID:    ruleSqlId,
				SessionID: sqldb.SQLInt64(groupSqlId),
			}

			err := sqlTx.InsertKVStoreRecord(ctx, sessWideParams)
			if err != nil {
				return fmt.Errorf("inserting session wide kv "+
					"store record failed %w", err)
			}

			params = append(params, sessWideParams)

			return nil
		case bytes.Equal(k, featureKVStoreBucketKey):
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

			p, err := processFeatureStoreBucket(
				ctx, sqlTx, perm, ruleSqlId, groupSqlId,
				featureStoreBucket,
			)
			if err != nil {
				return err
			}

			params = append(params, p...)

			return nil
		default:
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
	featureStoreBucket *bbolt.Bucket) ([]kvParams, error) {

	var params []kvParams

	return params, featureStoreBucket.ForEach(func(k, v []byte) error {
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

		p, err := processFeatureNameBucket(
			ctx, sqlTx, perm, ruleSqlId, groupSqlId, featureSqlId,
			featureNameBucket,
		)
		if err != nil {
			return err
		}

		params = append(params, p...)

		return nil
	})
}

// processFeatureNameBucket processes a single feature name bucket, which
// contains the feature specific key-value store records for that group.
// It inserts the records into the SQL database and asserts that
// the migrated values match the original values in the KV store.
func processFeatureNameBucket(ctx context.Context, sqlTx SQLQueries, perm bool,
	ruleSqlId int64, groupSqlId int64, featureSqlId int64,
	featureNameBucket *bbolt.Bucket) ([]kvParams, error) {

	var params []kvParams

	return params, featureNameBucket.ForEach(func(k, v []byte) error {
		if v == nil {
			return fmt.Errorf("expected only key-values under "+
				"feature name bucket, but found bucket %s",
				string(k))
		}

		featureParams := kvParams{
			EntryKey:  string(k),
			Value:     v,
			Perm:      perm,
			RuleID:    ruleSqlId,
			SessionID: sqldb.SQLInt64(groupSqlId),
			FeatureID: sqldb.SQLInt64(featureSqlId),
		}

		err := sqlTx.InsertKVStoreRecord(ctx, featureParams)
		if err != nil {
			return fmt.Errorf("inserting feature specific kv "+
				"store record failed %w", err)
		}

		params = append(params, featureParams)

		return nil
	})
}
