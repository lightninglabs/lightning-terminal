package accounts

import (
	"context"
	"fmt"

	"github.com/btcsuite/btcd/btcutil"
	"github.com/btcsuite/btcd/chaincfg"
	mid "github.com/lightninglabs/lightning-terminal/rpcmiddleware"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/lnrpc/routerrpc"
	"github.com/lightningnetwork/lnd/lntypes"
	"github.com/lightningnetwork/lnd/lnwire"
	"github.com/lightningnetwork/lnd/zpay32"
	"google.golang.org/protobuf/proto"
)

var (
	// DecodePayReqPassThrough is a pass-through checker that allows calls
	// to DecodePayReq through unchanged.
	DecodePayReqPassThrough = mid.NewPassThrough(
		&lnrpc.PayReqString{}, &lnrpc.PayReq{},
	)

	// GetNodeInfoPassThrough is a pass-through checker that allows calls
	// to GetNodeInfo through unchanged.
	GetNodeInfoPassThrough = mid.NewPassThrough(
		&lnrpc.NodeInfoRequest{}, &lnrpc.NodeInfo{},
	)

	// PendingChannelsEmptyRewriter is a response re-writer that returns a
	// response to PendingChannels with zero channels shown.
	PendingChannelsEmptyRewriter = mid.NewResponseEmptier[
		*lnrpc.PendingChannelsRequest, *lnrpc.PendingChannelsResponse,
	]()

	// ListChannelsEmptyRewriter is a response re-writer that returns a
	// response to ListChannels with zero channels shown.
	ListChannelsEmptyRewriter = mid.NewResponseEmptier[
		*lnrpc.ListChannelsRequest, *lnrpc.ListChannelsResponse,
	]()

	// ClosedChannelsEmptyRewriter is a response re-writer that returns a
	// response to ClosedChannels with zero channels shown.
	ClosedChannelsEmptyRewriter = mid.NewResponseEmptier[
		*lnrpc.ClosedChannelsRequest, *lnrpc.ClosedChannelsResponse,
	]()

	// WalletBalanceEmptyRewriter is a response re-writer that returns a
	// response to WalletBalance with a zero balance shown.
	WalletBalanceEmptyRewriter = mid.NewResponseEmptier[
		*lnrpc.WalletBalanceRequest, *lnrpc.WalletBalanceResponse,
	]()

	// GetTransactionsEmptyRewriter is a response re-writer that returns a
	// response to GetTransactions with zero transactions shown.
	GetTransactionsEmptyRewriter = mid.NewResponseEmptier[
		*lnrpc.GetTransactionsRequest, *lnrpc.TransactionDetails,
	]()

	// ListPeersEmptyRewriter is a response re-writer that returns a
	// response to ListPeers with zero peers shown.
	ListPeersEmptyRewriter = mid.NewResponseEmptier[
		*lnrpc.ListPeersRequest, *lnrpc.ListPeersResponse,
	]()

	emptyHash lntypes.Hash
)

// CheckerMap is a type alias that maps gRPC request URIs to their
// rpcmiddleware.RoundTripChecker types.
type CheckerMap map[string]mid.RoundTripChecker

// AccountChecker is a type that can check all account related requests,
// including invoices, payments and account balances.
type AccountChecker struct {
	checkers CheckerMap
}

