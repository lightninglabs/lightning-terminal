package rules

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	"sync"

	"github.com/lightninglabs/lightning-terminal/firewalldb"
	"github.com/lightninglabs/lightning-terminal/litrpc"
	mid "github.com/lightninglabs/lightning-terminal/rpcmiddleware"
	"github.com/lightninglabs/lightning-terminal/session"
	"github.com/lightningnetwork/lnd/lnrpc"
	"google.golang.org/protobuf/proto"
)

var (
	// Compile-time checks to ensure that OnChainBudget, OnChainBudgetMgr
	// and OnChainBudgetEnforcer implement the appropriate Manager, Enforcer
	// and Values interface.
	_ Manager  = (*OnChainBudgetMgr)(nil)
	_ Enforcer = (*OnChainBudgetEnforcer)(nil)
	_ Values   = (*OnChainBudget)(nil)
)

const (
	// OnChainBudgetName is the string identifier of the OnChainBudgetMgr
	// rule.
	OnChainBudgetName = "on-chain-budget"

	// spentKey is the key that will be used in the persisted KV store to
	// store the total amount that has been spent.
	spentKey = "onchain-spent-amt"

	// pendingKey is the key that will be used in the persisted KV store to
	// keep track of the total pending spent amount.
	pendingKey = "onchain-pending-amt"

	// memoPrefix is the prefix that will be used to identify the request
	// prefix in the memo field.
	memoPrefix = "onBudget"
)

// OnChainBudgetMgr manages the OnChainBudget rule. See docs/onchain_budget.md
// for more information on the rule.
type OnChainBudgetMgr struct {
	// The mutex is used to ensure that only one Enforcer created by the
	// manager can run the HandleRequest and HandleResponse functions at
	// any given time. This prevents db entry race conditions.
	sync.Mutex
}

// Stop cleans up the resources held by the manager.
//
// NOTE: This is part of the Manager interface.
func (o *OnChainBudgetMgr) Stop() error {
	return nil
}

// NewEnforcer constructs a new OnChainBudgetEnforcer rule enforcer using the
// passed values and config.
//
// NOTE: This is part of the Manager interface.
func (o *OnChainBudgetMgr) NewEnforcer(_ context.Context, cfg Config,
	values Values) (Enforcer, error) {

	budget, ok := values.(*OnChainBudget)
	if !ok {
		return nil, fmt.Errorf("values must be of type "+
			"OnChainBudget, got %T", values)
	}

	return &OnChainBudgetEnforcer{
		onChainBudgetConfig: cfg,
		OnChainBudget:       budget,
		OnChainBudgetMgr:    o,
	}, nil
}

// NewValueFromProto converts the given proto value into a OnChainBudget Values
// object.
//
// NOTE: This is part of the Manager interface.
func (o *OnChainBudgetMgr) NewValueFromProto(v *litrpc.RuleValue) (Values,
	error) {

	rv, ok := v.Value.(*litrpc.RuleValue_OnChainBudget)
	if !ok {
		return nil, fmt.Errorf("incorrect RuleValue type %T", v.Value)
	}

	budget := rv.OnChainBudget

	return &OnChainBudget{
		AbsoluteAmtSats: budget.AbsoluteAmtSats,
		MaxSatPerVByte:  budget.MaxSatPerVByte,
	}, nil
}

// EmptyValue returns a new instance of OnChainBudget.
//
// NOTE: This is part of the Manager interface.
func (o *OnChainBudgetMgr) EmptyValue() Values {
	return &OnChainBudget{}
}

// onChainBudgetConfig is the config required by OnChainBudgetMgr. It can be
// derived from the main rules Config struct.
type onChainBudgetConfig interface {
	GetStores() firewalldb.KVStores
	GetReqID() int64
	GetLndConnID() string
}

// OnChainBudgetEnforcer enforces requests and responses against a
// OnChainBudget rule.
type OnChainBudgetEnforcer struct {
	onChainBudgetConfig
	*OnChainBudget
	*OnChainBudgetMgr
}

