package accounts

import (
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"errors"
	"fmt"
	"time"

	"github.com/lightninglabs/lightning-terminal/db"
	"github.com/lightninglabs/lightning-terminal/db/sqlc"
	"github.com/lightningnetwork/lnd/clock"
	"github.com/lightningnetwork/lnd/fn"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/lntypes"
	"github.com/lightningnetwork/lnd/lnwire"
)

const (
	// addIndexName is the name of the key under which we store the last
	// known invoice add index in the accounts_indices table.
	addIndexName = "last_add_index"

	// settleIndexName is the name of the key under which we store the
	// last known invoice settle index in the accounts_indices table.
	settleIndexName = "last_settle_index"
)

// SQLQueries is a subset of the sqlc.Queries interface that can be used
// to interact with accounts related tables.
//
//nolint:lll
type SQLQueries interface {
	AddAccountInvoice(ctx context.Context, arg sqlc.AddAccountInvoiceParams) error
	DeleteAccount(ctx context.Context, id int64) error
	DeleteAccountPayment(ctx context.Context, arg sqlc.DeleteAccountPaymentParams) error
	GetAccount(ctx context.Context, id int64) (sqlc.Account, error)
	GetAccountByLabel(ctx context.Context, label sql.NullString) (sqlc.Account, error)
	GetAccountIDByAlias(ctx context.Context, alias int64) (int64, error)
	GetAccountIndex(ctx context.Context, name string) (int64, error)
	GetAccountPayment(ctx context.Context, arg sqlc.GetAccountPaymentParams) (sqlc.AccountPayment, error)
	InsertAccount(ctx context.Context, arg sqlc.InsertAccountParams) (int64, error)
	ListAccountInvoices(ctx context.Context, id int64) ([]sqlc.AccountInvoice, error)
	ListAccountPayments(ctx context.Context, id int64) ([]sqlc.AccountPayment, error)
	ListAllAccounts(ctx context.Context) ([]sqlc.Account, error)
	SetAccountIndex(ctx context.Context, arg sqlc.SetAccountIndexParams) error
	UpdateAccountBalance(ctx context.Context, arg sqlc.UpdateAccountBalanceParams) (int64, error)
	UpdateAccountExpiry(ctx context.Context, arg sqlc.UpdateAccountExpiryParams) (int64, error)
	UpdateAccountLastUpdate(ctx context.Context, arg sqlc.UpdateAccountLastUpdateParams) (int64, error)
	// UpdateAccountAliasForTests is a query intended only for testing
	// purposes, to change the account alias.
	UpdateAccountAliasForTests(ctx context.Context, arg sqlc.UpdateAccountAliasForTestsParams) (int64, error)
	UpsertAccountPayment(ctx context.Context, arg sqlc.UpsertAccountPaymentParams) error
	GetAccountInvoice(ctx context.Context, arg sqlc.GetAccountInvoiceParams) (sqlc.AccountInvoice, error)
}

// BatchedSQLQueries is a version of the SQLQueries that's capable
// of batched database operations.
type BatchedSQLQueries interface {
	SQLQueries

	db.BatchedTx[SQLQueries]
}

// SQLStore represents a storage backend.
type SQLStore struct {
	// db is all the higher level queries that the SQLStore has access to
	// in order to implement all its CRUD logic.
	db BatchedSQLQueries

	// BaseDB represents the underlying database connection.
	*db.BaseDB

	clock clock.Clock
}

// NewSQLStore creates a new SQLStore instance given an open BatchedSQLQueries
// storage backend.
func NewSQLStore(sqlDB *db.BaseDB, clock clock.Clock) *SQLStore {
	executor := db.NewTransactionExecutor(
		sqlDB, func(tx *sql.Tx) SQLQueries {
			return sqlDB.WithTx(tx)
		},
	)

	return &SQLStore{
		db:     executor,
		BaseDB: sqlDB,
		clock:  clock,
	}
}

