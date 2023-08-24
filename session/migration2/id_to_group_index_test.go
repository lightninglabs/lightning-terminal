package migration2

import (
	"testing"

	"github.com/btcsuite/btcd/btcec/v2"
	"github.com/lightninglabs/lightning-terminal/session/migtest"
	"github.com/stretchr/testify/require"
	"go.etcd.io/bbolt"
)

// ID represents the id of a session.
type ID [4]byte

// TestMigrateSessionIDToGroupIDIndex tests that the
// MigrateSessionIDToGroupIDIndex migration correctly back-fills the session ID
// to group ID index along with the group ID to session ID index.
func TestMigrateSessionIDToGroupIDIndex(t *testing.T) {
	t.Parallel()

	// Make a few session IDs.
	sess1ID, sess1Key := newSessionID(t)
	sess2ID, sess2Key := newSessionID(t)
	sess3ID, sess3Key := newSessionID(t)

	// Put together a sample session ID index DB based on the above.
	idIndexBefore := map[string]interface{}{
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

	// sessionDBBefore is what our session DB will look like before the
	// migration.
	sessionDBBefore := map[string]interface{}{
		string(idIndexKey):      idIndexBefore,
		string(groupIDIndexKey): map[string]interface{}{},
	}

	before := func(tx *bbolt.Tx) error {
		return migtest.RestoreDB(tx, sessionBucketKey, sessionDBBefore)
	}

	// Put together what we expect the resulting id-index bucket to look
	// like after the migration.
	idIndexAfter := map[string]interface{}{
		string(sess1ID[:]): map[string]interface{}{
			string(sessionKeyKey): string(sess1Key),
			string(groupIDKey):    string(sess1ID[:]),
		},
		string(sess2ID[:]): map[string]interface{}{
			string(sessionKeyKey): string(sess2Key),
			string(groupIDKey):    string(sess2ID[:]),
		},
		string(sess3ID[:]): map[string]interface{}{
			string(sessionKeyKey): string(sess3Key),
			string(groupIDKey):    string(sess3ID[:]),
		},
	}

	// Put together what we expect the resulting group-ID-index bucket to
	// look like after the migration.
	groupIDIndexAfter := map[string]interface{}{
		string(sess1ID[:]): map[string]interface{}{
			string(sessionIDKey): map[string]interface{}{
				sequenceString(1): string(sess1ID[:]),
			},
		},
		string(sess2ID[:]): map[string]interface{}{
			string(sessionIDKey): map[string]interface{}{
				sequenceString(1): string(sess2ID[:]),
			},
		},
		string(sess3ID[:]): map[string]interface{}{
			string(sessionIDKey): map[string]interface{}{
				sequenceString(1): string(sess3ID[:]),
			},
		},
	}

	// sessionDBAfter is what our session DB will look like after the
	// migration.
	sessionDBAfter := map[string]interface{}{
		string(idIndexKey):      idIndexAfter,
		string(groupIDIndexKey): groupIDIndexAfter,
	}

	after := func(tx *bbolt.Tx) error {
		return migtest.VerifyDB(tx, sessionBucketKey, sessionDBAfter)
	}

	migtest.ApplyMigration(
		t, before, after, MigrateSessionIDToGroupIndex, false,
	)
}

// newSessionID is a helper function that can be used to generate a new session
// ID and key.
func newSessionID(t *testing.T) (ID, []byte) {
	privateKey, err := btcec.NewPrivateKey()
	require.NoError(t, err)

	key := privateKey.PubKey().SerializeCompressed()

	var id ID
	copy(id[:], key)

	return id, key
}

func sequenceString(id uint64) string {
	var seqNoBytes [8]byte
	byteOrder.PutUint64(seqNoBytes[:], id)

	return string(seqNoBytes[:])
}
