package firewall

import (
	"fmt"
	"strings"

	"github.com/lightninglabs/lightning-terminal/accounts"
	litmac "github.com/lightninglabs/lightning-terminal/macaroons"
	"github.com/lightninglabs/lightning-terminal/session"
	"github.com/lightningnetwork/lnd/fn"
	"github.com/lightningnetwork/lnd/lnrpc"
	"google.golang.org/grpc/metadata"
	"gopkg.in/macaroon.v2"
)

const (
	// MWRequestTypeStreamAuth represents the type name for a stream
	// authentication interception message.
	MWRequestTypeStreamAuth = "stream_auth"

	// MWRequestTypeRequest represents the type name for a request
	// interception message.
	MWRequestTypeRequest = "request"

	// MWRequestTypeResponse represents the type name for a response
	// interception message.
	MWRequestTypeResponse = "response"
)

// RequestInfo stores the parsed representation of an incoming RPC middleware
// request.
type RequestInfo struct {
	SessionID       fn.Option[session.ID]
	AccountID       fn.Option[accounts.AccountID]
	MsgID           uint64
	RequestID       uint64
	MWRequestType   string
	URI             string
	GRPCMessageType string
	IsError         bool
	Serialized      []byte
	Streaming       bool
	Macaroon        *macaroon.Macaroon
	Caveats         []string
	MetaInfo        *InterceptMetaInfo
	Rules           *InterceptRules
	WithPrivacy     bool
}

// NewInfoFromRequest parses the given RPC middleware interception request and
// returns a RequestInfo struct.
func NewInfoFromRequest(req *lnrpc.RPCMiddlewareRequest) (*RequestInfo, error) {
	var ri *RequestInfo
	switch t := req.InterceptType.(type) {
	case *lnrpc.RPCMiddlewareRequest_StreamAuth:
		ri = &RequestInfo{
			MWRequestType: MWRequestTypeStreamAuth,
			URI:           t.StreamAuth.MethodFullUri,
			Streaming:     true,
		}

	case *lnrpc.RPCMiddlewareRequest_Request:
		ri = &RequestInfo{
			MWRequestType:   MWRequestTypeRequest,
			URI:             t.Request.MethodFullUri,
			GRPCMessageType: t.Request.TypeName,
			IsError:         t.Request.IsError,
			Serialized:      t.Request.Serialized,
			Streaming:       t.Request.StreamRpc,
		}

	case *lnrpc.RPCMiddlewareRequest_Response:
		ri = &RequestInfo{
			MWRequestType:   MWRequestTypeResponse,
			URI:             t.Response.MethodFullUri,
			GRPCMessageType: t.Response.TypeName,
			IsError:         t.Response.IsError,
			Serialized:      t.Response.Serialized,
			Streaming:       t.Response.StreamRpc,
		}

	default:
		return nil, fmt.Errorf("invalid request type: %T", t)
	}

	md := make(metadata.MD)
	for k, vs := range req.MetadataPairs {
		for _, v := range vs.Values {
			md.Append(k, v)
		}
	}

	sessionID, err := session.FromGRPCMetadata(md)
	if err != nil {
		return nil, fmt.Errorf("error extracting session ID "+
			"from request: %v", err)
	}

	ri.MsgID = req.MsgId
	ri.RequestID = req.RequestId
	ri.SessionID = sessionID

	// If there is no macaroon in the request, then there is nothing left
	// to parse.
	if len(req.RawMacaroon) == 0 {
		// A request that claims a session ID but presents no macaroon
		// can never be bound to that session, so we reject it.
		if ri.SessionID.IsSome() {
			return nil, fmt.Errorf("session ID found in gRPC " +
				"metadata but no macaroon present")
		}

		return ri, nil
	}

	ri.Macaroon = &macaroon.Macaroon{}
	if err := ri.Macaroon.UnmarshalBinary(req.RawMacaroon); err != nil {
		return nil, fmt.Errorf("error parsing macaroon: %v", err)
	}

	// The session ID transmitted via gRPC metadata is controlled by the
	// client and must therefore never be trusted on its own. If one is
	// set, the presented macaroon must be the session macaroon of that
	// very session.
	if err := bindSessionToMacaroon(ri.SessionID, ri.Macaroon); err != nil {
		return nil, err
	}

	ri.Caveats = make([]string, len(ri.Macaroon.Caveats()))
	for idx, cav := range ri.Macaroon.Caveats() {
		ri.Caveats[idx] = string(cav.Id)

		// Apply any meta information sent as a custom caveat. Only the
		// last one will be considered if there are multiple caveats.
		metaInfo, err := ParseMetaInfoCaveat(ri.Caveats[idx])
		if err == nil {
			ri.MetaInfo = metaInfo

			// The same caveat can't be a meta info and a rule list
			// or a privacy caveat.
			continue
		}

		// Also apply the rule list sent as a custom caveat. Only the
		// last set of rules will be considered if there are multiple
		// caveats.
		rules, err := ParseRuleCaveat(ri.Caveats[idx])
		if err == nil {
			ri.Rules = rules

			// The same caveat can't be a rule list and a privacy
			// caveat.
			continue
		}

		if IsPrivacyCaveat(ri.Caveats[idx]) {
			ri.WithPrivacy = true
		}
	}

	ri.AccountID, err = accounts.IDFromCaveats(ri.Macaroon.Caveats())
	if err != nil {
		return nil, fmt.Errorf("error extracting account ID "+
			"from macaroon: %v", err)
	}

	return ri, nil
}

// bindSessionToMacaroon verifies that if a session ID is set, the given
// macaroon is the session macaroon of that very session, meaning the session
// ID encoded in the macaroon's root key ID matches the claimed session ID.
func bindSessionToMacaroon(sessionID fn.Option[session.ID],
	mac *macaroon.Macaroon) error {

	if sessionID.IsNone() {
		return nil
	}

	rootKeyID, err := litmac.RootKeyIDFromMacaroon(mac)
	if err != nil {
		return fmt.Errorf("error extracting root key ID from "+
			"macaroon: %v", err)
	}

	if !litmac.IsSuperMacaroonRootKeyID(rootKeyID) {
		return fmt.Errorf("macaroon with session ID in gRPC " +
			"metadata is not a session macaroon")
	}

	macSessionID := session.IDFromMacRootKeyID(rootKeyID)
	if macSessionID != sessionID.UnwrapOr(session.ID{}) {
		return fmt.Errorf("session ID in gRPC metadata does not " +
			"match the macaroon's session")
	}

	return nil
}

// String returns the string representation of the request info struct.
func (ri *RequestInfo) String() string {
	return fmt.Sprintf("Request={msg_id=%d, request_id=%d, type=%v, "+
		"uri=%v, grpc_message_type=%v, streaming=%v, caveats=[%v], "+
		"meta_info=%v, rules=[%v]}",
		ri.MsgID, ri.RequestID, ri.MWRequestType, ri.URI,
		ri.GRPCMessageType, ri.Streaming, strings.Join(ri.Caveats, ","),
		ri.MetaInfo, ri.Rules)
}
