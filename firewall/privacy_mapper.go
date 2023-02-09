package firewall

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"math/big"
	"strconv"
	"strings"
	"time"

	"github.com/btcsuite/btcd/chaincfg/chainhash"
	"github.com/lightninglabs/lightning-terminal/firewalldb"
	mid "github.com/lightninglabs/lightning-terminal/rpcmiddleware"
	"github.com/lightninglabs/lightning-terminal/session"
	"github.com/lightningnetwork/lnd/lnrpc"
	"google.golang.org/protobuf/proto"
)

const (
	// privacyMapperName is the name of the RequestLogger interceptor.
	privacyMapperName = "lit-privacy-mapper"

	// amountVariation and timeVariation are used to set the randomization
	// of amounts and timestamps that are sent to the autopilot. Changing
	// these values may lead to unintended consequences in the behavior of
	// the autpilot.
	amountVariation = 0.05
	timeVariation   = time.Duration(10) * time.Minute

	// minTimeVariation and maxTimeVariation are the acceptable bounds
	// between which timeVariation can be set.
	minTimeVariation = time.Minute
	maxTimeVariation = time.Duration(24) * time.Hour

	// min and maxChanIDLen are the lengths to consider an int to be a
	// channel id. 13 corresponds to block height 1 and 20 to block height
	// 10_000_000.
	minChanIDLen = 13
	maxChanIDLen = 20

	// pubKeyLen is the length of a node pubkey.
	pubKeyLen = 66
)

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
	newDB     firewalldb.NewPrivacyMapDB
	randIntn  func(int) (int, error)
	sessionDB firewalldb.SessionDB
}

