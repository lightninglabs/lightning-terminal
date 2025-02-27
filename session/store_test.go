package session

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/btcsuite/btcd/btcec/v2"
	"github.com/lightninglabs/lightning-terminal/accounts"
	"github.com/lightningnetwork/lnd/clock"
	"github.com/lightningnetwork/lnd/fn"
	"github.com/lightningnetwork/lnd/macaroons"
	"github.com/stretchr/testify/require"
	"gopkg.in/macaroon-bakery.v2/bakery/checkers"
	"gopkg.in/macaroon.v2"
)

var testTime = time.Date(2020, 1, 1, 0, 0, 0, 0, time.UTC)

// TestBasicSessionStore tests the basic getters and setters of the session
// store.
func TestBasicSessionStore(t *testing.T) {
	t.Parallel()
	ctx := context.Background()

	// Set up a new DB.
	clock := clock.NewTestClock(testTime)
	db := NewTestDB(t, clock)

	// Try fetch a session that doesn't exist yet.
	_, err := db.GetSessionByID(ctx, ID{1, 3, 4, 4})
	require.ErrorIs(t, err, ErrSessionNotFound)

	// Reserve a session. This should succeed.
	s1, err := reserveSession(db, "session 1")
	require.NoError(t, err)

	// Show that the session starts in the reserved state.
	s1, err = db.GetSessionByID(ctx, s1.ID)
	require.NoError(t, err)
	require.Equal(t, StateReserved, s1.State)

	// Move session 1 to the created state. This should succeed.
	err = db.ShiftState(ctx, s1.ID, StateCreated)
	require.NoError(t, err)

	// Show that the session is now in the created state.
	s1, err = db.GetSessionByID(ctx, s1.ID)
	require.NoError(t, err)
	require.Equal(t, StateCreated, s1.State)

	// Trying to move session 1 again should have no effect since it is
	// already in the created state.
	require.NoError(t, db.ShiftState(ctx, s1.ID, StateCreated))

	// Reserve and create a few more sessions. We increment the time by one
	// second between each session to ensure that the created at time is
	// unique and hence that the ListSessions method returns the sessions in
	// a deterministic order.
	clock.SetTime(testTime.Add(time.Second))
	s2 := createSession(t, db, "session 2")
	clock.SetTime(testTime.Add(2 * time.Second))
	s3 := createSession(t, db, "session 3", withType(TypeAutopilot))

	// Test the ListSessionsByType method.
	sessions, err := db.ListSessionsByType(ctx, TypeMacaroonAdmin)
	require.NoError(t, err)
	require.Equal(t, 2, len(sessions))
	assertEqualSessions(t, s1, sessions[0])
	assertEqualSessions(t, s2, sessions[1])

	sessions, err = db.ListSessionsByType(ctx, TypeAutopilot)
	require.NoError(t, err)
	require.Equal(t, 1, len(sessions))
	assertEqualSessions(t, s3, sessions[0])

	sessions, err = db.ListSessionsByType(ctx, TypeMacaroonReadonly)
	require.NoError(t, err)
	require.Empty(t, sessions)

	// Ensure that we can retrieve each session by both its local pub key
	// and by its ID.
	for _, s := range []*Session{s1, s2, s3} {
		session, err := db.GetSession(ctx, s.LocalPublicKey)
		require.NoError(t, err)
		assertEqualSessions(t, s, session)

		session, err = db.GetSessionByID(ctx, s.ID)
		require.NoError(t, err)
		assertEqualSessions(t, s, session)
	}

	// Fetch session 1 and assert that it currently has no remote pub key.
	session1, err := db.GetSession(ctx, s1.LocalPublicKey)
	require.NoError(t, err)
	require.Nil(t, session1.RemotePublicKey)

	// Use the update method to add a remote key.
	remotePriv, err := btcec.NewPrivateKey()
	require.NoError(t, err)
	remotePub := remotePriv.PubKey()

	err = db.UpdateSessionRemotePubKey(
		ctx, session1.LocalPublicKey, remotePub,
	)
	require.NoError(t, err)

	// Assert that the session now does have the remote pub key.
	session1, err = db.GetSession(ctx, s1.LocalPublicKey)
	require.NoError(t, err)
	require.True(t, remotePub.IsEqual(session1.RemotePublicKey))

	// Check that the session's state is currently StateCreated.
	require.Equal(t, session1.State, StateCreated)

	// Now revoke the session and assert that the state is revoked.
	require.NoError(t, db.ShiftState(ctx, s1.ID, StateRevoked))
	s1, err = db.GetSession(ctx, s1.LocalPublicKey)
	require.NoError(t, err)
	require.Equal(t, s1.State, StateRevoked)

	// Test that ListAllSessions works.
	sessions, err = db.ListAllSessions(ctx)
	require.NoError(t, err)
	require.Equal(t, 3, len(sessions))
	assertEqualSessions(t, s1, sessions[0])
	assertEqualSessions(t, s2, sessions[1])
	assertEqualSessions(t, s3, sessions[2])

	// Test that ListSessionsByState works.
	sessions, err = db.ListSessionsByState(ctx, StateRevoked)
	require.NoError(t, err)
	require.Equal(t, 1, len(sessions))
	assertEqualSessions(t, s1, sessions[0])

	sessions, err = db.ListSessionsByState(ctx, StateCreated)
	require.NoError(t, err)
	require.Equal(t, 2, len(sessions))
	assertEqualSessions(t, s2, sessions[0])
	assertEqualSessions(t, s3, sessions[1])

	sessions, err = db.ListSessionsByState(ctx, StateReserved)
	require.NoError(t, err)
	require.Empty(t, sessions)

	// Demonstrate deletion of a reserved session.
	//
	// Calling DeleteReservedSessions should have no effect yet since none
	// of the sessions are reserved.
	require.NoError(t, db.DeleteReservedSessions(ctx))

	sessions, err = db.ListSessionsByState(ctx, StateReserved)
	require.NoError(t, err)
	require.Empty(t, sessions)

	// Reserve a new session and link it to session 1.
	s4, err := reserveSession(
		db, "session 4", withLinkedGroupID(&session1.GroupID),
	)
	require.NoError(t, err)

	sessions, err = db.ListSessionsByState(ctx, StateReserved)
	require.NoError(t, err)
	require.Equal(t, 1, len(sessions))
	assertEqualSessions(t, s4, sessions[0])

	// Show that the group ID/session ID index has also been populated with
	// this session.
	groupID, err := db.GetGroupID(ctx, s4.ID)
	require.NoError(t, err)
	require.Equal(t, s1.ID, groupID)

	sessIDs, err := db.GetSessionIDs(ctx, s4.GroupID)
	require.NoError(t, err)
	require.ElementsMatch(t, []ID{s4.ID, s1.ID}, sessIDs)

	// Now delete the reserved session and show that it is no longer in the
	// database and no longer in the group ID/session ID index.
	require.NoError(t, db.DeleteReservedSessions(ctx))

	sessions, err = db.ListSessionsByState(ctx, StateReserved)
	require.NoError(t, err)
	require.Empty(t, sessions)

	_, err = db.GetGroupID(ctx, s4.ID)
	require.ErrorIs(t, err, ErrUnknownGroup)

	// Only session 1 should remain in this group.
	sessIDs, err = db.GetSessionIDs(ctx, s4.GroupID)
	require.NoError(t, err)
	require.ElementsMatch(t, []ID{s1.ID}, sessIDs)
}

