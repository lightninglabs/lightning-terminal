package db

// QueriesTxOptions defines the set of db txn options the SQLQueries
// understands.
type QueriesTxOptions struct {
	// readOnly governs if a read only transaction is needed or not.
	readOnly bool
}

// ReadOnly returns true if the transaction should be read only.
//
// NOTE: This implements the TxOptions.
func (a *QueriesTxOptions) ReadOnly() bool {
	return a.readOnly
}

// NewQueryReadTx creates a new read transaction option set.
func NewQueryReadTx() QueriesTxOptions {
	return QueriesTxOptions{
		readOnly: true,
	}
}
