package rules

import (
	"context"
	"sync"

	"github.com/lightninglabs/lightning-terminal/firewalldb"
)

type mockKVStoresTX struct {
	firewalldb.KVStoreTx

	global     firewalldb.KVStore
	local      firewalldb.KVStore
	globalTemp firewalldb.KVStore
	localTemp  firewalldb.KVStore
}

func newMockKVStoresTx() *mockKVStoresTX {
	return &mockKVStoresTX{
		global:     newInMemKVStore(),
		local:      newInMemKVStore(),
		globalTemp: newInMemKVStore(),
		localTemp:  newInMemKVStore(),
	}
}

func (m *mockKVStoresTX) Global() firewalldb.KVStore {
	return m.global
}

func (m *mockKVStoresTX) Local() firewalldb.KVStore {
	return m.local
}

func (m *mockKVStoresTX) GlobalTemp() firewalldb.KVStore {
	return m.globalTemp
}

func (m *mockKVStoresTX) LocalTemp() firewalldb.KVStore {
	return m.localTemp
}

var _ firewalldb.KVStoreTx = (*mockKVStoresTX)(nil)

type mockKVStores struct {
	tx *mockKVStoresTX
}

func (m *mockKVStores) Update(f func(tx firewalldb.KVStoreTx) error) error {
	return f(m.tx)
}

func (m *mockKVStores) View(f func(tx firewalldb.KVStoreTx) error) error {
	return f(m.tx)
}

var _ firewalldb.KVStores = (*mockKVStores)(nil)

// memKVStore is an in-memory key value store.
type memKVStore struct {
	store map[string][]byte
	sync.RWMutex
}

// newInMemKVStore constructs a new memKVStore.
func newInMemKVStore() *memKVStore {
	return &memKVStore{
		store: make(map[string][]byte),
	}
}

// Get fetches the value for the given key from the kv store if it exists.
func (m *memKVStore) Get(_ context.Context, key string) ([]byte, error) {
	m.RLock()
	defer m.RUnlock()

	v, ok := m.store[key]
	if !ok {
		// We don't error if the key doesn't exist.
		return nil, nil
	}

	return v, nil
}

// Set sets the value for the given key in the kv store.
func (m *memKVStore) Set(_ context.Context, key string, value []byte) error {
	m.Lock()
	defer m.Unlock()

	m.store[key] = value
	return nil
}

// Del deletes the value for the given key from the kv store if it exists.
func (m *memKVStore) Del(_ context.Context, key string) error {
	m.Lock()
	defer m.Unlock()

	delete(m.store, key)
	return nil
}

// A compile-time check to assert that memKVStore implements the KVStore
// interface.
var _ firewalldb.KVStore = (*memKVStore)(nil)