// NewAccountChecker creates a new account checker that can keep track of all
// account related requests, including invoices, payments and account balances.
func NewAccountChecker(service Service,
	chainParams *chaincfg.Params) *AccountChecker {

	// sendResponseHandler is a response handler function that is used by
	// multiple RPC checkers for checking an RPC response sent for a payment
	// attempt.
	sendResponseHandler := func(ctx context.Context,
		r *lnrpc.SendResponse) (proto.Message, error) {

		status := lnrpc.Payment_IN_FLIGHT
		if len(r.PaymentError) > 0 {
			status = lnrpc.Payment_FAILED
		}

		hash, err := lntypes.MakeHash(r.PaymentHash)
		if err != nil {
			return nil, fmt.Errorf("error parsing payment hash: %v",
				err)
		}

		route := r.PaymentRoute
		totalAmount := int64(0)
		if route != nil {
			totalAmount = route.TotalAmtMsat + route.TotalFeesMsat
		}

		return checkSendResponse(
			ctx, service, status, hash, totalAmount,
		)
	}

	checkers := CheckerMap{
		// Invoices:
		"/lnrpc.Lightning/AddInvoice": mid.NewResponseRewriter(
			&lnrpc.Invoice{},
			&lnrpc.AddInvoiceResponse{},
			func(ctx context.Context,
				t *lnrpc.AddInvoiceResponse) (proto.Message,
				error) {

				hash, err := lntypes.MakeHash(t.RHash)
				if err != nil {
					return nil, fmt.Errorf("error parsing "+
						"invoice hash: %v", err)
				}

				acct, err := AccountFromContext(ctx)
				if err != nil {
					return nil, err
				}

				return nil, service.AssociateInvoice(
					ctx, acct.ID, hash,
				)
			}, mid.PassThroughErrorHandler,
		),
		"/lnrpc.Lightning/ListInvoices": mid.NewResponseRewriter(
			&lnrpc.ListInvoiceRequest{},
			&lnrpc.ListInvoiceResponse{},
			func(ctx context.Context,
				t *lnrpc.ListInvoiceResponse) (proto.Message,
				error) {

				filteredInvoices, err := filterInvoices(ctx, t)
				if err != nil {
					return nil, fmt.Errorf("error "+
						"filtering invoices: %v", err)
				}

				t.Invoices = filteredInvoices
				return t, nil
			}, mid.PassThroughErrorHandler,
		),
		"/lnrpc.Lightning/LookupInvoice": mid.NewRequestChecker(
			&lnrpc.PaymentHash{},
			&lnrpc.Invoice{},
			func(ctx context.Context, t *lnrpc.PaymentHash) error {
				acct, err := AccountFromContext(ctx)
				if err != nil {
					return err
				}

				hash, err := lntypes.MakeHash(t.RHash)
				if err != nil {
					return fmt.Errorf("error parsing "+
						"payment hash: %v", err)
				}

				if _, ok := acct.Invoices[hash]; !ok {
					return fmt.Errorf("invoice does not " +
						"belong to this account")
				}

				return nil
			},
		),

		// Payments:
		"/lnrpc.Lightning/SendPayment": mid.NewFullChecker(
			&lnrpc.SendRequest{},
			&lnrpc.SendResponse{},
			func(ctx context.Context, r *lnrpc.SendRequest) error {
				return checkSend(
					ctx, chainParams, service, r.Amt,
					r.AmtMsat, r.PaymentRequest,
					r.PaymentHash, r.FeeLimit,
				)
			}, sendResponseHandler, erroredPaymentHandler(service),
		),
		"/lnrpc.Lightning/SendPaymentSync": mid.NewFullChecker(
			&lnrpc.SendRequest{},
			&lnrpc.SendResponse{},
			func(ctx context.Context, r *lnrpc.SendRequest) error {
				return checkSend(
					ctx, chainParams, service, r.Amt,
					r.AmtMsat, r.PaymentRequest,
					r.PaymentHash, r.FeeLimit,
				)
			}, sendResponseHandler, erroredPaymentHandler(service),
		),
		// routerrpc.Router/SendPayment is deprecated.
		"/routerrpc.Router/SendPaymentV2": mid.NewFullChecker(
			&routerrpc.SendPaymentRequest{},
			&lnrpc.Payment{},
			func(ctx context.Context,
				r *routerrpc.SendPaymentRequest) error {

				feeLimitMsat := r.FeeLimitMsat
				if r.FeeLimitSat > 0 {
					feeLimitMsat = r.FeeLimitSat * 1000
				}

				return checkSend(
					ctx, chainParams, service, r.Amt,
					r.AmtMsat, r.PaymentRequest,
					r.PaymentHash,
					&lnrpc.FeeLimit{
						Limit: &lnrpc.FeeLimit_FixedMsat{
							FixedMsat: feeLimitMsat,
						},
					},
				)
			},
			func(ctx context.Context,
				r *lnrpc.Payment) (proto.Message, error) {

				hash, err := lntypes.MakeHashFromStr(
					r.PaymentHash,
				)
				if err != nil {
					return nil, fmt.Errorf("error parsing "+
						"payment hash: %v", err)
				}

				fullAmt := r.ValueMsat + r.FeeMsat
				return checkSendResponse(
					ctx, service, r.Status, hash, fullAmt,
				)
			}, erroredPaymentHandler(service),
		),
		"/lnrpc.Lightning/SendToRoute": mid.NewFullChecker(
			&lnrpc.SendToRouteRequest{},
			&lnrpc.SendResponse{},
			func(ctx context.Context,
				r *lnrpc.SendToRouteRequest) error {

				return checkSendToRoute(
					ctx, service, r.PaymentHash, r.Route,
				)
			}, sendResponseHandler, erroredPaymentHandler(service),
		),
		"/lnrpc.Lightning/SendToRouteSync": mid.NewFullChecker(
			&lnrpc.SendToRouteRequest{},
			&lnrpc.SendResponse{},
			func(ctx context.Context,
				r *lnrpc.SendToRouteRequest) error {

				return checkSendToRoute(
					ctx, service, r.PaymentHash, r.Route,
				)
			}, sendResponseHandler, erroredPaymentHandler(service),
		),
		// routerrpc.Router/SendToRoute is deprecated.
		"/routerrpc.Router/SendToRouteV2": mid.NewFullChecker(
			&routerrpc.SendToRouteRequest{},
			&lnrpc.HTLCAttempt{},
			func(ctx context.Context,
				r *routerrpc.SendToRouteRequest) error {

				return checkSendToRoute(
					ctx, service, r.PaymentHash, r.Route,
				)
			},
			sendToRouteHTLCResponseHandler(service),
			erroredPaymentHandler(service),
		),
		"/lnrpc.Lightning/DecodePayReq": DecodePayReqPassThrough,
		"/lnrpc.Lightning/ListPayments": mid.NewResponseRewriter(
			&lnrpc.ListPaymentsRequest{},
			&lnrpc.ListPaymentsResponse{},
			func(ctx context.Context,
				t *lnrpc.ListPaymentsResponse) (proto.Message,
				error) {

				filteredPayments, err := filterPayments(ctx, t)
				if err != nil {
					return nil, fmt.Errorf("error "+
						"filtering payments: %v", err)
				}

				t.Payments = filteredPayments
				return t, nil
			}, mid.PassThroughErrorHandler,
		),
		// routerrpc.Router/TrackPayment is deprecated.
		"/routerrpc.Router/TrackPaymentV2": mid.NewRequestChecker(
			&routerrpc.TrackPaymentRequest{},
			&lnrpc.Payment{},
			func(ctx context.Context,
				t *routerrpc.TrackPaymentRequest) error {

				acct, err := AccountFromContext(ctx)
				if err != nil {
					return err
				}

				hash, err := lntypes.MakeHash(t.PaymentHash)
				if err != nil {
					return fmt.Errorf("error parsing "+
						"payment hash: %v", err)
				}

				if _, ok := acct.Payments[hash]; !ok {
					return fmt.Errorf("payment does not " +
						"belong to this account")
				}

				return nil
			}),

		// Channels:
		"/lnrpc.Lightning/PendingChannels": PendingChannelsEmptyRewriter,
		"/lnrpc.Lightning/ListChannels":    ListChannelsEmptyRewriter,
		"/lnrpc.Lightning/ClosedChannels":  ClosedChannelsEmptyRewriter,

		// Balances:
		"/lnrpc.Lightning/ChannelBalance": mid.NewResponseRewriter(
			&lnrpc.ChannelBalanceRequest{},
			&lnrpc.ChannelBalanceResponse{},
			func(ctx context.Context,
				t *lnrpc.ChannelBalanceResponse) (proto.Message,
				error) {

				acct, err := AccountFromContext(ctx)
				if err != nil {
					return nil, err
				}

				balanceSat := acct.CurrentBalanceSats()
				emptyAmount := &lnrpc.Amount{}
				return &lnrpc.ChannelBalanceResponse{
					Balance: balanceSat,
					LocalBalance: &lnrpc.Amount{
						Sat: uint64(balanceSat),
						Msat: uint64(
							acct.CurrentBalance,
						),
					},
					RemoteBalance:            emptyAmount,
					UnsettledLocalBalance:    emptyAmount,
					UnsettledRemoteBalance:   emptyAmount,
					PendingOpenLocalBalance:  emptyAmount,
					PendingOpenRemoteBalance: emptyAmount,
				}, nil
			}, mid.PassThroughErrorHandler,
		),
		"/lnrpc.Lightning/WalletBalance": WalletBalanceEmptyRewriter,

		// Transactions:
		"/lnrpc.Lightning/GetTransactions": GetTransactionsEmptyRewriter,

		// Peers:
		"/lnrpc.Lightning/ListPeers": ListPeersEmptyRewriter,

		// Info:
		"/lnrpc.Lightning/GetInfo": mid.NewResponseRewriter(
			&lnrpc.GetInfoRequest{},
			&lnrpc.GetInfoResponse{},
			func(_ context.Context,
				t *lnrpc.GetInfoResponse) (proto.Message,
				error) {

				return &lnrpc.GetInfoResponse{
					Version:                t.Version,
					CommitHash:             t.CommitHash,
					IdentityPubkey:         t.IdentityPubkey,
					Alias:                  t.Alias,
					Color:                  t.Color,
					BlockHeight:            t.BlockHeight,
					BlockHash:              t.BlockHash,
					BestHeaderTimestamp:    t.BestHeaderTimestamp,
					SyncedToChain:          t.SyncedToChain,
					SyncedToGraph:          t.SyncedToGraph,
					Testnet:                t.Testnet, // nolint
					Chains:                 t.Chains,
					Uris:                   t.Uris,
					Features:               t.Features,
					RequireHtlcInterceptor: t.RequireHtlcInterceptor,
				}, nil
			}, mid.PassThroughErrorHandler,
		),
		"/lnrpc.Lightning/GetNodeInfo": GetNodeInfoPassThrough,
	}

	return &AccountChecker{
		checkers: checkers,
	}
}

