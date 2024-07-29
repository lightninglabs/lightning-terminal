package accounts

import (
	"context"
	"encoding/hex"
	"fmt"
	"testing"
	"time"

	"github.com/btcsuite/btcd/chaincfg"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/lnrpc/routerrpc"
	"github.com/lightningnetwork/lnd/lntypes"
	"github.com/lightningnetwork/lnd/lnwire"
	"github.com/stretchr/testify/require"
	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/proto"
)

var (
	chainParams = &chaincfg.RegressionNetParams

	marshalOptions = &protojson.MarshalOptions{
		UseProtoNames:   true,
		EmitUnpopulated: true,
	}

	testID   = AccountID{77, 88, 99}
	testHash = lntypes.Hash{
		1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
		1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
	}
	testHash2 = lntypes.Hash{
		2, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
		1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
	}
	testHash3 = lntypes.Hash{
		3, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
		1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
	}
	testHash4 = lntypes.Hash{
		4, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
		1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
	}

	testAmount = &lnrpc.Amount{
		Sat:  456,
		Msat: 456789,
	}
	emptyAmount = &lnrpc.Amount{
		Sat:  0,
		Msat: 0,
	}
)

type mockService struct {
	acctBalanceMsat lnwire.MilliSatoshi

	trackedInvoices map[lntypes.Hash]AccountID
	trackedPayments AccountPayments

	*requestValuesStore
}

func newMockService() *mockService {
	return &mockService{
		acctBalanceMsat:    0,
		trackedInvoices:    make(map[lntypes.Hash]AccountID),
		trackedPayments:    make(AccountPayments),
		requestValuesStore: newRequestValuesStore(),
	}
}

func (m *mockService) CheckBalance(_ AccountID,
	wantBalance lnwire.MilliSatoshi) error {

	if wantBalance > m.acctBalanceMsat {
		return fmt.Errorf("invalid balance")
	}

	return nil
}

func (m *mockService) AssociateInvoice(id AccountID, hash lntypes.Hash) error {
	m.trackedInvoices[hash] = id

	return nil
}

func (m *mockService) AssociatePayment(id AccountID, paymentHash lntypes.Hash,
	amt lnwire.MilliSatoshi) error {

	return nil
}

func (m *mockService) PaymentErrored(id AccountID, hash lntypes.Hash) error {
	return nil
}

func (m *mockService) TrackPayment(_ AccountID, hash lntypes.Hash,
	amt lnwire.MilliSatoshi) error {

	m.trackedPayments[hash] = &PaymentEntry{
		Status:     lnrpc.Payment_UNKNOWN,
		FullAmount: amt,
	}

	return nil
}

func (m *mockService) RemovePayment(hash lntypes.Hash) error {
	delete(m.trackedPayments, hash)

	return nil
}

func (*mockService) IsRunning() bool {
	return true
}

var _ Service = (*mockService)(nil)

// TestAccountChecker makes sure all round trip checkers can be instantiated
// correctly without panicking.
func TestAccountChecker(t *testing.T) {
	t.Parallel()

	checker := NewAccountChecker(nil, nil)
	for checkerName := range checker.checkers {
		t.Logf("Checker registered: %v", checkerName)
	}
}

