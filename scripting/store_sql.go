package scripting

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"time"
)

// SQLStore implements Store using a SQL database.
type SQLStore struct {
	db *sql.DB
}

// NewSQLStore creates a new SQL-backed script store.
func NewSQLStore(db *sql.DB) *SQLStore {
	return &SQLStore{db: db}
}

// CreateScript creates a new script.
func (s *SQLStore) CreateScript(ctx context.Context, script *Script) error {
	allowedURLs, err := json.Marshal(script.AllowedURLs)
	if err != nil {
		return fmt.Errorf("failed to marshal allowed URLs: %w", err)
	}

	allowedBuckets, err := json.Marshal(script.AllowedBuckets)
	if err != nil {
		return fmt.Errorf("failed to marshal allowed buckets: %w", err)
	}

	query := `
		INSERT INTO scripts (
			name, description, source, macaroon, timeout_secs,
			max_memory_bytes, allowed_urls, allowed_buckets,
			created_at, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`

	result, err := s.db.ExecContext(ctx, query,
		script.Name,
		script.Description,
		script.Source,
		script.Macaroon,
		script.TimeoutSecs,
		script.MaxMemoryBytes,
		string(allowedURLs),
		string(allowedBuckets),
		script.CreatedAt,
		script.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to insert script: %w", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return fmt.Errorf("failed to get last insert ID: %w", err)
	}

	script.ID = id
	return nil
}

// UpdateScript updates an existing script.
func (s *SQLStore) UpdateScript(ctx context.Context, script *Script) error {
	allowedURLs, err := json.Marshal(script.AllowedURLs)
	if err != nil {
		return fmt.Errorf("failed to marshal allowed URLs: %w", err)
	}

	allowedBuckets, err := json.Marshal(script.AllowedBuckets)
	if err != nil {
		return fmt.Errorf("failed to marshal allowed buckets: %w", err)
	}

	query := `
		UPDATE scripts SET
			description = ?,
			source = ?,
			macaroon = ?,
			timeout_secs = ?,
			max_memory_bytes = ?,
			allowed_urls = ?,
			allowed_buckets = ?,
			updated_at = ?
		WHERE name = ?
	`

	_, err = s.db.ExecContext(ctx, query,
		script.Description,
		script.Source,
		script.Macaroon,
		script.TimeoutSecs,
		script.MaxMemoryBytes,
		string(allowedURLs),
		string(allowedBuckets),
		script.UpdatedAt,
		script.Name,
	)
	if err != nil {
		return fmt.Errorf("failed to update script: %w", err)
	}

	return nil
}

// DeleteScript deletes a script by name.
func (s *SQLStore) DeleteScript(ctx context.Context, name string) error {
	query := `DELETE FROM scripts WHERE name = ?`
	_, err := s.db.ExecContext(ctx, query, name)
	return err
}

// GetScript retrieves a script by name.
func (s *SQLStore) GetScript(ctx context.Context, name string) (*Script, error) {
	query := `
		SELECT id, name, description, source, macaroon, timeout_secs,
			max_memory_bytes, allowed_urls, allowed_buckets,
			created_at, updated_at
		FROM scripts WHERE name = ?
	`

	row := s.db.QueryRowContext(ctx, query, name)
	return s.scanScript(row)
}

// GetScriptByID retrieves a script by ID.
func (s *SQLStore) GetScriptByID(ctx context.Context, id int64) (*Script, error) {
	query := `
		SELECT id, name, description, source, macaroon, timeout_secs,
			max_memory_bytes, allowed_urls, allowed_buckets,
			created_at, updated_at
		FROM scripts WHERE id = ?
	`

	row := s.db.QueryRowContext(ctx, query, id)
	return s.scanScript(row)
}

// scanScript scans a script from a row.
func (s *SQLStore) scanScript(row *sql.Row) (*Script, error) {
	var script Script
	var allowedURLsJSON, allowedBucketsJSON string

	err := row.Scan(
		&script.ID,
		&script.Name,
		&script.Description,
		&script.Source,
		&script.Macaroon,
		&script.TimeoutSecs,
		&script.MaxMemoryBytes,
		&allowedURLsJSON,
		&allowedBucketsJSON,
		&script.CreatedAt,
		&script.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("script not found")
		}
		return nil, fmt.Errorf("failed to scan script: %w", err)
	}

	if allowedURLsJSON != "" {
		if err := json.Unmarshal([]byte(allowedURLsJSON), &script.AllowedURLs); err != nil {
			return nil, fmt.Errorf("failed to unmarshal allowed URLs: %w", err)
		}
	}

	if allowedBucketsJSON != "" {
		if err := json.Unmarshal([]byte(allowedBucketsJSON), &script.AllowedBuckets); err != nil {
			return nil, fmt.Errorf("failed to unmarshal allowed buckets: %w", err)
		}
	}

	return &script, nil
}

