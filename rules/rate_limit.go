package rules

import (
	"context"
	"fmt"
	"time"

	"github.com/lightninglabs/lightning-terminal/firewalldb"
	"github.com/lightninglabs/lightning-terminal/litrpc"
	"google.golang.org/protobuf/proto"
	"gopkg.in/macaroon-bakery.v2/bakery"
)

var (
	// Compile-time checks to ensure that RateLimit, RateLimitMgr
	// and RateLimitEnforcer implement the appropriate Manager, Enforcer
	// and Values interface.
	_ Manager  = (*RateLimitMgr)(nil)
	_ Enforcer = (*RateLimitEnforcer)(nil)
	_ Values   = (*RateLimit)(nil)
)

// RateLimitName is the string identifier of the RateLimitMgr values.
const RateLimitName = "rate-limit"

// RateLimitMgr represents the rate limit values.
type RateLimitMgr struct{}

// Stop cleans up the resources held by the manager.
//
// NOTE: This is part of the Manager interface.
func (r *RateLimitMgr) Stop() error {
	return nil
}

// NewEnforcer constructs a new RateLimit rule enforcer using the passed values
// and config.
//
// NOTE: This is part of the Manager interface.
func (r *RateLimitMgr) NewEnforcer(cfg Config, values Values) (Enforcer,
	error) {

	limits, ok := values.(*RateLimit)
	if !ok {
		return nil, fmt.Errorf("values must be of type "+
			"RateLimit, got %T", values)
	}

	return &RateLimitEnforcer{
		rateLimitConfig: cfg,
		RateLimit:       limits,
	}, nil
}

// NewValueFromProto converts the given proto value into a RateLimit Value
// object.
//
// NOTE: This is part of the Manager interface.
func (r *RateLimitMgr) NewValueFromProto(v *litrpc.RuleValue) (Values, error) {
	rv, ok := v.Value.(*litrpc.RuleValue_RateLimit)
	if !ok {
		return nil, fmt.Errorf("incorrect RuleValue type")
	}

	budget := rv.RateLimit
	readLim := budget.ReadLimit
	writeLim := budget.WriteLimit

	return &RateLimit{
		ReadLimit: &Rate{
			Iterations: readLim.Iterations,
			NumHours:   readLim.NumHours,
		},
		WriteLimit: &Rate{
			Iterations: writeLim.Iterations,
			NumHours:   writeLim.NumHours,
		},
	}, nil
}

// EmptyValue returns a new RateLimit instance.
func (r *RateLimitMgr) EmptyValue() Values {
	return &RateLimit{}
}

// rateLimitConfig is the config required by RateLimitMgr. It can be derived
// from the main rules Config struct.
type rateLimitConfig interface {
	GetActionsDB() firewalldb.ActionsDB
	GetMethodPerms() func(string) ([]bakery.Op, bool)
}

// RateLimitEnforcer enforces requests and responses against a RateLimit rule.
type RateLimitEnforcer struct {
	rateLimitConfig
	*RateLimit
}

// HandleResponse handles and possible alters a response. This is a noop for the
// RateLimitMgr values.
//
// NOTE: this is part of the Rule interface.
func (r *RateLimitEnforcer) HandleResponse(_ context.Context, _ string,
	_ proto.Message) (proto.Message, error) {

	return nil, nil
}

// HandleRequest checks the validity of a request. It checks if the request is a
// read or a write request. Then, using the past actions DB, it determines if
// letting this request through would violate the rate limit rules.
//
// NOTE: this is part of the Rule interface.
func (r *RateLimitEnforcer) HandleRequest(ctx context.Context, uri string,
	_ proto.Message) (proto.Message, error) {

	// First, we need to classify if this is a read or write call.
	read := r.isRead(uri)

	// Based on the above, we can extract the relevant rate limit values
	// that apply for this call.
	rateLim := r.WriteLimit
	if read {
		rateLim = r.ReadLimit
	}

	// Now we need to go and count all the previous read or write actions.
	actions, err := r.GetActionsDB().ListActions(ctx)
	if err != nil {
		return nil, err
	}

	// Determine the start time of the actions window.
	startTime := time.Now().Add(
		-time.Duration(rateLim.NumHours) * time.Hour,
	)

	// Now count all relevant actions which have taken place after the
	// start time.
	var count uint32
	for _, action := range actions {
		if read != r.isRead(action.Method) {
			continue
		}

		if action.PerformedAt.Before(startTime) {
			continue
		}

		count++
	}

	if count >= rateLim.Iterations {
		return nil, fmt.Errorf("too many requests received")
	}

	return nil, nil
}

