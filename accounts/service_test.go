package accounts

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/lightninglabs/lndclient"
	"github.com/lightningnetwork/lnd/channeldb"
	invpkg "github.com/lightningnetwork/lnd/invoices"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/lnrpc/routerrpc"
	"github.com/lightningnetwork/lnd/lntypes"
	"github.com/stretchr/testify/require"
)

var (
	testErr = errors.New("something terrible happened")

	testExpiration = time.Now().Add(24 * time.Hour)
	testTimeout    = time.Millisecond * 500
	testInterval   = time.Millisecond * 20

	testID2 = AccountID{22, 22, 22}
)

type mockLnd struct {
	lndclient.LightningClient
	lndclient.RouterClient

	mainErrChan chan error

	invoiceReq chan lndclient.InvoiceSubscriptionRequest

	invoiceSubscriptionErr error
	invoiceErrChan         chan error
	invoiceChan            chan *lndclient.Invoice
}

func newMockLnd() *mockLnd {
	return &mockLnd{
		mainErrChan: make(chan error, 10),
		invoiceReq: make(
			chan lndclient.InvoiceSubscriptionRequest, 10,
		),
		invoiceErrChan: make(chan error, 10),
		invoiceChan:    make(chan *lndclient.Invoice),
	}
}

// RawClientWithMacAuth returns a context with the proper macaroon
// authentication, the default RPC timeout, and the raw client.
func (m *mockLnd) RawClientWithMacAuth(ctx context.Context) (context.Context,
	time.Duration, lnrpc.LightningClient) {

	return ctx, 0, nil
}

func (m *mockLnd) assertNoMainErr(t *testing.T) {
	select {
	case err := <-m.mainErrChan:
		t.Fatalf("Expected no main err, got %v", err)

	default:
	}
}

// assertMainErrContains asserts that the main error contains the expected error
// string.
func (m *mockLnd) assertMainErrContains(t *testing.T, expectedStr string) {
	select {
	case err := <-m.mainErrChan:
		require.ErrorContains(t, err, expectedStr)

	case <-time.After(testTimeout):
		t.Fatalf("Did not get expected main err before timeout")
	}
}

func (m *mockLnd) assertNoInvoiceRequest(t *testing.T) {
	select {
	case req := <-m.invoiceReq:
		t.Fatalf("Expected no invoice request, got %v", req)

	default:
	}
}

func (m *mockLnd) assertInvoiceRequest(t *testing.T, addIndex,
	settleIndex uint64) {

	select {
	case invoiceReq := <-m.invoiceReq:
		require.Equal(t, addIndex, invoiceReq.AddIndex)
		require.Equal(t, settleIndex, invoiceReq.SettleIndex)

	case <-time.After(testTimeout):
		t.Fatalf("Did not get expected invoice request before timeout")
	}
}

// SubscribeInvoices allows a client to subscribe to updates of newly
// added/settled invoices.
func (m *mockLnd) SubscribeInvoices(_ context.Context,
	req lndclient.InvoiceSubscriptionRequest) (<-chan *lndclient.Invoice,
	<-chan error, error) {

	if m.invoiceSubscriptionErr != nil {
		return nil, nil, m.invoiceSubscriptionErr
	}

	m.invoiceReq <- req

	return m.invoiceChan, m.invoiceErrChan, nil
}

type mockRouter struct {
	lndclient.RouterClient

	mainErrChan chan error

	paymentReq chan lntypes.Hash

	trackPaymentErr error
	paymentErrChan  chan error
	paymentChans    map[lntypes.Hash]chan lndclient.PaymentStatus
}

func newMockRouter() *mockRouter {
	return &mockRouter{
		mainErrChan:    make(chan error, 10),
		paymentReq:     make(chan lntypes.Hash, 10),
		paymentErrChan: make(chan error, 10),
		paymentChans: make(
			map[lntypes.Hash]chan lndclient.PaymentStatus,
		),
	}
}

// RawClientWithMacAuth returns a context with the proper macaroon
// authentication, the default RPC timeout, and the raw client.
func (r *mockRouter) RawClientWithMacAuth(ctx context.Context) (context.Context,
	time.Duration, routerrpc.RouterClient) {

	return ctx, 0, nil
}

