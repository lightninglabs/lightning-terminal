package firewalldb

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/lightninglabs/lightning-terminal/session"
	"github.com/lightningnetwork/lnd/clock"
	"github.com/lightningnetwork/lnd/fn"
	"github.com/stretchr/testify/require"
)

var (
	testTime1 = time.Unix(32100, 0)
	testTime2 = time.Unix(12300, 0)
)

// TestActionStorage tests that the ActionsListDB CRUD logic.
func TestActionStorage(t *testing.T) {
	t.Parallel()

	ctx := context.Background()
	clock := clock.NewTestClock(testTime1)
	sessDB := session.NewTestDB(t, clock)

	db, err := NewBoltDB(t.TempDir(), "test.db", sessDB, clock)
	require.NoError(t, err)
	t.Cleanup(func() {
		_ = db.Close()
	})

	// Assert that attempting to add an action for a session that does not
	// exist returns an error.
	_, err = db.AddAction(ctx, &AddActionReq{
		SessionID: fn.Some(session.ID{1, 2, 3, 4}),
	})
	require.ErrorIs(t, err, session.ErrSessionNotFound)

	// Add two sessions to the session DB so that we can reference them.
	sess1, err := sessDB.NewSession(
		ctx, "sess 1", session.TypeAutopilot, time.Unix(1000, 0),
		"something",
	)
	require.NoError(t, err)

	sess2, err := sessDB.NewSession(
		ctx, "sess 2", session.TypeAutopilot, time.Unix(1000, 0),
		"something",
	)
	require.NoError(t, err)

	action1Req := &AddActionReq{
		SessionID:          fn.Some(sess1.ID),
		MacaroonIdentifier: sess1.ID,
		ActorName:          "Autopilot",
		FeatureName:        "auto-fees",
		Trigger:            "fee too low",
		Intent:             "increase fee",
		StructuredJsonData: "{\"something\":\"nothing\"}",
		RPCMethod:          "UpdateChanPolicy",
		RPCParamsJson:      []byte("new fee"),
	}

	action1 := &Action{
		AddActionReq: *action1Req,
		AttemptedAt:  testTime1,
		State:        ActionStateDone,
	}

	action2Req := &AddActionReq{
		SessionID:          fn.Some(sess2.ID),
		MacaroonIdentifier: sess2.ID,
		ActorName:          "Autopilot",
		FeatureName:        "rebalancer",
		Trigger:            "channels not balanced",
		Intent:             "balance",
		RPCMethod:          "SendToRoute",
		RPCParamsJson:      []byte("hops, amount"),
	}

	action2 := &Action{
		AddActionReq: *action2Req,
		AttemptedAt:  testTime2,
		State:        ActionStateInit,
	}

	actions, _, _, err := db.ListActions(
		ctx, nil,
		WithActionSessionID(sess1.ID),
		WithActionState(ActionStateDone),
	)
	require.NoError(t, err)
	require.Len(t, actions, 0)

	actions, _, _, err = db.ListActions(
		ctx, nil,
		WithActionSessionID(sess2.ID),
		WithActionState(ActionStateDone),
	)
	require.NoError(t, err)
	require.Len(t, actions, 0)

	locator1, err := db.AddAction(ctx, action1Req)
	require.NoError(t, err)
	err = db.SetActionState(ctx, locator1, ActionStateDone, "")
	require.NoError(t, err)

	clock.SetTime(testTime2)

	locator2, err := db.AddAction(ctx, action2Req)
	require.NoError(t, err)

	actions, _, _, err = db.ListActions(
		ctx, nil,
		WithActionSessionID(sess1.ID),
		WithActionState(ActionStateDone),
	)
	require.NoError(t, err)
	require.Len(t, actions, 1)
	assertEqualActions(t, action1, actions[0])

	actions, _, _, err = db.ListActions(
		ctx, nil,
		WithActionSessionID(sess2.ID),
		WithActionState(ActionStateDone),
	)
	require.NoError(t, err)
	require.Len(t, actions, 0)

	err = db.SetActionState(ctx, locator2, ActionStateDone, "")
	require.NoError(t, err)

	actions, _, _, err = db.ListActions(
		ctx, nil,
		WithActionSessionID(sess2.ID),
		WithActionState(ActionStateDone),
	)
	require.NoError(t, err)
	require.Len(t, actions, 1)
	action2.State = ActionStateDone
	assertEqualActions(t, action2, actions[0])

	_, err = db.AddAction(ctx, action1Req)
	require.NoError(t, err)

	// Check that providing no session id and no filter function returns
	// all the actions.
	actions, _, _, err = db.ListActions(nil, &ListActionsQuery{
		IndexOffset: 0,
		MaxNum:      100,
		Reversed:    false,
	})
	require.NoError(t, err)
	require.Len(t, actions, 3)

	// Try set an error reason for a non Errored state.
	err = db.SetActionState(ctx, locator2, ActionStateDone, "hello")
	require.Error(t, err)

	// Now try move the action to errored with a reason.
	err = db.SetActionState(ctx, locator2, ActionStateError, "fail whale")
	require.NoError(t, err)

	actions, _, _, err = db.ListActions(
		ctx, nil,
		WithActionSessionID(sess2.ID),
		WithActionState(ActionStateError),
	)
	require.NoError(t, err)
	require.Len(t, actions, 1)
	action2.State = ActionStateError
	action2.ErrorReason = "fail whale"
	assertEqualActions(t, action2, actions[0])
}

