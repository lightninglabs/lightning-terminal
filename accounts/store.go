package accounts

import (
	"bytes"
	"crypto/rand"
	"encoding/binary"
	"encoding/hex"
	"fmt"
	"os"
	"time"

	"github.com/btcsuite/btcwallet/walletdb"
	"github.com/lightningnetwork/lnd/kvdb"
	"github.com/lightningnetwork/lnd/lnwire"
	"go.etcd.io/bbolt"
)

const (
	// DBFilename is the filename within the data directory which contains
	// the macaroon stores.
	DBFilename = "accounts.db"

	// dbPathPermission is the default permission the account database
	// directory is created with (if it does not exist).
	dbPathPermission = 0700

	// DefaultAccountDBTimeout is the default maximum time we wait for the
	// account bbolt database to be opened. If the database is already
	// opened by another process, the unique lock cannot be obtained. With
	// the timeout we error out after the given time instead of just
	// blocking for forever.
	DefaultAccountDBTimeout = 5 * time.Second
)

var (
	// accountBucketName is the name of the bucket where all accounting
	// based balances are stored.
	accountBucketName = []byte("accounts")

	// lastAddIndexKey is the name of the key under which we store the last
	// known invoice add index.
	lastAddIndexKey = []byte("last-add-index")

	// lastSettleIndexKey is the name of the key under which we store the
	// last known invoice settle index.
	lastSettleIndexKey = []byte("last-settle-index")

	// byteOrder is the binary byte order we use to encode integers.
	byteOrder = binary.BigEndian

	// zeroID is an empty account ID.
	zeroID = AccountID{}
)

// BoltStore wraps the bolt DB that stores all accounts and their balances.
type BoltStore struct {
	db kvdb.Backend
}

// NewBoltStore creates a BoltStore instance and the corresponding bucket in the
// bolt DB if it does not exist yet.
func NewBoltStore(dir, fileName string) (*BoltStore, error) {
	// Ensure that the path to the directory exists.
	if _, err := os.Stat(dir); os.IsNotExist(err) {
		if err := os.MkdirAll(dir, dbPathPermission); err != nil {
			return nil, err
		}
	}

	// Open the database that we'll use to store the primary macaroon key,
	// and all generated macaroons+caveats.
	db, err := kvdb.GetBoltBackend(&kvdb.BoltBackendConfig{
		DBPath:     dir,
		DBFileName: fileName,
		DBTimeout:  DefaultAccountDBTimeout,
	})
	if err == bbolt.ErrTimeout {
		return nil, fmt.Errorf("error while trying to open %s/%s: "+
			"timed out after %v when trying to obtain exclusive "+
			"lock", dir, fileName, DefaultAccountDBTimeout)
	}
	if err != nil {
		return nil, err
	}

	// If the store's bucket doesn't exist, create it.
	err = db.Update(func(tx kvdb.RwTx) error {
		_, err := tx.CreateTopLevelBucket(accountBucketName)
		return err
	}, func() {})
	if err != nil {
		return nil, err
	}

	// Return the DB wrapped in a BoltStore object.
	return &BoltStore{db: db}, nil
}

// Close closes the underlying bolt DB.
func (s *BoltStore) Close() error {
	return s.db.Close()
}

// NewAccount creates a new OffChainBalanceAccount with the given balance and a
// randomly chosen ID.
func (s *BoltStore) NewAccount(balance lnwire.MilliSatoshi,
	expirationDate time.Time, label string) (*OffChainBalanceAccount,
	error) {

	if balance == 0 {
		return nil, fmt.Errorf("a new account cannot have balance of 0")
	}

	// If a label is set, it must be unique, as we use it to identify the
	// account in some of the RPCs. It also can't be mistaken for a hex
	// encoded account ID to avoid confusion and make it easier for the CLI
	// to distinguish between the two.
	if len(label) > 0 {
		if _, err := hex.DecodeString(label); err == nil &&
			len(label) == hex.EncodedLen(AccountIDLen) {

			return nil, fmt.Errorf("the label '%s' is not allowed "+
				"as it can be mistaken for an account ID",
				label)
		}

		accounts, err := s.Accounts()
		if err != nil {
			return nil, fmt.Errorf("error checking label "+
				"uniqueness: %w", err)
		}
		for _, account := range accounts {
			if account.Label == label {
				return nil, fmt.Errorf("an account with the "+
					"label '%s' already exists", label)
			}
		}
	}

	// First, create a new instance of an account. Currently, only the type
	// TypeInitialBalance is supported.
	account := &OffChainBalanceAccount{
		Type:           TypeInitialBalance,
		InitialBalance: balance,
		CurrentBalance: int64(balance),
		ExpirationDate: expirationDate,
		LastUpdate:     time.Now(),
		Invoices:       make(AccountInvoices),
		Payments:       make(AccountPayments),
		Label:          label,
	}

	// Try storing the account in the account database, so we can keep track
	// of its balance.
	err := s.db.Update(func(tx walletdb.ReadWriteTx) error {
		bucket := tx.ReadWriteBucket(accountBucketName)
		if bucket == nil {
			return ErrAccountBucketNotFound
		}

		id, err := uniqueRandomAccountID(bucket)
		if err != nil {
			return fmt.Errorf("error creating random account ID: "+
				"%w", err)
		}

		account.ID = id
		return storeAccount(bucket, account)
	}, func() {
		account.ID = zeroID
	})
	if err != nil {
		return nil, err
	}

	return account, nil
}

