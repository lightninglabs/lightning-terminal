package db

import (
	"errors"
	"fmt"
	"reflect"
	"testing"

	"github.com/stretchr/testify/require"
)

// errSentinel stands in for the driver error that the mapped error types wrap.
var errSentinel = errors.New("underlying driver failure")

// TestMappedErrorsOnlyImplementErrorAsPointers asserts that each mapped SQL
// error type satisfies the error interface through its pointer type only.
//
// MapSQLError constructs every one of these types as a pointer, and the
// IsSerializationError, IsDeadlockError and IsSchemaError helpers match on the
// pointer type. If the methods were declared on the value receiver instead,
// the value type would satisfy error as well, and a caller matching against
// the value type would silently never match. Go 1.27's printf analysis reports
// exactly that hazard when such a value is wrapped with %w.
func TestMappedErrorsOnlyImplementErrorAsPointers(t *testing.T) {
	t.Parallel()

	errType := reflect.TypeOf((*error)(nil)).Elem()

	values := []any{
		ErrSqlUniqueConstraintViolation{},
		ErrSerializationError{},
		ErrDeadlockError{},
		ErrSchemaError{},
	}

	const valueErrMsg = "%s must not implement error as a value; " +
		"declare Error and Unwrap on the pointer receiver so that " +
		"matching on the value type is a compile error rather than " +
		"a silent mismatch"

	for _, value := range values {
		valueType := reflect.TypeOf(value)
		ptrType := reflect.PointerTo(valueType)
		name := valueType.Name()

		t.Run(name, func(t *testing.T) {
			t.Parallel()

			require.Truef(
				t, ptrType.Implements(errType),
				"*%s must implement error", name,
			)

			require.Falsef(
				t, valueType.Implements(errType),
				valueErrMsg, name,
			)
		})
	}
}

// TestWrappedErrorMatching asserts that the mapped SQL error types stay
// discoverable with errors.As and errors.Is once they have been wrapped with
// %w, which is how callers such as the session store add context to them.
func TestWrappedErrorMatching(t *testing.T) {
	t.Parallel()

	t.Run("unique constraint violation", func(t *testing.T) {
		t.Parallel()

		mapped := error(&ErrSqlUniqueConstraintViolation{
			DbError: errSentinel,
		})
		wrapped := fmt.Errorf("adding session: %w", mapped)

		var target *ErrSqlUniqueConstraintViolation
		require.True(t, errors.As(wrapped, &target))
		require.Equal(t, errSentinel, target.DbError)
	})

	// The remaining types additionally declare Unwrap, so the driver error
	// stays reachable through both the %w wrap and the mapped error.
	unwrappable := []struct {
		name   string
		mapped error
		match  func(error) bool
	}{
		{
			name: "serialization error",
			mapped: &ErrSerializationError{
				DbError: errSentinel,
			},
			match: IsSerializationError,
		},
		{
			name: "deadlock error",
			mapped: &ErrDeadlockError{
				DbError: errSentinel,
			},
			match: IsDeadlockError,
		},
		{
			name: "schema error",
			mapped: &ErrSchemaError{
				DbError: errSentinel,
			},
			match: IsSchemaError,
		},
	}

	for _, test := range unwrappable {
		t.Run(test.name, func(t *testing.T) {
			t.Parallel()

			wrapped := fmt.Errorf(
				"executing query: %w", test.mapped,
			)

			require.True(t, test.match(wrapped))
			require.True(t, errors.Is(wrapped, errSentinel))

			// Matching must survive more than one layer of
			// wrapping, since callers add context at several
			// levels.
			deeper := fmt.Errorf("outer: %w", wrapped)
			require.True(t, test.match(deeper))
			require.True(t, errors.Is(deeper, errSentinel))
		})
	}
}

// TestSerializationOrDeadlockMatching asserts the combined helper matches
// either underlying type through a wrap, and does not match unrelated errors.
func TestSerializationOrDeadlockMatching(t *testing.T) {
	t.Parallel()

	serialization := fmt.Errorf(
		"ctx: %w", &ErrSerializationError{DbError: errSentinel},
	)
	require.True(t, IsSerializationOrDeadlockError(serialization))

	deadlock := fmt.Errorf(
		"ctx: %w", &ErrDeadlockError{DbError: errSentinel},
	)
	require.True(t, IsSerializationOrDeadlockError(deadlock))

	schema := fmt.Errorf(
		"ctx: %w", &ErrSchemaError{DbError: errSentinel},
	)
	require.False(t, IsSerializationOrDeadlockError(schema))
	require.False(t, IsSerializationOrDeadlockError(errSentinel))
}
