package accounts

import (
	"context"
	"encoding/hex"
	"errors"
	"fmt"

	mid "github.com/lightninglabs/lightning-terminal/rpcmiddleware"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/macaroons"
	"google.golang.org/protobuf/proto"
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

	acctID, err := accountFromMacaroon(mac)
	if err != nil {
		return mid.RPCErrString(
			req, "error parsing account from macaroon: %v", err,
		)
	}

	// No account lock in the macaroon, something's weird. The interceptor
	// wouldn't have been triggered if there was no caveat, so we do expect
	// a macaroon here.
	if acctID == nil {
		return mid.RPCErrString(req, "expected account ID in "+
			"macaroon caveat")
	}

	acct, err := s.Account(*acctID)
	if err != nil {
		return mid.RPCErrString(
			req, "error getting account %x: %v", acctID[:], err,
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

	// We now add the account to the incoming context to give each checker
	// access to it if required.
	ctxAccount := AddToContext(ctx, KeyAccount, acct)

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
			ctxAccount, r.Request.MethodFullUri, msg,
		))

	// Parse and possibly manipulate outgoing responses.
	case *lnrpc.RPCMiddlewareRequest_Response:
		msg, err := parseRPCMessage(r.Response)
		if err != nil {
			return mid.RPCErr(req, err)
		}

		replacement, err := s.checkers.replaceOutgoingResponse(
			ctxAccount, r.Response.MethodFullUri, msg,
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

// accountFromMacaroon attempts to extract an account ID from the custom account
// caveat in the macaroon.
func accountFromMacaroon(mac *macaroon.Macaroon) (*AccountID, error) {
	// Extract the account caveat from the macaroon.
	macaroonAccount := macaroons.GetCustomCaveatCondition(mac, CondAccount)
	if macaroonAccount == "" {
		// There is no condition that locks the macaroon to an account,
		// so there is nothing to check.
		return nil, nil
	}

	// The macaroon is indeed locked to an account. Fetch the account and
	// validate its balance.
	accountIDBytes, err := hex.DecodeString(macaroonAccount)
	if err != nil {
		return nil, err
	}

	var accountID AccountID
	copy(accountID[:], accountIDBytes)
	return &accountID, nil
}
