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
	sessionBucketKey = []byte("session")

	// ErrSessionNotFound is an error returned when we attempt to retrieve
	// information about a session but it is not found.
	ErrSessionNotFound = errors.New("session not found")
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
