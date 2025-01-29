package db

import (
	"errors"
	"fmt"
	"strings"

	"github.com/jackc/pgconn"
	"github.com/jackc/pgerrcode"
	"modernc.org/sqlite"
	sqlite3 "modernc.org/sqlite/lib"
)

var (
	// ErrRetriesExceeded is returned when a transaction is retried more
	// than the max allowed valued without a success.
	ErrRetriesExceeded = errors.New("db tx retries exceeded")
)

// MapSQLError attempts to interpret a given error as a database agnostic SQL
// error.
func MapSQLError(err error) error {
	// Attempt to interpret the error as a sqlite error.
	var sqliteErr *sqlite.Error
	if errors.As(err, &sqliteErr) {
		return parseSqliteError(sqliteErr)
	}

	// Attempt to interpret the error as a postgres error.
	var pqErr *pgconn.PgError
	if errors.As(err, &pqErr) {
		return parsePostgresError(pqErr)
	}

	// Return original error if it could not be classified as a database
	// specific error.
	return err
}

// parseSqliteError attempts to parse a sqlite error as a database agnostic
// SQL error.
func parseSqliteError(sqliteErr *sqlite.Error) error {
	switch sqliteErr.Code() {
	// Handle unique constraint violation error.
	case sqlite3.SQLITE_CONSTRAINT_UNIQUE:
		return &ErrSqlUniqueConstraintViolation{
			DbError: sqliteErr,
		}

	// Database is currently busy, so we'll need to try again.
	case sqlite3.SQLITE_BUSY:
		return &ErrSerializationError{
			DbError: sqliteErr,
		}

	// A write operation could not continue because of a conflict within the
	// same database connection.
	case sqlite3.SQLITE_LOCKED:
		return &ErrDeadlockError{
			DbError: sqliteErr,
		}

	// Generic error, need to parse the message further.
	case sqlite3.SQLITE_ERROR:
		errMsg := sqliteErr.Error()

		switch {
		case strings.Contains(errMsg, "no such table"):
			return &ErrSchemaError{
				DbError: sqliteErr,
			}

		default:
			return fmt.Errorf("unknown sqlite error: %w", sqliteErr)
		}

	default:
		return fmt.Errorf("unknown sqlite error: %w", sqliteErr)
	}
}

// parsePostgresError attempts to parse a postgres error as a database agnostic
// SQL error.
func parsePostgresError(pqErr *pgconn.PgError) error {
	switch pqErr.Code {
	// Handle unique constraint violation error.
	case pgerrcode.UniqueViolation:
		return &ErrSqlUniqueConstraintViolation{
			DbError: pqErr,
		}

	// Unable to serialize the transaction, so we'll need to try again.
	case pgerrcode.SerializationFailure:
		return &ErrSerializationError{
			DbError: pqErr,
		}

	// A write operation could not continue because of a conflict within the
	// same database connection.
	case pgerrcode.DeadlockDetected:
		return &ErrDeadlockError{
			DbError: pqErr,
		}

	// Handle schema error.
	case pgerrcode.UndefinedColumn, pgerrcode.UndefinedTable:
		return &ErrSchemaError{
			DbError: pqErr,
		}

	default:
		return fmt.Errorf("unknown postgres error: %w", pqErr)
	}
}

// ErrSqlUniqueConstraintViolation is an error type which represents a database
// agnostic SQL unique constraint violation.
type ErrSqlUniqueConstraintViolation struct {
	DbError error
}

func (e ErrSqlUniqueConstraintViolation) Error() string {
	return fmt.Sprintf("sql unique constraint violation: %v", e.DbError)
}

// ErrSerializationError is an error type which represents a database agnostic
// error that a transaction couldn't be serialized with other concurrent db
// transactions.
type ErrSerializationError struct {
	DbError error
}

// Unwrap returns the wrapped error.
func (e ErrSerializationError) Unwrap() error {
	return e.DbError
}

// Error returns the error message.
func (e ErrSerializationError) Error() string {
	return e.DbError.Error()
}

// ErrDeadlockError is an error type which represents a database agnostic
// error where transactions have led to cyclic dependencies in lock acquisition.
type ErrDeadlockError struct {
	DbError error
}

// Unwrap returns the wrapped error.
func (e ErrDeadlockError) Unwrap() error {
	return e.DbError
}

// Error returns the error message.
func (e ErrDeadlockError) Error() string {
	return e.DbError.Error()
}

// IsSerializationError returns true if the given error is a serialization
// error.
func IsSerializationError(err error) bool {
	var serializationError *ErrSerializationError
	return errors.As(err, &serializationError)
}

// IsDeadlockError returns true if the given error is a deadlock error.
func IsDeadlockError(err error) bool {
	var deadlockError *ErrDeadlockError
	return errors.As(err, &deadlockError)
}

// IsSerializationOrDeadlockError returns true if the given error is either a
// deadlock error or a serialization error.
func IsSerializationOrDeadlockError(err error) bool {
	return IsDeadlockError(err) || IsSerializationError(err)
}

// ErrSchemaError is an error type which represents a database agnostic error
// that the schema of the database is incorrect for the given query.
type ErrSchemaError struct {
	DbError error
}

// Unwrap returns the wrapped error.
func (e ErrSchemaError) Unwrap() error {
	return e.DbError
}

// Error returns the error message.
func (e ErrSchemaError) Error() string {
	return e.DbError.Error()
}

// IsSchemaError returns true if the given error is a schema error.
func IsSchemaError(err error) bool {
	var schemaError *ErrSchemaError
	return errors.As(err, &schemaError)
}
