package rules

import (
	"context"
	"fmt"
	"math"

	"github.com/lightninglabs/lightning-terminal/firewalldb"
	"github.com/lightninglabs/lightning-terminal/litrpc"
	mid "github.com/lightninglabs/lightning-terminal/rpcmiddleware"
	"github.com/lightninglabs/lightning-terminal/session"
	"github.com/lightningnetwork/lnd/lnrpc"
	"google.golang.org/protobuf/proto"
)

var (
	// Compile-time checks to ensure that ChanPolicyBounds and
	// ChanPolicyBoundsMgr implement the appropriate Manager, Enforcer and
	// Values interface.
	_ Manager  = (*ChanPolicyBoundsMgr)(nil)
	_ Enforcer = (*ChanPolicyBounds)(nil)
	_ Values   = (*ChanPolicyBounds)(nil)
)

// ChanPolicyBoundsName is the string identifier of the ChanPolicyBounds rule.
const ChanPolicyBoundsName = "channel-policy-bounds"

// ChanPolicyBoundsMgr manages the ChanPolicyBounds rule.
type ChanPolicyBoundsMgr struct{}

// Stop cleans up the resources held by the manager.
//
// NOTE: This is part of the Manager interface.
func (b *ChanPolicyBoundsMgr) Stop() error {
	return nil
}

// NewEnforcer constructs a new ChanPolicyBounds rule enforcer using the passed
// values and config.
//
// NOTE: This is part of the Manager interface.
func (b *ChanPolicyBoundsMgr) NewEnforcer(_ Config, values Values) (Enforcer,
	error) {

	bounds, ok := values.(*ChanPolicyBounds)
	if !ok {
		return nil, fmt.Errorf("values must be of type "+
			"ChanPolicyBounds, got %T", values)
	}

	return bounds, nil
}

// NewValueFromProto converts the given proto value into a ChanPolicyBounds
// Value object.
//
// NOTE: This is part of the Manager interface.
func (b *ChanPolicyBoundsMgr) NewValueFromProto(value *litrpc.RuleValue) (
	Values, error) {

	rv, ok := value.Value.(*litrpc.RuleValue_ChanPolicyBounds)
	if !ok {
		return nil, fmt.Errorf("incorrect RuleValue type")
	}

	policyBounds := rv.ChanPolicyBounds

	return &ChanPolicyBounds{
		MinBaseMsat:  policyBounds.MinBaseMsat,
		MaxBaseMsat:  policyBounds.MaxBaseMsat,
		MinRatePPM:   policyBounds.MinRatePpm,
		MaxRatePPM:   policyBounds.MaxRatePpm,
		MinCLTVDelta: policyBounds.MinCltvDelta,
		MaxCLTVDelta: policyBounds.MaxCltvDelta,
		MinHtlcMsat:  policyBounds.MinHtlcMsat,
		MaxHtlcMsat:  policyBounds.MaxHtlcMsat,
	}, nil
}

// EmptyValue returns a new instance of ChanPolicyBounds.
//
// NOTE: This is part of the Manager interface.
func (b *ChanPolicyBoundsMgr) EmptyValue() Values {
	return &ChanPolicyBounds{}
}

// ChanPolicyBounds represents the channel policy bounds rule.
type ChanPolicyBounds struct {
	// MinBaseMsat is the minimum base fee in msat that can set for a
	// channel.
	MinBaseMsat uint64 `json:"min_base_msat"`

	// MaxBaseMsat is the maximum base fee in msat that can set for a
	// channel.
	MaxBaseMsat uint64 `json:"max_base_msat"`

	// MinRatePPM is the minimum ppm fee in msat that can be set for a
	// channel.
	MinRatePPM uint32 `json:"min_rate_ppm"`

	// MaxRatePPM is the maximum ppm fee in msat that can be set for a
	// channel.
	MaxRatePPM uint32 `json:"max_rate_ppm"`

	// MinCLTVDelta is the minimum cltv delta that may set for a channel.
	MinCLTVDelta uint32 `json:"min_cltv_delta"`

	// MaxCLTVDelta is the maximum cltv delta that may set for a channel.
	MaxCLTVDelta uint32 `json:"max_cltv_delta"`

	// MinHtlcMsat is the minimum htlc size msat that may set for a channel.
	MinHtlcMsat uint64 `json:"min_htlc_msat"`

	// MaxHtlcMsat is the maximum htlc size in msat that may be set for a
	// channel.
	MaxHtlcMsat uint64 `json:"max_htlc_msat"`
}

