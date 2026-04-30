//go:build dev

package migsets

import (
	"context"
	"database/sql"
	"encoding/binary"
	"fmt"
	"path/filepath"
	"time"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database"
	"github.com/lightninglabs/lightning-terminal/accounts"
	"github.com/lightninglabs/lightning-terminal/db/sqlcmig6"
	"github.com/lightninglabs/lightning-terminal/firewalldb"
	"github.com/lightninglabs/lightning-terminal/session"
	"github.com/lightningnetwork/lnd/clock"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/sqldb/v2"
)

// MakePostStepCallbacksMig6 turns the post migration checks into a map of post
// step callbacks that can be used with the migrate package. The keys of the map
// are the migration versions, and the values are the callbacks that will be
// executed after the migration with the corresponding version is applied.
func MakePostStepCallbacksMig6(ctx context.Context,
	basicClient lnrpc.LightningClient, db *sqldb.BaseDB,
	macPath string, clock clock.Clock,
	migVersion uint) migrate.ProgrammaticMigrEntry {

	mig6queries := sqlcmig6.NewForType(db, db.BackendType)
	mig6executor := sqldb.NewTransactionExecutor(
		db, func(tx *sql.Tx) *sqlcmig6.Queries {
			return mig6queries.WithTx(tx)
		},
	)

	pMigr := func(_ *migrate.Migration, _ database.Driver) error {
		// We ignore the actual driver that's being returned here, since
		// we use migrate.NewWithInstance() to create the migration
		// instance from our already instantiated database backend that
		// is also passed into this function.
		err := mig6executor.ExecTx(
			ctx, sqldb.WriteTxOpt(),
			func(q6 *sqlcmig6.Queries) error {
				log.Infof("Running post migration callback "+
					"for migration version %d", migVersion)

				return kvdbToSqlMigrationCallback(
					ctx, basicClient, macPath, db, clock,
					q6,
				)
			}, sqldb.NoOpReset,
		)
		if err != nil {
			return err
		}

		// Now deprecate the kvdb database files. Note that if the
		// deprecation function errors, we do not return the error.
		//
		// At this point the kvdb -> SQL data migration is already
		// committed successfully. Returning an error here would only
		// cause the programmatic migration to rerun on the next startup
		// and reprocess data that is already present in SQL.
		//
		// We still want the failure to be highly visible because the
		// legacy bbolt files were not tombstoned and may therefore
		// still be opened unexpectedly.
		err = deprecateKVDBStores(filepath.Dir(macPath))
		if err != nil {
			log.Errorf("CRITICAL: kvdb -> SQL migration "+
				"succeeded, but the legacy bbolt databases "+
				"were not marked deprecated: %v", err)
		}

		return nil
	}

	return migrate.ProgrammaticMigrEntry{
		// We want the migration to rerun on next startup if it errors,
		// and not set the user's db to a dirty state.
		ResetVersionOnError: true,
		ProgrammaticMigr:    pMigr,
	}
}