// NewPrivacyMapper returns a new instance of PrivacyMapper. The randIntn
// function is used to draw randomness for request field obfuscation.
func NewPrivacyMapper(newDB firewalldb.NewPrivacyMapDB,
	randIntn func(int) (int, error),
	sessionDB firewalldb.SessionDB) *PrivacyMapper {

	return &PrivacyMapper{
		newDB:     newDB,
		randIntn:  randIntn,
		sessionDB: sessionDB,
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

	session, err := p.sessionDB.GetSessionByID(sessionID)
	if err != nil {
		return nil, err
	}

	db := p.newDB(session.GroupID)

	// If we don't have a handler for the URI, we don't allow the request
	// to go through.
	checker, ok := p.checkers(db, session.PrivacyFlags)[uri]
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

	session, err := p.sessionDB.GetSessionByID(sessionID)
	if err != nil {
		return nil, err
	}

	db := p.newDB(session.GroupID)

	// If we don't have a handler for the URI, we don't allow the response
	// to go to avoid accidental leaks.
	checker, ok := p.checkers(db, session.PrivacyFlags)[uri]
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

func (p *PrivacyMapper) checkers(db firewalldb.PrivacyMapDB,
	flags session.PrivacyFlags) map[string]mid.RoundTripChecker {

	return map[string]mid.RoundTripChecker{
		"/lnrpc.Lightning/GetInfo": mid.NewResponseRewriter(
			&lnrpc.GetInfoRequest{}, &lnrpc.GetInfoResponse{},
			handleGetInfoResponse(db, flags),
			mid.PassThroughErrorHandler,
		),
		"/lnrpc.Lightning/ForwardingHistory": mid.NewResponseRewriter(
			&lnrpc.ForwardingHistoryRequest{},
			&lnrpc.ForwardingHistoryResponse{},
			handleFwdHistoryResponse(db, flags, p.randIntn),
			mid.PassThroughErrorHandler,
		),
		"/lnrpc.Lightning/FeeReport": mid.NewResponseRewriter(
			&lnrpc.FeeReportRequest{}, &lnrpc.FeeReportResponse{},
			handleFeeReportResponse(db, flags),
			mid.PassThroughErrorHandler,
		),
		"/lnrpc.Lightning/ListChannels": mid.NewFullRewriter(
			&lnrpc.ListChannelsRequest{},
			&lnrpc.ListChannelsResponse{},
			handleListChannelsRequest(db, flags),
			handleListChannelsResponse(db, flags, p.randIntn),
			mid.PassThroughErrorHandler,
		),
		"/lnrpc.Lightning/UpdateChannelPolicy": mid.NewFullRewriter(
			&lnrpc.PolicyUpdateRequest{},
			&lnrpc.PolicyUpdateResponse{},
			handleUpdatePolicyRequest(db, flags),
			handleUpdatePolicyResponse(db, flags),
			mid.PassThroughErrorHandler,
		),
		"/lnrpc.Lightning/WalletBalance": mid.NewResponseRewriter(
			&lnrpc.WalletBalanceRequest{},
			&lnrpc.WalletBalanceResponse{},
			handleWalletBalanceResponse(db, flags, p.randIntn),
			mid.PassThroughErrorHandler,
		),
		"/lnrpc.Lightning/ClosedChannels": mid.NewResponseRewriter(
			&lnrpc.ClosedChannelsRequest{},
			&lnrpc.ClosedChannelsResponse{},
			handleClosedChannelsResponse(db, flags, p.randIntn),
			mid.PassThroughErrorHandler,
		),
		"/lnrpc.Lightning/PendingChannels": mid.NewResponseRewriter(
			&lnrpc.PendingChannelsRequest{},
			&lnrpc.PendingChannelsResponse{},
			handlePendingChannelsResponse(db, flags, p.randIntn),
			mid.PassThroughErrorHandler,
		),

		"/lnrpc.Lightning/BatchOpenChannel": mid.NewFullRewriter(
			&lnrpc.BatchOpenChannelRequest{},
			&lnrpc.BatchOpenChannelResponse{},
			handleBatchOpenChannelRequest(db, flags),
			handleBatchOpenChannelResponse(db, flags),
			mid.PassThroughErrorHandler,
		),
	}
}

func handleGetInfoResponse(db firewalldb.PrivacyMapDB,
	flags session.PrivacyFlags) func(ctx context.Context,
	r *lnrpc.GetInfoResponse) (proto.Message, error) {

	return func(_ context.Context, r *lnrpc.GetInfoResponse) (
		proto.Message, error) {

		// We hide the pubkey unless it is disabled.
		pseudoPubKey := r.IdentityPubkey
		if !flags.Contains(session.ClearPubkeys) {
			err := db.Update(
				func(tx firewalldb.PrivacyMapTx) error {
					var err error
					pseudoPubKey, err = firewalldb.HideString(
						tx, r.IdentityPubkey,
					)

					return err
				},
			)
			if err != nil {
				return nil, err
			}
		}

		return &lnrpc.GetInfoResponse{
			// We purposefully hide our alias and URIs from the
			// autopilot server.
			Alias:                  "",
			Color:                  "",
			Uris:                   nil,
			Version:                r.Version,
			CommitHash:             r.CommitHash,
			IdentityPubkey:         pseudoPubKey,
			NumPendingChannels:     r.NumPendingChannels,
			NumActiveChannels:      r.NumActiveChannels,
			NumInactiveChannels:    r.NumInactiveChannels,
			NumPeers:               r.NumPeers,
			BlockHeight:            r.BlockHeight,
			BlockHash:              r.BlockHash,
			BestHeaderTimestamp:    r.BestHeaderTimestamp,
			SyncedToChain:          r.SyncedToChain,
			SyncedToGraph:          r.SyncedToGraph,
			Testnet:                r.Testnet,
			Chains:                 r.Chains,
			Features:               r.Features,
			RequireHtlcInterceptor: r.RequireHtlcInterceptor,
		}, nil
	}
}

func handleFwdHistoryResponse(db firewalldb.PrivacyMapDB,
	flags session.PrivacyFlags,
	randIntn func(int) (int, error)) func(ctx context.Context,
	r *lnrpc.ForwardingHistoryResponse) (proto.Message, error) {

	return func(_ context.Context, r *lnrpc.ForwardingHistoryResponse) (
		proto.Message, error) {

		fwdEvents := make(
			[]*lnrpc.ForwardingEvent, len(r.ForwardingEvents),
		)

		err := db.Update(func(tx firewalldb.PrivacyMapTx) error {
			for i, fe := range r.ForwardingEvents {
				var err error

				chanIn := fe.ChanIdIn
				chanOut := fe.ChanIdOut
				if !flags.Contains(session.ClearChanIDs) {
					// Deterministically hide channel ids.
					chanIn, err = firewalldb.HideUint64(
						tx, chanIn,
					)
					if err != nil {
						return err
					}

					chanOut, err = firewalldb.HideUint64(
						tx, chanOut,
					)
					if err != nil {
						return err
					}
				}

				amtOutMsat := fe.AmtOutMsat
				feeMsat := fe.FeeMsat
				if !flags.Contains(session.ClearAmounts) {
					// We randomize the outgoing amount for
					// privacy.
					amtOutMsat, err = hideAmount(
						randIntn, amountVariation,
						amtOutMsat,
					)
					if err != nil {
						return err
					}

					// We randomize fees for privacy.
					feeMsat, err = hideAmount(
						randIntn, amountVariation,
						feeMsat,
					)
					if err != nil {
						return err
					}
				}

				// Populate other fields in a consistent manner.
				amtInMsat := amtOutMsat + feeMsat
				amtOut := amtOutMsat / 1000
				amtIn := amtInMsat / 1000
				fee := feeMsat / 1000

				timestamp := time.Unix(0, int64(fe.TimestampNs))
				if !flags.Contains(session.ClearTimeStamps) {
					// We randomize the forwarding timestamp.
					timestamp, err = hideTimestamp(
						randIntn, timeVariation,
						timestamp,
					)
					if err != nil {
						return err
					}
				}

				fwdEvents[i] = &lnrpc.ForwardingEvent{
					ChanIdIn:   chanIn,
					ChanIdOut:  chanOut,
					AmtIn:      amtIn,
					AmtOut:     amtOut,
					Fee:        fee,
					FeeMsat:    feeMsat,
					AmtInMsat:  amtInMsat,
					AmtOutMsat: amtOutMsat,
					TimestampNs: uint64(
						timestamp.UnixNano(),
					),
					Timestamp: uint64(
						timestamp.Unix(),
					),
				}
			}
			return nil
		})
		if err != nil {
			return nil, err
		}

		return &lnrpc.ForwardingHistoryResponse{
			ForwardingEvents: fwdEvents,
			LastOffsetIndex:  r.LastOffsetIndex,
		}, nil
	}
}

func handleFeeReportResponse(db firewalldb.PrivacyMapDB,
	flags session.PrivacyFlags) func(ctx context.Context,
	r *lnrpc.FeeReportResponse) (proto.Message, error) {

	return func(ctx context.Context, r *lnrpc.FeeReportResponse) (
		proto.Message, error) {

		chanFees := make([]*lnrpc.ChannelFeeReport, len(r.ChannelFees))

		err := db.Update(func(tx firewalldb.PrivacyMapTx) error {
			var err error

			for i, c := range r.ChannelFees {
				chanID := c.ChanId
				if !flags.Contains(session.ClearChanIDs) {
					chanID, err = firewalldb.HideUint64(
						tx, chanID,
					)
					if err != nil {
						return err
					}
				}

				chanPoint := c.ChannelPoint
				if !flags.Contains(session.ClearChanIDs) {
					chanPoint, err = firewalldb.HideChanPointStr(
						tx, chanPoint,
					)
					if err != nil {
						return err
					}
				}

				chanFees[i] = &lnrpc.ChannelFeeReport{
					ChanId:       chanID,
					ChannelPoint: chanPoint,
					BaseFeeMsat:  c.BaseFeeMsat,
					FeePerMil:    c.FeePerMil,
					FeeRate:      c.FeeRate,
				}
			}

			return nil
		})
		if err != nil {
			return nil, err
		}

		return &lnrpc.FeeReportResponse{
			ChannelFees: chanFees,
			DayFeeSum:   r.DayFeeSum,
			WeekFeeSum:  r.WeekFeeSum,
			MonthFeeSum: r.MonthFeeSum,
		}, nil
	}
}

func handleListChannelsRequest(db firewalldb.PrivacyMapDB,
	flags session.PrivacyFlags) func(ctx context.Context,
	r *lnrpc.ListChannelsRequest) (proto.Message, error) {

	return func(ctx context.Context, r *lnrpc.ListChannelsRequest) (
		proto.Message, error) {

		if len(r.Peer) == 0 {
			return nil, nil
		}

		if flags.Contains(session.ClearPubkeys) {
			return r, nil
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

func handleListChannelsResponse(db firewalldb.PrivacyMapDB,
	flags session.PrivacyFlags,
	randIntn func(int) (int, error)) func(ctx context.Context,
	r *lnrpc.ListChannelsResponse) (proto.Message, error) {

	return func(_ context.Context, r *lnrpc.ListChannelsResponse) (
		proto.Message, error) {

		hidePubkeys := !flags.Contains(session.ClearPubkeys)
		hideChanIds := !flags.Contains(session.ClearChanIDs)

		channels := make([]*lnrpc.Channel, len(r.Channels))

		err := db.Update(func(tx firewalldb.PrivacyMapTx) error {
			for i, c := range r.Channels {
				var err error

				// We hide the remote pubkey unless it is
				// disabled.
				remotePub := c.RemotePubkey
				if hidePubkeys {
					remotePub, err = firewalldb.HideString(
						tx, c.RemotePubkey,
					)
					if err != nil {
						return err
					}
				}

				chanPoint := c.ChannelPoint
				chanID := c.ChanId
				if hideChanIds {
					chanPoint, err = firewalldb.HideChanPointStr(
						tx, c.ChannelPoint,
					)
					if err != nil {
						return err
					}

					chanID, err = firewalldb.HideUint64(
						tx, c.ChanId,
					)
					if err != nil {
						return err
					}
				}

				// We hide the initiator.
				initiator := c.Initiator
				if !flags.Contains(session.ClearChanInitiator) {
					initiator, err = hideBool(randIntn)
					if err != nil {
						return err
					}
				}

				// Consider the capacity to be public
				// information. We don't care about reserves, as
				// having some funds as a balance is the normal
				// state over the lifetime of a channel. The
				// balance would be zero only for the initial
				// state as a non-funder.

				// We randomize local/remote balances.
				localBalance, err := maybeHideAmount(
					flags, randIntn, c.LocalBalance,
				)
				if err != nil {
					return err
				}

				// We may have a too large value for the local
				// balance, restrict it to the capacity.
				if localBalance > c.Capacity {
					localBalance = c.Capacity
				}

				remoteBalance := c.RemoteBalance
				if !flags.Contains(session.ClearAmounts) {
					// We adapt the remote balance
					// accordingly.
					remoteBalance = c.Capacity - localBalance
				}

				// We hide the total sats sent and received.
				satsReceived, err := maybeHideAmount(
					flags, randIntn,
					c.TotalSatoshisReceived,
				)
				if err != nil {
					return err
				}

				satsSent, err := maybeHideAmount(
					flags, randIntn, c.TotalSatoshisSent,
				)
				if err != nil {
					return err
				}

				// We only keep track of the _number_ of
				// unsettled HTLCs.
				pendingHtlcs := make(
					[]*lnrpc.HTLC, len(c.PendingHtlcs),
				)

				// Only show the HTLCs if the flag is set.
				if flags.Contains(session.ClearHTLCs) {
					copy(pendingHtlcs, c.PendingHtlcs)
				}

				// We hide the unsettled balance.
				unsettled, err := maybeHideAmount(
					flags, randIntn, c.UnsettledBalance,
				)
				if err != nil {
					return err
				}

				//nolint:lll
				channels[i] = &lnrpc.Channel{
					// Items we adjust.
					RemotePubkey:          remotePub,
					ChannelPoint:          chanPoint,
					ChanId:                chanID,
					Initiator:             initiator,
					LocalBalance:          localBalance,
					RemoteBalance:         remoteBalance,
					TotalSatoshisReceived: satsReceived,
					TotalSatoshisSent:     satsSent,
					UnsettledBalance:      unsettled,
					PendingHtlcs:          pendingHtlcs,

					// Items that we zero out.
					CloseAddress:          "",
					PushAmountSat:         0,
					AliasScids:            nil,
					ZeroConfConfirmedScid: 0,

					// Items we keep as is.
					Active:               c.Active,
					Capacity:             c.Capacity,
					CommitFee:            c.CommitFee,
					CommitWeight:         c.CommitWeight,
					FeePerKw:             c.FeePerKw,
					NumUpdates:           c.NumUpdates,
					CsvDelay:             c.CsvDelay,
					Private:              c.Private,
					ChanStatusFlags:      c.ChanStatusFlags,
					LocalChanReserveSat:  c.LocalChanReserveSat,
					RemoteChanReserveSat: c.RemoteChanReserveSat,
					StaticRemoteKey:      c.StaticRemoteKey,
					CommitmentType:       c.CommitmentType,
					Lifetime:             c.Lifetime,
					Uptime:               c.Uptime,
					ThawHeight:           c.ThawHeight,
					LocalConstraints:     c.LocalConstraints,
					RemoteConstraints:    c.RemoteConstraints,
					ZeroConf:             c.ZeroConf,
				}
			}

			return nil
		})
		if err != nil {
			return nil, err
		}

		return &lnrpc.ListChannelsResponse{
			Channels: channels,
		}, nil
	}
}

func handleUpdatePolicyRequest(db firewalldb.PrivacyMapDB,
	flags session.PrivacyFlags) func(ctx context.Context,
	r *lnrpc.PolicyUpdateRequest) (proto.Message, error) {

	return func(_ context.Context, r *lnrpc.PolicyUpdateRequest) (
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

		newTxid := txid.String()
		newIndex := chanPoint.GetOutputIndex()
		if !flags.Contains(session.ClearChanIDs) {
			err = db.View(func(tx firewalldb.PrivacyMapTx) error {
				var err error
				newTxid, newIndex, err = firewalldb.RevealChanPoint(
					tx, newTxid, newIndex,
				)
				return err
			})
			if err != nil {
				return nil, err
			}
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

func handleUpdatePolicyResponse(db firewalldb.PrivacyMapDB,
	flags session.PrivacyFlags) func(ctx context.Context,
	r *lnrpc.PolicyUpdateResponse) (proto.Message, error) {

	return func(_ context.Context, r *lnrpc.PolicyUpdateResponse) (
		proto.Message, error) {

		if flags.Contains(session.ClearChanIDs) {
			return r, nil
		}

		failedUpdates := make(
			[]*lnrpc.FailedUpdate, len(r.FailedUpdates),
		)

		err := db.Update(func(tx firewalldb.PrivacyMapTx) error {
			for i, u := range r.FailedUpdates {
				failedUpdates[i] = &lnrpc.FailedUpdate{
					Reason:      u.Reason,
					UpdateError: u.UpdateError,
				}

				if u.Outpoint == nil {
					continue
				}

				txid, index, err := firewalldb.HideChanPoint(
					tx, u.Outpoint.TxidStr,
					u.Outpoint.OutputIndex,
				)
				if err != nil {
					return err
				}

				failedUpdates[i].Outpoint = &lnrpc.OutPoint{
					TxidBytes:   nil,
					TxidStr:     txid,
					OutputIndex: index,
				}
			}

			return nil
		})
		if err != nil {
			return nil, err
		}

		return &lnrpc.PolicyUpdateResponse{
			FailedUpdates: failedUpdates,
		}, nil
	}
}

func handleWalletBalanceResponse(_ firewalldb.PrivacyMapDB,
	flags session.PrivacyFlags,
	randIntn func(int) (int, error)) func(ctx context.Context,
	r *lnrpc.WalletBalanceResponse) (proto.Message, error) {

	return func(_ context.Context, r *lnrpc.WalletBalanceResponse) (
		proto.Message, error) {

		totalBalance, err := maybeHideAmount(
			flags, randIntn, r.TotalBalance,
		)
		if err != nil {
			return nil, err
		}

		confirmedBalance, err := maybeHideAmount(
			flags, randIntn, r.ConfirmedBalance,
		)
		if err != nil {
			return nil, err
		}

		unconfirmedBalance, err := maybeHideAmount(
			flags, randIntn, r.UnconfirmedBalance,
		)
		if err != nil {
			return nil, err
		}

		lockedBalance, err := maybeHideAmount(
			flags, randIntn, r.LockedBalance,
		)
		if err != nil {
			return nil, err
		}

		reservedBalanceAnchorChan, err := maybeHideAmount(
			flags, randIntn, r.ReservedBalanceAnchorChan,
		)
		if err != nil {
			return nil, err
		}

		accountBalance := make(
			map[string]*lnrpc.WalletAccountBalance,
			len(r.AccountBalance),
		)
		for k, v := range r.AccountBalance {
			confirmed, err := maybeHideAmount(
				flags, randIntn, v.ConfirmedBalance,
			)
			if err != nil {
				return nil, err
			}

			unconfirmed, err := maybeHideAmount(
				flags, randIntn, v.UnconfirmedBalance,
			)
			if err != nil {
				return nil, err
			}

			accountBalance[k] = &lnrpc.WalletAccountBalance{
				ConfirmedBalance:   confirmed,
				UnconfirmedBalance: unconfirmed,
			}
		}

		return &lnrpc.WalletBalanceResponse{
			TotalBalance:              totalBalance,
			ConfirmedBalance:          confirmedBalance,
			UnconfirmedBalance:        unconfirmedBalance,
			LockedBalance:             lockedBalance,
			ReservedBalanceAnchorChan: reservedBalanceAnchorChan,
			AccountBalance:            accountBalance,
		}, nil
	}
}

func handleClosedChannelsResponse(db firewalldb.PrivacyMapDB,
	flags session.PrivacyFlags,
	randIntn func(int) (int, error)) func(ctx context.Context,
	r *lnrpc.ClosedChannelsResponse) (proto.Message, error) {

	return func(_ context.Context, r *lnrpc.ClosedChannelsResponse) (
		proto.Message, error) {

		closedChannels := make(
			[]*lnrpc.ChannelCloseSummary,
			len(r.Channels),
		)

		err := db.Update(func(tx firewalldb.PrivacyMapTx) error {
			for i, c := range r.Channels {
				var err error

				remotePub := c.RemotePubkey
				if !flags.Contains(session.ClearPubkeys) {
					remotePub, err = firewalldb.HideString(
						tx, remotePub,
					)
					if err != nil {
						return err
					}
				}

				capacity, err := maybeHideAmount(
					flags, randIntn, c.Capacity,
				)
				if err != nil {
					return err
				}

				settledBalance, err := maybeHideAmount(
					flags, randIntn, c.SettledBalance,
				)
				if err != nil {
					return err
				}

				if settledBalance > capacity {
					settledBalance = capacity
				}

				channelPoint := c.ChannelPoint
				if !flags.Contains(session.ClearChanIDs) {
					channelPoint, err = firewalldb.HideChanPointStr(
						tx, c.ChannelPoint,
					)
					if err != nil {
						return err
					}
				}

				chanID := c.ChanId
				if !flags.Contains(session.ClearChanIDs) {
					chanID, err = firewalldb.HideUint64(
						tx, c.ChanId,
					)
					if err != nil {
						return err
					}
				}

				closingTxid := c.ClosingTxHash
				if !flags.Contains(session.ClearClosingTxIds) {
					closingTxid, err = firewalldb.HideString(
						tx, c.ClosingTxHash,
					)
					if err != nil {
						return err
					}
				}

				channel := lnrpc.ChannelCloseSummary{
					// Obfuscated fields.
					RemotePubkey:   remotePub,
					Capacity:       capacity,
					SettledBalance: settledBalance,
					ChannelPoint:   channelPoint,
					ChanId:         chanID,
					ClosingTxHash:  closingTxid,

					// Non-obfuscated fields.
					ChainHash:      c.ChainHash,
					CloseInitiator: c.CloseInitiator,
					CloseType:      c.CloseType,
					OpenInitiator:  c.OpenInitiator,

					// Omitted fields.
					// CloseHeight
					// TimeLockedBalance
					// Resolutions
					// AliasScids
					// ZeroConfConfirmedScid
				}

				closedChannels[i] = &channel
			}

			return nil
		})
		if err != nil {
			return nil, err
		}

		return &lnrpc.ClosedChannelsResponse{
			Channels: closedChannels,
		}, nil
	}
}

// obfuscatePendingChannel is a helper to obfuscate the fields of a pending
// channel.
func obfuscatePendingChannel(c *lnrpc.PendingChannelsResponse_PendingChannel,
	tx firewalldb.PrivacyMapTx, randIntn func(int) (int, error),
	flags session.PrivacyFlags) (
	*lnrpc.PendingChannelsResponse_PendingChannel, error) {

	var err error

	remotePub := c.RemoteNodePub
	if !flags.Contains(session.ClearPubkeys) {
		remotePub, err = firewalldb.HideString(
			tx, remotePub,
		)
		if err != nil {
			return nil, err
		}
	}

	capacity, err := maybeHideAmount(
		flags, randIntn, c.Capacity,
	)
	if err != nil {
		return nil, err
	}

	// We randomize local/remote balances.
	localBalance, err := maybeHideAmount(
		flags, randIntn, c.LocalBalance,
	)
	if err != nil {
		return nil, err
	}

	// We may have a too large value for the local
	// balance, restrict it to the capacity.
	if localBalance > capacity {
		localBalance = capacity
	}

	// The remote balance is set constently to the local balance.
	remoteBalance := c.RemoteBalance
	if !flags.Contains(session.ClearAmounts) {
		remoteBalance = capacity - localBalance
	}

	chanPoint := c.ChannelPoint
	if !flags.Contains(session.ClearChanIDs) {
		chanPoint, err = firewalldb.HideChanPointStr(
			tx, c.ChannelPoint,
		)
		if err != nil {
			return nil, err
		}
	}

	return &lnrpc.PendingChannelsResponse_PendingChannel{
		// Obfuscated fields.
		ChannelPoint:  chanPoint,
		RemoteNodePub: remotePub,
		Capacity:      capacity,
		LocalBalance:  localBalance,
		RemoteBalance: remoteBalance,

		// Non-obfuscated fields.
		ChanStatusFlags:       c.ChanStatusFlags,
		Private:               c.Private,
		CommitmentType:        c.CommitmentType,
		Initiator:             c.Initiator,
		NumForwardingPackages: c.NumForwardingPackages,
		Memo:                  c.Memo,

		// Omitted fields.
		// LocalChanReserveSat
		// RemoteChanReserveSat
	}, nil
}

func handlePendingChannelsResponse(db firewalldb.PrivacyMapDB,
	flags session.PrivacyFlags,
	randIntn func(int) (int, error)) func(ctx context.Context,
	r *lnrpc.PendingChannelsResponse) (proto.Message, error) {

	return func(_ context.Context, r *lnrpc.PendingChannelsResponse) (
		proto.Message, error) {

		pendingOpens := make(
			[]*lnrpc.PendingChannelsResponse_PendingOpenChannel,
			len(r.PendingOpenChannels),
		)

		pendingCloses := make(
			[]*lnrpc.PendingChannelsResponse_ClosedChannel,
			len(r.PendingClosingChannels),
		)

		pendingForceCloses := make(
			[]*lnrpc.PendingChannelsResponse_ForceClosedChannel,
			len(r.PendingForceClosingChannels),
		)

		waitingCloses := make(
			[]*lnrpc.PendingChannelsResponse_WaitingCloseChannel,
			len(r.WaitingCloseChannels),
		)

		err := db.Update(func(tx firewalldb.PrivacyMapTx) error {
			for i, c := range r.PendingOpenChannels {
				var err error

				pendingChannel, err := obfuscatePendingChannel(
					c.Channel, tx, randIntn, flags,
				)
				if err != nil {
					return err
				}

				pendingOpen := lnrpc.PendingChannelsResponse_PendingOpenChannel{
					// Non-obfuscated fields.
					CommitFee:           c.CommitFee,
					CommitWeight:        c.CommitWeight,
					FeePerKw:            c.FeePerKw,
					FundingExpiryBlocks: c.FundingExpiryBlocks,

					// Obfuscated fields.
					Channel: pendingChannel,
				}

				pendingOpens[i] = &pendingOpen
			}

			for i, c := range r.PendingClosingChannels {
				var err error

				pendingChannel, err := obfuscatePendingChannel(
					c.Channel, tx, randIntn, flags,
				)
				if err != nil {
					return err
				}

				closingTxid := c.ClosingTxid
				if !flags.Contains(session.ClearClosingTxIds) {
					closingTxid, err = firewalldb.HideString(
						tx, c.ClosingTxid,
					)
					if err != nil {
						return err
					}
				}

				pendingClose := lnrpc.PendingChannelsResponse_ClosedChannel{
					// Obfuscated fields.
					ClosingTxid: closingTxid,
					Channel:     pendingChannel,
				}

				pendingCloses[i] = &pendingClose
			}

			for i, c := range r.PendingForceClosingChannels {
				var err error

				pendingChannel, err := obfuscatePendingChannel(
					c.Channel, tx, randIntn, flags,
				)
				if err != nil {
					return err
				}

				closingTxid := c.ClosingTxid
				if !flags.Contains(session.ClearClosingTxIds) {
					closingTxid, err = firewalldb.HideString(
						tx, c.ClosingTxid,
					)
					if err != nil {
						return err
					}
				}

				limboBalance, err := maybeHideAmount(
					flags, randIntn, c.LimboBalance,
				)
				if err != nil {
					return err
				}

				if limboBalance > pendingChannel.Capacity {
					limboBalance = pendingChannel.Capacity
				}

				recoveredBalance, err := maybeHideAmount(
					flags, randIntn, c.RecoveredBalance,
				)
				if err != nil {
					return err
				}

				if recoveredBalance > pendingChannel.Capacity {
					limboBalance = pendingChannel.Capacity
				}

				pendingForceClose := lnrpc.PendingChannelsResponse_ForceClosedChannel{
					// Obfuscated fields.
					ClosingTxid:      closingTxid,
					LimboBalance:     limboBalance,
					RecoveredBalance: recoveredBalance,
					Channel:          pendingChannel,

					// Non-obfuscated fields.
					MaturityHeight:    c.MaturityHeight,
					BlocksTilMaturity: c.BlocksTilMaturity,
					Anchor:            c.Anchor,

					// Omitted fields.
					PendingHtlcs: []*lnrpc.PendingHTLC{},
				}

				pendingForceCloses[i] = &pendingForceClose
			}

			for i, c := range r.WaitingCloseChannels {
				var err error

				pendingChannel, err := obfuscatePendingChannel(
					c.Channel, tx, randIntn, flags,
				)
				if err != nil {
					return err
				}

				limboBalance, err := maybeHideAmount(
					flags, randIntn, c.LimboBalance,
				)
				if err != nil {
					return err
				}

				if limboBalance > pendingChannel.Capacity {
					limboBalance = pendingChannel.Capacity
				}

				closingTxid := c.ClosingTxid
				if !flags.Contains(session.ClearClosingTxIds) {
					closingTxid, err = firewalldb.HideString(
						tx, closingTxid,
					)
					if err != nil {
						return err
					}
				}

				// The closing tx hash is constrained by the
				// request, see docstring, which is why we only
				// obfuscate if a value is set.
				closingTxHex := c.ClosingTxHex
				if c.ClosingTxHex != "" &&
					!flags.Contains(
						session.ClearClosingTxIds,
					) {

					closingTxHex, err = firewalldb.HideString(
						tx, closingTxHex,
					)
					if err != nil {
						return err
					}
				}

				waitingCloseChannel := lnrpc.PendingChannelsResponse_WaitingCloseChannel{
					Channel:      pendingChannel,
					LimboBalance: limboBalance,
					ClosingTxid:  closingTxid,
					ClosingTxHex: closingTxHex,

					// Omitted.
					Commitments: &lnrpc.PendingChannelsResponse_Commitments{},
				}

				waitingCloses[i] = &waitingCloseChannel
			}

			return nil
		})
		if err != nil {
			return nil, err
		}

		totalLimbo, err := maybeHideAmount(
			flags, randIntn, r.TotalLimboBalance,
		)
		if err != nil {
			return nil, err
		}

		return &lnrpc.PendingChannelsResponse{
			TotalLimboBalance:           totalLimbo,
			PendingOpenChannels:         pendingOpens,
			PendingClosingChannels:      pendingCloses,
			PendingForceClosingChannels: pendingForceCloses,
			WaitingCloseChannels:        waitingCloses,
		}, nil
	}
}

func handleBatchOpenChannelRequest(db firewalldb.PrivacyMapDB,
	flags session.PrivacyFlags) func(ctx context.Context,
	r *lnrpc.BatchOpenChannelRequest) (proto.Message, error) {

	return func(_ context.Context, r *lnrpc.BatchOpenChannelRequest) (
		proto.Message, error) {

		var reqs = make([]*lnrpc.BatchOpenChannel, len(r.Channels))

		err := db.View(func(tx firewalldb.PrivacyMapTx) error {
			for i, c := range r.Channels {
				var err error

				// Note, this only works if the obfuscated
				// pubkey was already created via other
				// calls, e.g. via ListChannels or
				// GetInfo or the like.
				nodePubkey := c.NodePubkey
				if !flags.Contains(session.ClearPubkeys) {
					nodePubkey, err = firewalldb.RevealBytes(
						tx, c.NodePubkey,
					)
					if err != nil {
						return err
					}
				}

				reqs[i] = &lnrpc.BatchOpenChannel{
					// Obfuscated fields.
					NodePubkey: nodePubkey,

					// Non-obfuscated fields.
					LocalFundingAmount:         c.LocalFundingAmount,
					PushSat:                    c.PushSat,
					Private:                    c.Private,
					MinHtlcMsat:                c.MinHtlcMsat,
					RemoteCsvDelay:             c.RemoteCsvDelay,
					CloseAddress:               c.CloseAddress,
					PendingChanId:              c.PendingChanId,
					CommitmentType:             c.CommitmentType,
					RemoteMaxValueInFlightMsat: c.RemoteMaxValueInFlightMsat,
					RemoteMaxHtlcs:             c.RemoteMaxHtlcs,
					MaxLocalCsv:                c.MaxLocalCsv,
					ZeroConf:                   c.ZeroConf,
					ScidAlias:                  c.ScidAlias,
					BaseFee:                    c.BaseFee,
					FeeRate:                    c.FeeRate,
					UseBaseFee:                 c.UseBaseFee,
					UseFeeRate:                 c.UseFeeRate,
					RemoteChanReserveSat:       c.RemoteChanReserveSat,
					Memo:                       c.Memo,
				}
			}

			return nil
		})
		if err != nil {
			return nil, err
		}

		return &lnrpc.BatchOpenChannelRequest{
			Channels:         reqs,
			TargetConf:       r.TargetConf,
			SatPerVbyte:      r.SatPerVbyte,
			MinConfs:         r.MinConfs,
			SpendUnconfirmed: r.SpendUnconfirmed,
			Label:            r.Label,
		}, nil
	}
}

func handleBatchOpenChannelResponse(db firewalldb.PrivacyMapDB,
	flags session.PrivacyFlags) func(ctx context.Context,
	r *lnrpc.BatchOpenChannelResponse) (proto.Message, error) {

	return func(_ context.Context, r *lnrpc.BatchOpenChannelResponse) (
		proto.Message, error) {

		resps := make([]*lnrpc.PendingUpdate, len(r.PendingChannels))

		err := db.Update(func(tx firewalldb.PrivacyMapTx) error {
			for i, p := range r.PendingChannels {
				var (
					txIdBytes   = p.Txid
					outputIndex = p.OutputIndex
				)

				if !flags.Contains(session.ClearChanIDs) {
					txId, err := chainhash.NewHash(p.Txid)
					if err != nil {
						return err
					}

					txID, outIdx, err := firewalldb.HideChanPoint(
						tx, txId.String(), p.OutputIndex,
					)
					if err != nil {
						return err
					}
					outputIndex = outIdx

					txHash, err := chainhash.NewHashFromStr(
						txID,
					)
					if err != nil {
						return err
					}
					txIdBytes = txHash[:]
				}

				resps[i] = &lnrpc.PendingUpdate{
					Txid:        txIdBytes,
					OutputIndex: outputIndex,
				}
			}

			return nil
		})
		if err != nil {
			return nil, err
		}

		return &lnrpc.BatchOpenChannelResponse{
			PendingChannels: resps,
		}, nil
	}
}

// maybeHideAmount hides an amount if the privacy flag is not set.
func maybeHideAmount(flags session.PrivacyFlags, randIntn func(int) (int,
	error), a int64) (int64, error) {

	if !flags.Contains(session.ClearAmounts) {
		hiddenAmount, err := hideAmount(
			randIntn, amountVariation, uint64(a),
		)
		if err != nil {
			return 0, err
		}

		return int64(hiddenAmount), nil
	}

	return a, nil
}

// hideAmount symmetrically randomizes an amount around a given relative
// variation interval. relativeVariation should be between 0 and 1.
func hideAmount(randIntn func(n int) (int, error), relativeVariation float64,
	amount uint64) (uint64, error) {

	if relativeVariation < 0 || relativeVariation > 1 {
		return 0, fmt.Errorf("hide amount: relative variation is not "+
			"between allowed bounds of [0, 1], is %v",
			relativeVariation)
	}

	if amount == 0 {
		return 0, nil
	}

	// fuzzInterval is smaller than the amount provided fuzzVariation is
	// between 0 and 1.
	fuzzInterval := uint64(float64(amount) * relativeVariation)

	amountMin := int(amount - fuzzInterval)
	amountMax := int(amount + fuzzInterval)

	randAmount, err := randBetween(randIntn, amountMin, amountMax)
	if err != nil {
		return 0, err
	}

	return uint64(randAmount), nil
}

// hideTimestamp symmetrically randomizes a unix timestamp given an absolute
// variation interval. The random input is expected to be rand.Intn.
func hideTimestamp(randIntn func(n int) (int, error),
	absoluteVariation time.Duration,
	timestamp time.Time) (time.Time, error) {

	if absoluteVariation < minTimeVariation ||
		absoluteVariation > maxTimeVariation {

		return time.Time{}, fmt.Errorf("hide timestamp: absolute time "+
			"variation is out of bounds, have %v",
			absoluteVariation)
	}

	// Don't fuzz meaningless timestamps.
	if timestamp.Add(-absoluteVariation).Unix() < 0 ||
		timestamp.IsZero() {

		return timestamp, nil
	}

	// We vary symmetrically around the provided timestamp.
	timeMin := timestamp.Add(-absoluteVariation)
	timeMax := timestamp.Add(absoluteVariation)

	timeNs, err := randBetween(
		randIntn, int(timeMin.UnixNano()), int(timeMax.UnixNano()),
	)
	if err != nil {
		return time.Time{}, err
	}

	return time.Unix(0, int64(timeNs)), nil
}

// randBetween generates a random number between [min, max) given a source of
// randomness.
func randBetween(randIntn func(int) (int, error), min, max int) (int, error) {
	if max < min {
		return 0, fmt.Errorf("min is not allowed to be greater than "+
			"max, (min: %v, max: %v)", min, max)
	}

	// We don't want to pass zero to randIntn to avoid panics.
	if max == min {
		return min, nil
	}

	add, err := randIntn(max - min)
	if err != nil {
		return 0, err
	}

	return min + add, nil
}

// hideBool generates a random bool given a random input.
func hideBool(randIntn func(n int) (int, error)) (bool, error) {
	random, err := randIntn(2)
	if err != nil {
		return false, err
	}

	// For testing we may expect larger random numbers, which we map to
	// true.
	return random >= 1, nil
}

// CryptoRandIntn generates a random number between [0, n).
func CryptoRandIntn(n int) (int, error) {
	if n == 0 {
		return 0, nil
	}

	nBig, err := rand.Int(rand.Reader, big.NewInt(int64(n)))
	if err != nil {
		return 0, err
	}

	return int(nBig.Int64()), nil
}

// ObfuscateConfig alters the config string by replacing sensitive data with
// random values and returns new replacement pairs. We only substitute items in
// strings, numbers are left unchanged.
func ObfuscateConfig(db firewalldb.PrivacyMapReader, configB []byte,
	flags session.PrivacyFlags) ([]byte, map[string]string, error) {

	if len(configB) == 0 {
		return nil, nil, nil
	}

	// We assume that the config is a json dict.
	var configMap map[string]any
	err := json.Unmarshal(configB, &configMap)
	if err != nil {
		return nil, nil, err
	}

	privMapPairs := make(map[string]string)
	newConfigMap := make(map[string]any)
	for k, v := range configMap {
		// We only substitute items in lists.
		list, ok := v.([]any)
		if !ok {
			newConfigMap[k] = v
			continue
		}

		// We only substitute items in lists of strings.
		stringList := make([]string, len(list))
		anyString := false
		allStrings := true
		for i, item := range list {
			item, ok := item.(string)
			allStrings = allStrings && ok
			anyString = anyString || ok

			if !ok {
				continue
			}

			stringList[i] = item
		}
		if anyString && !allStrings {
			return nil, nil, fmt.Errorf("invalid config, "+
				"expected list of only strings for key %s", k)
		} else if !anyString {
			newConfigMap[k] = v
			continue
		}

		obfuscatedValues := make([]string, len(stringList))
		for i, value := range stringList {
			value := strings.TrimSpace(value)

			alreadyHave := func() (string, bool) {
				// We check if we have obfuscated this value
				// already in this run.
				obfVal, ok := privMapPairs[value]
				if ok {
					return obfVal, true
				}

				// We first check if we have a mapping for this
				// value already within the database.
				obfVal, ok = db.GetPseudo(value)
				if ok {
					return obfVal, true
				}

				return "", false
			}

			// From here on we create new obfuscated values.
			// Try to replace with a chan point.
			_, _, err := firewalldb.DecodeChannelPoint(value)
			if err == nil {
				// We don't obfuscate channel points if the flag
				// is set.
				if flags.Contains(session.ClearChanIDs) {
					obfuscatedValues[i] = value

					continue
				}

				// We replace the channel point with a random
				// value, should we already have it.
				if obfVal, ok := alreadyHave(); ok {
					obfuscatedValues[i] = obfVal

					continue
				}

				// Otherwise we create a new mapping.
				obfVal, err := firewalldb.NewPseudoChanPoint()
				if err != nil {
					return nil, nil, err
				}

				obfuscatedValues[i] = obfVal
				privMapPairs[value] = obfVal

				continue
			}

			// If the value is a pubkey, replace it with a random
			// value.
			_, err = hex.DecodeString(value)
			if err == nil && len(value) == pubKeyLen {
				// We don't obfuscate pubkeys if the flag is
				// set.
				if flags.Contains(session.ClearPubkeys) {
					obfuscatedValues[i] = value

					continue
				}

				// We replace the pubkey with a random value,
				// should we already have it.
				if obfVal, ok := alreadyHave(); ok {
					obfuscatedValues[i] = obfVal

					continue
				}

				// Otherwise we create a new mapping.
				obfVal, err := firewalldb.NewPseudoStr(
					len(value),
				)
				if err != nil {
					return nil, nil, err
				}

				obfuscatedValues[i] = obfVal
				privMapPairs[value] = obfVal

				continue
			}

			// If the value is a channel id, replace it with
			// a random value.
			_, err = strconv.ParseInt(value, 10, 64)
			length := len(value)

			// Channel ids can have different lengths depending on
			// the blockheight, 20 is equivalent to 10E9 blocks.
			if err == nil && minChanIDLen <= length &&
				length <= maxChanIDLen {

				// We don't obfuscate channel ids if the flag is
				// set.
				if flags.Contains(session.ClearChanIDs) {
					obfuscatedValues[i] = value

					continue
				}

				// We replace the channel id with a random
				// value, should we already have it.
				if obfVal, ok := alreadyHave(); ok {
					obfuscatedValues[i] = obfVal

					continue
				}

				// Otherwise we create a new mapping.
				obfVal, err := firewalldb.NewPseudoStr(length)
				if err != nil {
					return nil, nil, err
				}

				obfuscatedValues[i] = obfVal
				privMapPairs[value] = obfVal

				continue
			}

			// If we don't have a replacement for this value, we
			// just leave it as is.
			obfuscatedValues[i] = value
		}

		newConfigMap[k] = obfuscatedValues
	}

	// Marshal the map back into a JSON blob.
	newConfigB, err := json.Marshal(newConfigMap)
	if err != nil {
		return nil, nil, err
	}

	return newConfigB, privMapPairs, nil
}
