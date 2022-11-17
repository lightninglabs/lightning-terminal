package accounts

import (
	"context"
	"fmt"
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
)

// FromContext tries to extract a value from the given context.
func FromContext(ctx context.Context, key ContextKey) interface{} {
	return ctx.Value(key)
}

// AddToContext adds the given value to the context for easy retrieval later on.
func AddToContext(ctx context.Context, key ContextKey,
	value *OffChainBalanceAccount) context.Context {

	return context.WithValue(ctx, key, value)
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
