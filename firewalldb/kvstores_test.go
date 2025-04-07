package firewalldb

import (
	"bytes"
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/lightninglabs/lightning-terminal/session"
	"github.com/lightningnetwork/lnd/clock"
	"github.com/stretchr/testify/require"
)

// TestKVStoreTxs tests that the `Update` and `View` functions correctly provide
// atomic access to the db. If anything fails in the middle of an `Update`
// function, then all the changes prior should be rolled back.
func TestKVStoreTxs(t *testing.T) {
	t.Parallel()

	ctx := context.Background()
	db := NewTestDB(t)
	store := db.GetKVStores("AutoFees", [4]byte{1, 1, 1, 1}, "auto-fees")

	// Test that if an action fails midway through the transaction, then
	// it is rolled back.
	err := store.Update(ctx, func(ctx context.Context, tx KVStoreTx) error {
		err := tx.Global().Set(ctx, "test", []byte{1})
		if err != nil {
			return err
		}

		b, err := tx.Global().Get(ctx, "test")
		if err != nil {
			return err
		}
		require.True(t, bytes.Equal(b, []byte{1}))

		// Now return an error.
		return fmt.Errorf("random error")
	})
	require.Error(t, err)

	var v []byte
	err = store.View(ctx, func(ctx context.Context, tx KVStoreTx) error {
		b, err := tx.Global().Get(ctx, "test")
		if err != nil {
			return err
		}
		v = b
		return nil
	})
	require.NoError(t, err)
	require.Nil(t, v)
}

// TestTempAndPermStores tests that the kv stores stored under the `temp` bucket
// are properly deleted and re-initialised upon restart but that anything under
// the `perm` bucket is retained. We repeat the test for both the session level
// KV stores and the session feature level stores.
func TestTempAndPermStores(t *testing.T) {
	t.Run("session level kv store", func(t *testing.T) {
		t.Parallel()

		testTempAndPermStores(t, false)
	})

	t.Run("session feature level kv store", func(t *testing.T) {
		t.Parallel()

		testTempAndPermStores(t, true)
	})
}

// testTempAndPermStores tests that the kv stores stored under the `temp` bucket
// are properly deleted and re-initialised upon restart but that anything under
// the `perm` bucket is retained. If featureSpecificStore is true, then this
// will test the session feature level KV stores. Otherwise, it will test the
// session level KV stores.
func testTempAndPermStores(t *testing.T, featureSpecificStore bool) {
	ctx := context.Background()

	var featureName string
	if featureSpecificStore {
		featureName = "auto-fees"
	}

	sessions := session.NewTestDB(t, clock.NewDefaultClock())
	store := NewTestDBWithSessions(t, sessions)
	db := NewDB(store)
	require.NoError(t, db.Start(ctx))

	// Create a session that we can reference.
	sess, err := sessions.NewSession(
		ctx, "test", session.TypeAutopilot, time.Unix(1000, 0),
		"something",
	)
	require.NoError(t, err)

	kvstores := db.GetKVStores("test-rule", sess.GroupID, featureName)

	err = kvstores.Update(ctx, func(ctx context.Context,
		tx KVStoreTx) error {

		// Set an item in the temp store.
		err := tx.LocalTemp().Set(ctx, "test", []byte{4, 3, 2})
		if err != nil {
			return err
		}

		// Set an item in the perm store.
		return tx.Local().Set(ctx, "test", []byte{6, 5, 4})
	})
	require.NoError(t, err)

	// Make sure that the newly added items are properly reflected _before_
	// restart.
	var (
		v1 []byte
		v2 []byte
	)
	err = kvstores.View(ctx, func(ctx context.Context, tx KVStoreTx) error {
		b, err := tx.LocalTemp().Get(ctx, "test")
		if err != nil {
			return err
		}
		v1 = b

		b, err = tx.Local().Get(ctx, "test")
		if err != nil {
			return err
		}
		v2 = b
		return nil
	})
	require.NoError(t, err)
	require.True(t, bytes.Equal(v1, []byte{4, 3, 2}))
	require.True(t, bytes.Equal(v2, []byte{6, 5, 4}))

	// Re-init the DB.
	require.NoError(t, db.Stop())
	db = NewDB(store)
	require.NoError(t, db.Start(ctx))
	t.Cleanup(func() {
		require.NoError(t, db.Stop())
	})

	kvstores = db.GetKVStores("test-rule", sess.GroupID, featureName)

	// The temp store should no longer have the stored value but the perm
	// store should .
	err = kvstores.View(ctx, func(ctx context.Context, tx KVStoreTx) error {
		b, err := tx.LocalTemp().Get(ctx, "test")
		if err != nil {
			return err
		}
		v1 = b

		b, err = tx.Local().Get(ctx, "test")
		if err != nil {
			return err
		}
		v2 = b
		return nil
	})
	require.NoError(t, err)
	require.Nil(t, v1)
	require.True(t, bytes.Equal(v2, []byte{6, 5, 4}))
}

