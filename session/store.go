package session

import (
	"bytes"
	"errors"
	"fmt"
	"time"

	"github.com/btcsuite/btcd/btcec/v2"
	"go.etcd.io/bbolt"
)

var (
	// sessionBucketKey is the top level bucket where we can find all
	// information about sessions. These sessions are indexed by their
	// public key.
	//
	// The session bucket has the following structure:
	// session -> <key>        -> <serialised session>
	//	   -> id-index     -> <session-id> -> key -> <session key>
	sessionBucketKey = []byte("session")

	// idIndexKey is the key used to define the id-index sub-bucket within
	// the main session bucket. This bucket will be used to store the
	// mapping from session ID to various other fields.
	idIndexKey = []byte("id-index")

	// sessionKeyKey is the key used within the id-index bucket to store the
	// session key (serialised local public key) associated with the given
	// session ID.
	sessionKeyKey = []byte("key")

	// ErrSessionNotFound is an error returned when we attempt to retrieve
	// information about a session but it is not found.
	ErrSessionNotFound = errors.New("session not found")

	// ErrDBInitErr is returned when a bucket that we expect to have been
	// set up during DB initialisation is not found.
	ErrDBInitErr = errors.New("db did not initialise properly")
)

// getSessionKey returns the key for a session.
func getSessionKey(session *Session) []byte {
	return session.LocalPublicKey.SerializeCompressed()
}

// CreateSession adds a new session to the store. If a session with the same
// local public key already exists an error is returned.
//
// NOTE: this is part of the Store interface.
func (db *DB) CreateSession(session *Session) error {
	var buf bytes.Buffer
	if err := SerializeSession(&buf, session); err != nil {
		return err
	}
	sessionKey := getSessionKey(session)

	return db.Update(func(tx *bbolt.Tx) error {
		sessionBucket, err := getBucket(tx, sessionBucketKey)
		if err != nil {
			return err
		}

		if len(sessionBucket.Get(sessionKey)) != 0 {
			return fmt.Errorf("session with local public "+
				"key(%x) already exists",
				session.LocalPublicKey.SerializeCompressed())
		}

		// If this is a linked session (meaning the group ID is
		// different from the ID) the make sure that the Group ID of
		// this session is an ID known by the store. We can do this by
		// checking that an entry for this ID exists in the id-to-key
		// index.
		if session.ID != session.GroupID {
			_, err = getKeyForID(sessionBucket, session.GroupID)
			if err != nil {
				return fmt.Errorf("unknown linked session "+
					"%x: %w", session.GroupID, err)
			}
		}

		// Add the mapping from session ID to session key to the ID
		// index.
		err = addIDToKeyPair(sessionBucket, session.ID, sessionKey)
		if err != nil {
			return err
		}

		return sessionBucket.Put(sessionKey, buf.Bytes())
	})
}

// UpdateSessionRemotePubKey can be used to add the given remote pub key
// to the session with the given local pub key.
//
// NOTE: this is part of the Store interface.
func (db *DB) UpdateSessionRemotePubKey(localPubKey,
	remotePubKey *btcec.PublicKey) error {

	key := localPubKey.SerializeCompressed()

	return db.Update(func(tx *bbolt.Tx) error {
		sessionBucket, err := getBucket(tx, sessionBucketKey)
		if err != nil {
			return err
		}

		serialisedSession := sessionBucket.Get(key)

		if len(serialisedSession) == 0 {
			return ErrSessionNotFound
		}

		session, err := DeserializeSession(
			bytes.NewReader(serialisedSession),
		)
		if err != nil {
			return err
		}

		session.RemotePublicKey = remotePubKey

		var buf bytes.Buffer
		if err := SerializeSession(&buf, session); err != nil {
			return err
		}

		return sessionBucket.Put(key, buf.Bytes())
	})
}

