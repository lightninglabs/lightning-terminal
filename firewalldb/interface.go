package firewalldb

import "github.com/lightninglabs/lightning-terminal/session"

// SessionDB is an interface that abstracts the database operations needed for
// the privacy mapper to function.
type SessionDB interface {
	session.IDToGroupIndex

	// GetSessionByID returns the session for a specific id.
	GetSessionByID(session.ID) (*session.Session, error)
}