// HandleRequest checks the validity of a request using the OnChainBudgetMgr
// rpcmiddleware.RoundTripCheckers.
//
// NOTE: this is part of the Rule interface.
func (o *OnChainBudgetEnforcer) HandleRequest(ctx context.Context, uri string,
	msg proto.Message) (proto.Message, error) {

	o.Lock()
	defer o.Unlock()

	checkers := o.checkers()
	if checkers == nil {
		return nil, nil
	}

	checker, ok := checkers[uri]
	if !ok {
		return nil, nil
	}

	if !checker.HandlesRequest(msg.ProtoReflect().Type()) {
		return nil, fmt.Errorf("invalid implementation, checker "+
			"for URI %s does not accept request of type %v",
			uri, msg.ProtoReflect().Type())
	}

	return checker.HandleRequest(ctx, msg)
}

// HandleResponse handles and possible alters a response.
//
// NOTE: this is part of the Rule interface.
func (o *OnChainBudgetEnforcer) HandleResponse(ctx context.Context, uri string,
	msg proto.Message) (proto.Message, error) {

	o.Lock()
	defer o.Unlock()

	checkers := o.checkers()
	if checkers == nil {
		return nil, nil
	}

	checker, ok := checkers[uri]
	if !ok {
		return nil, nil
	}

	if !checker.HandlesResponse(msg.ProtoReflect().Type()) {
		return nil, fmt.Errorf("invalid implementation, checker for "+
			"URI %s does not accept response of type %v", uri,
			msg.ProtoReflect().Type())
	}

	return checker.HandleResponse(ctx, msg)
}

// HandleErrorResponse handles and possible alters an error. This can be used to
// roll back any budget changes made by the request.
//
// NOTE: this is part of the Enforcer interface.
func (o *OnChainBudgetEnforcer) HandleErrorResponse(ctx context.Context,
	uri string, respErr error) (error, error) {

	o.Lock()
	defer o.Unlock()

	checkers := o.checkers()
	if checkers == nil {
		return nil, nil
	}

	checker, ok := checkers[uri]
	if !ok {
		return nil, nil
	}

	return checker.HandleErrorResponse(ctx, respErr)
}

// checkers returns a map of URI to rpcmiddleware.RoundTripChecker which define
// how the URI should be handled.
func (o *OnChainBudgetEnforcer) checkers() map[string]mid.RoundTripChecker {
	// handleOpenChannelError is a helper function which handles the error
	// returned for all the channel opening endpoints.
	handleOpenChannelError := func(ctx context.Context,
		respErr error) (error, error) {

		err := o.cancelPendingPayment(ctx)
		if err != nil {
			return nil, err
		}

		return respErr, nil
	}

	return map[string]mid.RoundTripChecker{
		"/lnrpc.Lightning/OpenChannelSync": mid.NewFullRewriter(
			&lnrpc.OpenChannelRequest{},
			&lnrpc.ChannelPoint{},
			o.handleOpenChannelRequest,
			func(ctx context.Context,
				r *lnrpc.ChannelPoint) (proto.Message, error) {

				err := o.handlePaymentConfirmed(ctx)
				if err != nil {
					return nil, err
				}

				return r, nil
			},
			handleOpenChannelError,
		),
		"/lnrpc.Lightning/BatchOpenChannel": mid.NewFullRewriter(
			&lnrpc.BatchOpenChannelRequest{},
			&lnrpc.BatchOpenChannelResponse{},
			o.handleBatchOpenChannelRequest,
			func(ctx context.Context,
				r *lnrpc.BatchOpenChannelResponse) (
				proto.Message, error) {

				err := o.handlePaymentConfirmed(ctx)
				if err != nil {
					return nil, err
				}

				return r, nil
			},
			handleOpenChannelError,
		),
		"/lnrpc.Lightning/ListChannels": mid.NewResponseRewriter(
			&lnrpc.ListChannelsRequest{},
			&lnrpc.ListChannelsResponse{},
			func(ctx context.Context, r *lnrpc.ListChannelsResponse) (
				proto.Message, error) {

				// We remove any potentially added memos for
				// privacy reasons.
				for _, c := range r.Channels {
					c.Memo = removeReqId(c.Memo)
				}

				return r, nil
			},
			handleOpenChannelError,
		),
		"/lnrpc.Lightning/PendingChannels": mid.NewResponseRewriter(
			&lnrpc.PendingChannelsRequest{},
			&lnrpc.PendingChannelsResponse{},
			func(ctx context.Context, r *lnrpc.PendingChannelsResponse) (
				proto.Message, error) {

				// We remove any potentially added memos for
				// privacy reasons.
				for _, c := range r.PendingOpenChannels {
					c.Channel.Memo = removeReqId(
						c.Channel.Memo,
					)
				}

				for _, c := range r.WaitingCloseChannels {
					c.Channel.Memo = removeReqId(
						c.Channel.Memo,
					)
				}

				for _, c := range r.PendingForceClosingChannels {
					c.Channel.Memo = removeReqId(
						c.Channel.Memo,
					)
				}

				for _, c := range r.PendingClosingChannels {
					c.Channel.Memo = removeReqId(
						c.Channel.Memo,
					)
				}

				return r, nil
			},
			handleOpenChannelError,
		),
		// ClosedChannels doesn't have any memos to remove.
	}
}

