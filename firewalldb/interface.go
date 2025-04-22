package firewalldb

import (
	"context"

	"github.com/lightninglabs/lightning-terminal/session"
)

// SessionDB is an interface that abstracts the database operations needed for
// the privacy mapper to function.
type SessionDB interface {
	session.IDToGroupIndex

	// GetSession returns the session for a specific id.
	GetSession(context.Context, session.ID) (*session.Session, error)
}

// DBExecutor provides an Update and View method that will allow the caller
// to perform atomic read and write transactions defined by PrivacyMapTx on the
// underlying BoltDB.
type DBExecutor[T any] interface {
	// Update opens a database read/write transaction and executes the
	// function f with the transaction passed as a parameter. After f exits,
	// if f did not error, the transaction is committed. Otherwise, if f did
	// error, the transaction is rolled back. If the rollback fails, the
	// original error returned by f is still returned. If the commit fails,
	// the commit error is returned.
	Update(ctx context.Context, f func(ctx context.Context,
		tx T) error) error

	// View opens a database read transaction and executes the function f
	// with the transaction passed as a parameter. After f exits, the
	// transaction is rolled back. If f errors, its error is returned, not a
	// rollback error (if any occur).
	View(ctx context.Context, f func(ctx context.Context,
		tx T) error) error
}

// KVStores provides an Update and View method that will allow the caller to
// perform atomic read and write transactions on and of the key value stores
// offered the KVStoreTx.
type KVStores = DBExecutor[KVStoreTx]

// KVStoreTx represents a database transaction that can be used for both read
// and writes of the various different key value stores offered for the rule.
type KVStoreTx interface {
	// Global returns a persisted global, rule-name indexed, kv store. A
	// rule with a given name will have access to this store independent of
	// group ID or feature.
	Global() KVStore

	// Local returns a persisted local kv store for the rule. Depending on
	// how the implementation is initialised, this will either be under the
	// group ID namespace or the group ID _and_ feature name namespace.
	Local() KVStore

	// GlobalTemp is similar to the Global store except that its contents
	// is cleared upon restart of the database. The reason persisting the
	// temporary store changes instead of just keeping an in-memory store is
	// that we can then guarantee atomicity if changes are made to both
	// the permanent and temporary stores.
	GlobalTemp() KVStore

	// LocalTemp is similar to the Local store except that its contents is
	// cleared upon restart of the database. The reason persisting the
	// temporary store changes instead of just keeping an in-memory store is
	// that we can then guarantee atomicity if changes are made to both
	// the permanent and temporary stores.
	LocalTemp() KVStore
}

// KVStore is in interface representing a key value store. It allows us to
// abstract away the details of the data storage method.
type KVStore interface {
	// Get fetches the value under the given key from the underlying kv
	// store. If no value is found, nil is returned.
	Get(ctx context.Context, key string) ([]byte, error)

	// Set sets the given key-value pair in the underlying kv store.
	Set(ctx context.Context, key string, value []byte) error

	// Del deletes the value under the given key in the underlying kv store.
	Del(ctx context.Context, key string) error
}

// RulesDB can be used to initialise a new rules.KVStores.
type RulesDB interface {
	// GetKVStores constructs a new rules.KVStores in a namespace defined
	// by the rule name, group ID and feature name.
	GetKVStores(rule string, groupID session.ID, feature string) KVStores

	// DeleteTempKVStores deletes all temporary kv stores.
	DeleteTempKVStores(ctx context.Context) error
}

// PrivacyMapper is an interface that abstracts access to the privacy mapper
// database.
type PrivacyMapper interface {
	// PrivacyDB constructs a PrivacyMapDB that will be indexed under the
	// given group ID key.
	PrivacyDB(groupID session.ID) PrivacyMapDB
}
