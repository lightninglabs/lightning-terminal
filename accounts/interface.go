package accounts

import (
	"encoding/hex"
	"errors"
	"fmt"
	"time"

	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/lntypes"
	"github.com/lightningnetwork/lnd/lnwire"
	"gopkg.in/macaroon-bakery.v2/bakery"
)

const (
	// AccountIDLen is the length of the ID that is generated as a unique
	// identifier of an account. It is 8 bytes long so guessing is
	// improbable, but it's still not mistaken for a SHA256 hash.
	AccountIDLen = 8
)

// AccountType is an enum-like type which denotes the possible account types
// that can be referenced in macaroons to keep track of user's balances.
type AccountType uint8

const (
	// TypeInitialBalance represents an account that has an initial balance
	// that is used up when it is spent and is not replenished
	// automatically.
	TypeInitialBalance AccountType = 0

	// TODO(guggero): Add support for auto-replenishing (e.g. monthly
	// allowance) or spend-only (no invoice creation) accounts.
)

// AccountID represents an account's unique ID.
type AccountID [AccountIDLen]byte

// ParseAccountID attempts to parse a string as an account ID.
func ParseAccountID(idStr string) (*AccountID, error) {
	if len(idStr) != hex.EncodedLen(AccountIDLen) {
		return nil, fmt.Errorf("invalid account ID length")
	}

	idBytes, err := hex.DecodeString(idStr)
	if err != nil {
		return nil, fmt.Errorf("error decoding account ID: %w", err)
	}

	var id AccountID
	copy(id[:], idBytes)

	return &id, nil
}

// PaymentEntry is the data we track per payment that is associated with an
// account. This basically includes all information required to make sure
// in-flight payments don't exceed the total available account balance.
type PaymentEntry struct {
	// Status is the RPC status of the payment as reported by lnd.
	Status lnrpc.Payment_PaymentStatus

	// FullAmount is the total amount of the payment which includes the
	// payment amount and the estimated routing fee. The routing fee is
	// set to the fee limit set when sending the payment and updated to the
	// actual routing fee when the payment settles.
	FullAmount lnwire.MilliSatoshi
}

// AccountInvoices is the set of invoices that are associated with an account.
type AccountInvoices map[lntypes.Hash]struct{}

// AccountPayments is the set of payments that are associated with an account.
type AccountPayments map[lntypes.Hash]*PaymentEntry

// OffChainBalanceAccount holds all information that is needed to keep track of
// a user's off-chain account balance. This balance can only be spent by paying
// invoices.
type OffChainBalanceAccount struct {
	// ID is the randomly generated account identifier.
	ID AccountID

	// Type is the account type.
	Type AccountType

	// InitialBalance stores the initial balance in millisatoshis and is
	// never updated.
	InitialBalance lnwire.MilliSatoshi

	// CurrentBalance is the currently available balance of the account
	// in millisatoshis that is updated every time an invoice is paid. This
	// value can be negative (for example if the fees for a payment are
	// larger than the estimate made when checking the balance and the
	// account is close to zero value).
	CurrentBalance int64

	// LastUpdate keeps track of the last time the balance of the account
	// was updated.
	LastUpdate time.Time

	// ExpirationDate is a specific date in the future after which the
	// account is marked as expired. Can be set to zero for accounts that
	// never expire.
	ExpirationDate time.Time

	// Invoices is a list of all invoices that are associated with the
	// account.
	Invoices AccountInvoices

	// Payments is a list of all payments that are associated with the
	// account and the last status we were aware of.
	Payments AccountPayments

	// Label is an optional label that can be set for the account. If it is
	// not empty then it must be unique.
	Label string
}

// HasExpired returns true if the account has an expiration date set and that
// date is in the past.
func (a *OffChainBalanceAccount) HasExpired() bool {
	if a.ExpirationDate.IsZero() {
		return false
	}

	return a.ExpirationDate.Before(time.Now())
}

// CurrentBalanceSats returns the current account balance in satoshis.
func (a *OffChainBalanceAccount) CurrentBalanceSats() int64 {
	return a.CurrentBalance / 1000
}

