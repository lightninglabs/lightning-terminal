package accounts

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"

	"github.com/lightningnetwork/lnd/kvdb"
	"go.etcd.io/bbolt"
)

const (
	// dbFilePermission is the default permission the account database file
	// is created with.
	dbFilePermission = 0600
)

var (
	// ErrKVDBDeprecated signals that the legacy kvdb database was already
	// migrated to SQL and should not be opened again.
	ErrKVDBDeprecated = errors.New("kvdb database has been migrated to " +
		"SQL and can no longer be used")

	// deprecatedBucketKey marks a kvdb database as deprecated in a way that
	// older kvdb account readers will fail once they iterate the account
	// bucket.
	deprecatedBucketKey = []byte("kvdb-sql-migrated")

	deprecatedReasonKey = []byte("reason")
)

// DeprecateKVDB marks the accounts kvdb file as deprecated after a successful
// SQL migration. It does so by creating a dedicated tombstone bucket named
// `kvdb-sql-migrated` inside the top-level accounts bucket and storing the
// deprecation reason in that bucket. New code checks for that tombstone before
// opening the accounts kvdb file, while older account readers will fail once
// they iterate the accounts bucket and encounter the unexpected tombstone
// bucket.
func DeprecateKVDB(path string) error {
	if _, err := os.Stat(path); os.IsNotExist(err) {
		return nil
	}

	db, err := bbolt.Open(path, dbFilePermission, &bbolt.Options{
		Timeout: DefaultAccountDBTimeout,
	})
	if err != nil {
		return err
	}
	defer db.Close()

	return db.Update(func(tx *bbolt.Tx) error {
		accountBucket, err := tx.CreateBucketIfNotExists(
			accountBucketName,
		)
		if err != nil {
			return err
		}

		deprecatedBucket, err := accountBucket.CreateBucketIfNotExists(
			deprecatedBucketKey,
		)
		if err != nil {
			return err
		}

		return deprecatedBucket.Put(
			deprecatedReasonKey, []byte(ErrKVDBDeprecated.Error()),
		)
	})
}

// CheckKVDBDeprecated returns a clear error if the accounts kvdb file was
// marked as deprecated.
func CheckKVDBDeprecated(path string) error {
	if _, err := os.Stat(path); os.IsNotExist(err) {
		return nil
	}

	db, err := bbolt.Open(path, dbFilePermission, &bbolt.Options{
		Timeout: DefaultAccountDBTimeout,
	})
	if err != nil {
		return err
	}
	defer db.Close()

	var deprecated bool
	err = db.View(func(tx *bbolt.Tx) error {
		accountBucket := tx.Bucket(accountBucketName)
		if accountBucket == nil {
			return nil
		}

		deprecated = accountBucket.Bucket(deprecatedBucketKey) != nil
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

// checkKVDBDeprecated returns a clear error if the opened accounts kvdb was
// marked as deprecated.
func checkKVDBDeprecated(db kvdb.Backend, path string) error {
	var deprecated bool
	err := kvdb.View(db, func(tx kvdb.RTx) error {
		accountBucket := tx.ReadBucket(accountBucketName)
		if accountBucket == nil {
			return nil
		}

		deprecated = accountBucket.NestedReadBucket(
			deprecatedBucketKey,
		) != nil
		return nil
	}, func() {})
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
