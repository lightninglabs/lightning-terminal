package firewall

import (
	"context"
	"errors"
	"fmt"

	"github.com/lightninglabs/lightning-terminal/firewalldb"
	mid "github.com/lightninglabs/lightning-terminal/rpcmiddleware"
	"github.com/lightninglabs/lightning-terminal/session"
	"github.com/lightningnetwork/lnd/lnrpc"
	"google.golang.org/protobuf/proto"
)

// privacyMapperName is the name of the RequestLogger interceptor.
const privacyMapperName = "lit-privacy-mapper"

var (
	// ErrNotSupportedByPrivacyMapper indicates that the invoked RPC method
	// is not supported by the privacy mapper.
	ErrNotSupportedByPrivacyMapper = errors.New("this RPC call is not " +
		"supported by the privacy mapper interceptor")
)

// A compile-time assertion that PrivacyMapper is a
// rpcmiddleware.RequestInterceptor.
var _ mid.RequestInterceptor = (*PrivacyMapper)(nil)

// PrivacyMapper is a RequestInterceptor that maps any pseudo names in certain
// requests to their real values and vice versa for responses.
type PrivacyMapper struct {
	newDB firewalldb.NewPrivacyMapDB
}

// NewPrivacyMapper returns a new instance of PrivacyMapper.
func NewPrivacyMapper(newDB firewalldb.NewPrivacyMapDB) *PrivacyMapper {
	return &PrivacyMapper{
		newDB: newDB,
	}
}

// Name returns the name of the interceptor.
func (p *PrivacyMapper) Name() string {
	return privacyMapperName
}

// ReadOnly returns true if this interceptor should be registered in read-only
// mode. In read-only mode no custom caveat name can be specified.
func (p *PrivacyMapper) ReadOnly() bool {
	return false
}

// CustomCaveatName returns the name of the custom caveat that is expected to be
// handled by this interceptor. Cannot be specified in read-only mode.
func (p *PrivacyMapper) CustomCaveatName() string {
	return CondPrivacy
}

// Intercept processes an RPC middleware interception request and returns the
// interception result which either accepts or rejects the intercepted message.
func (p *PrivacyMapper) Intercept(ctx context.Context,
	req *lnrpc.RPCMiddlewareRequest) (*lnrpc.RPCMiddlewareResponse, error) {

	ri, err := NewInfoFromRequest(req)
	if err != nil {
		return nil, fmt.Errorf("error parsing incoming RPC middleware "+
			"interception request: %v", err)
	}

	sessionID, err := session.IDFromMacaroon(ri.Macaroon)
	if err != nil {
		return nil, fmt.Errorf("could not extract ID from macaroon")
	}

	log.Tracef("PrivacyMapper: Intercepting %v", ri)

	switch r := req.InterceptType.(type) {
	case *lnrpc.RPCMiddlewareRequest_StreamAuth:
		return mid.RPCErr(req, fmt.Errorf("streams unsupported"))

	// Parse incoming requests and act on them.
	case *lnrpc.RPCMiddlewareRequest_Request:
		msg, err := mid.ParseProtobuf(
			r.Request.TypeName, r.Request.Serialized,
		)
		if err != nil {
			return mid.RPCErrString(req, "error parsing proto: %v",
				err)
		}

		replacement, err := p.checkAndReplaceIncomingRequest(
			ctx, r.Request.MethodFullUri, msg, sessionID,
		)
		if err != nil {
			return mid.RPCErr(req, err)
		}

		// No error occurred but the response should be replaced with
		// the given custom response. Wrap it in the correct RPC
		// response of the interceptor now.
		if replacement != nil {
			return mid.RPCReplacement(req, replacement)
		}

		// No error and no replacement, just return an empty response of
		// the correct type.
		return mid.RPCOk(req)

	// Parse and possibly manipulate outgoing responses.
	case *lnrpc.RPCMiddlewareRequest_Response:
		if ri.IsError {
			// TODO(elle): should we replace all litd errors with
			// a generic error?
			return mid.RPCOk(req)
		}

		msg, err := mid.ParseProtobuf(
			r.Response.TypeName, r.Response.Serialized,
		)
		if err != nil {
			return mid.RPCErrString(req, "error parsing proto: %v",
				err)
		}

		replacement, err := p.replaceOutgoingResponse(
			ctx, r.Response.MethodFullUri, msg, sessionID,
		)
		if err != nil {
			return mid.RPCErr(req, err)
		}

		// No error occurred but the response should be replaced with
		// the given custom response. Wrap it in the correct RPC
		// response of the interceptor now.
		if replacement != nil {
			return mid.RPCReplacement(req, replacement)
		}

		// No error and no replacement, just return an empty response of
		// the correct type.
		return mid.RPCOk(req)

	default:
		return mid.RPCErrString(req, "invalid intercept type: %v", r)
	}
}

