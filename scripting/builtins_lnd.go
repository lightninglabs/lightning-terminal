package scripting

import (
	"context"
	"encoding/hex"
	"fmt"

	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/lnrpc/invoicesrpc"
	"github.com/lightningnetwork/lnd/lnrpc/routerrpc"
	"go.starlark.net/starlark"
	"google.golang.org/grpc"
	"google.golang.org/grpc/metadata"
)

// LNDClients holds all the LND RPC clients needed for script execution.
type LNDClients struct {
	Lightning lnrpc.LightningClient
	Router    routerrpc.RouterClient
	Invoices  invoicesrpc.InvoicesClient
}

// lndBuiltins provides LND RPC access to Starlark scripts.
type lndBuiltins struct {
	engine   *Engine
	clients  *LNDClients
	macaroon string
}

// registerLNDBuiltins adds the 'lnd' module with LND RPC bindings.
func (e *Engine) registerLNDBuiltins(predeclared starlark.StringDict, clients *LNDClients) {
	if clients == nil {
		return
	}

	lb := &lndBuiltins{
		engine:   e,
		clients:  clients,
		macaroon: e.macaroon,
	}

	lndModule := NewStarlarkModule("lnd")

	// Info and status
	lndModule.AddFunc("get_info", starlark.NewBuiltin("get_info", lb.getInfo))
	lndModule.AddFunc("get_node_info", starlark.NewBuiltin("get_node_info", lb.getNodeInfo))

	// Channel operations
	lndModule.AddFunc("list_channels", starlark.NewBuiltin("list_channels", lb.listChannels))
	lndModule.AddFunc("channel_balance", starlark.NewBuiltin("channel_balance", lb.channelBalance))
	lndModule.AddFunc("pending_channels", starlark.NewBuiltin("pending_channels", lb.pendingChannels))
	lndModule.AddFunc("closed_channels", starlark.NewBuiltin("closed_channels", lb.closedChannels))
	lndModule.AddFunc("update_channel_policy", starlark.NewBuiltin("update_channel_policy", lb.updateChannelPolicy))

	// Wallet operations
	lndModule.AddFunc("wallet_balance", starlark.NewBuiltin("wallet_balance", lb.walletBalance))
	lndModule.AddFunc("list_unspent", starlark.NewBuiltin("list_unspent", lb.listUnspent))
	lndModule.AddFunc("new_address", starlark.NewBuiltin("new_address", lb.newAddress))
	lndModule.AddFunc("send_coins", starlark.NewBuiltin("send_coins", lb.sendCoins))

	// Invoice operations
	lndModule.AddFunc("add_invoice", starlark.NewBuiltin("add_invoice", lb.addInvoice))
	lndModule.AddFunc("lookup_invoice", starlark.NewBuiltin("lookup_invoice", lb.lookupInvoice))
	lndModule.AddFunc("list_invoices", starlark.NewBuiltin("list_invoices", lb.listInvoices))
	lndModule.AddFunc("decode_pay_req", starlark.NewBuiltin("decode_pay_req", lb.decodePayReq))

	// Payment operations
	lndModule.AddFunc("send_payment", starlark.NewBuiltin("send_payment", lb.sendPayment))
	lndModule.AddFunc("list_payments", starlark.NewBuiltin("list_payments", lb.listPayments))

	// Peer operations
	lndModule.AddFunc("list_peers", starlark.NewBuiltin("list_peers", lb.listPeers))
	lndModule.AddFunc("connect_peer", starlark.NewBuiltin("connect_peer", lb.connectPeer))
	lndModule.AddFunc("disconnect_peer", starlark.NewBuiltin("disconnect_peer", lb.disconnectPeer))

	// Forwarding
	lndModule.AddFunc("forwarding_history", starlark.NewBuiltin("forwarding_history", lb.forwardingHistory))

	// Fee estimation
	lndModule.AddFunc("estimate_fee", starlark.NewBuiltin("estimate_fee", lb.estimateFee))

	predeclared["lnd"] = lndModule.Struct()
}

