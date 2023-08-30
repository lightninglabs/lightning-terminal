package migration2

import (
	"encoding/binary"
	"errors"
	"fmt"

	"go.etcd.io/bbolt"
)

var (
	// sessionBucketKey is the top level bucket where we can find all
	// information about sessions. These sessions are indexed by their
	// public key.
	//
	// The session bucket has the following structure:
	// session -> <key>       -> <serialised session>
	//	   -> id-index    -> <session-id> -> key   -> <session key>
	// 			                  -> group -> <group-ID>
	// 	   -> group-id-index -> <group-id> -> session-id -> sequence -> <session-id>
	sessionBucketKey = []byte("session")

	// idIndexKey is the key used to define the id-index sub-bucket within
	// the main session bucket. This bucket will be used to store the
	// mapping from session ID to various other fields.
	idIndexKey = []byte("id-index")

	// sessionKeyKey is the key used within the id-index bucket to store the
	// session key (serialised local public key) associated with the given
	// session ID.
	sessionKeyKey = []byte("key")

	// groupIDKey is the key used within the id-index bucket to store the
	// group ID associated with the given session ID.
	groupIDKey = []byte("group")

	// groupIDIndexKey is the key used to define the group-id-index
	// sub-bucket within the main session bucket. This bucket will be used
	// to store the mapping from group ID to various other fields.
	groupIDIndexKey = []byte("group-id-index")

	// sessionIDKey is a key used in the group-id-index under a sub-bucket
	// defined by a specific group ID. It will be used to store the session
	// IDs associated with the given group ID.
	sessionIDKey = []byte("session-id")

	// ErrDBInitErr is returned when a bucket that we expect to have been
	// set up during DB initialisation is not found.
	ErrDBInitErr = errors.New("db did not initialise properly")

	// byteOrder is the default byte order we'll use for serialization
	// within the database.
	byteOrder = binary.BigEndian
)

// MigrateSessionIDToGroupIndex back-fills the session ID to group index so that
// it has an entry for all sessions that the session store is currently aware of.
func MigrateSessionIDToGroupIndex(tx *bbolt.Tx) error {
	sessionBucket := tx.Bucket(sessionBucketKey)
	if sessionBucket == nil {
		return fmt.Errorf("session bucket not found")
	}

	idIndexBkt := sessionBucket.Bucket(idIndexKey)
	if idIndexBkt == nil {
		return ErrDBInitErr
	}

	groupIndexBkt := sessionBucket.Bucket(groupIDIndexKey)
	if groupIndexBkt == nil {
		return ErrDBInitErr
	}

	// Collect all the index entries.
	return idIndexBkt.ForEach(func(sessionID, _ []byte) error {
		// This migration is done before the logic in LiT is added that
		// would allow groupIDs to differ from session IDs. And so all
		// this migration needs to do is add the current 1:1 mapping
		// from group ID to session ID and vice versa where group ID is
		// equal to the session ID.
		groupID := sessionID

		// First we add the session ID to group ID mapping.
		sessionIDBkt := idIndexBkt.Bucket(sessionID)
		if sessionIDBkt == nil {
			return fmt.Errorf("unexpected non-bucket entry in " +
				"the id-index bucket")
		}

		err := sessionIDBkt.Put(groupIDKey, groupID)
		if err != nil {
			return err
		}

		// Now we will add the group ID to session ID mapping.
		groupIDBkt, err := groupIndexBkt.CreateBucketIfNotExists(
			groupID,
		)
		if err != nil {
			return err
		}

		groupSessionIDBkt, err := groupIDBkt.CreateBucketIfNotExists(
			sessionIDKey,
		)
		if err != nil {
			return err
		}

		nextSeq, err := groupSessionIDBkt.NextSequence()
		if err != nil {
			return err
		}
		var seqNoBytes [8]byte
		byteOrder.PutUint64(seqNoBytes[:], nextSeq)

		return groupSessionIDBkt.Put(seqNoBytes[:], groupID[:])
	})
}