// TestLinkingSessions tests that session linking works as expected.
func TestLinkingSessions(t *testing.T) {
	t.Parallel()
	ctx := context.Background()

	// Set up a new DB.
	clock := clock.NewTestClock(testTime)
	db := NewTestDB(t, clock)

	groupID, err := IDFromBytes([]byte{1, 2, 3, 4})
	require.NoError(t, err)

	// Try to reserve a session that links to another and assert that it
	// fails due to the linked session not existing in the BoltStore yet.
	_, err = reserveSession(
		db, "session 2", withLinkedGroupID(&groupID),
	)
	require.ErrorIs(t, err, ErrUnknownGroup)

	// Create a new session with no previous link.
	s1 := createSession(t, db, "session 1")

	// Once again try to reserve a session that links to the now existing
	// session. This should fail due to the first session still being
	// active.
	_, err = reserveSession(db, "session 2", withLinkedGroupID(&s1.GroupID))
	require.ErrorIs(t, err, ErrSessionsInGroupStillActive)

	// Revoke the first session.
	require.NoError(t, db.ShiftState(ctx, s1.ID, StateRevoked))

	// Persisting the second linked session should now work.
	_, err = reserveSession(db, "session 2", withLinkedGroupID(&s1.GroupID))
	require.NoError(t, err)
}