// NewAccount creates and persists a new OffChainBalanceAccount with the given
// balance and a randomly chosen ID. If the given label is not empty, then it
// must be unique; if it is not, then ErrLabelAlreadyExists is returned.
//
// NOTE: This is part of the Store interface.
func (s *SQLStore) NewAccount(ctx context.Context, balance lnwire.MilliSatoshi,
	expirationDate time.Time, label string) (*OffChainBalanceAccount,
	error) {

	// Ensure that if a label is set, it can't be mistaken for a hex
	// encoded account ID to avoid confusion and make it easier for the CLI
	// to distinguish between the two.
	var labelVal sql.NullString
	if len(label) > 0 {
		if _, err := hex.DecodeString(label); err == nil &&
			len(label) == hex.EncodedLen(AccountIDLen) {

			return nil, fmt.Errorf("the label '%s' is not allowed "+
				"as it can be mistaken for an account ID",
				label)
		}

		labelVal = sql.NullString{
			String: label,
			Valid:  true,
		}
	}

	var (
		writeTxOpts db.QueriesTxOptions
		account     *OffChainBalanceAccount
	)
	err := s.db.ExecTx(ctx, &writeTxOpts, func(db SQLQueries) error {
		// First, find a unique alias (this is what the ID was in the
		// kvdb implementation of the DB).
		alias, err := uniqueRandomAccountAlias(ctx, db)
		if err != nil {
			return err
		}

		if labelVal.Valid {
			_, err = db.GetAccountByLabel(ctx, labelVal)
			if err == nil {
				return ErrLabelAlreadyExists
			} else if !errors.Is(err, sql.ErrNoRows) {
				return err
			}
		}

		id, err := db.InsertAccount(ctx, sqlc.InsertAccountParams{
			Type:               int16(TypeInitialBalance),
			InitialBalanceMsat: int64(balance),
			CurrentBalanceMsat: int64(balance),
			Expiration:         expirationDate.UTC(),
			LastUpdated:        s.clock.Now().UTC(),
			Label:              labelVal,
			Alias:              alias,
		})
		if err != nil {
			return fmt.Errorf("inserting account: %w", err)
		}

		account, err = getAndMarshalAccount(ctx, db, id)
		if err != nil {
			return fmt.Errorf("fetching account: %w", err)
		}

		return nil
	})
	if err != nil {
		return nil, err
	}

	return account, nil
}

// getAndMarshalAccount retrieves the account with the given ID. If the account
// cannot be found, then ErrAccNotFound is returned.
func getAndMarshalAccount(ctx context.Context, db SQLQueries, id int64) (
	*OffChainBalanceAccount, error) {

	dbAcct, err := db.GetAccount(ctx, id)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrAccNotFound
	} else if err != nil {
		return nil, err
	}

	return marshalDBAccount(ctx, db, dbAcct)
}

func marshalDBAccount(ctx context.Context, db SQLQueries,
	dbAcct sqlc.Account) (*OffChainBalanceAccount, error) {

	alias, err := AccountIDFromInt64(dbAcct.Alias)
	if err != nil {
		return nil, err
	}

	account := &OffChainBalanceAccount{
		ID:             alias,
		Type:           AccountType(dbAcct.Type),
		InitialBalance: lnwire.MilliSatoshi(dbAcct.InitialBalanceMsat),
		CurrentBalance: dbAcct.CurrentBalanceMsat,
		LastUpdate:     dbAcct.LastUpdated.UTC(),
		ExpirationDate: dbAcct.Expiration.UTC(),
		Invoices:       make(AccountInvoices),
		Payments:       make(AccountPayments),
		Label:          dbAcct.Label.String,
	}

	invoices, err := db.ListAccountInvoices(ctx, dbAcct.ID)
	if err != nil {
		return nil, err
	}
	for _, invoice := range invoices {
		var hash lntypes.Hash
		copy(hash[:], invoice.Hash)
		account.Invoices[hash] = struct{}{}
	}

	payments, err := db.ListAccountPayments(ctx, dbAcct.ID)
	if err != nil {
		return nil, err
	}

	for _, payment := range payments {
		var hash lntypes.Hash
		copy(hash[:], payment.Hash)
		account.Payments[hash] = &PaymentEntry{
			Status:     lnrpc.Payment_PaymentStatus(payment.Status),
			FullAmount: lnwire.MilliSatoshi(payment.FullAmountMsat),
		}
	}

	return account, nil
}

