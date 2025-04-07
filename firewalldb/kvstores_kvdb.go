package firewalldb

import (
	"context"
	"errors"

	"github.com/lightninglabs/lightning-terminal/session"
	"go.etcd.io/bbolt"
)

/*
The KVStores are stored in the following structure in the KV db. Note that
the `perm` and `temp` buckets are identical in structure. The only difference
is that the `temp` bucket is cleared on restart of the db. The reason persisting
the temporary store changes instead of just keeping an in-memory store is that
we can then guarantee atomicity if changes are made to both the permanent and
temporary stores.

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

// GetKVStores constructs a new rules.KVStores backed by a bbolt db.
func (db *BoltDB) GetKVStores(rule string, groupID session.ID,
	feature string) KVStores {

	return &kvdbExecutor[KVStoreTx]{
		db: db.DB,
		wrapTx: func(tx *bbolt.Tx) KVStoreTx {
			return &kvStoreTx{
				boltTx: tx,
				kvStores: &kvStores{
					ruleName:    rule,
					groupID:     groupID,
					featureName: feature,
				},
			}
		},
	}
}

// DeleteTempKVStores deletes all kv-stores in the temporary namespace.
func (db *BoltDB) DeleteTempKVStores(_ context.Context) error {
	return db.Update(func(tx *bbolt.Tx) error {
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

		return nil
	})
}

// kvStores implements the rules.KVStores interface.
type kvStores struct {
	ruleName    string
	groupID     session.ID
	featureName string
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
func (s *kvStoreTx) Global() KVStore {
	return &kvStoreTx{
		kvStores:  s.kvStores,
		boltTx:    s.boltTx,
		getBucket: getGlobalRuleBucket(true, s.ruleName),
	}
}

// Local gives the caller access to the local kv store of the rule. This will
// either be a session wide kv store or a feature specific one depending on
// how the kv store was initialised.
//
// NOTE: this is part of the KVStoreTx interface.
func (s *kvStoreTx) Local() KVStore {
	fn := s.getSessionRuleBucket(true)
	if s.featureName != "" {
		fn = s.getSessionFeatureRuleBucket(true)
	}

	return &kvStoreTx{
		kvStores:  s.kvStores,
		boltTx:    s.boltTx,
		getBucket: fn,
	}
}

// GlobalTemp gives the caller access to the temporary global kv store of the
// rule.
//
// NOTE: this is part of the KVStoreTx interface.
func (s *kvStoreTx) GlobalTemp() KVStore {
	return &kvStoreTx{
		kvStores:  s.kvStores,
		boltTx:    s.boltTx,
		getBucket: getGlobalRuleBucket(false, s.ruleName),
	}
}

// LocalTemp gives the caller access to the temporary local kv store of the
// rule.
//
// NOTE: this is part of the KVStoreTx interface.
func (s *kvStoreTx) LocalTemp() KVStore {
	fn := s.getSessionRuleBucket(false)
	if s.featureName != "" {
		fn = s.getSessionFeatureRuleBucket(false)
	}

	return &kvStoreTx{
		kvStores:  s.kvStores,
		boltTx:    s.boltTx,
		getBucket: fn,
	}
}

// Get fetches the value under the given key from the underlying kv store.
// If no value is found, nil is returned.
//
// NOTE: this is part of the KVStore interface.
func (s *kvStoreTx) Get(_ context.Context, key string) ([]byte, error) {
	bucket, err := s.getBucket(s.boltTx, false)
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
func (s *kvStoreTx) Set(_ context.Context, key string, value []byte) error {
	bucket, err := s.getBucket(s.boltTx, true)
	if err != nil {
		return err
	}

	return bucket.Put([]byte(key), value)
}

// Del deletes the value under the given key in the underlying kv store.
//
// NOTE: this is part of the .KVStore interface.
func (s *kvStoreTx) Del(_ context.Context, key string) error {
	bucket, err := s.getBucket(s.boltTx, false)
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
func (s *kvStoreTx) getSessionRuleBucket(perm bool) getBucketFunc {
	return func(tx *bbolt.Tx, create bool) (*bbolt.Bucket, error) {
		ruleBucket, err := getRuleBucket(perm, s.ruleName)(tx, create)
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

			return sessBucket.CreateBucketIfNotExists(s.groupID[:])
		}

		sessBucket := ruleBucket.Bucket(sessKVStoreBucketKey)
		if sessBucket == nil {
			return nil, nil
		}
		return sessBucket.Bucket(s.groupID[:]), nil
	}
}

// getSessionFeatureRuleBucket returns a function that can be used to fetch the
// bucket under which a kv store for a specific rule-name, group ID and
// feature name is stored. The `perm` param determines if the temporary or
// permanent store is used.
func (s *kvStoreTx) getSessionFeatureRuleBucket(perm bool) getBucketFunc {
	return func(tx *bbolt.Tx, create bool) (*bbolt.Bucket, error) {
		sessBucket, err := s.getSessionRuleBucket(perm)(tx, create)
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
				[]byte(s.featureName),
			)
		}

		featureBucket := sessBucket.Bucket(featureKVStoreBucketKey)
		if featureBucket == nil {
			return nil, nil
		}
		return featureBucket.Bucket([]byte(s.featureName)), nil
	}
}
