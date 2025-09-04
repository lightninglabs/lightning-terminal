package accounts

import (
	"bytes"
	"context"
	"database/sql"
	"errors"
	"fmt"
	"math"
	"reflect"
	"time"

	"github.com/davecgh/go-spew/spew"
	"github.com/lightninglabs/lightning-terminal/db/sqlcmig6"
	"github.com/lightningnetwork/lnd/kvdb"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/lntypes"
	"github.com/lightningnetwork/lnd/lnwire"
	"github.com/pmezard/go-difflib/difflib"
)

var (
	// ErrMigrationMismatch is returned when the migrated account does not
	// match the original account.
	ErrMigrationMismatch = fmt.Errorf("migrated account does not match " +
		"original account")
)

// MigrateAccountStoreToSQL runs the migration of all accounts and indices from
// the KV database to the SQL database. The migration is done in a single
// transaction to ensure that all accounts are migrated or none at all.
func MigrateAccountStoreToSQL(ctx context.Context, kvStore kvdb.Backend,
	tx *sqlcmig6.Queries) error {

	log.Infof("Starting migration of the KV accounts store to SQL")

	err := migrateAccountsToSQL(ctx, kvStore, tx)
	if err != nil {
		return fmt.Errorf("unsuccessful migration of accounts to "+
			"SQL: %w", err)
	}

	err = migrateAccountsIndicesToSQL(ctx, kvStore, tx)
	if err != nil {
		return fmt.Errorf("unsuccessful migration of account indices "+
			"to SQL: %w", err)
	}

	return nil
}

// migrateAccountsToSQL runs the migration of all accounts from the KV database
// to the SQL database. The migration is done in a single transaction to ensure
// that all accounts are migrated or none at all.
func migrateAccountsToSQL(ctx context.Context, kvStore kvdb.Backend,
	tx *sqlcmig6.Queries) error {

	log.Infof("Starting migration of accounts from KV to SQL")

	kvAccounts, err := getBBoltAccounts(kvStore)
	if err != nil {
		return err
	}

	for _, kvAccount := range kvAccounts {
		migratedAccountID, err := migrateSingleAccountToSQL(
			ctx, tx, kvAccount,
		)
		if err != nil {
			return fmt.Errorf("unable to migrate account(%v): %w",
				kvAccount.ID, err)
		}

		migratedAccount, err := getAndMarshalMig6Account(
			ctx, tx, migratedAccountID,
		)
		if err != nil {
			return fmt.Errorf("unable to fetch migrated "+
				"account(%v): %w", kvAccount.ID, err)
		}

		overrideAccountTimeZone(kvAccount)
		overrideAccountTimeZone(migratedAccount)

		if !reflect.DeepEqual(kvAccount, migratedAccount) {
			diff := difflib.UnifiedDiff{
				A: difflib.SplitLines(
					spew.Sdump(kvAccount),
				),
				B: difflib.SplitLines(
					spew.Sdump(migratedAccount),
				),
				FromFile: "Expected",
				FromDate: "",
				ToFile:   "Actual",
				ToDate:   "",
				Context:  3,
			}
			diffText, _ := difflib.GetUnifiedDiffString(diff)

			return fmt.Errorf("%w: %v.\n%v", ErrMigrationMismatch,
				kvAccount.ID, diffText)
		}
	}

	log.Infof("All accounts migrated from KV to SQL. Total number of "+
		"accounts migrated: %d", len(kvAccounts))

	return nil
}