// uniqueRandomAccountAlias generates a random account alias that is not already
// in use. An account "alias" is a unique 8 byte identifier (which corresponds
// to the AccountID type) that is used to identify accounts in the database. The
// reason for using this alias in addition to the SQL auto-incremented ID is to
// remain backwards compatible with the kvdb implementation of the DB which only
// used the alias.
func uniqueRandomAccountAlias(ctx context.Context, db SQLQueries) (int64,
	error) {

	var (
		newAlias AccountID
		numTries = 10
	)
	for numTries > 0 {
		if _, err := rand.Read(newAlias[:]); err != nil {
			return 0, err
		}

		newAliasID, err := newAlias.ToInt64()
		if err != nil {
			return 0, err
		}

		_, err = db.GetAccountIDByAlias(ctx, newAliasID)
		if errors.Is(err, sql.ErrNoRows) {
			// No account found with this new ID, we can use it.
			return newAliasID, nil
		} else if err != nil {
			return 0, err
		}

		numTries--
	}

	return 0, fmt.Errorf("couldn't create new account ID")
}

// AddAccountInvoice adds and invoice hash to the account with the given
// AccountID alias.
//
// NOTE: This is part of the Store interface.
func (s *SQLStore) AddAccountInvoice(ctx context.Context, alias AccountID,
	hash lntypes.Hash) error {

	var writeTxOpts db.QueriesTxOptions
	return s.db.ExecTx(ctx, &writeTxOpts, func(db SQLQueries) error {
		acctID, err := getAccountIDByAlias(ctx, db, alias)
		if err != nil {
			return err
		}

		// First check that this invoice does not already exist.
		_, err = db.GetAccountInvoice(ctx, sqlc.GetAccountInvoiceParams{
			AccountID: acctID,
			Hash:      hash[:],
		})
		// If it does, there is nothing left to do.
		if err == nil {
			return nil
		} else if !errors.Is(err, sql.ErrNoRows) {
			return err
		}

		err = db.AddAccountInvoice(ctx, sqlc.AddAccountInvoiceParams{
			AccountID: acctID,
			Hash:      hash[:],
		})
		if err != nil {
			return err
		}

		return s.markAccountUpdated(ctx, db, acctID)
	})
}

func getAccountIDByAlias(ctx context.Context, db SQLQueries, alias AccountID) (
	int64, error) {

	aliasInt, err := alias.ToInt64()
	if err != nil {
		return 0, fmt.Errorf("error converting account alias into "+
			"int64: %w", err)
	}

	acctID, err := db.GetAccountIDByAlias(ctx, aliasInt)
	if errors.Is(err, sql.ErrNoRows) {
		return 0, ErrAccNotFound
	}

	return acctID, err
}

// markAccountUpdated is a helper that updates the last updated timestamp of
// the account with the given ID.
func (s *SQLStore) markAccountUpdated(ctx context.Context,
	db SQLQueries, id int64) error {

	_, err := db.UpdateAccountLastUpdate(
		ctx, sqlc.UpdateAccountLastUpdateParams{
			ID:          id,
			LastUpdated: s.clock.Now().UTC(),
		},
	)
	if errors.Is(err, sql.ErrNoRows) {
		return ErrAccNotFound
	}

	return err
}

