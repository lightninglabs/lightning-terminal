package sqlcmig6

import (
	"context"
	"database/sql"
	"time"
)

const addAccountInvoice = `-- name: AddAccountInvoice :exec
INSERT INTO account_invoices (account_id, hash)
VALUES ($1, $2)
`

type AddAccountInvoiceParams struct {
	AccountID int64
	Hash      []byte
}

func (q *Queries) AddAccountInvoice(ctx context.Context, arg AddAccountInvoiceParams) error {
	_, err := q.db.ExecContext(ctx, addAccountInvoice, arg.AccountID, arg.Hash)
	return err
}

const deleteAccount = `-- name: DeleteAccount :exec
DELETE FROM accounts
WHERE id = $1
`

func (q *Queries) DeleteAccount(ctx context.Context, id int64) error {
	_, err := q.db.ExecContext(ctx, deleteAccount, id)
	return err
}

const deleteAccountPayment = `-- name: DeleteAccountPayment :exec
DELETE FROM account_payments
WHERE hash = $1
AND account_id = $2
`

type DeleteAccountPaymentParams struct {
	Hash      []byte
	AccountID int64
}

func (q *Queries) DeleteAccountPayment(ctx context.Context, arg DeleteAccountPaymentParams) error {
	_, err := q.db.ExecContext(ctx, deleteAccountPayment, arg.Hash, arg.AccountID)
	return err
}

const getAccount = `-- name: GetAccount :one
SELECT id, alias, label, type, initial_balance_msat, current_balance_msat, last_updated, expiration
FROM accounts
WHERE id = $1
`

func (q *Queries) GetAccount(ctx context.Context, id int64) (Account, error) {
	row := q.db.QueryRowContext(ctx, getAccount, id)
	var i Account
	err := row.Scan(
		&i.ID,
		&i.Alias,
		&i.Label,
		&i.Type,
		&i.InitialBalanceMsat,
		&i.CurrentBalanceMsat,
		&i.LastUpdated,
		&i.Expiration,
	)
	return i, err
}

const getAccountByLabel = `-- name: GetAccountByLabel :one
SELECT id, alias, label, type, initial_balance_msat, current_balance_msat, last_updated, expiration
FROM accounts
WHERE label = $1
`

func (q *Queries) GetAccountByLabel(ctx context.Context, label sql.NullString) (Account, error) {
	row := q.db.QueryRowContext(ctx, getAccountByLabel, label)
	var i Account
	err := row.Scan(
		&i.ID,
		&i.Alias,
		&i.Label,
		&i.Type,
		&i.InitialBalanceMsat,
		&i.CurrentBalanceMsat,
		&i.LastUpdated,
		&i.Expiration,
	)
	return i, err
}

const getAccountIDByAlias = `-- name: GetAccountIDByAlias :one
SELECT id
FROM accounts
WHERE alias = $1
`

func (q *Queries) GetAccountIDByAlias(ctx context.Context, alias int64) (int64, error) {
	row := q.db.QueryRowContext(ctx, getAccountIDByAlias, alias)
	var id int64
	err := row.Scan(&id)
	return id, err
}

const getAccountIndex = `-- name: GetAccountIndex :one
SELECT value
FROM account_indices
WHERE name = $1
`

func (q *Queries) GetAccountIndex(ctx context.Context, name string) (int64, error) {
	row := q.db.QueryRowContext(ctx, getAccountIndex, name)
	var value int64
	err := row.Scan(&value)
	return value, err
}

const getAccountInvoice = `-- name: GetAccountInvoice :one
SELECT account_id, hash
FROM  account_invoices
WHERE account_id = $1
  AND hash = $2
`

type GetAccountInvoiceParams struct {
	AccountID int64
	Hash      []byte
}

func (q *Queries) GetAccountInvoice(ctx context.Context, arg GetAccountInvoiceParams) (AccountInvoice, error) {
	row := q.db.QueryRowContext(ctx, getAccountInvoice, arg.AccountID, arg.Hash)
	var i AccountInvoice
	err := row.Scan(&i.AccountID, &i.Hash)
	return i, err
}

const getAccountPayment = `-- name: GetAccountPayment :one
SELECT account_id, hash, status, full_amount_msat FROM account_payments
WHERE hash = $1
AND account_id = $2
`

type GetAccountPaymentParams struct {
	Hash      []byte
	AccountID int64
}

func (q *Queries) GetAccountPayment(ctx context.Context, arg GetAccountPaymentParams) (AccountPayment, error) {
	row := q.db.QueryRowContext(ctx, getAccountPayment, arg.Hash, arg.AccountID)
	var i AccountPayment
	err := row.Scan(
		&i.AccountID,
		&i.Hash,
		&i.Status,
		&i.FullAmountMsat,
	)
	return i, err
}

const insertAccount = `-- name: InsertAccount :one
INSERT INTO accounts (type, initial_balance_msat, current_balance_msat, last_updated, label, alias, expiration)
VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id
`

type InsertAccountParams struct {
	Type               int16
	InitialBalanceMsat int64
	CurrentBalanceMsat int64
	LastUpdated        time.Time
	Label              sql.NullString
	Alias              int64
	Expiration         time.Time
}

