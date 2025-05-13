-- name: InsertAction :one
INSERT INTO actions (
    session_id, account_id, macaroon_identifier, actor_name, feature_name, action_trigger,
    intent, structured_json_data, rpc_method, rpc_params_json, created_at,
    action_state, error_reason
) VALUES (
     $1, $2, $3, $4, $5, $6,
     $7, $8, $9, $10, $11, $12, $13
) RETURNING id;

-- name: SetActionState :exec
UPDATE actions
SET action_state = $1,
    error_reason = $2
WHERE id = $3;
