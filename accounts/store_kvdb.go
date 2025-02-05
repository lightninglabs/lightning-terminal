package accounts

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/binary"
	"encoding/hex"
	"fmt"
	"math"
	"os"
	"time"

	"github.com/btcsuite/btcwallet/walletdb"
	"github.com/lightningnetwork/lnd/clock"
	"github.com/lightningnetwork/lnd/fn"
	"github.com/lightningnetwork/lnd/kvdb"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/lntypes"
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
	db    kvdb.Backend
	clock clock.Clock
}

// NewBoltStore creates a BoltStore instance and the corresponding bucket in the
// bolt DB if it does not exist yet.
func NewBoltStore(dir, fileName string, clock clock.Clock) (*BoltStore, error) {
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
	return &BoltStore{
		db:    db,
		clock: clock,
	}, nil
}

// Close closes the underlying bolt DB.
//
// NOTE: This is part of the Store interface.
func (s *BoltStore) Close() error {
	return s.db.Close()
}

// NewAccount creates a new OffChainBalanceAccount with the given balance and a
// randomly chosen ID.
//
// NOTE: This is part of the Store interface.
func (s *BoltStore) NewAccount(ctx context.Context, balance lnwire.MilliSatoshi,
	expirationDate time.Time, label string) (*OffChainBalanceAccount,
	error) {

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

		accounts, err := s.Accounts(ctx)
		if err != nil {
			return nil, fmt.Errorf("error checking label "+
				"uniqueness: %w", err)
		}
		for _, account := range accounts {
			if account.Label == label {
				return nil, fmt.Errorf("an account with the "+
					"label '%s' already exists: %w", label,
					ErrLabelAlreadyExists)
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
		return s.storeAccount(bucket, account)
	}, func() {
		account.ID = zeroID
	})
	if err != nil {
		return nil, err
	}

	return account, nil
}

// UpdateAccountBalanceAndExpiry updates the balance and/or expiry of an
// account.
//
// NOTE: This is part of the Store interface.
func (s *BoltStore) UpdateAccountBalanceAndExpiry(_ context.Context,
	id AccountID, newBalance fn.Option[int64],
	newExpiry fn.Option[time.Time]) error {

	update := func(account *OffChainBalanceAccount) error {
		newBalance.WhenSome(func(balance int64) {
			account.CurrentBalance = balance
		})
		newExpiry.WhenSome(func(expiry time.Time) {
			account.ExpirationDate = expiry
		})

		return nil
	}

	return s.updateAccount(id, update)
}

// AddAccountInvoice adds an invoice hash to the account with the given ID.
//
// NOTE: This is part of the Store interface.
func (s *BoltStore) AddAccountInvoice(_ context.Context, id AccountID,
	hash lntypes.Hash) error {

	update := func(account *OffChainBalanceAccount) error {
		account.Invoices[hash] = struct{}{}

		return nil
	}

	return s.updateAccount(id, update)
}

// CreditAccount increases the balance of the account with the given ID
// by the given amount.
//
// NOTE: This is part of the Store interface.
func (s *BoltStore) CreditAccount(_ context.Context, id AccountID,
	amount lnwire.MilliSatoshi) error {

	update := func(account *OffChainBalanceAccount) error {
		if amount > math.MaxInt64 {
			return fmt.Errorf("amount %v exceeds the maximum of %v",
				amount, int64(math.MaxInt64))
		}

		account.CurrentBalance += int64(amount)

		return nil
	}

	return s.updateAccount(id, update)
}

// DebitAccount decreases the balance of the account with the given ID
// by the given amount.
func (s *BoltStore) DebitAccount(_ context.Context, id AccountID,
	amount lnwire.MilliSatoshi) error {

	update := func(account *OffChainBalanceAccount) error {
		if amount > math.MaxInt64 {
			return fmt.Errorf("amount %v exceeds the maximum of %v",
				amount, int64(math.MaxInt64))
		}

		if account.CurrentBalance-int64(amount) < 0 {
			return fmt.Errorf("cannot debit %v from the account "+
				"balance, as the resulting balance would be "+
				"below 0", int64(amount/1000))
		}

		account.CurrentBalance -= int64(amount)

		return nil
	}

	return s.updateAccount(id, update)
}

