package migtest

import (
	"fmt"
	"path/filepath"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
	"go.etcd.io/bbolt"
)

const (
	// dbFilePermission is the default permission the rules' database file
	// is created with.
	dbFilePermission = 0600
)

// MakeDB creates a new instance of the firewall DB for testing purposes.
func MakeDB(t *testing.T) *bbolt.DB {
	dir := t.TempDir()
	path := filepath.Join(dir, "test.db")

	db, err := bbolt.Open(path, dbFilePermission, &bbolt.Options{
		Timeout: time.Second * 5,
	})
	require.NoError(t, err)

	return db
}

// ApplyMigration is a helper test function that encapsulates the general steps
// which are needed to properly check the result of applying migration function.
func ApplyMigration(t *testing.T, beforeMigration, afterMigration,
	migrationFunc func(tx *bbolt.Tx) error, shouldFail bool) {

	t.Helper()

	db := MakeDB(t)

	// beforeMigration is usually used for populating the database with
	// test data.
	require.NoError(t, db.Update(beforeMigration))

	defer func() {
		t.Helper()

		var err error
		if r := recover(); r != nil {
			err = newError(r)
		}

		if shouldFail {
			require.Error(t, err)
		} else {
			require.NoError(t, err)
		}

		// afterMigration usually used for checking the database state
		// and throwing the error if something went wrong.
		err = db.Update(afterMigration)
		require.NoError(t, err)
	}()

	// Apply migration.
	require.NoError(t, db.Update(migrationFunc))
}

func newError(e interface{}) error {
	var err error
	switch e := e.(type) {
	case error:
		err = e
	default:
		err = fmt.Errorf("%v", e)
	}

	return err
}