// ListScripts returns all scripts.
func (s *SQLStore) ListScripts(ctx context.Context) ([]*Script, error) {
	query := `
		SELECT id, name, description, source, macaroon, timeout_secs,
			max_memory_bytes, allowed_urls, allowed_buckets,
			created_at, updated_at
		FROM scripts ORDER BY name
	`

	rows, err := s.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query scripts: %w", err)
	}
	defer rows.Close()

	var scripts []*Script
	for rows.Next() {
		var script Script
		var allowedURLsJSON, allowedBucketsJSON string

		err := rows.Scan(
			&script.ID,
			&script.Name,
			&script.Description,
			&script.Source,
			&script.Macaroon,
			&script.TimeoutSecs,
			&script.MaxMemoryBytes,
			&allowedURLsJSON,
			&allowedBucketsJSON,
			&script.CreatedAt,
			&script.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan script: %w", err)
		}

		if allowedURLsJSON != "" {
			if err := json.Unmarshal([]byte(allowedURLsJSON), &script.AllowedURLs); err != nil {
				return nil, fmt.Errorf("failed to unmarshal allowed URLs: %w", err)
			}
		}

		if allowedBucketsJSON != "" {
			if err := json.Unmarshal([]byte(allowedBucketsJSON), &script.AllowedBuckets); err != nil {
				return nil, fmt.Errorf("failed to unmarshal allowed buckets: %w", err)
			}
		}

		scripts = append(scripts, &script)
	}

	return scripts, nil
}

// CreateExecution creates a new execution record.
func (s *SQLStore) CreateExecution(ctx context.Context, exec *ScriptExecution) error {
	query := `
		INSERT INTO script_executions (
			script_id, started_at, state
		) VALUES (?, ?, ?)
	`

	result, err := s.db.ExecContext(ctx, query,
		exec.ScriptID,
		exec.StartedAt,
		exec.State,
	)
	if err != nil {
		return fmt.Errorf("failed to insert execution: %w", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return fmt.Errorf("failed to get last insert ID: %w", err)
	}

	exec.ID = id
	return nil
}

// UpdateExecution updates an execution record.
func (s *SQLStore) UpdateExecution(ctx context.Context, exec *ScriptExecution) error {
	query := `
		UPDATE script_executions SET
			ended_at = ?,
			state = ?,
			result_json = ?,
			error_message = ?,
			duration_ms = ?
		WHERE id = ?
	`

	var endedAt interface{}
	if !exec.EndedAt.IsZero() {
		endedAt = exec.EndedAt
	}

	_, err := s.db.ExecContext(ctx, query,
		endedAt,
		exec.State,
		exec.ResultJSON,
		exec.ErrorMessage,
		exec.DurationMS,
		exec.ID,
	)
	if err != nil {
		return fmt.Errorf("failed to update execution: %w", err)
	}

	return nil
}

// GetExecution retrieves an execution by ID.
func (s *SQLStore) GetExecution(ctx context.Context, id int64) (*ScriptExecution, error) {
	query := `
		SELECT e.id, e.script_id, s.name, e.started_at, e.ended_at,
			e.state, e.result_json, e.error_message, e.duration_ms
		FROM script_executions e
		JOIN scripts s ON e.script_id = s.id
		WHERE e.id = ?
	`

	var exec ScriptExecution
	var endedAt sql.NullTime
	var resultJSON, errorMsg sql.NullString
	var durationMS sql.NullInt64

	err := s.db.QueryRowContext(ctx, query, id).Scan(
		&exec.ID,
		&exec.ScriptID,
		&exec.ScriptName,
		&exec.StartedAt,
		&endedAt,
		&exec.State,
		&resultJSON,
		&errorMsg,
		&durationMS,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("execution not found")
		}
		return nil, fmt.Errorf("failed to get execution: %w", err)
	}

	if endedAt.Valid {
		exec.EndedAt = endedAt.Time
	}
	if resultJSON.Valid {
		exec.ResultJSON = resultJSON.String
	}
	if errorMsg.Valid {
		exec.ErrorMessage = errorMsg.String
	}
	if durationMS.Valid {
		exec.DurationMS = durationMS.Int64
	}

	return &exec, nil
}

// ListExecutions returns execution history.
func (s *SQLStore) ListExecutions(ctx context.Context, scriptName string, limit, offset uint32) ([]*ScriptExecution, error) {
	var query string
	var args []interface{}

	if scriptName != "" {
		query = `
			SELECT e.id, e.script_id, s.name, e.started_at, e.ended_at,
				e.state, e.result_json, e.error_message, e.duration_ms
			FROM script_executions e
			JOIN scripts s ON e.script_id = s.id
			WHERE s.name = ?
			ORDER BY e.started_at DESC
			LIMIT ? OFFSET ?
		`
		args = []interface{}{scriptName, limit, offset}
	} else {
		query = `
			SELECT e.id, e.script_id, s.name, e.started_at, e.ended_at,
				e.state, e.result_json, e.error_message, e.duration_ms
			FROM script_executions e
			JOIN scripts s ON e.script_id = s.id
			ORDER BY e.started_at DESC
			LIMIT ? OFFSET ?
		`
		args = []interface{}{limit, offset}
	}

	rows, err := s.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query executions: %w", err)
	}
	defer rows.Close()

	var executions []*ScriptExecution
	for rows.Next() {
		var exec ScriptExecution
		var endedAt sql.NullTime
		var resultJSON, errorMsg sql.NullString
		var durationMS sql.NullInt64

		err := rows.Scan(
			&exec.ID,
			&exec.ScriptID,
			&exec.ScriptName,
			&exec.StartedAt,
			&endedAt,
			&exec.State,
			&resultJSON,
			&errorMsg,
			&durationMS,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan execution: %w", err)
		}

		if endedAt.Valid {
			exec.EndedAt = endedAt.Time
		}
		if resultJSON.Valid {
			exec.ResultJSON = resultJSON.String
		}
		if errorMsg.Valid {
			exec.ErrorMessage = errorMsg.String
		}
		if durationMS.Valid {
			exec.DurationMS = durationMS.Int64
		}

		executions = append(executions, &exec)
	}

	return executions, nil
}