// checkAndReplaceIncomingRequest inspects an incoming request and optionally
// modifies some of the request parameters.
func (p *PrivacyMapper) checkAndReplaceIncomingRequest(ctx context.Context,
	uri string, req proto.Message, sessionID session.ID) (proto.Message,
	error) {

	db := p.newDB(sessionID)

	// If we don't have a handler for the URI, we don't allow the request
	// to go through.
	checker, ok := p.checkers(db)[uri]
	if !ok {
		return nil, ErrNotSupportedByPrivacyMapper
	}

	// This is just a sanity check to make sure the implementation for the
	// checker actually matches the correct request type.
	if !checker.HandlesRequest(req.ProtoReflect().Type()) {
		return nil, fmt.Errorf("invalid implementation, checker for "+
			"URI %s does not accept request of type %v", uri,
			req.ProtoReflect().Type())
	}

	return checker.HandleRequest(ctx, req)
}

// replaceOutgoingResponse inspects the responses before sending them out to the
// client and replaces them if needed.
func (p *PrivacyMapper) replaceOutgoingResponse(ctx context.Context, uri string,
	resp proto.Message, sessionID session.ID) (proto.Message, error) {

	db := p.newDB(sessionID)

	// If we don't have a handler for the URI, we don't allow the response
	// to go to avoid accidental leaks.
	checker, ok := p.checkers(db)[uri]
	if !ok {
		return nil, ErrNotSupportedByPrivacyMapper
	}

	// This is just a sanity check to make sure the implementation for the
	// checker actually matches the correct response type.
	if !checker.HandlesResponse(resp.ProtoReflect().Type()) {
		return nil, fmt.Errorf("invalid implementation, checker for "+
			"URI %s does not accept response of type %v", uri,
			resp.ProtoReflect().Type())
	}

	return checker.HandleResponse(ctx, resp)
}

func (p *PrivacyMapper) checkers(
	db firewalldb.PrivacyMapDB) map[string]mid.RoundTripChecker {

	return map[string]mid.RoundTripChecker{
		"/lnrpc.Lightning/GetInfo": mid.NewResponseRewriter(
			&lnrpc.GetInfoRequest{}, &lnrpc.GetInfoResponse{},
			handleGetInfoRequest(db), mid.PassThroughErrorHandler,
		),
		"/lnrpc.Lightning/ForwardingHistory": mid.NewResponseRewriter(
			&lnrpc.ForwardingHistoryRequest{},
			&lnrpc.ForwardingHistoryResponse{},
			handleFwdHistoryResponse(db),
			mid.PassThroughErrorHandler,
		),
		"/lnrpc.Lightning/FeeReport": mid.NewResponseRewriter(
			&lnrpc.FeeReportRequest{}, &lnrpc.FeeReportResponse{},
			handleFeeReportResponse(db),
			mid.PassThroughErrorHandler,
		),
		"/lnrpc.Lightning/ListChannels": mid.NewFullRewriter(
			&lnrpc.ListChannelsRequest{},
			&lnrpc.ListChannelsResponse{},
			handleListChannelsRequest(db),
			handleListChannelsResponse(db),
			mid.PassThroughErrorHandler,
		),
		"/lnrpc.Lightning/UpdateChannelPolicy": mid.NewFullRewriter(
			&lnrpc.PolicyUpdateRequest{},
			&lnrpc.PolicyUpdateResponse{},
			handleUpdatePolicyRequest(db),
			handleUpdatePolicyResponse(db),
			mid.PassThroughErrorHandler,
		),
	}
}

func handleGetInfoRequest(db firewalldb.PrivacyMapDB) func(ctx context.Context,
	r *lnrpc.GetInfoResponse) (proto.Message, error) {

	return func(ctx context.Context, r *lnrpc.GetInfoResponse) (
		proto.Message, error) {

		err := db.Update(
			func(tx firewalldb.PrivacyMapTx) error {
				var err error
				pk, err := firewalldb.HideString(
					tx, r.IdentityPubkey,
				)
				if err != nil {
					return err
				}

				r.IdentityPubkey = pk
				return nil
			},
		)
		if err != nil {
			return nil, err
		}

		// Hide our Alias and URI from the autopilot
		// server.
		r.Alias = ""
		r.Uris = nil

		return r, nil
	}
}

func handleFwdHistoryResponse(db firewalldb.PrivacyMapDB) func(
	ctx context.Context, r *lnrpc.ForwardingHistoryResponse) (proto.Message,
	error) {

	return func(ctx context.Context, r *lnrpc.ForwardingHistoryResponse) (
		proto.Message, error) {

		err := db.Update(func(tx firewalldb.PrivacyMapTx) error {
			for _, fe := range r.ForwardingEvents {
				chanIn, err := firewalldb.HideUint64(
					tx, fe.ChanIdIn,
				)
				if err != nil {
					return err
				}
				fe.ChanIdIn = chanIn

				chanOut, err := firewalldb.HideUint64(
					tx, fe.ChanIdOut,
				)
				if err != nil {
					return err
				}
				fe.ChanIdOut = chanOut
			}
			return nil
		})
		if err != nil {
			return nil, err
		}

		return r, nil
	}
}

