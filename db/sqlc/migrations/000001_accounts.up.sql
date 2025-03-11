CREATE TABLE IF NOT EXISTS accounts (
    -- The auto incrementing primary key.
    id INTEGER PRIMARY KEY,

    -- The ID that was used to identify the account in the legacy KVDB store.
    -- In order to avoid breaking the API, we keep this field here so that
    -- we can still look up accounts by this ID for the time being.
    alias BIGINT NOT NULL UNIQUE,

    -- An optional label to use for the account. If it is set, it must be
    -- unique.
    label TEXT UNIQUE,

    -- The account type.
    type SMALLINT NOT NULL,

    -- The accounts initial balance. This is never updated.
    initial_balance_msat BIGINT NOT NULL,

    -- The accounts current balance. This is updated as the account is used.
    current_balance_msat BIGINT NOT NULL,

    -- The last time the account was updated.
    last_updated TIMESTAMP NOT NULL,

    -- The time that the account will expire.
    expiration TIMESTAMP NOT NULL
);

-- The account_payments table stores all the payment hashes of outgoing
-- payments that are associated with a particular account. These are used to
-- when an account should be debited.
CREATE TABLE IF NOT EXISTS account_payments (
    -- The account that this payment is linked to.
    account_id BIGINT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,

    -- The payment hash of the payment.
    hash BLOB NOT NULL,

    -- The LND RPC status of the payment.
    status SMALLINT NOT NULL,

    -- The total amount of the payment in millisatoshis.
    -- This includes the payment amount and estimated routing fee.
    full_amount_msat BIGINT NOT NULL
);

CREATE UNIQUE INDEX account_payments_unique ON account_payments (
    account_id, hash
);

-- The account_invoices table stores all the invoice payment hashes that
-- are associated with a particular account. These are used to determine
-- when an account should be credited.
CREATE TABLE IF NOT EXISTS account_invoices (
    -- The account that this invoice is linked to.
    account_id BIGINT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,

    -- The payment hash of the invoice.
    hash BLOB NOT NULL
);

CREATE UNIQUE INDEX account_invoices_unique ON account_invoices (
    account_id, hash
);

-- The account_indices table stores any string-to-integer mappings that are
-- used by the accounts system.
CREATE TABLE IF NOT EXISTS account_indices (
    -- The unique name of the index.
    name TEXT NOT NULL UNIQUE,

    -- The current value of the index.
    value BIGINT NOT NULL
);