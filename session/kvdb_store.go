package session

import (
	"bytes"
	"context"
	"encoding/binary"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"time"

	"github.com/btcsuite/btcd/btcec/v2"
	"github.com/lightninglabs/lightning-terminal/accounts"
	"github.com/lightningnetwork/lnd/clock"
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

	accounts accounts.Store
}

// A compile-time check to ensure that BoltStore implements the Store interface.
var _ Store = (*BoltStore)(nil)

// NewDB creates a new bolt database that can be found at the given directory.
func NewDB(dir, fileName string, clock clock.Clock,
	store accounts.Store) (*BoltStore, error) {

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
		DB:       db,
		clock:    clock,
		accounts: store,
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

// NewSession creates and persists a new session with the given user-defined
// parameters. The initial state of the session will be Reserved until
// ShiftState is called with StateCreated.
//
// NOTE: this is part of the Store interface.
func (db *BoltStore) NewSession(ctx context.Context, label string, typ Type,
	expiry time.Time, serverAddr string, opts ...Option) (*Session, error) {

	var session *Session
	err := db.Update(func(tx *bbolt.Tx) error {
		sessionBucket, err := getBucket(tx, sessionBucketKey)
		if err != nil {
			return err
		}

		id, localPrivKey, err := getUnusedIDAndKeyPair(sessionBucket)
		if err != nil {
			return err
		}

		session, err = buildSession(
			id, localPrivKey, label, typ, db.clock.Now(), expiry,
			serverAddr, opts...,
		)
		if err != nil {
			return err
		}

		sessionKey := getSessionKey(session)

		// If an account is being linked, we first need to check that
		// it exists.
		session.AccountID.WhenSome(func(account accounts.AccountID) {
			_, err = db.accounts.Account(ctx, account)
		})
		if err != nil {
			return err
		}

		if len(sessionBucket.Get(sessionKey)) != 0 {
			return fmt.Errorf("session with local public key(%x) "+
				"already exists",
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
				return fmt.Errorf("%w: unknown linked "+
					"session %x: %w", ErrUnknownGroup,
					session.GroupID, err)
			}

			// Fetch all the session IDs for this group. This will
			// through an error if this group does not exist.
			sessionIDs, err := getSessionIDs(
				sessionBucket, session.GroupID,
			)
			if err != nil {
				return err
			}

			// Ensure that the all the linked sessions are no longer
			// active.
			for _, id := range sessionIDs {
				sess, err := getSessionByID(sessionBucket, id)
				if err != nil {
					return err
				}

				if sess.State.Terminal() {
					continue
				}

				return fmt.Errorf("%w: session (id=%x) in "+
					"group %x is still active",
					ErrSessionsInGroupStillActive, sess.ID,
					sess.GroupID)
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

		return putSession(sessionBucket, session)
	})
	if err != nil {
		return nil, err
	}

	return session, nil
}

// UpdateSessionRemotePubKey can be used to add the given remote pub key
// to the session with the given local pub key.
//
// NOTE: this is part of the Store interface.
func (db *BoltStore) UpdateSessionRemotePubKey(_ context.Context, localPubKey,
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

		return putSession(sessionBucket, session)
	})
}

// GetSession fetches the session with the given key.
//
// NOTE: this is part of the Store interface.
func (db *BoltStore) GetSession(_ context.Context, key *btcec.PublicKey) (
	*Session, error) {

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
func (db *BoltStore) ListAllSessions(_ context.Context) ([]*Session, error) {
	return db.listSessions(func(s *Session) bool {
		return true
	})
}

// ListSessionsByType returns all sessions currently known to the store that
// have the given type.
//
// NOTE: this is part of the Store interface.
func (db *BoltStore) ListSessionsByType(_ context.Context, t Type) ([]*Session,
	error) {

	return db.listSessions(func(s *Session) bool {
		return s.Type == t
	})
}

// ListSessionsByState returns all sessions currently known to the store that
// are in the given state.
//
// NOTE: this is part of the Store interface.
func (db *BoltStore) ListSessionsByState(_ context.Context, state State) (
	[]*Session, error) {

	return db.listSessions(func(s *Session) bool {
		return s.State == state
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

// DeleteReservedSessions deletes all sessions that are in the StateReserved
// state.
//
// NOTE: this is part of the Store interface.
func (db *BoltStore) DeleteReservedSessions(_ context.Context) error {
	return db.Update(func(tx *bbolt.Tx) error {
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

			if session.State != StateReserved {
				return nil
			}

			err = sessionBucket.Delete(k)
			if err != nil {
				return err
			}

			idIndexBkt := sessionBucket.Bucket(idIndexKey)
			if idIndexBkt == nil {
				return ErrDBInitErr
			}

			// Delete the entire session ID bucket.
			err = idIndexBkt.DeleteBucket(session.ID[:])
			if err != nil {
				return err
			}

			groupIdIndexBkt := sessionBucket.Bucket(groupIDIndexKey)
			if groupIdIndexBkt == nil {
				return ErrDBInitErr
			}

			groupBkt := groupIdIndexBkt.Bucket(session.GroupID[:])
			if groupBkt == nil {
				return ErrDBInitErr
			}

			sessionIDsBkt := groupBkt.Bucket(sessionIDKey)
			if sessionIDsBkt == nil {
				return ErrDBInitErr
			}

			var (
				seqKey      []byte
				numSessions int
			)
			err = sessionIDsBkt.ForEach(func(k, v []byte) error {
				numSessions++

				if !bytes.Equal(v, session.ID[:]) {
					return nil
				}

				seqKey = k

				return nil
			})
			if err != nil {
				return err
			}

			if numSessions == 0 {
				return fmt.Errorf("no sessions found for "+
					"group ID %x", session.GroupID)
			}

			if numSessions == 1 {
				// Delete the whole group bucket.
				return groupBkt.DeleteBucket(sessionIDKey)
			}

			// Else, delete just the session ID entry.
			return sessionIDsBkt.Delete(seqKey)
		})
	})
}

// ShiftState updates the state of the session with the given ID to the "dest"
// state.
//
// NOTE: this is part of the Store interface.
func (db *BoltStore) ShiftState(_ context.Context, id ID, dest State) error {
	return db.Update(func(tx *bbolt.Tx) error {
		sessionBucket, err := getBucket(tx, sessionBucketKey)
		if err != nil {
			return err
		}

		session, err := getSessionByID(sessionBucket, id)
		if err != nil {
			return err
		}

		// If the session is already in the desired state, we return
		// with no error to maintain idempotency.
		if session.State == dest {
			return nil
		}

		// Ensure that the wanted state change is allowed.
		allowedDestinations, ok := legalStateShifts[session.State]
		if !ok || !allowedDestinations[dest] {
			return fmt.Errorf("illegal session state transition "+
				"from %d to %d", session.State, dest)
		}

		session.State = dest

		// If the session is terminal, we set the revoked at time to the
		// current time.
		if dest.Terminal() {
			session.RevokedAt = db.clock.Now().UTC()
		}

		return putSession(sessionBucket, session)
	})
}

// GetSessionByID fetches the session with the given ID.
//
// NOTE: this is part of the Store interface.
func (db *BoltStore) GetSessionByID(_ context.Context, id ID) (*Session,
	error) {

	var session *Session
	err := db.View(func(tx *bbolt.Tx) error {
		sessionBucket, err := getBucket(tx, sessionBucketKey)
		if err != nil {
			return err
		}

		session, err = getSessionByID(sessionBucket, id)

		return err
	})
	if err != nil {
		return nil, err
	}

	return session, nil
}

// getUnusedIDAndKeyPair can be used to generate a new, unused, local private
// key and session ID pair. Care must be taken to ensure that no other thread
// calls this before the returned ID and key pair from this method are either
// used or discarded.
func getUnusedIDAndKeyPair(bucket *bbolt.Bucket) (ID, *btcec.PrivateKey,
	error) {

	idIndexBkt := bucket.Bucket(idIndexKey)
	if idIndexBkt == nil {
		return ID{}, nil, ErrDBInitErr
	}

	// Spin until we find a key with an ID that does not collide with any of
	// our existing IDs.
	for {
		// Generate a new private key and ID pair.
		privKey, id, err := NewSessionPrivKeyAndID()
		if err != nil {
			return ID{}, nil, err
		}

		// Check that no such ID exits in our id-to-key index.
		idBkt := idIndexBkt.Bucket(id[:])
		if idBkt != nil {
			continue
		}

		return id, privKey, nil
	}
}

// GetGroupID will return the group ID for the given session ID.
//
// NOTE: this is part of the IDToGroupIndex interface.
func (db *BoltStore) GetGroupID(_ context.Context, sessionID ID) (ID, error) {
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
			return fmt.Errorf("%w: no index entry for session "+
				"ID: %x", ErrUnknownGroup, sessionID)
		}

		groupIDBytes := sessionIDBkt.Get(groupIDKey)
		if len(groupIDBytes) == 0 {
			return fmt.Errorf("%w: group ID not found for "+
				"session ID %x", ErrUnknownGroup, sessionID)
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
func (db *BoltStore) GetSessionIDs(_ context.Context, groupID ID) ([]ID,
	error) {

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

func getSessionByID(bucket *bbolt.Bucket, id ID) (*Session, error) {
	keyBytes, err := getKeyForID(bucket, id)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", ErrSessionNotFound, err)
	}

	v := bucket.Get(keyBytes)
	if len(v) == 0 {
		return nil, ErrSessionNotFound
	}

	return DeserializeSession(bytes.NewReader(v))
}

func putSession(bucket *bbolt.Bucket, session *Session) error {
	var buf bytes.Buffer
	if err := SerializeSession(&buf, session); err != nil {
		return err
	}

	return bucket.Put(getSessionKey(session), buf.Bytes())
}
