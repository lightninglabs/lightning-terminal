package firewall

import (
	"context"
	"fmt"

	mid "github.com/lightninglabs/lightning-terminal/rpcmiddleware"
	"github.com/lightningnetwork/lnd/lnrpc"
)

const (
	// RuleEnforcerName is the name of the RuleEnforcer interceptor.
	RuleEnforcerName = "lit-macaroon-firewall"
)

// A compile-time assertion that RuleEnforcer is a
// rpcmiddleware.RequestInterceptor.
var _ mid.RequestInterceptor = (*RuleEnforcer)(nil)

// RuleEnforcer is a RequestInterceptor that makes sure all firewall related
// custom caveats in a macaroon are properly enforced.
type RuleEnforcer struct {
}

// Name returns the name of the interceptor.
func (r *RuleEnforcer) Name() string {
	return RuleEnforcerName
}

// ReadOnly returns true if this interceptor should be registered in read-only
// mode. In read-only mode no custom caveat name can be specified.
func (r *RuleEnforcer) ReadOnly() bool {
	return false
}

// CustomCaveatName returns the name of the custom caveat that is expected to be
// handled by this interceptor. Cannot be specified in read-only mode.
func (r *RuleEnforcer) CustomCaveatName() string {
	return RuleEnforcerCaveat
}

// Intercept processes an RPC middleware interception request and returns the
// interception result which either accepts or rejects the intercepted message.
func (r *RuleEnforcer) Intercept(_ context.Context,
	req *lnrpc.RPCMiddlewareRequest) (*lnrpc.RPCMiddlewareResponse, error) {

	ri, err := NewInfoFromRequest(req)
	if err != nil {
		return nil, fmt.Errorf("error parsing incoming RPC middleware "+
			"interception request: %v", err)
	}

	log.Infof("Enforcing rule %v", ri)

	// Enforce actual rules.
	numRules := len(ri.Rules.SessionRules) + len(ri.Rules.FeatureRules)
	if numRules > 0 {
		// TODO(guggero): Implement rules and their enforcement.
		log.Debugf("There are %d rules to enforce", numRules)
	}

	// Send empty response, accepting the request.
	return mid.RPCOk(req)
}