// getBBoltAccounts is a helper function that fetches all accounts from the
// Bbolt store, by iterating directly over the buckets, without needing to
// use any public functions of the BoltStore struct.
func getBBoltAccounts(db kvdb.Backend) ([]*OffChainBalanceAccount, error) {
	var accounts []*OffChainBalanceAccount
	err := db.View(func(tx kvdb.RTx) error {
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

// getAndMarshalAccount retrieves the account with the given ID. If the account
// cannot be found, then ErrAccNotFound is returned.
func getAndMarshalMig6Account(ctx context.Context, db *sqlcmig6.Queries,
	id int64) (*OffChainBalanceAccount, error) {

	dbAcct, err := db.GetAccount(ctx, id)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrAccNotFound
	} else if err != nil {
		return nil, err
	}

	return marshalDBMig6Account(ctx, db, dbAcct)
}

func marshalDBMig6Account(ctx context.Context, db *sqlcmig6.Queries,
	dbAcct sqlcmig6.Account) (*OffChainBalanceAccount, error) {

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

// migrateSingleAccountToSQL runs the migration for a single account from the
// KV database to the SQL database.
func migrateSingleAccountToSQL(ctx context.Context,
	tx *sqlcmig6.Queries, account *OffChainBalanceAccount) (int64, error) {

	accountAlias, err := account.ID.ToInt64()
	if err != nil {
		return 0, err
	}

	insertAccountParams := sqlcmig6.InsertAccountParams{
		Type:               int16(account.Type),
		InitialBalanceMsat: int64(account.InitialBalance),
		CurrentBalanceMsat: account.CurrentBalance,
		LastUpdated:        account.LastUpdate.UTC(),
		Alias:              accountAlias,
		Expiration:         account.ExpirationDate.UTC(),
		Label: sql.NullString{
			String: account.Label,
			Valid:  len(account.Label) > 0,
		},
	}

	sqlId, err := tx.InsertAccount(ctx, insertAccountParams)
	if err != nil {
		return 0, err
	}

	for hash := range account.Invoices {
		addInvoiceParams := sqlcmig6.AddAccountInvoiceParams{
			AccountID: sqlId,
			Hash:      hash[:],
		}

		err = tx.AddAccountInvoice(ctx, addInvoiceParams)
		if err != nil {
			return sqlId, err
		}
	}

	for hash, paymentEntry := range account.Payments {
		upsertPaymentParams := sqlcmig6.UpsertAccountPaymentParams{
			AccountID:      sqlId,
			Hash:           hash[:],
			Status:         int16(paymentEntry.Status),
			FullAmountMsat: int64(paymentEntry.FullAmount),
		}

		err = tx.UpsertAccountPayment(ctx, upsertPaymentParams)
		if err != nil {
			return sqlId, err
		}
	}

	return sqlId, nil
}

// migrateAccountsIndicesToSQL runs the migration for the account indices from
// the KV database to the SQL database.
func migrateAccountsIndicesToSQL(ctx context.Context, kvStore kvdb.Backend,
	tx *sqlcmig6.Queries) error {

	log.Infof("Starting migration of accounts indices from KV to SQL")

	addIndex, settleIndex, err := getBBoltIndices(kvStore)
	if errors.Is(err, ErrNoInvoiceIndexKnown) {
		log.Infof("No indices found in KV store, skipping migration")
		return nil
	} else if err != nil {
		return err
	}

	if addIndex > math.MaxInt64 {
		return fmt.Errorf("%s:%v is above max int64 value",
			addIndexName, addIndex)
	}

	if settleIndex > math.MaxInt64 {
		return fmt.Errorf("%s:%v is above max int64 value",
			settleIndexName, settleIndex)
	}

	setAddIndexParams := sqlcmig6.SetAccountIndexParams{
		Name:  addIndexName,
		Value: int64(addIndex),
	}

	err = tx.SetAccountIndex(ctx, setAddIndexParams)
	if err != nil {
		return err
	}

	setSettleIndexParams := sqlcmig6.SetAccountIndexParams{
		Name:  settleIndexName,
		Value: int64(settleIndex),
	}

	err = tx.SetAccountIndex(ctx, setSettleIndexParams)
	if err != nil {
		return err
	}

	log.Infof("Successfully migratated accounts indices from KV to SQL")

	return nil
}

// getBBoltIndices is a helper function that fetches the índices from the
// Bbolt store, by iterating directly over the buckets, without needing to
// use any public functions of the BoltStore struct.
func getBBoltIndices(db kvdb.Backend) (uint64, uint64, error) {
	var (
		addValue, settleValue []byte
	)
	err := db.View(func(tx kvdb.RTx) error {
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

// overrideAccountTimeZone overrides the time zone of the account to the local
// time zone and chops off the nanosecond part for comparison. This is needed
// because KV database stores times as-is which as an unwanted side effect would
// fail migration due to time comparison expecting both the original and
// migrated accounts to be in the same local time zone and in microsecond
// precision. Note that PostgresSQL stores times in microsecond precision while
// SQLite can store times in nanosecond precision if using TEXT storage class.
func overrideAccountTimeZone(account *OffChainBalanceAccount) {
	fixTime := func(t time.Time) time.Time {
		return t.In(time.Local).Truncate(time.Microsecond)
	}

	if !account.ExpirationDate.IsZero() {
		account.ExpirationDate = fixTime(account.ExpirationDate)
	}

	if !account.LastUpdate.IsZero() {
		account.LastUpdate = fixTime(account.LastUpdate)
	}
}
