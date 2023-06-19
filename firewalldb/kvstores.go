package firewalldb

import (
	"context"

	"github.com/lightninglabs/lightning-terminal/session"
	"go.etcd.io/bbolt"
)

/*
The KVStores are stored in the following structure in the KV db. Note that
the `perm` and `temp` buckets are identical in structure. The only difference is
that the `temp` bucket is cleared on restart of the db.

rules -> perm -> rule-name -> global   -> {k:v}
              -> sessions -> group ID  -> session-kv-store  -> {k:v}
			               -> feature-kv-stores -> feature-name -> {k:v}

      -> temp -> rule-name -> global   -> {k:v}
	      -> sessions -> group ID  -> session-kv-store  -> {k:v}
				       -> feature-kv-stores -> feature-name -> {k:v}
*/

var (
	// rulesBucketKey is the key under which all things rule-kvstore
	// related will fall.
	rulesBucketKey = []byte("rules")

	// permBucketKey is a sub bucket under the rules bucket. Everything
	// stored under this key is persisted across restarts.
	permBucketKey = []byte("perm")

	// tempBucketKey is a sub bucket under the rules bucket. Everything
	// stored under this key is cleared on restart of the db.
	tempBucketKey = []byte("temp")

	// globalKVStoreBucketKey is a key under which a kv store is that will
	// always be available to a specific rule regardless of which session
	// or feature is being evaluated.
	globalKVStoreBucketKey = []byte("global")

	// sessKVStoreBucketKey is the key under which a session wide kv store
	// for the rule is stored.
	sessKVStoreBucketKey = []byte("session-kv-store")

	// featureKVStoreBucketKey is the kye under which a kv store specific
	// the group id and feature name is stored.
	featureKVStoreBucketKey = []byte("feature-kv-store")
)

// KVStores provides an Update and View method that will allow the caller to
// perform atomic read and write transactions on and of the key value stores
// offered the KVStoreTx.
type KVStores interface {
	// Update opens a database read/write transaction and executes the
	// function f with the transaction passed as a parameter. After f exits,
	// if f did not error, the transaction is committed. Otherwise, if f did
	// error, the transaction is rolled back. If the rollback fails, the
	// original error returned by f is still returned. If the commit fails,
	// the commit error is returned.
	Update(f func(tx KVStoreTx) error) error

	// View opens a database read transaction and executes the function f
	// with the transaction passed as a parameter. After f exits, the
	// transaction is rolled back. If f errors, its error is returned, not a
	// rollback error (if any occur).
	View(f func(tx KVStoreTx) error) error
}

// KVStoreTx represents a database transaction that can be used for both read
// and writes of the various different key value stores offered for the rule.
type KVStoreTx interface {
	// Global returns a persisted global, rule-name indexed, kv store. A
	// rule with a given name will have access to this store independent of
	// group ID or feature.
	Global() KVStore

	// Local returns a persisted local kv store for the rule. Depending on
	// how the implementation is initialised, this will either be under the
	// group ID namespace or the group ID _and_ feature name namespace.
	Local() KVStore

	// GlobalTemp is similar to the Global store except that its contents
	// is cleared upon restart of the database.
	GlobalTemp() KVStore

	// LocalTemp is similar to the Local store except that its contents is
	// cleared upon restart of the database.
	LocalTemp() KVStore
}

// KVStore is in interface representing a key value store. It allows us to
// abstract away the details of the data storage method.
type KVStore interface {
	// Get fetches the value under the given key from the underlying kv
	// store. If no value is found, nil is returned.
	Get(ctx context.Context, key string) ([]byte, error)

	// Set sets the given key-value pair in the underlying kv store.
	Set(ctx context.Context, key string, value []byte) error

	// Del deletes the value under the given key in the underlying kv store.
	Del(ctx context.Context, key string) error
}

// RulesDB can be used to initialise a new rules.KVStores.
type RulesDB interface {
	GetKVStores(rule string, groupID session.ID, feature string) KVStores
}

// GetKVStores constructs a new rules.KVStores backed by a bbolt db.
func (db *DB) GetKVStores(rule string, groupID session.ID,
	feature string) KVStores {

	return &kvStores{
		DB:          db,
		ruleName:    rule,
		groupID:     groupID,
		featureName: feature,
	}
}

// kvStores implements the rules.KVStores interface.
type kvStores struct {
	*DB
	ruleName    string
	groupID     session.ID
	featureName string
}

// beginTx starts db transaction. The transaction will be a read or read-write
// transaction depending on the value of the `writable` parameter.
func (s *kvStores) beginTx(writable bool) (*kvStoreTx, error) {
	boltTx, err := s.Begin(writable)
	if err != nil {
		return nil, err
	}
	return &kvStoreTx{
		kvStores: s,
		boltTx:   boltTx,
	}, nil
}