// handleErrorResponse passes an error to a checker if the checker has
// registered an error handler.
func (a *AccountChecker) handleErrorResponse(ctx context.Context,
	fullUri string, parsedErr error) (error, error) {

	// If we don't have a handler for the URI, it means we don't support
	// that RPC.
	checker, ok := a.checkers[fullUri]
	if !ok {
		return nil, ErrNotSupportedWithAccounts
	}

	newErr, err := checker.HandleErrorResponse(ctx, parsedErr)
	if err != nil {
		return nil, err
	}

	if newErr != nil {
		parsedErr = newErr
	}

	return parsedErr, nil
}

// checkIncomingRequest makes sure the type of incoming call is supported and
// if it is, that it is allowed with the current account balance.
func (a *AccountChecker) checkIncomingRequest(ctx context.Context,
	fullUri string, req proto.Message) error {

	// If we don't have a handler for the URI, it means we don't support
	// that RPC.
	checker, ok := a.checkers[fullUri]
	if !ok {
		return ErrNotSupportedWithAccounts
	}

	// This is just a sanity check to make sure the implementation for the
	// checker actually matches the correct request type.
	if !checker.HandlesRequest(req.ProtoReflect().Type()) {
		return fmt.Errorf("invalid implementation, checker for URI "+
			"%s does not accept request of type %v", fullUri,
			req.ProtoReflect().Type())
	}

	req, err := checker.HandleRequest(ctx, req)
	if err != nil {
		return err
	}

	if req != nil {
		return fmt.Errorf("request editing checkers not supported " +
			"for accounts")
	}

	return nil
}

