package session

import (
	"bytes"
	"testing"
	"time"

	"github.com/btcsuite/btcd/btcec/v2"
	"github.com/lightningnetwork/lnd/tlv"
	"github.com/stretchr/testify/require"
	"gopkg.in/macaroon-bakery.v2/bakery"
	"gopkg.in/macaroon.v2"
)

var (
	testRootKey = []byte("54321")

	perms = []bakery.Op{
		{
			Entity: "loop",
			Action: "read",
		},
		{
			Entity: "lnd",
			Action: "write",
		},
		{
			Entity: "pool",
			Action: "read",
		},
	}

	caveats = []macaroon.Caveat{
		{
			Id:             []byte("caveat id here"),
			VerificationId: []byte("HS7uD_w_dedwv4Jjw7UoXbRqIKhr"),
			Location:       "anywhere",
		},
		{
			Id:             []byte("caveat id2 here"),
			VerificationId: []byte("HS7uD_w_dedwvJjw75rXbRqIKhr"),
			Location:       "the world",
		},
		{
			Id: []byte("caveat id3 here"),
		},
	}
)

// TestSerializeDeserializeSession makes sure that a session can be serialized
// and deserialized from and to the tlv binary format successfully.
func TestSerializeDeserializeSession(t *testing.T) {
	tests := []struct {
		name      string
		sessType  Type
		revokedAt time.Time
		perms     []bakery.Op
		caveats   []macaroon.Caveat
	}{
		{
			name:     "session 1",
			sessType: TypeMacaroonCustom,
			revokedAt: time.Date(
				2023, 1, 10, 10, 10, 0, 0, time.UTC,
			),
		},
		{
			name:     "session 2",
			sessType: TypeMacaroonCustom,
			perms:    perms,
			caveats:  caveats,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			session, err := NewSession(
				test.name, test.sessType,
				time.Date(99999, 1, 1, 0, 0, 0, 0, time.UTC),
				"foo.bar.baz:1234", true, test.perms,
				test.caveats,
			)
			require.NoError(t, err)

			session.RevokedAt = test.revokedAt

			_, remotePubKey := btcec.PrivKeyFromBytes(testRootKey)
			session.RemotePublicKey = remotePubKey

			var buf bytes.Buffer
			require.NoError(t, SerializeSession(&buf, session))

			deserializedSession, err := DeserializeSession(&buf)
			require.NoError(t, err)

			// Apparently require.Equal doesn't work on time.Time
			// when comparing as a struct. So we need to compare the
			// timestamp itself and then make sure the rest of the
			// session is equal separately.
			require.Equal(
				t, session.Expiry.Unix(),
				deserializedSession.Expiry.Unix(),
			)
			require.Equal(
				t, session.RevokedAt.Unix(),
				deserializedSession.RevokedAt.Unix(),
			)
			session.Expiry = time.Time{}
			deserializedSession.Expiry = time.Time{}
			session.CreatedAt = time.Time{}
			deserializedSession.CreatedAt = time.Time{}
			session.RevokedAt = time.Time{}
			deserializedSession.RevokedAt = time.Time{}

			require.Equal(t, session, deserializedSession)
		})
	}
}

// TestSerializeDeserializeCaveats makes sure that a list of caveats can be
// serialized and deserialized from and to the tlv binary format successfully.
func TestSerializeDeserializeCaveats(t *testing.T) {
	// We'll now make a sample invoice stream, and use that to encode the
	// amp state we created above.
	tlvStream, err := tlv.NewStream(
		tlv.MakeDynamicRecord(
			typeMacCaveats, &caveats, func() uint64 {
				return recordSize(caveatsEncoder, &caveats)
			},
			caveatsEncoder, caveatsDecoder,
		),
	)
	require.Nil(t, err)

	// Next encode the stream into a set of raw bytes.
	var b bytes.Buffer
	err = tlvStream.Encode(&b)
	require.Nil(t, err)

	// Now create a new blank caveats array, which we'll use to decode the
	// bytes into.
	var caveats2 []macaroon.Caveat

	// Decode from the raw stream into this blank map.
	// Decode from the raw stream into this blank map.
	tlvStream, err = tlv.NewStream(
		tlv.MakeDynamicRecord(
			typeMacCaveats, &caveats2, nil,
			caveatsEncoder, caveatsDecoder,
		),
	)
	require.Nil(t, err)

	err = tlvStream.Decode(&b)
	require.Nil(t, err)

	// The two states should match.
	require.Equal(t, caveats, caveats2)
}

// TestSerializeDeserializePerms makes sure that a list of perms can be
// serialized and deserialized from and to the tlv binary format successfully.
func TestSerializeDeserializePerms(t *testing.T) {
	// We'll now make a sample invoice stream, and use that to encode the
	// amp state we created above.
	tlvStream, err := tlv.NewStream(
		tlv.MakeDynamicRecord(
			typeMacPerms, &perms, func() uint64 {
				return recordSize(permsEncoder, &perms)
			}, permsEncoder, permsDecoder,
		),
	)
	require.Nil(t, err)

	// Next encode the stream into a set of raw bytes.
	var b bytes.Buffer
	err = tlvStream.Encode(&b)
	require.Nil(t, err)

	// Now create a new blank perms array, which we'll use to decode the
	// bytes into.
	var perms2 []bakery.Op

	// Decode from the raw stream into this blank map.
	tlvStream, err = tlv.NewStream(
		tlv.MakeDynamicRecord(
			typeMacPerms, &perms2, nil, permsEncoder, permsDecoder,
		),
	)
	require.Nil(t, err)

	err = tlvStream.Decode(&b)
	require.Nil(t, err)

	// The two states should match.
	require.Equal(t, perms, perms2)
}

// TestSerializeDeserializeMacaroonRecipe makes sure that a list of macaroon
// recipes can be serialized and deserialized from and to the tlv binary format
// successfully.
func TestSerializeDeserializeMacaroonRecipe(t *testing.T) {
	recipe := MacaroonRecipe{
		Permissions: perms,
		Caveats:     caveats,
	}

	// We'll now make a sample invoice stream, and use that to encode the
	// amp state we created above.
	tlvStream, err := tlv.NewStream(
		tlv.MakeDynamicRecord(
			typeMacaroonRecipe, &recipe, func() uint64 {
				return recordSize(
					macaroonRecipeEncoder, &recipe,
				)
			}, macaroonRecipeEncoder, macaroonRecipeDecoder,
		),
	)
	require.Nil(t, err)

	// Next encode the stream into a set of raw bytes.
	var b bytes.Buffer
	err = tlvStream.Encode(&b)
	require.Nil(t, err)

	// Now create a new blank recipe2, which we'll use to decode the
	// bytes into.
	var recipe2 MacaroonRecipe

	// Decode from the raw stream into this blank recipe.
	tlvStream, err = tlv.NewStream(
		tlv.MakeDynamicRecord(
			typeMacaroonRecipe, &recipe2, nil,
			macaroonRecipeEncoder, macaroonRecipeDecoder,
		),
	)
	require.Nil(t, err)

	err = tlvStream.Decode(&b)
	require.Nil(t, err)

	// The two states should match.
	require.Equal(t, recipe, recipe2)
}