// UpdateAccountBalanceAndExpiry updates the balance and/or expiry of an
// account.
//
// NOTE: This is part of the Store interface.
func (s *SQLStore) UpdateAccountBalanceAndExpiry(ctx context.Context,
	alias AccountID, newBalance fn.Option[int64],
	newExpiry fn.Option[time.Time]) error {

	var writeTxOpts db.QueriesTxOptions
	return s.db.ExecTx(ctx, &writeTxOpts, func(db SQLQueries) error {
		id, err := getAccountIDByAlias(ctx, db, alias)
		if err != nil {
			return err
		}

		newBalance.WhenSome(func(i int64) {
			_, err = db.UpdateAccountBalance(
				ctx, sqlc.UpdateAccountBalanceParams{
					ID:                 id,
					CurrentBalanceMsat: i,
				},
			)
		})
		if err != nil {
			return err
		}

		newExpiry.WhenSome(func(t time.Time) {
			_, err = db.UpdateAccountExpiry(
				ctx, sqlc.UpdateAccountExpiryParams{
					ID:         id,
					Expiration: t.UTC(),
				},
			)
		})
		if err != nil {
			return err
		}

		return s.markAccountUpdated(ctx, db, id)
	})
}

// CreditAccount increases the balance of the account with the given alias by
// the given amount.
//
// NOTE: This is part of the Store interface.
func (s *SQLStore) CreditAccount(ctx context.Context, alias AccountID,
	amount lnwire.MilliSatoshi) error {

	var writeTxOpts db.QueriesTxOptions
	return s.db.ExecTx(ctx, &writeTxOpts, func(db SQLQueries) error {
		id, err := getAccountIDByAlias(ctx, db, alias)
		if err != nil {
			return err
		}

		acct, err := db.GetAccount(ctx, id)
		if err != nil {
			return err
		}

		newBalance := acct.CurrentBalanceMsat + int64(amount)

		_, err = db.UpdateAccountBalance(
			ctx, sqlc.UpdateAccountBalanceParams{
				ID:                 id,
				CurrentBalanceMsat: newBalance,
			},
		)
		if err != nil {
			return err
		}

		return s.markAccountUpdated(ctx, db, id)
	})
}

// DebitAccount decreases the balance of the account with the given alias by the
// given amount.
//
// NOTE: This is part of the Store interface.
func (s *SQLStore) DebitAccount(ctx context.Context, alias AccountID,
	amount lnwire.MilliSatoshi) error {

	var writeTxOpts db.QueriesTxOptions
	return s.db.ExecTx(ctx, &writeTxOpts, func(db SQLQueries) error {
		id, err := getAccountIDByAlias(ctx, db, alias)
		if err != nil {
			return err
		}

		acct, err := db.GetAccount(ctx, id)
		if err != nil {
			return err
		}

		if acct.CurrentBalanceMsat-int64(amount) < 0 {
			return fmt.Errorf("cannot debit %v from the account "+
				"balance, as the resulting balance would be "+
				"below 0", int64(amount/1000))
		}

		newBalance := acct.CurrentBalanceMsat - int64(amount)

		_, err = db.UpdateAccountBalance(
			ctx, sqlc.UpdateAccountBalanceParams{
				ID:                 id,
				CurrentBalanceMsat: newBalance,
			},
		)
		if err != nil {
			return err
		}

		return s.markAccountUpdated(ctx, db, id)
	})
}

// Account retrieves an account from the SQL store and un-marshals it. If the
// account cannot be found, then ErrAccNotFound is returned.
//
// NOTE: This is part of the Store interface.
func (s *SQLStore) Account(ctx context.Context, alias AccountID) (
	*OffChainBalanceAccount, error) {

	var (
		readTxOpts = db.NewQueryReadTx()
		account    *OffChainBalanceAccount
	)
	err := s.db.ExecTx(ctx, &readTxOpts, func(db SQLQueries) error {
		id, err := getAccountIDByAlias(ctx, db, alias)
		if err != nil {
			return err
		}

		account, err = getAndMarshalAccount(ctx, db, id)
		return err
	})

	return account, err
}

