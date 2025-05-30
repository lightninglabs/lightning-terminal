package sqlc

import (
	"context"
	"database/sql"
	"strconv"
	"strings"
)

// ActionQueryParams defines the parameters for querying actions.
type ActionQueryParams struct {
	SessionID   sql.NullInt64
	AccountID   sql.NullInt64
	FeatureName sql.NullString
	ActorName   sql.NullString
	RpcMethod   sql.NullString
	State       sql.NullInt16
	EndTime     sql.NullTime
	StartTime   sql.NullTime
	GroupID     sql.NullInt64
}

// ListActionsParams defines the parameters for listing actions, including
// the ActionQueryParams for filtering and a Pagination struct for
// pagination. The Reversed field indicates whether the results should be
// returned in reverse order based on the created_at timestamp.
type ListActionsParams struct {
	ActionQueryParams
	Reversed bool
	*Pagination
}

// Pagination defines the pagination parameters for listing actions.
type Pagination struct {
	NumOffset int32
	NumLimit  int32
}

// ListActions retrieves a list of actions based on the provided
// ListActionsParams.
func (q *Queries) ListActions(ctx context.Context,
	arg ListActionsParams) ([]Action, error) {

	query, args := buildListActionsQuery(arg)
	rows, err := q.db.QueryContext(ctx, fillPlaceHolders(query), args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Action
	for rows.Next() {
		var i Action
		if err := rows.Scan(
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

// CountActions returns the number of actions that match the provided
// ActionQueryParams.
func (q *Queries) CountActions(ctx context.Context,
	arg ActionQueryParams) (int64, error) {

	query, args := buildActionsQuery(arg, true)
	row := q.db.QueryRowContext(ctx, query, args...)

	var count int64
	err := row.Scan(&count)

	return count, err
}

// buildActionsQuery constructs a SQL query to retrieve actions based on the
// provided parameters. We do this manually so that if, for example, we have
// a sessionID we are filtering by, then this appears in the query as:
// `WHERE a.session_id = ?` which will properly make use of the underlying
// index. If we were instead to use a single SQLC query, it would include many
// WHERE clauses like:
// "WHERE a.session_id = COALESCE(sqlc.narg('session_id'), a.session_id)".
// This would use the index if run against postres but not when run against
// sqlite.
//
// The 'count' param indicates whether the query should return a count of
// actions that match the criteria or the actions themselves.
func buildActionsQuery(params ActionQueryParams, count bool) (string, []any) {
	var (
		conditions []string
		args       []any
	)

	if params.SessionID.Valid {
		conditions = append(conditions, "a.session_id = ?")
		args = append(args, params.SessionID.Int64)
	}
	if params.AccountID.Valid {
		conditions = append(conditions, "a.account_id = ?")
		args = append(args, params.AccountID.Int64)
	}
	if params.FeatureName.Valid {
		conditions = append(conditions, "a.feature_name = ?")
		args = append(args, params.FeatureName.String)
	}
	if params.ActorName.Valid {
		conditions = append(conditions, "a.actor_name = ?")
		args = append(args, params.ActorName.String)
	}
	if params.RpcMethod.Valid {
		conditions = append(conditions, "a.rpc_method = ?")
		args = append(args, params.RpcMethod.String)
	}
	if params.State.Valid {
		conditions = append(conditions, "a.action_state = ?")
		args = append(args, params.State.Int16)
	}
	if params.EndTime.Valid {
		conditions = append(conditions, "a.created_at <= ?")
		args = append(args, params.EndTime.Time)
	}
	if params.StartTime.Valid {
		conditions = append(conditions, "a.created_at >= ?")
		args = append(args, params.StartTime.Time)
	}
	if params.GroupID.Valid {
		conditions = append(conditions, `
			EXISTS (
				SELECT 1
				FROM sessions s
				WHERE s.id = a.session_id AND s.group_id = ?
			)`)
		args = append(args, params.GroupID.Int64)
	}

	query := "SELECT a.* FROM actions a"
	if count {
		query = "SELECT COUNT(*) FROM actions a"
	}
	if len(conditions) > 0 {
		query += " WHERE " + strings.Join(conditions, " AND ")
	}

	return query, args
}

// buildListActionsQuery constructs a SQL query to retrieve a list of actions
// based on the provided parameters. It builds upon the `buildActionsQuery`
// function, adding pagination and ordering based on the reversed parameter.
func buildListActionsQuery(params ListActionsParams) (string, []interface{}) {
	query, args := buildActionsQuery(params.ActionQueryParams, false)

	// Determine order direction.
	order := "ASC"
	if params.Reversed {
		order = "DESC"
	}
	query += " ORDER BY a.created_at " + order

	// Maybe paginate.
	if params.Pagination != nil {
		query += " LIMIT ? OFFSET ?"
		args = append(args, params.NumLimit, params.NumOffset)
	}

	return query, args
}

// fillPlaceHolders replaces all '?' placeholders in the SQL query with
// positional placeholders like $1, $2, etc. This is necessary for
// compatibility with Postgres.
func fillPlaceHolders(query string) string {
	var (
		sb     strings.Builder
		argNum = 1
	)

	for i := range len(query) {
		if query[i] != '?' {
			sb.WriteByte(query[i])
			continue
		}

		sb.WriteString("$")
		sb.WriteString(strconv.Itoa(argNum))
		argNum++
	}

	return sb.String()
}