// replaceOutgoingResponse inspects the responses before sending them out to the
// lightningClient and replaces them if needed.
func (a *AccountChecker) replaceOutgoingResponse(ctx context.Context,
	fullUri string, resp proto.Message) (proto.Message, error) {

	// If we don't have a handler for the URI, it means we don't support
	// that RPC. We shouldn't get here in the first place, since the initial
	// client request to lnd should've already been refused and no response
	// could've been generated by lnd.
	checker, ok := a.checkers[fullUri]
	if !ok {
		return nil, ErrNotSupportedWithAccounts
	}

	// This is just a sanity check to make sure the implementation for the
	// checker actually matches the correct request type.
	if !checker.HandlesResponse(resp.ProtoReflect().Type()) {
		return nil, fmt.Errorf("invalid implementation, checker for "+
			"URI %s does not accept response of type %v", fullUri,
			resp.ProtoReflect().Type())
	}

	return checker.HandleResponse(ctx, resp)
}

// filterInvoices filters the total response of all invoices returned by lnd and
// only includes those that are related to the account in the context.
func filterInvoices(ctx context.Context,
	t *lnrpc.ListInvoiceResponse) ([]*lnrpc.Invoice, error) {

	acct, err := AccountFromContext(ctx)
	if err != nil {
		return nil, err
	}

	// We don't pre-allocate, since we don't know how many invoices we have
	// after filtering.
	var filteredInvoices []*lnrpc.Invoice
	for _, invoice := range t.Invoices {

		hash, err := lntypes.MakeHash(invoice.RHash)
		if err != nil {
			return nil, err
		}

		if _, ok := acct.Invoices[hash]; ok {
			filteredInvoices = append(filteredInvoices, invoice)
		}
	}

	return filteredInvoices, nil
}

