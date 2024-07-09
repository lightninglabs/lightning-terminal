package rules

import (
	"context"
	"fmt"

	"github.com/lightninglabs/lightning-terminal/firewalldb"
	"github.com/lightninglabs/lightning-terminal/litrpc"
	mid "github.com/lightninglabs/lightning-terminal/rpcmiddleware"
	"github.com/lightninglabs/lightning-terminal/session"
	"github.com/lightningnetwork/lnd/lnrpc"
	"google.golang.org/protobuf/proto"
)

var (
	// Compile-time checks to ensure that ChannelConstraint and
	// ChanConstraintMgr implement the appropriate Manager, Enforcer and
	// Values interface.
	_ Manager  = (*ChanConstraintMgr)(nil)
	_ Enforcer = (*ChannelConstraint)(nil)
	_ Values   = (*ChannelConstraint)(nil)
)

// ChanConstraintName is the string identifier of the ChannelConstraint rule.
const ChanConstraintName = "channel-constraint"

// ChanConstraintMgr manages the ChannelConstraint rule.
type ChanConstraintMgr struct{}

// Stop cleans up the resources held by the manager.
//
// NOTE: This is part of the Manager interface.
func (m *ChanConstraintMgr) Stop() error {
	return nil
}

// NewEnforcer constructs a new ChannelConstraint rule enforcer using the passed
// values and config.
//
// NOTE: This is part of the Manager interface.
func (m *ChanConstraintMgr) NewEnforcer(_ Config, values Values) (Enforcer,
	error) {

	bounds, ok := values.(*ChannelConstraint)
	if !ok {
		return nil, fmt.Errorf("values must be of type "+
			"ChannelConstraint, got %T", values)
	}

	return bounds, nil
}

// NewValueFromProto converts the given proto value into a ChannelConstraint
// Value object.
//
// NOTE: This is part of the Manager interface.
func (m *ChanConstraintMgr) NewValueFromProto(value *litrpc.RuleValue) (Values,
	error) {

	rv, ok := value.Value.(*litrpc.RuleValue_ChannelConstraint)
	if !ok {
		return nil, fmt.Errorf("incorrect RuleValue type %T",
			value.Value)
	}

	channelBounds := rv.ChannelConstraint

	return &ChannelConstraint{
		MinCapacitySat: channelBounds.MinCapacitySat,
		MaxCapacitySat: channelBounds.MaxCapacitySat,
		MaxPushSat:     channelBounds.MaxPushSat,
		PrivateAllowed: channelBounds.PrivateAllowed,
		PublicAllowed:  channelBounds.PublicAllowed,
	}, nil
}

// EmptyValue returns a new instance of ChannelConstraint.
//
// NOTE: This is part of the Manager interface.
func (m *ChanConstraintMgr) EmptyValue() Values {
	return &ChannelConstraint{}
}

// ChannelConstraint represents the channel opening constraint rule.
type ChannelConstraint struct {
	// MinCapacitySat is the minimum capacity in sat that can be set for a
	// channel's capacity.
	MinCapacitySat uint64 `json:"min_capacity_msat"`

	// MaxCapacitySat is the maximum capacity in sat that can be set for a
	// channel's capacity.
	MaxCapacitySat uint64 `json:"max_capacity_msat"`

	// MaxPushSat is the maximum push amount in satoshis that can be set for
	// channel opening.
	MaxPushSat uint64 `json:"max_push_sat"`

	// PrivateAllowed indicates that the constraint allow private channels.
	PrivateAllowed bool `json:"private_allowed"`

	// PublicAllowed indicates that the constraint allow public channels.
	PublicAllowed bool `json:"public_allowed"`
}

