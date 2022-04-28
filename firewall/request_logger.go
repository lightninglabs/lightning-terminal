package firewall

import (
	"context"
	"fmt"

	mid "github.com/lightninglabs/lightning-terminal/rpcmiddleware"
	"github.com/lightningnetwork/lnd/lnrpc"
)

const (
	// RequestLoggerName is the name of the RequestLogger interceptor.
	RequestLoggerName = "lit-macaroon-firewall-logger"
)

// A compile-time assertion that RuleEnforcer is a
// rpcmiddleware.RequestInterceptor.
var _ mid.RequestInterceptor = (*RequestLogger)(nil)

// RequestLogger is a RequestInterceptor that just logs incoming RPC requests.
type RequestLogger struct {
	// ObservedRequests is a list of all requests that were observed because
	// they contained additional meta information about their intent.
	//
	// TODO(guggero): Replace by persistent storage to keep a history for
	// the user.
	ObservedRequests []*RequestInfo
}

// Name returns the name of the interceptor.
func (r *RequestLogger) Name() string {
	return RequestLoggerName
}

// ReadOnly returns true if this interceptor should be registered in read-only
// mode. In read-only mode no custom caveat name can be specified.
func (r *RequestLogger) ReadOnly() bool {
	return true
}

// CustomCaveatName returns the name of the custom caveat that is expected to be
// handled by this interceptor. Cannot be specified in read-only mode.
func (r *RequestLogger) CustomCaveatName() string {
	return ""
}

// Intercept processes an RPC middleware interception request and returns the
// interception result which either accepts or rejects the intercepted message.
func (r *RequestLogger) Intercept(_ context.Context,
	req *lnrpc.RPCMiddlewareRequest) (*lnrpc.RPCMiddlewareResponse, error) {

	ri, err := NewInfoFromRequest(req)
	if err != nil {
		return nil, fmt.Errorf("error parsing incoming RPC middleware "+
			"interception request: %v", err)
	}

	log.Infof("RequestLogger: Intercepting %v", ri)

	// Persist the observed request if it is tagged with specific meta
	// information.
	if ri.MetaInfo != nil {
		r.ObservedRequests = append(r.ObservedRequests, ri)
	}

	// Send empty response, accepting the request.
	return mid.RPCOk(req)
}
