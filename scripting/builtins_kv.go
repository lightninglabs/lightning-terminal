package scripting

import (
	"fmt"

	"go.starlark.net/starlark"
)

// KVStore defines the interface for the key-value store.
type KVStore interface {
	// Get retrieves a value from the store.
	Get(bucket, key string) ([]byte, bool, error)

	// Put stores a value in the store.
	Put(bucket, key string, value []byte) error

	// Delete removes a value from the store.
	Delete(bucket, key string) error

	// List returns all keys in a bucket matching the prefix.
	List(bucket, prefix string) ([]string, error)
}

// registerKVBuiltins adds KV store builtin functions.
func (e *Engine) registerKVBuiltins(predeclared starlark.StringDict) {
	predeclared["kv_get"] = starlark.NewBuiltin("kv_get", e.builtinKVGet)
	predeclared["kv_put"] = starlark.NewBuiltin("kv_put", e.builtinKVPut)
	predeclared["kv_delete"] = starlark.NewBuiltin("kv_delete", e.builtinKVDelete)
	predeclared["kv_list"] = starlark.NewBuiltin("kv_list", e.builtinKVList)
}

// resolveBucket returns the bucket to use, defaulting to the script's own
// bucket if not specified.
func (e *Engine) resolveBucket(bucket string) (string, error) {
	if bucket == "" {
		return e.scriptName, nil
	}

	// Check if the script is allowed to access this bucket.
	if bucket != e.scriptName && !e.isBucketAllowed(bucket) {
		return "", fmt.Errorf("bucket '%s' not in allowlist", bucket)
	}

	return bucket, nil
}

// isBucketAllowed checks if a bucket is in the script's allowed buckets.
func (e *Engine) isBucketAllowed(bucket string) bool {
	for _, allowed := range e.allowedBuckets {
		if allowed == bucket {
			return true
		}
	}
	return false
}

// builtinKVGet implements kv_get(key, bucket=None).
func (e *Engine) builtinKVGet(thread *starlark.Thread, fn *starlark.Builtin,
	args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {

	var key string
	var bucket string

	if err := starlark.UnpackArgs("kv_get", args, kwargs,
		"key", &key,
		"bucket?", &bucket,
	); err != nil {
		return nil, err
	}

	resolvedBucket, err := e.resolveBucket(bucket)
	if err != nil {
		return nil, err
	}

	if e.kvStore == nil {
		return nil, fmt.Errorf("KV store not available")
	}

	value, found, err := e.kvStore.Get(resolvedBucket, key)
	if err != nil {
		return nil, fmt.Errorf("kv_get failed: %w", err)
	}

	if !found {
		return starlark.None, nil
	}

	// Try to decode as JSON first for structured data.
	starlarkVal, err := toStarlarkValue(string(value))
	if err != nil {
		// Fall back to returning as bytes.
		return starlark.Bytes(value), nil
	}

	return starlarkVal, nil
}

// builtinKVPut implements kv_put(key, value, bucket=None).
func (e *Engine) builtinKVPut(thread *starlark.Thread, fn *starlark.Builtin,
	args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {

	var key string
	var value starlark.Value
	var bucket string

	if err := starlark.UnpackArgs("kv_put", args, kwargs,
		"key", &key,
		"value", &value,
		"bucket?", &bucket,
	); err != nil {
		return nil, err
	}

	resolvedBucket, err := e.resolveBucket(bucket)
	if err != nil {
		return nil, err
	}

	if e.kvStore == nil {
		return nil, fmt.Errorf("KV store not available")
	}

	// Convert Starlark value to bytes.
	var valueBytes []byte
	switch v := value.(type) {
	case starlark.String:
		valueBytes = []byte(string(v))
	case starlark.Bytes:
		valueBytes = []byte(v)
	case starlark.Int:
		valueBytes = []byte(v.String())
	case starlark.Float:
		valueBytes = []byte(v.String())
	case starlark.Bool:
		if v {
			valueBytes = []byte("true")
		} else {
			valueBytes = []byte("false")
		}
	default:
		// For complex types, use JSON encoding.
		goVal, err := fromStarlarkValue(value)
		if err != nil {
			return nil, fmt.Errorf("cannot convert value to bytes: %w", err)
		}
		jsonStr, err := toStarlarkValue(goVal)
		if err != nil {
			return nil, fmt.Errorf("cannot encode value: %w", err)
		}
		valueBytes = []byte(jsonStr.String())
	}

	if err := e.kvStore.Put(resolvedBucket, key, valueBytes); err != nil {
		return nil, fmt.Errorf("kv_put failed: %w", err)
	}

	return starlark.None, nil
}

// builtinKVDelete implements kv_delete(key, bucket=None).
func (e *Engine) builtinKVDelete(thread *starlark.Thread, fn *starlark.Builtin,
	args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {

	var key string
	var bucket string

	if err := starlark.UnpackArgs("kv_delete", args, kwargs,
		"key", &key,
		"bucket?", &bucket,
	); err != nil {
		return nil, err
	}

	resolvedBucket, err := e.resolveBucket(bucket)
	if err != nil {
		return nil, err
	}

	if e.kvStore == nil {
		return nil, fmt.Errorf("KV store not available")
	}

	if err := e.kvStore.Delete(resolvedBucket, key); err != nil {
		return nil, fmt.Errorf("kv_delete failed: %w", err)
	}

	return starlark.None, nil
}

// builtinKVList implements kv_list(prefix="", bucket=None).
func (e *Engine) builtinKVList(thread *starlark.Thread, fn *starlark.Builtin,
	args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {

	var prefix string
	var bucket string

	if err := starlark.UnpackArgs("kv_list", args, kwargs,
		"prefix?", &prefix,
		"bucket?", &bucket,
	); err != nil {
		return nil, err
	}

	resolvedBucket, err := e.resolveBucket(bucket)
	if err != nil {
		return nil, err
	}

	if e.kvStore == nil {
		return nil, fmt.Errorf("KV store not available")
	}

	keys, err := e.kvStore.List(resolvedBucket, prefix)
	if err != nil {
		return nil, fmt.Errorf("kv_list failed: %w", err)
	}

	// Convert to Starlark list.
	result := make([]starlark.Value, len(keys))
	for i, key := range keys {
		result[i] = starlark.String(key)
	}

	return starlark.NewList(result), nil
}
