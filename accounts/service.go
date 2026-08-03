package accounts

import (
	"context"
	"errors"
	"fmt"
	"sync"
	"time"

	"github.com/btcsuite/btcd/btcutil"
	"github.com/btcsuite/btcd/chaincfg"
	"github.com/lightninglabs/lndclient"
	"github.com/lightningnetwork/lnd/fn"
	invpkg "github.com/lightningnetwork/lnd/invoices"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/lntypes"
	"github.com/lightningnetwork/lnd/lnwire"
	paymentsdb "github.com/lightningnetwork/lnd/payments/db"
)

// Config holds the configuration options for the accounts service.
//
//nolint:ll
type Config struct {
	// Disable will disable the accounts service if set.
	Disable bool `long:"disable" description:"disable the accounts service"`

	// MaxPaymentSizeMsat, when greater than zero, is the maximum value (in
	// millisatoshis) that a single account payment may have. Payments whose
	// amount exceeds this cap are rejected by the account interceptor. This
	// provides a guard rail against a compromised or misbehaving account
	// macaroon draining its balance in a single large payment.
	//
	// It defaults to 0, which disables the cap and preserves the historical
	// behaviour of allowing payments up to the full account balance.
	MaxPaymentSizeMsat uint64 `long:"max-payment-size-msat" description:"the maximum total amount in millisatoshis, including fees, that a single account payment may debit; 0 (the default value) disables the cap"`

	// CheckChannelBalance, when set, makes the accounts service reject
	// account balance allocations (new accounts, administrative credits and
	// administrative balance increases) that would push the sum of all
	// account balances above the node's available total local (outbound)
	// channel balance.
	//
	// It defaults to false to preserve the historical behaviour, where the
	// operator is trusted to manage over-provisioning themselves; accounts
	// can legitimately be created before channels are opened or funded.
	//
	// NOTE: The total channel balance may still decrease below the already
	// allocated account balance. This can occur if the node operator
	// decreases the total channel balance through non-account related
	// activity.
	CheckChannelBalance bool `long:"check-channel-balance" description:"reject account balance allocations that would push the sum of all account balances above the node's available local channel balance. Note that the total channel balance can still decrease below the already allocated account balance. This can occur if the node operator decreases the total channel balance through non-account related activity."`
}

// trackedPayment is a struct that holds all information that identifies a
// payment that we are tracking in the service.
type trackedPayment struct {
	// accountID is the ID of the account the payment was associated with.
	accountID AccountID

	// hash is the payment hash of the payment.
	hash lntypes.Hash

	// fullAmount is the total in-flight amount of the payment which
	// includes the payment amount and the estimated routing fee. The
	// routing fee is estimated based on the fee limit set when sending the
	// payment and might be higher than the actual routing fee.
	fullAmount lnwire.MilliSatoshi

	// cancel is the context cancel function that can be called to abort the
	// TrackPayment RPC stream.
	cancel context.CancelFunc
}

// InterceptorService is an account storage and interceptor for accounting based
// macaroon balances and utility methods to manage accounts.
type InterceptorService struct {
	// RWMutex is the read/write mutex that guards all fields that can be
	// accessed by multiple goroutines at the same time, such as the store
	// or pending payments.
	sync.RWMutex

	store Store

	routerClient    lndclient.RouterClient
	lightningClient lndclient.LightningClient

	// checkChannelBalance, when set, makes the service reject account
	// balance allocations that would exceed the node's available local
	// channel balance. See Config.CheckChannelBalance.
	checkChannelBalance bool

	// maxPaymentSize, when greater than zero, is the maximum value that a
	// single account payment may have. See Config.MaxPaymentSizeMsat.
	maxPaymentSize lnwire.MilliSatoshi

	mainCtx       context.Context
	contextCancel fn.Option[context.CancelFunc]

	requestMtx sync.Mutex
	checkers   *AccountChecker

	currentAddIndex    uint64
	currentSettleIndex uint64

	invoiceToAccount map[lntypes.Hash]AccountID
	pendingPayments  map[lntypes.Hash]*trackedPayment

	*requestValuesStore

	mainErrCallback func(error)
	wg              sync.WaitGroup
	quit            chan struct{}

	isEnabled bool
}

// ServiceOption is a functional option that can be used to modify the behaviour
// of the InterceptorService.
type ServiceOption func(*InterceptorService)

// WithMaxPaymentSize sets the maximum value that a single account payment may
// have. A value of zero (the default) disables the cap.
func WithMaxPaymentSize(maxPaymentSize lnwire.MilliSatoshi) ServiceOption {
	return func(s *InterceptorService) {
		s.maxPaymentSize = maxPaymentSize
	}
}

