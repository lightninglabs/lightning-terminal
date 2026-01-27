package sqlcmig6

import (
	"context"
	"database/sql"
)

const deleteAllTempKVStores = `-- name: DeleteAllTempKVStores :exec
DELETE FROM kvstores
WHERE perm = false
`

func (q *Queries) DeleteAllTempKVStores(ctx context.Context) error {
	_, err := q.db.ExecContext(ctx, deleteAllTempKVStores)
	return err
}

const deleteFeatureKVStoreRecord = `-- name: DeleteFeatureKVStoreRecord :exec
DELETE FROM kvstores
WHERE entry_key = $1
  AND rule_id = $2
  AND perm = $3
  AND group_id = $4
  AND feature_id = $5
`

type DeleteFeatureKVStoreRecordParams struct {
	Key       string
	RuleID    int64
	Perm      bool
	GroupID   sql.NullInt64
	FeatureID sql.NullInt64
}

func (q *Queries) DeleteFeatureKVStoreRecord(ctx context.Context, arg DeleteFeatureKVStoreRecordParams) error {
	_, err := q.db.ExecContext(ctx, deleteFeatureKVStoreRecord,
		arg.Key,
		arg.RuleID,
		arg.Perm,
		arg.GroupID,
		arg.FeatureID,
	)
	return err
}

const deleteGlobalKVStoreRecord = `-- name: DeleteGlobalKVStoreRecord :exec
DELETE FROM kvstores
WHERE entry_key = $1
  AND rule_id = $2
  AND perm = $3
  AND group_id IS NULL
  AND feature_id IS NULL
`

type DeleteGlobalKVStoreRecordParams struct {
	Key    string
	RuleID int64
	Perm   bool
}

func (q *Queries) DeleteGlobalKVStoreRecord(ctx context.Context, arg DeleteGlobalKVStoreRecordParams) error {
	_, err := q.db.ExecContext(ctx, deleteGlobalKVStoreRecord, arg.Key, arg.RuleID, arg.Perm)
	return err
}

const deleteGroupKVStoreRecord = `-- name: DeleteGroupKVStoreRecord :exec
DELETE FROM kvstores
WHERE entry_key = $1
  AND rule_id = $2
  AND perm = $3
  AND group_id = $4
  AND feature_id IS NULL
`

type DeleteGroupKVStoreRecordParams struct {
	Key     string
	RuleID  int64
	Perm    bool
	GroupID sql.NullInt64
}

func (q *Queries) DeleteGroupKVStoreRecord(ctx context.Context, arg DeleteGroupKVStoreRecordParams) error {
	_, err := q.db.ExecContext(ctx, deleteGroupKVStoreRecord,
		arg.Key,
		arg.RuleID,
		arg.Perm,
		arg.GroupID,
	)
	return err
}

const getFeatureID = `-- name: GetFeatureID :one
SELECT id
FROM features
WHERE name = $1
`

func (q *Queries) GetFeatureID(ctx context.Context, name string) (int64, error) {
	row := q.db.QueryRowContext(ctx, getFeatureID, name)
	var id int64
	err := row.Scan(&id)
	return id, err
}

const getFeatureKVStoreRecord = `-- name: GetFeatureKVStoreRecord :one
SELECT value
FROM kvstores
WHERE entry_key = $1
  AND rule_id = $2
  AND perm = $3
  AND group_id = $4
  AND feature_id = $5
`

type GetFeatureKVStoreRecordParams struct {
	Key       string
	RuleID    int64
	Perm      bool
	GroupID   sql.NullInt64
	FeatureID sql.NullInt64
}

func (q *Queries) GetFeatureKVStoreRecord(ctx context.Context, arg GetFeatureKVStoreRecordParams) ([]byte, error) {
	row := q.db.QueryRowContext(ctx, getFeatureKVStoreRecord,
		arg.Key,
		arg.RuleID,
		arg.Perm,
		arg.GroupID,
		arg.FeatureID,
	)
	var value []byte
	err := row.Scan(&value)
	return value, err
}

const getGlobalKVStoreRecord = `-- name: GetGlobalKVStoreRecord :one
SELECT value
FROM kvstores
WHERE entry_key = $1
  AND rule_id = $2
  AND perm = $3
  AND group_id IS NULL
  AND feature_id IS NULL
`

type GetGlobalKVStoreRecordParams struct {
	Key    string
	RuleID int64
	Perm   bool
}

func (q *Queries) GetGlobalKVStoreRecord(ctx context.Context, arg GetGlobalKVStoreRecordParams) ([]byte, error) {
	row := q.db.QueryRowContext(ctx, getGlobalKVStoreRecord, arg.Key, arg.RuleID, arg.Perm)
	var value []byte
	err := row.Scan(&value)
	return value, err
}

const getGroupKVStoreRecord = `-- name: GetGroupKVStoreRecord :one
SELECT value
FROM kvstores
WHERE entry_key = $1
  AND rule_id = $2
  AND perm = $3
  AND group_id = $4
  AND feature_id IS NULL
`

type GetGroupKVStoreRecordParams struct {
	Key     string
	RuleID  int64
	Perm    bool
	GroupID sql.NullInt64
}

func (q *Queries) GetGroupKVStoreRecord(ctx context.Context, arg GetGroupKVStoreRecordParams) ([]byte, error) {
	row := q.db.QueryRowContext(ctx, getGroupKVStoreRecord,
		arg.Key,
		arg.RuleID,
		arg.Perm,
		arg.GroupID,
	)
	var value []byte
	err := row.Scan(&value)
	return value, err
}

