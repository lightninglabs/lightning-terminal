package session

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/btcsuite/btcd/btcec/v2"
	"github.com/lightninglabs/lightning-node-connect/mailbox"
	"github.com/lightninglabs/lightning-terminal/accounts"
	"github.com/lightninglabs/lightning-terminal/db"
	"github.com/lightninglabs/lightning-terminal/db/sqlc"
	"github.com/lightningnetwork/lnd/clock"
	"github.com/lightningnetwork/lnd/fn"
	"gopkg.in/macaroon-bakery.v2/bakery"
	"gopkg.in/macaroon.v2"
)

// SQLQueries is a subset of the sqlc.Queries interface that can be used to
// interact with session related tables.
type SQLQueries interface {
	GetAliasBySessionID(ctx context.Context, id int64) ([]byte, error)
	GetSessionByID(ctx context.Context, id int64) (sqlc.Session, error)
	GetSessionsInGroup(ctx context.Context, groupID sql.NullInt64) ([]sqlc.Session, error)
	GetSessionAliasesInGroup(ctx context.Context, groupID sql.NullInt64) ([][]byte, error)
	GetSessionByAlias(ctx context.Context, legacyID []byte) (sqlc.Session, error)
	GetSessionByLocalPublicKey(ctx context.Context, localPublicKey []byte) (sqlc.Session, error)
	GetSessionFeatureConfigs(ctx context.Context, sessionID int64) ([]sqlc.SessionFeatureConfig, error)
	GetSessionMacaroonCaveats(ctx context.Context, sessionID int64) ([]sqlc.SessionMacaroonCaveat, error)
	GetSessionIDByAlias(ctx context.Context, legacyID []byte) (int64, error)
	GetSessionMacaroonPermissions(ctx context.Context, sessionID int64) ([]sqlc.SessionMacaroonPermission, error)
	GetSessionPrivacyFlags(ctx context.Context, sessionID int64) ([]sqlc.SessionPrivacyFlag, error)
	InsertSessionFeatureConfig(ctx context.Context, arg sqlc.InsertSessionFeatureConfigParams) error
	SetSessionRevokedAt(ctx context.Context, arg sqlc.SetSessionRevokedAtParams) error
	InsertSessionMacaroonCaveat(ctx context.Context, arg sqlc.InsertSessionMacaroonCaveatParams) error
	InsertSessionMacaroonPermission(ctx context.Context, arg sqlc.InsertSessionMacaroonPermissionParams) error
	InsertSessionPrivacyFlag(ctx context.Context, arg sqlc.InsertSessionPrivacyFlagParams) error
	InsertSession(ctx context.Context, arg sqlc.InsertSessionParams) (int64, error)
	ListSessions(ctx context.Context) ([]sqlc.Session, error)
	ListSessionsByType(ctx context.Context, sessionType int16) ([]sqlc.Session, error)
	ListSessionsByState(ctx context.Context, state int16) ([]sqlc.Session, error)
	SetSessionRemotePublicKey(ctx context.Context, arg sqlc.SetSessionRemotePublicKeyParams) error
	SetSessionGroupID(ctx context.Context, arg sqlc.SetSessionGroupIDParams) error
	UpdateSessionState(ctx context.Context, arg sqlc.UpdateSessionStateParams) error
	DeleteSessionsWithState(ctx context.Context, state int16) error
	GetAccountIDByAlias(ctx context.Context, alias int64) (int64, error)
	GetAccount(ctx context.Context, id int64) (sqlc.Account, error)
}

var _ Store = (*SQLStore)(nil)

// BatchedSQLQueries is a version of the SQLQueries that's capable of batched
// database operations.
type BatchedSQLQueries interface {
	SQLQueries

	db.BatchedTx[SQLQueries]
}

// SQLStore represents a storage backend.
type SQLStore struct {
	// db is all the higher level queries that the SQLStore has access to
	// in order to implement all its CRUD logic.
	db BatchedSQLQueries

	// DB represents the underlying database connection.
	*sql.DB

	clock clock.Clock
}