// GetSession fetches the session with the given key.
//
// NOTE: this is part of the Store interface.
func (db *DB) GetSession(key *btcec.PublicKey) (*Session, error) {
	var session *Session
	err := db.View(func(tx *bbolt.Tx) error {
		sessionBucket, err := getBucket(tx, sessionBucketKey)
		if err != nil {
			return err
		}

		v := sessionBucket.Get(key.SerializeCompressed())
		if len(v) == 0 {
			return ErrSessionNotFound
		}

		session, err = DeserializeSession(bytes.NewReader(v))
		if err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return nil, err
	}

	return session, nil
}

// ListSessions returns all sessions currently known to the store.
//
// NOTE: this is part of the Store interface.
func (db *DB) ListSessions(filterFn func(s *Session) bool) ([]*Session, error) {
	var sessions []*Session
	err := db.View(func(tx *bbolt.Tx) error {
		sessionBucket, err := getBucket(tx, sessionBucketKey)
		if err != nil {
			return err
		}

		return sessionBucket.ForEach(func(k, v []byte) error {
			// We'll also get buckets here, skip those (identified
			// by nil value).
			if v == nil {
				return nil
			}

			session, err := DeserializeSession(bytes.NewReader(v))
			if err != nil {
				return err
			}

			if filterFn != nil && !filterFn(session) {
				return nil
			}

			sessions = append(sessions, session)

			return nil
		})
	})
	if err != nil {
		return nil, err
	}

	return sessions, nil
}

// RevokeSession updates the state of the session with the given local
// public key to be revoked.
//
// NOTE: this is part of the Store interface.
func (db *DB) RevokeSession(key *btcec.PublicKey) error {
	var session *Session
	return db.Update(func(tx *bbolt.Tx) error {
		sessionBucket, err := getBucket(tx, sessionBucketKey)
		if err != nil {
			return err
		}

		sessionBytes := sessionBucket.Get(key.SerializeCompressed())
		if len(sessionBytes) == 0 {
			return ErrSessionNotFound
		}

		session, err = DeserializeSession(bytes.NewReader(sessionBytes))
		if err != nil {
			return err
		}

		session.State = StateRevoked
		session.RevokedAt = time.Now()

		var buf bytes.Buffer
		if err := SerializeSession(&buf, session); err != nil {
			return err
		}

		return sessionBucket.Put(key.SerializeCompressed(), buf.Bytes())
	})
}

// GetSessionByID fetches the session with the given ID.
//
// NOTE: this is part of the Store interface.
func (db *DB) GetSessionByID(id ID) (*Session, error) {
	var session *Session
	err := db.View(func(tx *bbolt.Tx) error {
		sessionBucket, err := getBucket(tx, sessionBucketKey)
		if err != nil {
			return err
		}

		keyBytes, err := getKeyForID(sessionBucket, id)
		if err != nil {
			return err
		}

		v := sessionBucket.Get(keyBytes)
		if len(v) == 0 {
			return ErrSessionNotFound
		}

		session, err = DeserializeSession(bytes.NewReader(v))
		if err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return nil, err
	}

	return session, nil
}

// GetUnusedIDAndKeyPair can be used to generate a new, unused, local private
// key and session ID pair. Care must be taken to ensure that no other thread
// calls this before the returned ID and key pair from this method are either
// used or discarded.
//
// NOTE: this is part of the Store interface.
func (db *DB) GetUnusedIDAndKeyPair() (ID, *btcec.PrivateKey, error) {
	var (
		id      ID
		privKey *btcec.PrivateKey
	)
	err := db.Update(func(tx *bbolt.Tx) error {
		sessionBucket, err := getBucket(tx, sessionBucketKey)
		if err != nil {
			return err
		}

		idIndexBkt := sessionBucket.Bucket(idIndexKey)
		if idIndexBkt == nil {
			return ErrDBInitErr
		}

		// Spin until we find a key with an ID that does not collide
		// with any of our existing IDs.
		for {
			// Generate a new private key and ID pair.
			privKey, id, err = NewSessionPrivKeyAndID()
			if err != nil {
				return err
			}

			// Check that no such ID exits in our id-to-key index.
			idBkt := idIndexBkt.Bucket(id[:])
			if idBkt != nil {
				continue
			}

			break
		}

		return nil
	})
	if err != nil {
		return id, nil, err
	}

	return id, privKey, nil
}

// addIdToKeyPair inserts the mapping from session ID to session key into the
// id-index bucket. An error is returned if an entry for this ID already exists.
func addIDToKeyPair(sessionBkt *bbolt.Bucket, id ID, sessionKey []byte) error {
	idIndexBkt := sessionBkt.Bucket(idIndexKey)
	if idIndexBkt == nil {
		return ErrDBInitErr
	}

	idBkt, err := idIndexBkt.CreateBucketIfNotExists(id[:])
	if err != nil {
		return err
	}

	if len(idBkt.Get(sessionKeyKey)) != 0 {
		return fmt.Errorf("a session with the given ID already exists")
	}

	return idBkt.Put(sessionKeyKey[:], sessionKey)
}

// getKeyForID fetches the session key associated with the given session ID.
func getKeyForID(sessionBkt *bbolt.Bucket, id ID) ([]byte, error) {
	idIndexBkt := sessionBkt.Bucket(idIndexKey)
	if idIndexBkt == nil {
		return nil, ErrDBInitErr
	}

	idBkt := idIndexBkt.Bucket(id[:])
	if idBkt == nil {
		return nil, fmt.Errorf("no entry found in the ID index for "+
			"ID: %x", id)
	}

	sessionKeyBytes := idBkt.Get(sessionKeyKey)
	if len(sessionKeyKey) == 0 {
		return nil, fmt.Errorf("no session key found in the ID "+
			"index for ID: %x", id)
	}

	return sessionKeyBytes, nil
}
