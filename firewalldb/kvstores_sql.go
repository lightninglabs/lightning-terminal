package firewalldb

import (
	"bytes"
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/lightninglabs/lightning-terminal/db"
	"github.com/lightninglabs/lightning-terminal/db/sqlc"
	"github.com/lightninglabs/lightning-terminal/session"
	"github.com/lightningnetwork/lnd/fn"
	"github.com/lightningnetwork/lnd/sqldb/v2"
)

// SQLKVStoreQueries is a subset of the sqlc.Queries interface that can be
// used to interact with the kvstore tables.
//
//nolint:ll
type SQLKVStoreQueries interface {
	SQLSessionQueries

	DeleteFeatureKVStoreRecord(ctx context.Context, arg sqlc.DeleteFeatureKVStoreRecordParams) error
	DeleteGlobalKVStoreRecord(ctx context.Context, arg sqlc.DeleteGlobalKVStoreRecordParams) error
	DeleteGroupKVStoreRecord(ctx context.Context, arg sqlc.DeleteGroupKVStoreRecordParams) error
	GetFeatureKVStoreRecord(ctx context.Context, arg sqlc.GetFeatureKVStoreRecordParams) ([]byte, error)
	GetGlobalKVStoreRecord(ctx context.Context, arg sqlc.GetGlobalKVStoreRecordParams) ([]byte, error)
	GetGroupKVStoreRecord(ctx context.Context, arg sqlc.GetGroupKVStoreRecordParams) ([]byte, error)
	UpdateFeatureKVStoreRecord(ctx context.Context, arg sqlc.UpdateFeatureKVStoreRecordParams) error
	UpdateGlobalKVStoreRecord(ctx context.Context, arg sqlc.UpdateGlobalKVStoreRecordParams) error
	UpdateGroupKVStoreRecord(ctx context.Context, arg sqlc.UpdateGroupKVStoreRecordParams) error
	InsertKVStoreRecord(ctx context.Context, arg sqlc.InsertKVStoreRecordParams) error
	ListAllKVStoresRecords(ctx context.Context) ([]sqlc.Kvstore, error)
	DeleteAllTempKVStores(ctx context.Context) error
	GetOrInsertFeatureID(ctx context.Context, name string) (int64, error)
	GetOrInsertRuleID(ctx context.Context, name string) (int64, error)
	GetFeatureID(ctx context.Context, name string) (int64, error)
	GetRuleID(ctx context.Context, name string) (int64, error)
}

// DeleteTempKVStores deletes all temporary kv stores.
//
// NOTE: part of the RulesDB interface.
func (s *SQLDB) DeleteTempKVStores(ctx context.Context) error {
	var writeTxOpts db.QueriesTxOptions

	return s.db.ExecTx(ctx, &writeTxOpts, func(tx SQLQueries) error {
		return tx.DeleteAllTempKVStores(ctx)
	}, sqldb.NoOpReset)
}

// GetKVStores constructs a new rules.KVStores in a namespace defined by the
// rule name, group ID and feature name.
//
// NOTE: part of the RulesDB interface.
func (s *SQLDB) GetKVStores(rule string, groupAlias session.ID,
	feature string) KVStores {

	return &sqlExecutor[KVStoreTx]{
		db: s.db,
		wrapTx: func(queries SQLQueries) KVStoreTx {
			return &sqlKVStoresTx{
				queries:    queries,
				groupAlias: groupAlias,
				rule:       rule,
				feature:    feature,
			}
		},
	}
}

// sqlKVStoresTx is a SQL implementation of the KVStoreTx interface.
type sqlKVStoresTx struct {
	queries    SQLKVStoreQueries
	groupAlias session.ID
	rule       string
	feature    string
}

// Global returns a persisted global, rule-name indexed, kv store. A rule with a
// given name will have access to this store independent of group ID or feature.
//
// NOTE: part of the KVStoreTx interface.
func (s *sqlKVStoresTx) Global() KVStore {
	return &sqlKVStore{
		sqlKVStoresTx: s,
		params: &sqlKVStoreParams{
			perm:     true,
			ruleName: s.rule,
		},
	}
}

// Local returns a persisted local kv store for the rule. Depending on how the
// implementation is initialised, this will either be under the group ID
// namespace or the group ID _and_ feature name namespace.
//
// NOTE: part of the KVStoreTx interface.
func (s *sqlKVStoresTx) Local() KVStore {
	var featureName fn.Option[string]
	if s.feature != "" {
		featureName = fn.Some(s.feature)
	}

	return &sqlKVStore{
		sqlKVStoresTx: s,
		params: &sqlKVStoreParams{
			perm:        true,
			ruleName:    s.rule,
			groupID:     fn.Some(s.groupAlias),
			featureName: featureName,
		},
	}
}

