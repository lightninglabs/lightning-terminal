package firewalldb

import (
	"testing"

	"github.com/lightninglabs/lightning-terminal/session"
	"github.com/stretchr/testify/require"
)

// TestSessionIdIndexDB tests that the session ID index DB behaves as expected.
func TestSessionIdIndexDB(t *testing.T) {
	tmpDir := t.TempDir()
	store, err := NewDB(tmpDir, "test.db")
	require.NoError(t, err)
	t.Cleanup(func() {
		_ = store.Close()
	})

	db := SessionIDIndex(store)

	// Set up some IDs.
	var (
		group1   = intToSessionID(1)
		session1 = intToSessionID(1)
		session2 = intToSessionID(2)
	)

	// Nothing has been added to the index yet, so we don't expect any
	// session IDs for group 1.
	ids, err := db.GetSessionIDs(group1)
	require.NoError(t, err)
	require.Empty(t, ids)

	// Similarly, we expect no group ID for session 1.
	_, err = db.GetGroupID(session1)
	require.ErrorContains(t, err, "group ID not found for session ID")

	// Add a few ID pairs to the index.
	err = db.AddGroupID(session1, group1)
	require.NoError(t, err)

	err = db.AddGroupID(session2, group1)
	require.NoError(t, err)

	// Now we expect id for session 1 and 2 to be returned for group ID 1,
	// and we expect the order to be preserved.
	ids, err = db.GetSessionIDs(group1)
	require.NoError(t, err)
	require.Len(t, ids, 2)
	require.Equal(t, session1, ids[0])
	require.Equal(t, session2, ids[1])

	// And we expect group ID 1 to be returned for session 1 and session 2.
	id, err := db.GetGroupID(session1)
	require.NoError(t, err)
	require.Equal(t, group1, id)

	id, err = db.GetGroupID(session2)
	require.NoError(t, err)
	require.Equal(t, group1, id)
}

func intToSessionID(i uint32) session.ID {
	var id session.ID
	byteOrder.PutUint32(id[:], i)

	return id
}
