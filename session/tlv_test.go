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

	groupID = ID{0, 1, 3, 4}
)

// TestSerializeDeserializeSession makes sure that a session can be serialized
// and deserialized from and to the tlv binary format successfully.
func TestSerializeDeserializeSession(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name          string
		sessType      Type
		revokedAt     time.Time
		perms         []bakery.Op
		caveats       []macaroon.Caveat
		featureConfig map[string][]byte
		linkedGroupID *ID
	}{
		{
			name:     "revoked-at field",
			sessType: TypeMacaroonCustom,
			revokedAt: time.Date(
				2023, 1, 10, 10, 10, 0, 0, time.UTC,
			),
		},
		{
			name:     "permissions and caveats",
			sessType: TypeMacaroonCustom,
			perms:    perms,
			caveats:  caveats,
		},
		{
			name:     "feature configuration bytes",
			sessType: TypeMacaroonCustom,
			featureConfig: map[string][]byte{
				"AutoFees":      {1, 2, 3, 4},
				"AutoSomething": {4, 3, 4, 5, 6, 6},
			},
		},
		{
			name:     "linked session with no group ID",
			sessType: TypeMacaroonCustom,
			featureConfig: map[string][]byte{
				"AutoFees":      {1, 2, 3, 4},
				"AutoSomething": {4, 3, 4, 5, 6, 6},
			},
			linkedGroupID: &groupID,
		},
		{
			name:     "linked session with group ID",
			sessType: TypeMacaroonCustom,
			featureConfig: map[string][]byte{
				"AutoFees":      {1, 2, 3, 4},
				"AutoSomething": {4, 3, 4, 5, 6, 6},
			},
			linkedGroupID: &groupID,
		},
		{
			name:     "session with no optional fields",
			sessType: TypeMacaroonCustom,
		},
		{
			name:     "session with all optional fields",
			sessType: TypeMacaroonCustom,
			revokedAt: time.Date(
				2023, 1, 10, 10, 10, 0, 0, time.UTC,
			),
			perms:   perms,
			caveats: caveats,
			featureConfig: map[string][]byte{
				"AutoFees":      {1, 2, 3, 4},
				"AutoSomething": {4, 3, 4, 5, 6, 6},
			},
		},
	}

	for _, test := range tests {
		test := test
		t.Run(test.name, func(t *testing.T) {
			t.Parallel()

			priv, id, err := NewSessionPrivKeyAndID()
			require.NoError(t, err)

			session, err := NewSession(
				id, priv, test.name, test.sessType,
				time.Date(99999, 1, 1, 0, 0, 0, 0, time.UTC),
				"foo.bar.baz:1234", true, test.perms,
				test.caveats, test.featureConfig, true,
				test.linkedGroupID,
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

// TestGroupIDForOlderSessions tests that older sessions that were added before
// the GroupID was introduced still deserialize correctly by using the session's
// ID as the GroupID.
func TestGroupIDForOlderSessions(t *testing.T) {
	t.Parallel()

	priv, id, err := NewSessionPrivKeyAndID()
	require.NoError(t, err)

	session, err := NewSession(
		id, priv, "test-session", TypeMacaroonAdmin,
		time.Date(99999, 1, 1, 0, 0, 0, 0, time.UTC),
		"foo.bar.baz:1234", true, nil, nil, nil, false, nil,
	)
	require.NoError(t, err)

	// Gather all the tlv records for the session _except for the group ID_.
	records, err := constructSessionTLVRecords(session, false)
	require.NoError(t, err)

	stream, err := tlv.NewStream(records...)
	require.NoError(t, err)

	// Serialise the TLV stream.
	var buf bytes.Buffer
	require.NoError(t, stream.Encode(&buf))

	// Now deserialize the session and ensure that the group ID _does_ get
	// set correctly the session's ID.
	sess, err := DeserializeSession(&buf)
	require.NoError(t, err)
	require.Equal(t, session.ID, sess.GroupID)
}

// TestGroupID tests that a Session's GroupID member gets correctly set
// depending on if the Session is linked to a previous one.
func TestGroupID(t *testing.T) {
	t.Parallel()

	priv, id, err := NewSessionPrivKeyAndID()
	require.NoError(t, err)

	// Create session 1 which is not linked to any previous session.
	session1, err := NewSession(
		id, priv, "test-session", TypeMacaroonAdmin,
		time.Date(99999, 1, 1, 0, 0, 0, 0, time.UTC),
		"foo.bar.baz:1234", true, nil, nil, nil, false, nil,
	)
	require.NoError(t, err)

	// The group ID of this session should be the same as the session ID.
	require.Equal(t, session1.ID, session1.GroupID)

	// Create session 2 and link it to session 1.
	priv, id, err = NewSessionPrivKeyAndID()
	require.NoError(t, err)
	session2, err := NewSession(
		id, priv, "test-session", TypeMacaroonAdmin,
		time.Date(99999, 1, 1, 0, 0, 0, 0, time.UTC),
		"foo.bar.baz:1234", true, nil, nil, nil, false,
		&session1.GroupID,
	)
	require.NoError(t, err)

	// The group ID of this session should _not_ the same as its session ID.
	require.NotEqual(t, session2.ID, session2.GroupID)

	// Instead, the group ID should match the session ID of session 1.
	require.Equal(t, session1.ID, session2.GroupID)
}

// TestSerializeDeserializeCaveats makes sure that a list of caveats can be
// serialized and deserialized from and to the tlv binary format successfully.
func TestSerializeDeserializeCaveats(t *testing.T) {
	t.Parallel()

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
	t.Parallel()

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
	t.Parallel()

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
