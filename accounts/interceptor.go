package accounts

import (
	"context"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"

	mid "github.com/lightninglabs/lightning-terminal/rpcmiddleware"
	"github.com/lightningnetwork/lnd/fn"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/macaroons"
	"google.golang.org/protobuf/proto"
	"gopkg.in/macaroon-bakery.v2/bakery/checkers"
	"gopkg.in/macaroon.v2"
)

const (
	// CondAccount is the custom caveat condition that binds a macaroon to a
	// certain account.
	CondAccount = "account"

	// accountMiddlewareName is the name that is used for the account system
	// when registering it to lnd as an RPC middleware.
	accountMiddlewareName = "lit-account"
)

var (
	// caveatPrefix is the prefix that is used for custom caveats that are
	// used by the account system. This prefix is used to identify the
	// custom caveat and extract the condition (the AccountID) from it.
	caveatPrefix = fmt.Appendf(nil,
		"%s %s ", macaroons.CondLndCustom, CondAccount,
	)
)

// Name returns the name of the interceptor.
func (s *InterceptorService) Name() string {
	return accountMiddlewareName
}

// ReadOnly returns true if this interceptor should be registered in read-only
// mode. In read-only mode no custom caveat name can be specified.
func (s *InterceptorService) ReadOnly() bool {
	return false
}

// CustomCaveatName returns the name of the custom caveat that is expected to be
// handled by this interceptor. Cannot be specified in read-only mode.
func (s *InterceptorService) CustomCaveatName() string {
	return CondAccount
}

// Intercept processes an RPC middleware interception request and returns the
// interception result which either accepts or rejects the intercepted message.
func (s *InterceptorService) Intercept(ctx context.Context,
	req *lnrpc.RPCMiddlewareRequest) (*lnrpc.RPCMiddlewareResponse, error) {

	// We only allow a single request or response to be handled at the same
	// time. This should already be serialized by the RPC stream itself, but
	// with the lock we prevent a new request to be handled before we finish
	// handling the previous one.
	s.requestMtx.Lock()
	defer s.requestMtx.Unlock()

	// If the account service is not running, we reject all requests.
	// Note that this is by no means a guarantee that the account service
	// will be running throughout processing the request, but at least we
	// can stop requests early if the service was already disabled when the
	// request came in.
	if !s.IsRunning() {
		return mid.RPCErrString(
			req, "the account service has been stopped",
		)
	}

	mac := &macaroon.Macaroon{}
	err := mac.UnmarshalBinary(req.RawMacaroon)
	if err != nil {
		return mid.RPCErrString(req, "error parsing macaroon: %v", err)
	}

	acctID, err := IDFromCaveats(mac.Caveats())
	if err != nil {
		return mid.RPCErrString(
			req, "error parsing account from macaroon: %v", err,
		)
	}

	// No account lock in the macaroon, something's weird. The interceptor
	// wouldn't have been triggered if there was no caveat, so we do expect
	// a macaroon here.
	accountID, err := acctID.UnwrapOrErr(
		fmt.Errorf("expected account ID in macaroon caveat"),
	)
	if err != nil {
		return mid.RPCErr(req, err)
	}

	acct, err := s.Account(ctx, accountID)
	if err != nil {
		return mid.RPCErrString(
			req, "error getting account %x: %v", accountID[:], err,
		)
	}

	log.Debugf("Account auth intercepted, ID=%x, balance_sat=%d, "+
		"expired=%v", acct.ID[:], acct.CurrentBalanceSats(),
		acct.HasExpired())

	if acct.HasExpired() {
		return mid.RPCErrString(
			req, "account %x has expired", acct.ID[:],
		)
	}

	// We now add the account and request ID to the incoming context to give
	// each checker access to them if required.
	ctx = AddAccountToContext(ctx, acct)
	ctx = AddRequestIDToContext(ctx, req.RequestId)

	switch r := req.InterceptType.(type) {
	// In the authentication phase we just check that the account hasn't
	// expired yet (which we already did). This is only be used for
	// establishing streams, so we don't see a request yet.
	case *lnrpc.RPCMiddlewareRequest_StreamAuth:
		return mid.RPCOk(req)

	// Parse incoming requests and act on them.
	case *lnrpc.RPCMiddlewareRequest_Request:
		msg, err := parseRPCMessage(r.Request)
		if err != nil {
			return mid.RPCErr(req, err)
		}

		return mid.RPCErr(req, s.checkers.checkIncomingRequest(
			ctx, r.Request.MethodFullUri, msg,
		))

	// Parse and possibly manipulate outgoing responses.
	case *lnrpc.RPCMiddlewareRequest_Response:
		if r.Response.IsError {
			parsedErr := mid.ParseResponseErr(r.Response.Serialized)

			replacementErr, err := s.checkers.handleErrorResponse(
				ctx, r.Response.MethodFullUri, parsedErr,
			)
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

		msg, err := parseRPCMessage(r.Response)
		if err != nil {
			return mid.RPCErr(req, err)
		}

		replacement, err := s.checkers.replaceOutgoingResponse(
			ctx, r.Response.MethodFullUri, msg,
		)
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

// parseRPCMessage parses a raw RPC message into the original protobuf message
// type.
func parseRPCMessage(msg *lnrpc.RPCMessage) (proto.Message, error) {
	// Are we intercepting an error message being returned?
	if msg.TypeName == "error" {
		return nil, errors.New(string(msg.Serialized))
	}

	// No, it's a normal message.
	parsedMsg, err := mid.ParseProtobuf(msg.TypeName, msg.Serialized)
	if err != nil {
		return nil, fmt.Errorf("error parsing proto of type %v: %w",
			msg.TypeName, err)
	}

	return parsedMsg, nil
}

// CaveatFromID creates a custom caveat that can be used to bind a macaroon to
// a certain account.
func CaveatFromID(id AccountID) macaroon.Caveat {
	condition := checkers.Condition(macaroons.CondLndCustom, fmt.Sprintf(
		"%s %x", CondAccount, id[:],
	))

	return macaroon.Caveat{Id: []byte(condition)}
}

// IDFromCaveats attempts to extract an AccountID from the given set of caveats
// by looking for the custom caveat that binds a macaroon to a certain account.
func IDFromCaveats(caveats []macaroon.Caveat) (fn.Option[AccountID], error) {
	var accountIDStr string
	for _, caveat := range caveats {
		// The caveat id has a format of
		// "lnd-custom [custom-caveat-name] [custom-caveat-condition]"
		// and we only want the condition part. If we match the prefix
		// part we return the condition that comes after the prefix.
		_, after, found := strings.Cut(
			string(caveat.Id), string(caveatPrefix),
		)
		if !found {
			continue
		}

		accountIDStr = after
	}

	if accountIDStr == "" {
		return fn.None[AccountID](), nil
	}

	var accountID AccountID
	accountIDBytes, err := hex.DecodeString(accountIDStr)
	if err != nil {
		return fn.None[AccountID](), err
	}

	copy(accountID[:], accountIDBytes)

	return fn.Some(accountID), nil
}