func kvdbToSqlMigrationCallback(ctx context.Context,
	basicClient lnrpc.LightningClient, macPath string, _ *sqldb.BaseDB,
	clock clock.Clock, q *sqlcmig6.Queries) error {

	start := time.Now()
	log.Infof("Starting KVDB to SQL migration for all stores")

	accountStore, err := accounts.NewBoltStoreForMigration(
		filepath.Dir(macPath), accounts.DBFilename, clock,
	)
	if err != nil {
		return err
	}

	defer func() {
		err := accountStore.Close()
		if err != nil {
			log.Errorf("Error closing bbolt account store during "+
				"migration: %v", err)
		}
	}()

	err = accounts.MigrateAccountStoreToSQL(ctx, accountStore.DB, q)
	if err != nil {
		return fmt.Errorf("error migrating account store to "+
			"SQL: %w", err)
	}

	sessionStore, err := session.NewDBForMigration(
		filepath.Dir(macPath), session.DBFilename,
		clock, accountStore,
	)
	if err != nil {
		return err
	}

	defer func() {
		err := sessionStore.Close()
		if err != nil {
			log.Errorf("Error closing bbolt session store during "+
				"migration: %v", err)
		}
	}()

	err = session.MigrateSessionStoreToSQL(ctx, sessionStore.DB, q)
	if err != nil {
		return fmt.Errorf("error migrating session store to "+
			"SQL: %w", err)
	}

	firewallStore, err := firewalldb.NewBoltDBForMigration(
		filepath.Dir(macPath), firewalldb.DBFilename,
		sessionStore, accountStore, clock,
	)
	if err != nil {
		return err
	}

	defer func() {
		err := firewallStore.Close()
		if err != nil {
			log.Errorf("Error closing bbolt rules store during "+
				"migration: %v", err)
		}
	}()

	// We'll fetch the macaroonIDList from `lnd` next. Note that since lnd's
	// RPC servers may not have been fully started yet if the execution of
	// accounts and session migration were really quick, we poll the request
	// up to 10 times with a 0.5 second delay between the attempts. This
	// should be a sufficient amount of time for the RPC servers to start.
	const (
		maxListMacaroonIDAttempts = 10
		listMacaroonIDRetryDelay  = 500 * time.Millisecond
	)

	var macaroonIDList *lnrpc.ListMacaroonIDsResponse
	for i := 1; i <= maxListMacaroonIDAttempts; i++ {
		macaroonIDList, err = basicClient.ListMacaroonIDs(
			ctx, &lnrpc.ListMacaroonIDsRequest{},
		)
		if err == nil {
			break
		}

		if i == maxListMacaroonIDAttempts {
			return fmt.Errorf("error listing macaroon IDs when "+
				"migrating stores to SQL after %d attempts: %w",
				maxListMacaroonIDAttempts, err)
		}

		log.Warnf("Failed to list macaroon IDs when migrating "+
			"stores to SQL (attempt %d/%d), retrying in %v: %v",
			i, maxListMacaroonIDAttempts, listMacaroonIDRetryDelay,
			err)

		select {
		case <-ctx.Done():
			return fmt.Errorf("context canceled while retrying "+
				"to list macaroon IDs: %w", ctx.Err())
		case <-time.After(listMacaroonIDRetryDelay):
		}
	}

	log.Infof("Successfully listed macaroon IDs during store migration.")

	var macRootKeyIDs [][]byte
	if macaroonIDList != nil {
		for _, rootKeyID := range macaroonIDList.RootKeyIds {
			rootKeyBytes := make([]byte, 8)
			binary.BigEndian.PutUint64(rootKeyBytes[:], rootKeyID)

			macRootKeyIDs = append(macRootKeyIDs, rootKeyBytes)
		}
	}

	err = firewalldb.MigrateFirewallDBToSQL(
		ctx, firewallStore.DB, q, macRootKeyIDs,
	)
	if err != nil {
		return fmt.Errorf("error migrating firewalldb store "+
			"to SQL: %w", err)
	}

	log.Infof("Succesfully migrated all KVDB stores to SQL in: %v",
		time.Since(start))

	return nil
}

// deprecateKVDBStores marks the old kvdb stores as deprecated after the SQL
// migration committed successfully. We do this after the SQL transaction is
// committed so a failed SQL migration cannot strand the user with an unusable
// kvdb backend.
func deprecateKVDBStores(dbDir string) error {
	err := accounts.DeprecateKVDB(
		filepath.Join(dbDir, accounts.DBFilename),
	)
	if err != nil {
		return fmt.Errorf("error deprecating accounts kvdb: %w", err)
	}

	err = session.DeprecateKVDB(
		filepath.Join(dbDir, session.DBFilename),
	)
	if err != nil {
		return fmt.Errorf("error deprecating session kvdb: %w", err)
	}

	err = firewalldb.DeprecateKVDB(
		filepath.Join(dbDir, firewalldb.DBFilename),
	)
	if err != nil {
		return fmt.Errorf("error deprecating firewall kvdb: %w", err)
	}

	return nil
}
