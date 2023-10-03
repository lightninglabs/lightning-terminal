package firewall

import (
	"context"
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/lightninglabs/lightning-terminal/firewalldb"
	mid "github.com/lightninglabs/lightning-terminal/rpcmiddleware"
	"github.com/lightninglabs/lightning-terminal/session"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/macaroons"
)

const (
	// RequestLoggerName is the name of the RequestLogger interceptor.
	RequestLoggerName = "lit-macaroon-firewall-logger"
)

var (
	// uriSkipList is a map of URIs that we don't want to log or persist
	// actions for.
	uriSkipList = map[string]bool{
		// We skip the CheckMacaroonPermissions uri since this method is
		// called each time a call to a non-Litd endpoint needs to be
		// validated and persisting the macaroon each time bloats the
		// DB.
		"/lnrpc.Lightning/CheckMacaroonPermissions": true,
	}

	// A compile-time assertion that RuleEnforcer is a
	// rpcmiddleware.RequestInterceptor.
	_ mid.RequestInterceptor = (*RequestLogger)(nil)
)

type RequestLoggerLevel string

const (
	RequestLoggerLevelInterceptor = "interceptor"
	RequestLoggerLevelAll         = "all"
	RequestLoggerLevelFull        = "full"
)

// RequestLogger is a RequestInterceptor that just logs incoming RPC requests.
type RequestLogger struct {
	actionsDB firewalldb.ActionsWriteDB

	shouldLogAction func(ri *RequestInfo) (bool, bool)

	// reqIDToAction is a map from request ID to an ActionLocator that can
	// be used to find the corresponding action. This is used so that
	// requests and responses can be easily linked. The mu mutex must be
	// used when accessing this map.
	reqIDToAction map[uint64]*firewalldb.ActionLocator
	mu            sync.Mutex
}

// NewRequestLogger creates a new RequestLogger.
func NewRequestLogger(cfg *RequestLoggerConfig,
	actionsDB firewalldb.ActionsWriteDB) (*RequestLogger, error) {

	hasInterceptorCaveat := func(caveats []string) bool {
		for _, c := range caveats {
			if strings.HasPrefix(c, macaroons.CondLndCustom) {
				return true
			}
		}

		return false
	}

	var shouldLogAction func(ri *RequestInfo) (bool, bool)
	switch cfg.RequestLoggerLevel {
	// Only log requests that have an interceptor caveat attached.
	case RequestLoggerLevelInterceptor:
		shouldLogAction = func(ri *RequestInfo) (bool, bool) {
			if hasInterceptorCaveat(ri.Caveats) {
				return true, true
			}

			return false, false
		}

	// Log all requests but only log request params if the request
	// has an interceptor caveat.
	case RequestLoggerLevelAll:
		shouldLogAction = func(ri *RequestInfo) (bool, bool) {
			return true, hasInterceptorCaveat(ri.Caveats)
		}

	// Log all requests will all request parameters.
	case RequestLoggerLevelFull:
		shouldLogAction = func(ri *RequestInfo) (bool, bool) {
			return true, true
		}

	default:
		return nil, fmt.Errorf("unknown request logger level: %s. "+
			"Expected either 'interceptor', 'all' or 'full'",
			cfg.RequestLoggerLevel)
	}

	return &RequestLogger{
		shouldLogAction: shouldLogAction,
		actionsDB:       actionsDB,
		reqIDToAction:   make(map[uint64]*firewalldb.ActionLocator),
	}, nil
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

	// If this request is for any URI in the uriSkipList map, then we do not
	// log or persist it.
	if uriSkipList[ri.URI] {
		return mid.RPCOk(req)
	}

	shouldLogAction, withPayloadData := r.shouldLogAction(ri)
	if !shouldLogAction {
		return mid.RPCOk(req)
	}

	log.Tracef("RequestLogger: Intercepting %v", ri)

	switch ri.MWRequestType {
	case MWRequestTypeStreamAuth:
		return mid.RPCOk(req)

	// Parse incoming requests and act on them.
	case MWRequestTypeRequest:
		return mid.RPCErr(req, r.addNewAction(ri, withPayloadData))

	// Parse and possibly manipulate outgoing responses.
	case MWRequestTypeResponse:
		var (
			state     = firewalldb.ActionStateDone
			errReason string
		)
		if ri.IsError {
			state = firewalldb.ActionStateError
			errReason = mid.ParseResponseErr(ri.Serialized).Error()
		}

		return mid.RPCErr(
			req, r.MarkAction(ri.RequestID, state, errReason),
		)

	default:
		return mid.RPCErrString(req, "invalid intercept type: %v", r)
	}
}

// addNewAction persists the new action to the db.
func (r *RequestLogger) addNewAction(ri *RequestInfo,
	withPayloadData bool) error {

	// If no macaroon is provided, then an empty 4-byte array is used as the
	// session ID. Otherwise, the macaroon is used to derive a session ID.
	var sessionID [4]byte
	if ri.Macaroon != nil {
		var err error
		sessionID, err = session.IDFromMacaroon(ri.Macaroon)
		if err != nil {
			return fmt.Errorf("could not extract ID from macaroon")
		}
	}

	action := &firewalldb.Action{
		RPCMethod:   ri.URI,
		AttemptedAt: time.Now(),
		State:       firewalldb.ActionStateInit,
	}

	if withPayloadData {
		msg, err := mid.ParseProtobuf(ri.GRPCMessageType, ri.Serialized)
		if err != nil {
			return err
		}

		jsonBytes, err := lnrpc.ProtoJSONMarshalOpts.Marshal(msg)
		if err != nil {
			return fmt.Errorf("unable to decode response: %v", err)
		}

		action.RPCParamsJson = jsonBytes

		meta := ri.MetaInfo
		if meta != nil {
			action.ActorName = meta.ActorName
			action.FeatureName = meta.Feature
			action.Trigger = meta.Trigger
			action.Intent = meta.Intent
			action.StructuredJsonData = meta.StructuredJsonData
		}
	}

	id, err := r.actionsDB.AddAction(sessionID, action)
	if err != nil {
		return err
	}

	r.mu.Lock()
	r.reqIDToAction[ri.RequestID] = &firewalldb.ActionLocator{
		SessionID: sessionID,
		ActionID:  id,
	}
	r.mu.Unlock()

	return nil
}

// MarkAction can be used to set the state of an action identified by the given
// requestID.
func (r *RequestLogger) MarkAction(reqID uint64,
	state firewalldb.ActionState, errReason string) error {

	r.mu.Lock()
	defer r.mu.Unlock()

	actionLocator, ok := r.reqIDToAction[reqID]
	if !ok {
		return nil
	}
	delete(r.reqIDToAction, reqID)

	return r.actionsDB.SetActionState(actionLocator, state, errReason)
}