// WithChannelBalanceCheck enables validation that the sum of all account
// balances never exceeds the node's available local channel balance when
// allocating account balances (new accounts, credits and balance increases).
func WithChannelBalanceCheck() ServiceOption {
	return func(s *InterceptorService) {
		s.checkChannelBalance = true
	}
}

// NewService returns a service backed by the macaroon Bolt DB stored in the
// passed-in directory.
func NewService(store Store, errCallback func(error),
	opts ...ServiceOption) (*InterceptorService, error) {

	s := &InterceptorService{
		store:              store,
		invoiceToAccount:   make(map[lntypes.Hash]AccountID),
		pendingPayments:    make(map[lntypes.Hash]*trackedPayment),
		requestValuesStore: newRequestValuesStore(),
		mainErrCallback:    errCallback,
		quit:               make(chan struct{}),
		isEnabled:          false,
	}

	for _, opt := range opts {
		opt(s)
	}

	return s, nil
}

// Start starts the account service and its interceptor capability.
func (s *InterceptorService) Start(ctx context.Context,
	lightningClient lndclient.LightningClient,
	routerClient lndclient.RouterClient, params *chaincfg.Params) error {

	mainCtx, contextCancel := context.WithCancel(ctx)
	s.mainCtx = mainCtx
	s.contextCancel = fn.Some(contextCancel)

	s.routerClient = routerClient
	s.lightningClient = lightningClient
	s.checkers = NewAccountChecker(s, params, s.maxPaymentSize)

	s.isEnabled = true

	// Let's first fill our cache that maps invoices to accounts, which
	// allows us to credit an account easily once an invoice is settled. We
	// also track payments that aren't in a final state yet.
	existingAccounts, err := s.store.Accounts(ctx)
	if err != nil {
		return s.disableAndErrorf("error querying existing "+
			"accounts: %w", err)
	}
	for _, acct := range existingAccounts {
		acct := acct
		for invoice := range acct.Invoices {
			invoice := invoice
			s.invoiceToAccount[invoice] = acct.ID
		}

		// Let's also resume tracking payments that have a last recorded
		// state of being in-flight.
		for hash, entry := range acct.Payments {
			entry := entry
			if !successState(entry.Status) {
				err := s.TrackPayment(
					ctx, acct.ID, hash, entry.FullAmount,
				)
				if err != nil {
					return s.disableAndErrorf("error "+
						"tracking payment: %w", err)
				}
			}
		}
	}

	// First ask our DB about the highest indexes we know. If this is the
	// first startup then the ErrNoInvoiceIndexKnown error is returned, and
	// we know we need to do a lookup.
	s.currentAddIndex, s.currentSettleIndex, err = s.store.LastIndexes(ctx)
	switch err {
	case nil:
		// All good, we stored indexes in the DB, use those values.

	case ErrNoInvoiceIndexKnown:
		// We don't have any invoice indexes stored yet, so this must be
		// our first startup. We only care about new invoices being
		// settled as those could potentially be payments to accounts.
		// We don't care about existing invoices since we only get here
		// if we start up the account system for the first time and
		// there are no accounts yet. We don't really care about new
		// invoices being added either since we'll inspect the RPC call
		// in the interceptor if a new invoice is created by an account.
		// Therefore, we only really care about future, settled
		// invoices, which the subscription will deliver to us.
		s.currentAddIndex = 0
		s.currentSettleIndex = 0

	default:
		return s.disableAndErrorf("error determining last invoice "+
			"indexes: %w", err)
	}

	invoiceChan, invoiceErrChan, err := lightningClient.SubscribeInvoices(
		s.mainCtx, lndclient.InvoiceSubscriptionRequest{
			AddIndex:    s.currentAddIndex,
			SettleIndex: s.currentSettleIndex,
		},
	)
	if err != nil {
		return s.disableAndErrorf("error subscribing invoices: %w", err)
	}

	s.wg.Add(1)
	go func() {
		defer s.wg.Done()
		defer contextCancel()

		for {
			select {
			case invoice := <-invoiceChan:
				// Don't panic if the invoice channel is closed.
				if invoice == nil {
					log.Infof("Invoice subscription closed")
					return
				}

				err := s.invoiceUpdate(ctx, invoice)
				if err != nil {
					log.Errorf("Error processing invoice "+
						"update: %v", err)

					s.mainErrCallback(err)
					return
				}

			case err := <-invoiceErrChan:
				// If the invoice subscription errors out, we
				// stop the service as we won't be able to
				// process invoices.
				err = s.disableAndErrorf("Error in invoice "+
					"subscription: %w", err)

				s.mainErrCallback(err)
				return

			case <-s.mainCtx.Done():
				return

			case <-s.quit:
				return
			}
		}
	}()

	return nil
}