func (q *Queries) InsertAccount(ctx context.Context, arg InsertAccountParams) (int64, error) {
	row := q.db.QueryRowContext(ctx, insertAccount,
		arg.Type,
		arg.InitialBalanceMsat,
		arg.CurrentBalanceMsat,
		arg.LastUpdated,
		arg.Label,
		arg.Alias,
		arg.Expiration,
	)
	var id int64
	err := row.Scan(&id)
	return id, err
}

const listAccountInvoices = `-- name: ListAccountInvoices :many
SELECT account_id, hash
FROM account_invoices
WHERE account_id = $1
`

func (q *Queries) ListAccountInvoices(ctx context.Context, accountID int64) ([]AccountInvoice, error) {
	rows, err := q.db.QueryContext(ctx, listAccountInvoices, accountID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []AccountInvoice
	for rows.Next() {
		var i AccountInvoice
		if err := rows.Scan(&i.AccountID, &i.Hash); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const listAccountPayments = `-- name: ListAccountPayments :many
SELECT account_id, hash, status, full_amount_msat
FROM account_payments
WHERE account_id = $1
`

func (q *Queries) ListAccountPayments(ctx context.Context, accountID int64) ([]AccountPayment, error) {
	rows, err := q.db.QueryContext(ctx, listAccountPayments, accountID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []AccountPayment
	for rows.Next() {
		var i AccountPayment
		if err := rows.Scan(
			&i.AccountID,
			&i.Hash,
			&i.Status,
			&i.FullAmountMsat,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const listAllAccounts = `-- name: ListAllAccounts :many
SELECT id, alias, label, type, initial_balance_msat, current_balance_msat, last_updated, expiration
FROM accounts
ORDER BY id
`

func (q *Queries) ListAllAccounts(ctx context.Context) ([]Account, error) {
	rows, err := q.db.QueryContext(ctx, listAllAccounts)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Account
	for rows.Next() {
		var i Account
		if err := rows.Scan(
			&i.ID,
			&i.Alias,
			&i.Label,
			&i.Type,
			&i.InitialBalanceMsat,
			&i.CurrentBalanceMsat,
			&i.LastUpdated,
			&i.Expiration,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const setAccountIndex = `-- name: SetAccountIndex :exec
INSERT INTO account_indices (name, value)
VALUES ($1, $2)
    ON CONFLICT (name)
DO UPDATE SET value = $2
`

type SetAccountIndexParams struct {
	Name  string
	Value int64
}

func (q *Queries) SetAccountIndex(ctx context.Context, arg SetAccountIndexParams) error {
	_, err := q.db.ExecContext(ctx, setAccountIndex, arg.Name, arg.Value)
	return err
}

const updateAccountBalance = `-- name: UpdateAccountBalance :one
UPDATE accounts
SET current_balance_msat = $1
WHERE id = $2
RETURNING id
`

type UpdateAccountBalanceParams struct {
	CurrentBalanceMsat int64
	ID                 int64
}

func (q *Queries) UpdateAccountBalance(ctx context.Context, arg UpdateAccountBalanceParams) (int64, error) {
	row := q.db.QueryRowContext(ctx, updateAccountBalance, arg.CurrentBalanceMsat, arg.ID)
	var id int64
	err := row.Scan(&id)
	return id, err
}

const updateAccountExpiry = `-- name: UpdateAccountExpiry :one
UPDATE accounts
SET expiration = $1
WHERE id = $2
RETURNING id
`

type UpdateAccountExpiryParams struct {
	Expiration time.Time
	ID         int64
}

func (q *Queries) UpdateAccountExpiry(ctx context.Context, arg UpdateAccountExpiryParams) (int64, error) {
	row := q.db.QueryRowContext(ctx, updateAccountExpiry, arg.Expiration, arg.ID)
	var id int64
	err := row.Scan(&id)
	return id, err
}

const updateAccountLastUpdate = `-- name: UpdateAccountLastUpdate :one
UPDATE accounts
SET last_updated = $1
WHERE id = $2
RETURNING id
`

type UpdateAccountLastUpdateParams struct {
	LastUpdated time.Time
	ID          int64
}

func (q *Queries) UpdateAccountLastUpdate(ctx context.Context, arg UpdateAccountLastUpdateParams) (int64, error) {
	row := q.db.QueryRowContext(ctx, updateAccountLastUpdate, arg.LastUpdated, arg.ID)
	var id int64
	err := row.Scan(&id)
	return id, err
}

const upsertAccountPayment = `-- name: UpsertAccountPayment :exec
INSERT INTO account_payments (account_id, hash, status, full_amount_msat)
VALUES ($1, $2, $3, $4)
ON CONFLICT (account_id, hash)
DO UPDATE SET status = $3, full_amount_msat = $4
`

type UpsertAccountPaymentParams struct {
	AccountID      int64
	Hash           []byte
	Status         int16
	FullAmountMsat int64
}

func (q *Queries) UpsertAccountPayment(ctx context.Context, arg UpsertAccountPaymentParams) error {
	_, err := q.db.ExecContext(ctx, upsertAccountPayment,
		arg.AccountID,
		arg.Hash,
		arg.Status,
		arg.FullAmountMsat,
	)
	return err
}
