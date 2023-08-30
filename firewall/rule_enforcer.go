package firewall

import (
	"context"
	"fmt"

	"github.com/lightninglabs/lightning-terminal/firewalldb"
	"github.com/lightninglabs/lightning-terminal/perms"
	mid "github.com/lightninglabs/lightning-terminal/rpcmiddleware"
	"github.com/lightninglabs/lightning-terminal/rules"
	"github.com/lightninglabs/lightning-terminal/session"
	"github.com/lightninglabs/lndclient"
	"github.com/lightningnetwork/lnd/lnrpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/proto"
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
	ruleDB            firewalldb.RulesDB
	actionsDB         firewalldb.ActionReadDBGetter
	sessionIDIndexDB  session.IDToGroupIndex
	markActionErrored func(reqID uint64, reason string) error
	newPrivMap        firewalldb.NewPrivacyMapDB

	permsMgr        *perms.Manager
	getFeaturePerms featurePerms

	nodeID [33]byte

	routerClient lndclient.RouterClient
	lndClient    lndclient.LightningClient

	ruleMgrs rules.ManagerSet
}

// featurePerms defines the signature of a function that can be used to fetch
// feature permissions.
type featurePerms func(ctx context.Context) (map[string]map[string]bool, error)

// NewRuleEnforcer constructs a new RuleEnforcer instance.
func NewRuleEnforcer(ruleDB firewalldb.RulesDB,
	actionsDB firewalldb.ActionReadDBGetter,
	sessionIDIndex session.IDToGroupIndex,
	getFeaturePerms featurePerms, permsMgr *perms.Manager, nodeID [33]byte,
	routerClient lndclient.RouterClient,
	lndClient lndclient.LightningClient, ruleMgrs rules.ManagerSet,
	markActionErrored func(reqID uint64, reason string) error,
	privMap firewalldb.NewPrivacyMapDB) *RuleEnforcer {

	return &RuleEnforcer{
		ruleDB:            ruleDB,
		actionsDB:         actionsDB,
		permsMgr:          permsMgr,
		getFeaturePerms:   getFeaturePerms,
		nodeID:            nodeID,
		routerClient:      routerClient,
		lndClient:         lndClient,
		ruleMgrs:          ruleMgrs,
		markActionErrored: markActionErrored,
		newPrivMap:        privMap,
		sessionIDIndexDB:  sessionIDIndex,
	}
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
func (r *RuleEnforcer) Intercept(ctx context.Context,
	req *lnrpc.RPCMiddlewareRequest) (*lnrpc.RPCMiddlewareResponse, error) {

	ri, err := NewInfoFromRequest(req)
	if err != nil {
		return nil, fmt.Errorf("error parsing incoming RPC middleware "+
			"interception request: %v", err)
	}

	if ri.Rules == nil {
		return mid.RPCOk(req)
	}

	log.Tracef("RuleEnforcer: Intercepting %v", ri)

	if ri.MetaInfo == nil {
		return mid.RPCErrString(req, "missing MetaInfo")
	}

	// Ensure that the specified feature name is one listed in the macaroon.
	featureName := ri.MetaInfo.Feature
	_, ok := ri.Rules.FeatureRules[featureName]
	if len(ri.Rules.FeatureRules) != 0 && !ok {
		return mid.RPCErrString(req, "feature %s does not correspond "+
			"to a feature specified in the macaroon caveat",
			featureName)
	}

	// Ensure that the feature specified in the MetaInfo is one that we
	// know about from our last interaction with the Autopilot server.
	featurePerms, err := r.getFeaturePerms(ctx)
	if err != nil {
		return mid.RPCErrString(req, "unable to get feature "+
			"permissions")
	}

	perms, ok := featurePerms[featureName]
	if !ok {
		return mid.RPCErrString(req, "feature %s is not a known "+
			"feature", featureName)
	}

	// Then check that this URI is allowed given the list of perms the
	// Autopilot told us this feature could use.
	if !perms[ri.URI] {
		return mid.RPCErrString(req, "Method %s is not allowed for "+
			"feature %s", ri.URI, featureName)
	}

	switch ri.MWRequestType {
	case MWRequestTypeStreamAuth:
		return mid.RPCOk(req)

	// Parse incoming requests and act on them.
	case MWRequestTypeRequest:
		replacement, err := r.handleRequest(ctx, ri)
		if err != nil {
			dbErr := r.markActionErrored(ri.RequestID, err.Error())
			if dbErr != nil {
				log.Error("could not mark action for "+
					"request ID %d as Errored: %v",
					ri.RequestID, dbErr)
			}

			return mid.RPCErr(req, err)
		}

		// No error occurred but the request should be replaced with
		// the given custom request. Wrap it in the correct RPC
		// request of the interceptor now.
		if replacement != nil {
			return mid.RPCReplacement(req, replacement)
		}

		// No error and no replacement, just return an empty request of
		// the correct type.
		return mid.RPCOk(req)

	// Parse and possibly manipulate outgoing responses.
	case MWRequestTypeResponse:
		if ri.IsError {
			replacementErr, err := r.handleErrorResponse(ctx, ri)
			if err != nil {
				return mid.RPCErr(req, err)
			}

			// No error occurred but the response error should be
			// replaced with the given custom error. Wrap it in the
			// correct RPC response of the interceptor now.
			if replacementErr != nil {
				return mid.RPCErrReplacement(
					req, replacementErr,
				)
			}

			// No error and no replacement, just return an empty
			// response of the correct type.
			return mid.RPCOk(req)
		}

		replacement, err := r.handleResponse(ctx, ri)
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

// handleRequest gathers the rules that will need to enforced for the given
// feature and runs the request against each of those.
func (r *RuleEnforcer) handleRequest(ctx context.Context,
	ri *RequestInfo) (proto.Message, error) {

	sessionID, err := session.IDFromMacaroon(ri.Macaroon)
	if err != nil {
		return nil, fmt.Errorf("could not extract ID from macaroon")
	}

	groupID, err := r.sessionIDIndexDB.GetGroupID(sessionID)
	if err != nil {
		return nil, err
	}

	rules, err := r.collectEnforcers(ri, groupID)
	if err != nil {
		return nil, fmt.Errorf("error parsing rules: %v", err)
	}

	msg, err := mid.ParseProtobuf(
		ri.GRPCMessageType, ri.Serialized,
	)
	if err != nil {
		return nil, fmt.Errorf("error parsing proto: %v", err)
	}

	for _, rule := range rules {
		newRequest, err := rule.HandleRequest(ctx, ri.URI, msg)
		if err != nil {
			st := status.Errorf(
				codes.ResourceExhausted, "rule violation: %v",
				err,
			)
			return nil, st
		}

		if newRequest != nil {
			msg = newRequest
		}
	}

	return nil, nil
}

// handleResponse gathers the rules that will need to be enforced for the given
// feature and runs the response against each of those.
func (r *RuleEnforcer) handleResponse(ctx context.Context,
	ri *RequestInfo) (proto.Message, error) {

	sessionID, err := session.IDFromMacaroon(ri.Macaroon)
	if err != nil {
		return nil, fmt.Errorf("could not extract ID from macaroon")
	}

	groupID, err := r.sessionIDIndexDB.GetGroupID(sessionID)
	if err != nil {
		return nil, err
	}

	enforcers, err := r.collectEnforcers(ri, groupID)
	if err != nil {
		return nil, fmt.Errorf("error parsing rules: %v", err)
	}

	msg, err := mid.ParseProtobuf(ri.GRPCMessageType, ri.Serialized)
	if err != nil {
		return nil, fmt.Errorf("error parsing proto: %v", err)
	}

	for _, enforcer := range enforcers {
		newResponse, err := enforcer.HandleResponse(ctx, ri.URI, msg)
		if err != nil {
			return nil, err
		}

		if newResponse != nil {
			msg = newResponse
		}
	}

	return msg, nil
}

// handleErrorResponse gathers the rules that will need to be enforced for the
// given feature and runs the response error against each of those.
func (r *RuleEnforcer) handleErrorResponse(ctx context.Context,
	ri *RequestInfo) (error, error) {

	sessionID, err := session.IDFromMacaroon(ri.Macaroon)
	if err != nil {
		return nil, fmt.Errorf("could not extract ID from macaroon")
	}

	groupID, err := r.sessionIDIndexDB.GetGroupID(sessionID)
	if err != nil {
		return nil, err
	}

	enforcers, err := r.collectEnforcers(ri, groupID)
	if err != nil {
		return nil, fmt.Errorf("error parsing rules: %v", err)
	}

	parsedErr := mid.ParseResponseErr(ri.Serialized)

	for _, enforcer := range enforcers {
		newErr, err := enforcer.HandleErrorResponse(
			ctx, ri.URI, parsedErr,
		)
		if err != nil {
			return nil, err
		}

		if newErr != nil {
			parsedErr = newErr
		}
	}

	return parsedErr, nil
}

// collectRule initialises and returns all the Rules that need to be enforced
// for the given request.
func (r *RuleEnforcer) collectEnforcers(ri *RequestInfo, groupID session.ID) (
	[]rules.Enforcer, error) {

	ruleEnforcers := make(
		[]rules.Enforcer, 0,
		len(ri.Rules.FeatureRules)+len(ri.Rules.SessionRules),
	)

	for rule, value := range ri.Rules.FeatureRules[ri.MetaInfo.Feature] {
		r, err := r.initRule(
			ri.RequestID, rule, []byte(value), ri.MetaInfo.Feature,
			groupID, false, ri.WithPrivacy,
		)
		if err != nil {
			return nil, err
		}

		ruleEnforcers = append(ruleEnforcers, r)
	}

	return ruleEnforcers, nil
}

// initRule initialises a rule.Rule with any required config values.
func (r *RuleEnforcer) initRule(reqID uint64, name string, value []byte,
	featureName string, groupID session.ID, sessionRule,
	privacy bool) (rules.Enforcer, error) {

	ruleValues, err := r.ruleMgrs.InitRuleValues(name, value)
	if err != nil {
		return nil, err
	}

	if privacy {
		privMap := r.newPrivMap(groupID)
		ruleValues, err = ruleValues.PseudoToReal(privMap)
		if err != nil {
			return nil, fmt.Errorf("could not prepare rule "+
				"value: %v", err)
		}
	}

	allActionsDB := r.actionsDB.GetActionsReadDB(groupID, featureName)
	actionsDB := allActionsDB.GroupFeatureActionsDB()
	rulesDB := r.ruleDB.GetKVStores(name, groupID, featureName)

	if sessionRule {
		actionsDB = allActionsDB.GroupActionsDB()
		rulesDB = r.ruleDB.GetKVStores(name, groupID, "")
	}

	cfg := &rules.ConfigImpl{
		Stores:       rulesDB,
		ActionsDB:    actionsDB,
		MethodPerms:  r.permsMgr.URIPermissions,
		NodeID:       r.nodeID,
		RouterClient: r.routerClient,
		LndClient:    r.lndClient,
		ReqID:        int64(reqID),
	}

	return r.ruleMgrs.InitEnforcer(cfg, name, ruleValues)
}
