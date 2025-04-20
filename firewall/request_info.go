package firewall

import (
	"fmt"
	"strings"

	"github.com/lightninglabs/lightning-terminal/session"
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
	MDPairs         metadata.MD
}

// NewInfoFromRequest parses the given RPC middleware interception request and
// returns a RequestInfo struct.
func NewInfoFromRequest(req *lnrpc.RPCMiddlewareRequest) (*RequestInfo, error) {
	md := make(metadata.MD)
	for k, vs := range req.MetadataPairs {
		for _, v := range vs.Values {
			md.Append(k, v)
		}
	}

	var ri *RequestInfo
	switch t := req.InterceptType.(type) {
	case *lnrpc.RPCMiddlewareRequest_StreamAuth:
		ri = &RequestInfo{
			MWRequestType: MWRequestTypeStreamAuth,
			URI:           t.StreamAuth.MethodFullUri,
			Streaming:     true,
			MDPairs:       md,
		}

	case *lnrpc.RPCMiddlewareRequest_Request:
		ri = &RequestInfo{
			MWRequestType:   MWRequestTypeRequest,
			URI:             t.Request.MethodFullUri,
			GRPCMessageType: t.Request.TypeName,
			IsError:         t.Request.IsError,
			Serialized:      t.Request.Serialized,
			Streaming:       t.Request.StreamRpc,
			MDPairs:         md,
		}

	case *lnrpc.RPCMiddlewareRequest_Response:
		ri = &RequestInfo{
			MWRequestType:   MWRequestTypeResponse,
			URI:             t.Response.MethodFullUri,
			GRPCMessageType: t.Response.TypeName,
			IsError:         t.Response.IsError,
			Serialized:      t.Response.Serialized,
			Streaming:       t.Response.StreamRpc,
			MDPairs:         md,
		}

	default:
		return nil, fmt.Errorf("invalid request type: %T", t)
	}

	ri.MsgID = req.MsgId
	ri.RequestID = req.RequestId

	// If there is no macaroon in the request, then there is nothing left
	// to parse.
	if len(req.RawMacaroon) == 0 {
		return ri, nil
	}

	ri.Macaroon = &macaroon.Macaroon{}
	if err := ri.Macaroon.UnmarshalBinary(req.RawMacaroon); err != nil {
		return nil, fmt.Errorf("error parsing macaroon: %v", err)
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

	return ri, nil
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

func (ri *RequestInfo) extractSessionID() (session.ID, bool, error) {
	// First prize is to extract the session ID from the MD pairs.
	id, ok, err := session.FromGrpcMD(ri.MDPairs)
	if err != nil {
		return id, ok, err
	} else if ok {
		return id, ok, nil
	}

	// TODO(elle): This is a temporary workaround to support older versions
	// of LND that don't attach metadata pairs to the request.
	// We should remove this once we have bumped our minimum compatible
	// LND version to one that always attaches metadata pairs.
	// This is because the macaroon root key ID is not a reliable way of
	// extracting the session ID since the macaroon root key ID may also
	// be the first 4 bytes of an account ID and so collisions are possible
	// here.

	// Otherwise, fall back to extracting the session ID from the macaroon.
	if ri.Macaroon == nil {
		return session.ID{}, false, nil
	}

	id, err = session.IDFromMacaroon(ri.Macaroon)
	if err != nil {
		return session.ID{}, false, fmt.Errorf("could not extract "+
			"ID from macaroon: %w", err)
	}

	return id, true, nil
}
