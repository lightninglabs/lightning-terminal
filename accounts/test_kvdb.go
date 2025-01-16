package accounts

import (
	"errors"
	"testing"

	"github.com/stretchr/testify/require"
)

// ErrDBClosed is an error that is returned when a database operation is
// performed on a closed database.
var ErrDBClosed = errors.New("database not open")

// NewTestDB is a helper function that creates an BBolt database for testing.
func NewTestDB(t *testing.T) *BoltStore {
	return NewTestDBFromPath(t, t.TempDir())
}

// NewTestDBFromPath is a helper function that creates a new BoltStore with a
// connection to an existing BBolt database for testing.
func NewTestDBFromPath(t *testing.T, dbPath string) *BoltStore {
	store, err := NewBoltStore(dbPath, DBFilename)
	require.NoError(t, err)

	t.Cleanup(func() {
		require.NoError(t, store.db.Close())
	})

	return store
}