// NewSQLStore creates a new SQLStore instance given an open BatchedSQLQueries
// storage backend.
func NewSQLStore(sqlDB *db.BaseDB, clock clock.Clock) *SQLStore {
	executor := db.NewTransactionExecutor(
		sqlDB, func(tx *sql.Tx) SQLQueries {
			return sqlDB.WithTx(tx)
		},
	)

	return &SQLStore{
		db:    executor,
		DB:    sqlDB.DB,
		clock: clock,
	}
}

// NewSession creates and persists a new session with the given user-defined
// parameters. The initial state of the session will be Reserved until
// ShiftState is called with StateCreated.
//
// NOTE: this is part of the Store interface.
func (s *SQLStore) NewSession(ctx context.Context, label string, typ Type,
	expiry time.Time, serverAddr string, opts ...Option) (*Session, error) {

	var (
		writeTxOpts db.QueriesTxOptions
		sess        *Session
	)

	err := s.db.ExecTx(ctx, &writeTxOpts, func(db SQLQueries) error {
		id, localPrivKey, err := getSqlUnusedAliasAndKeyPair(ctx, db)
		if err != nil {
			return err
		}

		sess, err = buildSession(
			id, localPrivKey, label, typ, s.clock.Now().UTC(),
			expiry, serverAddr, opts...,
		)
		if err != nil {
			return err
		}

		var acctIDInt64 sql.NullInt64
		sess.AccountID.WhenSome(func(alias accounts.AccountID) {
			// Do a manual check to ensure the account exists so
			// that we can throw a predicable error.
			var acctAlias int64
			acctAlias, err = alias.ToInt64()
			if err != nil {
				return
			}

			var acctDBID int64
			acctDBID, err = db.GetAccountIDByAlias(ctx, acctAlias)
			if errors.Is(err, sql.ErrNoRows) {
				err = accounts.ErrAccNotFound
				return
			} else if err != nil {
				return
			}

			acctIDInt64 = sql.NullInt64{
				Int64: acctDBID,
				Valid: true,
			}
		})
		if err != nil {
			return fmt.Errorf("unable to convert account ID: %w", err)
		}

		localKey := sess.LocalPublicKey.SerializeCompressed()

		dbID, err := db.InsertSession(ctx, sqlc.InsertSessionParams{
			Alias:           sess.ID[:],
			Label:           sess.Label,
			State:           int16(sess.State),
			Type:            int16(sess.Type),
			Expiry:          sess.Expiry.UTC(),
			CreatedAt:       sess.CreatedAt.UTC(),
			ServerAddress:   sess.ServerAddr,
			DevServer:       sess.DevServer,
			MacaroonRootKey: int64(sess.MacaroonRootKey),
			PairingSecret:   sess.PairingSecret[:],
			LocalPrivateKey: sess.LocalPrivateKey.Serialize(),
			LocalPublicKey:  localKey,
			Privacy:         sess.WithPrivacyMapper,
			AccountID:       acctIDInt64,
		})
		if err != nil {
			return fmt.Errorf("unable to insert session: %w", err)
		}

		// Check that the linked session is known.
		groupID, err := db.GetSessionIDByAlias(ctx, sess.GroupID[:])
		if errors.Is(err, sql.ErrNoRows) {
			return ErrUnknownGroup
		} else if err != nil {
			return fmt.Errorf("unable to fetch group(%x): %w",
				sess.GroupID[:], err)
		}

		// Ensure that all other sessions in this group are no longer
		// active.
		linkedSessions, err := db.GetSessionsInGroup(ctx, sql.NullInt64{
			Int64: groupID,
			Valid: true,
		})
		if err != nil {
			return fmt.Errorf("unable to fetch group(%x): %w",
				sess.GroupID[:], err)
		}

		// Make sure that all linked sessions (sessions in the same
		// group) are no longer active.
		for _, linkedSession := range linkedSessions {
			// Skip the new session that we are adding.
			if linkedSession.ID == dbID {
				continue
			}

			// Any other session should not be active.
			if !State(linkedSession.State).Terminal() {
				return fmt.Errorf("linked session(%x) is "+
					"still active: %w",
					linkedSession.Alias[:],
					ErrSessionsInGroupStillActive)
			}
		}

		err = db.SetSessionGroupID(ctx, sqlc.SetSessionGroupIDParams{
			ID: dbID,
			GroupID: sql.NullInt64{
				Int64: groupID,
				Valid: true,
			},
		})
		if err != nil {
			return fmt.Errorf("unable to set group Alias: %w", err)
		}

		// Write mac perms and caveats.
		if sess.MacaroonRecipe != nil {
			for _, perm := range sess.MacaroonRecipe.Permissions {
				err := db.InsertSessionMacaroonPermission(
					ctx, sqlc.InsertSessionMacaroonPermissionParams{
						SessionID: dbID,
						Entity:    perm.Entity,
						Action:    perm.Action,
					},
				)
				if err != nil {
					return fmt.Errorf("unable to insert "+
						"mac perm: %w", err)
				}
			}

			for _, caveat := range sess.MacaroonRecipe.Caveats {
				err := db.InsertSessionMacaroonCaveat(
					ctx, sqlc.InsertSessionMacaroonCaveatParams{
						SessionID: dbID,
						CaveatID:  caveat.Id,
						VerificationID: caveat.
							VerificationId,
						Location: sql.NullString{
							String: caveat.Location,
							Valid: caveat.
								Location != "",
						},
					},
				)
				if err != nil {
					return fmt.Errorf("unable to insert "+
						"mac caveat: %v", err)
				}
			}
		}

		// Write feature configs.
		if sess.FeatureConfig != nil {
			for featureName, config := range *sess.FeatureConfig {
				err := db.InsertSessionFeatureConfig(
					ctx, sqlc.InsertSessionFeatureConfigParams{
						SessionID:   dbID,
						FeatureName: featureName,
						Config:      config,
					},
				)
				if err != nil {
					return fmt.Errorf("unable to insert "+
						"feature config: %w", err)
				}
			}
		}

		// Write privacy flags.
		for _, flag := range sess.PrivacyFlags {
			err := db.InsertSessionPrivacyFlag(
				ctx, sqlc.InsertSessionPrivacyFlagParams{
					SessionID: dbID,
					Flag:      int32(flag),
				},
			)
			if err != nil {
				return fmt.Errorf("unable to insert privacy "+
					"flag: %w", err)
			}
		}

		return nil
	})
	if err != nil {
		mappedSQLErr := db.MapSQLError(err)
		var uniqueConstraintErr *db.ErrSqlUniqueConstraintViolation
		if errors.As(mappedSQLErr, &uniqueConstraintErr) {
			// Add context to unique constraint errors.
			return nil, fmt.Errorf("session violates unique "+
				"constraint: %w", uniqueConstraintErr)
		}

		return nil, fmt.Errorf("unable to add session: %w", err)
	}

	return sess, nil
}