// Stop shuts down the account service.
func (s *InterceptorService) Stop() error {
	// We need to lock the request mutex to ensure that we don't stop the
	// service while we're processing a request.
	// This is especially important to ensure that we don't stop the service
	// exactly after a user has made an rpc call to send a payment we can't
	// know the payment hash for prior to the actual payment being sent
	// (i.e. Keysend or SendToRoute). This is because if we stop the service
	// after the send request has been sent to lnd, but before TrackPayment
	// has been called, we won't be able to track the payment and debit the
	// account.
	s.requestMtx.Lock()
	defer s.requestMtx.Unlock()

	s.contextCancel.WhenSome(func(fn context.CancelFunc) { fn() })
	close(s.quit)
	s.wg.Wait()

	return nil
}

// IsRunning checks if the account service is running, and returns a boolean
// indicating whether it is running or not.
func (s *InterceptorService) IsRunning() bool {
	s.RLock()
	defer s.RUnlock()

	return s.isEnabled
}

// isRunningUnsafe checks if the account service is running, and returns a
// boolean indicating whether it is running or not
//
// NOTE: The store lock MUST be held as either a read or write lock when calling
// this method.
func (s *InterceptorService) isRunningUnsafe() bool {
	return s.isEnabled
}

// disable disables the account service, and marks the service as not running.
// The function acquires the store write lock before disabling the service.
// The function returns an error with the given format and arguments.
func (s *InterceptorService) disableAndErrorf(format string, a ...any) error {
	s.Lock()
	defer s.Unlock()

	s.isEnabled = false

	return fmt.Errorf(format, a...)
}

// disableAndErrorfUnsafe disables the account service, and marks the service as
// not running. The function returns an error with the given format and
// arguments.
//
// NOTE: The store lock MUST be held when calling this method.
func (s *InterceptorService) disableAndErrorfUnsafe(format string,
	a ...any) error {

	s.isEnabled = false

	return fmt.Errorf(format, a...)
}

// NewAccount creates a new OffChainBalanceAccount with the given balance and a
// randomly chosen ID.
func (s *InterceptorService) NewAccount(ctx context.Context,
	balance lnwire.MilliSatoshi,
	expirationDate time.Time, label string) (*OffChainBalanceAccount,
	error) {

	availableChannelBalance, err := s.fetchChannelBalance(ctx)
	if err != nil {
		return nil, err
	}

	s.Lock()
	defer s.Unlock()

	// Make sure allocating this account's balance doesn't over-provision
	// the node's available local channel balance (no-op unless enabled).
	if err := s.checkChannelBalanceReservationUnsafe(
		ctx, balance, availableChannelBalance,
	); err != nil {
		return nil, err
	}

	return s.store.NewAccount(ctx, balance, expirationDate, label)
}

// UpdateAccount writes an account to the database, overwriting the existing one
// if it exists.
func (s *InterceptorService) UpdateAccount(ctx context.Context,
	accountID AccountID, accountBalance btcutil.Amount,
	expirationDate int64, newLabel string) (*OffChainBalanceAccount,
	error) {

	// Convert the requested account balance to millisatoshis. An empty
	// option signals that the stored balance should not be updated.
	var (
		balance                 fn.Option[int64]
		availableChannelBalance lnwire.MilliSatoshi
		err                     error
	)

	if accountBalance >= 0 {
		// If the new account balance was set, parse it as
		// millisatoshis. A value of -1 signals "don't update the
		// balance".
		balance = fn.Some(int64(
			// Convert from satoshis to millisatoshis for storage.
			lnwire.NewMSatFromSatoshis(accountBalance),
		))

		availableChannelBalance, err = s.fetchChannelBalance(ctx)
		if err != nil {
			return nil, err
		}
	}

	s.Lock()
	defer s.Unlock()

	// As this function updates account balances, we require that the
	// service is running before we execute it.
	if !s.isRunningUnsafe() {
		// This case can only happen if the service is disabled while
		// we we're processing a request.
		return nil, ErrAccountServiceDisabled
	}

	// If the expiration date was set, parse it as a unix time stamp. A
	// value of -1 signals "don't update the expiration date".
	var expiry fn.Option[time.Time]
	if expirationDate > 0 {
		expiry = fn.Some(time.Unix(expirationDate, 0))
	} else if expirationDate == 0 {
		// Setting the expiration to 0 means don't expire in which case
		// we use a zero time (zero unix time would still be 1970, so
		// that doesn't work for us).
		expiry = fn.Some(time.Time{})
	}

	// If a new label was provided, wrap it in an option. An empty
	// string is treated as "no update requested" because protobuf
	// cannot distinguish an absent field from the zero value "".
	var label fn.Option[string]
	if newLabel != "" {
		label = fn.Some(newLabel)
	}

	// If the balance is being increased, make sure the increase doesn't
	// over-provision the node's available local channel balance (no-op
	// unless the `checkChannelBalance` option is enabled).
	if balance.IsSome() && s.checkChannelBalance {
		acct, err := s.store.Account(ctx, accountID)
		if err != nil {
			return nil, fmt.Errorf("fetching account: %w", err)
		}

		newBalanceMsat := balance.UnwrapOr(0)
		requestedBalanceIncrease := newBalanceMsat - acct.CurrentBalance

		if requestedBalanceIncrease > 0 {
			err := s.checkChannelBalanceReservationUnsafe(
				ctx,
				lnwire.MilliSatoshi(requestedBalanceIncrease),
				availableChannelBalance,
			)
			if err != nil {
				return nil, err
			}
		}
	}

	// Create the actual account in the macaroon account store.
	err = s.store.UpdateAccount(ctx, accountID, balance, expiry, label)
	if err != nil {
		return nil, fmt.Errorf("unable to update account: %w", err)
	}

	return s.store.Account(ctx, accountID)
}