// HandleRequest checks the validity of a request using the ChanPolicyBounds
// rpcmiddleware.RoundTripCheckers.
//
// NOTE: this is part of the Enforcer interface.
func (f *ChanPolicyBounds) HandleRequest(ctx context.Context, uri string,
	msg proto.Message) (proto.Message, error) {

	checkers := f.checkers()
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
// ChanPolicyBounds rule.
//
// NOTE: this is part of the Enforcer interface.
func (f *ChanPolicyBounds) HandleResponse(_ context.Context, _ string,
	_ proto.Message) (proto.Message, error) {

	return nil, nil
}

// HandleErrorResponse handles and possible alters an error. This is a noop for
// the ChanPolicyBounds rule.
//
// NOTE: this is part of the Enforcer interface.
func (f *ChanPolicyBounds) HandleErrorResponse(_ context.Context, _ string,
	_ error) (error, error) {

	return nil, nil
}

// checkers returns a map of URI to rpcmiddleware.RoundTripChecker which define
// how the URI should be handled.
func (f *ChanPolicyBounds) checkers() map[string]mid.RoundTripChecker {
	return map[string]mid.RoundTripChecker{
		"/lnrpc.Lightning/UpdateChannelPolicy": mid.NewRequestChecker(
			&lnrpc.PolicyUpdateRequest{},
			&lnrpc.PolicyUpdateResponse{},
			func(ctx context.Context,
				r *lnrpc.PolicyUpdateRequest) error {

				return f.checkPolicyUpdate(ctx, r)
			},
		),
		"/lnrpc.Lightning/OpenChannelSync": mid.NewRequestChecker(
			&lnrpc.OpenChannelRequest{},
			&lnrpc.ChannelPoint{},
			func(ctx context.Context,
				r *lnrpc.OpenChannelRequest) error {

				return f.checkOpenChannelRequestFee(ctx, r)
			},
		),
		"/lnrpc.Lightning/BatchOpenChannel": mid.NewRequestChecker(
			&lnrpc.BatchOpenChannelRequest{},
			&lnrpc.BatchOpenChannelResponse{},
			func(ctx context.Context,
				r *lnrpc.BatchOpenChannelRequest) error {

				return f.checkBatchOpenChannelRequestFee(ctx, r)
			},
		),
	}
}

// checkPolicyUpdate verifies that the given lnrpc.PolicyUpdateRequest request
// is valid given the ChanPolicyBounds values.
func (f *ChanPolicyBounds) checkPolicyUpdate(_ context.Context,
	req *lnrpc.PolicyUpdateRequest) error {

	if req.BaseFeeMsat < int64(f.MinBaseMsat) ||
		req.BaseFeeMsat > int64(f.MaxBaseMsat) {

		return fmt.Errorf("invalid base fee amount")
	}

	if req.FeeRate == 0 && req.FeeRatePpm == 0 && f.MinRatePPM > 0 {
		return fmt.Errorf("invalid fee rate")
	}

	feeRate := req.FeeRatePpm
	if req.FeeRate != 0 {
		feeRate = uint32(math.Round(req.FeeRate * 1000000))
	}

	if feeRate < f.MinRatePPM || feeRate > f.MaxRatePPM {
		return fmt.Errorf("invalid fee rate")
	}

	if req.TimeLockDelta < f.MinCLTVDelta ||
		req.TimeLockDelta > f.MaxCLTVDelta {

		return fmt.Errorf("invalid cltv delta")
	}

	if req.MinHtlcMsatSpecified {
		if req.MinHtlcMsat < f.MinHtlcMsat {
			return fmt.Errorf("invalid min htlc msat amount")
		}
	}

	if req.MaxHtlcMsat > f.MaxHtlcMsat {
		return fmt.Errorf("invalid max htlc msat amount")
	}

	return nil
}

// checkOpenChannelRequest verifies that the given lnrpc.OpenChannelRequest is
// valid given the ChannelConstraint values.
// Note: the onchain fee rate is checked by the onchain budget rule.
func (f *ChanPolicyBounds) checkOpenChannelRequestFee(_ context.Context,
	req *lnrpc.OpenChannelRequest) error {

	return checkOpenRequestFee(f, req)
}

// checkBatchOpenChannelRequest verifies that the given
// lnrpc.BatchOpenChannelRequest is valid for each individual channel requested
// given the ChannelConstraint values.
// Note: the onchain fee rate is checked by the onchain budget rule.
func (f *ChanPolicyBounds) checkBatchOpenChannelRequestFee(_ context.Context,
	req *lnrpc.BatchOpenChannelRequest) error {

	// We check that each channel in the batch request is valid.
	for _, openReq := range req.Channels {
		err := checkOpenRequestFee(f, openReq)
		if err != nil {
			return err
		}
	}

	return nil
}

// checkOpenRequestFee verifies that the given lnrpc.OpenChannelRequest is valid
// given the ChanPolicyBounds values.
func checkOpenRequestFee(f *ChanPolicyBounds, req ChanOpenReq) error {
	if req.GetUseBaseFee() {
		if req.GetBaseFee() < f.MinBaseMsat ||
			req.GetBaseFee() > f.MaxBaseMsat {

			return fmt.Errorf("invalid base fee amount")
		}
	}

	if req.GetUseFeeRate() {
		if req.GetFeeRate() > math.MaxUint32 {
			return fmt.Errorf("fee rate is too large")
		}

		if uint32(req.GetFeeRate()) < f.MinRatePPM ||
			uint32(req.GetFeeRate()) > f.MaxRatePPM {

			return fmt.Errorf("invalid fee rate")
		}
	}

	if req.GetMinHtlcMsat() < int64(f.MinHtlcMsat) ||
		req.GetMinHtlcMsat() > int64(f.MaxHtlcMsat) {

		return fmt.Errorf("invalid min htlc msat amount")
	}

	return nil
}

// VerifySane checks that the value of the values is ok given the min and max
// allowed values.
//
// NOTE: this is part of the Values interface.
func (f *ChanPolicyBounds) VerifySane(minVal, maxVal Values) error {
	minFB, ok := minVal.(*ChanPolicyBounds)
	if !ok {
		return fmt.Errorf("min value is not of type ChanPolicyBounds")
	}

	maxFB, ok := maxVal.(*ChanPolicyBounds)
	if !ok {
		return fmt.Errorf("max value is not of type ChanPolicyBounds")
	}

	if !(f.MinBaseMsat >= minFB.MinBaseMsat &&
		f.MinBaseMsat <= maxFB.MinBaseMsat) {

		return fmt.Errorf("invalid min base fee")
	}

	if !(f.MaxBaseMsat >= minFB.MaxBaseMsat &&
		f.MaxBaseMsat <= maxFB.MaxBaseMsat) {

		return fmt.Errorf("invalid max base fee")
	}

	if !(f.MinRatePPM >= minFB.MinRatePPM &&
		f.MinRatePPM <= maxFB.MinRatePPM) {

		return fmt.Errorf("invalid min proportional fee")
	}

	if !(f.MaxRatePPM >= minFB.MaxRatePPM &&
		f.MaxRatePPM <= maxFB.MaxRatePPM) {

		return fmt.Errorf("invalid max proportional fee")
	}

	if !(f.MinCLTVDelta >= minFB.MinCLTVDelta &&
		f.MinCLTVDelta <= maxFB.MinCLTVDelta) {

		return fmt.Errorf("invalid min cltv delta")
	}

	if !(f.MaxCLTVDelta >= minFB.MaxCLTVDelta &&
		f.MaxCLTVDelta <= maxFB.MaxCLTVDelta) {

		return fmt.Errorf("invalid max cltv delta")
	}

	if !(f.MinHtlcMsat >= minFB.MinHtlcMsat &&
		f.MinHtlcMsat <= maxFB.MinHtlcMsat) {

		return fmt.Errorf("invalid min htlc msat amt")
	}

	if !(f.MaxHtlcMsat >= minFB.MaxHtlcMsat &&
		f.MaxHtlcMsat <= maxFB.MaxHtlcMsat) {

		return fmt.Errorf("invalid max htlc msat amt")
	}

	return nil
}

// ToProto converts the rule Values to the litrpc counterpart.
//
// NOTE: this is part of the Values interface.
func (f *ChanPolicyBounds) ToProto() *litrpc.RuleValue {
	return &litrpc.RuleValue{
		Value: &litrpc.RuleValue_ChanPolicyBounds{
			ChanPolicyBounds: &litrpc.ChannelPolicyBounds{
				MinBaseMsat:  f.MinBaseMsat,
				MaxBaseMsat:  f.MaxBaseMsat,
				MinRatePpm:   f.MinRatePPM,
				MaxRatePpm:   f.MaxRatePPM,
				MinCltvDelta: f.MinCLTVDelta,
				MaxCltvDelta: f.MaxCLTVDelta,
				MinHtlcMsat:  f.MinHtlcMsat,
				MaxHtlcMsat:  f.MaxHtlcMsat,
			},
		},
	}
}

// RuleName returns the name of the rule that these values are to be used with.
//
// NOTE: this is part of the Values interface.
func (f *ChanPolicyBounds) RuleName() string {
	return ChanPolicyBoundsName
}

// PseudoToReal attempts to convert any appropriate pseudo fields in the rule
// Values to their corresponding real values. It uses the passed PrivacyMapDB to
// find the real values. This is a no-op for the ChanPolicyBounds rule.
//
// NOTE: this is part of the Values interface.
func (f *ChanPolicyBounds) PseudoToReal(_ firewalldb.PrivacyMapDB,
	_ session.PrivacyFlags) (Values, error) {

	return f, nil
}

// RealToPseudo converts the rule Values to a new one that uses pseudo keys,
// channel IDs, channel points etc. It returns a map of real to pseudo strings
// that should be persisted. This is a no-op for the ChanPolicyBounds rule.
//
// NOTE: this is part of the Values interface.
func (f *ChanPolicyBounds) RealToPseudo(_ firewalldb.PrivacyMapReader,
	_ session.PrivacyFlags) (Values, map[string]string, error) {

	return f, nil, nil
}
