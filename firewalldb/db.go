package firewalldb

import (
	"encoding/binary"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/lightninglabs/lightning-terminal/session"
	"go.etcd.io/bbolt"
)

const (
	// DBFilename is the default filename of the rules' database.
	DBFilename = "rules.db"

	// dbFilePermission is the default permission the rules' database file
	// is created with.
	dbFilePermission = 0600

	// DefaultRulesDBTimeout is the default maximum time we wait for the
	// db bbolt database to be opened. If the database is already
	// opened by another process, the unique lock cannot be obtained. With
	// the timeout we error out after the given time instead of just
	// blocking for forever.
	DefaultRulesDBTimeout = 5 * time.Second
)

var (
	// byteOrder is the default byte order we'll use for serialization
	// within the database.
	byteOrder = binary.BigEndian

	// ErrNoSuchKeyFound is returned when there is no key-value pair found
	// for the given key.
	ErrNoSuchKeyFound = fmt.Errorf("no such key found")
)

// DB is a bolt-backed persistent store.
type DB struct {
	*bbolt.DB

	sessionIDIndex session.IDToGroupIndex
}

// NewDB creates a new bolt database that can be found at the given directory.
func NewDB(dir, fileName string, sessionIDIndex session.IDToGroupIndex) (*DB,
	error) {

	firstInit := false
	path := filepath.Join(dir, fileName)

	// If the database file does not exist yet, create its directory.
	if !fileExists(path) {
		if err := os.MkdirAll(dir, 0700); err != nil {
			return nil, err
		}
		firstInit = true
	}

	db, err := initDB(path, firstInit)
	if err != nil {
		return nil, err
	}

	// Attempt to sync the database's current version with the latest known
	// version available.
	if err := syncVersions(db); err != nil {
		return nil, err
	}

	return &DB{
		DB:             db,
		sessionIDIndex: sessionIDIndex,
	}, nil
}

// fileExists reports whether the named file or directory exists.
func fileExists(path string) bool {
	if _, err := os.Stat(path); err != nil {
		if os.IsNotExist(err) {
			return false
		}
	}
	return true
}

// initDB initializes all the required top-level buckets for the database.
func initDB(filepath string, firstInit bool) (*bbolt.DB, error) {
	db, err := bbolt.Open(filepath, dbFilePermission, &bbolt.Options{
		Timeout: DefaultRulesDBTimeout,
	})
	if err == bbolt.ErrTimeout {
		return nil, fmt.Errorf("error while trying to open %s: timed "+
			"out after %v when trying to obtain exclusive lock",
			filepath, DefaultRulesDBTimeout)
	}
	if err != nil {
		return nil, err
	}

	err = db.Update(func(tx *bbolt.Tx) error {
		if firstInit {
			metadataBucket, err := tx.CreateBucketIfNotExists(
				metadataBucketKey,
			)
			if err != nil {
				return err
			}
			err = setDBVersion(metadataBucket, latestDBVersion)
			if err != nil {
				return err
			}
		}

		rulesBucket, err := tx.CreateBucketIfNotExists(rulesBucketKey)
		if err != nil {
			return err
		}

		// Delete everything under the "temp" key if such a bucket
		// exists.
		err = rulesBucket.DeleteBucket(tempBucketKey)
		if err != nil && !errors.Is(err, bbolt.ErrBucketNotFound) {
			return err
		}

		actionsBucket, err := tx.CreateBucketIfNotExists(
			actionsBucketKey,
		)
		if err != nil {
			return err
		}

		_, err = actionsBucket.CreateBucketIfNotExists(actionsKey)
		if err != nil {
			return err
		}

		_, err = actionsBucket.CreateBucketIfNotExists(actionsIndex)
		if err != nil {
			return err
		}

		_, err = tx.CreateBucketIfNotExists(privacyBucketKey)
		return err
	})
	if err != nil {
		return nil, err
	}

	return db, nil
}