// GlobalTemp is similar to the Global store except that its contents is cleared
// upon restart of the database. The reason persisting the temporary store
// changes instead of just keeping an in-memory store is that we can then
// guarantee atomicity if changes are made to both the permanent and temporary
// stores.
//
// NOTE: part of the KVStoreTx interface.
func (s *sqlKVStoresTx) GlobalTemp() KVStore {
	return &sqlKVStore{
		sqlKVStoresTx: s,
		params: &sqlKVStoreParams{
			perm:     false,
			ruleName: s.rule,
		},
	}
}

// LocalTemp is similar to the Local store except that its contents is cleared
// upon restart of the database. The reason persisting the temporary store
// changes instead of just keeping an in-memory store is that we can then
// guarantee atomicity if changes are made to both the permanent and temporary
// stores.
//
// NOTE: part of the KVStoreTx interface.
func (s *sqlKVStoresTx) LocalTemp() KVStore {
	var featureName fn.Option[string]
	if s.feature != "" {
		featureName = fn.Some(s.feature)
	}

	return &sqlKVStore{
		sqlKVStoresTx: s,
		params: &sqlKVStoreParams{
			perm:        false,
			ruleName:    s.rule,
			groupID:     fn.Some(s.groupAlias),
			featureName: featureName,
		},
	}
}

// A compile-time assertion to ensure that sqlKVStoresTx implements the
// KVStoreTx interface.
var _ KVStoreTx = (*sqlKVStoresTx)(nil)

// sqlKVStoreParams holds the various parameters that determine the namespace
// that a query is accessing.
type sqlKVStoreParams struct {
	perm        bool
	ruleName    string
	groupID     fn.Option[session.ID]
	featureName fn.Option[string]
}

// sqlKVStore is a SQL store backed KVStore.
type sqlKVStore struct {
	*sqlKVStoresTx

	params *sqlKVStoreParams
}

// A compile-time assertion to ensure that sqlKVStore implements the KVStore
// interface.
var _ KVStore = (*sqlKVStore)(nil)

// Get fetches the value under the given key from the underlying kv store. If no
// value is found, nil is returned.
//
// NOTE: part of the KVStore interface.
func (s *sqlKVStore) Get(ctx context.Context, key string) ([]byte, error) {
	value, err := s.get(ctx, key)
	if errors.Is(err, sql.ErrNoRows) ||
		errors.Is(err, session.ErrUnknownGroup) {

		return nil, nil
	} else if err != nil {
		return nil, err
	}

	return value, nil
}

// Set sets the given key-value pair in the underlying kv store.
//
// NOTE: part of the KVStore interface.
func (s *sqlKVStore) Set(ctx context.Context, key string, value []byte) error {
	ruleID, groupID, featureID, err := s.genNamespaceFields(ctx, false)
	if err != nil {
		return err
	}

	// We first need to figure out if we are inserting a new record or
	// updating an existing one. So first do a GET with the same set of
	// params.
	oldValue, err := s.get(ctx, key)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return err
	}

	// No such entry. Add new record.
	if errors.Is(err, sql.ErrNoRows) {
		return s.queries.InsertKVStoreRecord(
			ctx, sqlc.InsertKVStoreRecordParams{
				EntryKey:  key,
				Value:     value,
				Perm:      s.params.perm,
				RuleID:    ruleID,
				GroupID:   groupID,
				FeatureID: featureID,
			},
		)
	}

	// If an entry exists but the value has not changed, there is nothing
	// left to do.
	if bytes.Equal(oldValue, value) {
		return nil
	}

	// Otherwise, the key exists but the value needs to be updated.
	switch {
	case groupID.Valid && featureID.Valid:
		return s.queries.UpdateFeatureKVStoreRecord(
			ctx, sqlc.UpdateFeatureKVStoreRecordParams{
				Key:       key,
				Value:     value,
				Perm:      s.params.perm,
				GroupID:   groupID,
				RuleID:    ruleID,
				FeatureID: featureID,
			},
		)

	case groupID.Valid:
		return s.queries.UpdateGroupKVStoreRecord(
			ctx, sqlc.UpdateGroupKVStoreRecordParams{
				Key:     key,
				Value:   value,
				Perm:    s.params.perm,
				GroupID: groupID,
				RuleID:  ruleID,
			},
		)

	case featureID.Valid:
		return fmt.Errorf("a global feature kv store is " +
			"not currently supported")
	default:
		return s.queries.UpdateGlobalKVStoreRecord(
			ctx, sqlc.UpdateGlobalKVStoreRecordParams{
				Key:    key,
				Value:  value,
				Perm:   s.params.perm,
				RuleID: ruleID,
			},
		)
	}
}

