package session

import (
	"encoding/hex"
	"fmt"

	"github.com/lightningnetwork/lnd/fn"
	"google.golang.org/grpc/metadata"
)

// contextKey is a struct that is used as a key for storing session IDs
// in a context. Using this unexported type prevents collisions with other
// context keys that may be used in the same context. However, this only
// applies if the context is passed around in the same binary and not if the
// value is converted to grpc metadata and sent over the wire. In that case,
// we need to use a string key to avoid collisions with other metadata keys.
type contextKey struct {
	name string
}

// sessionIDCtxKey is the context key used to store the session ID in
// a context. The key is a string to avoid collisions with other context values
// that may also be included in grpc metadata which is why we add the 'lit'
// prefix.
var sessionIDCtxKey = contextKey{"lit_session_id"}

// FromGRPCMetadata extracts the session ID from the given gRPC metadata kv
// pairs if one is found.
func FromGRPCMetadata(md metadata.MD) (fn.Option[ID], error) {
	val := md.Get(sessionIDCtxKey.name)
	if len(val) == 0 {
		return fn.None[ID](), nil
	}

	if len(val) != 1 {
		return fn.None[ID](), fmt.Errorf("more than one session ID "+
			"found in gRPC metadata: %v", val)
	}

	b, err := hex.DecodeString(val[0])
	if err != nil {
		return fn.None[ID](), err
	}

	sessID, err := IDFromBytes(b)
	if err != nil {
		return fn.None[ID](), err
	}

	return fn.Some(sessID), nil
}

// AddToGRPCMetadata adds the session ID to the given gRPC metadata kv pairs.
// The session ID is encoded as a hex string.
func AddToGRPCMetadata(md metadata.MD, id ID) {
	md.Set(sessionIDCtxKey.name, hex.EncodeToString(id[:]))
}