// UpdateAccount writes an account to the database, overwriting the existing one
// if it exists.
func (s *BoltStore) UpdateAccount(account *OffChainBalanceAccount) error {
	return s.db.Update(func(tx kvdb.RwTx) error {
		bucket := tx.ReadWriteBucket(accountBucketName)
		if bucket == nil {
			return ErrAccountBucketNotFound
		}

		account.LastUpdate = time.Now()
		return storeAccount(bucket, account)
	}, func() {})
}

// storeAccount serializes and writes the given account to the given account
// bucket.
func storeAccount(accountBucket kvdb.RwBucket,
	account *OffChainBalanceAccount) error {

	accountBinary, err := serializeAccount(account)
	if err != nil {
		return err
	}

	return accountBucket.Put(account.ID[:], accountBinary)
}

// uniqueRandomAccountID generates a new random ID and makes sure it does not
// yet exist in the DB.
func uniqueRandomAccountID(accountBucket kvdb.RBucket) (AccountID, error) {
	var (
		newID    AccountID
		numTries = 10
	)
	for numTries > 0 {
		if _, err := rand.Read(newID[:]); err != nil {
			return newID, err
		}

		accountBytes := accountBucket.Get(newID[:])
		if accountBytes == nil {
			// No account found with this new ID, we can use it.
			return newID, nil
		}

		numTries--
	}

	return newID, fmt.Errorf("couldn't create new account ID")
}

// Account retrieves an account from the bolt DB and un-marshals it. If the
// account cannot be found, then ErrAccNotFound is returned.
func (s *BoltStore) Account(id AccountID) (*OffChainBalanceAccount, error) {
	// Try looking up and reading the account by its ID from the local
	// bolt DB.
	var accountBinary []byte
	err := s.db.View(func(tx kvdb.RTx) error {
		bucket := tx.ReadBucket(accountBucketName)
		if bucket == nil {
			return ErrAccountBucketNotFound
		}

		accountBinary = bucket.Get(id[:])
		if len(accountBinary) == 0 {
			return ErrAccNotFound
		}

		return nil
	}, func() {
		accountBinary = nil
	})
	if err != nil {
		return nil, err
	}

	// Now try to deserialize the account back from the binary format it was
	// stored in.
	account, err := deserializeAccount(accountBinary)
	if err != nil {
		return nil, err
	}

	return account, nil
}

// Accounts retrieves all accounts from the bolt DB and un-marshals them.
func (s *BoltStore) Accounts() ([]*OffChainBalanceAccount, error) {
	var accounts []*OffChainBalanceAccount
	err := s.db.View(func(tx kvdb.RTx) error {
		// This function will be called in the ForEach and receive
		// the key and value of each account in the DB. The key, which
		// is also the ID is not used because it is also marshaled into
		// the value.
		readFn := func(k, v []byte) error {
			// Skip the two special purpose keys.
			if bytes.Equal(k, lastAddIndexKey) ||
				bytes.Equal(k, lastSettleIndexKey) {

				return nil
			}

			// There should be no sub-buckets.
			if v == nil {
				return fmt.Errorf("invalid bucket structure")
			}

			account, err := deserializeAccount(v)
			if err != nil {
				return err
			}

			accounts = append(accounts, account)
			return nil
		}

		// We know the bucket should exist since it's created when
		// the account storage is initialized.
		return tx.ReadBucket(accountBucketName).ForEach(readFn)
	}, func() {
		accounts = nil
	})
	if err != nil {
		return nil, err
	}

	return accounts, nil
}

// RemoveAccount finds an account by its ID and removes it from the DB.
func (s *BoltStore) RemoveAccount(id AccountID) error {
	return s.db.Update(func(tx kvdb.RwTx) error {
		bucket := tx.ReadWriteBucket(accountBucketName)
		if bucket == nil {
			return ErrAccountBucketNotFound
		}

		account := bucket.Get(id[:])
		if len(account) == 0 {
			return ErrAccNotFound
		}

		return bucket.Delete(id[:])
	}, func() {})
}

// LastIndexes returns the last invoice add and settle index or
// ErrNoInvoiceIndexKnown if no indexes are known yet.
func (s *BoltStore) LastIndexes() (uint64, uint64, error) {
	var (
		addValue, settleValue []byte
	)
	err := s.db.View(func(tx kvdb.RTx) error {
		bucket := tx.ReadBucket(accountBucketName)
		if bucket == nil {
			return ErrAccountBucketNotFound
		}

		addValue = bucket.Get(lastAddIndexKey)
		if len(addValue) == 0 {
			return ErrNoInvoiceIndexKnown
		}

		settleValue = bucket.Get(lastSettleIndexKey)
		if len(settleValue) == 0 {
			return ErrNoInvoiceIndexKnown
		}

		return nil
	}, func() {
		addValue, settleValue = nil, nil
	})
	if err != nil {
		return 0, 0, err
	}

	return byteOrder.Uint64(addValue), byteOrder.Uint64(settleValue), nil
}

// StoreLastIndexes stores the last invoice add and settle index.
func (s *BoltStore) StoreLastIndexes(addIndex, settleIndex uint64) error {
	addValue := make([]byte, 8)
	settleValue := make([]byte, 8)
	byteOrder.PutUint64(addValue, addIndex)
	byteOrder.PutUint64(settleValue, settleIndex)

	return s.db.Update(func(tx kvdb.RwTx) error {
		bucket := tx.ReadWriteBucket(accountBucketName)
		if bucket == nil {
			return ErrAccountBucketNotFound
		}

		if err := bucket.Put(lastAddIndexKey, addValue); err != nil {
			return err
		}

		return bucket.Put(lastSettleIndexKey, settleValue)
	}, func() {})
}