// CreditAccount increases the balance of an existing account in the database.
func (s *InterceptorService) CreditAccount(ctx context.Context,
	accountID AccountID,
	amount lnwire.MilliSatoshi) (*OffChainBalanceAccount, error) {

	availableChannelBalance, err := s.fetchChannelBalance(ctx)
	if err != nil {
		return nil, err
	}

	s.Lock()
	defer s.Unlock()

	// As this function updates account balances, we require that the
	// service is running before we execute it.
	if !s.isRunningUnsafe() {
		// This case can only happen if the service is disabled while
		// we're processing a request.
		return nil, ErrAccountServiceDisabled
	}

	// Make sure crediting this amount doesn't over-provision the node's
	// available local channel balance (no-op unless enabled).
	if err := s.checkChannelBalanceReservationUnsafe(
		ctx, amount, availableChannelBalance,
	); err != nil {
		return nil, err
	}

	// Credit the account in the DB.
	err = s.store.CreditAccount(ctx, accountID, amount)
	if err != nil {
		return nil, fmt.Errorf("unable to credit account: %w", err)
	}

	return s.store.Account(ctx, accountID)
}

// DebitAccount decreases the balance of an existing account in the database.
func (s *InterceptorService) DebitAccount(ctx context.Context,
	accountID AccountID,
	amount lnwire.MilliSatoshi) (*OffChainBalanceAccount, error) {

	s.Lock()
	defer s.Unlock()

	// As this function updates account balances, we require that the
	// service is running before we execute it.
	if !s.isRunningUnsafe() {
		// This case can only happen if the service is disabled while
		// we're processing a request.
		return nil, ErrAccountServiceDisabled
	}

	// Debit the account in the DB.
	err := s.store.DebitAccount(ctx, accountID, amount)
	if err != nil {
		return nil, fmt.Errorf("unable to debit account: %w", err)
	}

	return s.store.Account(ctx, accountID)
}

// Account retrieves an account from the bolt DB and un-marshals it. If the
// account cannot be found, then ErrAccNotFound is returned.
func (s *InterceptorService) Account(ctx context.Context,
	id AccountID) (*OffChainBalanceAccount, error) {

	s.RLock()
	defer s.RUnlock()

	return s.store.Account(ctx, id)
}

// Accounts retrieves all accounts from the bolt DB and un-marshals them.
func (s *InterceptorService) Accounts(ctx context.Context) (
	[]*OffChainBalanceAccount, error) {

	s.RLock()
	defer s.RUnlock()

	return s.store.Accounts(ctx)
}

// RemoveAccount finds an account by its ID and removes it from the DB.
func (s *InterceptorService) RemoveAccount(ctx context.Context,
	id AccountID) error {

	s.Lock()
	defer s.Unlock()

	// Are we currently tracking any payments?
	for hash, payment := range s.pendingPayments {
		if payment.accountID != id {
			continue
		}

		// Let's remove the payment (which also cancels the tracking).
		err := s.removePayment(ctx, hash, lnrpc.Payment_FAILED)
		if err != nil {
			return err
		}
	}

	return s.store.RemoveAccount(ctx, id)
}

