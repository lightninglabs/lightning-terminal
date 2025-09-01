package firewalldb

import (
	"context"
	"database/sql"

	"github.com/lightninglabs/lightning-terminal/db"
	"github.com/lightninglabs/lightning-terminal/db/sqlc"
	"github.com/lightningnetwork/lnd/clock"
	"github.com/lightningnetwork/lnd/sqldb/v2"
)

// SQLSessionQueries is a subset of the sqlc.Queries interface that can be used
// to interact with the session table.
type SQLSessionQueries interface {
	GetSessionIDByAlias(ctx context.Context, legacyID []byte) (int64, error)
	GetAliasBySessionID(ctx context.Context, id int64) ([]byte, error)
}

// SQLQueries is a subset of the sqlc.Queries interface that can be used to
// interact with various firewalldb tables.
type SQLQueries interface {
	sqldb.BaseQuerier

	SQLKVStoreQueries
	SQLPrivacyPairQueries
	SQLActionQueries
}

// BatchedSQLQueries combines the SQLQueries interface with the BatchedTx
// interface, allowing for multiple queries to be executed in single SQL
// transaction.
type BatchedSQLQueries interface {
	SQLQueries

	sqldb.BatchedTx[SQLQueries]
}

// SQLDB represents a storage backend.
type SQLDB struct {
	// db is all the higher level queries that the SQLStore has access to
	// in order to implement all its CRUD logic.
	db BatchedSQLQueries

	// BaseDB represents the underlying database connection.
	*sqldb.BaseDB

	clock clock.Clock
}

type SQLQueriesExecutor[T sqldb.BaseQuerier] struct {
	*sqldb.TransactionExecutor[T]

	SQLQueries
}

func NewSQLQueriesExecutor(baseDB *sqldb.BaseDB,
	queries *sqlc.Queries) *SQLQueriesExecutor[SQLQueries] {

	executor := sqldb.NewTransactionExecutor(
		baseDB, func(tx *sql.Tx) SQLQueries {
			return queries.WithTx(tx)
		},
	)
	return &SQLQueriesExecutor[SQLQueries]{
		TransactionExecutor: executor,
		SQLQueries:          queries,
	}
}

// A compile-time assertion to ensure that SQLDB implements the RulesDB
// interface.
var _ RulesDB = (*SQLDB)(nil)

// A compile-time assertion to ensure that SQLDB implements the ActionsDB
// interface.
var _ ActionDB = (*SQLDB)(nil)

// NewSQLDB creates a new SQLStore instance given an open SQLQueries
// storage backend.
func NewSQLDB(sqlDB *sqldb.BaseDB, queries *sqlc.Queries,
	clock clock.Clock) *SQLDB {

	executor := NewSQLQueriesExecutor(sqlDB, queries)

	return &SQLDB{
		db:     executor,
		BaseDB: sqlDB,
		clock:  clock,
	}
}

// sqlExecutor is a concrete implementation of the DBExecutor interface that
// uses a SQL database as its backing store.
type sqlExecutor[T any] struct {
	db     BatchedSQLQueries
	wrapTx func(queries SQLQueries) T
}

// Update opens a database read/write transaction and executes the function f
// with the transaction passed as a parameter. After f exits, if f did not
// error, the transaction is committed. Otherwise, if f did error, the
// transaction is rolled back. If the rollback fails, the original error
// returned by f is still returned. If the commit fails, the commit error is
// returned.
//
// NOTE: this is part of the DBExecutor interface.
func (e *sqlExecutor[T]) Update(ctx context.Context,
	fn func(ctx context.Context, tx T) error) error {

	var txOpts db.QueriesTxOptions
	return e.db.ExecTx(ctx, &txOpts, func(queries SQLQueries) error {
		return fn(ctx, e.wrapTx(queries))
	}, sqldb.NoOpReset)
}

// View opens a database read transaction and executes the function f with the
// transaction passed as a parameter. After f exits, the transaction is rolled
// back. If f errors, its error is returned, not a rollback error (if any
// occur).
//
// NOTE: this is part of the DBExecutor interface.
func (e *sqlExecutor[T]) View(ctx context.Context,
	fn func(ctx context.Context, tx T) error) error {

	txOpts := db.NewQueryReadTx()

	return e.db.ExecTx(ctx, &txOpts, func(queries SQLQueries) error {
		return fn(ctx, e.wrapTx(queries))
	}, sqldb.NoOpReset)
}