// filterPayments filters the total response of all payments returned by lnd and
// only includes those that are related to the account in the context.
func filterPayments(ctx context.Context,
	t *lnrpc.ListPaymentsResponse) ([]*lnrpc.Payment, error) {

	acct, err := AccountFromContext(ctx)
	if err != nil {
		return nil, err
	}

	// We don't pre-allocate, since we don't know how many payments we have
	// after filtering.
	var filteredPayments []*lnrpc.Payment
	for _, payment := range t.Payments {

		hash, err := lntypes.MakeHashFromStr(payment.PaymentHash)
		if err != nil {
			return nil, err
		}

		if _, ok := acct.Payments[hash]; ok {
			filteredPayments = append(filteredPayments, payment)
		}
	}

	return filteredPayments, nil
}

// checkSend checks if a payment can be initiated by making sure the account in
// the context has enough balance to pay for it.
func checkSend(ctx context.Context, chainParams *chaincfg.Params,
	service Service, amt, amtMsat int64, invoice string,
	paymentHash []byte, feeLimit *lnrpc.FeeLimit) error {

	log, acct, reqID, err := requestScopedValuesFromCtx(ctx)
	if err != nil {
		return err
	}

	sendAmt := max(lnwire.MilliSatoshi(amtMsat), lnwire.NewMSatFromSatoshis(btcutil.Amount(amt)))

	// We require that a payment hash is set, which we either read from the
	// payment hash from the invoice or from the request.
	var pHash lntypes.Hash

	// Check if an invoice was provided. If so, glean the payment hash from
	// that.
	if len(invoice) > 0 {
		payReq, err := zpay32.Decode(invoice, chainParams)
		if err != nil {
			return fmt.Errorf("error decoding pay req: %w", err)
		}

		if payReq.MilliSat != nil && *payReq.MilliSat > sendAmt {
			sendAmt = *payReq.MilliSat
		}

		if payReq.PaymentHash != nil {
			pHash = *payReq.PaymentHash
		}
	}

	// If a payment hash was separately provided in the request, then glean
	// derive the hash from there. If the invoice was set then the two
	// payment hashes must match.
	if len(paymentHash) != 0 {
		hash, err := lntypes.MakeHash(paymentHash)
		if err != nil {
			return err
		}

		if pHash != emptyHash && hash != pHash {
			return fmt.Errorf("two conflicting hashes provided")
		}

		pHash = hash
	}

	// If at this point we still have no payment hash, then we error out
	// for now.
	// TODO(elle): support key sends by:
	//  1) allowing the user to set a pre-image
	//  2) deriving a pre-image here.
	//  Then glean the payment hash from that.
	if pHash == emptyHash {
		return fmt.Errorf("a payment hash is required")
	}

	log.Tracef("Handling send request for payment with hash: %s and "+
		"amount: %d", pHash, sendAmt)

	// We also add the max fee to the amount to check. This might mean that
	// not every single satoshi of an account can be used up. But it
	// prevents an account from going into a negative balance if we only
	// check for the amount to send but then later debit the full amount.
	limit := feeLimit
	if limit == nil {
		limit = &lnrpc.FeeLimit{}
	}
	fee := lnrpc.CalculateFeeLimit(limit, sendAmt)
	sendAmt += fee

	err = service.CheckBalance(ctx, acct.ID, sendAmt)
	if err != nil {
		return fmt.Errorf("error validating account balance: %w", err)
	}

	err = service.AssociatePayment(ctx, acct.ID, pHash, sendAmt)
	if err != nil {
		return fmt.Errorf("error associating payment: %w", err)
	}

	return service.RegisterValues(reqID, &RequestValues{
		PaymentHash:   pHash,
		PaymentAmount: sendAmt,
	})
}