// TestAccountCheckers tests the account request checkers.
func TestAccountCheckers(t *testing.T) {
	t.Parallel()

	const reqID = uint64(55)

	testCases := []struct {
		name    string
		fullURI string
		setup   func(s *mockService,
			acct *OffChainBalanceAccount)
		originalRequest  proto.Message
		requestErr       string
		originalResponse proto.Message
		replacedResponse proto.Message
		responseErr      string
		validate         func(t *testing.T, s *mockService,
			acct *OffChainBalanceAccount)
	}{{
		name:    "node info pass through",
		fullURI: "/lnrpc.Lightning/GetNodeInfo",
		originalRequest: &lnrpc.NodeInfoRequest{
			PubKey: "foobarbaz",
		},
		originalResponse: &lnrpc.NodeInfo{
			Node: &lnrpc.LightningNode{
				LastUpdate: 1234,
				PubKey:     "foobarbaz",
				Alias:      "baz",
				Color:      "green",
			},
		},
	}, {
		name:            "add invoice",
		fullURI:         "/lnrpc.Lightning/AddInvoice",
		originalRequest: &lnrpc.Invoice{},
		originalResponse: &lnrpc.AddInvoiceResponse{
			RHash: testHash[:],
		},
		validate: func(t *testing.T, s *mockService,
			acct *OffChainBalanceAccount) {

			require.Contains(t, s.trackedInvoices, testHash)
		},
	}, {
		name:            "list invoices, not mapped to account",
		fullURI:         "/lnrpc.Lightning/ListInvoices",
		originalRequest: &lnrpc.ListInvoiceRequest{},
		originalResponse: &lnrpc.ListInvoiceResponse{
			Invoices: []*lnrpc.Invoice{{
				RHash: testHash[:],
			}},
		},
		replacedResponse: &lnrpc.ListInvoiceResponse{
			Invoices: []*lnrpc.Invoice{},
		},
	}, {
		name:    "list invoices, mapped to account",
		fullURI: "/lnrpc.Lightning/ListInvoices",
		setup: func(s *mockService, acct *OffChainBalanceAccount) {
			acct.Invoices[testHash] = struct{}{}
		},
		originalRequest: &lnrpc.ListInvoiceRequest{},
		originalResponse: &lnrpc.ListInvoiceResponse{
			Invoices: []*lnrpc.Invoice{{
				RHash: testHash[:],
			}},
		},
		replacedResponse: &lnrpc.ListInvoiceResponse{
			Invoices: []*lnrpc.Invoice{{
				RHash: testHash[:],
			}},
		},
	}, {
		name:    "lookup invoice, not mapped to account",
		fullURI: "/lnrpc.Lightning/LookupInvoice",
		originalRequest: &lnrpc.PaymentHash{
			RHash: testHash[:],
		},
		requestErr: "invoice does not belong to this account",
	}, {
		name:    "lookup invoice, mapped to account",
		fullURI: "/lnrpc.Lightning/LookupInvoice",
		setup: func(s *mockService, acct *OffChainBalanceAccount) {
			acct.Invoices[testHash] = struct{}{}
		},
		originalRequest: &lnrpc.PaymentHash{
			RHash: testHash[:],
		},
		originalResponse: &lnrpc.Invoice{
			RHash: testHash[:],
		},
	}, {
		name:    "send payment, not enough balance",
		fullURI: "/lnrpc.Lightning/SendPaymentSync",
		originalRequest: &lnrpc.SendRequest{
			AmtMsat:     5000,
			PaymentHash: testHash[:],
		},
		requestErr: "error validating account balance: invalid balance",
	}, {
		name:    "send payment, not enough balance because of fee",
		fullURI: "/lnrpc.Lightning/SendPaymentSync",
		setup: func(s *mockService, acct *OffChainBalanceAccount) {
			s.acctBalanceMsat = 5000
		},
		originalRequest: &lnrpc.SendRequest{
			AmtMsat: 5000,
			FeeLimit: &lnrpc.FeeLimit{
				Limit: &lnrpc.FeeLimit_Percent{
					Percent: 1,
				},
			},
			PaymentHash: testHash[:],
		},
		requestErr: "error validating account balance: invalid balance",
	}, {
		name:    "send payment, exact balance",
		fullURI: "/lnrpc.Lightning/SendPaymentSync",
		setup: func(s *mockService, acct *OffChainBalanceAccount) {
			s.acctBalanceMsat = 5123
		},
		originalRequest: &lnrpc.SendRequest{
			AmtMsat: 5000,
			FeeLimit: &lnrpc.FeeLimit{
				Limit: &lnrpc.FeeLimit_FixedMsat{
					FixedMsat: 123,
				},
			},
			PaymentHash: testHash[:],
		},
		originalResponse: &lnrpc.SendResponse{
			PaymentHash: testHash[:],
			PaymentRoute: &lnrpc.Route{
				TotalAmtMsat:  5000,
				TotalFeesMsat: 123,
			},
		},
		validate: func(t *testing.T, s *mockService,
			acct *OffChainBalanceAccount) {

			require.Contains(t, s.trackedPayments, testHash)
			payment := s.trackedPayments[testHash]
			require.EqualValues(t, 5123, payment.FullAmount)

			// We start tracking the payment and don't look at the
			// payment state reported by the response.
			require.Equal(
				t, lnrpc.Payment_UNKNOWN, payment.Status,
			)
		},
	}, {
		name:            "list payments, not mapped to account",
		fullURI:         "/lnrpc.Lightning/ListPayments",
		originalRequest: &lnrpc.ListPaymentsRequest{},
		originalResponse: &lnrpc.ListPaymentsResponse{
			Payments: []*lnrpc.Payment{{
				PaymentHash: hex.EncodeToString(testHash[:]),
			}},
		},
		replacedResponse: &lnrpc.ListPaymentsResponse{
			Payments: []*lnrpc.Payment{},
		},
	}, {
		name:    "list payments, mapped to account",
		fullURI: "/lnrpc.Lightning/ListPayments",
		setup: func(s *mockService, acct *OffChainBalanceAccount) {
			acct.Payments[testHash] = &PaymentEntry{}
		},
		originalRequest: &lnrpc.ListPaymentsRequest{},
		originalResponse: &lnrpc.ListPaymentsResponse{
			Payments: []*lnrpc.Payment{{
				PaymentHash: hex.EncodeToString(testHash[:]),
			}},
		},
		replacedResponse: &lnrpc.ListPaymentsResponse{
			Payments: []*lnrpc.Payment{{
				PaymentHash: hex.EncodeToString(testHash[:]),
			}},
		},
	}, {
		name:    "track payment, not mapped to account",
		fullURI: "/routerrpc.Router/TrackPaymentV2",
		originalRequest: &routerrpc.TrackPaymentRequest{
			PaymentHash: testHash[:],
		},
		requestErr: "payment does not belong to this account",
	}, {
		name:    "track payment, mapped to account",
		fullURI: "/routerrpc.Router/TrackPaymentV2",
		setup: func(s *mockService, acct *OffChainBalanceAccount) {
			acct.Payments[testHash] = &PaymentEntry{}
		},
		originalRequest: &routerrpc.TrackPaymentRequest{
			PaymentHash: testHash[:],
		},
		originalResponse: &lnrpc.Payment{
			PaymentHash: hex.EncodeToString(testHash[:]),
		},
	}, {
		name:    "deprecated: router send payment v1",
		fullURI: "/routerrpc.Router/SendPayment",
		originalRequest: &routerrpc.SendPaymentRequest{
			PaymentHash: testHash[:],
		},
		requestErr: "this RPC call is not supported with restricted " +
			"account macaroons",
	}, {
		name:    "deprecated: router send to route v1",
		fullURI: "/routerrpc.Router/SendToRoute",
		originalRequest: &routerrpc.SendToRouteRequest{
			PaymentHash: testHash[:],
		},
		requestErr: "this RPC call is not supported with restricted " +
			"account macaroons",
	}, {
		name:    "deprecated: router track payment v1",
		fullURI: "/routerrpc.Router/TrackPayment",
		originalRequest: &routerrpc.TrackPaymentRequest{
			PaymentHash: testHash[:],
		},
		requestErr: "this RPC call is not supported with restricted " +
			"account macaroons",
	}, {
		name:            "empty response: pending channels",
		fullURI:         "/lnrpc.Lightning/PendingChannels",
		originalRequest: &lnrpc.PendingChannelsRequest{},
		originalResponse: &lnrpc.PendingChannelsResponse{
			TotalLimboBalance: 123456,
			PendingOpenChannels: []*lnrpc.PendingChannelsResponse_PendingOpenChannel{
				{},
			},
		},
		replacedResponse: &lnrpc.PendingChannelsResponse{},
	}, {
		name:            "empty response: list channels",
		fullURI:         "/lnrpc.Lightning/ListChannels",
		originalRequest: &lnrpc.ListChannelsRequest{},
		originalResponse: &lnrpc.ListChannelsResponse{
			Channels: []*lnrpc.Channel{
				{},
			},
		},
		replacedResponse: &lnrpc.ListChannelsResponse{},
	}, {
		name:            "empty response: closed channels",
		fullURI:         "/lnrpc.Lightning/ClosedChannels",
		originalRequest: &lnrpc.ClosedChannelsRequest{},
		originalResponse: &lnrpc.ClosedChannelsResponse{
			Channels: []*lnrpc.ChannelCloseSummary{
				{},
			},
		},
		replacedResponse: &lnrpc.ClosedChannelsResponse{},
	}, {
		name:    "channel balance",
		fullURI: "/lnrpc.Lightning/ChannelBalance",
		setup: func(s *mockService, acct *OffChainBalanceAccount) {
			acct.CurrentBalance = 4455667788
		},
		originalRequest: &lnrpc.ChannelBalanceRequest{},
		originalResponse: &lnrpc.ChannelBalanceResponse{
			Balance:                  123, // nolint
			PendingOpenBalance:       456, // nolint
			LocalBalance:             testAmount,
			RemoteBalance:            testAmount,
			UnsettledLocalBalance:    testAmount,
			UnsettledRemoteBalance:   testAmount,
			PendingOpenLocalBalance:  testAmount,
			PendingOpenRemoteBalance: testAmount,
		},
		replacedResponse: &lnrpc.ChannelBalanceResponse{
			Balance:            4455667, // nolint
			PendingOpenBalance: 0,       // nolint
			LocalBalance: &lnrpc.Amount{
				Sat:  4455667,
				Msat: 4455667788,
			},
			RemoteBalance:            emptyAmount,
			UnsettledLocalBalance:    emptyAmount,
			UnsettledRemoteBalance:   emptyAmount,
			PendingOpenLocalBalance:  emptyAmount,
			PendingOpenRemoteBalance: emptyAmount,
		},
	}, {
		name:            "get info",
		fullURI:         "/lnrpc.Lightning/GetInfo",
		originalRequest: &lnrpc.GetInfoRequest{},
		originalResponse: &lnrpc.GetInfoResponse{
			Version:            "foobar",
			NumActiveChannels:  123,
			NumPeers:           790,
			NumPendingChannels: 777,
		},
		replacedResponse: &lnrpc.GetInfoResponse{
			Version: "foobar",
		},
	}}

	for _, tc := range testCases {
		tc := tc

		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()

			service := newMockService()
			checkers := NewAccountChecker(service, chainParams)
			acct := &OffChainBalanceAccount{
				ID:       testID,
				Type:     TypeInitialBalance,
				Invoices: make(AccountInvoices),
				Payments: make(AccountPayments),
			}
			ctx := AddAccountToContext(context.Background(), acct)
			ctx = AddRequestIDToContext(ctx, reqID)

			// Is a setup call required to initialize initial
			// conditions?
			if tc.setup != nil {
				tc.setup(service, acct)
			}

			err := checkers.checkIncomingRequest(
				ctx, tc.fullURI, tc.originalRequest,
			)

			// Did we expect an error?
			if tc.requestErr != "" {
				require.ErrorContains(tt, err, tc.requestErr)
				return
			}
			require.NoError(tt, err)

			replaced, err := checkers.replaceOutgoingResponse(
				ctx, tc.fullURI, tc.originalResponse,
			)

			// Did we expect an error?
			if tc.responseErr != "" {
				require.ErrorContains(tt, err, tc.responseErr)
				return
			}
			require.NoError(tt, err)

			assertMessagesEqual(tt, tc.replacedResponse, replaced)

			// Any post execution validation that we need to run?
			if tc.validate != nil {
				tc.validate(tt, service, acct)
			}
		})
	}
}