// contextWithMacaroon creates a context with the script's macaroon.
func (lb *lndBuiltins) contextWithMacaroon() context.Context {
	ctx := lb.engine.sandbox.Context()
	if lb.macaroon != "" {
		md := metadata.Pairs("macaroon", lb.macaroon)
		ctx = metadata.NewOutgoingContext(ctx, md)
	}
	return ctx
}

// getInfo implements lnd.get_info().
func (lb *lndBuiltins) getInfo(thread *starlark.Thread, fn *starlark.Builtin,
	args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {

	if err := starlark.UnpackArgs("get_info", args, kwargs); err != nil {
		return nil, err
	}

	ctx := lb.contextWithMacaroon()
	resp, err := lb.clients.Lightning.GetInfo(ctx, &lnrpc.GetInfoRequest{})
	if err != nil {
		return nil, fmt.Errorf("get_info failed: %w", err)
	}

	return lb.protoToDict(map[string]any{
		"identity_pubkey":      resp.IdentityPubkey,
		"alias":                resp.Alias,
		"num_active_channels":  resp.NumActiveChannels,
		"num_inactive_channels": resp.NumInactiveChannels,
		"num_pending_channels": resp.NumPendingChannels,
		"num_peers":            resp.NumPeers,
		"block_height":         resp.BlockHeight,
		"synced_to_chain":      resp.SyncedToChain,
		"synced_to_graph":      resp.SyncedToGraph,
		"version":              resp.Version,
	})
}

// getNodeInfo implements lnd.get_node_info(pubkey).
func (lb *lndBuiltins) getNodeInfo(thread *starlark.Thread, fn *starlark.Builtin,
	args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {

	var pubkey string
	var includeChannels bool
	if err := starlark.UnpackArgs("get_node_info", args, kwargs,
		"pubkey", &pubkey, "include_channels?", &includeChannels); err != nil {
		return nil, err
	}

	ctx := lb.contextWithMacaroon()
	resp, err := lb.clients.Lightning.GetNodeInfo(ctx, &lnrpc.NodeInfoRequest{
		PubKey:          pubkey,
		IncludeChannels: includeChannels,
	})
	if err != nil {
		return nil, fmt.Errorf("get_node_info failed: %w", err)
	}

	result := map[string]any{
		"total_capacity": resp.TotalCapacity,
		"num_channels":   resp.NumChannels,
	}

	if resp.Node != nil {
		result["node"] = map[string]any{
			"pubkey":      resp.Node.PubKey,
			"alias":       resp.Node.Alias,
			"color":       resp.Node.Color,
			"last_update": resp.Node.LastUpdate,
		}
	}

	return lb.protoToDict(result)
}

// listChannels implements lnd.list_channels().
func (lb *lndBuiltins) listChannels(thread *starlark.Thread, fn *starlark.Builtin,
	args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {

	var activeOnly, inactiveOnly, publicOnly, privateOnly bool
	if err := starlark.UnpackArgs("list_channels", args, kwargs,
		"active_only?", &activeOnly,
		"inactive_only?", &inactiveOnly,
		"public_only?", &publicOnly,
		"private_only?", &privateOnly); err != nil {
		return nil, err
	}

	ctx := lb.contextWithMacaroon()
	resp, err := lb.clients.Lightning.ListChannels(ctx, &lnrpc.ListChannelsRequest{
		ActiveOnly:   activeOnly,
		InactiveOnly: inactiveOnly,
		PublicOnly:   publicOnly,
		PrivateOnly:  privateOnly,
	})
	if err != nil {
		return nil, fmt.Errorf("list_channels failed: %w", err)
	}

	channels := make([]any, len(resp.Channels))
	for i, ch := range resp.Channels {
		channels[i] = map[string]any{
			"chan_id":           ch.ChanId,
			"channel_point":     ch.ChannelPoint,
			"remote_pubkey":     ch.RemotePubkey,
			"capacity":          ch.Capacity,
			"local_balance":     ch.LocalBalance,
			"remote_balance":    ch.RemoteBalance,
			"commit_fee":        ch.CommitFee,
			"total_satoshis_sent":     ch.TotalSatoshisSent,
			"total_satoshis_received": ch.TotalSatoshisReceived,
			"num_updates":       ch.NumUpdates,
			"active":            ch.Active,
			"private":           ch.Private,
			"initiator":         ch.Initiator,
		}
	}

	return lb.protoToDict(map[string]any{"channels": channels})
}

// channelBalance implements lnd.channel_balance().
func (lb *lndBuiltins) channelBalance(thread *starlark.Thread, fn *starlark.Builtin,
	args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {

	if err := starlark.UnpackArgs("channel_balance", args, kwargs); err != nil {
		return nil, err
	}

	ctx := lb.contextWithMacaroon()
	resp, err := lb.clients.Lightning.ChannelBalance(ctx, &lnrpc.ChannelBalanceRequest{})
	if err != nil {
		return nil, fmt.Errorf("channel_balance failed: %w", err)
	}

	return lb.protoToDict(map[string]any{
		"balance":               resp.Balance,
		"pending_open_balance":  resp.PendingOpenBalance,
		"local_balance":         resp.LocalBalance.GetSat(),
		"remote_balance":        resp.RemoteBalance.GetSat(),
		"unsettled_local_balance":  resp.UnsettledLocalBalance.GetSat(),
		"unsettled_remote_balance": resp.UnsettledRemoteBalance.GetSat(),
	})
}

// pendingChannels implements lnd.pending_channels().
func (lb *lndBuiltins) pendingChannels(thread *starlark.Thread, fn *starlark.Builtin,
	args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {

	if err := starlark.UnpackArgs("pending_channels", args, kwargs); err != nil {
		return nil, err
	}

	ctx := lb.contextWithMacaroon()
	resp, err := lb.clients.Lightning.PendingChannels(ctx, &lnrpc.PendingChannelsRequest{})
	if err != nil {
		return nil, fmt.Errorf("pending_channels failed: %w", err)
	}

	return lb.protoToDict(map[string]any{
		"total_limbo_balance": resp.TotalLimboBalance,
		"pending_open_channels": len(resp.PendingOpenChannels),
		"pending_closing_channels": len(resp.PendingClosingChannels),
		"pending_force_closing_channels": len(resp.PendingForceClosingChannels),
		"waiting_close_channels": len(resp.WaitingCloseChannels),
	})
}

// closedChannels implements lnd.closed_channels().
func (lb *lndBuiltins) closedChannels(thread *starlark.Thread, fn *starlark.Builtin,
	args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {

	if err := starlark.UnpackArgs("closed_channels", args, kwargs); err != nil {
		return nil, err
	}

	ctx := lb.contextWithMacaroon()
	resp, err := lb.clients.Lightning.ClosedChannels(ctx, &lnrpc.ClosedChannelsRequest{})
	if err != nil {
		return nil, fmt.Errorf("closed_channels failed: %w", err)
	}

	channels := make([]any, len(resp.Channels))
	for i, ch := range resp.Channels {
		channels[i] = map[string]any{
			"chan_id":        ch.ChanId,
			"channel_point":  ch.ChannelPoint,
			"remote_pubkey":  ch.RemotePubkey,
			"capacity":       ch.Capacity,
			"close_height":   ch.CloseHeight,
			"settled_balance": ch.SettledBalance,
			"close_type":     ch.CloseType.String(),
		}
	}

	return lb.protoToDict(map[string]any{"channels": channels})
}

// updateChannelPolicy implements lnd.update_channel_policy().
func (lb *lndBuiltins) updateChannelPolicy(thread *starlark.Thread, fn *starlark.Builtin,
	args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {

	var chanPoint string
	var baseFeeMsat, feeRatePpm int64
	var timeLockDelta int64

	if err := starlark.UnpackArgs("update_channel_policy", args, kwargs,
		"chan_point?", &chanPoint,
		"base_fee_msat?", &baseFeeMsat,
		"fee_rate_ppm?", &feeRatePpm,
		"time_lock_delta?", &timeLockDelta); err != nil {
		return nil, err
	}

	req := &lnrpc.PolicyUpdateRequest{
		BaseFeeMsat:   baseFeeMsat,
		FeeRatePpm:    uint32(feeRatePpm),
		TimeLockDelta: uint32(timeLockDelta),
	}

	if chanPoint != "" {
		req.Scope = &lnrpc.PolicyUpdateRequest_ChanPoint{
			ChanPoint: &lnrpc.ChannelPoint{
				FundingTxid: &lnrpc.ChannelPoint_FundingTxidStr{
					FundingTxidStr: chanPoint,
				},
			},
		}
	} else {
		req.Scope = &lnrpc.PolicyUpdateRequest_Global{Global: true}
	}

	ctx := lb.contextWithMacaroon()
	resp, err := lb.clients.Lightning.UpdateChannelPolicy(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("update_channel_policy failed: %w", err)
	}

	failedUpdates := make([]any, len(resp.FailedUpdates))
	for i, f := range resp.FailedUpdates {
		failedUpdates[i] = map[string]any{
			"reason":      f.UpdateError,
		}
	}

	return lb.protoToDict(map[string]any{"failed_updates": failedUpdates})
}

// walletBalance implements lnd.wallet_balance().
func (lb *lndBuiltins) walletBalance(thread *starlark.Thread, fn *starlark.Builtin,
	args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {

	if err := starlark.UnpackArgs("wallet_balance", args, kwargs); err != nil {
		return nil, err
	}

	ctx := lb.contextWithMacaroon()
	resp, err := lb.clients.Lightning.WalletBalance(ctx, &lnrpc.WalletBalanceRequest{})
	if err != nil {
		return nil, fmt.Errorf("wallet_balance failed: %w", err)
	}

	return lb.protoToDict(map[string]any{
		"total_balance":       resp.TotalBalance,
		"confirmed_balance":   resp.ConfirmedBalance,
		"unconfirmed_balance": resp.UnconfirmedBalance,
		"locked_balance":      resp.LockedBalance,
	})
}

// listUnspent implements lnd.list_unspent().
func (lb *lndBuiltins) listUnspent(thread *starlark.Thread, fn *starlark.Builtin,
	args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {

	var minConfs, maxConfs int64
	if err := starlark.UnpackArgs("list_unspent", args, kwargs,
		"min_confs?", &minConfs, "max_confs?", &maxConfs); err != nil {
		return nil, err
	}

	if maxConfs == 0 {
		maxConfs = int32Max
	}

	ctx := lb.contextWithMacaroon()
	resp, err := lb.clients.Lightning.ListUnspent(ctx, &lnrpc.ListUnspentRequest{
		MinConfs: int32(minConfs),
		MaxConfs: int32(maxConfs),
	})
	if err != nil {
		return nil, fmt.Errorf("list_unspent failed: %w", err)
	}

	utxos := make([]any, len(resp.Utxos))
	for i, u := range resp.Utxos {
		utxos[i] = map[string]any{
			"address":       u.Address,
			"amount_sat":    u.AmountSat,
			"confirmations": u.Confirmations,
			"outpoint":      u.Outpoint.String(),
		}
	}

	return lb.protoToDict(map[string]any{"utxos": utxos})
}

// newAddress implements lnd.new_address().
func (lb *lndBuiltins) newAddress(thread *starlark.Thread, fn *starlark.Builtin,
	args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {

	var addrType string
	if err := starlark.UnpackArgs("new_address", args, kwargs,
		"type?", &addrType); err != nil {
		return nil, err
	}

	var at lnrpc.AddressType
	switch addrType {
	case "p2wkh", "":
		at = lnrpc.AddressType_WITNESS_PUBKEY_HASH
	case "np2wkh":
		at = lnrpc.AddressType_NESTED_PUBKEY_HASH
	case "p2tr":
		at = lnrpc.AddressType_TAPROOT_PUBKEY
	default:
		return nil, fmt.Errorf("unknown address type: %s", addrType)
	}

	ctx := lb.contextWithMacaroon()
	resp, err := lb.clients.Lightning.NewAddress(ctx, &lnrpc.NewAddressRequest{
		Type: at,
	})
	if err != nil {
		return nil, fmt.Errorf("new_address failed: %w", err)
	}

	return starlark.String(resp.Address), nil
}

// sendCoins implements lnd.send_coins().
func (lb *lndBuiltins) sendCoins(thread *starlark.Thread, fn *starlark.Builtin,
	args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {

	var addr string
	var amount int64
	var satPerVbyte int64
	var sendAll bool

	if err := starlark.UnpackArgs("send_coins", args, kwargs,
		"addr", &addr, "amount", &amount,
		"sat_per_vbyte?", &satPerVbyte,
		"send_all?", &sendAll); err != nil {
		return nil, err
	}

	ctx := lb.contextWithMacaroon()
	resp, err := lb.clients.Lightning.SendCoins(ctx, &lnrpc.SendCoinsRequest{
		Addr:        addr,
		Amount:      amount,
		SatPerVbyte: uint64(satPerVbyte),
		SendAll:     sendAll,
	})
	if err != nil {
		return nil, fmt.Errorf("send_coins failed: %w", err)
	}

	return starlark.String(resp.Txid), nil
}

// addInvoice implements lnd.add_invoice().
func (lb *lndBuiltins) addInvoice(thread *starlark.Thread, fn *starlark.Builtin,
	args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {

	var memo string
	var valueSat, expiry int64

	if err := starlark.UnpackArgs("add_invoice", args, kwargs,
		"value?", &valueSat, "memo?", &memo, "expiry?", &expiry); err != nil {
		return nil, err
	}

	if expiry == 0 {
		expiry = 3600 // 1 hour default
	}

	ctx := lb.contextWithMacaroon()
	resp, err := lb.clients.Lightning.AddInvoice(ctx, &lnrpc.Invoice{
		Memo:   memo,
		Value:  valueSat,
		Expiry: expiry,
	})
	if err != nil {
		return nil, fmt.Errorf("add_invoice failed: %w", err)
	}

	return lb.protoToDict(map[string]any{
		"r_hash":          hex.EncodeToString(resp.RHash),
		"payment_request": resp.PaymentRequest,
		"add_index":       resp.AddIndex,
	})
}

// lookupInvoice implements lnd.lookup_invoice().
func (lb *lndBuiltins) lookupInvoice(thread *starlark.Thread, fn *starlark.Builtin,
	args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {

	var rHashHex string
	if err := starlark.UnpackArgs("lookup_invoice", args, kwargs,
		"r_hash", &rHashHex); err != nil {
		return nil, err
	}

	rHash, err := hex.DecodeString(rHashHex)
	if err != nil {
		return nil, fmt.Errorf("invalid r_hash: %w", err)
	}

	ctx := lb.contextWithMacaroon()
	resp, err := lb.clients.Lightning.LookupInvoice(ctx, &lnrpc.PaymentHash{
		RHash: rHash,
	})
	if err != nil {
		return nil, fmt.Errorf("lookup_invoice failed: %w", err)
	}

	return lb.invoiceToDict(resp)
}

// listInvoices implements lnd.list_invoices().
func (lb *lndBuiltins) listInvoices(thread *starlark.Thread, fn *starlark.Builtin,
	args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {

	var pendingOnly bool
	var indexOffset, numMaxInvoices int64

	if err := starlark.UnpackArgs("list_invoices", args, kwargs,
		"pending_only?", &pendingOnly,
		"index_offset?", &indexOffset,
		"num_max_invoices?", &numMaxInvoices); err != nil {
		return nil, err
	}

	if numMaxInvoices == 0 {
		numMaxInvoices = 100
	}

	ctx := lb.contextWithMacaroon()
	resp, err := lb.clients.Lightning.ListInvoices(ctx, &lnrpc.ListInvoiceRequest{
		PendingOnly:    pendingOnly,
		IndexOffset:    uint64(indexOffset),
		NumMaxInvoices: uint64(numMaxInvoices),
	})
	if err != nil {
		return nil, fmt.Errorf("list_invoices failed: %w", err)
	}

	invoices := make([]any, len(resp.Invoices))
	for i, inv := range resp.Invoices {
		invDict, _ := lb.invoiceToDict(inv)
		invoices[i], _ = fromStarlarkValue(invDict)
	}

	return lb.protoToDict(map[string]any{
		"invoices":         invoices,
		"last_index_offset": resp.LastIndexOffset,
		"first_index_offset": resp.FirstIndexOffset,
	})
}

// decodePayReq implements lnd.decode_pay_req().
func (lb *lndBuiltins) decodePayReq(thread *starlark.Thread, fn *starlark.Builtin,
	args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {

	var payReq string
	if err := starlark.UnpackArgs("decode_pay_req", args, kwargs,
		"pay_req", &payReq); err != nil {
		return nil, err
	}

	ctx := lb.contextWithMacaroon()
	resp, err := lb.clients.Lightning.DecodePayReq(ctx, &lnrpc.PayReqString{
		PayReq: payReq,
	})
	if err != nil {
		return nil, fmt.Errorf("decode_pay_req failed: %w", err)
	}

	return lb.protoToDict(map[string]any{
		"destination":      resp.Destination,
		"payment_hash":     resp.PaymentHash,
		"num_satoshis":     resp.NumSatoshis,
		"timestamp":        resp.Timestamp,
		"expiry":           resp.Expiry,
		"description":      resp.Description,
		"description_hash": resp.DescriptionHash,
		"cltv_expiry":      resp.CltvExpiry,
		"num_msat":         resp.NumMsat,
	})
}

// sendPayment implements lnd.send_payment().
func (lb *lndBuiltins) sendPayment(thread *starlark.Thread, fn *starlark.Builtin,
	args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {

	var payReq string
	var amtSat, feeLimitSat, timeoutSecs int64

	if err := starlark.UnpackArgs("send_payment", args, kwargs,
		"pay_req", &payReq,
		"amt?", &amtSat,
		"fee_limit?", &feeLimitSat,
		"timeout?", &timeoutSecs); err != nil {
		return nil, err
	}

	if timeoutSecs == 0 {
		timeoutSecs = 60
	}
	if feeLimitSat == 0 {
		feeLimitSat = 1000 // Default 1000 sat fee limit
	}

	req := &routerrpc.SendPaymentRequest{
		PaymentRequest: payReq,
		TimeoutSeconds: int32(timeoutSecs),
		FeeLimitSat:    feeLimitSat,
	}

	if amtSat > 0 {
		req.Amt = amtSat
	}

	ctx := lb.contextWithMacaroon()
	stream, err := lb.clients.Router.SendPaymentV2(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("send_payment failed: %w", err)
	}

	// Wait for final payment status
	var lastStatus *lnrpc.Payment
	for {
		payment, err := stream.Recv()
		if err != nil {
			if lastStatus != nil {
				break
			}
			return nil, fmt.Errorf("payment stream error: %w", err)
		}
		lastStatus = payment

		if payment.Status == lnrpc.Payment_SUCCEEDED ||
			payment.Status == lnrpc.Payment_FAILED {
			break
		}
	}

	if lastStatus == nil {
		return nil, fmt.Errorf("no payment status received")
	}

	return lb.protoToDict(map[string]any{
		"payment_hash":     lastStatus.PaymentHash,
		"status":           lastStatus.Status.String(),
		"fee_sat":          lastStatus.FeeSat,
		"fee_msat":         lastStatus.FeeMsat,
		"value_sat":        lastStatus.ValueSat,
		"value_msat":       lastStatus.ValueMsat,
		"payment_preimage": lastStatus.PaymentPreimage,
		"failure_reason":   lastStatus.FailureReason.String(),
	})
}

// listPayments implements lnd.list_payments().
func (lb *lndBuiltins) listPayments(thread *starlark.Thread, fn *starlark.Builtin,
	args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {

	var includeIncomplete bool
	var indexOffset, maxPayments int64

	if err := starlark.UnpackArgs("list_payments", args, kwargs,
		"include_incomplete?", &includeIncomplete,
		"index_offset?", &indexOffset,
		"max_payments?", &maxPayments); err != nil {
		return nil, err
	}

	if maxPayments == 0 {
		maxPayments = 100
	}

	ctx := lb.contextWithMacaroon()
	resp, err := lb.clients.Lightning.ListPayments(ctx, &lnrpc.ListPaymentsRequest{
		IncludeIncomplete: includeIncomplete,
		IndexOffset:       uint64(indexOffset),
		MaxPayments:       uint64(maxPayments),
	})
	if err != nil {
		return nil, fmt.Errorf("list_payments failed: %w", err)
	}

	payments := make([]any, len(resp.Payments))
	for i, p := range resp.Payments {
		payments[i] = map[string]any{
			"payment_hash":     p.PaymentHash,
			"status":           p.Status.String(),
			"fee_sat":          p.FeeSat,
			"value_sat":        p.ValueSat,
			"creation_time_ns": p.CreationTimeNs,
			"payment_preimage": p.PaymentPreimage,
		}
	}

	return lb.protoToDict(map[string]any{
		"payments":           payments,
		"first_index_offset": resp.FirstIndexOffset,
		"last_index_offset":  resp.LastIndexOffset,
	})
}

// listPeers implements lnd.list_peers().
func (lb *lndBuiltins) listPeers(thread *starlark.Thread, fn *starlark.Builtin,
	args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {

	if err := starlark.UnpackArgs("list_peers", args, kwargs); err != nil {
		return nil, err
	}

	ctx := lb.contextWithMacaroon()
	resp, err := lb.clients.Lightning.ListPeers(ctx, &lnrpc.ListPeersRequest{})
	if err != nil {
		return nil, fmt.Errorf("list_peers failed: %w", err)
	}

	peers := make([]any, len(resp.Peers))
	for i, p := range resp.Peers {
		peers[i] = map[string]any{
			"pub_key":     p.PubKey,
			"address":     p.Address,
			"bytes_sent":  p.BytesSent,
			"bytes_recv":  p.BytesRecv,
			"sat_sent":    p.SatSent,
			"sat_recv":    p.SatRecv,
			"inbound":     p.Inbound,
			"ping_time":   p.PingTime,
			"sync_type":   p.SyncType.String(),
		}
	}

	return lb.protoToDict(map[string]any{"peers": peers})
}

// connectPeer implements lnd.connect_peer().
func (lb *lndBuiltins) connectPeer(thread *starlark.Thread, fn *starlark.Builtin,
	args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {

	var pubkey, host string
	if err := starlark.UnpackArgs("connect_peer", args, kwargs,
		"pubkey", &pubkey, "host", &host); err != nil {
		return nil, err
	}

	ctx := lb.contextWithMacaroon()
	_, err := lb.clients.Lightning.ConnectPeer(ctx, &lnrpc.ConnectPeerRequest{
		Addr: &lnrpc.LightningAddress{
			Pubkey: pubkey,
			Host:   host,
		},
	})
	if err != nil {
		return nil, fmt.Errorf("connect_peer failed: %w", err)
	}

	return starlark.True, nil
}

// disconnectPeer implements lnd.disconnect_peer().
func (lb *lndBuiltins) disconnectPeer(thread *starlark.Thread, fn *starlark.Builtin,
	args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {

	var pubkey string
	if err := starlark.UnpackArgs("disconnect_peer", args, kwargs,
		"pubkey", &pubkey); err != nil {
		return nil, err
	}

	ctx := lb.contextWithMacaroon()
	_, err := lb.clients.Lightning.DisconnectPeer(ctx, &lnrpc.DisconnectPeerRequest{
		PubKey: pubkey,
	})
	if err != nil {
		return nil, fmt.Errorf("disconnect_peer failed: %w", err)
	}

	return starlark.True, nil
}

// forwardingHistory implements lnd.forwarding_history().
func (lb *lndBuiltins) forwardingHistory(thread *starlark.Thread, fn *starlark.Builtin,
	args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {

	var startTime, endTime int64
	var indexOffset, numMaxEvents int64

	if err := starlark.UnpackArgs("forwarding_history", args, kwargs,
		"start_time?", &startTime,
		"end_time?", &endTime,
		"index_offset?", &indexOffset,
		"num_max_events?", &numMaxEvents); err != nil {
		return nil, err
	}

	if numMaxEvents == 0 {
		numMaxEvents = 100
	}

	ctx := lb.contextWithMacaroon()
	resp, err := lb.clients.Lightning.ForwardingHistory(ctx, &lnrpc.ForwardingHistoryRequest{
		StartTime:    uint64(startTime),
		EndTime:      uint64(endTime),
		IndexOffset:  uint32(indexOffset),
		NumMaxEvents: uint32(numMaxEvents),
	})
	if err != nil {
		return nil, fmt.Errorf("forwarding_history failed: %w", err)
	}

	events := make([]any, len(resp.ForwardingEvents))
	for i, e := range resp.ForwardingEvents {
		events[i] = map[string]any{
			"timestamp":      e.Timestamp,
			"chan_id_in":     e.ChanIdIn,
			"chan_id_out":    e.ChanIdOut,
			"amt_in":         e.AmtIn,
			"amt_out":        e.AmtOut,
			"fee":            e.Fee,
			"fee_msat":       e.FeeMsat,
			"amt_in_msat":    e.AmtInMsat,
			"amt_out_msat":   e.AmtOutMsat,
		}
	}

	return lb.protoToDict(map[string]any{
		"forwarding_events": events,
		"last_offset_index": resp.LastOffsetIndex,
	})
}

// estimateFee implements lnd.estimate_fee().
func (lb *lndBuiltins) estimateFee(thread *starlark.Thread, fn *starlark.Builtin,
	args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {

	var targetConf int64
	if err := starlark.UnpackArgs("estimate_fee", args, kwargs,
		"target_conf?", &targetConf); err != nil {
		return nil, err
	}

	if targetConf == 0 {
		targetConf = 6
	}

	ctx := lb.contextWithMacaroon()
	resp, err := lb.clients.Lightning.EstimateFee(ctx, &lnrpc.EstimateFeeRequest{
		AddrToAmount: map[string]int64{
			"bcrt1qw508d6qejxtdg4y5r3zarvary0c5xw7kygt080": 10000,
		},
		TargetConf: int32(targetConf),
	})
	if err != nil {
		return nil, fmt.Errorf("estimate_fee failed: %w", err)
	}

	return lb.protoToDict(map[string]any{
		"fee_sat":       resp.FeeSat,
		"sat_per_vbyte": resp.SatPerVbyte,
	})
}

// Helper functions

func (lb *lndBuiltins) protoToDict(m map[string]any) (starlark.Value, error) {
	return toStarlarkValue(m)
}

func (lb *lndBuiltins) invoiceToDict(inv *lnrpc.Invoice) (starlark.Value, error) {
	return lb.protoToDict(map[string]any{
		"r_hash":          hex.EncodeToString(inv.RHash),
		"payment_request": inv.PaymentRequest,
		"value":           inv.Value,
		"value_msat":      inv.ValueMsat,
		"settled":         inv.Settled,
		"creation_date":   inv.CreationDate,
		"settle_date":     inv.SettleDate,
		"memo":            inv.Memo,
		"amt_paid_sat":    inv.AmtPaidSat,
		"amt_paid_msat":   inv.AmtPaidMsat,
		"state":           inv.State.String(),
		"add_index":       inv.AddIndex,
		"settle_index":    inv.SettleIndex,
	})
}

const int32Max = 2147483647

// SetLNDClients is used to set the LND clients after engine creation.
func (e *Engine) SetLNDClients(clients *LNDClients) {
	e.registerLNDBuiltins(e.predeclared, clients)
}

// NewLNDClientsFromConn creates LND clients from a gRPC connection.
func NewLNDClientsFromConn(conn *grpc.ClientConn) *LNDClients {
	return &LNDClients{
		Lightning: lnrpc.NewLightningClient(conn),
		Router:    routerrpc.NewRouterClient(conn),
		Invoices:  invoicesrpc.NewInvoicesClient(conn),
	}
}