// Del deletes the value under the given key in the underlying kv store.
//
// NOTE: part of the KVStore interface.
func (s *sqlKVStore) Del(ctx context.Context, key string) error {
	// Note: we pass in true here for "read-only" since because this is a
	// Delete, if the record does not exist, we don't need to create one.
	// But no need to error out if it doesn't exist.
	ruleID, groupID, featureID, err := s.genNamespaceFields(ctx, true)
	if errors.Is(err, sql.ErrNoRows) ||
		errors.Is(err, session.ErrUnknownGroup) {

		return nil
	} else if err != nil {
		return err
	}

	switch {
	case groupID.Valid && featureID.Valid:
		return s.queries.DeleteFeatureKVStoreRecord(
			ctx, sqlc.DeleteFeatureKVStoreRecordParams{
				Key:       key,
				Perm:      s.params.perm,
				GroupID:   groupID,
				RuleID:    ruleID,
				FeatureID: featureID,
			},
		)

	case groupID.Valid:
		return s.queries.DeleteGroupKVStoreRecord(
			ctx, sqlc.DeleteGroupKVStoreRecordParams{
				Key:     key,
				Perm:    s.params.perm,
				GroupID: groupID,
				RuleID:  ruleID,
			},
		)

	case featureID.Valid:
		return fmt.Errorf("a global feature kv store is " +
			"not currently supported")
	default:
		return s.queries.DeleteGlobalKVStoreRecord(
			ctx, sqlc.DeleteGlobalKVStoreRecordParams{
				Key:    key,
				Perm:   s.params.perm,
				RuleID: ruleID,
			},
		)
	}
}

// get fetches the value under the given key from the underlying kv store given
// the namespace fields.
func (s *sqlKVStore) get(ctx context.Context, key string) ([]byte, error) {
	ruleID, groupID, featureID, err := s.genNamespaceFields(ctx, true)
	if err != nil {
		return nil, err
	}

	switch {
	case groupID.Valid && featureID.Valid:
		return s.queries.GetFeatureKVStoreRecord(
			ctx, sqlc.GetFeatureKVStoreRecordParams{
				Key:       key,
				Perm:      s.params.perm,
				GroupID:   groupID,
				RuleID:    ruleID,
				FeatureID: featureID,
			},
		)

	case groupID.Valid:
		return s.queries.GetGroupKVStoreRecord(
			ctx, sqlc.GetGroupKVStoreRecordParams{
				Key:     key,
				Perm:    s.params.perm,
				GroupID: groupID,
				RuleID:  ruleID,
			},
		)

	case featureID.Valid:
		return nil, fmt.Errorf("a global feature kv store is " +
			"not currently supported")
	default:
		return s.queries.GetGlobalKVStoreRecord(
			ctx, sqlc.GetGlobalKVStoreRecordParams{
				Key:    key,
				Perm:   s.params.perm,
				RuleID: ruleID,
			},
		)
	}
}

// genNamespaceFields generates the various SQL query parameters that are
// required to access the kvstore namespace determined by the sqlKVStore params.
func (s *sqlKVStore) genNamespaceFields(ctx context.Context,
	readOnly bool) (int64, sql.NullInt64, sql.NullInt64, error) {

	var (
		groupID   sql.NullInt64
		featureID sql.NullInt64
		ruleID    int64
		err       error
	)

	// If a group ID is specified, then we first check that this group ID
	// is a known session alias.
	s.params.groupID.WhenSome(func(id session.ID) {
		var dbGroupID int64
		dbGroupID, err = s.queries.GetSessionIDByAlias(ctx, id[:])
		if errors.Is(err, sql.ErrNoRows) {
			err = session.ErrUnknownGroup

			return
		} else if err != nil {
			return
		}

		groupID = sql.NullInt64{
			Int64: dbGroupID,
			Valid: true,
		}
	})
	if err != nil {
		return ruleID, groupID, featureID, err
	}

	// We only insert a new rule name into the DB if this is a write call.
	if readOnly {
		ruleID, err = s.queries.GetRuleID(ctx, s.params.ruleName)
		if err != nil {
			return 0, groupID, featureID,
				fmt.Errorf("unable to get rule ID: %w", err)
		}
	} else {
		ruleID, err = s.queries.GetOrInsertRuleID(
			ctx, s.params.ruleName,
		)
		if err != nil {
			return 0, groupID, featureID,
				fmt.Errorf("unable to get or insert rule "+
					"ID: %w", err)
		}
	}

	s.params.featureName.WhenSome(func(feature string) {
		// We only insert a new feature name into the DB if this is a
		// write call.
		var id int64
		if readOnly {
			id, err = s.queries.GetFeatureID(ctx, feature)
			if err != nil {
				return
			}
		} else {
			id, err = s.queries.GetOrInsertFeatureID(ctx, feature)
			if err != nil {
				return
			}
		}

		featureID = sql.NullInt64{
			Int64: id,
			Valid: true,
		}
	})

	return ruleID, groupID, featureID, err
}