// OnChainBudget are the static values that determine the on-chain budget.
type OnChainBudget struct {
	AbsoluteAmtSats uint64 `json:"absolute_amt_sats"`
	MaxSatPerVByte  uint64 `json:"max_sat_per_v_byte"`
}

// VerifySane checks that the value of the values is ok given the min and max
// allowed values.
//
// NOTE: this is part of the Values interface.
func (o *OnChainBudget) VerifySane(minVal, _ Values) error {
	minOCB, ok := minVal.(*OnChainBudget)
	if !ok {
		return fmt.Errorf("min value is not of type OnChainBudget")
	}

	if o.AbsoluteAmtSats < minOCB.AbsoluteAmtSats {
		return fmt.Errorf("on-chain budget is below the minimum " +
			"required amount")
	}

	if o.MaxSatPerVByte < minOCB.MaxSatPerVByte {
		return fmt.Errorf("on-chain fee rate limit is below the " +
			"minimum required amount")
	}

	return nil
}

// RuleName returns the name of the rule that these values are to be used with.
//
// NOTE: this is part of the Values interface.
func (o *OnChainBudget) RuleName() string {
	return OnChainBudgetName
}

// ToProto converts the rule Values to the litrpc counterpart.
//
// NOTE: this is part of the Values interface.
func (o *OnChainBudget) ToProto() *litrpc.RuleValue {
	return &litrpc.RuleValue{
		Value: &litrpc.RuleValue_OnChainBudget{
			OnChainBudget: &litrpc.OnChainBudget{
				AbsoluteAmtSats: o.AbsoluteAmtSats,
				MaxSatPerVByte:  o.MaxSatPerVByte,
			},
		},
	}
}

// PseudoToReal attempts to convert any appropriate pseudo fields in the rule
// Values to their corresponding real values. It uses the passed PrivacyMapDB to
// find the real values. This is a no-op for the OnChainBudget rule.
//
// NOTE: this is part of the Values interface.
func (o *OnChainBudget) PseudoToReal(_ context.Context,
	_ firewalldb.PrivacyMapDB, _ session.PrivacyFlags) (Values, error) {

	return o, nil
}

// RealToPseudo converts the rule Values to a new one that uses pseudo keys,
// channel IDs, channel points etc. It returns a map of real to pseudo strings
// that should be persisted. This is a no-op for the OnChainBudget rule.
//
// NOTE: this is part of the Values interface.
func (o *OnChainBudget) RealToPseudo(_ context.Context,
	_ firewalldb.PrivacyMapReader, _ session.PrivacyFlags) (Values,
	map[string]string, error) {

	return o, nil, nil
}