// TestListActions tests some ListAction options.
// TODO(elle): cover more test cases here.
func TestListActions(t *testing.T) {
	t.Parallel()

	tmpDir := t.TempDir()
	ctx := context.Background()
	clock := clock.NewDefaultClock()
	sessDB := session.NewTestDB(t, clock)

	db, err := NewBoltDB(tmpDir, "test.db", sessDB, clock)
	require.NoError(t, err)
	t.Cleanup(func() {
		_ = db.Close()
	})

	// Add 2 sessions that we can reference.
	sess1, err := sessDB.NewSession(
		ctx, "sess 1", session.TypeAutopilot, time.Unix(1000, 0),
		"something",
	)
	require.NoError(t, err)

	sess2, err := sessDB.NewSession(
		ctx, "sess 2", session.TypeAutopilot, time.Unix(1000, 0),
		"nothing",
	)
	require.NoError(t, err)

	actionIds := 0
	addAction := func(sessionID [4]byte) {
		actionIds++

		actionReq := &AddActionReq{
			MacaroonIdentifier: sessionID,
			ActorName:          "Autopilot",
			FeatureName:        fmt.Sprintf("%d", actionIds),
			Trigger:            "fee too low",
			Intent:             "increase fee",
			StructuredJsonData: "{\"something\":\"nothing\"}",
			RPCMethod:          "UpdateChanPolicy",
			RPCParamsJson:      []byte("new fee"),
		}

		_, err := db.AddAction(ctx, actionReq)
		require.NoError(t, err)
	}

	type action struct {
		sessionID [4]byte
		actionID  string
	}

	assertActions := func(dbActions []*Action, al []*action) {
		require.Len(t, dbActions, len(al))
		for i, a := range al {
			require.EqualValues(
				t, a.sessionID, dbActions[i].MacaroonIdentifier,
			)
			require.Equal(t, a.actionID, dbActions[i].FeatureName)
		}
	}

	addAction(sess1.ID)
	addAction(sess1.ID)
	addAction(sess1.ID)
	addAction(sess1.ID)
	addAction(sess2.ID)

	actions, lastIndex, totalCount, err := db.ListActions(ctx, nil)
	require.NoError(t, err)
	require.Len(t, actions, 5)
	require.EqualValues(t, 5, lastIndex)
	require.EqualValues(t, 0, totalCount)
	assertActions(actions, []*action{
		{sess1.ID, "1"},
		{sess1.ID, "2"},
		{sess1.ID, "3"},
		{sess1.ID, "4"},
		{sess2.ID, "5"},
	})

	query := &ListActionsQuery{
		Reversed: true,
	}

	actions, lastIndex, totalCount, err = db.ListActions(ctx, query)
	require.NoError(t, err)
	require.Len(t, actions, 5)
	require.EqualValues(t, 1, lastIndex)
	require.EqualValues(t, 0, totalCount)
	assertActions(actions, []*action{
		{sess2.ID, "5"},
		{sess1.ID, "4"},
		{sess1.ID, "3"},
		{sess1.ID, "2"},
		{sess1.ID, "1"},
	})

	actions, lastIndex, totalCount, err = db.ListActions(
		ctx, &ListActionsQuery{
			CountAll: true,
		},
	)
	require.NoError(t, err)
	require.Len(t, actions, 5)
	require.EqualValues(t, 5, lastIndex)
	require.EqualValues(t, 5, totalCount)
	assertActions(actions, []*action{
		{sess1.ID, "1"},
		{sess1.ID, "2"},
		{sess1.ID, "3"},
		{sess1.ID, "4"},
		{sess2.ID, "5"},
	})

	actions, lastIndex, totalCount, err = db.ListActions(
		ctx, &ListActionsQuery{
			CountAll: true,
			Reversed: true,
		},
	)
	require.NoError(t, err)
	require.Len(t, actions, 5)
	require.EqualValues(t, 1, lastIndex)
	require.EqualValues(t, 5, totalCount)
	assertActions(actions, []*action{
		{sess2.ID, "5"},
		{sess1.ID, "4"},
		{sess1.ID, "3"},
		{sess1.ID, "2"},
		{sess1.ID, "1"},
	})

	addAction(sess2.ID)
	addAction(sess2.ID)
	addAction(sess1.ID)
	addAction(sess1.ID)
	addAction(sess2.ID)

	actions, lastIndex, totalCount, err = db.ListActions(ctx, nil)
	require.NoError(t, err)
	require.Len(t, actions, 10)
	require.EqualValues(t, 10, lastIndex)
	require.EqualValues(t, 0, totalCount)
	assertActions(actions, []*action{
		{sess1.ID, "1"},
		{sess1.ID, "2"},
		{sess1.ID, "3"},
		{sess1.ID, "4"},
		{sess2.ID, "5"},
		{sess2.ID, "6"},
		{sess2.ID, "7"},
		{sess1.ID, "8"},
		{sess1.ID, "9"},
		{sess2.ID, "10"},
	})

	actions, lastIndex, totalCount, err = db.ListActions(
		ctx, &ListActionsQuery{
			MaxNum:   3,
			CountAll: true,
		},
	)
	require.NoError(t, err)
	require.Len(t, actions, 3)
	require.EqualValues(t, 3, lastIndex)
	require.EqualValues(t, 10, totalCount)
	assertActions(actions, []*action{
		{sess1.ID, "1"},
		{sess1.ID, "2"},
		{sess1.ID, "3"},
	})

	actions, lastIndex, totalCount, err = db.ListActions(
		ctx, &ListActionsQuery{
			MaxNum:      3,
			IndexOffset: 3,
		},
	)
	require.NoError(t, err)
	require.Len(t, actions, 3)
	require.EqualValues(t, 6, lastIndex)
	require.EqualValues(t, 0, totalCount)
	assertActions(actions, []*action{
		{sess1.ID, "4"},
		{sess2.ID, "5"},
		{sess2.ID, "6"},
	})

	actions, lastIndex, totalCount, err = db.ListActions(
		ctx, &ListActionsQuery{
			MaxNum:      3,
			IndexOffset: 3,
			CountAll:    true,
		},
	)
	require.NoError(t, err)
	require.Len(t, actions, 3)
	require.EqualValues(t, 6, lastIndex)
	require.EqualValues(t, 10, totalCount)
	assertActions(actions, []*action{
		{sess1.ID, "4"},
		{sess2.ID, "5"},
		{sess2.ID, "6"},
	})
}

