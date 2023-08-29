package migration1

import (
	"bytes"
	"errors"
	"fmt"
	"sort"
	"time"

	"go.etcd.io/bbolt"
)

var (
	// sessionBucketKey is the top level bucket where we can find all
	// information about sessions. These sessions are indexed by their
	// public key.
	//
	// The session bucket has the following structure:
	// session -> <key>       -> <serialised session>
	//	   -> id-index    -> <session-id> -> key -> <session key>
	sessionBucketKey = []byte("session")

	// idIndexKey is the key used to define the id-index sub-bucket within
	// the main session bucket. This bucket will be used to store the
	// mapping from session ID to various other fields.
	idIndexKey = []byte("id-index")

	// sessionKeyKey is the key used within the id-index bucket to store the
	// session key (serialised local public key) associated with the given
	// session ID.
	sessionKeyKey = []byte("key")

	// ErrDBInitErr is returned when a bucket that we expect to have been
	// set up during DB initialisation is not found.
	ErrDBInitErr = errors.New("db did not initialise properly")
)

type sessionInfo struct {
	key       []byte
	state     State
	createdAt time.Time
}

// MigrateSessionIDToKeyIndex back-fills the session ID to key index so that it
// has an entry for all sessions that the session store is currently aware of.
func MigrateSessionIDToKeyIndex(tx *bbolt.Tx, timeNow func() time.Time) error {
	sessionBucket := tx.Bucket(sessionBucketKey)
	if sessionBucket == nil {
		return fmt.Errorf("session bucket not found")
	}

	idIndexBkt := sessionBucket.Bucket(idIndexKey)
	if idIndexBkt == nil {
		return ErrDBInitErr
	}

	// Collect all the index entries.
	idToSessionPairs := make(map[ID][]*sessionInfo)
	err := sessionBucket.ForEach(func(key, sessionBytes []byte) error {
		// The session bucket contains both keys and sub-buckets. So
		// here we ensure that we skip any sub-buckets.
		if len(sessionBytes) == 0 {
			return nil
		}

		session, err := DeserializeSession(
			bytes.NewReader(sessionBytes),
		)
		if err != nil {
			return err
		}

		var id ID
		copy(id[:], key[0:4])

		idToSessionPairs[id] = append(
			idToSessionPairs[id], &sessionInfo{
				key:       key,
				createdAt: session.CreatedAt,
				state:     session.State,
			},
		)

		return nil
	})
	if err != nil {
		return err
	}

	addIndexEntry := func(id ID, key []byte) error {
		idBkt, err := idIndexBkt.CreateBucket(id[:])
		if err != nil {
			return err
		}

		return idBkt.Put(sessionKeyKey[:], key)
	}

	for id, sessions := range idToSessionPairs {
		if len(sessions) == 1 {
			err = addIndexEntry(id, sessions[0].key)
			if err != nil {
				return err
			}

			continue
		}

		// Sort the sessions from oldest to newest.
		sort.Slice(sessions, func(i, j int) bool {
			return sessions[i].createdAt.Before(
				sessions[j].createdAt,
			)
		})

		// For each session other than the newest one, we ensure that
		// the session is revoked. We do this in case there was a
		// collision in the ID used for the session since now we want to
		// populate the ID-to-key index which should be a one-to-one
		// mapping. So there is a small chance that the DB contains a
		// session with no entry in this ID-to-key index but at least
		// this will not be an active session.
		for _, session := range sessions[:len(sessions)-1] {
			serialisedSession := sessionBucket.Get(session.key)

			sess, err := DeserializeSession(
				bytes.NewReader(serialisedSession),
			)
			if err != nil {
				return err
			}

			sess.State = StateRevoked
			sess.RevokedAt = timeNow()

			var buf bytes.Buffer
			if err := SerializeSession(&buf, sess); err != nil {
				return err
			}

			err = sessionBucket.Put(session.key, buf.Bytes())
			if err != nil {
				return err
			}
		}

		// Add an entry for the last session in the set.
		err = addIndexEntry(id, sessions[len(sessions)-1].key)
		if err != nil {
			return err
		}
	}

	return nil
}
