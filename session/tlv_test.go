package session

import (
	"bytes"
	"github.com/btcsuite/btcd/btcec"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
	"gopkg.in/macaroon.v2"
)

var (
	testRootKey                = []byte("54321")
	testID                     = []byte("dummyId")
	testLocation               = "lnd"
	testVersion                = macaroon.LatestVersion
)

func createDummyMacaroon(t *testing.T) *macaroon.Macaroon {
	dummyMacaroon, err := macaroon.New(
		testRootKey, testID, testLocation, testVersion,
	)
	if err != nil {
		t.Fatalf("Error creating initial macaroon: %v", err)
	}
	return dummyMacaroon
}

// TestSerializeDeserializeSession makes sure that a session can be serialized
// and deserialized from and to the tlv binary format successfully.
func TestSerializeDeserializeSession(t *testing.T) {
	mac := createDummyMacaroon(t)

	session, err := NewSession(
		"this is a session", TypeMacaroonCustom,
		time.Date(99999, 1, 1, 0, 0, 0, 0, time.UTC),
		"foo.bar.baz:1234", true,
	)
	require.NoError(t, err)

	_, remotePubKey := btcec.PrivKeyFromBytes(btcec.S256(), testRootKey)
	session.RemotePublicKey = remotePubKey
	session.Macaroon = mac

	var buf bytes.Buffer
	require.NoError(t, SerializeSession(&buf, session))

	deserializedSession, err := DeserializeSession(&buf)
	require.NoError(t, err)

	// Apparently require.Equal doesn't work on time.Time when comparing as
	// a struct. So we need to compare the timestamp itself and then make
	// sure the rest of the session is equal separately.
	require.Equal(
		t, session.Expiry.Unix(), deserializedSession.Expiry.Unix(),
	)
	session.Expiry = time.Time{}
	deserializedSession.Expiry = time.Time{}
	require.Equal(t, session, deserializedSession)
}