// ListSessionsByType returns all sessions currently known to the store that
// have the given type.
//
// NOTE: this is part of the Store interface.
func (s *SQLStore) ListSessionsByType(ctx context.Context, t Type) ([]*Session,
	error) {

	var (
		readTxOpts = db.NewQueryReadTx()
		sessions   []*Session
	)
	err := s.db.ExecTx(ctx, &readTxOpts, func(db SQLQueries) error {
		dbSessions, err := db.ListSessionsByType(ctx, int16(t))
		if err != nil {
			return fmt.Errorf("could not list sessions: %w", err)
		}

		for _, dbSess := range dbSessions {
			sess, err := unmarshalSession(ctx, db, dbSess)
			if err != nil {
				return fmt.Errorf("could not unmarshal "+
					"session: %w", err)
			}

			sessions = append(sessions, sess)
		}

		return nil
	})

	return sessions, err
}

// ListSessionsByState returns all sessions currently known to the store that
// are in the given state.
//
// NOTE: this is part of the Store interface.
func (s *SQLStore) ListSessionsByState(ctx context.Context, state State) (
	[]*Session, error) {

	var (
		readTxOpts = db.NewQueryReadTx()
		sessions   []*Session
	)
	err := s.db.ExecTx(ctx, &readTxOpts, func(db SQLQueries) error {
		dbSessions, err := db.ListSessionsByState(ctx, int16(state))
		if err != nil {
			return fmt.Errorf("could not list sessions: %w", err)
		}

		for _, dbSess := range dbSessions {
			sess, err := unmarshalSession(ctx, db, dbSess)
			if err != nil {
				return fmt.Errorf("could not unmarshal "+
					"session: %w", err)
			}

			sessions = append(sessions, sess)
		}

		return nil
	})

	return sessions, err
}