// TestKVStoreNameSpaces tests that the various name spaces are used correctly.
func TestKVStoreNameSpaces(t *testing.T) {
	t.Parallel()
	ctx := context.Background()

	sessions := session.NewTestDB(t, clock.NewDefaultClock())
	db := NewTestDBWithSessions(t, sessions)

	// Create 2 sessions that we can reference.
	sess1, err := sessions.NewSession(
		ctx, "test", session.TypeAutopilot, time.Unix(1000, 0), "",
	)
	require.NoError(t, err)

	sess2, err := sessions.NewSession(
		ctx, "test1", session.TypeAutopilot, time.Unix(1000, 0), "",
	)
	require.NoError(t, err)

	// Two DBs for same group but different features.
	rulesDB1 := db.GetKVStores("test-rule", sess1.GroupID, "auto-fees")
	rulesDB2 := db.GetKVStores("test-rule", sess1.GroupID, "re-balance")

	// The third DB is for the same rule but a different group. It is
	// for the same feature as db 2.
	rulesDB3 := db.GetKVStores("test-rule", sess2.GroupID, "re-balance")

	// Test that the three ruleDBs share the same global space.
	err = rulesDB1.Update(ctx, func(ctx context.Context,
		tx KVStoreTx) error {

		return tx.Global().Set(
			ctx, "test-global", []byte("global thing!"),
		)
	})
	require.NoError(t, err)

	err = rulesDB2.Update(ctx, func(ctx context.Context,
		tx KVStoreTx) error {

		return tx.Global().Set(
			ctx, "test-global", []byte("different global thing!"),
		)
	})
	require.NoError(t, err)

	err = rulesDB3.Update(ctx, func(ctx context.Context,
		tx KVStoreTx) error {

		return tx.Global().Set(
			ctx, "test-global", []byte("yet another global thing"),
		)
	})
	require.NoError(t, err)

	var v []byte
	err = rulesDB1.View(ctx, func(ctx context.Context,
		tx KVStoreTx) error {

		b, err := tx.Global().Get(ctx, "test-global")
		if err != nil {
			return err
		}
		v = b
		return nil
	})
	require.NoError(t, err)
	require.True(t, bytes.Equal(v, []byte("yet another global thing")))

	err = rulesDB2.View(ctx, func(ctx context.Context,
		tx KVStoreTx) error {

		b, err := tx.Global().Get(ctx, "test-global")
		if err != nil {
			return err
		}
		v = b
		return nil
	})
	require.NoError(t, err)
	require.True(t, bytes.Equal(v, []byte("yet another global thing")))

	err = rulesDB3.View(ctx, func(ctx context.Context,
		tx KVStoreTx) error {

		b, err := tx.Global().Get(ctx, "test-global")
		if err != nil {
			return err
		}
		v = b
		return nil
	})
	require.NoError(t, err)
	require.True(t, bytes.Equal(v, []byte("yet another global thing")))

	// Test that the feature space is not shared by any of the dbs.
	err = rulesDB1.Update(ctx, func(ctx context.Context,
		tx KVStoreTx) error {

		return tx.Local().Set(ctx, "count", []byte("1"))
	})
	require.NoError(t, err)

	err = rulesDB2.Update(ctx, func(ctx context.Context,
		tx KVStoreTx) error {

		return tx.Local().Set(ctx, "count", []byte("2"))
	})
	require.NoError(t, err)

	err = rulesDB3.Update(ctx, func(ctx context.Context,
		tx KVStoreTx) error {

		return tx.Local().Set(ctx, "count", []byte("3"))
	})
	require.NoError(t, err)

	err = rulesDB1.View(ctx, func(ctx context.Context,
		tx KVStoreTx) error {

		b, err := tx.Local().Get(ctx, "count")
		if err != nil {
			return err
		}
		v = b
		return nil
	})
	require.NoError(t, err)
	require.True(t, bytes.Equal(v, []byte("1")))

	err = rulesDB2.View(ctx, func(ctx context.Context,
		tx KVStoreTx) error {

		b, err := tx.Local().Get(ctx, "count")
		if err != nil {
			return err
		}
		v = b
		return nil
	})
	require.NoError(t, err)
	require.True(t, bytes.Equal(v, []byte("2")))

	err = rulesDB3.View(ctx, func(ctx context.Context,
		tx KVStoreTx) error {

		b, err := tx.Local().Get(ctx, "count")
		if err != nil {
			return err
		}
		v = b
		return nil
	})
	require.NoError(t, err)
	require.True(t, bytes.Equal(v, []byte("3")))

	// Test that the group space is shared by the first two dbs but not
	// the third. To do this, we re-init the DB's but leave the feature
	// names out. This way, we will access the group storage.
	rulesDB1 = db.GetKVStores("test-rule", sess1.GroupID, "")
	rulesDB2 = db.GetKVStores("test-rule", sess1.GroupID, "")
	rulesDB3 = db.GetKVStores("test-rule", sess2.GroupID, "")

	err = rulesDB1.Update(ctx, func(ctx context.Context,
		tx KVStoreTx) error {

		return tx.Local().Set(ctx, "test", []byte("thing 1"))
	})
	require.NoError(t, err)

	err = rulesDB2.Update(ctx, func(ctx context.Context,
		tx KVStoreTx) error {

		return tx.Local().Set(ctx, "test", []byte("thing 2"))
	})
	require.NoError(t, err)

	err = rulesDB3.Update(ctx, func(ctx context.Context,
		tx KVStoreTx) error {

		return tx.Local().Set(ctx, "test", []byte("thing 3"))
	})
	require.NoError(t, err)

	err = rulesDB1.View(ctx, func(ctx context.Context,
		tx KVStoreTx) error {

		b, err := tx.Local().Get(ctx, "test")
		if err != nil {
			return err
		}
		v = b
		return nil
	})
	require.NoError(t, err)
	require.True(t, bytes.Equal(v, []byte("thing 2")))

	err = rulesDB2.View(ctx, func(ctx context.Context,
		tx KVStoreTx) error {

		b, err := tx.Local().Get(ctx, "test")
		if err != nil {
			return err
		}
		v = b
		return nil
	})
	require.NoError(t, err)
	require.True(t, bytes.Equal(v, []byte("thing 2")))

	err = rulesDB3.View(ctx, func(ctx context.Context,
		tx KVStoreTx) error {

		b, err := tx.Local().Get(ctx, "test")
		if err != nil {
			return err
		}
		v = b
		return nil
	})
	require.NoError(t, err)
	require.True(t, bytes.Equal(v, []byte("thing 3")))
}

