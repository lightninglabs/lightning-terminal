package session

import (
	"bytes"
	"context"
	"database/sql"
	"errors"
	"fmt"
	"reflect"
	"sort"
	"time"

	"github.com/davecgh/go-spew/spew"
	"github.com/lightninglabs/lightning-terminal/accounts"
	"github.com/lightninglabs/lightning-terminal/db/sqlc"
	"github.com/lightningnetwork/lnd/fn"
	"github.com/lightningnetwork/lnd/sqldb"
	"github.com/pmezard/go-difflib/difflib"
	"go.etcd.io/bbolt"
)

var (
	// ErrMigrationMismatch is returned when the migrated session does not
	// match the original session.
	ErrMigrationMismatch = fmt.Errorf("migrated session does not match " +
		"original session")
)

// MigrateSessionStoreToSQL runs the migration of all sessions from the KV
// database to the SQL database. The migration is done in a single transaction
// to ensure that all sessions are migrated or none at all.
//
// NOTE: As sessions may contain linked accounts, the accounts sql migration
// MUST be run prior to this migration.
func MigrateSessionStoreToSQL(ctx context.Context, kvStore *bbolt.DB,
	tx SQLQueries) error {

	log.Infof("Starting migration of the KV sessions store to SQL")

	kvSessions, err := getBBoltSessions(kvStore)
	if err != nil {
		return err
	}

	initialGroupSessions, linkedSessions := filterSessions(kvSessions)

	// Migrate the non-linked sessions first.
	err = migrateSessionsToSQLAndValidate(ctx, tx, initialGroupSessions)
	if err != nil {
		return fmt.Errorf("migration of non-linked session failed: %w",
			err)
	}

	// Then migrate the linked sessions.
	err = migrateSessionsToSQLAndValidate(ctx, tx, linkedSessions)
	if err != nil {
		return fmt.Errorf("migration of linked session failed: %w", err)
	}

	total := len(initialGroupSessions) + len(linkedSessions)
	log.Infof("All sessions migrated from KV to SQL. Total number of "+
		"sessions migrated: %d", total)

	return nil
}

// filterSessions categorizes the sessions into two groups: initial group
// sessions and linked sessions. The initial group sessions are the first
// sessions in a session group, while the linked sessions are those that have a
// linked parent session. These are separated to ensure that we can insert the
// initial group sessions first, which allows us to fetch the SQL group ID when
// inserting the rest of the linked sessions afterward.
//
// Additionally, it checks for duplicate session IDs and drops all but
// one session with the same ID, keeping the one with the latest CreatedAt
// timestamp. Note that users with duplicate session IDs should be extremely
// rare, as it could only occur if colliding session IDs were created prior to
// the introduction of the session linking functionality.
func filterSessions(kvSessions []*Session) ([]*Session, []*Session) {
	// First map sessions by their ID.
	sessionsByID := make(map[ID][]*Session)
	for _, s := range kvSessions {
		sessionsByID[s.ID] = append(sessionsByID[s.ID], s)
	}

	var (
		initialGroupSessions []*Session
		linkedSessions       []*Session
	)

	// Process the mapped sessions. If there are duplicate sessions with the
	// same ID, we will only iterate the session with the latest CreatedAt
	// timestamp, and drop the other sessions. This is to ensure that we can
	// keep a UNIQUE constraint for the session ID (alias) in the SQL db.
	for id, sessions := range sessionsByID {
		sessionToKeep := sessions[0]
		if len(sessions) > 1 {
			log.Warnf("Found %d sessions with duplicate ID %x, "+
				"keeping only the latest one", len(sessions),
				id)

			// Find the session with the latest timestamp.
			latestSession := sessions[0]
			for _, s := range sessions[1:] {
				if s.CreatedAt.After(latestSession.CreatedAt) {
					latestSession = s
				}
			}
			sessionToKeep = latestSession

			// Log the sessions that will be dropped.
			for _, s := range sessions {
				if s == sessionToKeep {
					continue
				}
				log.Warnf("Dropping duplicate session with ID "+
					"%x created at %v", id, s.CreatedAt)
			}
		}

		// Categorize the session that we are keeping.
		if sessionToKeep.GroupID == sessionToKeep.ID {
			initialGroupSessions = append(
				initialGroupSessions, sessionToKeep,
			)
		} else {
			linkedSessions = append(linkedSessions, sessionToKeep)
		}
	}

	return initialGroupSessions, linkedSessions
}

// getBBoltSessions is a helper function that fetches all sessions from the
// Bbolt store, by iterating directly over the buckets, without needing to
// use any public functions of the BoltStore struct.
func getBBoltSessions(db *bbolt.DB) ([]*Session, error) {
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

	return sessions, err
}