// Accounts retrieves all accounts from the SQL store and un-marshals them.
//
// NOTE: This is part of the Store interface.
func (s *SQLStore) Accounts(ctx context.Context) ([]*OffChainBalanceAccount,
	error) {

	var (
		readTxOpts = db.NewQueryReadTx()
		accounts   []*OffChainBalanceAccount
	)
	err := s.db.ExecTx(ctx, &readTxOpts, func(db SQLQueries) error {
		dbAccounts, err := db.ListAllAccounts(ctx)
		if err != nil {
			return err
		}

		accounts = make([]*OffChainBalanceAccount, len(dbAccounts))
		for i, dbAccount := range dbAccounts {
			account, err := marshalDBAccount(ctx, db, dbAccount)
			if err != nil {
				return err
			}

			accounts[i] = account
		}

		return nil
	})

	return accounts, err
}

// RemoveAccount finds an account by its ID and removes it from the DB.
//
// NOTE: This is part of the Store interface.
func (s *SQLStore) RemoveAccount(ctx context.Context, alias AccountID) error {
	var writeTxOpts db.QueriesTxOptions
	return s.db.ExecTx(ctx, &writeTxOpts, func(db SQLQueries) error {
		id, err := getAccountIDByAlias(ctx, db, alias)
		if err != nil {
			return err
		}

		return db.DeleteAccount(ctx, id)
	})
}

// UpsertAccountPayment updates or inserts a payment entry for the given
// account. Various functional options can be passed to modify the behavior of
// the method. The returned boolean is true if the payment was already known
// before the update. This is to be treated as a best-effort indication if an
// error is also returned since the method may error before the boolean can be
// set correctly.
//
// NOTE: This is part of the Store interface.
func (s *SQLStore) UpsertAccountPayment(ctx context.Context, alias AccountID,
	hash lntypes.Hash, fullAmount lnwire.MilliSatoshi,
	status lnrpc.Payment_PaymentStatus,
	options ...UpsertPaymentOption) (bool, error) {

	opts := newUpsertPaymentOption()
	for _, o := range options {
		o(opts)
	}

	var (
		writeTxOpts db.QueriesTxOptions
		known       bool
	)
	return known, s.db.ExecTx(ctx, &writeTxOpts, func(db SQLQueries) error {
		id, err := getAccountIDByAlias(ctx, db, alias)
		if err != nil {
			return err
		}

		payment, err := db.GetAccountPayment(
			ctx, sqlc.GetAccountPaymentParams{
				AccountID: id,
				Hash:      hash[:],
			},
		)
		if err != nil && !errors.Is(err, sql.ErrNoRows) {
			return err
		}

		known = err == nil

		if known {
			currStatus := lnrpc.Payment_PaymentStatus(
				payment.Status,
			)
			if opts.errIfAlreadySucceeded &&
				successState(currStatus) {

				return ErrAlreadySucceeded
			}

			// If the errIfAlreadyPending option is set, we return
			// an error if the payment is already in-flight or
			// succeeded.
			if opts.errIfAlreadyPending &&
				currStatus != lnrpc.Payment_FAILED {

				return fmt.Errorf("payment with hash %s is "+
					"already in flight or succeeded "+
					"(status %v)", hash, currStatus)
			}

			if opts.usePendingAmount {
				fullAmount = lnwire.MilliSatoshi(
					payment.FullAmountMsat,
				)
			}
		} else if opts.errIfUnknown {
			return ErrPaymentNotAssociated
		}

		err = db.UpsertAccountPayment(
			ctx, sqlc.UpsertAccountPaymentParams{
				AccountID:      id,
				Hash:           hash[:],
				Status:         int16(status),
				FullAmountMsat: int64(fullAmount),
			},
		)
		if err != nil {
			return err
		}

		if opts.debitAccount {
			acct, err := db.GetAccount(ctx, id)
			if errors.Is(err, sql.ErrNoRows) {
				return ErrAccNotFound
			} else if err != nil {
				return err
			}

			newBalance := acct.CurrentBalanceMsat -
				int64(fullAmount)

			_, err = db.UpdateAccountBalance(
				ctx, sqlc.UpdateAccountBalanceParams{
					ID:                 id,
					CurrentBalanceMsat: newBalance,
				},
			)
			if errors.Is(err, sql.ErrNoRows) {
				return ErrAccNotFound
			} else if err != nil {
				return err
			}
		}

		return s.markAccountUpdated(ctx, db, id)
	})
}

