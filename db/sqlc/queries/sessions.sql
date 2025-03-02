-- name: InsertSession :one
INSERT INTO sessions (
    alias, label, state, type, expiry, created_at,
    server_address, dev_server, macaroon_root_key, pairing_secret,
    local_private_key, local_public_key, remote_public_key, privacy, group_id, account_id
) VALUES (
    $1, $2, $3, $4, $5, $6, $7,
    $8, $9, $10, $11, $12,
    $13, $14, $15, $16
) RETURNING id;

-- name: SetSessionGroupID :exec
UPDATE sessions
SET group_id = $1
WHERE id = $2;

-- name: DeleteSessionsWithState :exec
DELETE FROM sessions
WHERE state = $1;

-- name: GetSessionByLocalPublicKey :one
SELECT * FROM sessions
WHERE local_public_key = $1;

-- name: GetSessionsInGroup :many
SELECT * FROM sessions
WHERE group_id = $1;

-- name: GetSessionAliasesInGroup :many
SELECT alias FROM sessions
WHERE group_id = $1;

-- name: GetSessionByID :one
SELECT * FROM sessions
WHERE id = $1;

-- name: GetSessionIDByAlias :one
SELECT id FROM sessions
WHERE alias = $1;

-- name: GetAliasBySessionID :one
SELECT alias FROM sessions
WHERE id = $1;

-- name: GetSessionByAlias :one
SELECT * FROM sessions
WHERE alias = $1;

-- name: ListSessions :many
SELECT * FROM sessions
ORDER BY created_at;

-- name: ListSessionsByType :many
SELECT * FROM sessions
WHERE type = $1
ORDER BY created_at;

-- name: ListSessionsByState :many
SELECT * FROM sessions
WHERE state = $1
ORDER BY created_at;

-- name: SetSessionRevokedAt :exec
UPDATE sessions
SET revoked_at = $1
WHERE id = $2;

-- name: UpdateSessionState :exec
UPDATE sessions
SET state = $1
WHERE id = $2;

-- name: SetSessionRemotePublicKey :exec
UPDATE sessions
SET remote_public_key = $1
WHERE id = $2;

-- name: InsertSessionMacaroonPermission :exec
INSERT INTO session_macaroon_permissions (
    session_id, entity, action
) VALUES (
    $1, $2, $3
);

-- name: GetSessionMacaroonPermissions :many
SELECT * FROM session_macaroon_permissions
WHERE session_id = $1;

-- name: InsertSessionMacaroonCaveat :exec
INSERT INTO session_macaroon_caveats (
    session_id, caveat_id, verification_id, location
) VALUES (
    $1, $2, $3, $4
);

-- name: GetSessionMacaroonCaveats :many
SELECT * FROM session_macaroon_caveats
WHERE session_id = $1;

-- name: InsertSessionFeatureConfig :exec
INSERT INTO session_feature_configs (
    session_id, feature_name, config
) VALUES (
    $1, $2, $3
);

-- name: GetSessionFeatureConfigs :many
SELECT * FROM session_feature_configs
WHERE session_id = $1;

-- name: InsertSessionPrivacyFlag :exec
INSERT INTO session_privacy_flags (
    session_id, flag
) VALUES (
    $1, $2
);

-- name: GetSessionPrivacyFlags :many
SELECT * FROM session_privacy_flags
WHERE session_id = $1;