func (r *mockRouter) assertNoPaymentRequest(t *testing.T) {
	select {
	case req := <-r.paymentReq:
		t.Fatalf("Expected no payment request, got %v", req)

	default:
	}
}

func (r *mockRouter) assertPaymentRequests(t *testing.T,
	hashes map[lntypes.Hash]struct{}) {

	overallTimeout := time.After(testTimeout)

	for {
		select {
		case hash := <-r.paymentReq:
			require.Contains(t, hashes, hash)
			delete(hashes, hash)

			// Did we get all expected hashes?
			if len(hashes) == 0 {
				return
			}

		case <-overallTimeout:
			t.Fatalf("Did not get %d expected hashes before "+
				"timeout", len(hashes))
		}
	}
}

// TrackPayment picks up a previously started payment and returns a payment
// update stream and an error stream.
func (r *mockRouter) TrackPayment(_ context.Context,
	hash lntypes.Hash) (chan lndclient.PaymentStatus, chan error, error) {

	if r.trackPaymentErr != nil {
		return nil, nil, r.trackPaymentErr
	}

	r.paymentReq <- hash
	r.paymentChans[hash] = make(chan lndclient.PaymentStatus, 1)

	return r.paymentChans[hash], r.paymentErrChan, nil
}

// TestAccountService tests that the account service can track payments and
// invoices of account related calls correctly.
func TestAccountService(t *testing.T) {
	t.Parallel()

	testCases := []struct {
		name  string
		setup func(t *testing.T, lnd *mockLnd, r *mockRouter,
			s *InterceptorService)
		startupErr string
		validate   func(t *testing.T, lnd *mockLnd, r *mockRouter,
			s *InterceptorService)
	}{{
		name: "startup err on invoice subscription",
		setup: func(t *testing.T, lnd *mockLnd, r *mockRouter,
			s *InterceptorService) {

			lnd.invoiceSubscriptionErr = testErr
		},
		startupErr: testErr.Error(),
		validate: func(t *testing.T, lnd *mockLnd, r *mockRouter,
			s *InterceptorService) {

			lnd.assertNoInvoiceRequest(t)
			require.False(t, s.IsRunning())
		},
	}, {
		name: "err on invoice update",
		setup: func(t *testing.T, lnd *mockLnd, r *mockRouter,
			s *InterceptorService) {

			acct := &OffChainBalanceAccount{
				ID:             testID,
				Type:           TypeInitialBalance,
				CurrentBalance: 1234,
				Invoices: AccountInvoices{
					testHash: {},
				},
			}

			err := s.store.UpdateAccount(acct)
			require.NoError(t, err)
		},
		validate: func(t *testing.T, lnd *mockLnd, r *mockRouter,
			s *InterceptorService) {

			// Start by closing the store. This should cause an
			// error once we make an invoice update, as the service
			// will fail when persisting the invoice update.
			s.store.Close()

			// Ensure that the service was started successfully and
			// still running though, despite the closing of the
			// db store.
			require.True(t, s.IsRunning())

			// Now let's send the invoice update, which should fail.
			lnd.invoiceChan <- &lndclient.Invoice{
				AddIndex:    12,
				SettleIndex: 12,
				Hash:        testHash,
				AmountPaid:  777,
				State:       invpkg.ContractSettled,
			}

			// Ensure that the service was eventually disabled.
			assertEventually(t, func() bool {
				isRunning := s.IsRunning()
				return isRunning == false
			})
			lnd.assertMainErrContains(t, "database not open")
		},
	}, {
		name: "err in invoice err channel",
		setup: func(t *testing.T, lnd *mockLnd, r *mockRouter,
			s *InterceptorService) {

			acct := &OffChainBalanceAccount{
				ID:             testID,
				Type:           TypeInitialBalance,
				CurrentBalance: 1234,
				Invoices: AccountInvoices{
					testHash: {},
				},
			}

			err := s.store.UpdateAccount(acct)
			require.NoError(t, err)
		},
		validate: func(t *testing.T, lnd *mockLnd, r *mockRouter,
			s *InterceptorService) {
			// Ensure that the service was started successfully.
			require.True(t, s.IsRunning())

			// Now let's send an error over the invoice error
			// channel. This should disable the service.
			lnd.invoiceErrChan <- testErr

			// Ensure that the service was eventually disabled.
			assertEventually(t, func() bool {
				isRunning := s.IsRunning()
				return isRunning == false
			})

			lnd.assertMainErrContains(t, testErr.Error())
		},
	}, {
		name: "goroutine err sent on main err chan",
		setup: func(t *testing.T, lnd *mockLnd, r *mockRouter,
			s *InterceptorService) {

			acct := &OffChainBalanceAccount{
				ID:             testID,
				Type:           TypeInitialBalance,
				CurrentBalance: 1234,
				Invoices: AccountInvoices{
					testHash: {},
				},
				Payments: make(AccountPayments),
			}

			err := s.store.UpdateAccount(acct)
			require.NoError(t, err)

			s.mainErrCallback(testErr)
		},
		validate: func(t *testing.T, lnd *mockLnd, r *mockRouter,
			s *InterceptorService) {

			lnd.assertInvoiceRequest(t, 0, 0)
			lnd.assertMainErrContains(t, testErr.Error())
		},
	}, {
		name: "startup do not track completed payments",
		setup: func(t *testing.T, lnd *mockLnd, r *mockRouter,
			s *InterceptorService) {

			acct, err := s.store.NewAccount(
				1234, testExpiration, "",
			)
			require.NoError(t, err)

			acct.Invoices[testHash] = struct{}{}
			acct.Payments[testHash] = &PaymentEntry{
				Status:     lnrpc.Payment_SUCCEEDED,
				FullAmount: 1234,
			}

			err = s.store.UpdateAccount(acct)
			require.NoError(t, err)
		},
		validate: func(t *testing.T, lnd *mockLnd, r *mockRouter,
			s *InterceptorService) {

			require.Contains(t, s.invoiceToAccount, testHash)
			r.assertNoPaymentRequest(t)
			lnd.assertInvoiceRequest(t, 0, 0)
			lnd.assertNoMainErr(t)
			require.True(t, s.IsRunning())
		},
	}, {
		name: "startup err on payment tracking",
		setup: func(t *testing.T, lnd *mockLnd, r *mockRouter,
			s *InterceptorService) {

			acct := &OffChainBalanceAccount{
				ID:             testID,
				Type:           TypeInitialBalance,
				CurrentBalance: 1234,
				Invoices: AccountInvoices{
					testHash: {},
				},
				Payments: AccountPayments{
					testHash: {
						Status:     lnrpc.Payment_IN_FLIGHT,
						FullAmount: 1234,
					},
				},
			}

			err := s.store.UpdateAccount(acct)
			require.NoError(t, err)

			r.trackPaymentErr = testErr
		},
		validate: func(t *testing.T, lnd *mockLnd, r *mockRouter,
			s *InterceptorService) {

			// Assert that the invoice subscription succeeded.
			require.Contains(t, s.invoiceToAccount, testHash)

			// But setting up the payment tracking should have failed.
			require.False(t, s.IsRunning())

			// Finally let's assert that we didn't successfully add the
			// payment to pending payment, and that lnd isn't awaiting
			// the payment request.
			require.NotContains(t, s.pendingPayments, testHash)
			r.assertNoPaymentRequest(t)
		},
	}, {
		name: "err on payment update",
		setup: func(t *testing.T, lnd *mockLnd, r *mockRouter,
			s *InterceptorService) {

			acct := &OffChainBalanceAccount{
				ID:             testID,
				Type:           TypeInitialBalance,
				CurrentBalance: 1234,
				Payments: AccountPayments{
					testHash: {
						Status:     lnrpc.Payment_IN_FLIGHT,
						FullAmount: 1234,
					},
				},
			}

			err := s.store.UpdateAccount(acct)
			require.NoError(t, err)
		},
		validate: func(t *testing.T, lnd *mockLnd, r *mockRouter,
			s *InterceptorService) {

			// Ensure that the service was started successfully,
			// and lnd contains the payment request.
			require.True(t, s.IsRunning())
			r.assertPaymentRequests(t, map[lntypes.Hash]struct{}{
				testHash: {},
			})

			// Now let's wipe the service's pending payments.
			// This will cause an error send an update over
			// the payment channel, which should disable the
			// service.
			s.pendingPayments = make(map[lntypes.Hash]*trackedPayment)

			// Send an invalid payment over the payment chan
			// which should error and disable the service
			r.paymentChans[testHash] <- lndclient.PaymentStatus{
				State: lnrpc.Payment_SUCCEEDED,
				Fee:   234,
				Value: 1000,
			}

			// Ensure that the service was eventually disabled.
			assertEventually(t, func() bool {
				isRunning := s.IsRunning()
				return isRunning == false
			})
			lnd.assertMainErrContains(
				t, "not mapped to any account",
			)
		},
	}, {
		name: "err in payment update chan",
		setup: func(t *testing.T, lnd *mockLnd, r *mockRouter,
			s *InterceptorService) {

			acct := &OffChainBalanceAccount{
				ID:             testID,
				Type:           TypeInitialBalance,
				CurrentBalance: 1234,
				Payments: AccountPayments{
					testHash: {
						Status:     lnrpc.Payment_IN_FLIGHT,
						FullAmount: 1234,
					},
				},
			}

			err := s.store.UpdateAccount(acct)
			require.NoError(t, err)
		},
		validate: func(t *testing.T, lnd *mockLnd, r *mockRouter,
			s *InterceptorService) {

			// Ensure that the service was started successfully,
			// and lnd contains the payment request.
			require.True(t, s.IsRunning())
			r.assertPaymentRequests(t, map[lntypes.Hash]struct{}{
				testHash: {},
			})

			// Now let's send an error over the payment error
			// channel. This should disable the service.
			r.paymentErrChan <- testErr

			// Ensure that the service was eventually disabled.
			assertEventually(t, func() bool {
				isRunning := s.IsRunning()
				return isRunning == false
			})

			lnd.assertMainErrContains(t, testErr.Error())
		},
	}, {
		name: "startup track in-flight payments",
		setup: func(t *testing.T, lnd *mockLnd, r *mockRouter,
			s *InterceptorService) {

			acct := &OffChainBalanceAccount{
				ID:             testID,
				Type:           TypeInitialBalance,
				CurrentBalance: 5000,
				Invoices: AccountInvoices{
					testHash: {},
				},
				Payments: AccountPayments{
					testHash: {
						Status:     lnrpc.Payment_IN_FLIGHT,
						FullAmount: 2000,
					},
					testHash2: {
						Status:     lnrpc.Payment_UNKNOWN,
						FullAmount: 1000,
					},
					testHash3: {
						Status:     lnrpc.Payment_UNKNOWN,
						FullAmount: 2000,
					},
				},
			}

			err := s.store.UpdateAccount(acct)
			require.NoError(t, err)
		},
		validate: func(t *testing.T, lnd *mockLnd, r *mockRouter,
			s *InterceptorService) {

			require.Contains(t, s.invoiceToAccount, testHash)
			r.assertPaymentRequests(t, map[lntypes.Hash]struct{}{
				testHash:  {},
				testHash2: {},
				testHash3: {},
			})
			lnd.assertInvoiceRequest(t, 0, 0)
			lnd.assertNoMainErr(t)

			// Send an actual payment update and make sure the
			// amount is debited from the account.
			r.paymentChans[testHash] <- lndclient.PaymentStatus{
				State: lnrpc.Payment_SUCCEEDED,
				Fee:   500,
				Value: 1500,
			}

			assertEventually(t, func() bool {
				acct, err := s.store.Account(testID)
				require.NoError(t, err)

				return acct.CurrentBalance == 3000
			})

			// Remove the other payment and make sure it disappears
			// from the tracked payments and is also updated
			// correctly in the account store.
			r.paymentChans[testHash2] <- lndclient.PaymentStatus{
				State: lnrpc.Payment_FAILED,
				Fee:   0,
				Value: 1000,
			}

			assertEventually(t, func() bool {
				acct, err := s.store.Account(testID)
				require.NoError(t, err)

				if len(acct.Payments) != 3 {
					return false
				}

				p, ok := acct.Payments[testHash2]
				if !ok {
					return false
				}

				return p.Status == lnrpc.Payment_FAILED
			})

			require.NotContains(t, s.pendingPayments, testHash2)

			// Finally, if an unknown payment turns out to be
			// a non-initiated payment, we should stop the tracking
			// of the payment, fail it and remove it from the
			// pendingPayments map. As the payment is failed, that
			// will ensure that the payment is not considered when
			// calculating the in-flight balance for the account.
			// First check that the account has an available balance
			// of 1000. That means that the payment with testHash3
			// and amount 2000 is still considered to be in-flight.
			err := s.CheckBalance(testID, 1000)
			require.NoError(t, err)

			err = s.CheckBalance(testID, 1001)
			require.ErrorIs(t, err, ErrAccBalanceInsufficient)

			// Now signal that the payment was non-initiated.
			r.paymentErrChan <- channeldb.ErrPaymentNotInitiated

			// Once the error is handled in the service.TrackPayment
			// goroutine, and therefore free up the 2000 in-flight
			// balance.
			assertEventually(t, func() bool {
				bal3000Err := s.CheckBalance(testID, 3000)
				bal3001Err := s.CheckBalance(testID, 3001)
				require.ErrorIs(
					t, bal3001Err,
					ErrAccBalanceInsufficient,
				)

				correctBalance := bal3000Err == nil

				// Ensure that the payment is also set to the
				// failed status.
				acct, err := s.store.Account(testID)
				require.NoError(t, err)

				p, ok := acct.Payments[testHash3]

				correctStatus := ok &&
					p.Status == lnrpc.Payment_FAILED

				return correctBalance && correctStatus
			})

			// Ensure that the payment was removed from the pending
			// payments.
			require.NotContains(t, s.pendingPayments, testHash3)
		},
	}, {
		name: "keep track of invoice indexes",
		setup: func(t *testing.T, lnd *mockLnd, r *mockRouter,
			s *InterceptorService) {

			err := s.store.StoreLastIndexes(987_654, 555_555)
			require.NoError(t, err)
		},
		validate: func(t *testing.T, lnd *mockLnd, r *mockRouter,
			s *InterceptorService) {

			// We expect the initial subscription to start at the
			// indexes we stored in the DB.
			lnd.assertInvoiceRequest(t, 987_654, 555_555)

			// If we now send a new invoice, we expect the store to
			// track the latest index (but only those that are
			// bigger).
			lnd.invoiceChan <- &lndclient.Invoice{
				AddIndex:    123,
				SettleIndex: 666_666,
			}

			assertEventually(t, func() bool {
				addIdx, settleIdx, err := s.store.LastIndexes()
				require.NoError(t, err)

				if addIdx != 987_654 {
					return false
				}

				return settleIdx == 666_666
			})

			// Update again, this time only the add index.
			lnd.invoiceChan <- &lndclient.Invoice{
				AddIndex:    1_000_000,
				SettleIndex: 666_666,
			}

			assertEventually(t, func() bool {
				addIdx, settleIdx, err := s.store.LastIndexes()
				require.NoError(t, err)

				if addIdx != 1_000_000 {
					return false
				}

				return settleIdx == 666_666
			})
		},
	}, {
		name: "credit account",
		setup: func(t *testing.T, lnd *mockLnd, r *mockRouter,
			s *InterceptorService) {

			acct := &OffChainBalanceAccount{
				ID:             testID,
				Type:           TypeInitialBalance,
				CurrentBalance: 0,
				Invoices: AccountInvoices{
					testHash:  {},
					testHash2: {},
				},
				Payments: make(AccountPayments),
			}

			err := s.store.UpdateAccount(acct)
			require.NoError(t, err)
		},
		validate: func(t *testing.T, lnd *mockLnd, r *mockRouter,
			s *InterceptorService) {

			lnd.assertInvoiceRequest(t, 0, 0)
			lnd.invoiceChan <- &lndclient.Invoice{
				AddIndex:    12,
				SettleIndex: 12,
				Hash:        testHash,
				AmountPaid:  1000,
				State:       invpkg.ContractSettled,
			}

			// Make sure the amount paid is eventually credited.
			assertEventually(t, func() bool {
				acct, err := s.store.Account(testID)
				require.NoError(t, err)

				return acct.CurrentBalance == 1000
			})

			// Then settle a second invoice.
			lnd.invoiceChan <- &lndclient.Invoice{
				AddIndex:    13,
				SettleIndex: 13,
				Hash:        testHash2,
				AmountPaid:  777,
				State:       invpkg.ContractSettled,
			}

			// Ensure that the balance now adds up to the sum of
			// both invoices.
			assertEventually(t, func() bool {
				acct, err := s.store.Account(testID)
				require.NoError(t, err)

				return acct.CurrentBalance == (1000 + 777)
			})
		},
	}, {
		name: "in-flight payments",
		setup: func(t *testing.T, lnd *mockLnd, r *mockRouter,
			s *InterceptorService) {

			// We set up two accounts with a balance of 5k msats.

			// The first account has two in-flight payments, one of
			// 2k msats and one of 1k msats, totaling 3k msats.
			acct := &OffChainBalanceAccount{
				ID:             testID,
				Type:           TypeInitialBalance,
				CurrentBalance: 5000,
				Invoices: AccountInvoices{
					testHash: {},
				},
				Payments: AccountPayments{
					testHash: {
						Status:     lnrpc.Payment_IN_FLIGHT,
						FullAmount: 2000,
					},
					testHash2: {
						Status:     lnrpc.Payment_IN_FLIGHT,
						FullAmount: 1000,
					},
				},
			}

			err := s.store.UpdateAccount(acct)
			require.NoError(t, err)

			// The second account has one in-flight payment of 4k
			// msats.
			acct2 := &OffChainBalanceAccount{
				ID:             testID2,
				Type:           TypeInitialBalance,
				CurrentBalance: 5000,
				Invoices: AccountInvoices{
					testHash: {},
				},
				Payments: AccountPayments{
					testHash3: {
						Status:     lnrpc.Payment_IN_FLIGHT,
						FullAmount: 4000,
					},
				},
			}

			err = s.store.UpdateAccount(acct2)
			require.NoError(t, err)
		},
		validate: func(t *testing.T, lnd *mockLnd, r *mockRouter,
			s *InterceptorService) {

			// The first should be able to initiate another payment
			// with an amount smaller or equal to 2k msats. This
			// also asserts that the second accounts in-flight
			// payment doesn't affect the first account.
			err := s.CheckBalance(testID, 2000)
			require.NoError(t, err)

			// But exactly one sat over it should fail.
			err = s.CheckBalance(testID, 2001)
			require.ErrorIs(t, err, ErrAccBalanceInsufficient)

			// Remove one of the payments (to simulate it failed)
			// and try again.
			r.paymentChans[testHash] <- lndclient.PaymentStatus{
				State: lnrpc.Payment_FAILED,
			}

			// We should now have up to 4k msats available.
			assertEventually(t, func() bool {
				err = s.CheckBalance(testID, 4000)
				return err == nil
			})

			// The second account should be able to initiate a
			// payment of 1k msats.
			err = s.CheckBalance(testID2, 1000)
			require.NoError(t, err)

			// But exactly one sat over it should fail.
			err = s.CheckBalance(testID2, 1001)
			require.ErrorIs(t, err, ErrAccBalanceInsufficient)
		},
	}}

	for _, tc := range testCases {
		tc := tc

		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()

			lndMock := newMockLnd()
			routerMock := newMockRouter()
			errFunc := func(err error) {
				lndMock.mainErrChan <- err
			}
			service, err := NewService(t.TempDir(), errFunc)
			require.NoError(t, err)

			// Is a setup call required to initialize initial
			// conditions?
			if tc.setup != nil {
				tc.setup(t, lndMock, routerMock, service)
			}

			// Any errors during startup expected?
			err = service.Start(lndMock, routerMock, chainParams)
			if tc.startupErr != "" {
				require.ErrorContains(tt, err, tc.startupErr)

				lndMock.assertNoMainErr(t)

				if tc.validate != nil {
					tc.validate(
						tt, lndMock, routerMock,
						service,
					)
				}

				return
			}

			// Any post execution validation that we need to run?
			if tc.validate != nil {
				tc.validate(tt, lndMock, routerMock, service)
			}

			err = service.Stop()
			require.NoError(tt, err)
			lndMock.assertNoMainErr(t)
		})
	}
}

// assertEventually asserts that the given predicate is eventually satisfied.
func assertEventually(t *testing.T, predicate func() bool) {
	require.Eventually(t, predicate, testTimeout, testInterval)
}
