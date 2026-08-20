//go:build test_db_postgres || test_db_sqlite

package session

import (
	"context"
	"sync"
	"testing"
	"time"

	"github.com/lightningnetwork/lnd/clock"
	"github.com/stretchr/testify/require"
)

// TestConcurrentGetSession asserts that concurrent GetSession calls on the SQL
// store do not deadlock. The SQLite pool only holds two connections and every
// transaction takes the write lock at BEGIN, so any nested connection
// acquisition inside an open transaction wedges the store as soon as two
// callers race.
func TestConcurrentGetSession(t *testing.T) {
	ctx := context.Background()
	clock := clock.NewTestClock(testTime)
	db := NewTestDB(t, clock)

	sess := createSession(t, db, "test-session")

	// Fire more concurrent readers than the SQLite pool has connections so
	// that a nested acquisition is guaranteed to starve.
	const numCallers = 4

	var (
		start sync.WaitGroup
		done  = make(chan error, numCallers)
	)
	start.Add(1)

	for i := 0; i < numCallers; i++ {
		go func() {
			start.Wait()

			_, err := db.GetSession(ctx, sess.ID)
			done <- err
		}()
	}

	start.Done()

	timeout := time.After(20 * time.Second)
	for i := 0; i < numCallers; i++ {
		select {
		case err := <-done:
			require.NoError(t, err)

		case <-timeout:
			t.Fatalf("GetSession deadlocked: only %d of %d "+
				"concurrent calls completed", i, numCallers)
		}
	}
}