func handleFeeReportResponse(db firewalldb.PrivacyMapDB) func(
	ctx context.Context, r *lnrpc.FeeReportResponse) (proto.Message,
	error) {

	return func(ctx context.Context, r *lnrpc.FeeReportResponse) (
		proto.Message, error) {

		err := db.Update(func(tx firewalldb.PrivacyMapTx) error {
			for _, c := range r.ChannelFees {
				chanID, err := firewalldb.HideUint64(
					tx, c.ChanId,
				)
				if err != nil {
					return err
				}

				chanPoint, err := firewalldb.HideChanPointStr(
					tx, c.ChannelPoint,
				)
				if err != nil {
					return err
				}

				c.ChannelPoint = chanPoint
				c.ChanId = chanID
			}

			return nil
		})
		if err != nil {
			return nil, err
		}

		return r, nil
	}
}

func handleListChannelsRequest(db firewalldb.PrivacyMapDB) func(
	ctx context.Context, r *lnrpc.ListChannelsRequest) (proto.Message,
	error) {

	return func(ctx context.Context, r *lnrpc.ListChannelsRequest) (
		proto.Message, error) {

		if len(r.Peer) == 0 {
			return nil, nil
		}

		err := db.View(func(tx firewalldb.PrivacyMapTx) error {
			peer, err := firewalldb.RevealBytes(tx, r.Peer)
			if err != nil {
				return err
			}

			r.Peer = peer
			return nil
		})
		if err != nil {
			return nil, err
		}

		return r, nil
	}
}

func handleListChannelsResponse(db firewalldb.PrivacyMapDB) func(
	ctx context.Context, r *lnrpc.ListChannelsResponse) (proto.Message,
	error) {

	return func(ctx context.Context, r *lnrpc.ListChannelsResponse) (
		proto.Message, error) {

		err := db.Update(func(tx firewalldb.PrivacyMapTx) error {
			for i, c := range r.Channels {
				pk, err := firewalldb.HideString(
					tx, c.RemotePubkey,
				)
				if err != nil {
					return err
				}
				r.Channels[i].RemotePubkey = pk

				cp, err := firewalldb.HideChanPointStr(
					tx, c.ChannelPoint,
				)
				if err != nil {
					return err
				}
				r.Channels[i].ChannelPoint = cp

				cid, err := firewalldb.HideUint64(tx, c.ChanId)
				if err != nil {
					return err
				}
				r.Channels[i].ChanId = cid
			}

			return nil
		})
		if err != nil {
			return nil, err
		}

		return r, nil
	}
}

func handleUpdatePolicyRequest(db firewalldb.PrivacyMapDB) func(
	ctx context.Context, r *lnrpc.PolicyUpdateRequest) (proto.Message,
	error) {

	return func(ctx context.Context, r *lnrpc.PolicyUpdateRequest) (
		proto.Message, error) {

		chanPoint := r.GetChanPoint()

		// If no channel point is specified then the
		// update request applies globally.
		if chanPoint == nil {
			return nil, nil
		}

		txid, err := lnrpc.GetChanPointFundingTxid(chanPoint)
		if err != nil {
			return nil, err
		}

		index := chanPoint.GetOutputIndex()

		var (
			newTxid  string
			newIndex uint32
		)
		err = db.View(func(tx firewalldb.PrivacyMapTx) error {
			var err error
			newTxid, newIndex, err = firewalldb.RevealChanPoint(
				tx, txid.String(), index,
			)
			return err
		})
		if err != nil {
			return nil, err
		}

		r.Scope = &lnrpc.PolicyUpdateRequest_ChanPoint{
			ChanPoint: &lnrpc.ChannelPoint{
				FundingTxid: &lnrpc.ChannelPoint_FundingTxidStr{
					FundingTxidStr: newTxid,
				},
				OutputIndex: newIndex,
			},
		}

		return r, nil
	}
}

func handleUpdatePolicyResponse(db firewalldb.PrivacyMapDB) func(
	ctx context.Context, r *lnrpc.PolicyUpdateResponse) (proto.Message,
	error) {

	return func(ctx context.Context, r *lnrpc.PolicyUpdateResponse) (
		proto.Message, error) {

		if len(r.FailedUpdates) == 0 {
			return nil, nil
		}

		err := db.Update(func(tx firewalldb.PrivacyMapTx) error {
			for _, u := range r.FailedUpdates {
				txid, index, err := firewalldb.HideChanPoint(
					tx, u.Outpoint.TxidStr,
					u.Outpoint.OutputIndex,
				)
				if err != nil {
					return err
				}

				u.Outpoint.TxidBytes = nil
				u.Outpoint.TxidStr = txid
				u.Outpoint.OutputIndex = index
			}

			return nil
		})
		if err != nil {
			return nil, err
		}

		return r, nil
	}
}