// TestSendPaymentCalls performs test coverage on the SendPayment and
// SendPaymentSync checkers.
func TestSendPaymentCalls(t *testing.T) {
	t.Run("SendPayment", func(t *testing.T) {
		testSendPayment(t, "/lnrpc.Lightning/SendPayment")
	})

	t.Run("SendPaymentSync", func(t *testing.T) {
		testSendPayment(t, "/lnrpc.Lightning/SendPaymentSync")
	})
}

func testSendPayment(t *testing.T, uri string) {
	var (
		parentCtx = context.Background()
		zeroFee   = &lnrpc.FeeLimit{Limit: &lnrpc.FeeLimit_Fixed{
			Fixed: 0,
		}}
		requestID uint64
	)

	nextRequestID := func() uint64 {
		requestID++

		return requestID
	}

	lndMock := newMockLnd()
	routerMock := newMockRouter()
	errFunc := func(err error) {
		lndMock.mainErrChan <- err
	}
	service, err := NewService(t.TempDir(), errFunc)
	require.NoError(t, err)

	err = service.Start(lndMock, routerMock, chainParams)
	require.NoError(t, err)

	assertBalance := func(id AccountID, expectedBalance int64) {
		acct, err := service.Account(id)
		require.NoError(t, err)

		require.Equal(t, expectedBalance,
			calcAvailableAccountBalance(acct))
	}

	// This should error because there is no account in the context.
	err = service.checkers.checkIncomingRequest(
		parentCtx, uri, &lnrpc.SendRequest{},
	)
	require.ErrorContains(t, err, "no account found in context")

	// Create an account and add it to the context.
	acct, err := service.NewAccount(
		5000, time.Now().Add(time.Hour), "test",
	)
	require.NoError(t, err)

	ctxWithAcct := AddAccountToContext(parentCtx, acct)

	// This should error because there is no request ID in the context.
	err = service.checkers.checkIncomingRequest(
		ctxWithAcct, uri, &lnrpc.SendRequest{},
	)
	require.ErrorContains(t, err, "no request ID found in context")

	reqID1 := nextRequestID()
	ctx := AddRequestIDToContext(ctxWithAcct, reqID1)

	// This should error because no payment hash is provided.
	err = service.checkers.checkIncomingRequest(
		ctx, uri, &lnrpc.SendRequest{},
	)
	require.ErrorContains(t, err, "a payment hash is required")

	// This should error because of an insufficient account balance.
	err = service.checkers.checkIncomingRequest(
		ctx, uri, &lnrpc.SendRequest{
			Amt:         1000,
			PaymentHash: testHash[:],
		},
	)
	require.ErrorContains(t, err, "account balance insufficient")

	// Assert that the balance of the account is still un-changed since none
	// of the requests have gone through yet.
	assertBalance(acct.ID, 5000)

	// This should work.
	err = service.checkers.checkIncomingRequest(
		ctx, uri, &lnrpc.SendRequest{
			AmtMsat:     1000,
			PaymentHash: testHash[:],
			FeeLimit:    zeroFee,
		},
	)
	require.NoError(t, err)

	// Alright, now assert that the pending amount has been accounted for.
	assertBalance(acct.ID, 4000)

	// Try let the same request go through with the same payment hash. This
	// should fail and the balance should remain unchanged.
	err = service.checkers.checkIncomingRequest(
		ctx, uri, &lnrpc.SendRequest{
			AmtMsat:     1000,
			PaymentHash: testHash[:],
			FeeLimit:    zeroFee,
		},
	)
	require.ErrorContains(t, err, "is already in flight")
	assertBalance(acct.ID, 4000)

	// Now let the response come through for the first request.
	_, err = service.checkers.replaceOutgoingResponse(
		ctx, uri, &lnrpc.SendResponse{
			PaymentHash: testHash[:],
		},
	)
	require.NoError(t, err)
	assertBalance(acct.ID, 4000)

	// A repeated response should have no impact.
	_, err = service.checkers.replaceOutgoingResponse(
		ctx, uri, &lnrpc.SendResponse{
			PaymentHash: testHash[:],
		},
	)
	require.NoError(t, err)
	assertBalance(acct.ID, 4000)

	routerMock.assertPaymentRequests(t, map[lntypes.Hash]struct{}{
		testHash: {},
	})

	nextRequestID()

	reqID2 := nextRequestID()
	ctx = AddRequestIDToContext(ctxWithAcct, reqID2)

	// Ok now we will test an errored request. First send through a valid
	// send request and assert that the available balance is reduced.
	err = service.checkers.checkIncomingRequest(
		ctx, uri, &lnrpc.SendRequest{
			AmtMsat:     1000,
			PaymentHash: testHash2[:],
			FeeLimit:    zeroFee,
		},
	)
	require.NoError(t, err)
	assertBalance(acct.ID, 3000)

	// Now return an error response.
	_, err = service.checkers.handleErrorResponse(
		ctx, uri, nil,
	)
	require.NoError(t, err)

	// The balance should have gone back to what it was before the payment
	// was initiated.
	assertBalance(acct.ID, 4000)

	routerMock.assertNoPaymentRequest(t)

	// The final test we will do is to have two send requests initiated
	// before the response for the first one has been received.
	reqID3 := nextRequestID()
	ctx = AddRequestIDToContext(ctxWithAcct, reqID3)

	err = service.checkers.checkIncomingRequest(
		ctx, uri, &lnrpc.SendRequest{
			AmtMsat:     2000,
			PaymentHash: testHash3[:],
			FeeLimit:    zeroFee,
		},
	)
	require.NoError(t, err)
	assertBalance(acct.ID, 2000)

	reqID4 := nextRequestID()
	ctx = AddRequestIDToContext(ctxWithAcct, reqID4)
	err = service.checkers.checkIncomingRequest(
		ctx, uri, &lnrpc.SendRequest{
			AmtMsat:     2000,
			PaymentHash: testHash4[:],
			FeeLimit:    zeroFee,
		},
	)
	require.NoError(t, err)
	assertBalance(acct.ID, 0)

	// Ok, now let the response for the second request come through.
	_, err = service.checkers.replaceOutgoingResponse(
		ctx, uri, &lnrpc.SendResponse{
			PaymentHash: testHash4[:],
		},
	)
	require.NoError(t, err)
	assertBalance(acct.ID, 0)

	// Let the first request error.
	ctx = AddRequestIDToContext(ctxWithAcct, reqID3)
	_, err = service.checkers.handleErrorResponse(
		ctx, uri, nil,
	)
	require.NoError(t, err)
	assertBalance(acct.ID, 2000)
}

