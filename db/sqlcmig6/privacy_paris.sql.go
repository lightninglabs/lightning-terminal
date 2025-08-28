package sqlcmig6

import (
	"context"
)

const getAllPrivacyPairs = `-- name: GetAllPrivacyPairs :many
SELECT real_val, pseudo_val
FROM privacy_pairs
WHERE group_id = $1
`

type GetAllPrivacyPairsRow struct {
	RealVal   string
	PseudoVal string
}

func (q *Queries) GetAllPrivacyPairs(ctx context.Context, groupID int64) ([]GetAllPrivacyPairsRow, error) {
	rows, err := q.db.QueryContext(ctx, getAllPrivacyPairs, groupID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []GetAllPrivacyPairsRow
	for rows.Next() {
		var i GetAllPrivacyPairsRow
		if err := rows.Scan(&i.RealVal, &i.PseudoVal); err != nil {
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

const getPseudoForReal = `-- name: GetPseudoForReal :one
SELECT pseudo_val
FROM privacy_pairs
WHERE group_id = $1 AND real_val = $2
`

type GetPseudoForRealParams struct {
	GroupID int64
	RealVal string
}

func (q *Queries) GetPseudoForReal(ctx context.Context, arg GetPseudoForRealParams) (string, error) {
	row := q.db.QueryRowContext(ctx, getPseudoForReal, arg.GroupID, arg.RealVal)
	var pseudo_val string
	err := row.Scan(&pseudo_val)
	return pseudo_val, err
}

const getRealForPseudo = `-- name: GetRealForPseudo :one
SELECT real_val
FROM privacy_pairs
WHERE group_id = $1 AND pseudo_val = $2
`

type GetRealForPseudoParams struct {
	GroupID   int64
	PseudoVal string
}

func (q *Queries) GetRealForPseudo(ctx context.Context, arg GetRealForPseudoParams) (string, error) {
	row := q.db.QueryRowContext(ctx, getRealForPseudo, arg.GroupID, arg.PseudoVal)
	var real_val string
	err := row.Scan(&real_val)
	return real_val, err
}

const insertPrivacyPair = `-- name: InsertPrivacyPair :exec
INSERT INTO privacy_pairs (group_id, real_val, pseudo_val)
VALUES ($1, $2, $3)
`

type InsertPrivacyPairParams struct {
	GroupID   int64
	RealVal   string
	PseudoVal string
}

func (q *Queries) InsertPrivacyPair(ctx context.Context, arg InsertPrivacyPairParams) error {
	_, err := q.db.ExecContext(ctx, insertPrivacyPair, arg.GroupID, arg.RealVal, arg.PseudoVal)
	return err
}
