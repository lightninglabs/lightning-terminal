package firewall

import (
	"strconv"
	"testing"

	litmac "github.com/lightninglabs/lightning-terminal/macaroons"
	"github.com/lightninglabs/lightning-terminal/session"
	"github.com/lightningnetwork/lnd/fn"
	"github.com/stretchr/testify/require"
	"google.golang.org/grpc/metadata"
	"google.golang.org/protobuf/proto"
	"gopkg.in/macaroon-bakery.v2/bakery"
	"gopkg.in/macaroon.v2"

	"github.com/lightningnetwork/lnd/lnrpc"
)

// newMacaroonWithRootKeyID returns a macaroon that encodes the given root key
// ID, the way macaroons baked by lnd do.
func newMacaroonWithRootKeyID(t *testing.T,
	rootKeyID uint64) *macaroon.Macaroon {

	decodedID := &lnrpc.MacaroonId{
		StorageId: []byte(strconv.FormatUint(rootKeyID, 10)),
	}
	idBytes, err := proto.Marshal(decodedID)
	require.NoError(t, err)

	rawID := make([]byte, len(idBytes)+1)
	rawID[0] = byte(bakery.LatestVersion)
	copy(rawID[1:], idBytes)

	mac, err := macaroon.New([]byte("rootkey"), rawID, "", macaroon.V2)
	require.NoError(t, err)

	return mac
}

// newSessionMacaroon returns a macaroon that encodes the given session ID in
// its root key ID, the way session macaroons baked by LiT do.
func newSessionMacaroon(t *testing.T, id session.ID) *macaroon.Macaroon {
	return newMacaroonWithRootKeyID(t, litmac.NewSuperMacaroonRootKeyID(id))
}

// newRequestFromMacaroon returns an RPC middleware interception request that
// carries the given macaroon (which may be nil) and, if a session ID is
// given, the session ID gRPC metadata.
func newRequestFromMacaroon(t *testing.T, mac *macaroon.Macaroon,
	sessionID fn.Option[session.ID]) *lnrpc.RPCMiddlewareRequest {

	req := &lnrpc.RPCMiddlewareRequest{
		RequestId: 1,
		InterceptType: &lnrpc.RPCMiddlewareRequest_Request{
			Request: &lnrpc.RPCMessage{
				MethodFullUri: "/lnrpc.Lightning/GetInfo",
			},
		},
	}

	if mac != nil {
		macBytes, err := mac.MarshalBinary()
		require.NoError(t, err)

		req.RawMacaroon = macBytes
	}

	sessionID.WhenSome(func(id session.ID) {
		md := make(metadata.MD)
		session.AddToGRPCMetadata(md, id)

		req.MetadataPairs = make(map[string]*lnrpc.MetadataValues)
		for k, vs := range md {
			req.MetadataPairs[k] = &lnrpc.MetadataValues{
				Values: vs,
			}
		}
	})

	return req
}

// TestNewInfoFromRequestSessionBinding tests that a session ID transmitted
// via gRPC metadata is only accepted if the presented macaroon is the session
// macaroon of that very session.
func TestNewInfoFromRequestSessionBinding(t *testing.T) {
	sessionID := session.ID{0x01, 0x02, 0x03, 0x04}
	otherSessionID := session.ID{0x05, 0x06, 0x07, 0x08}

	tests := []struct {
		name        string
		macaroon    *macaroon.Macaroon
		sessionID   fn.Option[session.ID]
		expectedErr string
	}{
		{
			name:      "matching session ID",
			macaroon:  newSessionMacaroon(t, sessionID),
			sessionID: fn.Some(sessionID),
		},
		{
			name:      "mismatched session ID",
			macaroon:  newSessionMacaroon(t, sessionID),
			sessionID: fn.Some(otherSessionID),
			expectedErr: "does not match the macaroon's " +
				"session",
		},
		{
			name:        "non-session macaroon",
			macaroon:    newMacaroonWithRootKeyID(t, 123),
			sessionID:   fn.Some(sessionID),
			expectedErr: "not a session macaroon",
		},
		{
			name:        "no macaroon",
			macaroon:    nil,
			sessionID:   fn.Some(sessionID),
			expectedErr: "no macaroon present",
		},
		{
			name:      "no metadata with session macaroon",
			macaroon:  newSessionMacaroon(t, sessionID),
			sessionID: fn.None[session.ID](),
		},
		{
			name:      "no metadata with non-session macaroon",
			macaroon:  newMacaroonWithRootKeyID(t, 123),
			sessionID: fn.None[session.ID](),
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			req := newRequestFromMacaroon(
				t, tc.macaroon, tc.sessionID,
			)

			ri, err := NewInfoFromRequest(req)
			if tc.expectedErr == "" {
				require.NoError(t, err)
				require.Equal(t, tc.sessionID, ri.SessionID)

				return
			}

			require.ErrorContains(t, err, tc.expectedErr)
		})
	}
}
