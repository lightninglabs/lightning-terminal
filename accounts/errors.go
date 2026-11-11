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

	// ErrAMPNotSupported is returned when an account attempts to send an
	// AMP payment. AMP payments are not supported for accounts.
	ErrAMPNotSupported = errors.New(
		"AMP payments are not supported with accounts",
	)

	// ErrMPPTotalTooLow is returned when an account sends a
	// SendToRouteV2 request whose final hop declares an MPP total amount
	// that is negative or smaller than the amount the final hop forwards
	// to the receiver.
	ErrMPPTotalTooLow = errors.New(
		"MPP total amount is negative or smaller than the final hop " +
			"amount",
	)

	// ErrAmpInvoicesNotSupported is returned when an account user tries to
	// create an AMP invoice. AMP invoices are not supported for accounts.
	ErrAmpInvoicesNotSupported = errors.New(
		"AMP invoices are not supported with restricted account " +
			"macaroons",
	)
)