// checkFeeRate is a helper function that returns an error if the given fee rate
// exceeds the maximum allowed by the rule that the enforcer is enforcing.
func (o *OnChainBudgetEnforcer) checkFeeRate(satPerVByte uint64) error {
	if satPerVByte > o.MaxSatPerVByte {
		return fmt.Errorf("max fee rate exceeded")
	}
	return nil
}

// formatReqId creates a unique identifier for the request that can be used to
// associate the action across request-response handling.
func formatReqId(lndConnID string, reqID int64) string {
	return fmt.Sprintf("%s-%s-%d", memoPrefix, lndConnID, reqID)
}

// removeReqId removes the request ID from the memo if present.
func removeReqId(memo string) string {
	// We divide the memo into two parts, one before and one after the
	// prefix marker.
	prefixIdx := strings.Index(memo, memoPrefix)
	if prefixIdx == -1 {
		return memo
	}

	front := memo[:prefixIdx]
	back := memo[prefixIdx:]

	// We expect to find a (first) colon after the request memo prefix.
	colonIdx := strings.Index(back, ":")
	if colonIdx == -1 {
		return memo
	}

	// Check that the memo prefix is of the correct format.
	idParts := strings.Split(back[:colonIdx], "-")
	if len(idParts) != 3 {
		return memo
	}

	if len(idParts[1]) != LndConnIdLen {
		return memo
	}

	// Check that second part is a number.
	if _, err := strconv.ParseInt(idParts[2], 10, 64); err != nil {
		return memo
	}

	return front + back[colonIdx+1:]
}

// handleOpenChannelRequest is a helper function which handles the request for
// opening a single channel.
func (o *OnChainBudgetEnforcer) handleOpenChannelRequest(ctx context.Context,
	r *lnrpc.OpenChannelRequest) (proto.Message, error) {

	if r.FundMax {
		return nil, fmt.Errorf("max funding not supported")
	}

	if len(r.Outpoints) > 0 {
		return nil, fmt.Errorf("outpoints not supported")
	}

	if r.TargetConf != 0 {
		return nil, fmt.Errorf("target conf not supported")
	}

	err := o.checkFeeRate(r.SatPerVbyte)
	if err != nil {
		return nil, err
	}

	// Derive a unique identifier for the request to be able to associate it
	// with the response.
	uniqueReqID := formatReqId(o.GetLndConnID(), o.GetReqID())

	// Prepend an identifier to later be able to check the action's outcome.
	// Note that this is not guaranteed to be immutable in LND.
	r.Memo = fmt.Sprintf("%s:%s", uniqueReqID, r.Memo)

	amt := uint64(r.LocalFundingAmount + r.PushSat)
	err = o.handlePendingPayment(
		ctx,
		&onChainAction{
			Amount:     amt,
			ActionType: actionTypeOpenChannel,
		},
		uniqueReqID,
	)
	if err != nil {
		return nil, err
	}

	return r, nil
}

// handleBatchOpenChannelRequest is a helper function which handles the request
// for opening a multiple channels.
func (o *OnChainBudgetEnforcer) handleBatchOpenChannelRequest(
	ctx context.Context, r *lnrpc.BatchOpenChannelRequest) (proto.Message,
	error) {

	if r.TargetConf != 0 {
		return nil, fmt.Errorf("target conf " +
			"not supported")
	}

	err := o.checkFeeRate(uint64(r.SatPerVbyte))
	if err != nil {
		return nil, err
	}

	// Derive a unique identifier for the request to be able to associate it
	// with the response.
	uniqueReqID := formatReqId(o.GetLndConnID(), o.GetReqID())

	// A batch open channel request can contain multiple channels, so we
	// need to sum up the total amount. This operation is atomic since we
	// publish a single transaction.
	var totalAmt int64
	for _, c := range r.Channels {
		totalAmt += c.LocalFundingAmount + c.PushSat

		// Prepend an identifier to later be able to check the action's
		// outcome. Note that this is not guaranteed to be immutable in
		// LND.
		c.Memo = fmt.Sprintf("%s:%s", uniqueReqID, c.Memo)
	}

	err = o.handlePendingPayment(
		ctx, &onChainAction{
			Amount:     uint64(totalAmt),
			ActionType: actionTypeOpenChannel,
		},
		uniqueReqID,
	)
	if err != nil {
		return nil, err
	}

	return r, nil
}