// Update opens a database read/write transaction and executes the function f
// with the transaction passed as a parameter. After f exits, if f did not
// error, the transaction is committed. Otherwise, if f did error, the
// transaction is rolled back. If the rollback fails, the original error
// returned by f is still returned. If the commit fails, the commit error is
// returned.
//
// NOTE: this is part of the KVStores interface.
func (s *kvStores) Update(f func(tx KVStoreTx) error) error {
	tx, err := s.beginTx(true)
	if err != nil {
		return err
	}

	// Make sure the transaction rolls back in the event of a panic.
	defer func() {
		if tx != nil {
			_ = tx.boltTx.Rollback()
		}
	}()

	err = f(tx)
	if err != nil {
		// Want to return the original error, not a rollback error if
		// any occur.
		_ = tx.boltTx.Rollback()
		return err
	}

	return tx.boltTx.Commit()
}

// View opens a database read transaction and executes the function f with the
// transaction passed as a parameter. After f exits, the transaction is rolled
// back. If f errors, its error is returned, not a rollback error (if any
// occur).
//
// NOTE: this is part of the KVStores interface.
func (s *kvStores) View(f func(tx KVStoreTx) error) error {
	tx, err := s.beginTx(false)
	if err != nil {
		return err
	}

	// Make sure the transaction rolls back in the event of a panic.
	defer func() {
		if tx != nil {
			_ = tx.boltTx.Rollback()
		}
	}()

	err = f(tx)
	rollbackErr := tx.boltTx.Rollback()
	if err != nil {
		return err
	}

	if rollbackErr != nil {
		return rollbackErr
	}
	return nil
}

// getBucketFunc defines the signature of the bucket creation/fetching function
// required by kvStoreTx. If create is true, then all the bucket (and all
// buckets leading up to the bucket) should be created if they do not already
// exist. Otherwise, if the bucket or any leading up to it does not yet exist
// then nil is returned.
type getBucketFunc func(tx *bbolt.Tx, create bool) (*bbolt.Bucket, error)

// kvStoreTx represents an open transaction of kvStores.
// This implements the KVStoreTX interface.
type kvStoreTx struct {
	boltTx    *bbolt.Tx
	getBucket getBucketFunc

	*kvStores
}

// Global gives the caller access to the global kv store of the rule.
//
// NOTE: this is part of the rules.KVStoreTx interface.
func (tx *kvStoreTx) Global() KVStore {
	return &kvStoreTx{
		kvStores:  tx.kvStores,
		boltTx:    tx.boltTx,
		getBucket: getGlobalRuleBucket(true, tx.ruleName),
	}
}

// Local gives the caller access to the local kv store of the rule. This will
// either be a session wide kv store or a feature specific one depending on
// how the kv store was initialised.
//
// NOTE: this is part of the KVStoreTx interface.
func (tx *kvStoreTx) Local() KVStore {
	fn := getSessionRuleBucket(true, tx.ruleName, tx.groupID)
	if tx.featureName != "" {
		fn = getSessionFeatureRuleBucket(
			true, tx.ruleName, tx.groupID, tx.featureName,
		)
	}

	return &kvStoreTx{
		kvStores:  tx.kvStores,
		boltTx:    tx.boltTx,
		getBucket: fn,
	}
}

// GlobalTemp gives the caller access to the temporary global kv store of the
// rule.
//
// NOTE: this is part of the KVStoreTx interface.
func (tx *kvStoreTx) GlobalTemp() KVStore {
	return &kvStoreTx{
		kvStores:  tx.kvStores,
		boltTx:    tx.boltTx,
		getBucket: getGlobalRuleBucket(false, tx.ruleName),
	}
}

// LocalTemp gives the caller access to the temporary local kv store of the
// rule.
//
// NOTE: this is part of the KVStoreTx interface.
func (tx *kvStoreTx) LocalTemp() KVStore {
	fn := getSessionRuleBucket(true, tx.ruleName, tx.groupID)
	if tx.featureName != "" {
		fn = getSessionFeatureRuleBucket(
			false, tx.ruleName, tx.groupID, tx.featureName,
		)
	}

	return &kvStoreTx{
		kvStores:  tx.kvStores,
		boltTx:    tx.boltTx,
		getBucket: fn,
	}
}

// Get fetches the value under the given key from the underlying kv store.
// If no value is found, nil is returned.
//
// NOTE: this is part of the KVStore interface.
func (tx *kvStoreTx) Get(_ context.Context, key string) ([]byte, error) {
	bucket, err := tx.getBucket(tx.boltTx, false)
	if err != nil {
		return nil, err
	}
	if bucket == nil {
		return nil, nil
	}

	return bucket.Get([]byte(key)), nil
}