// TestIDToGroupIDIndex tests that the session-ID-to-group-ID and
// group-ID-to-session-ID indexes work as expected by asserting the behaviour
// of the GetGroupID and GetSessionIDs methods.
func TestLinkedSessions(t *testing.T) {
	t.Parallel()
	ctx := context.Background()

	// Set up a new DB.
	clock := clock.NewTestClock(testTime)
	db := NewTestDB(t, clock)

	// Create a few sessions. The first one is a new session and the two
	// after are all linked to the prior one. All these sessions belong to
	// the same group. The group ID is equivalent to the session ID of the
	// first session.
	s1 := createSession(t, db, "session 1")

	require.NoError(t, db.ShiftState(ctx, s1.ID, StateRevoked))
	s2 := createSession(t, db, "session 2", withLinkedGroupID(&s1.GroupID))

	require.NoError(t, db.ShiftState(ctx, s2.ID, StateRevoked))
	s3 := createSession(t, db, "session 3", withLinkedGroupID(&s2.GroupID))

	// Assert that the session ID to group ID index works as expected.
	for _, s := range []*Session{s1, s2, s3} {
		groupID, err := db.GetGroupID(ctx, s.ID)
		require.NoError(t, err)
		require.Equal(t, s1.ID, groupID)
		require.Equal(t, s.GroupID, groupID)
	}

	// Assert that the group ID to session ID index works as expected.
	sIDs, err := db.GetSessionIDs(ctx, s1.GroupID)
	require.NoError(t, err)
	require.EqualValues(t, []ID{s1.ID, s2.ID, s3.ID}, sIDs)

	// To ensure that different groups don't interfere with each other,
	// let's add another set of linked sessions not linked to the first.
	s4 := createSession(t, db, "session 4")
	require.NoError(t, db.ShiftState(ctx, s4.ID, StateRevoked))
	s5 := createSession(t, db, "session 5", withLinkedGroupID(&s4.GroupID))
	require.NotEqual(t, s4.GroupID, s1.GroupID)

	// Assert that the session ID to group ID index works as expected.
	for _, s := range []*Session{s4, s5} {
		groupID, err := db.GetGroupID(ctx, s.ID)
		require.NoError(t, err)
		require.Equal(t, s4.ID, groupID)
		require.Equal(t, s.GroupID, groupID)
	}

	// Assert that the group ID to session ID index works as expected.
	sIDs, err = db.GetSessionIDs(ctx, s5.GroupID)
	require.NoError(t, err)
	require.EqualValues(t, []ID{s4.ID, s5.ID}, sIDs)
}

// TestStateShift tests that the ShiftState method works as expected.
func TestStateShift(t *testing.T) {
	t.Parallel()
	ctx := context.Background()

	// Set up a new DB.
	clock := clock.NewTestClock(testTime)
	db := NewTestDB(t, clock)

	// Add a new session to the DB.
	s1 := createSession(t, db, "label 1")

	// Check that the session is in the StateCreated state. Also check that
	// the "RevokedAt" time has not yet been set.
	s1, err := db.GetSession(ctx, s1.LocalPublicKey)
	require.NoError(t, err)
	require.Equal(t, StateCreated, s1.State)
	require.Equal(t, time.Time{}, s1.RevokedAt)

	// Shift the state of the session to StateRevoked.
	err = db.ShiftState(ctx, s1.ID, StateRevoked)
	require.NoError(t, err)

	// This should have worked. Since it is now in a terminal state, the
	// "RevokedAt" time should be set.
	s1, err = db.GetSession(ctx, s1.LocalPublicKey)
	require.NoError(t, err)
	require.Equal(t, StateRevoked, s1.State)
	require.True(t, clock.Now().Equal(s1.RevokedAt))

	// Trying to do the same state shift again should succeed since the
	// session is already in the expected "dest" state. The revoked-at time
	// should not have changed though.
	prevTime := clock.Now()
	clock.SetTime(prevTime.Add(time.Second))
	err = db.ShiftState(ctx, s1.ID, StateRevoked)
	require.NoError(t, err)
	require.True(t, prevTime.Equal(s1.RevokedAt))

	// Trying to shift the state from a terminal state back to StateCreated
	// should also fail since this is not a legal state transition.
	err = db.ShiftState(ctx, s1.ID, StateCreated)
	require.ErrorContains(t, err, "illegal session state transition")
}