// CheckBalance ensures an account is valid and has a balance equal to or larger
// than the amount that is required.
func (s *InterceptorService) CheckBalance(ctx context.Context, id AccountID,
	requiredBalance lnwire.MilliSatoshi) error {

	s.RLock()
	defer s.RUnlock()

	// Check that the account exists, it hasn't expired and has sufficient
	// balance.
	account, err := s.store.Account(ctx, id)
	if err != nil {
		return err
	}

	if account.HasExpired() {
		return ErrAccExpired
	}

	availableAmount := calcAvailableAccountBalance(account)

	// Ensure that the availableAmount is greater than the requiredBalance.
	if availableAmount < 0 ||
		lnwire.MilliSatoshi(availableAmount) < requiredBalance {

		return ErrAccBalanceInsufficient
	}

	return nil
}

// fetchChannelBalance fetches the node's available local channel balance. It
// returns zero without querying the Lightning client if the
// `checkChannelBalance` option is not enabled.
//
// This network call must happen before acquiring the service lock so an
// unavailable Lightning client doesn't block unrelated account operations.
func (s *InterceptorService) fetchChannelBalance(ctx context.Context) (
	lnwire.MilliSatoshi, error) {

	if !s.checkChannelBalance {
		return 0, nil
	}

	if s.lightningClient == nil {
		return 0, errors.New("cannot check channel balance: " +
			"lightning client is not available")
	}

	chanBalance, err := s.lightningClient.ChannelBalance(ctx)
	if err != nil {
		return 0, fmt.Errorf("error querying channel balance: %w", err)
	}

	return lnwire.NewMSatFromSatoshis(chanBalance.Balance), nil
}

// checkChannelBalanceReservationUnsafe ensures that increasing the total
// allocated account balance by the requested balance increase would not push
// the sum of all account balances above the node's available local (outbound)
// channel balance.
//
// The function is a no-op if the `checkChannelBalance` config flag isn't set.
//
// NOTE: the service lock MUST be held when calling this method.
func (s *InterceptorService) checkChannelBalanceReservationUnsafe(
	ctx context.Context, requestedBalanceIncrease lnwire.MilliSatoshi,
	availableChannelBalance lnwire.MilliSatoshi) error {

	// If the `checkChannelBalance` config flag isn't set, the function is a
	// no-op.
	if !s.checkChannelBalance {
		return nil
	}

	accounts, err := s.store.Accounts(ctx)
	if err != nil {
		return fmt.Errorf("error listing accounts: %w", err)
	}

	// Calculate the total account balance after applying the requested
	// allocation, then ensure the node's local balance can cover it.
	var allocated int64
	for _, acct := range accounts {
		allocated += acct.CurrentBalance
	}

	if allocated+int64(requestedBalanceIncrease) >
		int64(availableChannelBalance) {

		return ErrBalanceReservationExceeded
	}

	return nil
}

func calcAvailableAccountBalance(account *OffChainBalanceAccount) int64 {
	var inFlightAmt int64
	for _, payment := range account.Payments {
		if inflightState(payment.Status) {
			// If a payment is in-flight and associated with the
			// account, the user should not be able to spend that
			// amount while it's in-flight.
			inFlightAmt += int64(payment.FullAmount)
		}
	}

	return account.CurrentBalance - inFlightAmt
}

// AssociateInvoice associates a generated invoice with the given account,
// making it possible for the account to be credited in case the invoice is
// paid.
func (s *InterceptorService) AssociateInvoice(ctx context.Context, id AccountID,
	hash lntypes.Hash) error {

	s.Lock()
	defer s.Unlock()

	err := s.store.AddAccountInvoice(ctx, id, hash)
	if err != nil {
		return fmt.Errorf("error adding invoice to account: %w", err)
	}

	// If the above was successful, then we update our in-memory map.
	s.invoiceToAccount[hash] = id

	return nil
}

// PaymentErrored removes a pending payment from the account's registered
// payment list. This should only ever be called if we are sure that the payment
// request errored out.
func (s *InterceptorService) PaymentErrored(ctx context.Context, id AccountID,
	hash lntypes.Hash) error {

	s.Lock()
	defer s.Unlock()

	// If we have already started tracking this payment, then RemovePayment
	// should have been called instead.
	_, ok := s.pendingPayments[hash]
	if ok {
		return fmt.Errorf("cannot disassociate payment if tracking " +
			"has already started")
	}

	return s.store.DeleteAccountPayment(ctx, id, hash)
}

