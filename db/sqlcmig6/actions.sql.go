package sqlcmig6

import (
	"context"
	"database/sql"
	"time"
)

const getAction = `-- name: GetAction :one
SELECT id, session_id, account_id, macaroon_identifier, actor_name, feature_name, action_trigger, intent, structured_json_data, rpc_method, rpc_params_json, created_at, action_state, error_reason
FROM actions
WHERE id = $1
`

func (q *Queries) GetAction(ctx context.Context, id int64) (Action, error) {
	row := q.db.QueryRowContext(ctx, getAction, id)
	var i Action
	err := row.Scan(
		&i.ID,
		&i.SessionID,
		&i.AccountID,
		&i.MacaroonIdentifier,
		&i.ActorName,
		&i.FeatureName,
		&i.ActionTrigger,
		&i.Intent,
		&i.StructuredJsonData,
		&i.RpcMethod,
		&i.RpcParamsJson,
		&i.CreatedAt,
		&i.ActionState,
		&i.ErrorReason,
	)
	return i, err
}

const insertAction = `-- name: InsertAction :one
INSERT INTO actions (
    session_id, account_id, macaroon_identifier, actor_name, feature_name, action_trigger,
    intent, structured_json_data, rpc_method, rpc_params_json, created_at,
    action_state, error_reason
) VALUES (
     $1, $2, $3, $4, $5, $6,
     $7, $8, $9, $10, $11, $12, $13
) RETURNING id
`

type InsertActionParams struct {
	SessionID          sql.NullInt64
	AccountID          sql.NullInt64
	MacaroonIdentifier []byte
	ActorName          sql.NullString
	FeatureName        sql.NullString
	ActionTrigger      sql.NullString
	Intent             sql.NullString
	StructuredJsonData []byte
	RpcMethod          string
	RpcParamsJson      []byte
	CreatedAt          time.Time
	ActionState        int16
	ErrorReason        sql.NullString
}

func (q *Queries) InsertAction(ctx context.Context, arg InsertActionParams) (int64, error) {
	row := q.db.QueryRowContext(ctx, insertAction,
		arg.SessionID,
		arg.AccountID,
		arg.MacaroonIdentifier,
		arg.ActorName,
		arg.FeatureName,
		arg.ActionTrigger,
		arg.Intent,
		arg.StructuredJsonData,
		arg.RpcMethod,
		arg.RpcParamsJson,
		arg.CreatedAt,
		arg.ActionState,
		arg.ErrorReason,
	)
	var id int64
	err := row.Scan(&id)
	return id, err
}

const setActionState = `-- name: SetActionState :exec
UPDATE actions
SET action_state = $1,
    error_reason = $2
WHERE id = $3
`

type SetActionStateParams struct {
	ActionState int16
	ErrorReason sql.NullString
	ID          int64
}

func (q *Queries) SetActionState(ctx context.Context, arg SetActionStateParams) error {
	_, err := q.db.ExecContext(ctx, setActionState, arg.ActionState, arg.ErrorReason, arg.ID)
	return err
}
