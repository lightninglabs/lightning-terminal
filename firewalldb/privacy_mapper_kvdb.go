package firewalldb

import (
	"context"
	"fmt"

	"github.com/lightninglabs/lightning-terminal/session"
	"go.etcd.io/bbolt"
)

/*
	The PrivacyMapper data is stored in the following structure in the db:

	privacy -> group id -> real-to-pseudo -> {k:v}
			    -> pseudo-to-real -> {k:v}
*/

const (
	txidStringLen = 64
)

var (
	privacyBucketKey = []byte("privacy")
	realToPseudoKey  = []byte("real-to-pseudo")
	pseudoToRealKey  = []byte("pseudo-to-real")

	pseudoStrAlphabet    = []rune("abcdef0123456789")
	pseudoStrAlphabetLen = len(pseudoStrAlphabet)
)

// PrivacyDB constructs a PrivacyMapDB that will be indexed under the given
// group ID key.
func (db *BoltDB) PrivacyDB(groupID session.ID) PrivacyMapDB {
	return &kvdbExecutor[PrivacyMapTx]{
		db: db.DB,
		wrapTx: func(tx *bbolt.Tx) PrivacyMapTx {
			return &privacyMapTx{
				boltTx: tx,
				privacyMapDB: &privacyMapDB{
					groupID: groupID,
				},
			}
		},
	}
}

// privacyMapDB is an implementation of PrivacyMapDB.
type privacyMapDB struct {
	groupID session.ID
}

// privacyMapTx is an implementation of PrivacyMapTx.
type privacyMapTx struct {
	*privacyMapDB
	boltTx *bbolt.Tx
}

// NewPair inserts a new real-pseudo pair into the db.
//
// NOTE: this is part of the PrivacyMapTx interface.
func (p *privacyMapTx) NewPair(_ context.Context, real, pseudo string) error {
	privacyBucket, err := getBucket(p.boltTx, privacyBucketKey)
	if err != nil {
		return err
	}

	sessBucket, err := privacyBucket.CreateBucketIfNotExists(p.groupID[:])
	if err != nil {
		return err
	}

	realToPseudoBucket, err := sessBucket.CreateBucketIfNotExists(
		realToPseudoKey,
	)
	if err != nil {
		return err
	}

	pseudoToRealBucket, err := sessBucket.CreateBucketIfNotExists(
		pseudoToRealKey,
	)
	if err != nil {
		return err
	}

	if len(realToPseudoBucket.Get([]byte(real))) != 0 {
		return fmt.Errorf("an entry already exists for real "+
			"value: %x", real)
	}

	if len(pseudoToRealBucket.Get([]byte(pseudo))) != 0 {
		return fmt.Errorf("an entry already exists for pseudo "+
			"value: %x", pseudo)
	}

	err = realToPseudoBucket.Put([]byte(real), []byte(pseudo))
	if err != nil {
		return err
	}

	return pseudoToRealBucket.Put([]byte(pseudo), []byte(real))
}

// PseudoToReal will check the db to see if the given pseudo key exists. If
// it does then the real value is returned, else an error is returned.
//
// NOTE: this is part of the PrivacyMapTx interface.
func (p *privacyMapTx) PseudoToReal(_ context.Context, pseudo string) (string,
	error) {

	privacyBucket, err := getBucket(p.boltTx, privacyBucketKey)
	if err != nil {
		return "", err
	}

	sessBucket := privacyBucket.Bucket(p.groupID[:])
	if sessBucket == nil {
		return "", ErrNoSuchKeyFound
	}

	pseudoToRealBucket := sessBucket.Bucket(pseudoToRealKey)
	if pseudoToRealBucket == nil {
		return "", ErrNoSuchKeyFound
	}

	real := pseudoToRealBucket.Get([]byte(pseudo))
	if len(real) == 0 {
		return "", ErrNoSuchKeyFound
	}

	return string(real), nil
}

// RealToPseudo will check the db to see if the given real key exists. If
// it does then the pseudo value is returned, else an error is returned.
//
// NOTE: this is part of the PrivacyMapTx interface.
func (p *privacyMapTx) RealToPseudo(_ context.Context, real string) (string,
	error) {

	privacyBucket, err := getBucket(p.boltTx, privacyBucketKey)
	if err != nil {
		return "", err
	}

	sessBucket := privacyBucket.Bucket(p.groupID[:])
	if sessBucket == nil {
		return "", ErrNoSuchKeyFound
	}

	realToPseudoBucket := sessBucket.Bucket(realToPseudoKey)
	if realToPseudoBucket == nil {
		return "", ErrNoSuchKeyFound
	}

	pseudo := realToPseudoBucket.Get([]byte(real))
	if len(pseudo) == 0 {
		return "", ErrNoSuchKeyFound
	}

	return string(pseudo), nil
}

// FetchAllPairs loads and returns the real-to-pseudo pairs.
//
// NOTE: this is part of the PrivacyMapTx interface.
func (p *privacyMapTx) FetchAllPairs(_ context.Context) (*PrivacyMapPairs,
	error) {

	privacyBucket, err := getBucket(p.boltTx, privacyBucketKey)
	if err != nil {
		return nil, err
	}

	sessBucket := privacyBucket.Bucket(p.groupID[:])
	if sessBucket == nil {
		// If the bucket has not been created yet, then there are no
		// privacy pairs yet.
		return NewPrivacyMapPairs(nil), nil
	}

	realToPseudoBucket := sessBucket.Bucket(realToPseudoKey)
	if realToPseudoBucket == nil {
		return nil, ErrNoSuchKeyFound
	}

	pairs := make(map[string]string)
	err = realToPseudoBucket.ForEach(func(r, p []byte) error {
		pairs[string(r)] = string(p)

		return nil
	})
	if err != nil {
		return nil, err
	}

	return NewPrivacyMapPairs(pairs), nil
}