// AssociatePayment associates a payment (hash) with the given account,
// ensuring that the payment will be tracked for a user when LiT is
// restarted.
func (s *InterceptorService) AssociatePayment(ctx context.Context, id AccountID,
	paymentHash lntypes.Hash, fullAmt lnwire.MilliSatoshi) error {

	s.Lock()
	defer s.Unlock()

	// We add the WithErrIfAlreadyPending option to ensure that if the
	// payment is already associated with the account, then we return
	// an error if the payment is already in-flight or succeeded. This
	// prevents a user from being able to launch a second RPC-erring payment
	// with the same hash that would remove the payment from being tracked.
	//
	// NOTE: this prevents launching multipart payments, but allows
	// retrying a payment if it has failed.
	//
	// If the payment is already associated with the account but not in
	// flight, we update the payment amount in case we have a zero-amount
	// invoice that is retried.
	_, err := s.store.UpsertAccountPayment(
		ctx, id, paymentHash, fullAmt, lnrpc.Payment_UNKNOWN,
		WithErrIfAlreadyPending(),
	)

	return err
}

// invoiceUpdate credits the account an invoice was registered with, in case the
// invoice was settled.
//
// NOTE: Any code that errors in this function MUST call disableAndErrorfUnsafe
// while the store lock is held to ensure that the service is disabled under
// the same lock. Else we risk that other threads will try to update invoices
// while the service should be disabled, which could lead to us missing invoice
// updates on next startup.
func (s *InterceptorService) invoiceUpdate(ctx context.Context,
	invoice *lndclient.Invoice) error {

	s.Lock()
	defer s.Unlock()

	// As this function updates account balances, and is called from the
	// invoice subscription, we ensure that the service is running before we
	// execute it.
	if !s.isRunningUnsafe() {
		// We will process the invoice update on next startup instead,
		// once the error that caused the service to stop has been
		// resolved.
		return ErrAccountServiceDisabled
	}

	// We update our indexes each time we get a new invoice from our
	// subscription. This might be a bit inefficient but makes sure we don't
	// miss an update.
	needUpdate := false
	if invoice.AddIndex > s.currentAddIndex {
		s.currentAddIndex = invoice.AddIndex
		needUpdate = true
	}
	if invoice.SettleIndex > s.currentSettleIndex {
		s.currentSettleIndex = invoice.SettleIndex
		needUpdate = true
	}

	if needUpdate {
		err := s.store.StoreLastIndexes(
			ctx, s.currentAddIndex, s.currentSettleIndex,
		)
		if err != nil {
			return s.disableAndErrorfUnsafe(
				"error storing last indexes: %w", err,
			)
		}
	}

	// The invoice hasn't been settled yet, there is nothing for us to do.
	// If it eventually settles, we'll be called again.
	if invoice.State != invpkg.ContractSettled {
		return nil
	}

	// The invoice was settled, let's now credit the account. But only if
	// the invoice actually belongs to an account that we track.
	acctID, ok := s.invoiceToAccount[invoice.Hash]
	if !ok {
		return nil
	}

	// If we get here, the current account has the invoice associated with
	// it that was just paid. Credit the amount to the account and update it
	// in the DB.
	err := s.store.CreditAccount(ctx, acctID, invoice.AmountPaid)
	if err != nil {
		return s.disableAndErrorfUnsafe("error increasing account "+
			"balance account: %w", err)
	}

	// We've now fully processed the invoice and don't need to keep it
	// mapped in memory anymore.
	delete(s.invoiceToAccount, invoice.Hash)

	return nil
}

