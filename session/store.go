package session

import (
	"bytes"
	"errors"

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

// StoreSession stores a session in the store. If a session with the
// same local public key already exists, the existing record is updated/
// overwritten instead.
func (db *DB) StoreSession(session *Session) error {
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

		return sessionBucket.Put(sessionKey, buf.Bytes())
	})
}

// ListSessions returns all sessions currently known to the store.
func (db *DB) ListSessions() ([]*Session, error) {
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
func (db *DB) RevokeSession(key *btcec.PublicKey) error {
	var session *Session
	err := db.View(func(tx *bbolt.Tx) error {
		sessionBucket, err := getBucket(tx, sessionBucketKey)
		if err != nil {
			return err
		}

		sessionBytes := sessionBucket.Get(key.SerializeCompressed())
		if len(sessionBytes) == 0 {
			return ErrSessionNotFound
		}

		session, err = DeserializeSession(bytes.NewReader(sessionBytes))
		return err
	})
	if err != nil {
		return err
	}

	session.State = StateRevoked
	return db.StoreSession(session)
}
