package rules

import (
	"context"
	"fmt"
	"time"

	"github.com/lightninglabs/lightning-terminal/firewalldb"
	"github.com/lightninglabs/lightning-terminal/litrpc"
	mid "github.com/lightninglabs/lightning-terminal/rpcmiddleware"
	"github.com/lightningnetwork/lnd/lnrpc"
	"google.golang.org/protobuf/proto"
)

var (
	// Compile-time checks to ensure that HistoryLimit and HistoryLimitMgr
	// implement the appropriate Manager, Enforcer and Values interface.
	_ Manager  = (*HistoryLimitMgr)(nil)
	_ Enforcer = (*HistoryLimit)(nil)
	_ Values   = (*HistoryLimit)(nil)
)

// HistoryLimitName is the string identifier of the HistoryLimit rule.
const HistoryLimitName = "history-limit"

// HistoryLimitMgr manages the History limit rule.
type HistoryLimitMgr struct{}

// Stop cleans up the resources held by the manager.
//
// NOTE: This is part of the Manager interface.
func (h *HistoryLimitMgr) Stop() error {
	return nil
}

// NewEnforcer constructs a new HistoryLimit rule enforcer using the passed
// values and config.
//
// NOTE: This is part of the Manager interface.
func (h *HistoryLimitMgr) NewEnforcer(_ Config, values Values) (Enforcer,
	error) {

	limit, ok := values.(*HistoryLimit)
	if !ok {
		return nil, fmt.Errorf("values must be of type HistoryLimit, "+
			"got %T", values)
	}

	return limit, nil
}

// NewValueFromProto converts the given proto value into a HistoryLimit Value
// object.
//
// NOTE: This is part of the Manager interface.
func (h *HistoryLimitMgr) NewValueFromProto(v *litrpc.RuleValue) (Values,
	error) {

	rv, ok := v.Value.(*litrpc.RuleValue_HistoryLimit)
	if !ok {
		return nil, fmt.Errorf("incorrect RuleValue type")
	}

	historyLimit := rv.HistoryLimit

	if historyLimit.StartTime != 0 && historyLimit.Duration != 0 {
		return nil, fmt.Errorf("cant set both start time and duration")
	}

	if historyLimit.StartTime != 0 {
		return &HistoryLimit{
			StartDate: time.Unix(int64(historyLimit.StartTime), 0),
		}, nil
	}

	return &HistoryLimit{
		Duration: time.Second * time.Duration(historyLimit.Duration),
	}, nil
}

// EmptyValue returns a new HistoryLimit instance.
//
// NOTE: This is part of the Manager interface.
func (h *HistoryLimitMgr) EmptyValue() Values {
	return &HistoryLimit{}
}

// HistoryLimit represents the history-limit values.
type HistoryLimit struct {
	StartDate time.Time     `json:"start_date,omitempty"`
	Duration  time.Duration `json:"duration,omitempty"`
}

// HandleRequest checks the validity of a request using the HistoryLimit
// rpcmiddleware.RoundTripCheckers.
//
// NOTE: this is part of the Rule interface.
func (h *HistoryLimit) HandleRequest(ctx context.Context, uri string,
	msg proto.Message) (proto.Message, error) {

	checkers := h.checkers()
	if checkers == nil {
		return nil, nil
	}

	checker, ok := checkers[uri]
	if !ok {
		return nil, nil
	}

	if !checker.HandlesRequest(msg.ProtoReflect().Type()) {
		return nil, fmt.Errorf("invalid implementation, checker for "+
			"URI %s does not accept request of type %v", uri,
			msg.ProtoReflect().Type())
	}

	return checker.HandleRequest(ctx, msg)
}

