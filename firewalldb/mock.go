package firewalldb

import (
	"context"
	"fmt"

	"github.com/lightninglabs/lightning-terminal/session"
)

type mockSessionDB struct {
	sessionToGroupID  map[session.ID]session.ID
	groupToSessionIDs map[session.ID][]session.ID
	privacyFlags      map[session.ID]session.PrivacyFlags
}

var _ SessionDB = (*mockSessionDB)(nil)

// NewMockSessionDB creates a new mock privacy map details instance.
func NewMockSessionDB() *mockSessionDB {
	return &mockSessionDB{
		sessionToGroupID:  make(map[session.ID]session.ID),
		groupToSessionIDs: make(map[session.ID][]session.ID),
		privacyFlags:      make(map[session.ID]session.PrivacyFlags),
	}
}

// AddPair adds a new session to group ID pair to the mock details.
func (m *mockSessionDB) AddPair(sessionID, groupID session.ID) {
	m.sessionToGroupID[sessionID] = groupID

	m.groupToSessionIDs[groupID] = append(
		m.groupToSessionIDs[groupID], sessionID,
	)
}

// GetGroupID returns the group ID for the given session ID.
func (m *mockSessionDB) GetGroupID(_ context.Context, sessionID session.ID) (
	session.ID, error) {

	id, ok := m.sessionToGroupID[sessionID]
	if !ok {
		return session.ID{}, fmt.Errorf("no group ID found for " +
			"session ID")
	}

	return id, nil
}

// GetSessionIDs returns the set of session IDs that are in the group
func (m *mockSessionDB) GetSessionIDs(_ context.Context, groupID session.ID) (
	[]session.ID, error) {

	ids, ok := m.groupToSessionIDs[groupID]
	if !ok {
		return nil, fmt.Errorf("no session IDs found for group ID")
	}

	return ids, nil
}

// GetSessionByID returns the session for a specific id.
func (m *mockSessionDB) GetSessionByID(_ context.Context,
	sessionID session.ID) (*session.Session, error) {

	s, ok := m.sessionToGroupID[sessionID]
	if !ok {
		return nil, fmt.Errorf("no session found for session ID")
	}

	f, ok := m.privacyFlags[sessionID]
	if !ok {
		return nil, fmt.Errorf("no privacy flags found for session ID")
	}

	return &session.Session{GroupID: s, PrivacyFlags: f}, nil
}

// AddPrivacyFlags is a helper that adds privacy flags to the mock session db.
func (m *mockSessionDB) AddPrivacyFlags(sessionID session.ID,
	flags session.PrivacyFlags) error {

	m.privacyFlags[sessionID] = flags

	return nil
}
