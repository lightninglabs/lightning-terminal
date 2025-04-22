-- name: InsertPrivacyPair :exec
INSERT INTO privacy_pairs (group_id, real_val, pseudo_val)
VALUES ($1, $2, $3);

-- name: GetRealForPseudo :one
SELECT real_val
FROM privacy_pairs
WHERE group_id = $1 AND pseudo_val = $2;

-- name: GetPseudoForReal :one
SELECT pseudo_val
FROM privacy_pairs
WHERE group_id = $1 AND real_val = $2;

-- name: GetAllPrivacyPairs :many
SELECT real_val, pseudo_val
FROM privacy_pairs
WHERE group_id = $1;