// MarkRunning marks a script as running.
func (s *SQLStore) MarkRunning(ctx context.Context, scriptID, executionID int64) error {
	query := `
		INSERT INTO running_scripts (script_id, execution_id, started_at)
		VALUES (?, ?, ?)
	`

	_, err := s.db.ExecContext(ctx, query, scriptID, executionID, time.Now())
	if err != nil {
		return fmt.Errorf("failed to mark running: %w", err)
	}

	return nil
}

// MarkStopped removes a script from the running list.
func (s *SQLStore) MarkStopped(ctx context.Context, scriptID int64) error {
	query := `DELETE FROM running_scripts WHERE script_id = ?`
	_, err := s.db.ExecContext(ctx, query, scriptID)
	return err
}

// GetRunningScripts returns all currently running scripts.
func (s *SQLStore) GetRunningScripts(ctx context.Context) ([]*RunningScript, error) {
	query := `
		SELECT r.script_id, s.name, r.execution_id, r.started_at
		FROM running_scripts r
		JOIN scripts s ON r.script_id = s.id
	`

	rows, err := s.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query running scripts: %w", err)
	}
	defer rows.Close()

	var running []*RunningScript
	for rows.Next() {
		var r RunningScript
		err := rows.Scan(
			&r.ScriptID,
			&r.ScriptName,
			&r.ExecutionID,
			&r.StartedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan running script: %w", err)
		}
		running = append(running, &r)
	}

	return running, nil
}

// IsScriptRunning checks if a script is currently running.
func (s *SQLStore) IsScriptRunning(ctx context.Context, scriptID int64) (bool, error) {
	query := `SELECT COUNT(*) FROM running_scripts WHERE script_id = ?`

	var count int
	err := s.db.QueryRowContext(ctx, query, scriptID).Scan(&count)
	if err != nil {
		return false, fmt.Errorf("failed to check running: %w", err)
	}

	return count > 0, nil
}

// Close closes the store.
func (s *SQLStore) Close() error {
	return s.db.Close()
}

// KVGet retrieves a value from the KV store.
func (s *SQLStore) KVGet(ctx context.Context, bucket, key string) ([]byte, error) {
	query := `SELECT value FROM script_kv_store WHERE bucket = ? AND key = ?`

	var value []byte
	err := s.db.QueryRowContext(ctx, query, bucket, key).Scan(&value)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("not found")
		}
		return nil, fmt.Errorf("failed to get KV: %w", err)
	}

	return value, nil
}

// KVPut stores a value in the KV store.
func (s *SQLStore) KVPut(ctx context.Context, bucket, key string, value []byte) error {
	now := time.Now()

	query := `
		INSERT INTO script_kv_store (bucket, key, value, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?)
		ON CONFLICT(bucket, key) DO UPDATE SET
			value = excluded.value,
			updated_at = excluded.updated_at
	`

	_, err := s.db.ExecContext(ctx, query, bucket, key, value, now, now)
	if err != nil {
		return fmt.Errorf("failed to put KV: %w", err)
	}

	return nil
}

// KVDelete removes a value from the KV store.
func (s *SQLStore) KVDelete(ctx context.Context, bucket, key string) error {
	query := `DELETE FROM script_kv_store WHERE bucket = ? AND key = ?`
	_, err := s.db.ExecContext(ctx, query, bucket, key)
	return err
}

// KVList returns all keys in a bucket matching the prefix.
func (s *SQLStore) KVList(ctx context.Context, bucket, prefix string) ([]string, error) {
	query := `SELECT key FROM script_kv_store WHERE bucket = ? AND key LIKE ?`

	rows, err := s.db.QueryContext(ctx, query, bucket, prefix+"%")
	if err != nil {
		return nil, fmt.Errorf("failed to list KV: %w", err)
	}
	defer rows.Close()

	var keys []string
	for rows.Next() {
		var key string
		if err := rows.Scan(&key); err != nil {
			return nil, fmt.Errorf("failed to scan key: %w", err)
		}
		keys = append(keys, key)
	}

	return keys, nil
}

// KVDeleteBucket deletes all keys in a bucket.
func (s *SQLStore) KVDeleteBucket(ctx context.Context, bucket string) error {
	query := `DELETE FROM script_kv_store WHERE bucket = ?`
	_, err := s.db.ExecContext(ctx, query, bucket)
	return err
}
