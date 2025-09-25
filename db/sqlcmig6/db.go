package sqlcmig6

import (
	"context"
	"database/sql"
	"github.com/lightningnetwork/lnd/sqldb/v2"
)

type DBTX interface {
	ExecContext(context.Context, string, ...interface{}) (sql.Result, error)
	PrepareContext(context.Context, string) (*sql.Stmt, error)
	QueryContext(context.Context, string, ...interface{}) (*sql.Rows, error)
	QueryRowContext(context.Context, string, ...interface{}) *sql.Row
}

func New(db DBTX) *Queries {
	return &Queries{db: db}
}

type Queries struct {
	db DBTX
}

func (q *Queries) WithTx(tx *sql.Tx) *Queries {
	return &Queries{
		db: tx,
	}
}

type TxExecutor[T sqldb.BaseQuerier] struct {
	*sqldb.TransactionExecutor[T]

	*Queries
}

func NewTxExecutor(baseDB *sqldb.BaseDB,
	queries *Queries) *TxExecutor[*Queries] {

	executor := sqldb.NewTransactionExecutor(
		baseDB, func(tx *sql.Tx) *Queries {
			return queries.WithTx(tx)
		},
	)
	return &TxExecutor[*Queries]{
		TransactionExecutor: executor,
		Queries:             queries,
	}
}