var (
	// ErrAccountBucketNotFound specifies that there is no bucket for the
	// accounts in the DB yet which can/should only happen if the account
	// store has been corrupted or was initialized incorrectly.
	ErrAccountBucketNotFound = errors.New("account bucket not found")

	// ErrAccNotFound is returned if an account could not be found in the
	// local bolt DB.
	ErrAccNotFound = errors.New("account not found")

	// ErrNoInvoiceIndexKnown is the error that is returned by the store if
	// it does not yet have any invoice indexes stored.
	ErrNoInvoiceIndexKnown = errors.New("no invoice index known")

	// ErrAccExpired is returned if an account has an expiration date set
	// and that date is in the past.
	ErrAccExpired = errors.New("account has expired")

	// ErrAccBalanceInsufficient is returned if the amount required to
	// perform a certain action is larger than the current balance of the
	// account
	ErrAccBalanceInsufficient = errors.New("account balance insufficient")

	// ErrNotSupportedWithAccounts is the error that is returned when an RPC
	// is called that isn't supported to be handled by the account
	// interceptor.
	ErrNotSupportedWithAccounts = errors.New("this RPC call is not " +
		"supported with restricted account macaroons")

	// ErrAccountServiceDisabled is the error that is returned when the
	// account service has been disabled due to an error being thrown
	// in the service that cannot be recovered from.
	ErrAccountServiceDisabled = errors.New("the account service has been " +
		"stopped")

	// MacaroonPermissions are the permissions required for an account
	// macaroon.
	MacaroonPermissions = []bakery.Op{{
		Entity: "info",
		Action: "read",
	}, {
		Entity: "offchain",
		Action: "read",
	}, {
		Entity: "offchain",
		Action: "write",
	}, {
		Entity: "onchain",
		Action: "read",
	}, {
		Entity: "invoices",
		Action: "read",
	}, {
		Entity: "invoices",
		Action: "write",
	}, {
		Entity: "peers",
		Action: "read",
	}}
)

// Store is the main account store interface.
type Store interface {
	// NewAccount creates a new OffChainBalanceAccount with the given
	// balance and a randomly chosen ID.
	NewAccount(balance lnwire.MilliSatoshi, expirationDate time.Time,
		label string) (*OffChainBalanceAccount, error)

	// UpdateAccount writes an account to the database, overwriting the
	// existing one if it exists.
	UpdateAccount(account *OffChainBalanceAccount) error

	// Account retrieves an account from the Store and un-marshals it. If
	// the account cannot be found, then ErrAccNotFound is returned.
	Account(id AccountID) (*OffChainBalanceAccount, error)

	// Accounts retrieves all accounts from the store and un-marshals them.
	Accounts() ([]*OffChainBalanceAccount, error)

	// RemoveAccount finds an account by its ID and removes it from the¨
	// store.
	RemoveAccount(id AccountID) error

	// LastIndexes returns the last invoice add and settle index or
	// ErrNoInvoiceIndexKnown if no indexes are known yet.
	LastIndexes() (uint64, uint64, error)

	// StoreLastIndexes stores the last invoice add and settle index.
	StoreLastIndexes(addIndex, settleIndex uint64) error

	// Close closes the underlying store.
	Close() error
}

// Service is the main account service interface.
type Service interface {
	// CheckBalance ensures an account is valid and has a balance equal to
	// or larger than the amount that is required.
	CheckBalance(id AccountID, requiredBalance lnwire.MilliSatoshi) error

	// AssociateInvoice associates a generated invoice with the given
	// account, making it possible for the account to be credited in case
	// the invoice is paid.
	AssociateInvoice(id AccountID, hash lntypes.Hash) error

	// TrackPayment adds a new payment to be tracked to the service. If the
	// payment is eventually settled, its amount needs to be debited from
	// the given account.
	TrackPayment(id AccountID, hash lntypes.Hash,
		fullAmt lnwire.MilliSatoshi) error

	// RemovePayment removes a failed payment from the service because it no
	// longer needs to be tracked. The payment is certain to never succeed,
	// so we never need to debit the amount from the account.
	RemovePayment(hash lntypes.Hash) error

	// AssociatePayment associates a payment (hash) with the given account,
	// ensuring that the payment will be tracked for a user when LiT is
	// restarted.
	AssociatePayment(id AccountID, paymentHash lntypes.Hash,
		fullAmt lnwire.MilliSatoshi) error
}