// Set sets the given key-value pair in the underlying kv store.
//
// NOTE: this is part of the KVStore interface.
func (tx *kvStoreTx) Set(_ context.Context, key string, value []byte) error {
	bucket, err := tx.getBucket(tx.boltTx, true)
	if err != nil {
		return err
	}

	return bucket.Put([]byte(key), value)
}

// Del deletes the value under the given key in the underlying kv store.
//
// NOTE: this is part of the .KVStore interface.
func (tx *kvStoreTx) Del(_ context.Context, key string) error {
	bucket, err := tx.getBucket(tx.boltTx, false)
	if err != nil {
		return err
	}
	if bucket == nil {
		return nil
	}

	return bucket.Delete([]byte(key))
}

func getMainBucket(tx *bbolt.Tx, create, perm bool) (*bbolt.Bucket, error) {
	mainBucket, err := getBucket(tx, rulesBucketKey)
	if err != nil {
		return nil, err
	}

	key := tempBucketKey
	if perm {
		key = permBucketKey
	}

	if create {
		return mainBucket.CreateBucketIfNotExists(key)
	}

	return mainBucket.Bucket(key), nil
}

// getRuleBucket returns a function that can be used to access the bucket for
// a given rule name. The `perm` param determines if the temporary or permanent
// store is used.
func getRuleBucket(perm bool, ruleName string) getBucketFunc {
	return func(tx *bbolt.Tx, create bool) (*bbolt.Bucket, error) {
		mainBucket, err := getMainBucket(tx, create, perm)
		if err != nil {
			return nil, err
		}

		if create {
			return mainBucket.CreateBucketIfNotExists(
				[]byte(ruleName),
			)
		} else if mainBucket == nil {
			return nil, nil
		}

		return mainBucket.Bucket([]byte(ruleName)), nil
	}
}

// getGlobalRuleBucket returns a function that can be used to access the global
// kv store of the given rule name. The `perm` param determines if the temporary
// or permanent store is used.
func getGlobalRuleBucket(perm bool, ruleName string) getBucketFunc {
	return func(tx *bbolt.Tx, create bool) (*bbolt.Bucket, error) {
		ruleBucket, err := getRuleBucket(perm, ruleName)(tx, create)
		if err != nil {
			return nil, err
		}

		if ruleBucket == nil && !create {
			return nil, nil
		}

		if create {
			return ruleBucket.CreateBucketIfNotExists(
				globalKVStoreBucketKey,
			)
		}

		return ruleBucket.Bucket(globalKVStoreBucketKey), nil
	}
}

// getSessionRuleBucket returns a function that can be used to fetch the
// bucket under which a kv store for a specific rule-name and group ID is
// stored. The `perm` param determines if the temporary or permanent store is
// used.
func getSessionRuleBucket(perm bool, ruleName string,
	groupID session.ID) getBucketFunc {

	return func(tx *bbolt.Tx, create bool) (*bbolt.Bucket, error) {
		ruleBucket, err := getRuleBucket(perm, ruleName)(tx, create)
		if err != nil {
			return nil, err
		}

		if ruleBucket == nil && !create {
			return nil, nil
		}

		if create {
			sessBucket, err := ruleBucket.CreateBucketIfNotExists(
				sessKVStoreBucketKey,
			)
			if err != nil {
				return nil, err
			}

			return sessBucket.CreateBucketIfNotExists(groupID[:])
		}

		sessBucket := ruleBucket.Bucket(sessKVStoreBucketKey)
		if sessBucket == nil {
			return nil, nil
		}
		return sessBucket.Bucket(groupID[:]), nil
	}
}

// getSessionFeatureRuleBucket returns a function that can be used to fetch the
// bucket under which a kv store for a specific rule-name, group ID and
// feature name is stored. The `perm` param determines if the temporary or
// permanent store is used.
func getSessionFeatureRuleBucket(perm bool, ruleName string,
	groupID session.ID, featureName string) getBucketFunc {

	return func(tx *bbolt.Tx, create bool) (*bbolt.Bucket, error) {
		sessBucket, err := getSessionRuleBucket(
			perm, ruleName, groupID,
		)(tx, create)
		if err != nil {
			return nil, err
		}

		if sessBucket == nil && !create {
			return nil, nil
		}

		if create {
			featureBucket, err := sessBucket.CreateBucketIfNotExists(
				featureKVStoreBucketKey,
			)
			if err != nil {
				return nil, err
			}

			return featureBucket.CreateBucketIfNotExists(
				[]byte(featureName),
			)
		}

		featureBucket := sessBucket.Bucket(featureKVStoreBucketKey)
		if featureBucket == nil {
			return nil, nil
		}
		return featureBucket.Bucket([]byte(featureName)), nil
	}
}
