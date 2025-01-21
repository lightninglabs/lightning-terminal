package accounts

import "errors"

var (
	// ErrLabelAlreadyExists is returned by the CreateAccount method if the
	// account label is already used by an existing account.
	ErrLabelAlreadyExists = errors.New(
		"account label uniqueness constraint violation",
	)

	// ErrAlreadySucceeded is returned by the UpsertAccountPayment method
	// if the WithErrAlreadySucceeded option is used and the payment has
	// already succeeded.
	ErrAlreadySucceeded = errors.New("payment has already succeeded")

	// ErrPaymentNotAssociated indicate that the payment with the given hash
	// has not yet been associated with the account in question. It is also
	// returned when the WithErrIfUnknown option is used with
	// UpsertAccountPayment if the payment is not yet known.
	ErrPaymentNotAssociated = errors.New(
		"payment not associated with account",
	)
)