// checkSendResponse makes sure that a payment that is in flight is tracked
// by the payment service in order for it to eventually be debited from the
// account.
func checkSendResponse(ctx context.Context, service Service,
	status lnrpc.Payment_PaymentStatus, hash lntypes.Hash,
	fullAmt int64) (proto.Message, error) {

	log, acct, reqID, err := requestScopedValuesFromCtx(ctx)
	if err != nil {
		return nil, err
	}

	reqVals, ok := service.GetValues(reqID)
	if !ok {
		return nil, nil
	}

	if hash != reqVals.PaymentHash {
		return nil, fmt.Errorf("response hash did not match request " +
			"hash")
	}

	log.Tracef("Handling response payment with hash: %s", hash)

	// If we directly observe a failure, make sure
	// we stop tracking the payment and then exit
	// early.
	if status == lnrpc.Payment_FAILED {
		service.DeleteValues(reqID)

		return nil, service.RemovePayment(ctx, hash)
	}

	// If there is no immediate failure, make sure we track the payment.
	err = service.TrackPayment(
		ctx, acct.ID, hash, lnwire.MilliSatoshi(fullAmt),
	)
	if err != nil {
		return nil, err
	}

	// We can now delete the request values for this request ID.
	service.DeleteValues(reqID)

	return nil, nil
}

