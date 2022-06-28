package accounts

import (
	"context"
	"errors"
	"fmt"

	mid "github.com/lightninglabs/lightning-terminal/rpcmiddleware"
	"github.com/lightningnetwork/lnd/lnrpc"
	"google.golang.org/protobuf/proto"
	"gopkg.in/macaroon.v2"
)

const (
	// CondAccount is the custom caveat condition that binds a macaroon to a
	// certain account.
	CondAccount = "account"

	// accountMiddlewareName is the name that is used for the faraday
	// account system when registering it to lnd as an RPC middleware.
	accountMiddlewareName = "lit-account"
)

var (
	// ErrNotSupportedWithAccounts is the error that is returned when an RPC
	// is called that isn't supported to be handled by the accounts
	// interceptor.
	ErrNotSupportedWithAccounts = errors.New("this RPC call is not " +
		"supported with restricted account macaroons")
)

// Intercept processes an RPC middleware interception request and returns the
// interception result which either accepts or rejects the intercepted message.
func (s *Service) Intercept(_ context.Context,
	req *lnrpc.RPCMiddlewareRequest) (*lnrpc.RPCMiddlewareResponse, error) {

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

	// No account lock in the macaroon, not our concern!
	if acctID == nil {
		return mid.RPCOk(req)
	}

	acct, err := s.GetAccount(*acctID)
	if err != nil {
		return mid.RPCErrString(
			req, "error getting account %x: %v", acctID[:], err,
		)
	}

	if err := s.checkAccountExpiration(acct); err != nil {
		return mid.RPCErr(req, err)
	}

	// We need to be able to pass our current account state in to the
	// checker closures. This comes at a small runtime price in that we need
	// to instantiate the checkers for each call. But that should be
	// relatively cheap to do.
	checkers := s.generateCheckers(acct)

	switch r := req.InterceptType.(type) {
	// In the authentication phase we just check that the account hasn't
	// expired yet. This is only be used for establishing streams, so we
	// don't see a request yet.
	case *lnrpc.RPCMiddlewareRequest_StreamAuth:
		return mid.RPCErr(req, s.checkAccountExpiration(acct))

	// Parse incoming requests and act on them.
	case *lnrpc.RPCMiddlewareRequest_Request:
		msg, err := mid.ParseProtobuf(
			r.Request.TypeName, r.Request.Serialized,
		)
		if err != nil {
			return mid.RPCErrString(req, "error parsing proto: %v",
				err)
		}

		return mid.RPCErr(req, s.checkIncomingRequest(
			r.Request.MethodFullUri, msg, checkers,
		))

	// Parse and possibly manipulate outgoing responses.
	case *lnrpc.RPCMiddlewareRequest_Response:
		msg, err := mid.ParseProtobuf(
			r.Response.TypeName, r.Response.Serialized,
		)
		if err != nil {
			return mid.RPCErrString(req, "error parsing proto: %v",
				err)
		}

		replacement, err := s.replaceOutgoingResponse(
			r.Response.MethodFullUri, msg, checkers,
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

// checkAccountExpiration logs the account call and makes sure the account
// hasn't expired yet.
func (s *Service) checkAccountExpiration(acct *OffChainBalanceAccount) error {
	log.Debugf("Account auth intercepted, ID=%x, balance_sat=%d, "+
		"expired=%v", acct.ID[:], acct.CurrentBalance.ToSatoshis(),
		acct.HasExpired())

	if acct.HasExpired() {
		return fmt.Errorf("account %x has expired", acct.ID[:])
	}

	// All good!
	return nil
}

// checkIncomingRequest makes sure the type of incoming call is supported and
// if it is, that it is allowed with the current account balance.
func (s *Service) checkIncomingRequest(fullUri string, req proto.Message,
	checkers map[string]mid.RoundTripChecker) error {

	// If we don't have a handler for the URI, it means we don't support
	// that RPC.
	checker, ok := checkers[fullUri]
	if !ok {
		return ErrNotSupportedWithAccounts
	}

	// This is just a sanity check to make sure the implementation for the
	// checker actually matches the correct request type.
	if !checker.HandlesRequest(req.ProtoReflect().Type()) {
		return fmt.Errorf("invalid implementation, checker for URI "+
			"%s does not accept request of type %v", fullUri,
			req.ProtoReflect().Type())
	}

	req, err := checker.HandleRequest(req)
	if err != nil {
		return err
	}

	if req != nil {
		return fmt.Errorf("request editing checkers not supported " +
			"for accounts")
	}

	return nil
}

// replaceOutgoingResponse inspects the responses before sending them out to the
// client and replaces them if needed.
func (s *Service) replaceOutgoingResponse(fullUri string, resp proto.Message,
	checkers map[string]mid.RoundTripChecker) (proto.Message, error) {

	// If we don't have a handler for the URI, it means we don't support
	// that RPC. We shouldn't get here in the first place, since the request
	// should've already been refused.
	checker, ok := checkers[fullUri]
	if !ok {
		return nil, ErrNotSupportedWithAccounts
	}

	// This is just a sanity check to make sure the implementation for the
	// checker actually matches the correct request type.
	if !checker.HandlesResponse(resp.ProtoReflect().Type()) {
		return nil, fmt.Errorf("invalid implementation, checker for "+
			"URI %s does not accept response of type %v", fullUri,
			resp.ProtoReflect().Type())
	}

	return checker.HandleResponse(resp)
}
