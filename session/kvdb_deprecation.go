package session

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"

	"go.etcd.io/bbolt"
)

const deprecatedDBVersion = ^uint32(0)

var (
	// ErrKVDBDeprecated signals that the legacy kvdb database was already
	// migrated to SQL and should not be opened again.
	ErrKVDBDeprecated = errors.New("kvdb database has been migrated to " +
		"SQL and can no longer be used")
)

// DeprecateKVDB marks the session kvdb file as deprecated after a successful
// SQL migration. It does so by writing a sentinel database version value of
// `^uint32(0)` into the metadata bucket. Session startup reads that metadata
// version before opening the store for normal use, so the sentinel version
// cleanly blocks the kvdb backend while still leaving the file available for
// explicit migration reruns.
func DeprecateKVDB(path string) error {
	if _, err := os.Stat(path); os.IsNotExist(err) {
		return nil
	}

	db, err := bbolt.Open(path, dbFilePermission, &bbolt.Options{
		Timeout: DefaultSessionDBTimeout,
	})
	if err != nil {
		return err
	}
	defer db.Close()

	return db.Update(func(tx *bbolt.Tx) error {
		metadataBucket, err := tx.CreateBucketIfNotExists(
			metadataBucketKey,
		)
		if err != nil {
			return err
		}

		return setDBVersion(metadataBucket, deprecatedDBVersion)
	})
}

// CheckKVDBDeprecated returns a clear error if the session kvdb file was
// marked as deprecated.
func CheckKVDBDeprecated(path string) error {
	if _, err := os.Stat(path); os.IsNotExist(err) {
		return nil
	}

	db, err := bbolt.Open(path, dbFilePermission, &bbolt.Options{
		Timeout: DefaultSessionDBTimeout,
	})
	if err != nil {
		return err
	}
	defer db.Close()

	var deprecated bool
	err = db.View(func(tx *bbolt.Tx) error {
		metadataBucket := tx.Bucket(metadataBucketKey)
		if metadataBucket == nil {
			return nil
		}

		version, err := getDBVersion(metadataBucket)
		if err != nil {
			return err
		}

		deprecated = version == deprecatedDBVersion
		return nil
	})
	if err != nil {
		return err
	}

	if deprecated {
		return fmt.Errorf(
			"%w: %s", ErrKVDBDeprecated, filepath.Base(path),
		)
	}

	return nil
}

// checkKVDBDeprecated returns a clear error if the opened session kvdb was
// marked as deprecated.
func checkKVDBDeprecated(db *bbolt.DB, path string) error {
	var deprecated bool
	err := db.View(func(tx *bbolt.Tx) error {
		metadataBucket := tx.Bucket(metadataBucketKey)
		if metadataBucket == nil {
			return nil
		}

		version, err := getDBVersion(metadataBucket)
		if err != nil {
			return err
		}

		deprecated = version == deprecatedDBVersion
		return nil
	})
	if err != nil {
		return err
	}

	if deprecated {
		return fmt.Errorf(
			"%w: %s", ErrKVDBDeprecated, filepath.Base(path),
		)
	}

	return nil
}