// handlePendingPayment checks if a payment for the given amount can be afforded
// given the current budget. If it can, the amount is added to the pending
// amount. Note that only one goroutine should have access to this function at
// a time in order to prevent race conditions.
func (o *OnChainBudgetEnforcer) handlePendingPayment(ctx context.Context,
	request *onChainAction, reqID string) error {

	return o.GetStores().Update(ctx, func(ctx context.Context,
		tx firewalldb.KVStoreTx) error {

		// First, we fetch the current state of the budget.
		spent, pending, err := o.getBudgetState(ctx, tx)
		if err != nil {
			return err
		}

		// Check that spending amt would not exceed the budget given the
		// amount already spent as well as any pending amount.
		if spent.Amount+pending.Amount+request.Amount >
			o.AbsoluteAmtSats {

			return fmt.Errorf("action with %v sat exceeds budget "+
				"limit %v sat (%v sat used, %v spent, %v "+
				"pending)", request.Amount, o.AbsoluteAmtSats,
				spent.Amount+pending.Amount, spent.Amount,
				pending.Amount)
		}

		// If all the above check passes, then we can now update our
		// budget state with the new amount. Since this is an inflight
		// payment, only our pending amounts will change.
		return o.addPendingAmt(ctx, tx, pending, request, reqID)
	})
}

type onChainState struct {
	Amount uint64 `json:"amount"`
}

// actionType is the type of action that the amount is associated with when
// handling some onchain payment. This can be used to identify endpoints to look
// up when dealing with pending payments. This type may differ for different
// checkers.
type actionType int

const (
	// actionTypeOpenChannel is the action type for opening a channel.
	actionTypeOpenChannel actionType = 0
)

type onChainAction struct {
	// Amount is the onchain amount of the action.
	Amount uint64 `json:"amount"`

	// ActionType is the type of action that the amount is associated with.
	ActionType actionType `json:"type"`
}

// cancelPendingPayment removes the pending amount for the current request ID
// from the temporary store. This is called when a request fails or is
// cancelled.
func (o *OnChainBudgetEnforcer) cancelPendingPayment(
	ctx context.Context) error {

	return o.GetStores().Update(ctx, func(ctx context.Context,
		tx firewalldb.KVStoreTx) error {

		// First, we get our current budget state.
		_, pending, err := o.getBudgetState(ctx, tx)
		if err != nil {
			return err
		}

		store := tx.Local()

		// We use the request ID to fetch the pending spend amount.
		uniqueReqID := formatReqId(o.GetLndConnID(), o.GetReqID())
		reqPref := fmt.Sprintf("%s:%s", pendingKey, uniqueReqID)

		reqBytes, err := store.Get(ctx, reqPref)
		if err != nil {
			return err
		}

		// If we can't find anything, then we assume it has already been
		// accounted for.
		if len(reqBytes) == 0 {
			return nil
		}

		// If we did find an entry, we can now delete it.
		err = store.Del(ctx, reqPref)
		if err != nil {
			return err
		}

		var request onChainAction
		if err := json.Unmarshal(reqBytes, &request); err != nil {
			return err
		}

		// Now, we subtract the reqAmt from total pending amt and store
		// it.
		if pending.Amount < request.Amount {
			return fmt.Errorf("total pending cannot be less " +
				"than requested amount")
		}
		pending.Amount -= request.Amount

		b, err := json.Marshal(pending)
		if err != nil {
			return err
		}

		return store.Set(ctx, pendingKey, b)
	})
}

