package accounts

import (
	"context"
	"encoding/hex"
	"errors"
	"fmt"
	"time"

	"github.com/lightningnetwork/lnd/fn"
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

// String returns the string representation of the AccountID.
func (a AccountID) String() string {
	return hex.EncodeToString(a[:])
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

	return a.ExpirationDate.Before(time.Now().UTC())
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
	NewAccount(ctx context.Context, balance lnwire.MilliSatoshi,
		expirationDate time.Time, label string) (
		*OffChainBalanceAccount, error)

	// Account retrieves an account from the Store and un-marshals it. If
	// the account cannot be found, then ErrAccNotFound is returned.
	Account(ctx context.Context, id AccountID) (*OffChainBalanceAccount,
		error)

	// Accounts retrieves all accounts from the store and un-marshals them.
	Accounts(ctx context.Context) ([]*OffChainBalanceAccount, error)

	// UpdateAccountBalanceAndExpiry updates the balance and/or expiry of an
	// account.
	UpdateAccountBalanceAndExpiry(ctx context.Context, id AccountID,
		newBalance fn.Option[int64],
		newExpiry fn.Option[time.Time]) error

	// AddAccountInvoice adds an invoice hash to an account.
	AddAccountInvoice(ctx context.Context, id AccountID,
		hash lntypes.Hash) error

	// IncreaseAccountBalance increases the balance of the account with the
	// given ID by the given amount.
	IncreaseAccountBalance(ctx context.Context, id AccountID,
		amount lnwire.MilliSatoshi) error

	// UpsertAccountPayment updates or inserts a payment entry for the given
	// account. Various functional options can be passed to modify the
	// behavior of the method. The returned boolean is true if the payment
	// was already known before the update. This is to be treated as a
	// best-effort indication if an error is also returned since the method
	// may error before the boolean can be set correctly.
	UpsertAccountPayment(_ context.Context, id AccountID,
		paymentHash lntypes.Hash, fullAmount lnwire.MilliSatoshi,
		status lnrpc.Payment_PaymentStatus,
		options ...UpsertPaymentOption) (bool, error)

	// DeleteAccountPayment removes a payment entry from the account with
	// the given ID. It will return the ErrPaymentNotAssociated error if the
	// payment is not associated with the account.
	DeleteAccountPayment(_ context.Context, id AccountID,
		hash lntypes.Hash) error

	// RemoveAccount finds an account by its ID and removes it from the¨
	// store.
	RemoveAccount(ctx context.Context, id AccountID) error

	// LastIndexes returns the last invoice add and settle index or
	// ErrNoInvoiceIndexKnown if no indexes are known yet.
	LastIndexes(ctx context.Context) (uint64, uint64, error)

	// StoreLastIndexes stores the last invoice add and settle index.
	StoreLastIndexes(ctx context.Context, addIndex,
		settleIndex uint64) error

	// Close closes the underlying store.
	Close() error
}

// Service is the main account service interface.
type Service interface {
	// CheckBalance ensures an account is valid and has a balance equal to
	// or larger than the amount that is required.
	CheckBalance(ctx context.Context, id AccountID,
		requiredBalance lnwire.MilliSatoshi) error

	// AssociateInvoice associates a generated invoice with the given
	// account, making it possible for the account to be credited in case
	// the invoice is paid.
	AssociateInvoice(ctx context.Context, id AccountID,
		hash lntypes.Hash) error

	// TrackPayment adds a new payment to be tracked to the service. If the
	// payment is eventually settled, its amount needs to be debited from
	// the given account.
	TrackPayment(ctx context.Context, id AccountID, hash lntypes.Hash,
		fullAmt lnwire.MilliSatoshi) error

	// RemovePayment removes a failed payment from the service because it no
	// longer needs to be tracked. The payment is certain to never succeed,
	// so we never need to debit the amount from the account.
	RemovePayment(ctx context.Context, hash lntypes.Hash) error

	// AssociatePayment associates a payment (hash) with the given account,
	// ensuring that the payment will be tracked for a user when LiT is
	// restarted.
	AssociatePayment(ctx context.Context, id AccountID,
		paymentHash lntypes.Hash, fullAmt lnwire.MilliSatoshi) error

	// PaymentErrored removes a pending payment from the accounts
	// registered payment list. This should only ever be called if we are
	// sure that the payment request errored out.
	PaymentErrored(ctx context.Context, id AccountID,
		hash lntypes.Hash) error

	RequestValuesStore
}

// RequestValues holds various values associated with a specific request that
// we may want access to when handling the response. At the moment this only
// stores payment related data.
type RequestValues struct {
	// PaymentHash is the hash of the payment that this request is
	// associated with.
	PaymentHash lntypes.Hash

	// PaymentAmount is the value of the payment being made.
	PaymentAmount lnwire.MilliSatoshi
}

// RequestValuesStore is a store that can be used to keep track of the mapping
// between a request ID and various values associated with that request which
// we may want access to when handling the request response.
type RequestValuesStore interface {
	// RegisterValues stores values for the given request ID.
	RegisterValues(reqID uint64, values *RequestValues) error

	// GetValues returns the corresponding request values for the given
	// request ID if they exist.
	GetValues(reqID uint64) (*RequestValues, bool)

	// DeleteValues deletes any values stored for the given request ID.
	DeleteValues(reqID uint64)
}

// UpsertPaymentOption is a functional option that can be passed to the
// UpsertAccountPayment method to modify its behavior.
type UpsertPaymentOption func(*upsertAcctPaymentOption)

// upsertAcctPaymentOption is a struct that holds optional parameters for the
// UpsertAccountPayment method.
type upsertAcctPaymentOption struct {
	debitAccount          bool
	errIfAlreadyPending   bool
	usePendingAmount      bool
	errIfAlreadySucceeded bool
	errIfUnknown          bool
}

// newUpsertPaymentOption creates a new upsertAcctPaymentOption with default
// values.
func newUpsertPaymentOption() *upsertAcctPaymentOption {
	return &upsertAcctPaymentOption{
		debitAccount:          false,
		errIfAlreadyPending:   false,
		usePendingAmount:      false,
		errIfAlreadySucceeded: false,
		errIfUnknown:          false,
	}
}

// WithDebitAccount is a functional option that can be passed to the
// UpsertAccountPayment method to indicate that the account balance should be
// debited by the full amount of the payment.
func WithDebitAccount() UpsertPaymentOption {
	return func(o *upsertAcctPaymentOption) {
		o.debitAccount = true
	}
}

// WithErrIfAlreadyPending is a functional option that can be passed to the
// UpsertAccountPayment method to indicate that an error should be returned if
// the payment is already pending or succeeded.
func WithErrIfAlreadyPending() UpsertPaymentOption {
	return func(o *upsertAcctPaymentOption) {
		o.errIfAlreadyPending = true
	}
}

// WithErrIfAlreadySucceeded is a functional option that can be passed to the
// UpsertAccountPayment method to indicate that the ErrAlreadySucceeded error
// should be returned if the payment is already in a succeeded state.
func WithErrIfAlreadySucceeded() UpsertPaymentOption {
	return func(o *upsertAcctPaymentOption) {
		o.errIfAlreadySucceeded = true
	}
}

// WithPendingAmount is a functional option that can be passed to the
// UpsertAccountPayment method to indicate that if the payment already exists,
// then the known payment amount should be used instead of the new value passed
// to the method.
func WithPendingAmount() UpsertPaymentOption {
	return func(o *upsertAcctPaymentOption) {
		o.usePendingAmount = true
	}
}

// WithErrIfUnknown is a functional option that can be passed to the
// UpsertAccountPayment method to indicate that the ErrPaymentNotAssociated
// error should be returned if the payment is not associated with the account.
func WithErrIfUnknown() UpsertPaymentOption {
	return func(o *upsertAcctPaymentOption) {
		o.errIfUnknown = true
	}
}
