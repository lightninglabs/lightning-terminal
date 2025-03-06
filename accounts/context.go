package accounts

import (
	"context"
	"fmt"

	"github.com/btcsuite/btclog/v2"
)

// ContextKey is the type that we use to identify account specific values in the
// request context. We wrap the string inside a struct because of this comment
// in the context API: "The provided key must be comparable and should not be of
// type string or any other built-in type to avoid collisions between packages
// using context."
type ContextKey struct {
	Name string
}

var (
	// KeyAccount is the key under which we store the account in the request
	// context.
	KeyAccount = ContextKey{"account"}

	// KeyRequestID is the key under which we store the middleware request
	// ID.
	KeyRequestID = ContextKey{"request_id"}
)

// FromContext tries to extract a value from the given context.
func FromContext(ctx context.Context, key ContextKey) interface{} {
	return ctx.Value(key)
}

// AddAccountToContext adds the given value to the context for easy retrieval
// later on.
func AddAccountToContext(ctx context.Context,
	value *OffChainBalanceAccount) context.Context {

	return context.WithValue(ctx, KeyAccount, value)
}

// AccountFromContext attempts to extract an account from the given context.
func AccountFromContext(ctx context.Context) (*OffChainBalanceAccount, error) {
	val := FromContext(ctx, KeyAccount)
	if val == nil {
		return nil, fmt.Errorf("no account found in context")
	}

	acct, ok := val.(*OffChainBalanceAccount)
	if !ok {
		return nil, fmt.Errorf("invalid account value in context")
	}

	return acct, nil
}

// AddRequestIDToContext adds the given request ID to the context for easy
// retrieval later on.
func AddRequestIDToContext(ctx context.Context, value uint64) context.Context {
	return context.WithValue(ctx, KeyRequestID, value)
}

// RequestIDFromContext attempts to extract a request ID from the given context.
func RequestIDFromContext(ctx context.Context) (uint64, error) {
	val := FromContext(ctx, KeyRequestID)
	if val == nil {
		return 0, fmt.Errorf("no request ID found in context")
	}

	reqID, ok := val.(uint64)
	if !ok {
		return 0, fmt.Errorf("invalid request ID value in context")
	}

	return reqID, nil
}

// requestScopedValuesFromCtx is a helper function that can be used to extract
// an account and requestID from the given context. It also creates a new
// prefixed logger that can be used by account request and response handlers.
// Each log line will be prefixed by the account ID and the request ID.
func requestScopedValuesFromCtx(ctx context.Context) (btclog.Logger,
	*OffChainBalanceAccount, uint64, error) {

	acc, err := AccountFromContext(ctx)
	if err != nil {
		return nil, nil, 0, err
	}

	reqID, err := RequestIDFromContext(ctx)
	if err != nil {
		return nil, nil, 0, err
	}

	prefix := fmt.Sprintf("[account: %s, request: %d]", acc.ID, reqID)

	return log.WithPrefix(prefix), acc, reqID, nil
}
