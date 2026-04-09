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
	withPrivacy       map[session.ID]bool
}

var _ SessionDB = (*mockSessionDB)(nil)

// NewMockSessionDB creates a new mock privacy map details instance.
func NewMockSessionDB() *mockSessionDB {
	return &mockSessionDB{
		sessionToGroupID:  make(map[session.ID]session.ID),
		groupToSessionIDs: make(map[session.ID][]session.ID),
		privacyFlags:      make(map[session.ID]session.PrivacyFlags),
		withPrivacy:       make(map[session.ID]bool),
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

// GetSession returns the session for a specific id.
func (m *mockSessionDB) GetSession(_ context.Context,
	id session.ID) (*session.Session, error) {

	s, ok := m.sessionToGroupID[id]
	if !ok {
		return nil, fmt.Errorf("no session found for session ID")
	}

	f := m.privacyFlags[id]

	// Default to true for backward compatibility with existing
	// tests that don't explicitly set this.
	privacy := true
	if v, ok := m.withPrivacy[id]; ok {
		privacy = v
	}

	return &session.Session{
		GroupID:           s,
		PrivacyFlags:      f,
		WithPrivacyMapper: privacy,
	}, nil
}

// SetWithPrivacyMapper sets the WithPrivacyMapper flag for a session.
func (m *mockSessionDB) SetWithPrivacyMapper(sessionID session.ID,
	enabled bool) {

	m.withPrivacy[sessionID] = enabled
}

// AddPrivacyFlags is a helper that adds privacy flags to the mock session db.
func (m *mockSessionDB) AddPrivacyFlags(sessionID session.ID,
	flags session.PrivacyFlags) error {

	m.privacyFlags[sessionID] = flags

	return nil
}
