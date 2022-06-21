package accounts

import (
	"fmt"

	"github.com/btcsuite/btcutil"
	"github.com/lightninglabs/lightning-terminal/rpcmiddleware"
	"github.com/lightninglabs/lndclient"
	"github.com/lightningnetwork/lnd/channeldb"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/lnrpc/routerrpc"
	"github.com/lightningnetwork/lnd/lntypes"
	"github.com/lightningnetwork/lnd/lnwire"
	"github.com/lightningnetwork/lnd/zpay32"
	"google.golang.org/protobuf/proto"
)

var (
	DecodePayReqPassThrough = rpcmiddleware.NewPassThrough(
		&lnrpc.PayReqString{}, &lnrpc.PayReq{},
	)

	GetNodeInfoPassThrough = rpcmiddleware.NewPassThrough(
		&lnrpc.NodeInfoRequest{}, &lnrpc.NodeInfo{},
	)

	PendingChannelsEmptyRewriter = rpcmiddleware.NewResponseRewriter(
		&lnrpc.PendingChannelsRequest{},
		&lnrpc.PendingChannelsResponse{},
		func(r *lnrpc.PendingChannelsResponse) (proto.Message, error) {
			r.PendingOpenChannels = []*lnrpc.PendingChannelsResponse_PendingOpenChannel{}
			r.PendingForceClosingChannels = []*lnrpc.PendingChannelsResponse_ForceClosedChannel{}
			r.WaitingCloseChannels = []*lnrpc.PendingChannelsResponse_WaitingCloseChannel{}
			r.TotalLimboBalance = 0

			return r, nil
		},
	)

	ListChannelsEmptyRewriter = rpcmiddleware.NewResponseRewriter(
		&lnrpc.ListChannelsRequest{}, &lnrpc.ListChannelsResponse{},
		func(r *lnrpc.ListChannelsResponse) (proto.Message, error) {
			r.Channels = []*lnrpc.Channel{}

			return r, nil
		},
	)

	ClosedChannelsEmptyRewriter = rpcmiddleware.NewResponseRewriter(
		&lnrpc.ClosedChannelsRequest{}, &lnrpc.ClosedChannelsResponse{},
		func(r *lnrpc.ClosedChannelsResponse) (proto.Message, error) {
			r.Channels = []*lnrpc.ChannelCloseSummary{}

			return r, nil
		},
	)

	WalletBalanceEmptyRewriter = rpcmiddleware.NewResponseRewriter(
		&lnrpc.WalletBalanceRequest{},
		&lnrpc.WalletBalanceResponse{},
		func(t *lnrpc.WalletBalanceResponse) (proto.Message, error) {
			t.ConfirmedBalance = 0
			t.TotalBalance = 0
			t.UnconfirmedBalance = 0
			for acctName := range t.AccountBalance {
				t.AccountBalance[acctName].ConfirmedBalance = 0
				t.AccountBalance[acctName].UnconfirmedBalance = 0
			}

			return t, nil
		},
	)

	GetTransactionsEmptyRewriter = rpcmiddleware.NewResponseRewriter(
		&lnrpc.GetTransactionsRequest{},
		&lnrpc.TransactionDetails{},
		func(r *lnrpc.TransactionDetails) (proto.Message, error) {
			r.Transactions = make([]*lnrpc.Transaction, 0)

			return r, nil
		},
	)

	ListPeersEmptyRewriter = rpcmiddleware.NewResponseRewriter(
		&lnrpc.ListPeersRequest{}, &lnrpc.ListPeersResponse{},
		func(r *lnrpc.ListPeersResponse) (proto.Message, error) {
			r.Peers = []*lnrpc.Peer{}

			return r, nil
		},
	)
)