// DeleteAccountPayment removes a payment entry from the account with the given
// ID. It will return an error if the payment is not associated with the
// account.
//
// NOTE: This is part of the Store interface.
func (s *SQLStore) DeleteAccountPayment(ctx context.Context, alias AccountID,
	hash lntypes.Hash) error {

	var writeTxOpts db.QueriesTxOptions
	return s.db.ExecTx(ctx, &writeTxOpts, func(db SQLQueries) error {
		id, err := getAccountIDByAlias(ctx, db, alias)
		if err != nil {
			return err
		}

		_, err = db.GetAccountPayment(
			ctx, sqlc.GetAccountPaymentParams{
				AccountID: id,
				Hash:      hash[:],
			},
		)
		if errors.Is(err, sql.ErrNoRows) {
			return fmt.Errorf("payment with hash %s is not "+
				"associated with this account: %w", hash,
				ErrPaymentNotAssociated)
		} else if err != nil {
			return err
		}

		err = db.DeleteAccountPayment(
			ctx, sqlc.DeleteAccountPaymentParams{
				AccountID: id,
				Hash:      hash[:],
			},
		)
		if err != nil {
			return err
		}

		return s.markAccountUpdated(ctx, db, id)
	})
}

// LastIndexes returns the last invoice add and settle index or
// ErrNoInvoiceIndexKnown if no indexes are known yet.
//
// NOTE: This is part of the Store interface.
func (s *SQLStore) LastIndexes(ctx context.Context) (uint64, uint64, error) {
	var (
		readTxOpts            = db.NewQueryReadTx()
		addIndex, settleIndex int64
	)
	err := s.db.ExecTx(ctx, &readTxOpts, func(db SQLQueries) error {
		var err error
		addIndex, err = db.GetAccountIndex(ctx, addIndexName)
		if errors.Is(err, sql.ErrNoRows) {
			return ErrNoInvoiceIndexKnown
		} else if err != nil {
			return err
		}

		settleIndex, err = db.GetAccountIndex(ctx, settleIndexName)
		if errors.Is(err, sql.ErrNoRows) {
			return ErrNoInvoiceIndexKnown
		}

		return err
	})

	return uint64(addIndex), uint64(settleIndex), err
}

// StoreLastIndexes stores the last invoice add and settle index.
//
// NOTE: This is part of the Store interface.
func (s *SQLStore) StoreLastIndexes(ctx context.Context, addIndex,
	settleIndex uint64) error {

	var writeTxOpts db.QueriesTxOptions
	return s.db.ExecTx(ctx, &writeTxOpts, func(db SQLQueries) error {
		err := db.SetAccountIndex(ctx, sqlc.SetAccountIndexParams{
			Name:  addIndexName,
			Value: int64(addIndex),
		})
		if err != nil {
			return err
		}

		return db.SetAccountIndex(ctx, sqlc.SetAccountIndexParams{
			Name:  settleIndexName,
			Value: int64(settleIndex),
		})
	})
}

// Close closes the underlying store.
//
// NOTE: This is part of the Store interface.
func (s *SQLStore) Close() error {
	return s.DB.Close()
}

// A compile-time check to ensure that SQLStore implements the Store interface.
var _ Store = (*SQLStore)(nil)
