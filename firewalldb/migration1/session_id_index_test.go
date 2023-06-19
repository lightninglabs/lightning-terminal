package migration1

import (
	"testing"

	"github.com/lightninglabs/lightning-terminal/firewalldb/migtest"
	"go.etcd.io/bbolt"
)

var (
	// privacyMapDB is the data to fill the privacy map DB with before the
	// migration.
	privacyMapDB = map[string]interface{}{
		sessionIDString(1): string([]byte{1, 2, 3}),
		sessionIDString(2): string([]byte{4, 5, 6}),
	}

	// actionsDB is the data to fill the actions DB with before the
	// migration.
	actionsDB = map[string]interface{}{
		string(actionsKey): map[string]interface{}{
			sessionIDString(1): string([]byte{1, 2, 3}),
			sessionIDString(2): string([]byte{4, 5, 6}),
			sessionIDString(3): string([]byte{7, 8, 9}),
		},
	}

	// rulesDB is the data to fill the rules DB with before the migration.
	rulesDB = map[string]interface{}{
		string(permBucketKey): map[string]interface{}{
			sessionIDString(5): string([]byte{2, 1, 3}),
		},
	}

	indexAll = map[string]interface{}{
		string(sessionToGroupKey): map[string]interface{}{
			sessionIDString(1): sessionIDString(1),
			sessionIDString(2): sessionIDString(2),
			sessionIDString(3): sessionIDString(3),
			sessionIDString(5): sessionIDString(5),
		},
		string(groupToSessionKey): map[string]interface{}{
			sessionIDString(1): map[string]interface{}{
				sequenceString(1): sessionIDString(1),
			},
			sessionIDString(2): map[string]interface{}{
				sequenceString(1): sessionIDString(2),
			},
			sessionIDString(3): map[string]interface{}{
				sequenceString(1): sessionIDString(3),
			},
			sessionIDString(5): map[string]interface{}{
				sequenceString(1): sessionIDString(5),
			},
		},
	}

	indexPrivacyMapOnly = map[string]interface{}{
		string(sessionToGroupKey): map[string]interface{}{
			sessionIDString(1): sessionIDString(1),
			sessionIDString(2): sessionIDString(2),
		},
		string(groupToSessionKey): map[string]interface{}{
			sessionIDString(1): map[string]interface{}{
				sequenceString(1): sessionIDString(1),
			},
			sessionIDString(2): map[string]interface{}{
				sequenceString(1): sessionIDString(2),
			},
		},
	}

	indexEmptySessionIDs = map[string]interface{}{
		string(sessionToGroupKey): map[string]interface{}{},
		string(groupToSessionKey): map[string]interface{}{},
	}
)

// TestMigrateSessionIDIndex tests that the MigrateSessionIDIndex migration
// correctly back-fills the session ID to group ID index given the current
// contents of the firewall DB.
func TestMigrateSessionIDIndex(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name         string
		privacyMapDB map[string]interface{}
		actionsDB    map[string]interface{}
		rulesDB      map[string]interface{}
		post         map[string]interface{}
	}{
		{
			name:         "all DBs",
			privacyMapDB: privacyMapDB,
			actionsDB:    actionsDB,
			rulesDB:      rulesDB,
			post:         indexAll,
		},
		{
			name:         "privacy map DB only",
			privacyMapDB: privacyMapDB,
			post:         indexPrivacyMapOnly,
		},
		{
			name: "no session IDs",
			post: indexEmptySessionIDs,
		},
	}

	for _, test := range tests {
		test := test

		t.Run(test.name, func(t *testing.T) {
			t.Parallel()

			// Before the migration we have a details bucket.
			before := func(tx *bbolt.Tx) error {
				err := migtest.RestoreDB(
					tx, privacyBucketKey, test.privacyMapDB,
				)
				if err != nil {
					return err
				}

				err = migtest.RestoreDB(
					tx, actionsBucketKey, test.actionsDB,
				)
				if err != nil {
					return err
				}

				return migtest.RestoreDB(
					tx, rulesBucketKey, test.rulesDB,
				)
			}

			// After the migration, we should have a new index
			// bucket.
			after := func(tx *bbolt.Tx) error {
				return migtest.VerifyDB(
					tx, sessionIDIndexBucketKey,
					test.post,
				)
			}

			migtest.ApplyMigration(
				t, before, after, MigrateSessionIDIndex,
				false,
			)
		})
	}
}

func sessionIDString(id uint32) string {
	var sessID ID
	byteOrder.PutUint32(sessID[:], id)

	return string(sessID[:])
}

func sequenceString(id uint64) string {
	var seqNoBytes [8]byte
	byteOrder.PutUint64(seqNoBytes[:], id)

	return string(seqNoBytes[:])
}