// TestKVStoreSessionCoupling tests if we attempt to write to a kvstore that
// is namespaced by a session that does not exist, then we should get an error.
func TestKVStoreSessionCoupling(t *testing.T) {
	t.Parallel()
	ctx := context.Background()

	sessions := session.NewTestDB(t, clock.NewDefaultClock())
	db := NewTestDBWithSessions(t, sessions)

	// Get a kvstore namespaced by a session ID for a session that does
	// not exist.
	store := db.GetKVStores("AutoFees", [4]byte{1, 1, 1, 1}, "auto-fees")

	err := store.Update(ctx, func(ctx context.Context,
		tx KVStoreTx) error {

		// First, show that any call to the global namespace will not
		// error since it is not namespaced by a session.
		res, err := tx.Global().Get(ctx, "foo")
		require.NoError(t, err)
		require.Nil(t, res)

		err = tx.Global().Set(ctx, "foo", []byte("bar"))
		require.NoError(t, err)

		res, err = tx.Global().Get(ctx, "foo")
		require.NoError(t, err)
		require.Equal(t, []byte("bar"), res)

		// Now we switch to the local store. We don't expect the Get
		// call to error since it should just return a nil value for
		// key that has not been set.
		_, err = tx.Local().Get(ctx, "foo")
		require.NoError(t, err)

		// For Set, we expect an error since the session does not exist.
		err = tx.Local().Set(ctx, "foo", []byte("bar"))
		require.ErrorIs(t, err, session.ErrUnknownGroup)

		// We again don't expect the error for delete since we just
		// expect it to return nil if the key is not found.
		err = tx.Local().Del(ctx, "foo")
		require.NoError(t, err)

		return nil
	})
	require.NoError(t, err)

	// Now, go and create a sessions in the session DB.
	sess, err := sessions.NewSession(
		ctx, "test", session.TypeAutopilot, time.Unix(1000, 0),
		"something",
	)
	require.NoError(t, err)

	// Get a kvstore namespaced by a session ID for a session that now
	// does exist.
	store = db.GetKVStores("AutoFees", sess.GroupID, "auto-fees")

	// Now, repeat the "Set" call for this session's kvstore to
	// show that it no longer errors.
	err = store.Update(ctx, func(ctx context.Context, tx KVStoreTx) error {
		// For Set, we expect an error since the session does not exist.
		err = tx.Local().Set(ctx, "foo", []byte("bar"))
		require.NoError(t, err)

		res, err := tx.Local().Get(ctx, "foo")
		require.NoError(t, err)
		require.Equal(t, []byte("bar"), res)

		return nil
	})
	require.NoError(t, err)
}

func intToSessionID(i uint32) session.ID {
	var id session.ID
	byteOrder.PutUint32(id[:], i)

	return id
}
