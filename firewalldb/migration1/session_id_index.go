package migration1

import (
	"encoding/binary"

	"go.etcd.io/bbolt"
)

var (
	// privacyBucketKey is the top level key used to store the privacy map
	// DB.
	privacyBucketKey = []byte("privacy")

	// actionsBucketKey is the key that will be used for the main Actions
	// bucket.
	actionsBucketKey = []byte("actions-bucket")

	// actionsKey is the key used for the sub-bucket containing the
	// session actions.
	actionsKey = []byte("actions")

	// rulesBucketKey is the key under which all things rule-kvstore
	// related will fall.
	rulesBucketKey = []byte("rules")

	// permBucketKey is a sub bucket under the rules bucket. Everything
	// stored under this key is persisted across restarts.
	permBucketKey = []byte("perm")

	// sessionIDIndexBucketKey is the key for the main, top-level bucket
	// under which the session ID index will be stored.
	sessionIDIndexBucketKey = []byte("session-id-index")

	// sessionToGroupKey is the key of a sub-bucket in the session-id-index
	// bucket. It stores a mapping from session-ID to group-ID. Many
	// session-IDs may point to the same group ID.
	sessionToGroupKey = []byte("session-to-group")

	// groupToSessionKey is the key of a sub-bucket in the group-to-session
	// bucket. Under this bucket, a sub-bucket will be created for each
	// group ID. Each group ID bucket will then have a mapping from
	// incrementing sequence number to session ID. The reason for the
	// sequence number is so that the order in which the sessions are
	// created is maintained. Each group ID may link to multiple session
	// IDs.
	groupToSessionKey = []byte("group-to-session")

	// byteOrder is the default byte order we'll use for serialization
	// within the database.
	byteOrder = binary.BigEndian
)

// ID represents the id of a session.
type ID [4]byte

// MigrateSessionIDIndex back-fills the session ID index so that it has an
// entry for all sessions that the firewallDB is currently aware of.
func MigrateSessionIDIndex(tx *bbolt.Tx) error {
	sessionIDs := make(map[ID]struct{})

	// Collect session IDs from the privacy mapper DB.
	if err := sessionIDsFromPrivacyDB(tx, sessionIDs); err != nil {
		return err
	}

	// Collect session IDs from the actions DB.
	if err := sessionIDsFromActionsDB(tx, sessionIDs); err != nil {
		return err
	}

	// Collect session IDs from the KV store DB.
	if err := sessionIDsFromKVStoreDB(tx, sessionIDs); err != nil {
		return err
	}

	// Create the top-level bucket for the session ID index DB.
	indexBkt, err := tx.CreateBucketIfNotExists(sessionIDIndexBucketKey)
	if err != nil {
		return err
	}

	// Create the sessionID-to-groupID sub-bucket.
	sessToGroupBkt, err := indexBkt.CreateBucketIfNotExists(
		sessionToGroupKey,
	)
	if err != nil {
		return err
	}

	// Create the groupID-to-sessionID sub-bucket.
	groupToSessionBkt, err := indexBkt.CreateBucketIfNotExists(
		groupToSessionKey,
	)
	if err != nil {
		return err
	}

	// Iterate over the collected session IDs and create an entry for each
	// of them.
	for id := range sessionIDs {
		err := addToIndex(sessToGroupBkt, groupToSessionBkt, id)
		if err != nil {
			return err
		}
	}

	return nil
}

func sessionIDsFromKVStoreDB(tx *bbolt.Tx, ids map[ID]struct{}) error {
	rulesBkt := tx.Bucket(rulesBucketKey)
	if rulesBkt == nil {
		return nil
	}

	permStoreBkt := rulesBkt.Bucket(permBucketKey)
	if permStoreBkt == nil {
		return nil
	}

	return permStoreBkt.ForEach(func(sessionID, _ []byte) error {
		var id ID
		copy(id[:], sessionID)
		ids[id] = struct{}{}

		return nil
	})
}

func sessionIDsFromActionsDB(tx *bbolt.Tx, ids map[ID]struct{}) error {
	mainActionsBucket := tx.Bucket(actionsBucketKey)
	if mainActionsBucket == nil {
		return nil
	}

	actionsBkt := mainActionsBucket.Bucket(actionsKey)
	if actionsBkt == nil {
		return nil
	}

	return actionsBkt.ForEach(func(sessionID, _ []byte) error {
		var id ID
		copy(id[:], sessionID)
		ids[id] = struct{}{}

		return nil
	})
}

func sessionIDsFromPrivacyDB(tx *bbolt.Tx, ids map[ID]struct{}) error {
	privacyBucket := tx.Bucket(privacyBucketKey)
	if privacyBucket == nil {
		return nil
	}

	return privacyBucket.ForEach(func(sessionID, _ []byte) error {
		var id ID
		copy(id[:], sessionID)
		ids[id] = struct{}{}

		return nil
	})
}

func addToIndex(sessToGroupBkt, groupToSessBkt *bbolt.Bucket,
	groupID ID) error {

	groupBkt, err := groupToSessBkt.CreateBucketIfNotExists(groupID[:])
	if err != nil {
		return err
	}

	nextSeq, err := groupBkt.NextSequence()
	if err != nil {
		return err
	}

	var seqNoBytes [8]byte
	byteOrder.PutUint64(seqNoBytes[:], nextSeq)

	err = groupBkt.Put(seqNoBytes[:], groupID[:])
	if err != nil {
		return err
	}

	return sessToGroupBkt.Put(groupID[:], groupID[:])
}
