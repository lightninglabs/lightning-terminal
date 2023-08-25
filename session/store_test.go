package session

import (
	"testing"
	"time"

	"github.com/btcsuite/btcd/btcec/v2"
	"github.com/stretchr/testify/require"
)

// TestBasicSessionStore tests the basic getters and setters of the session
// store.
func TestBasicSessionStore(t *testing.T) {
	// Set up a new DB.
	db, err := NewDB(t.TempDir(), "test.db")
	require.NoError(t, err)
	t.Cleanup(func() {
		_ = db.Close()
	})

	// Create a few sessions.
	s1 := newSession(t, "session 1")
	s2 := newSession(t, "session 2")
	s3 := newSession(t, "session 3")

	// Persist session 1.
	require.NoError(t, db.CreateSession(s1))

	// Trying to persist session 1 again should fail.
	require.ErrorContains(t, db.CreateSession(s1), "already exists")

	// Persist a few more sessions.
	require.NoError(t, db.CreateSession(s2))
	require.NoError(t, db.CreateSession(s3))

	// Ensure that we can retrieve each session.
	for _, s := range []*Session{s1, s2, s3} {
		session, err := db.GetSession(s.LocalPublicKey)
		require.NoError(t, err)
		require.Equal(t, s.Label, session.Label)
	}

	// Fetch session 1 and assert that it currently has no remote pub key.
	session1, err := db.GetSession(s1.LocalPublicKey)
	require.NoError(t, err)
	require.Nil(t, session1.RemotePublicKey)

	// Use the update method to add a remote key.
	remotePriv, err := btcec.NewPrivateKey()
	require.NoError(t, err)
	remotePub := remotePriv.PubKey()

	err = db.UpdateSessionRemotePubKey(session1.LocalPublicKey, remotePub)
	require.NoError(t, err)

	// Assert that the session now does have the remote pub key.
	session1, err = db.GetSession(s1.LocalPublicKey)
	require.NoError(t, err)
	require.True(t, remotePub.IsEqual(session1.RemotePublicKey))

	// Check that the session's state is currently StateCreated.
	require.Equal(t, session1.State, StateCreated)

	// Now revoke the session and assert that the state is revoked.
	require.NoError(t, db.RevokeSession(s1.LocalPublicKey))
	session1, err = db.GetSession(s1.LocalPublicKey)
	require.NoError(t, err)
	require.Equal(t, session1.State, StateRevoked)
}

func newSession(t *testing.T, label string) *Session {
	session, err := NewSession(
		label, TypeMacaroonAdmin,
		time.Date(99999, 1, 1, 0, 0, 0, 0, time.UTC),
		"foo.bar.baz:1234", true, nil, nil, nil, true,
	)
	require.NoError(t, err)

	return session
}
