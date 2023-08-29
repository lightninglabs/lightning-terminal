package migtest

import (
	"testing"

	"github.com/stretchr/testify/require"
	"go.etcd.io/bbolt"
)

// TestRestoreAndVerifyDB tests that the RestoreDB and VerifyDB helper methods
// works as expected.
func TestRestoreAndVerifyDB(t *testing.T) {
	// Define the top leve key name and the DB structure.
	topLevelKey := []byte("top-level")

	dbStructure := map[string]interface{}{
		"key1": "value1",
		"bucket1": map[string]interface{}{
			"key2": "value2",
			"bucket2": map[string]interface{}{
				"key3": "value3",
			},
			"bucket3": map[string]interface{}{
				"key4": "value4",
			},
		},
	}

	// Create the DB and attempt to restore the DB structure.
	db := MakeDB(t)

	err := db.Update(func(tx *bbolt.Tx) error {
		return RestoreDB(tx, topLevelKey, dbStructure)
	})
	require.NoError(t, err)

	// Check that the VerifyDB method passes.
	err = db.View(func(tx *bbolt.Tx) error {
		return VerifyDB(tx, topLevelKey, dbStructure)
	})
	require.NoError(t, err)

	// Now manually do some checks based on what we know about the db
	// structure.
	err = db.View(func(tx *bbolt.Tx) error {
		// Query for a bucket we did not create and ensure that nil is
		// returned.
		bucket := tx.Bucket([]byte("top-level-2"))
		require.Nil(t, bucket)

		// Query for the actual top level bucket.
		bucket = tx.Bucket(topLevelKey)
		require.NotNil(t, bucket)

		// Test the first bucket level.
		require.Equal(t, []byte("value1"), bucket.Get([]byte("key1")))
		require.Nil(t, bucket.Get([]byte("bucket1")))
		require.Nil(t, bucket.Get([]byte("key2")))

		// Test the second bucket level.
		bucket1 := bucket.Bucket([]byte("bucket1"))
		require.NotNil(t, bucket1)

		require.Equal(t, []byte("value2"), bucket1.Get([]byte("key2")))
		require.Nil(t, bucket1.Get([]byte("key1")))
		require.Nil(t, bucket1.Get([]byte("bucket1")))
		require.Nil(t, bucket1.Get([]byte("bucket2")))

		bucket2 := bucket1.Bucket([]byte("bucket2"))
		require.NotNil(t, bucket2)
		require.Equal(t, []byte("value3"), bucket2.Get([]byte("key3")))

		bucket3 := bucket1.Bucket([]byte("bucket3"))
		require.NotNil(t, bucket3)
		require.Equal(t, []byte("value4"), bucket3.Get([]byte("key4")))

		return nil
	})
	require.NoError(t, err)
}