// TrackPayment adds a new payment to be tracked to the service. If the payment
// is eventually settled, its amount needs to be debited from the given account.
func (s *InterceptorService) TrackPayment(ctx context.Context, id AccountID,
	hash lntypes.Hash, fullAmt lnwire.MilliSatoshi) error {

	s.Lock()
	defer s.Unlock()

	// Are we already tracking the payment? Then ignore the call. This might
	// happen because of the way we receive RPC updates.
	if _, ok := s.pendingPayments[hash]; ok {
		return nil
	}

	// If the account already stored a terminal state, we also don't need to
	// track the payment again. So we add the WithErrIfAlreadySucceeded
	// option to ensure that we return an error if the payment has already
	// succeeded. We can then match on the ErrAlreadySucceeded error and
	// exit early if it is returned.
	//
	// Additionally, we ensure that the account's pending amount is
	// preserved while the payment is in-flight.
	opts := []UpsertPaymentOption{
		WithErrIfAlreadySucceeded(),
		WithPendingAmount(),
	}

	known, err := s.store.UpsertAccountPayment(
		ctx, id, hash, fullAmt, lnrpc.Payment_UNKNOWN, opts...,
	)
	if err != nil {
		if errors.Is(err, ErrAlreadySucceeded) {
			return nil
		}
		if !known {
			// In the rare case that the payment isn't associated
			// with an account yet, and we fail to update the
			// account we will not be tracking the payment, even if
			// track the service is restarted. Therefore the node
			// runner needs to manually check if the payment was
			// made and debit the account if that's the case.
			errStr := "critical error: failed to store the " +
				"payment with hash %v for user with account " +
				"id %v. Manual intervention required! " +
				"Verify if the payment was executed, and " +
				"manually update the user account balance by " +
				"subtracting the payment amount if it was"

			mainChanErr := s.disableAndErrorfUnsafe(
				errStr, hash, id,
			)

			s.mainErrCallback(mainChanErr)
		}

		return fmt.Errorf("error updating account: %w", err)
	}

	// As this function updates account balances, we ensure that the service
	// is running before we execute it.
	if !s.isRunningUnsafe() {
		// We will track the payment on next on next startup instead,
		// once the error that caused the service to stop has been
		// resolved.
		return ErrAccountServiceDisabled
	}

	// And start the long-running TrackPayment RPC.
	ctxc, cancel := context.WithCancel(s.mainCtx)
	statusChan, errChan, err := s.routerClient.TrackPayment(ctxc, hash)
	if err != nil {
		cancel()
		return err
	}

	// We're now tracking the call, store everything we need to be able to
	// cancel the streaming RPC.
	s.pendingPayments[hash] = &trackedPayment{
		accountID:  id,
		hash:       hash,
		fullAmount: fullAmt,
		cancel:     cancel,
	}

	s.wg.Add(1)
	go func() {
		defer s.wg.Done()
		defer cancel()

		for {
			select {
			case paymentUpdate := <-statusChan:
				terminalState, err := s.paymentUpdate(
					s.mainCtx, hash, paymentUpdate,
				)
				if err != nil {
					s.mainErrCallback(err)
					return
				}

				if terminalState {
					return
				}

			case err := <-errChan:
				// If the payment wasn't initiated, we can't
				// track it really. We'll try again on next
				// startup, to make sure we don't miss any
				// payments.
				if errors.Is(
					err, paymentsdb.ErrPaymentNotInitiated,
				) {

					log.Debugf("Payment %v not initiated, "+
						"stopping tracking", hash)

					// We also remove the payment from the
					// account, so that the payment won't be
					// seen as in-flight balance when
					// calculating the account's available
					// balance.
					err := s.RemovePayment(ctx, hash)
					if err != nil {
						// We don't disable the service
						// here, as the worst that can
						// happen is that the payment is
						// seen as still in-flight.
						s.mainErrCallback(err)
					}

					return
				}

				if err != nil {
					// If we error when tracking the
					// payment, we stop the service.
					err = s.disableAndErrorf("received "+
						"error from TrackPayment RPC "+
						"for payment %v: %w", hash, err)

					s.mainErrCallback(err)
				}
				return

			case <-ctxc.Done():
				return

			case <-s.quit:
				return
			}
		}
	}()

	return nil
}

// paymentUpdate debits the full amount of a payment from the account it was
// associated with, in case it is settled. The boolean value returned indicates
// whether the status was terminal or not. If it's not terminal then further
// updates are expected.
//
// NOTE: Any code that errors in this function MUST call disableAndErrorfUnsafe
// while the store lock is held to ensure that the service is disabled under
// the same lock.
func (s *InterceptorService) paymentUpdate(ctx context.Context,
	hash lntypes.Hash, status lndclient.PaymentStatus) (bool, error) {

	// Are we still in-flight? Then we don't have to do anything just yet.
	// The unknown state should never happen in practice but if it ever did
	// we couldn't handle it anyway, so let's also ignore it.
	if inflightState(status.State) {
		return false, nil
	}

	// Any other state is terminal, so whatever happens, we don't need to
	// keep waiting for more updates.
	const terminalState = true

	s.Lock()
	defer s.Unlock()

	// As this function updates account balances, we ensure that the service
	// is running before we execute it.
	if !s.isRunningUnsafe() {
		// We will update the payment on next startup instead, once the
		// error that caused the service to stop has been resolved.
		return false, ErrAccountServiceDisabled
	}

	pendingPayment, ok := s.pendingPayments[hash]
	if !ok {
		err := s.disableAndErrorfUnsafe("payment %x not mapped to any "+
			"account", hash[:])

		return terminalState, err
	}

	// A failed payment can just be removed, no further action needed.
	if status.State == lnrpc.Payment_FAILED {
		err := s.removePayment(ctx, hash, status.State)
		if err != nil {
			err = s.disableAndErrorfUnsafe("error removing "+
				"payment: %w", err)
		}

		return terminalState, err
	}

	// The payment went through! We now need to debit the full amount from
	// the account.
	fullAmount := status.Value + status.Fee

	// Update the persisted account.
	_, err := s.store.UpsertAccountPayment(
		ctx, pendingPayment.accountID, hash, fullAmount,
		lnrpc.Payment_SUCCEEDED, WithDebitAccount(),
	)
	if err != nil {
		err = s.disableAndErrorfUnsafe("error updating account: %w",
			err)

		return terminalState, err
	}

	// We've now fully processed the payment and don't need to keep it
	// mapped or tracked anymore.
	err = s.removePayment(ctx, hash, lnrpc.Payment_SUCCEEDED)
	if err != nil {
		err = s.disableAndErrorfUnsafe("error removing payment: %w",
			err)
	}

	return terminalState, err
}