// HandleErrorResponse handles and possible alters an error. This is a noop for
// the RateLimitEnforcer rule.
//
// NOTE: this is part of the Enforcer interface.
func (r *RateLimitEnforcer) HandleErrorResponse(_ context.Context, _ string,
	_ error) (error, error) {

	return nil, nil
}

// isRead is a helper that returns true if the given method/URI only requires
// read-permissions and false otherwise.
func (r *RateLimitEnforcer) isRead(method string) bool {
	perms, ok := r.GetMethodPerms()(method)
	if !ok {
		return false
	}

	for _, p := range perms {
		if p.Action != "read" {
			return false
		}
	}
	return true
}

// Rate describes a rate limit in iterations per number of hours.
type Rate struct {
	Iterations uint32 `json:"iterations"`
	NumHours   uint32 `json:"num_hours"`
}

// RateLimit represents the rules values.
type RateLimit struct {
	WriteLimit *Rate `json:"write_limit"`
	ReadLimit  *Rate `json:"read_limit"`
}

// VerifySane checks that the value of the values is ok given the min and max
// allowed values.
//
// NOTE: this is part of the Values interface.
func (r *RateLimit) VerifySane(minVal, maxVal Values) error {
	minRL, ok := minVal.(*RateLimit)
	if !ok {
		return fmt.Errorf("min value is not of type RateLimit")
	}

	maxRL, ok := maxVal.(*RateLimit)
	if !ok {
		return fmt.Errorf("max value is not of type RateLimit")
	}

	// Check that our read limit is between the min and max.
	if r.ReadLimit.lessThan(minRL.ReadLimit) ||
		maxRL.ReadLimit.lessThan(r.ReadLimit) {

		return fmt.Errorf("read limit is not between the min and max")
	}

	// Check that our write limit is between the min and max.
	if r.WriteLimit.lessThan(minRL.WriteLimit) ||
		maxRL.WriteLimit.lessThan(r.WriteLimit) {

		return fmt.Errorf("write limit is not between the min and max")
	}

	return nil
}

// lessThan is a helper function that checks if the current rate is less than
// another rate.
func (r *Rate) lessThan(other *Rate) bool {
	return float64(r.Iterations)/float64(r.NumHours) <
		float64(other.Iterations)/float64(other.NumHours)
}

// RuleName returns the name of the rule that these values are to be used with.
//
// NOTE: this is part of the Values interface.
func (r *RateLimit) RuleName() string {
	return RateLimitName
}

// ToProto converts the rule Values to the litrpc counterpart.
//
// NOTE: this is part of the Values interface.
func (r *RateLimit) ToProto() *litrpc.RuleValue {
	return &litrpc.RuleValue{
		Value: &litrpc.RuleValue_RateLimit{
			RateLimit: &litrpc.RateLimit{
				ReadLimit: &litrpc.Rate{
					Iterations: r.ReadLimit.Iterations,
					NumHours:   r.ReadLimit.NumHours,
				},
				WriteLimit: &litrpc.Rate{
					Iterations: r.WriteLimit.Iterations,
					NumHours:   r.WriteLimit.NumHours,
				},
			},
		},
	}
}

// PseudoToReal attempts to convert any appropriate pseudo fields in the rule
// Values to their corresponding real values. It uses the passed PrivacyMapDB to
// find the real values. This is a no-op for the RateLimit rule.
//
// NOTE: this is part of the Values interface.
func (r *RateLimit) PseudoToReal(_ firewalldb.PrivacyMapDB) (Values,
	error) {

	return r, nil
}

// RealToPseudo converts the rule Values to a new one that uses pseudo keys,
// channel IDs, channel points etc. It returns a map of real to pseudo strings
// that should be persisted. This is a no-op for the RateLimit rule.
//
// NOTE: this is part of the Values interface.
func (r *RateLimit) RealToPseudo(_ firewalldb.PrivacyMapReader) (Values,
	map[string]string, error) {

	return r, nil, nil
}