func (s *Service) generateCheckers(
	acct *OffChainBalanceAccount) map[string]rpcmiddleware.RoundTripChecker {

	return map[string]rpcmiddleware.RoundTripChecker{
		// Invoices:
		"/lnrpc.Lightning/AddInvoice": rpcmiddleware.NewResponseRewriter(
			&lnrpc.Invoice{},
			&lnrpc.AddInvoiceResponse{},
			func(t *lnrpc.AddInvoiceResponse) (proto.Message,
				error) {

				hash, err := lntypes.MakeHash(t.RHash)
				if err != nil {
					return nil, fmt.Errorf("error parsing "+
						"invoice hash: %v", err)
				}

				return nil, s.Store.associateInvoice(
					acct.ID, hash,
				)
			},
		),
		"/lnrpc.Lightning/ListInvoices": rpcmiddleware.NewResponseRewriter(
			&lnrpc.ListInvoiceRequest{},
			&lnrpc.ListInvoiceResponse{},
			func(t *lnrpc.ListInvoiceResponse) (proto.Message,
				error) {

				filteredInvoices := make(
					[]*lnrpc.Invoice, 0, len(t.Invoices),
				)
				for _, invoice := range t.Invoices {
					hash, err := lntypes.MakeHash(
						invoice.RHash,
					)
					if err != nil {
						return nil, err
					}

					if _, ok := acct.Invoices[hash]; ok {
						filteredInvoices = append(
							filteredInvoices,
							invoice,
						)
					}
				}

				t.Invoices = filteredInvoices
				return t, nil
			},
		),
		"/lnrpc.Lightning/LookupInvoice": rpcmiddleware.NewRequestChecker(
			&lnrpc.PaymentHash{},
			&lnrpc.Invoice{},
			func(t *lnrpc.PaymentHash) error {
				hash, err := lntypes.MakeHash(t.RHash)
				if err != nil {
					return err
				}
				_, ok := acct.Invoices[hash]
				if !ok {
					return fmt.Errorf("invoice does not " +
						"belong to this account")
				}

				return nil
			},
		),

		// Payments:
		"/lnrpc.Lightning/SendPayment": rpcmiddleware.NewRequestChecker(
			&lnrpc.SendRequest{},
			&lnrpc.SendResponse{},
			func(r *lnrpc.SendRequest) error {
				return s.checkSend(
					r.Amt, r.AmtMsat, r.PaymentRequest,
					acct,
				)
			},
		),
		"/lnrpc.Lightning/SendPaymentSync": rpcmiddleware.NewRequestChecker(
			&lnrpc.SendRequest{},
			&lnrpc.SendResponse{},
			func(r *lnrpc.SendRequest) error {
				return s.checkSend(
					r.Amt, r.AmtMsat, r.PaymentRequest,
					acct,
				)
			},
		),
		// routerrpc.Router/SendPayment is deprecated.
		"/routerrpc.Router/SendPaymentV2": rpcmiddleware.NewFullChecker(
			&routerrpc.SendPaymentRequest{},
			&lnrpc.Payment{},
			func(r *routerrpc.SendPaymentRequest) error {
				return s.checkSend(
					r.Amt, r.AmtMsat, r.PaymentRequest,
					acct,
				)
			},
			func(r *lnrpc.Payment) (proto.Message, error) {
				if r.Status != lnrpc.Payment_SUCCEEDED ||
					r.FailureReason != lnrpc.PaymentFailureReason_FAILURE_REASON_NONE {

					return nil, nil
				}

				hash, err := lntypes.MakeHashFromStr(r.PaymentHash)
				if err != nil {
					return nil, fmt.Errorf("error parsing "+
						"payment hash: %v", err)
				}

				return nil, s.Store.chargeAccount(
					acct.ID, hash,
					lnwire.MilliSatoshi(r.ValueMsat),
				)
			},
		),
		"/lnrpc.Lightning/SendToRoute": rpcmiddleware.NewRequestChecker(
			&lnrpc.SendToRouteRequest{},
			&lnrpc.SendResponse{},
			func(r *lnrpc.SendToRouteRequest) error {
				return s.checkSendToRoute(r.Route, acct)
			},
		),
		"/lnrpc.Lightning/SendToRouteSync": rpcmiddleware.NewRequestChecker(
			&lnrpc.SendToRouteRequest{},
			&lnrpc.SendResponse{},
			func(r *lnrpc.SendToRouteRequest) error {
				return s.checkSendToRoute(r.Route, acct)
			},
		),
		// routerrpc.Router/SendToroute is deprecated.
		"/routerrpc.Router/SendToRouteV2": rpcmiddleware.NewFullChecker(
			&routerrpc.SendToRouteRequest{},
			&lnrpc.HTLCAttempt{},
			func(r *routerrpc.SendToRouteRequest) error {
				return s.checkSendToRoute(r.Route, acct)
			},
			func(r *lnrpc.HTLCAttempt) (proto.Message, error) {
				if r.Status != lnrpc.HTLCAttempt_SUCCEEDED ||
					r.Failure != nil {

					return nil, nil
				}

				return nil, s.chargeHTLC(
					acct, r.Route, r.Preimage,
				)
			},
		),
		"/lnrpc.Lightning/DecodePayReq": DecodePayReqPassThrough,
		"/lnrpc.Lightning/ListPayments": rpcmiddleware.NewResponseRewriter(
			&lnrpc.ListPaymentsRequest{},
			&lnrpc.ListPaymentsResponse{},
			func(t *lnrpc.ListPaymentsResponse) (proto.Message,
				error) {

				filteredPayments := make(
					[]*lnrpc.Payment, 0, len(t.Payments),
				)
				for _, payment := range t.Payments {
					hash, err := lntypes.MakeHashFromStr(
						payment.PaymentHash,
					)
					if err != nil {
						return nil, err
					}

					if _, ok := acct.Payments[hash]; ok {
						filteredPayments = append(
							filteredPayments,
							payment,
						)
					}
				}

				t.Payments = filteredPayments
				return t, nil
			},
		),

		// Channels:
		"/lnrpc.Lightning/PendingChannels": PendingChannelsEmptyRewriter,
		"/lnrpc.Lightning/ListChannels":    ListChannelsEmptyRewriter,
		"/lnrpc.Lightning/ClosedChannels":  ClosedChannelsEmptyRewriter,

		// Balances:
		"/lnrpc.Lightning/ChannelBalance": rpcmiddleware.NewResponseRewriter(
			&lnrpc.ChannelBalanceRequest{},
			&lnrpc.ChannelBalanceResponse{},
			func(t *lnrpc.ChannelBalanceResponse) (proto.Message,
				error) {

				balanceSat := acct.CurrentBalance.ToSatoshis()
				t.Balance = int64(balanceSat)
				t.LocalBalance.Msat = uint64(acct.CurrentBalance)
				t.LocalBalance.Sat = uint64(balanceSat)
				t.PendingOpenLocalBalance.Sat = 0
				t.PendingOpenLocalBalance.Msat = 0
				t.RemoteBalance.Sat = 0
				t.RemoteBalance.Msat = 0
				t.PendingOpenRemoteBalance.Sat = 0
				t.PendingOpenRemoteBalance.Msat = 0
				t.UnsettledLocalBalance.Sat = 0
				t.UnsettledLocalBalance.Msat = 0
				t.UnsettledRemoteBalance.Sat = 0
				t.UnsettledRemoteBalance.Msat = 0

				return t, nil
			},
		),
		"/lnrpc.Lightning/WalletBalance": WalletBalanceEmptyRewriter,

		// Transactions:
		"/lnrpc.Lightning/GetTransactions": GetTransactionsEmptyRewriter,

		// Peers:
		"/lnrpc.Lightning/ListPeers": ListPeersEmptyRewriter,

		// Info:
		"/lnrpc.Lightning/GetInfo": rpcmiddleware.NewResponseRewriter(
			&lnrpc.GetInfoRequest{},
			&lnrpc.GetInfoResponse{},
			func(t *lnrpc.GetInfoResponse) (proto.Message,
				error) {

				t.NumActiveChannels = 0
				t.NumInactiveChannels = 0
				t.NumPendingChannels = 0
				t.NumPeers = 0

				return t, nil
			},
		),
		"/lnrpc.Lightning/GetNodeInfo": GetNodeInfoPassThrough,
	}
}