// HandleResponse handles a response using the HistoryLimit
// rpcmiddleware.RoundTripCheckers.
//
// NOTE: this is part of the Rule interface.
func (h *HistoryLimit) HandleResponse(ctx context.Context, uri string,
	msg proto.Message) (proto.Message, error) {

	checkers := h.checkers()
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

// HandleErrorResponse handles and possible alters an error. This is a noop for
// the HistoryLimit rule.
//
// NOTE: this is part of the Enforcer interface.
func (h *HistoryLimit) HandleErrorResponse(_ context.Context, _ string,
	_ error) (error, error) {

	return nil, nil
}

// checkers returns a map of URI to rpcmiddleware.RoundTripChecker which define
// how the URI should be handled.
func (h *HistoryLimit) checkers() map[string]mid.RoundTripChecker {
	return map[string]mid.RoundTripChecker{
		"/lnrpc.Lightning/ForwardingHistory": mid.NewRequestChecker(
			&lnrpc.ForwardingHistoryRequest{},
			&lnrpc.ForwardingHistoryResponse{},
			func(ctx context.Context,
				r *lnrpc.ForwardingHistoryRequest) error {

				startDate := h.GetStartDate()

				if r.StartTime >= uint64(startDate.Unix()) {
					return nil
				}

				return fmt.Errorf("can't request a start "+
					"time before %s", startDate)
			},
		),
		"lnrpc.Lightning/ListInvoices": mid.NewResponseRewriter(
			&lnrpc.ListInvoiceRequest{},
			&lnrpc.ListInvoiceResponse{},
			func(ctx context.Context,
				r *lnrpc.ListInvoiceResponse) (proto.Message,
				error) {

				startDate := h.GetStartDate()
				var invoices []*lnrpc.Invoice
				for _, i := range r.Invoices {
					if i.CreationDate < startDate.Unix() {
						continue
					}

					invoices = append(invoices, i)
				}

				r.Invoices = invoices
				return r, nil
			}, mid.PassThroughErrorHandler,
		),
	}
}

// VerifySane checks that the value of the values is ok given the min and max
// allowed values.
//
// NOTE: this is part of the Values interface.
func (h *HistoryLimit) VerifySane(minVal, _ Values) error {
	minHL, ok := minVal.(*HistoryLimit)
	if !ok {
		return fmt.Errorf("min value is not of type HistoryLimit")
	}

	if !h.GetStartDate().Before(minHL.GetStartDate()) {
		minDur := time.Since(minHL.GetStartDate())
		return fmt.Errorf("history-limit start date not valid for "+
			"given the minimum required start date. Start date "+
			"should at least be %s or the duration should at "+
			"least be %s", minHL.GetStartDate(), minDur)
	}

	return nil
}

// RuleName returns the name of the rule that these values are to be used with.
//
// NOTE: this is part of the Values interface.
func (h *HistoryLimit) RuleName() string {
	return HistoryLimitName
}

// ToProto converts the rule Values to the litrpc counterpart.
//
// NOTE: this is part of the Values interface.
func (h *HistoryLimit) ToProto() *litrpc.RuleValue {
	return &litrpc.RuleValue{
		Value: &litrpc.RuleValue_HistoryLimit{
			HistoryLimit: &litrpc.HistoryLimit{
				StartTime: uint64(h.StartDate.Unix()),
				Duration:  uint64(h.Duration.Seconds()),
			},
		},
	}
}

// GetStartDate is a helper function that determines the start date of the values
// given if a start date is set or a max duration is given.
func (h *HistoryLimit) GetStartDate() time.Time {
	startDate := h.StartDate
	if h.StartDate.IsZero() {
		startDate = time.Now().Add(-h.Duration)
	}

	return startDate
}

// PseudoToReal attempts to convert any appropriate pseudo fields in the rule
// Values to their corresponding real values. It uses the passed PrivacyMapDB to
// find the real values. This is a no-op for the HistoryLimit rule.
//
// NOTE: this is part of the Values interface.
func (h *HistoryLimit) PseudoToReal(_ firewalldb.PrivacyMapDB) (Values,
	error) {

	return h, nil
}

// RealToPseudo converts the rule Values to a new one that uses pseudo keys,
// channel IDs, channel points etc. It returns a map of real to pseudo strings
// that should be persisted. This is a no-op for the HistoryLimit rule.
//
// NOTE: this is part of the Values interface.
func (h *HistoryLimit) RealToPseudo(_ firewalldb.PrivacyMapReader) (Values,
	map[string]string, error) {

	return h, nil, nil
}