// HandleRequest checks the validity of a request using the ChannelConstraint
// rpcmiddleware.RoundTripCheckers.
//
// NOTE: this is part of the Enforcer interface.
func (e *ChannelConstraint) HandleRequest(ctx context.Context, uri string,
	msg proto.Message) (proto.Message, error) {

	checkers := e.checkers()
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

// HandleResponse handles and possible alters a response. This is a noop for the
// ChannelConstraint rule.
//
// NOTE: this is part of the Enforcer interface.
func (e *ChannelConstraint) HandleResponse(_ context.Context, _ string,
	msg proto.Message) (proto.Message, error) {

	return msg, nil
}

// HandleErrorResponse handles and possible alters an error. This is a noop for
// the ChannelConstraint rule.
//
// NOTE: this is part of the Enforcer interface.
func (e *ChannelConstraint) HandleErrorResponse(_ context.Context, _ string,
	err error) (error, error) {

	return err, nil
}

// checkers returns a map of URI to rpcmiddleware.RoundTripChecker which define
// how the URI should be handled.
func (e *ChannelConstraint) checkers() map[string]mid.RoundTripChecker {
	return map[string]mid.RoundTripChecker{
		"/lnrpc.Lightning/OpenChannelSync": mid.NewRequestChecker(
			&lnrpc.OpenChannelRequest{},
			&lnrpc.ChannelPoint{},
			func(ctx context.Context,
				r *lnrpc.OpenChannelRequest) error {

				return e.checkOpenChannelRequest(ctx, r)
			},
		),
		"/lnrpc.Lightning/BatchOpenChannel": mid.NewRequestChecker(
			&lnrpc.BatchOpenChannelRequest{},
			&lnrpc.BatchOpenChannelResponse{},
			func(ctx context.Context,
				r *lnrpc.BatchOpenChannelRequest) error {

				return e.checkBatchOpenChannelRequest(ctx, r)
			},
		),
	}
}

// checkOpenChannelRequest verifies that the given lnrpc.OpenChannelRequest is
// valid given the ChannelConstraint values.
// Note: the onchain fee rate is checked by the onchain budget rule.
func (e *ChannelConstraint) checkOpenChannelRequest(_ context.Context,
	req *lnrpc.OpenChannelRequest) error {

	return checkOpenRequest(e, req)
}

// checkBatchOpenChannelRequest verifies that the given
// lnrpc.BatchOpenChannelRequest is valid for each individual channel requested
// given the ChannelConstraint values.
// Note: the onchain fee rate is checked by the onchain budget rule.
func (e *ChannelConstraint) checkBatchOpenChannelRequest(_ context.Context,
	req *lnrpc.BatchOpenChannelRequest) error {

	// We check that each channel in the batch request is valid.
	for _, openReq := range req.Channels {
		err := checkOpenRequest(e, openReq)
		if err != nil {
			return err
		}
	}

	return nil
}

// ChanOpenReq represents either a BatchOpenChannel or OpenChannelRequest.
type ChanOpenReq interface {
	GetLocalFundingAmount() int64
	GetPushSat() int64
	GetCloseAddress() string
	GetPrivate() bool
	GetNodePubkey() []byte
	GetBaseFee() uint64
	GetUseBaseFee() bool
	GetFeeRate() uint64
	GetUseFeeRate() bool
	GetMinHtlcMsat() int64
}

// checkOpenRequest verifies that the given request is valid given the
// channel constraints.
func checkOpenRequest(e *ChannelConstraint, req ChanOpenReq) error {
	if req.GetPrivate() && !e.PrivateAllowed {
		return fmt.Errorf("private channels not allowed")
	}

	if !req.GetPrivate() && !e.PublicAllowed {
		return fmt.Errorf("public channels not allowed")
	}

	capacity := req.GetLocalFundingAmount() + req.GetPushSat()
	if capacity < int64(e.MinCapacitySat) ||
		capacity > int64(e.MaxCapacitySat) {

		return fmt.Errorf("invalid total capacity")
	}

	if req.GetPushSat() > int64(e.MaxPushSat) {
		return fmt.Errorf("invalid push sat")
	}

	// We don't allow a close address as this could be used to redirect
	// funds to an external wallet.
	if req.GetCloseAddress() != "" {
		return fmt.Errorf("close address is not allowed")
	}

	return nil
}

// VerifySane checks that the value of the values is ok given the min and max
// allowed values.
//
// NOTE: this is part of the Values interface.
func (v *ChannelConstraint) VerifySane(minVal, maxVal Values) error {
	minCC, ok := minVal.(*ChannelConstraint)
	if !ok {
		return fmt.Errorf("min value is not of type ChannelConstraint")
	}

	maxCC, ok := maxVal.(*ChannelConstraint)
	if !ok {
		return fmt.Errorf("max value is not of type ChannelConstraint")
	}

	if v.MinCapacitySat < minCC.MinCapacitySat ||
		v.MinCapacitySat > maxCC.MinCapacitySat {

		return fmt.Errorf("invalid min capacity")
	}

	if v.MaxCapacitySat < minCC.MaxCapacitySat ||
		v.MaxCapacitySat > maxCC.MaxCapacitySat {

		return fmt.Errorf("invalid max capacity")
	}

	if v.MaxPushSat < minCC.MaxPushSat || v.MaxPushSat > maxCC.MaxPushSat {
		return fmt.Errorf("invalid max push amount")
	}

	// Disallow creation of channel types if not allowed to set the values
	// according to the max.
	if v.PrivateAllowed && !maxCC.PrivateAllowed {
		return fmt.Errorf("private channels not allowed")
	}

	if v.PublicAllowed && !maxCC.PublicAllowed {
		return fmt.Errorf("public channels not allowed")
	}

	// Disallow setting false if min does not allow it.
	if !v.PrivateAllowed && minCC.PrivateAllowed {
		return fmt.Errorf("private channels must be allowed")
	}

	if !v.PublicAllowed && minCC.PublicAllowed {
		return fmt.Errorf("public channels must be allowed")
	}

	// To allow any channels, at least one of the channel types must be
	// allowed.
	if !v.PrivateAllowed && !v.PublicAllowed {
		return fmt.Errorf("at least one channel type must be allowed")
	}

	return nil
}

// ToProto converts the rule Values to the litrpc counterpart.
//
// NOTE: this is part of the Values interface.
func (v *ChannelConstraint) ToProto() *litrpc.RuleValue {
	return &litrpc.RuleValue{
		Value: &litrpc.RuleValue_ChannelConstraint{
			ChannelConstraint: &litrpc.ChannelConstraint{
				MinCapacitySat: v.MinCapacitySat,
				MaxCapacitySat: v.MaxCapacitySat,
				MaxPushSat:     v.MaxPushSat,
				PrivateAllowed: v.PrivateAllowed,
				PublicAllowed:  v.PublicAllowed,
			},
		},
	}
}

// RuleName returns the name of the rule that these values are to be used with.
//
// NOTE: this is part of the Values interface.
func (v *ChannelConstraint) RuleName() string {
	return ChanConstraintName
}

// PseudoToReal attempts to convert any appropriate pseudo fields in the rule
// Values to their corresponding real values. It uses the passed PrivacyMapDB to
// find the real values. This is a no-op for the ChannelConstraint rule.
//
// NOTE: this is part of the Values interface.
func (v *ChannelConstraint) PseudoToReal(_ firewalldb.PrivacyMapDB,
	_ session.PrivacyFlags) (Values, error) {

	return v, nil
}

// RealToPseudo converts the rule Values to a new one that uses pseudo keys,
// channel IDs, channel points etc. It returns a map of real to pseudo strings
// that should be persisted. This is a no-op for the ChannelConstraint rule.
//
// NOTE: this is part of the Values interface.
func (v *ChannelConstraint) RealToPseudo(_ firewalldb.PrivacyMapReader,
	_ session.PrivacyFlags) (Values, map[string]string, error) {

	return v, nil, nil
}