// ShiftState updates the state of the session with the given ID to the "dest"
// state.
//
// NOTE: this is part of the Store interface.
func (s *SQLStore) ShiftState(ctx context.Context, alias ID, dest State) error {
	var writeTxOpts db.QueriesTxOptions
	return s.db.ExecTx(ctx, &writeTxOpts, func(db SQLQueries) error {
		dbSession, err := db.GetSessionByAlias(ctx, alias[:])
		if errors.Is(err, sql.ErrNoRows) {
			return fmt.Errorf("%w: unable to get session: %w",
				ErrSessionNotFound, err)
		} else if err != nil {
			return fmt.Errorf("unable to get session: %w", err)
		}

		dbState := State(dbSession.State)

		// If the session is already in the desired state, we return
		// with no error to maintain idempotency.
		if dbState == dest {
			return nil
		}

		// Ensure that the wanted state change is allowed.
		allowedDestinations, ok := legalStateShifts[dbState]
		if !ok || !allowedDestinations[dest] {
			return fmt.Errorf("illegal session state transition "+
				"from %d to %d", dbState, dest)
		}

		// If the session is terminal, we set the revoked at time to the
		// current time.
		if dest.Terminal() {
			err = db.SetSessionRevokedAt(
				ctx, sqlc.SetSessionRevokedAtParams{
					RevokedAt: sql.NullTime{
						Valid: true,
						Time:  s.clock.Now().UTC(),
					},
					ID: dbSession.ID,
				},
			)
			if err != nil {
				return fmt.Errorf("unable to set revoked at "+
					"time: %w", err)
			}
		}

		return db.UpdateSessionState(
			ctx, sqlc.UpdateSessionStateParams{
				ID:    dbSession.ID,
				State: int16(dest),
			},
		)
	})
}

// DeleteReservedSessions deletes all sessions that are in the StateReserved
// state.
//
// NOTE: this is part of the Store interface.
func (s *SQLStore) DeleteReservedSessions(ctx context.Context) error {
	var writeTxOpts db.QueriesTxOptions
	return s.db.ExecTx(ctx, &writeTxOpts, func(db SQLQueries) error {
		return db.DeleteSessionsWithState(ctx, int16(StateReserved))
	})
}

// GetSessionByLocalPub fetches the session with the given local pub key.
//
// NOTE: This is part of the Store interface.
func (s *SQLStore) GetSessionByLocalPub(ctx context.Context,
	key *btcec.PublicKey) (*Session, error) {

	var (
		readTxOpts = db.NewQueryReadTx()
		sess       *Session
	)
	err := s.db.ExecTx(ctx, &readTxOpts, func(db SQLQueries) error {
		dbSess, err := db.GetSessionByLocalPublicKey(
			ctx, key.SerializeCompressed(),
		)
		if errors.Is(err, sql.ErrNoRows) {
			return fmt.Errorf("%w: %w", ErrSessionNotFound, err)
		} else if err != nil {
			return fmt.Errorf("unable to get session: %w", err)
		}

		sess, err = unmarshalSession(ctx, s.db, dbSess)
		if err != nil {
			return fmt.Errorf("unable to unmarshal session: %w",
				err)
		}

		return nil
	})
	if err != nil {
		return nil, err
	}

	return sess, nil
}

