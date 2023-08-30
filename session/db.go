package session

import (
	"encoding/binary"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"go.etcd.io/bbolt"
)

const (
	// DBFilename is the default filename of the session database.
	DBFilename = "session.db"

	// dbFilePermission is the default permission the session database file
	// is created with.
	dbFilePermission = 0600

	// DefaultSessionDBTimeout is the default maximum time we wait for the
	// session bbolt database to be opened. If the database is already
	// opened by another process, the unique lock cannot be obtained. With
	// the timeout we error out after the given time instead of just
	// blocking for forever.
	DefaultSessionDBTimeout = 5 * time.Second
)

var (
	// byteOrder is the default byte order we'll use for serialization
	// within the database.
	byteOrder = binary.BigEndian
)

// DB is a bolt-backed persistent store.
type DB struct {
	*bbolt.DB
}

// A compile-time check to ensure that DB implements the Store interface.
var _ Store = (*DB)(nil)

// NewDB creates a new bolt database that can be found at the given directory.
func NewDB(dir, fileName string) (*DB, error) {
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

	return &DB{DB: db}, nil
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
		Timeout: DefaultSessionDBTimeout,
	})
	if err == bbolt.ErrTimeout {
		return nil, fmt.Errorf("error while trying to open %s: timed "+
			"out after %v when trying to obtain exclusive lock",
			filepath, DefaultSessionDBTimeout)
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

		sessionBkt, err := tx.CreateBucketIfNotExists(sessionBucketKey)
		if err != nil {
			return err
		}

		_, err = sessionBkt.CreateBucketIfNotExists(idIndexKey)
		if err != nil {
			return err
		}

		_, err = sessionBkt.CreateBucketIfNotExists(groupIDIndexKey)

		return err
	})
	if err != nil {
		return nil, err
	}

	return db, nil
}