// TestLinkedAccount tests that linking a session to an account works as
// expected.
func TestLinkedAccount(t *testing.T) {
	t.Parallel()
	ctx := context.Background()
	clock := clock.NewTestClock(testTime)

	accts := accounts.NewTestDB(t, clock)
	db := NewTestDBWithAccounts(t, clock, accts)

	// Reserve a session. Link it to an account that does not yet exist.
	// This should fail.
	acctID := accounts.AccountID{1, 2, 3, 4}
	_, err := reserveSession(db, "session 1", withAccount(acctID))
	require.ErrorIs(t, err, accounts.ErrAccNotFound)

	// Now, add a new account
	acct, err := accts.NewAccount(ctx, 1234, clock.Now().Add(time.Hour), "")
	require.NoError(t, err)

	// Reserve a session. Link it to the account that was just created.
	// This should succeed.

	s1, err := reserveSession(db, "session 1", withAccount(acct.ID))
	require.NoError(t, err)
	require.True(t, s1.AccountID.IsSome())
	s1.AccountID.WhenSome(func(id accounts.AccountID) {
		require.Equal(t, acct.ID, id)
	})

	// Make sure that a fetched session includes the account ID.
	s1, err = db.GetSessionByID(ctx, s1.ID)
	require.NoError(t, err)
	require.True(t, s1.AccountID.IsSome())
	s1.AccountID.WhenSome(func(id accounts.AccountID) {
		require.Equal(t, acct.ID, id)
	})
}

type testSessionOpts struct {
	groupID  *ID
	sessType Type
	account  fn.Option[accounts.AccountID]
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

func withAccount(alias accounts.AccountID) testSessionModifier {
	return func(s *testSessionOpts) {
		s.account = fn.Some(alias)
	}
}

func reserveSession(db Store, label string,
	mods ...testSessionModifier) (*Session, error) {

	opts := defaultTestSessOpts()
	for _, mod := range mods {
		mod(opts)
	}

	options := []Option{
		WithDevServer(),
		WithPrivacy(PrivacyFlags{ClearPubkeys}),
		WithLinkedGroupID(opts.groupID),
	}

	opts.account.WhenSome(func(id accounts.AccountID) {
		// For now, we manually add the account caveat for bbolt
		// compatibility.
		accountCaveat := checkers.Condition(
			macaroons.CondLndCustom,
			fmt.Sprintf("%s %x", accounts.CondAccount, id[:]),
		)

		caveats := append(caveats, macaroon.Caveat{
			Id: []byte(accountCaveat),
		})

		options = append(
			options,
			WithAccount(id),
			WithMacaroonRecipe(caveats, nil),
		)
	})

	return db.NewSession(
		context.Background(), label, opts.sessType,
		time.Date(9999, 1, 1, 0, 0, 0, 0, time.UTC),
		"foo.bar.baz:1234", options...,
	)
}

func createSession(t *testing.T, db Store, label string,
	mods ...testSessionModifier) *Session {

	s, err := reserveSession(db, label, mods...)
	require.NoError(t, err)

	err = db.ShiftState(context.Background(), s.ID, StateCreated)
	require.NoError(t, err)

	s, err = db.GetSessionByID(context.Background(), s.ID)
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