// migrateSessionsToSQLAndValidate runs the migration for the passed sessions
// from the KV database to the SQL database, and validates that the migrated
// sessions match the original sessions.
func migrateSessionsToSQLAndValidate(ctx context.Context,
	tx SQLQueries, kvSessions []*Session) error {

	for _, kvSession := range kvSessions {
		err := migrateSingleSessionToSQL(ctx, tx, kvSession)
		if err != nil {
			return fmt.Errorf("unable to migrate session(%v): %w",
				kvSession.ID, err)
		}

		// Validate that the session was correctly migrated and matches
		// the original session in the kv store.
		sqlSess, err := tx.GetSessionByAlias(ctx, kvSession.ID[:])
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				err = ErrSessionNotFound
			}
			return fmt.Errorf("unable to get migrated session "+
				"from sql store: %w", err)
		}

		migratedSession, err := unmarshalSession(ctx, tx, sqlSess)
		if err != nil {
			return fmt.Errorf("unable to unmarshal migrated "+
				"session: %w", err)
		}

		overrideSessionTimeZone(kvSession)
		overrideSessionTimeZone(migratedSession)
		overrideMacaroonRecipe(kvSession, migratedSession)
		overrideRemovedAccount(kvSession, migratedSession)
		overrideFeatureConfig(kvSession, migratedSession)

		if !reflect.DeepEqual(kvSession, migratedSession) {
			diff := difflib.UnifiedDiff{
				A: difflib.SplitLines(
					spew.Sdump(kvSession),
				),
				B: difflib.SplitLines(
					spew.Sdump(migratedSession),
				),
				FromFile: "Expected",
				FromDate: "",
				ToFile:   "Actual",
				ToDate:   "",
				Context:  3,
			}
			diffText, _ := difflib.GetUnifiedDiffString(diff)

			return fmt.Errorf("%w: %v.\n%v", ErrMigrationMismatch,
				kvSession.ID, diffText)
		}
	}

	return nil
}