// TestSendPaymentV2 performs test coverage on the SendPaymentV2 checker.
func TestSendPaymentV2(t *testing.T) {
	var (
		uri       = "/routerrpc.Router/SendPaymentV2"
		parentCtx = context.Background()
		requestID uint64
	)

	nextRequestID := func() uint64 {
		requestID++

		return requestID
	}

	lndMock := newMockLnd()
	routerMock := newMockRouter()
	errFunc := func(err error) {
		lndMock.mainErrChan <- err
	}
	service, err := NewService(t.TempDir(), errFunc)
	require.NoError(t, err)

	err = service.Start(lndMock, routerMock, chainParams)
	require.NoError(t, err)

	assertBalance := func(id AccountID, expectedBalance int64) {
		acct, err := service.Account(id)
		require.NoError(t, err)

		require.Equal(t, expectedBalance,
			calcAvailableAccountBalance(acct))
	}

	// This should error because there is no account in the context.
	err = service.checkers.checkIncomingRequest(
		parentCtx, uri, &routerrpc.SendPaymentRequest{},
	)
	require.ErrorContains(t, err, "no account found in context")

	// Create an account and add it to the context.
	acct, err := service.NewAccount(
		5000, time.Now().Add(time.Hour), "test",
	)
	require.NoError(t, err)

	ctxWithAcct := AddAccountToContext(parentCtx, acct)

	// This should error because there is no request ID in the context.
	err = service.checkers.checkIncomingRequest(
		ctxWithAcct, uri, &routerrpc.SendPaymentRequest{},
	)
	require.ErrorContains(t, err, "no request ID found in context")

	reqID1 := nextRequestID()
	ctx := AddRequestIDToContext(ctxWithAcct, reqID1)

	// This should error because no payment hash is provided.
	err = service.checkers.checkIncomingRequest(
		ctx, uri, &routerrpc.SendPaymentRequest{},
	)
	require.ErrorContains(t, err, "a payment hash is required")

	// This should error because of an insufficient account balance.
	err = service.checkers.checkIncomingRequest(
		ctx, uri, &routerrpc.SendPaymentRequest{
			Amt:         1000,
			PaymentHash: testHash[:],
		},
	)
	require.ErrorContains(t, err, "account balance insufficient")

	// Assert that the balance of the account is still un-changed since none
	// of the requests have gone through yet.
	assertBalance(acct.ID, 5000)

	// This should work.
	err = service.checkers.checkIncomingRequest(
		ctx, uri, &routerrpc.SendPaymentRequest{
			AmtMsat:     1000,
			PaymentHash: testHash[:],
		},
	)
	require.NoError(t, err)

	// Alright, now assert that the pending amount has been accounted for.
	assertBalance(acct.ID, 4000)

	// Try let the same request go through with the same payment hash. This
	// should fail and the balance should remain unchanged.
	err = service.checkers.checkIncomingRequest(
		ctx, uri, &routerrpc.SendPaymentRequest{
			AmtMsat:     1000,
			PaymentHash: testHash[:],
		},
	)
	require.ErrorContains(t, err, "is already in flight")
	assertBalance(acct.ID, 4000)

	// Now let the response come through for the first request.
	_, err = service.checkers.replaceOutgoingResponse(
		ctx, uri, &lnrpc.Payment{
			PaymentHash: hex.EncodeToString(testHash[:]),
		},
	)
	require.NoError(t, err)
	assertBalance(acct.ID, 4000)

	// A repeated response should have no impact.
	_, err = service.checkers.replaceOutgoingResponse(
		ctx, uri, &lnrpc.Payment{
			PaymentHash: hex.EncodeToString(testHash[:]),
		},
	)
	require.NoError(t, err)
	assertBalance(acct.ID, 4000)

	routerMock.assertPaymentRequests(t, map[lntypes.Hash]struct{}{
		testHash: {},
	})

	nextRequestID()

	reqID2 := nextRequestID()
	ctx = AddRequestIDToContext(ctxWithAcct, reqID2)

	// Ok now we will test an errored request. First send through a valid
	// send request and assert that the available balance is reduced.
	err = service.checkers.checkIncomingRequest(
		ctx, uri, &routerrpc.SendPaymentRequest{
			AmtMsat:     1000,
			PaymentHash: testHash2[:],
		},
	)
	require.NoError(t, err)
	assertBalance(acct.ID, 3000)

	// Now return an error response.
	_, err = service.checkers.handleErrorResponse(ctx, uri, nil)
	require.NoError(t, err)

	// The balance should have gone back to what it was before the payment
	// was initiated.
	assertBalance(acct.ID, 4000)

	routerMock.assertNoPaymentRequest(t)

	// The final test we will do is to have two send requests initiated
	// before the response for the first one has been received.
	reqID3 := nextRequestID()
	ctx = AddRequestIDToContext(ctxWithAcct, reqID3)

	err = service.checkers.checkIncomingRequest(
		ctx, uri, &routerrpc.SendPaymentRequest{
			AmtMsat:     2000,
			PaymentHash: testHash3[:],
		},
	)
	require.NoError(t, err)
	assertBalance(acct.ID, 2000)

	reqID4 := nextRequestID()
	ctx = AddRequestIDToContext(ctxWithAcct, reqID4)
	err = service.checkers.checkIncomingRequest(
		ctx, uri, &routerrpc.SendPaymentRequest{
			AmtMsat:     2000,
			PaymentHash: testHash4[:],
		},
	)
	require.NoError(t, err)
	assertBalance(acct.ID, 0)

	// Ok, now let the response for the second request come through.
	_, err = service.checkers.replaceOutgoingResponse(
		ctx, uri, &lnrpc.Payment{
			PaymentHash: hex.EncodeToString(testHash4[:]),
		},
	)
	require.NoError(t, err)
	assertBalance(acct.ID, 0)

	// Let the first request error.
	ctx = AddRequestIDToContext(ctxWithAcct, reqID3)
	_, err = service.checkers.handleErrorResponse(ctx, uri, nil)
	require.NoError(t, err)
	assertBalance(acct.ID, 2000)
}