// ListAllSessions returns all sessions currently known to the store.
//
// NOTE: This is part of the Store interface.
func (s *SQLStore) ListAllSessions(ctx context.Context) ([]*Session, error) {
	var (
		readTxOpts = db.NewQueryReadTx()
		sessions   []*Session
	)
	err := s.db.ExecTx(ctx, &readTxOpts, func(db SQLQueries) error {
		dbSessions, err := db.ListSessions(ctx)
		if err != nil {
			return fmt.Errorf("could not list sessions: %w", err)
		}

		for _, dbSess := range dbSessions {
			sess, err := unmarshalSession(ctx, db, dbSess)
			if err != nil {
				return fmt.Errorf("could not unmarshal "+
					"session: %w", err)
			}

			sessions = append(sessions, sess)
		}

		return nil
	})

	return sessions, err
}

// UpdateSessionRemotePubKey can be used to add the given remote pub key to the
// session with the given legacy ID.
//
// NOTE: This is part of the Store interface.
func (s *SQLStore) UpdateSessionRemotePubKey(ctx context.Context, alias ID,
	remotePubKey *btcec.PublicKey) error {

	var (
		writeTxOpts db.QueriesTxOptions
		remoteKey   = remotePubKey.SerializeCompressed()
	)
	return s.db.ExecTx(ctx, &writeTxOpts, func(db SQLQueries) error {
		id, err := db.GetSessionIDByAlias(ctx, alias[:])
		if errors.Is(err, sql.ErrNoRows) {
			return fmt.Errorf("%w: %w", ErrSessionNotFound, err)
		} else if err != nil {
			return fmt.Errorf("unable to get session: %w", err)
		}

		return db.SetSessionRemotePublicKey(
			ctx, sqlc.SetSessionRemotePublicKeyParams{
				ID:              id,
				RemotePublicKey: remoteKey,
			},
		)
	})
}

// getSqlUnusedAliasAndKeyPair can be used to generate a new, unused, local
// private key and session Alias pair. Care must be taken to ensure that no
// other thread calls this before the returned Alias and key pair from this
// method are either used or discarded.
func getSqlUnusedAliasAndKeyPair(ctx context.Context, db SQLQueries) (ID,
	*btcec.PrivateKey, error) {

	// Spin until we find a key with an Alias that does not collide
	// with any of our existing IDs.
	for {
		// Generate a new private key and Alias pair.
		privKey, alias, err := NewSessionPrivKeyAndID()
		if err != nil {
			return ID{}, nil, err
		}

		// Check that no such legacy Alias exits.
		_, err = db.GetSessionByAlias(ctx, alias[:])
		if errors.Is(err, sql.ErrNoRows) {
			return alias, privKey, nil
		} else if err != nil {
			return ID{}, nil, fmt.Errorf("unable to get "+
				"session: %w", err)
		}

		continue
	}
}

// GetSession returns the session with the given legacy Alias.
//
// NOTE: This is part of the Store interface.
func (s *SQLStore) GetSession(ctx context.Context, alias ID) (*Session, error) {
	var (
		readTxOpts = db.NewQueryReadTx()
		sess       *Session
	)
	err := s.db.ExecTx(ctx, &readTxOpts, func(db SQLQueries) error {
		dbSess, err := db.GetSessionByAlias(ctx, alias[:])
		if errors.Is(err, sql.ErrNoRows) {
			return ErrSessionNotFound
		} else if err != nil {
			return fmt.Errorf("unable to get session: %w", err)
		}

		sess, err = unmarshalSession(ctx, s.db, dbSess)
		if err != nil {
			return fmt.Errorf("unable to unmarshal session: %w",
				err)
		}

		return nil
	})

	return sess, err
}

