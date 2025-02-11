package session

import "errors"

var (
	// ErrSessionNotFound is an error returned when we attempt to retrieve
	// information about a session but it is not found.
	ErrSessionNotFound = errors.New("session not found")
)