// handlePaymentConfirmed moves any pending amount for a specific request ID
// into the persisted store.
func (o *OnChainBudgetEnforcer) handlePaymentConfirmed(
	ctx context.Context) error {

	return o.GetStores().Update(ctx, func(ctx context.Context,
		tx firewalldb.KVStoreTx) error {

		// First, we get our current budget state.
		complete, pending, err := o.getBudgetState(ctx, tx)
		if err != nil {
			return err
		}

		store := tx.Local()

		// We use the request ID to fetch the pending spend amount.
		uniqueReqID := formatReqId(o.GetLndConnID(), o.GetReqID())
		reqPref := fmt.Sprintf("%s:%s", pendingKey, uniqueReqID)

		reqBytes, err := store.Get(ctx, reqPref)
		if err != nil {
			return err
		}

		// Some requests can have multiple responses. So if we can't
		// find an entry in the store corresponding to the given request
		// ID, then we assume it has already been accounted for.
		if len(reqBytes) == 0 {
			return nil
		}

		// If we did find an entry, we can now delete it.
		err = store.Del(ctx, reqPref)
		if err != nil {
			return err
		}

		var request onChainAction
		if err := json.Unmarshal(reqBytes, &request); err != nil {
			return err
		}

		// Now, we subtract the reqAmt from total pending amt and store
		// it.
		if pending.Amount < request.Amount {
			return fmt.Errorf("total pending cannot be less than " +
				"requested amount")
		}
		pending.Amount -= request.Amount

		b, err := json.Marshal(pending)
		if err != nil {
			return err
		}

		err = store.Set(ctx, pendingKey, b)
		if err != nil {
			return err
		}

		// Finally, we add the amount to the total spent and persist it
		// to the permanent store.
		complete.Amount += request.Amount
		b, err = json.Marshal(complete)
		if err != nil {
			return err
		}

		return store.Set(ctx, spentKey, b)
	})
}

// getBudgetState fetches the current state of the budget by getting the total
// amount along with the total pending amount.
func (o *OnChainBudgetEnforcer) getBudgetState(ctx context.Context,
	tx firewalldb.KVStoreTx) (*onChainState, *onChainState, error) {

	var (
		spentAmt   onChainState
		pendingAmt onChainState
	)

	store := tx.Local()

	spentBytes, err := store.Get(ctx, spentKey)
	if err != nil {
		return nil, nil, err
	}

	pendingBytes, err := store.Get(ctx, pendingKey)
	if err != nil {
		return nil, nil, err
	}

	if len(spentBytes) != 0 {
		err := json.Unmarshal(spentBytes, &spentAmt)
		if err != nil {
			return nil, nil, err
		}
	}

	if len(pendingBytes) != 0 {
		err := json.Unmarshal(pendingBytes, &pendingAmt)
		if err != nil {
			return nil, nil, err
		}
	}

	return &spentAmt, &pendingAmt, nil
}

// addPendingAmt updates the store with the new amount. The total pending amount
// is updated, and a request specific entry is added so that we know how much to
// adjust our budget by if this request where to succeed or fail.
func (o *OnChainBudgetEnforcer) addPendingAmt(ctx context.Context,
	tx firewalldb.KVStoreTx, pending *onChainState,
	request *onChainAction, reqID string) error {

	store := tx.Local()

	b, err := json.Marshal(
		&onChainState{Amount: pending.Amount + request.Amount},
	)
	if err != nil {
		return err
	}

	// Construct the unique key for this request.
	reqPref := fmt.Sprintf("%s:%s", pendingKey, reqID)

	// Check that we don't already have a pending payment for this request.
	reqBytes, err := store.Get(ctx, reqPref)
	if err != nil {
		return err
	}

	if len(reqBytes) != 0 {
		return fmt.Errorf("pending payment already exists for "+
			"request ID %s", reqID)
	}

	err = store.Set(ctx, pendingKey, b)
	if err != nil {
		return err
	}

	b, err = json.Marshal(request)
	if err != nil {
		return err
	}

	return store.Set(ctx, reqPref, b)
}