// GetGroupID will return the legacy group Alias for the given legacy session Alias.
//
// NOTE: This is part of the AliasToGroupIndex interface.
func (s *SQLStore) GetGroupID(ctx context.Context, sessionID ID) (ID, error) {
	var (
		readTxOpts    = db.NewQueryReadTx()
		legacyGroupID ID
	)
	err := s.db.ExecTx(ctx, &readTxOpts, func(db SQLQueries) error {
		// Get the session using the legacy Alias.
		sess, err := db.GetSessionByAlias(ctx, sessionID[:])
		if errors.Is(err, sql.ErrNoRows) {
			return ErrUnknownGroup
		} else if err != nil {
			return err
		}

		if !sess.GroupID.Valid {
			return fmt.Errorf("session does not have a group Alias")
		}

		// Get the legacy group Alias using the session group Alias.
		legacyGroupIDB, err := db.GetAliasBySessionID(
			ctx, sess.GroupID.Int64,
		)
		if errors.Is(err, sql.ErrNoRows) {
			return fmt.Errorf("%w: session not found for group "+
				"ID: %w", ErrSessionNotFound, err)
		}
		if err != nil {
			return err
		}

		legacyGroupID, err = IDFromBytes(legacyGroupIDB)

		return err
	})
	if err != nil {
		return ID{}, err
	}

	return legacyGroupID, nil
}

// GetSessionIDs will return the set of legacy session IDs that are in the
// group with the given legacy Alias.
//
// NOTE: This is part of the AliasToGroupIndex interface.
func (s *SQLStore) GetSessionIDs(ctx context.Context, legacyGroupID ID) ([]ID,
	error) {

	var (
		readTxOpts = db.NewQueryReadTx()
		sessionIDs []ID
	)
	err := s.db.ExecTx(ctx, &readTxOpts, func(db SQLQueries) error {
		groupID, err := db.GetSessionIDByAlias(ctx, legacyGroupID[:])
		if errors.Is(err, sql.ErrNoRows) {
			return ErrUnknownGroup
		} else if err != nil {
			return fmt.Errorf("unable to get session Alias: %v",
				err)
		}

		sessIDs, err := db.GetSessionAliasesInGroup(
			ctx, sql.NullInt64{
				Int64: groupID,
				Valid: true,
			},
		)
		if err != nil {
			return fmt.Errorf("unable to get session IDs: %v", err)
		}

		sessionIDs = make([]ID, len(sessIDs))
		for i, sessID := range sessIDs {
			id, err := IDFromBytes(sessID)
			if err != nil {
				return err
			}

			sessionIDs[i] = id
		}

		return nil
	})
	if err != nil {
		return nil, err
	}

	return sessionIDs, nil
}

