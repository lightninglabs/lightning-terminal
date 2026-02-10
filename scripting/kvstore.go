package scripting

import (
	"context"
	"strings"
	"time"
)

// KVStoreDB defines the interface for the KV store database operations.
type KVStoreDB interface {
	// KVGet retrieves a value from the store.
	KVGet(ctx context.Context, bucket, key string) ([]byte, error)

	// KVPut stores a value in the store.
	KVPut(ctx context.Context, bucket, key string, value []byte) error

	// KVDelete removes a value from the store.
	KVDelete(ctx context.Context, bucket, key string) error

	// KVList returns all keys in a bucket matching the prefix.
	KVList(ctx context.Context, bucket, prefix string) ([]string, error)

	// KVDeleteBucket deletes all keys in a bucket.
	KVDeleteBucket(ctx context.Context, bucket string) error
}

// SQLKVStore implements KVStore using the SQL database.
type SQLKVStore struct {
	db KVStoreDB
}

// NewSQLKVStore creates a new SQL-backed KV store.
func NewSQLKVStore(db KVStoreDB) *SQLKVStore {
	return &SQLKVStore{db: db}
}

// Get retrieves a value from the store.
func (s *SQLKVStore) Get(bucket, key string) ([]byte, bool, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	value, err := s.db.KVGet(ctx, bucket, key)
	if err != nil {
		// Check if it's a "not found" error.
		if strings.Contains(err.Error(), "not found") ||
			strings.Contains(err.Error(), "no rows") {
			return nil, false, nil
		}
		return nil, false, err
	}

	if value == nil {
		return nil, false, nil
	}

	return value, true, nil
}

// Put stores a value in the store.
func (s *SQLKVStore) Put(bucket, key string, value []byte) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	return s.db.KVPut(ctx, bucket, key, value)
}

// Delete removes a value from the store.
func (s *SQLKVStore) Delete(bucket, key string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	return s.db.KVDelete(ctx, bucket, key)
}

// List returns all keys in a bucket matching the prefix.
func (s *SQLKVStore) List(bucket, prefix string) ([]string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	return s.db.KVList(ctx, bucket, prefix)
}

// DeleteBucket deletes all keys in a bucket.
func (s *SQLKVStore) DeleteBucket(bucket string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	return s.db.KVDeleteBucket(ctx, bucket)
}

// InMemoryKVStore is a simple in-memory KV store for testing.
type InMemoryKVStore struct {
	data map[string]map[string][]byte
}

// NewInMemoryKVStore creates a new in-memory KV store.
func NewInMemoryKVStore() *InMemoryKVStore {
	return &InMemoryKVStore{
		data: make(map[string]map[string][]byte),
	}
}

// Get retrieves a value from the store.
func (s *InMemoryKVStore) Get(bucket, key string) ([]byte, bool, error) {
	bucketData, ok := s.data[bucket]
	if !ok {
		return nil, false, nil
	}

	value, ok := bucketData[key]
	if !ok {
		return nil, false, nil
	}

	return value, true, nil
}

// Put stores a value in the store.
func (s *InMemoryKVStore) Put(bucket, key string, value []byte) error {
	if _, ok := s.data[bucket]; !ok {
		s.data[bucket] = make(map[string][]byte)
	}

	s.data[bucket][key] = value
	return nil
}

// Delete removes a value from the store.
func (s *InMemoryKVStore) Delete(bucket, key string) error {
	if bucketData, ok := s.data[bucket]; ok {
		delete(bucketData, key)
	}
	return nil
}

// List returns all keys in a bucket matching the prefix.
func (s *InMemoryKVStore) List(bucket, prefix string) ([]string, error) {
	bucketData, ok := s.data[bucket]
	if !ok {
		return nil, nil
	}

	var keys []string
	for key := range bucketData {
		if prefix == "" || strings.HasPrefix(key, prefix) {
			keys = append(keys, key)
		}
	}

	return keys, nil
}
