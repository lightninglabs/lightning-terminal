package firewalldb

import (
	"context"
	"encoding/binary"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/lightningnetwork/lnd/clock"
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
)

// BoltDB is a bolt-backed persistent store.
type BoltDB struct {
	*bbolt.DB

	clock clock.Clock

	sessionIDIndex SessionDB
	accountsDB     AccountsDB
}

// NewBoltDB creates a new bolt database that can be found at the given
// directory.
func NewBoltDB(dir, fileName string, sessionIDIndex SessionDB,
	accountsDB AccountsDB, clock clock.Clock) (*BoltDB, error) {

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

	return &BoltDB{
		DB:             db,
		sessionIDIndex: sessionIDIndex,
		accountsDB:     accountsDB,
		clock:          clock,
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

		_, err := tx.CreateBucketIfNotExists(rulesBucketKey)
		if err != nil {
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

// kvdbExecutor is a concrete implementation of the DBExecutor interface that
// uses a bbolt database as its backing store.
type kvdbExecutor[T any] struct {
	db     *bbolt.DB
	wrapTx func(tx *bbolt.Tx) T
}

// Update opens a database read/write transaction and executes the function f
// with the transaction passed as a parameter. After f exits, if f did not
// error, the transaction is committed. Otherwise, if f did error, the
// transaction is rolled back. If the rollback fails, the original error
// returned by f is still returned. If the commit fails, the commit error is
// returned.
//
// NOTE: this is part of the DBExecutor interface.
func (e *kvdbExecutor[T]) Update(ctx context.Context,
	fn func(ctx context.Context, tx T) error) error {

	return e.db.Update(func(tx *bbolt.Tx) error {
		return fn(ctx, e.wrapTx(tx))
	})
}

// View opens a database read transaction and executes the function f with the
// transaction passed as a parameter. After f exits, the transaction is rolled
// back. If f errors, its error is returned, not a rollback error (if any
// occur).
//
// NOTE: this is part of the DBExecutor interface.
func (e *kvdbExecutor[T]) View(ctx context.Context,
	fn func(ctx context.Context, tx T) error) error {

	return e.db.View(func(tx *bbolt.Tx) error {
		return fn(ctx, e.wrapTx(tx))
	})
}
