-- name: InsertAccount :one
INSERT INTO accounts (type, initial_balance_msat, current_balance_msat, last_updated, label, alias, expiration)
VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id;

-- name: UpdateAccountBalance :one
UPDATE accounts
SET current_balance_msat = $1
WHERE id = $2
RETURNING id;

-- name: DebitAccount :one
UPDATE accounts
SET current_balance_msat = current_balance_msat - sqlc.arg(amount)
WHERE id = sqlc.arg(id)
AND current_balance_msat >= sqlc.arg(amount)
RETURNING id;

-- name: UpdateAccountExpiry :one
UPDATE accounts
SET expiration = $1
WHERE id = $2
RETURNING id;

-- name: UpdateAccountLastUpdate :one
UPDATE accounts
SET last_updated = $1
WHERE id = $2
RETURNING id;

-- name: AddAccountInvoice :exec
INSERT INTO account_invoices (account_id, hash)
VALUES ($1, $2);

-- name: DeleteAccountPayment :exec
DELETE FROM account_payments
WHERE hash = $1
AND account_id = $2;

-- name: UpsertAccountPayment :exec
INSERT INTO account_payments (account_id, hash, status, full_amount_msat)
VALUES ($1, $2, $3, $4)
ON CONFLICT (account_id, hash)
DO UPDATE SET status = $3, full_amount_msat = $4;

-- name: GetAccountPayment :one
SELECT * FROM account_payments
WHERE hash = $1
AND account_id = $2;

-- name: GetAccount :one
SELECT *
FROM accounts
WHERE id = $1;

-- name: GetAccountIDByAlias :one
SELECT id
FROM accounts
WHERE alias = $1;

-- name: GetAccountByLabel :one
SELECT *
FROM accounts
WHERE label = $1;

-- name: DeleteAccount :exec
DELETE FROM accounts
WHERE id = $1;

-- name: ListAllAccounts :many
SELECT *
FROM accounts;

-- name: ListAccountPayments :many
SELECT *
FROM account_payments
WHERE account_id = $1;

-- name: ListAccountInvoices :many
SELECT *
FROM account_invoices
WHERE account_id = $1;

-- name: GetAccountInvoice :one
SELECT *
FROM  account_invoices
WHERE account_id = $1
  AND hash = $2;

-- name: SetAccountIndex :exec
INSERT INTO account_indices (name, value)
VALUES ($1, $2)
    ON CONFLICT (name)
DO UPDATE SET value = $2;

-- name: GetAccountIndex :one
SELECT value
FROM account_indices
WHERE name = $1;