// TestListGroupActions tests that the listGroupActions correctly returns all
// actions in a particular session group.
func TestListGroupActions(t *testing.T) {
	t.Parallel()
	ctx := context.Background()
	clock := clock.NewTestClock(testTime1)

	sessDB := session.NewTestDB(t, clock)

	// Create two sessions both linked to session 1's group.
	sess1, err := sessDB.NewSession(
		ctx, "sess 1", session.TypeAutopilot, time.Unix(1000, 0),
		"something",
	)
	require.NoError(t, err)

	// We'll first need to revoke session 1 before we can link another
	// session to the group.
	require.NoError(
		t, sessDB.ShiftState(ctx, sess1.ID, session.StateCreated),
	)
	require.NoError(
		t, sessDB.ShiftState(ctx, sess1.ID, session.StateRevoked),
	)

	group1 := sess1.GroupID

	// Create session 2 and link it to the same group as session 1.
	sess2, err := sessDB.NewSession(
		ctx, "sess 2", session.TypeAutopilot, time.Unix(1000, 0),
		"something", session.WithLinkedGroupID(&group1),
	)
	require.NoError(t, err)

	action1Req := &AddActionReq{
		SessionID:          fn.Some(sess1.ID),
		MacaroonIdentifier: sess1.ID,
		ActorName:          "Autopilot",
		FeatureName:        "auto-fees",
		Trigger:            "fee too low",
		Intent:             "increase fee",
		StructuredJsonData: "{\"something\":\"nothing\"}",
		RPCMethod:          "UpdateChanPolicy",
		RPCParamsJson:      []byte("new fee"),
	}

	action1 := &Action{
		AddActionReq: *action1Req,
		AttemptedAt:  testTime1,
		State:        ActionStateDone,
	}

	action2Req := &AddActionReq{
		SessionID:          fn.Some(sess2.ID),
		MacaroonIdentifier: sess2.ID,
		ActorName:          "Autopilot",
		FeatureName:        "rebalancer",
		Trigger:            "channels not balanced",
		Intent:             "balance",
		RPCMethod:          "SendToRoute",
		RPCParamsJson:      []byte("hops, amount"),
	}

	action2 := &Action{
		AddActionReq: *action2Req,
		AttemptedAt:  testTime2,
		State:        ActionStateInit,
	}

	db, err := NewBoltDB(t.TempDir(), "test.db", sessDB, clock)
	require.NoError(t, err)
	t.Cleanup(func() {
		_ = db.Close()
	})

	// There should not be any actions in group 1 yet.
	al, _, _, err := db.ListActions(ctx, nil, WithActionGroupID(group1))
	require.NoError(t, err)
	require.Empty(t, al)

	// Add an action under session 1.
	locator1, err := db.AddAction(ctx, action1Req)
	require.NoError(t, err)
	err = db.SetActionState(ctx, locator1, ActionStateDone, "")
	require.NoError(t, err)

	// There should now be one action in the group.
	al, _, _, err = db.ListActions(ctx, nil, WithActionGroupID(group1))
	require.NoError(t, err)
	require.Len(t, al, 1)
	assertEqualActions(t, action1, al[0])

	clock.SetTime(testTime2)

	// Add an action under session 2.
	_, err = db.AddAction(ctx, action2Req)
	require.NoError(t, err)

	// There should now be actions in the group.
	al, _, _, err = db.ListActions(ctx, nil, WithActionGroupID(group1))
	require.NoError(t, err)
	require.Len(t, al, 2)
	assertEqualActions(t, action1, al[0])
	assertEqualActions(t, action2, al[1])
}

func assertEqualActions(t *testing.T, expected, got *Action) {
	expectedAttemptedAt := expected.AttemptedAt
	actualAttemptedAt := got.AttemptedAt

	expected.AttemptedAt = time.Time{}
	got.AttemptedAt = time.Time{}

	require.Equal(t, expected, got)
	require.Equal(t, expectedAttemptedAt.Unix(), actualAttemptedAt.Unix())

	expected.AttemptedAt = expectedAttemptedAt
	got.AttemptedAt = actualAttemptedAt
}