func (s *Service) invoiceUpdate(invoice *lndclient.Invoice) error {
	if invoice == nil || invoice.State != channeldb.ContractSettled {
		return nil
	}

	return s.CreditAccount(invoice.Hash, invoice.AmountPaid)
}

func (s *Service) checkSend(amt, amtMsat int64, invoice string,
	acct *OffChainBalanceAccount) error {

	// TODO(guggero): Take in-flight payments into account!

	sendAmt := lnwire.NewMSatFromSatoshis(btcutil.Amount(amt))
	if lnwire.MilliSatoshi(amtMsat) > sendAmt {
		sendAmt = lnwire.MilliSatoshi(amtMsat)
	}

	payReq, err := zpay32.Decode(invoice, s.lnd.ChainParams)
	if err != nil {
		return fmt.Errorf("error decoding pay req: %v", err)
	}

	if payReq.MilliSat != nil && *payReq.MilliSat > sendAmt {
		sendAmt = *payReq.MilliSat
	}

	err = s.Store.checkBalance(acct.ID, sendAmt)
	if err != nil {
		return fmt.Errorf("error validating account balance: %v", err)
	}

	return nil
}

func (s *Service) checkSendToRoute(route *lnrpc.Route,
	acct *OffChainBalanceAccount) error {

	// TODO(guggero): Take in-flight payments into account!

	if route == nil {
		return fmt.Errorf("invalid route")
	}

	sendAmt := lnwire.NewMSatFromSatoshis(btcutil.Amount(route.TotalAmt))
	if lnwire.MilliSatoshi(route.TotalAmtMsat) > sendAmt {
		sendAmt = lnwire.MilliSatoshi(route.TotalAmtMsat)
	}

	err := s.Store.checkBalance(acct.ID, sendAmt)
	if err != nil {
		return fmt.Errorf("error validating account balance: %v", err)
	}

	return nil
}

func (s *Service) chargeHTLC(acct *OffChainBalanceAccount, route *lnrpc.Route,
	preimageBytes []byte) error {

	if route == nil {
		return fmt.Errorf("invalid route")
	}

	preimage, err := lntypes.MakePreimage(preimageBytes)
	if err != nil {
		return fmt.Errorf("error parsing preimage: %v", err)
	}

	hash := preimage.Hash()
	return s.Store.chargeAccount(
		acct.ID, hash, lnwire.MilliSatoshi(route.TotalAmtMsat),
	)
}