// checkSendToRoute checks if a payment can be sent to the route by making sure
// the account in the context has enough balance to pay for it.
func checkSendToRoute(ctx context.Context, service Service, paymentHash []byte,
	route *lnrpc.Route) error {

	log, acct, reqID, err := requestScopedValuesFromCtx(ctx)
	if err != nil {
		return err
	}

	hash, err := lntypes.MakeHash(paymentHash)
	if err != nil {
		return err
	}

	if route == nil {
		return fmt.Errorf("invalid route")
	}

	sendAmt := max(
		// nolint
		lnwire.MilliSatoshi(route.TotalAmtMsat), lnwire.NewMSatFromSatoshis(btcutil.Amount(route.TotalAmt)))

	log.Tracef("Handling send request for payment with hash: %s and "+
		"amount: %d", hash, sendAmt)

	// We also add the max fee to the amount to check. This might mean that
	// not every single satoshi of an account can be used up. But it
	// prevents an account from going into a negative balance if we only
	// check for the amount to send but then later debit the full amount.
	fee := max(
		// nolint
		lnwire.MilliSatoshi(route.TotalFeesMsat), lnwire.NewMSatFromSatoshis(btcutil.Amount(route.TotalFees)))
	sendAmt += fee

	err = service.CheckBalance(ctx, acct.ID, sendAmt)
	if err != nil {
		return fmt.Errorf("error validating account balance: %w", err)
	}

	err = service.AssociatePayment(ctx, acct.ID, hash, sendAmt)
	if err != nil {
		return fmt.Errorf("error associating payment with hash %s: %w",
			hash, err)
	}

	return service.RegisterValues(reqID, &RequestValues{
		PaymentHash:   hash,
		PaymentAmount: sendAmt,
	})
}

// erroredPaymentHandler does some trace logging about the errored payment and
// clears up any state we may have had for the payment.
func erroredPaymentHandler(service Service) mid.ErrorHandler {
	return func(ctx context.Context, respErr error) (error, error) {
		log, acct, reqID, err := requestScopedValuesFromCtx(ctx)
		if err != nil {
			return nil, err
		}

		reqVals, ok := service.GetValues(reqID)
		if !ok {
			return nil, fmt.Errorf("no request values found for "+
				"request: %d", reqID)
		}

		log.Tracef("Handling payment request error for payment with "+
			"hash: %s and amount: %d", reqVals.PaymentHash,
			reqVals.PaymentAmount)

		err = service.PaymentErrored(ctx, acct.ID, reqVals.PaymentHash)
		if err != nil {
			return nil, err
		}

		service.DeleteValues(reqID)

		return nil, nil
	}
}

// sendToRouteHTLCResponseHandler creates a response handler for the
// SendToRouteV2 endpoint which is a streaming endpoint that may return multiple
// HTLCAttempt updates.
func sendToRouteHTLCResponseHandler(service Service) func(ctx context.Context,
	r *lnrpc.HTLCAttempt) (proto.Message, error) {

	return func(ctx context.Context, r *lnrpc.HTLCAttempt) (proto.Message,
		error) {

		log, acct, reqID, err := requestScopedValuesFromCtx(ctx)
		if err != nil {
			return nil, err
		}

		// Since SendToRouteV2 is a streaming endpoint, we may get
		// multiple responses for it. If we have already handled it then
		// we would have deleted the request ID to hash mapping, and so
		// we can exit early here.
		reqValues, ok := service.GetValues(reqID)
		if !ok {
			return nil, nil
		}

		log.Tracef("Handling response for payment with hash: %s and "+
			"amount: %d", reqValues.PaymentHash,
			reqValues.PaymentAmount)

		// If the pre-image is provided, do a sanity check to make sure
		// that this does actually match the hash we stored for this
		// payment.
		if len(r.Preimage) != 0 {
			preimage, err := lntypes.MakePreimage(r.Preimage)
			if err != nil {
				return nil, err
			}

			if !preimage.Matches(reqValues.PaymentHash) {
				return nil, fmt.Errorf("the preimage (%s) "+
					"returned by the response does not "+
					"match the payment hash (%s) of the "+
					"payment", preimage,
					reqValues.PaymentHash)
			}
		}

		route := r.Route
		totalAmount := int64(0)
		if route != nil {
			totalAmount = route.TotalAmtMsat + route.TotalFeesMsat
		}

		err = service.TrackPayment(
			ctx, acct.ID, reqValues.PaymentHash,
			lnwire.MilliSatoshi(totalAmount),
		)
		if err != nil {
			return nil, err
		}

		// We can now delete the request values for this ID.
		service.DeleteValues(reqID)

		return nil, nil
	}
}