func unmarshalSession(ctx context.Context, db SQLQueries,
	dbSess sqlc.Session) (*Session, error) {

	var legacyGroupID ID
	if dbSess.GroupID.Valid {
		groupID, err := db.GetAliasBySessionID(
			ctx, dbSess.GroupID.Int64,
		)
		if err != nil {
			return nil, fmt.Errorf("unable to get legacy group "+
				"Alias: %v", err)
		}

		legacyGroupID, err = IDFromBytes(groupID)
		if err != nil {
			return nil, fmt.Errorf("unable to get legacy Alias: %v",
				err)
		}
	}

	var acctAlias fn.Option[accounts.AccountID]
	if dbSess.AccountID.Valid {
		account, err := db.GetAccount(ctx, dbSess.AccountID.Int64)
		if err != nil {
			return nil, fmt.Errorf("unable to get account: %v", err)
		}

		accountAlias, err := accounts.AccountIDFromInt64(account.Alias)
		if err != nil {
			return nil, fmt.Errorf("unable to get account ID: %v", err)
		}
		acctAlias = fn.Some(accountAlias)
	}

	legacyID, err := IDFromBytes(dbSess.Alias)
	if err != nil {
		return nil, fmt.Errorf("unable to get legacy Alias: %v", err)
	}

	var revokedAt time.Time
	if dbSess.RevokedAt.Valid {
		revokedAt = dbSess.RevokedAt.Time
	}

	localPriv, localPub := btcec.PrivKeyFromBytes(dbSess.LocalPrivateKey)

	var remotePub *btcec.PublicKey
	if len(dbSess.RemotePublicKey) != 0 {
		remotePub, err = btcec.ParsePubKey(dbSess.RemotePublicKey)
		if err != nil {
			return nil, fmt.Errorf("unable to parse remote "+
				"public key: %v", err)
		}
	}

	// Get the macaroon permissions if they exist.
	perms, err := db.GetSessionMacaroonPermissions(ctx, dbSess.ID)
	if err != nil {
		return nil, fmt.Errorf("unable to get macaroon "+
			"permissions: %v", err)
	}

	// Get the macaroon caveats if they exist.
	caveats, err := db.GetSessionMacaroonCaveats(ctx, dbSess.ID)
	if err != nil {
		return nil, fmt.Errorf("unable to get macaroon "+
			"caveats: %v", err)
	}

	var macRecipe *MacaroonRecipe
	if perms != nil || caveats != nil {
		macRecipe = &MacaroonRecipe{
			Permissions: unmarshalMacPerms(perms),
			Caveats:     unmarshalMacCaveats(caveats),
		}
	}

	// Get the feature configs if they exist.
	featureConfigs, err := db.GetSessionFeatureConfigs(ctx, dbSess.ID)
	if err != nil {
		return nil, fmt.Errorf("unable to get feature configs: %v", err)
	}

	var featureCfgs *FeaturesConfig
	if featureConfigs != nil {
		featureCfgs = unmarshalFeatureConfigs(featureConfigs)
	}

	// Get the privacy flags if they exist.
	privacyFlags, err := db.GetSessionPrivacyFlags(ctx, dbSess.ID)
	if err != nil {
		return nil, fmt.Errorf("unable to get privacy flags: %v", err)
	}

	var privFlags PrivacyFlags
	if privacyFlags != nil {
		privFlags = unmarshalPrivacyFlags(privacyFlags)
	}

	var pairingSecret [mailbox.NumPassphraseEntropyBytes]byte
	copy(pairingSecret[:], dbSess.PairingSecret)

	return &Session{
		ID:                legacyID,
		Label:             dbSess.Label,
		State:             State(dbSess.State),
		Type:              Type(dbSess.Type),
		Expiry:            dbSess.Expiry,
		CreatedAt:         dbSess.CreatedAt,
		RevokedAt:         revokedAt,
		ServerAddr:        dbSess.ServerAddress,
		DevServer:         dbSess.DevServer,
		MacaroonRootKey:   uint64(dbSess.MacaroonRootKey),
		PairingSecret:     pairingSecret,
		LocalPrivateKey:   localPriv,
		LocalPublicKey:    localPub,
		RemotePublicKey:   remotePub,
		WithPrivacyMapper: dbSess.Privacy,
		GroupID:           legacyGroupID,
		PrivacyFlags:      privFlags,
		MacaroonRecipe:    macRecipe,
		FeatureConfig:     featureCfgs,
		AccountID:         acctAlias,
	}, nil
}

func unmarshalMacPerms(dbPerms []sqlc.SessionMacaroonPermission) []bakery.Op {
	ops := make([]bakery.Op, len(dbPerms))
	for i, dbPerm := range dbPerms {
		ops[i] = bakery.Op{
			Entity: dbPerm.Entity,
			Action: dbPerm.Action,
		}
	}

	return ops
}

func unmarshalMacCaveats(dbCaveats []sqlc.SessionMacaroonCaveat) []macaroon.Caveat {
	caveats := make([]macaroon.Caveat, len(dbCaveats))
	for i, dbCaveat := range dbCaveats {
		caveats[i] = macaroon.Caveat{
			Id:             dbCaveat.CaveatID,
			VerificationId: dbCaveat.VerificationID,
			Location:       dbCaveat.Location.String,
		}
	}

	return caveats
}

func unmarshalFeatureConfigs(dbConfigs []sqlc.SessionFeatureConfig) *FeaturesConfig {
	configs := make(FeaturesConfig, len(dbConfigs))
	for _, dbConfig := range dbConfigs {
		configs[dbConfig.FeatureName] = dbConfig.Config
	}

	return &configs
}

func unmarshalPrivacyFlags(dbFlags []sqlc.SessionPrivacyFlag) PrivacyFlags {
	flags := make(PrivacyFlags, len(dbFlags))
	for i, dbFlag := range dbFlags {
		flags[i] = PrivacyFlag(dbFlag.Flag)
	}

	return flags
}
