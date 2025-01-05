package accounts

import "errors"

var (
	// ErrLabelAlreadyExists is returned by the CreateAccount method if the
	// account label is already used by an existing account.
	ErrLabelAlreadyExists = errors.New(
		"account label uniqueness constraint violation",
	)
)