// migrateSingleSessionToSQL runs the migration for a single session from the
// KV database to the SQL database. Note that if the session links to an
// account, the linked accounts store MUST have been migrated before that
// session is migrated.
func migrateSingleSessionToSQL(ctx context.Context,
	tx SQLQueries, session *Session) error {

	var (
		acctID       sql.NullInt64
		err          error
		remotePubKey []byte
	)

	session.AccountID.WhenSome(func(alias accounts.AccountID) {
		// Fetch the SQL ID for the account from the SQL store.
		var acctAlias int64
		acctAlias, err = alias.ToInt64()
		if err != nil {
			return
		}

		var acctDBID int64
		acctDBID, err = tx.GetAccountIDByAlias(ctx, acctAlias)
		if errors.Is(err, sql.ErrNoRows) {
			// If we can't find the account in the SQL store, it
			// most likely means that the user deleted the account
			// with the "litcli accounts remove" command after the
			// session was created. We therefore can't link the
			// SQL session to the account, and we therefore just
			// leave the acctID as sql.Null
			log.Warnf("Unable to find account %v in SQL store, "+
				"skipping linking session %x to account",
				acctAlias, session.ID)
			err = nil

			return
		} else if err != nil {
			return
		}

		acctID = sqldb.SQLInt64(acctDBID)
	})
	if err != nil {
		return err
	}

	if session.RemotePublicKey != nil {
		remotePubKey = session.RemotePublicKey.SerializeCompressed()
	}

	// Proceed to insert the session into the sql db.
	sqlId, err := tx.InsertSession(ctx, sqlc.InsertSessionParams{
		Alias:           session.ID[:],
		Label:           session.Label,
		State:           int16(session.State),
		Type:            int16(session.Type),
		Expiry:          session.Expiry.UTC(),
		CreatedAt:       session.CreatedAt.UTC(),
		ServerAddress:   session.ServerAddr,
		DevServer:       session.DevServer,
		MacaroonRootKey: int64(session.MacaroonRootKey),
		PairingSecret:   session.PairingSecret[:],
		LocalPrivateKey: session.LocalPrivateKey.Serialize(),
		LocalPublicKey:  session.LocalPublicKey.SerializeCompressed(),
		RemotePublicKey: remotePubKey,
		Privacy:         session.WithPrivacyMapper,
		AccountID:       acctID,
	})
	if err != nil {
		return err
	}

	// Since the InsertSession query doesn't support that we set the revoked
	// field during the insert, we need to set the field after the session
	// has been created.
	if !session.RevokedAt.IsZero() {
		err = tx.SetSessionRevokedAt(
			ctx, sqlc.SetSessionRevokedAtParams{
				ID: sqlId,
				RevokedAt: sqldb.SQLTime(
					session.RevokedAt.UTC(),
				),
			},
		)
		if err != nil {
			return err
		}
	}

	// After the session has been inserted, we need to update the session
	// with the group ID if it is linked to a group. We need to do this
	// after the session has been inserted, because the group ID can be the
	// session itself, and therefore the SQL id for the session won't exist
	// prior to inserting the session.
	groupID, err := tx.GetSessionIDByAlias(ctx, session.GroupID[:])
	if errors.Is(err, sql.ErrNoRows) {
		return ErrUnknownGroup
	} else if err != nil {
		return fmt.Errorf("unable to fetch group(%x): %w",
			session.GroupID[:], err)
	}

	// Now lets set the group ID for the session.
	err = tx.SetSessionGroupID(ctx, sqlc.SetSessionGroupIDParams{
		ID:      sqlId,
		GroupID: sqldb.SQLInt64(groupID),
	})
	if err != nil {
		return fmt.Errorf("unable to set group Alias: %w", err)
	}

	// Once we have the sqlID for the session, we can proceed to insert rows
	// into the linked child tables.
	if session.MacaroonRecipe != nil {
		// We start by inserting the macaroon permissions.
		for _, sessionPerm := range session.MacaroonRecipe.Permissions {
			err = tx.InsertSessionMacaroonPermission(
				ctx, sqlc.InsertSessionMacaroonPermissionParams{
					SessionID: sqlId,
					Entity:    sessionPerm.Entity,
					Action:    sessionPerm.Action,
				},
			)
			if err != nil {
				return err
			}
		}

		// Next we insert the macaroon caveats.
		for _, caveat := range session.MacaroonRecipe.Caveats {
			err = tx.InsertSessionMacaroonCaveat(
				ctx, sqlc.InsertSessionMacaroonCaveatParams{
					SessionID:      sqlId,
					CaveatID:       caveat.Id,
					VerificationID: caveat.VerificationId,
					Location: sqldb.SQLStr(
						caveat.Location,
					),
				},
			)
			if err != nil {
				return err
			}
		}
	}

	// That's followed by the feature config.
	if session.FeatureConfig != nil {
		for featureName, config := range *session.FeatureConfig {
			err = tx.InsertSessionFeatureConfig(
				ctx, sqlc.InsertSessionFeatureConfigParams{
					SessionID:   sqlId,
					FeatureName: featureName,
					Config:      config,
				},
			)
			if err != nil {
				return err
			}
		}
	}

	// Finally we insert the privacy flags.
	for _, privacyFlag := range session.PrivacyFlags {
		err = tx.InsertSessionPrivacyFlag(
			ctx, sqlc.InsertSessionPrivacyFlagParams{
				SessionID: sqlId,
				Flag:      int32(privacyFlag),
			},
		)
		if err != nil {
			return err
		}
	}

	return nil
}

// overrideSessionTimeZone overrides the time zone of the session to the local
// time zone and chops off the nanosecond part for comparison. This is needed
// because KV database stores times as-is which as an unwanted side effect would
// fail migration due to time comparison expecting both the original and
// migrated sessions to be in the same local time zone and in microsecond
// precision. Note that PostgresSQL stores times in microsecond precision while
// SQLite can store times in nanosecond precision if using TEXT storage class.
func overrideSessionTimeZone(session *Session) {
	fixTime := func(t time.Time) time.Time {
		return t.In(time.Local).Truncate(time.Microsecond)
	}

	if !session.Expiry.IsZero() {
		session.Expiry = fixTime(session.Expiry)
	}

	if !session.CreatedAt.IsZero() {
		session.CreatedAt = fixTime(session.CreatedAt)
	}

	if !session.RevokedAt.IsZero() {
		session.RevokedAt = fixTime(session.RevokedAt)
	}
}