const getOrInsertFeatureID = `-- name: GetOrInsertFeatureID :one
INSERT INTO features (name)
VALUES ($1)
ON CONFLICT(name) DO UPDATE SET name = excluded.name
RETURNING id
`

func (q *Queries) GetOrInsertFeatureID(ctx context.Context, name string) (int64, error) {
	row := q.db.QueryRowContext(ctx, getOrInsertFeatureID, name)
	var id int64
	err := row.Scan(&id)
	return id, err
}

const getOrInsertRuleID = `-- name: GetOrInsertRuleID :one
INSERT INTO rules (name)
VALUES ($1)
ON CONFLICT(name) DO UPDATE SET name = excluded.name
RETURNING id
`

func (q *Queries) GetOrInsertRuleID(ctx context.Context, name string) (int64, error) {
	row := q.db.QueryRowContext(ctx, getOrInsertRuleID, name)
	var id int64
	err := row.Scan(&id)
	return id, err
}

const getRuleID = `-- name: GetRuleID :one
SELECT id
FROM rules
WHERE name = $1
`

func (q *Queries) GetRuleID(ctx context.Context, name string) (int64, error) {
	row := q.db.QueryRowContext(ctx, getRuleID, name)
	var id int64
	err := row.Scan(&id)
	return id, err
}

const insertKVStoreRecord = `-- name: InsertKVStoreRecord :exec
INSERT INTO kvstores (perm, rule_id, group_id, feature_id, entry_key, value)
VALUES ($1, $2, $3, $4, $5, $6)
`

type InsertKVStoreRecordParams struct {
	Perm      bool
	RuleID    int64
	GroupID   sql.NullInt64
	FeatureID sql.NullInt64
	EntryKey  string
	Value     []byte
}

func (q *Queries) InsertKVStoreRecord(ctx context.Context, arg InsertKVStoreRecordParams) error {
	_, err := q.db.ExecContext(ctx, insertKVStoreRecord,
		arg.Perm,
		arg.RuleID,
		arg.GroupID,
		arg.FeatureID,
		arg.EntryKey,
		arg.Value,
	)
	return err
}

const listAllKVStoresRecords = `-- name: ListAllKVStoresRecords :many
SELECT id, perm, rule_id, group_id, feature_id, entry_key, value
FROM kvstores
`

func (q *Queries) ListAllKVStoresRecords(ctx context.Context) ([]Kvstore, error) {
	rows, err := q.db.QueryContext(ctx, listAllKVStoresRecords)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Kvstore
	for rows.Next() {
		var i Kvstore
		if err := rows.Scan(
			&i.ID,
			&i.Perm,
			&i.RuleID,
			&i.GroupID,
			&i.FeatureID,
			&i.EntryKey,
			&i.Value,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const updateFeatureKVStoreRecord = `-- name: UpdateFeatureKVStoreRecord :exec
UPDATE kvstores
SET value = $1
WHERE entry_key = $2
  AND rule_id = $3
  AND perm = $4
  AND group_id = $5
  AND feature_id = $6
`

type UpdateFeatureKVStoreRecordParams struct {
	Value     []byte
	Key       string
	RuleID    int64
	Perm      bool
	GroupID   sql.NullInt64
	FeatureID sql.NullInt64
}

func (q *Queries) UpdateFeatureKVStoreRecord(ctx context.Context, arg UpdateFeatureKVStoreRecordParams) error {
	_, err := q.db.ExecContext(ctx, updateFeatureKVStoreRecord,
		arg.Value,
		arg.Key,
		arg.RuleID,
		arg.Perm,
		arg.GroupID,
		arg.FeatureID,
	)
	return err
}

const updateGlobalKVStoreRecord = `-- name: UpdateGlobalKVStoreRecord :exec
UPDATE kvstores
SET value = $1
WHERE entry_key = $2
  AND rule_id = $3
  AND perm = $4
  AND group_id IS NULL
  AND feature_id IS NULL
`

type UpdateGlobalKVStoreRecordParams struct {
	Value  []byte
	Key    string
	RuleID int64
	Perm   bool
}

func (q *Queries) UpdateGlobalKVStoreRecord(ctx context.Context, arg UpdateGlobalKVStoreRecordParams) error {
	_, err := q.db.ExecContext(ctx, updateGlobalKVStoreRecord,
		arg.Value,
		arg.Key,
		arg.RuleID,
		arg.Perm,
	)
	return err
}

const updateGroupKVStoreRecord = `-- name: UpdateGroupKVStoreRecord :exec
UPDATE kvstores
SET value = $1
WHERE entry_key = $2
  AND rule_id = $3
  AND perm = $4
  AND group_id = $5
  AND feature_id IS NULL
`

type UpdateGroupKVStoreRecordParams struct {
	Value   []byte
	Key     string
	RuleID  int64
	Perm    bool
	GroupID sql.NullInt64
}

func (q *Queries) UpdateGroupKVStoreRecord(ctx context.Context, arg UpdateGroupKVStoreRecordParams) error {
	_, err := q.db.ExecContext(ctx, updateGroupKVStoreRecord,
		arg.Value,
		arg.Key,
		arg.RuleID,
		arg.Perm,
		arg.GroupID,
	)
	return err
}