// UpsertAccountPayment updates or inserts a payment entry for the given
// account. Various functional options can be passed to modify the behavior of
// the method. The returned boolean is true if the payment was already known
// before the update. This is to be treated as a best-effort indication if an
// error is also returned since the method may error before the boolean can be
// set correctly.
//
// NOTE: This is part of the Store interface.
func (s *BoltStore) UpsertAccountPayment(_ context.Context, id AccountID,
	paymentHash lntypes.Hash, fullAmount lnwire.MilliSatoshi,
	status lnrpc.Payment_PaymentStatus,
	options ...UpsertPaymentOption) (bool, error) {

	opts := newUpsertPaymentOption()
	for _, o := range options {
		o(opts)
	}

	var known bool
	update := func(account *OffChainBalanceAccount) error {
		var entry *PaymentEntry
		entry, known = account.Payments[paymentHash]
		if known {
			if opts.errIfAlreadySucceeded &&
				successState(entry.Status) {

				return ErrAlreadySucceeded
			}

			// If the errIfAlreadyPending option is set, we return
			// an error if the payment is already in-flight or
			// succeeded.
			if opts.errIfAlreadyPending &&
				entry.Status != lnrpc.Payment_FAILED {

				return fmt.Errorf("payment with hash %s is "+
					"already in flight or succeeded "+
					"(status %v)", paymentHash,
					account.Payments[paymentHash].Status)
			}

			if opts.usePendingAmount {
				fullAmount = entry.FullAmount
			}
		} else if opts.errIfUnknown {
			return ErrPaymentNotAssociated
		}

		account.Payments[paymentHash] = &PaymentEntry{
			Status:     status,
			FullAmount: fullAmount,
		}

		if opts.debitAccount {
			account.CurrentBalance -= int64(fullAmount)
		}

		return nil
	}

	return known, s.updateAccount(id, update)
}

// DeleteAccountPayment removes a payment entry from the account with the given
// ID. It will return the ErrPaymentNotAssociated error if the payment is not
// associated with the account.
//
// NOTE: This is part of the Store interface.
func (s *BoltStore) DeleteAccountPayment(_ context.Context, id AccountID,
	hash lntypes.Hash) error {

	update := func(account *OffChainBalanceAccount) error {
		// Check that this payment is actually associated with this
		// account.
		_, ok := account.Payments[hash]
		if !ok {
			return fmt.Errorf("payment with hash %s is not "+
				"associated with this account: %w", hash,
				ErrPaymentNotAssociated)
		}

		// Delete the payment and update the persisted account.
		delete(account.Payments, hash)

		return nil
	}

	return s.updateAccount(id, update)
}

func (s *BoltStore) updateAccount(id AccountID,
	updateFn func(*OffChainBalanceAccount) error) error {

	return s.db.Update(func(tx kvdb.RwTx) error {
		bucket := tx.ReadWriteBucket(accountBucketName)
		if bucket == nil {
			return ErrAccountBucketNotFound
		}

		account, err := getAccount(bucket, id)
		if err != nil {
			return fmt.Errorf("error fetching account, %w", err)
		}

		err = updateFn(account)
		if err != nil {
			return fmt.Errorf("error updating account, %w", err)
		}

		err = s.storeAccount(bucket, account)
		if err != nil {
			return fmt.Errorf("error storing account, %w", err)
		}

		return nil
	}, func() {})
}

// storeAccount serializes and writes the given account to the given account
// bucket.
func (s *BoltStore) storeAccount(accountBucket kvdb.RwBucket,
	account *OffChainBalanceAccount) error {

	account.LastUpdate = s.clock.Now()

	accountBinary, err := serializeAccount(account)
	if err != nil {
		return err
	}

	return accountBucket.Put(account.ID[:], accountBinary)
}

// getAccount retrieves an account from the given account bucket and
// deserializes it.
func getAccount(accountBucket kvdb.RwBucket, id AccountID) (
	*OffChainBalanceAccount, error) {

	accountBinary := accountBucket.Get(id[:])
	if len(accountBinary) == 0 {
		return nil, ErrAccNotFound
	}

	return deserializeAccount(accountBinary)
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
//
// NOTE: This is part of the Store interface.
func (s *BoltStore) Account(_ context.Context, id AccountID) (
	*OffChainBalanceAccount, error) {

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
//
// NOTE: This is part of the Store interface.
func (s *BoltStore) Accounts(_ context.Context) ([]*OffChainBalanceAccount,
	error) {

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
//
// NOTE: This is part of the Store interface.
func (s *BoltStore) RemoveAccount(_ context.Context, id AccountID) error {
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
//
// NOTE: This is part of the Store interface.
func (s *BoltStore) LastIndexes(_ context.Context) (uint64, uint64, error) {
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
//
// NOTE: This is part of the Store interface.
func (s *BoltStore) StoreLastIndexes(_ context.Context, addIndex,
	settleIndex uint64) error {

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
