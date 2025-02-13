package session

import (
	"bytes"
	"encoding/binary"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"time"

	"github.com/btcsuite/btcd/btcec/v2"
	"github.com/lightningnetwork/lnd/clock"
	"go.etcd.io/bbolt"
	"gopkg.in/macaroon-bakery.v2/bakery"
	"gopkg.in/macaroon.v2"
)

var (
	// sessionBucketKey is the top level bucket where we can find all
	// information about sessions. These sessions are indexed by their
	// public key.
	//
	// The session bucket has the following structure:
	// session -> <key>        -> <serialised session>
	//	   -> id-index     -> <session-id> -> key -> <session key>
	// 			                   -> group -> <group-ID>
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

const (
	// DBFilename is the default filename of the session database.
	DBFilename = "session.db"

	// dbFilePermission is the default permission the session database file
	// is created with.
	dbFilePermission = 0600

	// DefaultSessionDBTimeout is the default maximum time we wait for the
	// session bbolt database to be opened. If the database is already
	// opened by another process, the unique lock cannot be obtained. With
	// the timeout we error out after the given time instead of just
	// blocking for forever.
	DefaultSessionDBTimeout = 5 * time.Second
)

// BoltStore is a bolt-backed persistent store.
type BoltStore struct {
	*bbolt.DB

	clock clock.Clock
}

// A compile-time check to ensure that BoltStore implements the Store interface.
var _ Store = (*BoltStore)(nil)

// NewDB creates a new bolt database that can be found at the given directory.
func NewDB(dir, fileName string, clock clock.Clock) (*BoltStore, error) {
	firstInit := false
	path := filepath.Join(dir, fileName)

	// If the database file does not exist yet, create its directory.
	if !fileExists(path) {
		if err := os.MkdirAll(dir, 0700); err != nil {
			return nil, err
		}
		firstInit = true
	}

	db, err := initDB(path, firstInit)
	if err != nil {
		return nil, err
	}

	// Attempt to sync the database's current version with the latest known
	// version available.
	if err := syncVersions(db); err != nil {
		return nil, err
	}

	return &BoltStore{
		DB:    db,
		clock: clock,
	}, nil
}

// fileExists reports whether the named file or directory exists.
func fileExists(path string) bool {
	if _, err := os.Stat(path); err != nil {
		if os.IsNotExist(err) {
			return false
		}
	}
	return true
}

// initDB initializes all the required top-level buckets for the database.
func initDB(filepath string, firstInit bool) (*bbolt.DB, error) {
	db, err := bbolt.Open(filepath, dbFilePermission, &bbolt.Options{
		Timeout: DefaultSessionDBTimeout,
	})
	if err == bbolt.ErrTimeout {
		return nil, fmt.Errorf("error while trying to open %s: timed "+
			"out after %v when trying to obtain exclusive lock",
			filepath, DefaultSessionDBTimeout)
	}
	if err != nil {
		return nil, err
	}

	err = db.Update(func(tx *bbolt.Tx) error {
		if firstInit {
			metadataBucket, err := tx.CreateBucketIfNotExists(
				metadataBucketKey,
			)
			if err != nil {
				return err
			}
			err = setDBVersion(metadataBucket, latestDBVersion)
			if err != nil {
				return err
			}
		}

		sessionBkt, err := tx.CreateBucketIfNotExists(sessionBucketKey)
		if err != nil {
			return err
		}

		_, err = sessionBkt.CreateBucketIfNotExists(idIndexKey)
		if err != nil {
			return err
		}

		_, err = sessionBkt.CreateBucketIfNotExists(groupIDIndexKey)

		return err
	})
	if err != nil {
		return nil, err
	}

	return db, nil
}

// getSessionKey returns the key for a session.
func getSessionKey(session *Session) []byte {
	return session.LocalPublicKey.SerializeCompressed()
}

// NewSession creates a new session with the given user-defined parameters.
//
// NOTE: currently this purely a constructor of the Session type and does not
// make any database calls. This will be changed in a future commit.
//
// NOTE: this is part of the Store interface.
func (db *BoltStore) NewSession(id ID, localPrivKey *btcec.PrivateKey,
	label string, typ Type, expiry time.Time, serverAddr string,
	devServer bool, perms []bakery.Op, caveats []macaroon.Caveat,
	featureConfig FeaturesConfig, privacy bool, linkedGroupID *ID,
	flags PrivacyFlags) (*Session, error) {

	return buildSession(
		id, localPrivKey, label, typ, db.clock.Now(), expiry,
		serverAddr, devServer, perms, caveats, featureConfig, privacy,
		linkedGroupID, flags,
	)
}

// CreateSession adds a new session to the store. If a session with the same
// local public key already exists an error is returned.
//
// NOTE: this is part of the Store interface.
func (db *BoltStore) CreateSession(session *Session) error {
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
		// this session is an ID known by the store. We also need to
		// check that all older sessions in this group have been
		// revoked.
		if session.ID != session.GroupID {
			_, err = getKeyForID(sessionBucket, session.GroupID)
			if err != nil {
				return fmt.Errorf("unknown linked session "+
					"%x: %w", session.GroupID, err)
			}

			// Fetch all the session IDs for this group. This will
			// through an error if this group does not exist.
			sessionIDs, err := getSessionIDs(
				sessionBucket, session.GroupID,
			)
			if err != nil {
				return err
			}

			for _, id := range sessionIDs {
				keyBytes, err := getKeyForID(
					sessionBucket, id,
				)
				if err != nil {
					return err
				}

				v := sessionBucket.Get(keyBytes)
				if len(v) == 0 {
					return ErrSessionNotFound
				}

				sess, err := DeserializeSession(
					bytes.NewReader(v),
				)
				if err != nil {
					return err
				}

				// Ensure that the session is no longer active.
				if sess.State == StateCreated ||
					sess.State == StateInUse {

					return fmt.Errorf("session (id=%x) "+
						"in group %x is still active",
						sess.ID, sess.GroupID)
				}
			}
		}

		// Add the mapping from session ID to session key to the ID
		// index.
		err = addIDToKeyPair(sessionBucket, session.ID, sessionKey)
		if err != nil {
			return err
		}

		// Add the mapping from session ID to group ID and vice versa.
		err = addIDToGroupIDPair(
			sessionBucket, session.ID, session.GroupID,
		)
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
func (db *BoltStore) UpdateSessionRemotePubKey(localPubKey,
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
func (db *BoltStore) GetSession(key *btcec.PublicKey) (*Session, error) {
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

// ListAllSessions returns all sessions currently known to the store.
//
// NOTE: this is part of the Store interface.
func (db *BoltStore) ListAllSessions() ([]*Session, error) {
	return db.listSessions(func(s *Session) bool {
		return true
	})
}

// ListSessionsByType returns all sessions currently known to the store that
// have the given type.
//
// NOTE: this is part of the Store interface.
func (db *BoltStore) ListSessionsByType(t Type) ([]*Session, error) {
	return db.listSessions(func(s *Session) bool {
		return s.Type == t
	})
}

// ListSessionsByState returns all sessions currently known to the store that
// are in the given states.
//
// NOTE: this is part of the Store interface.
func (db *BoltStore) ListSessionsByState(states ...State) ([]*Session, error) {
	return db.listSessions(func(s *Session) bool {
		for _, state := range states {
			if s.State == state {
				return true
			}
		}

		return false
	})
}

// listSessions returns all sessions currently known to the store that pass the
// given filter function.
func (db *BoltStore) listSessions(filterFn func(s *Session) bool) ([]*Session,
	error) {

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

	// Make sure to sort the sessions by creation time.
	sort.Slice(sessions, func(i, j int) bool {
		return sessions[i].CreatedAt.Before(sessions[j].CreatedAt)
	})

	return sessions, nil
}

// RevokeSession updates the state of the session with the given local
// public key to be revoked.
//
// NOTE: this is part of the Store interface.
func (db *BoltStore) RevokeSession(key *btcec.PublicKey) error {
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
		session.RevokedAt = db.clock.Now().UTC()

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
func (db *BoltStore) GetSessionByID(id ID) (*Session, error) {
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
func (db *BoltStore) GetUnusedIDAndKeyPair() (ID, *btcec.PrivateKey, error) {
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

// GetGroupID will return the group ID for the given session ID.
//
// NOTE: this is part of the IDToGroupIndex interface.
func (db *BoltStore) GetGroupID(sessionID ID) (ID, error) {
	var groupID ID
	err := db.View(func(tx *bbolt.Tx) error {
		sessionBkt, err := getBucket(tx, sessionBucketKey)
		if err != nil {
			return err
		}

		idIndex := sessionBkt.Bucket(idIndexKey)
		if idIndex == nil {
			return ErrDBInitErr
		}

		sessionIDBkt := idIndex.Bucket(sessionID[:])
		if sessionIDBkt == nil {
			return fmt.Errorf("no index entry for session ID: %x",
				sessionID)
		}

		groupIDBytes := sessionIDBkt.Get(groupIDKey)
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
// NOTE: this is part of the IDToGroupIndex interface.
func (db *BoltStore) GetSessionIDs(groupID ID) ([]ID, error) {
	var (
		sessionIDs []ID
		err        error
	)
	err = db.View(func(tx *bbolt.Tx) error {
		sessionBkt, err := getBucket(tx, sessionBucketKey)
		if err != nil {
			return err
		}

		sessionIDs, err = getSessionIDs(sessionBkt, groupID)

		return err
	})
	if err != nil {
		return nil, err
	}

	return sessionIDs, nil
}

// CheckSessionGroupPredicate iterates over all the sessions in a group and
// checks if each one passes the given predicate function. True is returned if
// each session passes.
//
// NOTE: this is part of the Store interface.
func (db *BoltStore) CheckSessionGroupPredicate(groupID ID,
	fn func(s *Session) bool) (bool, error) {

	var (
		pass          bool
		errFailedPred = errors.New("session failed predicate")
	)
	err := db.View(func(tx *bbolt.Tx) error {
		sessionBkt, err := getBucket(tx, sessionBucketKey)
		if err != nil {
			return err
		}

		sessionIDs, err := getSessionIDs(sessionBkt, groupID)
		if err != nil {
			return err
		}

		// Iterate over all the sessions.
		for _, id := range sessionIDs {
			key, err := getKeyForID(sessionBkt, id)
			if err != nil {
				return err
			}

			v := sessionBkt.Get(key)
			if len(v) == 0 {
				return ErrSessionNotFound
			}

			session, err := DeserializeSession(bytes.NewReader(v))
			if err != nil {
				return err
			}

			if !fn(session) {
				return errFailedPred
			}
		}

		pass = true

		return nil
	})
	if errors.Is(err, errFailedPred) {
		return pass, nil
	}
	if err != nil {
		return pass, err
	}

	return pass, nil
}

// getSessionIDs returns all the session IDs associated with the given group ID.
func getSessionIDs(sessionBkt *bbolt.Bucket, groupID ID) ([]ID, error) {
	var sessionIDs []ID

	groupIndexBkt := sessionBkt.Bucket(groupIDIndexKey)
	if groupIndexBkt == nil {
		return nil, ErrDBInitErr
	}

	groupIDBkt := groupIndexBkt.Bucket(groupID[:])
	if groupIDBkt == nil {
		return nil, fmt.Errorf("no sessions for group ID %v",
			groupID)
	}

	sessionIDsBkt := groupIDBkt.Bucket(sessionIDKey)
	if sessionIDsBkt == nil {
		return nil, fmt.Errorf("no sessions for group ID %v",
			groupID)
	}

	err := sessionIDsBkt.ForEach(func(_,
		sessionIDBytes []byte) error {

		var sessionID ID
		copy(sessionID[:], sessionIDBytes)
		sessionIDs = append(sessionIDs, sessionID)

		return nil
	})
	if err != nil {
		return nil, err
	}

	return sessionIDs, nil
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

// addIDToGroupIDPair inserts the mapping from session ID to group ID into the
// id-index bucket and also inserts the mapping from group ID to session ID into
// the group-id-index bucket.
func addIDToGroupIDPair(sessionBkt *bbolt.Bucket, id, groupID ID) error {
	// First we will add the mapping from session ID to group ID.
	idIndexBkt := sessionBkt.Bucket(idIndexKey)
	if idIndexBkt == nil {
		return ErrDBInitErr
	}

	idBkt, err := idIndexBkt.CreateBucketIfNotExists(id[:])
	if err != nil {
		return err
	}

	err = idBkt.Put(groupIDKey, groupID[:])
	if err != nil {
		return err
	}

	// Now we add the mapping from group ID to session.
	groupIdIndexBkt := sessionBkt.Bucket(groupIDIndexKey)
	if groupIdIndexBkt == nil {
		return ErrDBInitErr
	}

	groupBkt, err := groupIdIndexBkt.CreateBucketIfNotExists(groupID[:])
	if err != nil {
		return err
	}

	sessionIDsBkt, err := groupBkt.CreateBucketIfNotExists(sessionIDKey)
	if err != nil {
		return err
	}

	nextSeq, err := sessionIDsBkt.NextSequence()
	if err != nil {
		return err
	}

	var seqNoBytes [8]byte
	byteOrder.PutUint64(seqNoBytes[:], nextSeq)

	return sessionIDsBkt.Put(seqNoBytes[:], id[:])
}
