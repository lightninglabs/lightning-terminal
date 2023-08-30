package session

import (
	"strings"
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
	s1 := newSession(t, db, "session 1", nil)
	s2 := newSession(t, db, "session 2", nil)
	s3 := newSession(t, db, "session 3", nil)
	s4 := newSession(t, db, "session 4", nil)

	// Persist session 1. This should now succeed.
	require.NoError(t, db.CreateSession(s1))

	// Trying to persist session 1 again should fail due to a session with
	// the given pub key already existing.
	require.ErrorContains(t, db.CreateSession(s1), "already exists")

	// Change the local pub key of session 4 such that it has the same
	// ID as session 1.
	s4.ID = s1.ID
	s4.GroupID = s1.GroupID

	// Now try to insert session 4. This should fail due to an entry for
	// the ID already existing.
	require.ErrorContains(t, db.CreateSession(s4), "a session with the "+
		"given ID already exists")

	// Persist a few more sessions.
	require.NoError(t, db.CreateSession(s2))
	require.NoError(t, db.CreateSession(s3))

	// Ensure that we can retrieve each session by both its local pub key
	// and by its ID.
	for _, s := range []*Session{s1, s2, s3} {
		session, err := db.GetSession(s.LocalPublicKey)
		require.NoError(t, err)
		require.Equal(t, s.Label, session.Label)

		session, err = db.GetSessionByID(s.ID)
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

// TestLinkingSessions tests that session linking works as expected.
func TestLinkingSessions(t *testing.T) {
	// Set up a new DB.
	db, err := NewDB(t.TempDir(), "test.db")
	require.NoError(t, err)
	t.Cleanup(func() {
		_ = db.Close()
	})

	// Create a new session with no previous link.
	s1 := newSession(t, db, "session 1", nil)

	// Create another session and link it to the first.
	s2 := newSession(t, db, "session 2", &s1.GroupID)

	// Try to persist the second session and assert that it fails due to the
	// linked session not existing in the DB yet.
	require.ErrorContains(t, db.CreateSession(s2), "unknown linked session")

	// Now persist the first session and retry persisting the second one
	// and assert that this now works.
	require.NoError(t, db.CreateSession(s1))

	// Persisting the second session immediately should fail due to the
	// first session still being active.
	require.ErrorContains(t, db.CreateSession(s2), "is still active")

	// Revoke the first session.
	require.NoError(t, db.RevokeSession(s1.LocalPublicKey))

	// Persisting the second linked session should now work.
	require.NoError(t, db.CreateSession(s2))
}

// TestIDToGroupIDIndex tests that the session-ID-to-group-ID and
// group-ID-to-session-ID indexes work as expected by asserting the behaviour
// of the GetGroupID and GetSessionIDs methods.
func TestLinkedSessions(t *testing.T) {
	// Set up a new DB.
	db, err := NewDB(t.TempDir(), "test.db")
	require.NoError(t, err)
	t.Cleanup(func() {
		_ = db.Close()
	})

	// Create a few sessions. The first one is a new session and the two
	// after are all linked to the prior one. All these sessions belong to
	// the same group. The group ID is equivalent to the session ID of the
	// first session.
	s1 := newSession(t, db, "session 1", nil)
	s2 := newSession(t, db, "session 2", &s1.GroupID)
	s3 := newSession(t, db, "session 3", &s2.GroupID)

	// Persist the sessions.
	require.NoError(t, db.CreateSession(s1))

	require.NoError(t, db.RevokeSession(s1.LocalPublicKey))
	require.NoError(t, db.CreateSession(s2))

	require.NoError(t, db.RevokeSession(s2.LocalPublicKey))
	require.NoError(t, db.CreateSession(s3))

	// Assert that the session ID to group ID index works as expected.
	for _, s := range []*Session{s1, s2, s3} {
		groupID, err := db.GetGroupID(s.ID)
		require.NoError(t, err)
		require.Equal(t, s1.ID, groupID)
		require.Equal(t, s.GroupID, groupID)
	}

	// Assert that the group ID to session ID index works as expected.
	sIDs, err := db.GetSessionIDs(s1.GroupID)
	require.NoError(t, err)
	require.EqualValues(t, []ID{s1.ID, s2.ID, s3.ID}, sIDs)

	// To ensure that different groups don't interfere with each other,
	// let's add another set of linked sessions not linked to the first.
	s4 := newSession(t, db, "session 4", nil)
	s5 := newSession(t, db, "session 5", &s4.GroupID)

	require.NotEqual(t, s4.GroupID, s1.GroupID)

	// Persist the sessions.
	require.NoError(t, db.CreateSession(s4))
	require.NoError(t, db.RevokeSession(s4.LocalPublicKey))

	require.NoError(t, db.CreateSession(s5))

	// Assert that the session ID to group ID index works as expected.
	for _, s := range []*Session{s4, s5} {
		groupID, err := db.GetGroupID(s.ID)
		require.NoError(t, err)
		require.Equal(t, s4.ID, groupID)
		require.Equal(t, s.GroupID, groupID)
	}

	// Assert that the group ID to session ID index works as expected.
	sIDs, err = db.GetSessionIDs(s5.GroupID)
	require.NoError(t, err)
	require.EqualValues(t, []ID{s4.ID, s5.ID}, sIDs)
}

// TestCheckSessionGroupPredicate asserts that the CheckSessionGroupPredicate
// method correctly checks if each session in a group passes a predicate.
func TestCheckSessionGroupPredicate(t *testing.T) {
	// Set up a new DB.
	db, err := NewDB(t.TempDir(), "test.db")
	require.NoError(t, err)
	t.Cleanup(func() {
		_ = db.Close()
	})

	// We will use the Label of the Session to test that the predicate
	// function is checked correctly.

	// Add a new session to the DB.
	s1 := newSession(t, db, "label 1", nil)
	require.NoError(t, db.CreateSession(s1))

	// Check that the group passes against an appropriate predicate.
	ok, err := db.CheckSessionGroupPredicate(
		s1.GroupID, func(s *Session) bool {
			return strings.Contains(s.Label, "label 1")
		},
	)
	require.NoError(t, err)
	require.True(t, ok)

	// Check that the group fails against an appropriate predicate.
	ok, err = db.CheckSessionGroupPredicate(
		s1.GroupID, func(s *Session) bool {
			return strings.Contains(s.Label, "label 2")
		},
	)
	require.NoError(t, err)
	require.False(t, ok)

	// Revoke the first session.
	require.NoError(t, db.RevokeSession(s1.LocalPublicKey))

	// Add a new session to the same group as the first one.
	s2 := newSession(t, db, "label 2", &s1.GroupID)
	require.NoError(t, db.CreateSession(s2))

	// Check that the group passes against an appropriate predicate.
	ok, err = db.CheckSessionGroupPredicate(
		s1.GroupID, func(s *Session) bool {
			return strings.Contains(s.Label, "label")
		},
	)
	require.NoError(t, err)
	require.True(t, ok)

	// Check that the group fails against an appropriate predicate.
	ok, err = db.CheckSessionGroupPredicate(
		s1.GroupID, func(s *Session) bool {
			return strings.Contains(s.Label, "label 1")
		},
	)
	require.NoError(t, err)
	require.False(t, ok)

	// Add a new session that is not linked to the first one.
	s3 := newSession(t, db, "completely different", nil)
	require.NoError(t, db.CreateSession(s3))

	// Ensure that the first group is unaffected.
	ok, err = db.CheckSessionGroupPredicate(
		s1.GroupID, func(s *Session) bool {
			return strings.Contains(s.Label, "label")
		},
	)
	require.NoError(t, err)
	require.True(t, ok)

	// And that the new session is evaluated separately.
	ok, err = db.CheckSessionGroupPredicate(
		s3.GroupID, func(s *Session) bool {
			return strings.Contains(s.Label, "label")
		},
	)
	require.NoError(t, err)
	require.False(t, ok)

	ok, err = db.CheckSessionGroupPredicate(
		s3.GroupID, func(s *Session) bool {
			return strings.Contains(s.Label, "different")
		},
	)
	require.NoError(t, err)
	require.True(t, ok)
}

func newSession(t *testing.T, db Store, label string,
	linkedGroupID *ID) *Session {

	id, priv, err := db.GetUnusedIDAndKeyPair()
	require.NoError(t, err)

	session, err := NewSession(
		id, priv, label, TypeMacaroonAdmin,
		time.Date(99999, 1, 1, 0, 0, 0, 0, time.UTC),
		"foo.bar.baz:1234", true, nil, nil, nil, true, linkedGroupID,
	)
	require.NoError(t, err)

	return session
}
