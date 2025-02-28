package session

import (
	"testing"
	"time"

	"github.com/btcsuite/btcd/btcec/v2"
	"github.com/lightningnetwork/lnd/clock"
	"github.com/stretchr/testify/require"
)

var testTime = time.Date(2020, 1, 1, 0, 0, 0, 0, time.UTC)

// TestBasicSessionStore tests the basic getters and setters of the session
// store.
func TestBasicSessionStore(t *testing.T) {
	// Set up a new DB.
	clock := clock.NewTestClock(testTime)
	db, err := NewDB(t.TempDir(), "test.db", clock)
	require.NoError(t, err)
	t.Cleanup(func() {
		_ = db.Close()
	})

	// Reserve a session. This should succeed.
	s1, err := reserveSession(db, "session 1")
	require.NoError(t, err)

	// Show that the session starts in the reserved state.
	s1, err = db.GetSessionByID(s1.ID)
	require.NoError(t, err)
	require.Equal(t, StateReserved, s1.State)

	// Move session 1 to the created state. This should succeed.
	err = db.ShiftState(s1.ID, StateCreated)
	require.NoError(t, err)

	// Show that the session is now in the created state.
	s1, err = db.GetSessionByID(s1.ID)
	require.NoError(t, err)
	require.Equal(t, StateCreated, s1.State)

	// Trying to move session 1 again should have no effect since it is
	// already in the created state.
	require.NoError(t, db.ShiftState(s1.ID, StateCreated))

	// Reserve and create a few more sessions. We increment the time by one
	// second between each session to ensure that the created at time is
	// unique and hence that the ListSessions method returns the sessions in
	// a deterministic order.
	clock.SetTime(testTime.Add(time.Second))
	s2 := createSession(t, db, "session 2")
	clock.SetTime(testTime.Add(2 * time.Second))
	s3 := createSession(t, db, "session 3", withType(TypeAutopilot))

	// Test the ListSessionsByType method.
	sessions, err := db.ListSessionsByType(TypeMacaroonAdmin)
	require.NoError(t, err)
	require.Equal(t, 2, len(sessions))
	assertEqualSessions(t, s1, sessions[0])
	assertEqualSessions(t, s2, sessions[1])

	sessions, err = db.ListSessionsByType(TypeAutopilot)
	require.NoError(t, err)
	require.Equal(t, 1, len(sessions))
	assertEqualSessions(t, s3, sessions[0])

	sessions, err = db.ListSessionsByType(TypeMacaroonReadonly)
	require.NoError(t, err)
	require.Empty(t, sessions)

	// Ensure that we can retrieve each session by both its local pub key
	// and by its ID.
	for _, s := range []*Session{s1, s2, s3} {
		session, err := db.GetSession(s.LocalPublicKey)
		require.NoError(t, err)
		assertEqualSessions(t, s, session)

		session, err = db.GetSessionByID(s.ID)
		require.NoError(t, err)
		assertEqualSessions(t, s, session)
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
	require.NoError(t, db.ShiftState(s1.ID, StateRevoked))
	s1, err = db.GetSession(s1.LocalPublicKey)
	require.NoError(t, err)
	require.Equal(t, s1.State, StateRevoked)

	// Test that ListAllSessions works.
	sessions, err = db.ListAllSessions()
	require.NoError(t, err)
	require.Equal(t, 3, len(sessions))
	assertEqualSessions(t, s1, sessions[0])
	assertEqualSessions(t, s2, sessions[1])
	assertEqualSessions(t, s3, sessions[2])

	// Test that ListSessionsByState works.
	sessions, err = db.ListSessionsByState(StateRevoked)
	require.NoError(t, err)
	require.Equal(t, 1, len(sessions))
	assertEqualSessions(t, s1, sessions[0])

	sessions, err = db.ListSessionsByState(StateCreated)
	require.NoError(t, err)
	require.Equal(t, 2, len(sessions))
	assertEqualSessions(t, s2, sessions[0])
	assertEqualSessions(t, s3, sessions[1])

	sessions, err = db.ListSessionsByState(StateCreated, StateRevoked)
	require.NoError(t, err)
	require.Equal(t, 3, len(sessions))
	assertEqualSessions(t, s1, sessions[0])
	assertEqualSessions(t, s2, sessions[1])
	assertEqualSessions(t, s3, sessions[2])

	sessions, err = db.ListSessionsByState()
	require.NoError(t, err)
	require.Empty(t, sessions)

	sessions, err = db.ListSessionsByState(StateReserved)
	require.NoError(t, err)
	require.Empty(t, sessions)

	// Demonstrate deletion of a reserved session.
	//
	// Calling DeleteReservedSessions should have no effect yet since none
	// of the sessions are reserved.
	require.NoError(t, db.DeleteReservedSessions())

	sessions, err = db.ListSessionsByState(StateReserved)
	require.NoError(t, err)
	require.Empty(t, sessions)

	// Reserve a new session and link it to session 1.
	s4, err := reserveSession(
		db, "session 4", withLinkedGroupID(&session1.GroupID),
	)
	require.NoError(t, err)

	sessions, err = db.ListSessionsByState(StateReserved)
	require.NoError(t, err)
	require.Equal(t, 1, len(sessions))
	assertEqualSessions(t, s4, sessions[0])

	// Show that the group ID/session ID index has also been populated with
	// this session.
	groupID, err := db.GetGroupID(s4.ID)
	require.NoError(t, err)
	require.Equal(t, s1.ID, groupID)

	sessIDs, err := db.GetSessionIDs(s4.GroupID)
	require.NoError(t, err)
	require.ElementsMatch(t, []ID{s4.ID, s1.ID}, sessIDs)

	// Now delete the reserved session and show that it is no longer in the
	// database and no longer in the group ID/session ID index.
	require.NoError(t, db.DeleteReservedSessions())

	sessions, err = db.ListSessionsByState(StateReserved)
	require.NoError(t, err)
	require.Empty(t, sessions)

	_, err = db.GetGroupID(s4.ID)
	require.ErrorContains(t, err, "no index entry")

	// Only session 1 should remain in this group.
	sessIDs, err = db.GetSessionIDs(s4.GroupID)
	require.NoError(t, err)
	require.ElementsMatch(t, []ID{s1.ID}, sessIDs)
}

// TestLinkingSessions tests that session linking works as expected.
func TestLinkingSessions(t *testing.T) {
	t.Parallel()

	// Set up a new DB.
	clock := clock.NewTestClock(testTime)
	db, err := NewDB(t.TempDir(), "test.db", clock)
	require.NoError(t, err)
	t.Cleanup(func() {
		_ = db.Close()
	})

	groupID, err := IDFromBytes([]byte{1, 2, 3, 4})
	require.NoError(t, err)

	// Try to reserve a session that links to another and assert that it
	// fails due to the linked session not existing in the BoltStore yet.
	_, err = reserveSession(
		db, "session 2", withLinkedGroupID(&groupID),
	)
	require.ErrorContains(t, err, "unknown linked session")

	// Create a new session with no previous link.
	s1 := createSession(t, db, "session 1")

	// Once again try to reserve a session that links to the now existing
	// session. This should fail due to the first session still being
	// active.
	_, err = reserveSession(db, "session 2", withLinkedGroupID(&s1.GroupID))
	require.ErrorContains(t, err, "is still active")

	// Revoke the first session.
	require.NoError(t, db.ShiftState(s1.ID, StateRevoked))

	// Persisting the second linked session should now work.
	_, err = reserveSession(db, "session 2", withLinkedGroupID(&s1.GroupID))
	require.NoError(t, err)
}

// TestIDToGroupIDIndex tests that the session-ID-to-group-ID and
// group-ID-to-session-ID indexes work as expected by asserting the behaviour
// of the GetGroupID and GetSessionIDs methods.
func TestLinkedSessions(t *testing.T) {
	t.Parallel()

	// Set up a new DB.
	clock := clock.NewTestClock(testTime)
	db, err := NewDB(t.TempDir(), "test.db", clock)
	require.NoError(t, err)
	t.Cleanup(func() {
		_ = db.Close()
	})

	// Create a few sessions. The first one is a new session and the two
	// after are all linked to the prior one. All these sessions belong to
	// the same group. The group ID is equivalent to the session ID of the
	// first session.
	s1 := createSession(t, db, "session 1")

	require.NoError(t, db.ShiftState(s1.ID, StateRevoked))
	s2 := createSession(t, db, "session 2", withLinkedGroupID(&s1.GroupID))

	require.NoError(t, db.ShiftState(s2.ID, StateRevoked))
	s3 := createSession(t, db, "session 3", withLinkedGroupID(&s2.GroupID))

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
	s4 := createSession(t, db, "session 4")
	require.NoError(t, db.ShiftState(s4.ID, StateRevoked))
	s5 := createSession(t, db, "session 5", withLinkedGroupID(&s4.GroupID))
	require.NotEqual(t, s4.GroupID, s1.GroupID)

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

// TestStateShift tests that the ShiftState method works as expected.
func TestStateShift(t *testing.T) {
	// Set up a new DB.
	clock := clock.NewTestClock(testTime)
	db, err := NewDB(t.TempDir(), "test.db", clock)
	require.NoError(t, err)
	t.Cleanup(func() {
		_ = db.Close()
	})

	// Add a new session to the DB.
	s1 := createSession(t, db, "label 1")

	// Check that the session is in the StateCreated state. Also check that
	// the "RevokedAt" time has not yet been set.
	s1, err = db.GetSession(s1.LocalPublicKey)
	require.NoError(t, err)
	require.Equal(t, StateCreated, s1.State)
	require.Equal(t, time.Time{}, s1.RevokedAt)

	// Shift the state of the session to StateRevoked.
	err = db.ShiftState(s1.ID, StateRevoked)
	require.NoError(t, err)

	// This should have worked. Since it is now in a terminal state, the
	// "RevokedAt" time should be set.
	s1, err = db.GetSession(s1.LocalPublicKey)
	require.NoError(t, err)
	require.Equal(t, StateRevoked, s1.State)
	require.True(t, clock.Now().Equal(s1.RevokedAt))

	// Trying to do the same state shift again should succeed since the
	// session is already in the expected "dest" state. The revoked-at time
	// should not have changed though.
	prevTime := clock.Now()
	clock.SetTime(prevTime.Add(time.Second))
	err = db.ShiftState(s1.ID, StateRevoked)
	require.NoError(t, err)
	require.True(t, prevTime.Equal(s1.RevokedAt))

	// Trying to shift the state from a terminal state back to StateCreated
	// should also fail since this is not a legal state transition.
	err = db.ShiftState(s1.ID, StateCreated)
	require.ErrorContains(t, err, "illegal session state transition")
}

type testSessionOpts struct {
	groupID  *ID
	sessType Type
}

func defaultTestSessOpts() *testSessionOpts {
	return &testSessionOpts{
		groupID:  nil,
		sessType: TypeMacaroonAdmin,
	}
}

// testSessionModifier is a functional option that can be used to modify the
// default test session created by newSession.
type testSessionModifier func(*testSessionOpts)

func withLinkedGroupID(groupID *ID) testSessionModifier {
	return func(s *testSessionOpts) {
		s.groupID = groupID
	}
}

func withType(t Type) testSessionModifier {
	return func(s *testSessionOpts) {
		s.sessType = t
	}
}

func reserveSession(db Store, label string,
	mods ...testSessionModifier) (*Session, error) {

	opts := defaultTestSessOpts()
	for _, mod := range mods {
		mod(opts)
	}

	return db.NewSession(label, opts.sessType,
		time.Date(99999, 1, 1, 0, 0, 0, 0, time.UTC),
		"foo.bar.baz:1234",
		WithDevServer(),
		WithPrivacy(PrivacyFlags{ClearPubkeys}),
		WithLinkedGroupID(opts.groupID),
	)
}

func createSession(t *testing.T, db Store, label string,
	mods ...testSessionModifier) *Session {

	s, err := reserveSession(db, label, mods...)
	require.NoError(t, err)

	err = db.ShiftState(s.ID, StateCreated)
	require.NoError(t, err)

	s, err = db.GetSessionByID(s.ID)
	require.NoError(t, err)

	return s
}

func assertEqualSessions(t *testing.T, expected, actual *Session) {
	expectedExpiry := expected.Expiry
	actualExpiry := actual.Expiry
	expectedRevoked := expected.RevokedAt
	actualRevoked := actual.RevokedAt
	expectedCreated := expected.CreatedAt
	actualCreated := actual.CreatedAt

	expected.Expiry = time.Time{}
	expected.RevokedAt = time.Time{}
	expected.CreatedAt = time.Time{}
	actual.Expiry = time.Time{}
	actual.RevokedAt = time.Time{}
	actual.CreatedAt = time.Time{}

	require.Equal(t, expected, actual)
	require.Equal(t, expectedExpiry.Unix(), actualExpiry.Unix())
	require.Equal(t, expectedRevoked.Unix(), actualRevoked.Unix())
	require.Equal(t, expectedCreated.Unix(), actualCreated.Unix())

	// Restore the old values to not influence the tests.
	expected.Expiry = expectedExpiry
	expected.RevokedAt = expectedRevoked
	expected.CreatedAt = expectedCreated
	actual.Expiry = actualExpiry
	actual.RevokedAt = actualRevoked
	actual.CreatedAt = actualCreated
}
