package firewalldb

import (
	"context"

	"go.etcd.io/bbolt"
)

// kvdbExecutor is a concrete implementation of the DBExecutor interface that
// uses a bbolt database as its backing store.
type kvdbExecutor[T any] struct {
	db     *bbolt.DB
	wrapTx func(tx *bbolt.Tx) T
}

// Update opens a database read/write transaction and executes the function f
// with the transaction passed as a parameter. After f exits, if f did not
// error, the transaction is committed. Otherwise, if f did error, the
// transaction is rolled back. If the rollback fails, the original error
// returned by f is still returned. If the commit fails, the commit error is
// returned.
//
// NOTE: this is part of the DBExecutor interface.
func (e *kvdbExecutor[T]) Update(ctx context.Context,
	fn func(ctx context.Context, tx T) error) error {

	return e.db.Update(func(tx *bbolt.Tx) error {
		return fn(ctx, e.wrapTx(tx))
	})
}

// View opens a database read transaction and executes the function f with the
// transaction passed as a parameter. After f exits, the transaction is rolled
// back. If f errors, its error is returned, not a rollback error (if any
// occur).
//
// NOTE: this is part of the DBExecutor interface.
func (e *kvdbExecutor[T]) View(ctx context.Context,
	fn func(ctx context.Context, tx T) error) error {

	return e.db.View(func(tx *bbolt.Tx) error {
		return fn(ctx, e.wrapTx(tx))
	})
}
