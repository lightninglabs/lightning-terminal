package db

import (
	"fmt"
	"testing"

	"github.com/jackc/pgerrcode"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/stretchr/testify/require"
)

// TestMapPostgresErrors verifies that the selected pgx v5 driver preserves
// serialization retries and session uniqueness error classification.
func TestMapPostgresErrors(t *testing.T) {
	t.Parallel()

	for _, tc := range []struct {
		name   string
		code   string
		target any
	}{
		{"serialization", pgerrcode.SerializationFailure,
			new(*ErrSerializationError)},
		{"unique constraint", pgerrcode.UniqueViolation,
			new(*ErrSqlUniqueConstraintViolation)},
	} {
		t.Run(tc.name, func(t *testing.T) {
			driverErr := &pgconn.PgError{Code: tc.code}
			err := MapSQLError(fmt.Errorf(
				"write failed: %w", driverErr,
			))
			require.ErrorAs(t, err, tc.target)
		})
	}
}
