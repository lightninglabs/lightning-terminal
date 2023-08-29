package migration1

import (
	"bytes"
	"testing"
	"time"

	"github.com/lightninglabs/lightning-terminal/session/migtest"
	"github.com/stretchr/testify/require"
	"go.etcd.io/bbolt"
)

// TestMigrateSessionIDIndex tests that the MigrateSessionIDIndex migration
// correctly back-fills the session-ID to session-key index.
func TestMigrateSessionIDIndex(t *testing.T) {
	t.Parallel()

	revokeTime := time.Unix(1000, 20)

	// Make a few sessions.
	sess1ID, _, sess1Key, sess1Bytes := newSession(t)
	sess2ID, _, sess2Key, sess2Bytes := newSession(t)
	sess3ID, _, sess3Key, sess3Bytes := newSession(t)
	_, sess4, sess4Key, _ := newSession(t)

	// Assert that the State of session 4 is StateCreated.
	require.Equal(t, StateCreated, sess4.State)

	// Overwrite the CreatedAt time of session 4 so that it is definitely
	// considered older than session 3.
	sess4.CreatedAt = time.Now().Add(-time.Hour)

	// Now re-serialise session 4.
	var sessBuff bytes.Buffer
	require.NoError(t, SerializeSession(&sessBuff, sess4))
	sess4Bytes := sessBuff.Bytes()

	// Overwrite the first 4 bytes of the key of session 4 so that it is
	// the same as session 3. This will mean that they have the same ID.
	copy(sess4Key[0:4], sess3Key[0:4])

	// Put together a sample session DB based on the above.
	sessionDBBefore := map[string]interface{}{
		string(sess1Key):   string(sess1Bytes),
		string(sess2Key):   string(sess2Bytes),
		string(sess3Key):   string(sess3Bytes),
		string(sess4Key):   string(sess4Bytes),
		string(idIndexKey): map[string]interface{}{},
	}

	before := func(tx *bbolt.Tx) error {
		return migtest.RestoreDB(tx, sessionBucketKey, sessionDBBefore)
	}

	// Put together what we expect the resulting index will look like.
	expectedIndex := map[string]interface{}{
		string(sess1ID[:]): map[string]interface{}{
			string(sessionKeyKey): string(sess1Key),
		},
		string(sess2ID[:]): map[string]interface{}{
			string(sessionKeyKey): string(sess2Key),
		},
		string(sess3ID[:]): map[string]interface{}{
			string(sessionKeyKey): string(sess3Key),
		},
	}

	// Since the DB contained two sessions with colliding IDs (session 3
	// and 4), we expect the oldest session of the two to be revoked during
	// the migration. So let's construct what we expect session 4 to look
	// like after the migration.
	sess4.RevokedAt = revokeTime
	sess4.State = StateRevoked

	sessBuff.Reset()
	require.NoError(t, SerializeSession(&sessBuff, sess4))
	sess4BytesAfter := sessBuff.Bytes()

	sessionDBAfter := map[string]interface{}{
		string(sess1Key):   string(sess1Bytes),
		string(sess2Key):   string(sess2Bytes),
		string(sess3Key):   string(sess3Bytes),
		string(sess4Key):   string(sess4BytesAfter),
		string(idIndexKey): expectedIndex,
	}

	// After the migration, we should have a new index bucket.
	after := func(tx *bbolt.Tx) error {
		return migtest.VerifyDB(tx, sessionBucketKey, sessionDBAfter)
	}

	migrateFn := func(tx *bbolt.Tx) error {
		return MigrateSessionIDToKeyIndex(tx, func() time.Time {
			return revokeTime
		})
	}

	migtest.ApplyMigration(t, before, after, migrateFn, false)
}

// newSession is a helper function that can be used to generate a random new
// Session. It returns the session ID, key and the serialised session.
func newSession(t *testing.T) (ID, *Session, []byte, []byte) {
	session, err := NewSession(
		"test-session", TypeMacaroonAdmin,
		time.Date(99999, 1, 1, 0, 0, 0, 0, time.UTC),
		"foo.bar.baz:1234", true, nil, nil, nil, false,
	)
	require.NoError(t, err)

	var sessBuff bytes.Buffer
	err = SerializeSession(&sessBuff, session)
	require.NoError(t, err)

	key := session.LocalPublicKey.SerializeCompressed()

	return session.ID, session, key, sessBuff.Bytes()
}
