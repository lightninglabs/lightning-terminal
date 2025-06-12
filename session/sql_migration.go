package session

import (
	"bytes"
	"context"
	"database/sql"
	"errors"
	"fmt"
	"reflect"
	"time"

	"github.com/davecgh/go-spew/spew"
	"github.com/lightninglabs/lightning-terminal/accounts"
	"github.com/lightninglabs/lightning-terminal/db/sqlc"
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

	// If sessions are linked to a group, we must insert the initial session
	// of each group before the other sessions in that group. This ensures
	// we can retrieve the SQL group ID when inserting the remaining
	// sessions. Therefore, we first insert all initial group sessions,
	// allowing us to fetch the group IDs and insert the rest of the
	// sessions afterward.
	// We therefore filter out the initial sessions first, and then migrate
	// them prior to the rest of the sessions.
	var (
		initialGroupSessions []*Session
		linkedSessions       []*Session
	)

	for _, kvSession := range kvSessions {
		if kvSession.GroupID == kvSession.ID {
			initialGroupSessions = append(
				initialGroupSessions, kvSession,
			)
		} else {
			linkedSessions = append(linkedSessions, kvSession)
		}
	}

	err = migrateSessionsToSQLAndValidate(ctx, tx, initialGroupSessions)
	if err != nil {
		return fmt.Errorf("migration of non-linked session failed: %w",
			err)
	}

	err = migrateSessionsToSQLAndValidate(ctx, tx, linkedSessions)
	if err != nil {
		return fmt.Errorf("migration of linked session failed: %w", err)
	}

	total := len(initialGroupSessions) + len(linkedSessions)
	log.Infof("All sessions migrated from KV to SQL. Total number of "+
		"sessions migrated: %d", total)

	return nil
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
			err = accounts.ErrAccNotFound
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
func overrideMacaroonRecipe(kvSession *Session, migratedSession *Session) {
	if kvSession.MacaroonRecipe != nil {
		kvPerms := kvSession.MacaroonRecipe.Permissions
		kvCaveats := kvSession.MacaroonRecipe.Caveats

		if kvPerms == nil && kvCaveats == nil {
			migratedSession.MacaroonRecipe = &MacaroonRecipe{}
		} else if kvPerms == nil {
			migratedSession.MacaroonRecipe.Permissions = nil
		} else if kvCaveats == nil {
			migratedSession.MacaroonRecipe.Caveats = nil
		}
	}
}