// overrideMacaroonRecipe overrides the MacaroonRecipe for the SQL session in a
// certain scenario:
// In the bbolt store, a session can have a non-nil macaroon struct, despite
// both the permissions and caveats being nil. There is no way to represent this
// in the SQL store, as the macaroon permissions and caveats are separate
// tables. Therefore, in the scenario where a MacaroonRecipe exists for the
// bbolt version, but both the permissions and caveats are nil, we override the
// MacaroonRecipe for the SQL version and set it to a MacaroonRecipe with
// nil permissions and caveats. This is needed to ensure that the deep equals
// check in the migration validation does not fail in this scenario.
// Additionally, if either the permissions or caveats aren't set, for the
// MacaroonRecipe, that is represented as empty array in the SQL store, but
// as nil in the bbolt store. Therefore, we also override the permissions
// or caveats to nil for the migrated session in that scenario, so that the
// deep equals check does not fail in this scenario either.
//
// Additionally, we sort the caveats & permissions of both the kv and sql
// sessions by their ID, so that they are always comparable in a deterministic
// way with deep equals.
func overrideMacaroonRecipe(kvSession *Session, migratedSession *Session) {
	if kvSession.MacaroonRecipe != nil {
		kvPerms := kvSession.MacaroonRecipe.Permissions
		kvCaveats := kvSession.MacaroonRecipe.Caveats

		// If the kvSession has a MacaroonRecipe with nil set for any
		// of the fields, we need to override the migratedSession
		// MacaroonRecipe to match that.
		if kvPerms == nil && kvCaveats == nil {
			migratedSession.MacaroonRecipe = &MacaroonRecipe{}
		} else if kvPerms == nil {
			migratedSession.MacaroonRecipe.Permissions = nil
		} else if kvCaveats == nil {
			migratedSession.MacaroonRecipe.Caveats = nil
		}

		sqlCaveats := migratedSession.MacaroonRecipe.Caveats
		sqlPerms := migratedSession.MacaroonRecipe.Permissions

		// If there have been caveats set for the MacaroonRecipe,
		// the order of the postgres db caveats will in very rare cases
		// differ from the kv store caveats. Therefore, we sort
		// both the kv and sql caveats by their ID, so that we can
		// compare them in a deterministic way.
		if kvCaveats != nil {
			sort.Slice(kvCaveats, func(i, j int) bool {
				return bytes.Compare(
					kvCaveats[i].Id, kvCaveats[j].Id,
				) < 0
			})

			sort.Slice(sqlCaveats, func(i, j int) bool {
				return bytes.Compare(
					sqlCaveats[i].Id, sqlCaveats[j].Id,
				) < 0
			})
		}

		// Similarly, we sort the macaroon permissions for both the kv
		// and sql sessions, so that we can compare them in a
		// deterministic way.
		if kvPerms != nil {
			sort.Slice(kvPerms, func(i, j int) bool {
				if kvPerms[i].Entity == kvPerms[j].Entity {
					return kvPerms[i].Action <
						kvPerms[j].Action
				}

				return kvPerms[i].Entity < kvPerms[j].Entity
			})

			sort.Slice(sqlPerms, func(i, j int) bool {
				if sqlPerms[i].Entity == sqlPerms[j].Entity {
					return sqlPerms[i].Action <
						sqlPerms[j].Action
				}

				return sqlPerms[i].Entity < sqlPerms[j].Entity
			})
		}
	}
}

// overrideRemovedAccount modifies the kvSession to remove the account ID if the
// migrated session does not have an account ID, while the kvSession has one.
// This happens when the account was not found in the SQL store during the
// migration, which can occur if the account was deleted after the session
// was created.
func overrideRemovedAccount(kvSession *Session, migratedSession *Session) {
	kvSession.AccountID = fn.ElimOption(
		migratedSession.AccountID,

		// If the migrated session does not have a linked account, we
		// also remove it from the kv session.
		func() fn.Option[accounts.AccountID] {
			return fn.None[accounts.AccountID]()
		},

		// If the migrated session has a linked account, we keep the
		// account on the kv session.
		func(id accounts.AccountID) fn.Option[accounts.AccountID] {
			return kvSession.AccountID
		},
	)
}

// overrideFeatureConfig overrides a specific feature's config for the SQL
// session in a certain scenario:
//
// In the bbolt store, an empty config for a feature is represented as an empty
// array, while in for the SQL store, the same config is represented as nil.
// Therefore, in the scenario where a specific feature has an empty config, we
// override the SQL FeatureConfig for that feature to also be set to an empty
// array. This is needed to ensure that the deep equals check in the migration
// validation does not fail in this scenario.
func overrideFeatureConfig(kvSession *Session, mSession *Session) {
	// If the FeatureConfig hasn't been set, we can return early.
	if mSession.FeatureConfig == nil {
		return
	}
	migratedConf := *mSession.FeatureConfig

	if kvSession.FeatureConfig != nil && mSession.FeatureConfig != nil {
		for featureName, config := range *kvSession.FeatureConfig {
			// If the config is empty for the feature, we override
			// the SQL version.
			if len(config) == 0 {
				migratedConf[featureName] = make([]byte, 0)
			}
		}
	}
}
