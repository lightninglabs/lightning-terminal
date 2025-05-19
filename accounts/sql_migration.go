package accounts

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"math"
	"reflect"
	"time"

	"github.com/davecgh/go-spew/spew"
	"github.com/lightninglabs/lightning-terminal/db/sqlc"
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
func MigrateAccountStoreToSQL(ctx context.Context, kvStore *BoltStore,
	tx SQLQueries) error {

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
func migrateAccountsToSQL(ctx context.Context, kvStore *BoltStore,
	tx SQLQueries) error {

	log.Infof("Starting migration of accounts from KV to SQL")

	kvAccounts, err := kvStore.Accounts(ctx)
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

		migratedAccount, err := getAndMarshalAccount(
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

// migrateSingleAccountToSQL runs the migration for a single account from the
// KV database to the SQL database.
func migrateSingleAccountToSQL(ctx context.Context,
	tx SQLQueries, account *OffChainBalanceAccount) (int64, error) {

	accountAlias, err := account.ID.ToInt64()
	if err != nil {
		return 0, err
	}

	insertAccountParams := sqlc.InsertAccountParams{
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
		addInvoiceParams := sqlc.AddAccountInvoiceParams{
			AccountID: sqlId,
			Hash:      hash[:],
		}

		err = tx.AddAccountInvoice(ctx, addInvoiceParams)
		if err != nil {
			return sqlId, err
		}
	}

	for hash, paymentEntry := range account.Payments {
		upsertPaymentParams := sqlc.UpsertAccountPaymentParams{
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
func migrateAccountsIndicesToSQL(ctx context.Context, kvStore *BoltStore,
	tx SQLQueries) error {

	log.Infof("Starting migration of accounts indices from KV to SQL")

	addIndex, settleIndex, err := kvStore.LastIndexes(ctx)
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

	setAddIndexParams := sqlc.SetAccountIndexParams{
		Name:  addIndexName,
		Value: int64(addIndex),
	}

	err = tx.SetAccountIndex(ctx, setAddIndexParams)
	if err != nil {
		return err
	}

	setSettleIndexParams := sqlc.SetAccountIndexParams{
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
