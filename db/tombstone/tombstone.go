package tombstone

import (
	"bytes"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"go.etcd.io/bbolt"
)

var (
	// MigrationTombstoneKey marks a legacy kvdb bucket as permanently
	// closed after its contents were migrated to SQL.
	MigrationTombstoneKey = []byte("data-migration-tombstone")

	// migrationTombstoneValue is the static value written for a tombstone
	// marker.
	migrationTombstoneValue = []byte("1")

	// ErrKVDBDeprecated signals that the legacy kvdb database was already
	// migrated to SQL and should not be opened again for normal use.
	ErrKVDBDeprecated = errors.New("kvdb database has been migrated to " +
		"SQL and can no longer be used")
)

const (
	// dbFilePermission is the default permission the legacy bbolt database
	// file is created with if bbolt ends up creating it during open. The
	// deprecation helper guards against that by checking for file existence
	// first, so this mode mainly documents the intended permission.
	dbFilePermission = 0600
)

// KVDBFileExists reports whether the legacy bbolt database file exists at the
// given path. This only checks file presence and intentionally ignores any
// tombstone state inside the database.
func KVDBFileExists(path string) (bool, error) {
	fi, err := os.Stat(path)
	switch {
	case err == nil:
		return !fi.IsDir(), nil

	case os.IsNotExist(err):
		return false, nil

	default:
		return false, err
	}
}

// DeprecateKVDB marks the given legacy bbolt database as deprecated by
// writing the migration tombstone marker into the specified top-level bucket.
func DeprecateKVDB(path string, timeout time.Duration, bucketKey []byte) error {
	exists, err := KVDBFileExists(path)
	if err != nil {
		return err
	}
	if !exists {
		return nil
	}

	db, err := bbolt.Open(path, dbFilePermission, &bbolt.Options{
		Timeout: timeout,
	})
	if err != nil {
		return err
	}

	defer db.Close()

	return setBoltBucketTombstone(db, bucketKey)
}

// CheckKVDBDeprecated returns a clear error if the legacy bbolt database at
// the given path was marked as deprecated. Missing files are treated as not
// deprecated so callers can continue with first-time initialization.
func CheckKVDBDeprecated(path string, bucketKey []byte,
	timeout time.Duration) error {

	exists, err := KVDBFileExists(path)
	if err != nil {
		return err
	}
	if !exists {
		return nil
	}

	db, err := bbolt.Open(path, dbFilePermission, &bbolt.Options{
		Timeout: timeout,
	})
	if err != nil {
		return err
	}

	defer db.Close()

	deprecated, err := isBoltBucketTombstoned(db, bucketKey)
	if err != nil {
		return err
	}

	if deprecated {
		return fmt.Errorf("%w: %s", ErrKVDBDeprecated,
			filepath.Base(path))
	}

	return nil
}

// HasActiveKVDB reports whether the legacy bbolt database at the given path
// exists and has not yet been tombstoned by a SQL migration in the specified
// top-level bucket. A missing file or a tombstoned database is reported as
// inactive, so callers can use this to detect kvdb state that is still pending
// migration to SQL.
func HasActiveKVDB(path string, bucketKey []byte,
	timeout time.Duration) (bool, error) {

	exists, err := KVDBFileExists(path)
	if err != nil {
		return false, err
	}
	if !exists {
		return false, nil
	}

	err = CheckKVDBDeprecated(path, bucketKey, timeout)
	switch {
	case errors.Is(err, ErrKVDBDeprecated):
		return false, nil

	case err != nil:
		return false, err

	default:
		return true, nil
	}
}

// IsMigrationTombstoneKey returns true if the given key is the kvdb migration
// tombstone marker.
func IsMigrationTombstoneKey(key []byte) bool {
	return bytes.Equal(key, MigrationTombstoneKey)
}

// setBoltBucketTombstone writes the migration tombstone key into the given
// top-level bucket of a bbolt backend.
func setBoltBucketTombstone(db *bbolt.DB, bucketKey []byte) error {
	return db.Update(func(tx *bbolt.Tx) error {
		bucket, err := tx.CreateBucketIfNotExists(bucketKey)
		if err != nil {
			return err
		}

		return bucket.Put(
			MigrationTombstoneKey, migrationTombstoneValue,
		)
	})
}

// isBoltBucketTombstoned reports whether the given top-level bucket of a
// bbolt backend contains the migration tombstone marker.
func isBoltBucketTombstoned(db *bbolt.DB, bucketKey []byte) (bool, error) {
	var tombstoneExists bool

	err := db.View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket(bucketKey)
		if bucket == nil {
			return nil
		}

		tombstone := bucket.Get(MigrationTombstoneKey)
		tombstoneExists = tombstone != nil

		return nil
	})
	if err != nil {
		return false, err
	}

	return tombstoneExists, nil
}
