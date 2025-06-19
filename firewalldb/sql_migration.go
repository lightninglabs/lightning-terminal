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

// privacyPairs is a type alias for a map that holds the privacy pairs, where
// the outer key is the group ID, and the value is a map of real to pseudo
// values.
type privacyPairs = map[int64]map[string]string

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

	err = migratePrivacyMapperDBToSQL(ctx, kvStore, tx)
	if err != nil {
		return err
	}

	log.Infof("The rules DB has been migrated from KV to SQL.")

	// TODO(viktor): Add migration for the action stores.

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

func migratePrivacyMapperDBToSQL(ctx context.Context, kvStore *bbolt.DB,
	sqlTx SQLQueries) error {

	log.Infof("Starting migration of the privacy mapper store to SQL")

	// 1) Collect all privacy pairs from the KV store.
	privPairs, err := collectPrivacyPairs(ctx, kvStore, sqlTx)
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

// collectPrivacyPairs collects all privacy pairs from the KV store and
// returns them as the privacyPairs type alias.
func collectPrivacyPairs(ctx context.Context, kvStore *bbolt.DB,
	sqlTx SQLQueries) (privacyPairs, error) {

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

			groupSqlId, err := sqlTx.GetSessionIDByAlias(
				ctx, groupId,
			)
			if errors.Is(err, sql.ErrNoRows) {
				return fmt.Errorf("session with group id %x "+
					"not found in sql db", groupId)
			} else if err != nil {
				return err
			}

			groupRealToPseudoPairs, err := collectGroupPairs(gBkt)
			if err != nil {
				return fmt.Errorf("processing group bkt "+
					"for group id %s (sqlID %d) failed: %w",
					groupId, groupSqlId, err)
			}

			groupPairs[groupSqlId] = groupRealToPseudoPairs

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
		missMatchErr    = errors.New("privacy mapper pairs mismatch")
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
		return nil, missMatchErr
	}

	for realVal, pseudoVal := range realToPseudoRes {
		if rv, ok := pseudoToRealRes[pseudoVal]; !ok || rv != realVal {
			return nil, missMatchErr
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
		err := insertGroupPairs(ctx, sqlTx, groupPairs, groupId)
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
func insertGroupPairs(ctx context.Context, sqlTx SQLQueries,
	pairs map[string]string, groupID int64) error {

	for realVal, pseudoVal := range pairs {
		_, err := sqlTx.GetPseudoForReal(
			ctx, sqlc.GetPseudoForRealParams{
				GroupID: groupID,
				RealVal: realVal,
			},
		)
		if err == nil {
			return fmt.Errorf("duplicate privacy pair %s:%s: %w",
				realVal, pseudoVal, ErrDuplicatePseudoValue)
		} else if !errors.Is(err, sql.ErrNoRows) {
			return err
		}

		_, err = sqlTx.GetRealForPseudo(
			ctx, sqlc.GetRealForPseudoParams{
				GroupID:   groupID,
				PseudoVal: pseudoVal,
			},
		)
		if err == nil {
			return fmt.Errorf("duplicate privacy pair %s:%s: %w",
				realVal, pseudoVal, ErrDuplicatePseudoValue)
		} else if !errors.Is(err, sql.ErrNoRows) {
			return err
		}

		err = sqlTx.InsertPrivacyPair(
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
			ctx, sqlTx, groupPairs, groupId,
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
	pairs map[string]string, groupID int64) error {

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