// TestSendToRouteV2 performs test coverage on the SendToRouteV2 checker.
func TestSendToRouteV2(t *testing.T) {
	var (
		uri       = "/routerrpc.Router/SendToRouteV2"
		parentCtx = context.Background()
		requestID uint64
	)

	nextRequestID := func() uint64 {
		requestID++

		return requestID
	}

	lndMock := newMockLnd()
	routerMock := newMockRouter()
	errFunc := func(err error) {
		lndMock.mainErrChan <- err
	}
	service, err := NewService(t.TempDir(), errFunc)
	require.NoError(t, err)

	err = service.Start(lndMock, routerMock, chainParams)
	require.NoError(t, err)

	assertBalance := func(id AccountID, expectedBalance int64) {
		acct, err := service.Account(id)
		require.NoError(t, err)

		require.Equal(t, expectedBalance,
			calcAvailableAccountBalance(acct))
	}

	// This should error because there is no account in the context.
	err = service.checkers.checkIncomingRequest(
		parentCtx, uri, &routerrpc.SendToRouteRequest{},
	)
	require.ErrorContains(t, err, "no account found in context")

	// Create an account and add it to the context.
	acct, err := service.NewAccount(
		5000, time.Now().Add(time.Hour), "test",
	)
	require.NoError(t, err)

	ctxWithAcct := AddAccountToContext(parentCtx, acct)

	// This should error because there is no request ID in the context.
	err = service.checkers.checkIncomingRequest(
		ctxWithAcct, uri, &routerrpc.SendToRouteRequest{},
	)
	require.ErrorContains(t, err, "no request ID found in context")

	reqID1 := nextRequestID()
	ctx := AddRequestIDToContext(ctxWithAcct, reqID1)

	// This should error because no payment hash is provided.
	err = service.checkers.checkIncomingRequest(
		ctx, uri, &routerrpc.SendToRouteRequest{},
	)
	require.ErrorContains(t, err, "invalid hash length")

	// This should error because of an insufficient account balance.
	err = service.checkers.checkIncomingRequest(
		ctx, uri, &routerrpc.SendToRouteRequest{
			Route: &lnrpc.Route{
				TotalAmt: 1000,
			},
			PaymentHash: testHash[:],
		},
	)
	require.ErrorContains(t, err, "account balance insufficient")

	// Assert that the balance of the account is still un-changed since none
	// of the requests have gone through yet.
	assertBalance(acct.ID, 5000)

	// This should work.
	err = service.checkers.checkIncomingRequest(
		ctx, uri, &routerrpc.SendToRouteRequest{
			Route: &lnrpc.Route{
				TotalAmtMsat: 1000,
			},
			PaymentHash: testHash[:],
		},
	)
	require.NoError(t, err)

	// Alright, now assert that the pending amount has been accounted for.
	assertBalance(acct.ID, 4000)

	// Try let the same request go through with the same payment hash. This
	// should fail and the balance should remain unchanged.
	err = service.checkers.checkIncomingRequest(
		ctx, uri, &routerrpc.SendToRouteRequest{
			Route: &lnrpc.Route{
				TotalAmtMsat: 1000,
			},
			PaymentHash: testHash[:],
		},
	)
	require.ErrorContains(t, err, "is already in flight")
	assertBalance(acct.ID, 4000)

	// Now let the response come through for the first request. Even though
	// this response does not contain the payment hash, it should still be
	// linked correctly since we track this in the request values store.
	_, err = service.checkers.replaceOutgoingResponse(
		ctx, uri, &lnrpc.HTLCAttempt{},
	)
	require.NoError(t, err)
	assertBalance(acct.ID, 4000)

	// A repeated response should have no impact.
	_, err = service.checkers.replaceOutgoingResponse(
		ctx, uri, &lnrpc.HTLCAttempt{},
	)
	require.NoError(t, err)
	assertBalance(acct.ID, 4000)

	routerMock.assertPaymentRequests(t, map[lntypes.Hash]struct{}{
		testHash: {},
	})

	nextRequestID()

	reqID2 := nextRequestID()
	ctx = AddRequestIDToContext(ctxWithAcct, reqID2)

	// Ok now we will test an errored request. First send through a valid
	// send request and assert that the available balance is reduced.
	err = service.checkers.checkIncomingRequest(
		ctx, uri, &routerrpc.SendToRouteRequest{
			Route: &lnrpc.Route{
				TotalAmtMsat: 1000,
			},
			PaymentHash: testHash2[:],
		},
	)
	require.NoError(t, err)
	assertBalance(acct.ID, 3000)

	// Now return an error response.
	_, err = service.checkers.handleErrorResponse(ctx, uri, nil)
	require.NoError(t, err)

	// The balance should have gone back to what it was before the payment
	// was initiated.
	assertBalance(acct.ID, 4000)

	routerMock.assertNoPaymentRequest(t)

	// The final test we will do is to have two send requests initiated
	// before the response for the first one has been received.
	reqID3 := nextRequestID()
	ctx = AddRequestIDToContext(ctxWithAcct, reqID3)

	err = service.checkers.checkIncomingRequest(
		ctx, uri, &routerrpc.SendToRouteRequest{
			Route: &lnrpc.Route{
				TotalAmtMsat: 2000,
			},
			PaymentHash: testHash3[:],
		},
	)
	require.NoError(t, err)
	assertBalance(acct.ID, 2000)

	reqID4 := nextRequestID()
	ctx = AddRequestIDToContext(ctxWithAcct, reqID4)
	err = service.checkers.checkIncomingRequest(
		ctx, uri, &routerrpc.SendToRouteRequest{
			Route: &lnrpc.Route{
				TotalAmtMsat: 2000,
			},
			PaymentHash: testHash4[:],
		},
	)
	require.NoError(t, err)
	assertBalance(acct.ID, 0)

	// Ok, now let the response for the second request come through.
	_, err = service.checkers.replaceOutgoingResponse(
		ctx, uri, &lnrpc.HTLCAttempt{},
	)
	require.NoError(t, err)
	assertBalance(acct.ID, 0)

	// Let the first request error.
	ctx = AddRequestIDToContext(ctxWithAcct, reqID3)
	_, err = service.checkers.handleErrorResponse(ctx, uri, nil)
	require.NoError(t, err)
	assertBalance(acct.ID, 2000)
}

// assertMessagesEqual makes sure two proto messages are equal by JSON
// serializing them.
func assertMessagesEqual(t *testing.T, expected, actual proto.Message) {
	expectedJSON, err := marshalOptions.Marshal(expected)
	require.NoError(t, err)

	actualJSON, err := marshalOptions.Marshal(actual)
	require.NoError(t, err)

	require.Equal(t, string(expectedJSON), string(actualJSON))
}
