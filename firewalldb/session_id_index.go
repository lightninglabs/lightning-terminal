package firewalldb

import (
	"fmt"

	"github.com/lightninglabs/lightning-terminal/session"
	"go.etcd.io/bbolt"
)

/*
	The session ID index DB has the following structure:

	session-id-index -> session-to-group -> <session id> -> <group id>
			 -> group-to-session -> <group id>   -> sequence -> session id
*/

var (
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
)

// SessionIDIndex defines an interface for the session ID index DB.
type SessionIDIndex interface {
	// AddGroupID will add a new session-ID to group-ID pair to the index.
	AddGroupID(sessionID, groupID session.ID) error

	// GetGroupID will return the group ID for the given session ID.
	GetGroupID(sessionID session.ID) (session.ID, error)

	// GetSessionIDs will return the set of session IDs that are in the
	// group with the given ID.
	GetSessionIDs(groupID session.ID) ([]session.ID, error)
}

// AddGroupID will add a new session-ID to group-ID pair to the index.
//
// NOTE: this is part of the SessionIDIndex interface.
func (db *DB) AddGroupID(sessionID, groupID session.ID) error {
	return db.DB.Update(func(tx *bbolt.Tx) error {
		indexBkt, err := getBucket(tx, sessionIDIndexBucketKey)
		if err != nil {
			return err
		}

		sessToGroupBkt := indexBkt.Bucket(sessionToGroupKey)
		if sessToGroupBkt == nil {
			return ErrDBInitErr
		}

		groupToSessionBkt := indexBkt.Bucket(groupToSessionKey)
		if groupToSessionBkt == nil {
			return ErrDBInitErr
		}

		groupBkt, err := groupToSessionBkt.CreateBucketIfNotExists(
			groupID[:],
		)
		if err != nil {
			return err
		}

		nextSeq, err := groupBkt.NextSequence()
		if err != nil {
			return err
		}

		var seqNoBytes [8]byte
		byteOrder.PutUint64(seqNoBytes[:], nextSeq)

		err = groupBkt.Put(seqNoBytes[:], sessionID[:])
		if err != nil {
			return err
		}

		return sessToGroupBkt.Put(sessionID[:], groupID[:])
	})
}

// GetGroupID will return the group ID for the given session ID.
//
// NOTE: this is part of the SessionIDIndex interface.
func (db *DB) GetGroupID(sessionID session.ID) (session.ID, error) {
	var groupID session.ID
	err := db.DB.View(func(tx *bbolt.Tx) error {
		indexBkt, err := getBucket(tx, sessionIDIndexBucketKey)
		if err != nil {
			return err
		}

		sessToGroupBkt := indexBkt.Bucket(sessionToGroupKey)
		if sessToGroupBkt == nil {
			return ErrDBInitErr
		}

		groupIDBytes := sessToGroupBkt.Get(sessionID[:])
		if len(groupIDBytes) == 0 {
			return fmt.Errorf("group ID not found for session "+
				"ID %x", sessionID)
		}

		copy(groupID[:], groupIDBytes)

		return nil
	})
	if err != nil {
		return groupID, err
	}

	return groupID, nil
}

// GetSessionIDs will return the set of session IDs that are in the
// group with the given ID.
//
// NOTE: this is part of the SessionIDIndex interface.
func (db *DB) GetSessionIDs(groupID session.ID) ([]session.ID, error) {
	var sessionIDs []session.ID
	err := db.DB.View(func(tx *bbolt.Tx) error {
		indexBkt, err := getBucket(tx, sessionIDIndexBucketKey)
		if err != nil {
			return err
		}

		groupToSessionBkt := indexBkt.Bucket(groupToSessionKey)
		if groupToSessionBkt == nil {
			return ErrDBInitErr
		}

		groupBkt := groupToSessionBkt.Bucket(groupID[:])
		if groupBkt == nil {
			return nil
		}

		return groupBkt.ForEach(func(_, sessionIDBytes []byte) error {
			var sessionID session.ID
			copy(sessionID[:], sessionIDBytes)
			sessionIDs = append(sessionIDs, sessionID)

			return nil
		})
	})
	if err != nil {
		return nil, err
	}

	return sessionIDs, nil
}