// RemovePayment removes a failed payment from the service because it no longer
// needs to be tracked. The payment is certain to never succeed, so we never
// need to debit the amount from the account.
func (s *InterceptorService) RemovePayment(ctx context.Context,
	hash lntypes.Hash) error {

	s.Lock()
	defer s.Unlock()

	return s.removePayment(ctx, hash, lnrpc.Payment_FAILED)
}

// removePayment stops tracking a payment and updates the status in the account
// to the given status.
//
// NOTE: The store lock MUST be held when calling this method.
func (s *InterceptorService) removePayment(ctx context.Context,
	hash lntypes.Hash, status lnrpc.Payment_PaymentStatus) error {

	// It could be that we haven't actually started tracking the payment
	// yet, so if we can't find it, we just do nothing.
	pendingPayment, ok := s.pendingPayments[hash]
	if !ok {
		return nil
	}

	_, err := s.store.UpsertAccountPayment(
		ctx, pendingPayment.accountID, hash, 0, status,
		// We don't want the payment to be inserted if it isn't already
		// known. So we pass in this option to ensure that the call
		// exits early if the payment is unknown.
		WithErrIfUnknown(),
		// Otherwise, we just want to update the status of the payment
		// and use the existing pending amount.
		WithPendingAmount(),
	)
	if err != nil && !errors.Is(err, ErrPaymentNotAssociated) {
		return fmt.Errorf("error updating account: %w", err)
	}

	pendingPayment.cancel()
	delete(s.pendingPayments, hash)

	return nil
}

// hasPayment returns true if the payment is currently being tracked by the
// service.
//
// NOTE: this is currently used only for tests.
func (s *InterceptorService) hasPayment(hash lntypes.Hash) bool {
	s.RLock()
	defer s.RUnlock()

	_, ok := s.pendingPayments[hash]
	return ok
}

// successState returns true if a payment was completed successfully.
func successState(status lnrpc.Payment_PaymentStatus) bool {
	return status == lnrpc.Payment_SUCCEEDED
}

// inflightState returns true if a payment should be seen as in-flight by the
// accounts system.
func inflightState(status lnrpc.Payment_PaymentStatus) bool {
	return status != lnrpc.Payment_SUCCEEDED &&
		status != lnrpc.Payment_FAILED
}

// requestValuesStore is an in-memory implementation of the
// RequestValuesStore interface.
type requestValuesStore struct {
	m map[uint64]*RequestValues

	mu sync.Mutex
}

// A compile-time check to ensure that requestValuesStore implements the
// RequestValuesStore interface.
var _ RequestValuesStore = (*requestValuesStore)(nil)

// newRequestValuesStore constructs a new requestValuesStore which is an
// implementation of the RequestValuesStore interface.
func newRequestValuesStore() *requestValuesStore {
	return &requestValuesStore{
		m: make(map[uint64]*RequestValues),
	}
}

// RegisterValues stores values for the given request ID.
func (s *requestValuesStore) RegisterValues(reqID uint64,
	values *RequestValues) error {

	s.mu.Lock()
	defer s.mu.Unlock()

	if _, ok := s.m[reqID]; ok {
		return fmt.Errorf("values for request ID %d have already "+
			"been registered", reqID)
	}

	s.m[reqID] = values

	return nil
}

// GetValues returns the corresponding request values for the given request ID
// if they exist.
func (s *requestValuesStore) GetValues(reqID uint64) (*RequestValues, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()

	values, ok := s.m[reqID]

	return values, ok
}

// DeleteValues deletes any values stored for the given request ID.
func (s *requestValuesStore) DeleteValues(reqID uint64) {
	s.mu.Lock()
	defer s.mu.Unlock()

	delete(s.m, reqID)
}
