package migsets

import (
	"context"
	"database/sql"
	"encoding/binary"
	"errors"
	"fmt"
	"path/filepath"
	"time"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database"
	"github.com/lightninglabs/lightning-terminal/accounts"
	"github.com/lightninglabs/lightning-terminal/db/sqlcmig6"
	"github.com/lightninglabs/lightning-terminal/db/tombstone"
	"github.com/lightninglabs/lightning-terminal/firewalldb"
	"github.com/lightninglabs/lightning-terminal/session"
	"github.com/lightningnetwork/lnd/clock"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/sqldb/v2"
)

// Mig6ProgrammaticMigration generates and returns the programmatic migration
// entry containing the kvdb to SQL migration for all of litd's database stores.
func Mig6ProgrammaticMigration(ctx context.Context,
	basicClient lnrpc.LightningClient, db *sqldb.BaseDB,
	accountsDir, networkDir string, clock clock.Clock,
	migVersion uint,
	lndReadyTimeout time.Duration) migrate.ProgrammaticMigrEntry {

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
				log.Infof("Running the programmatic migration "+
					"for migration version %d", migVersion)

				return kvdbToSqlProgrammaticMigration(
					ctx, basicClient, accountsDir,
					networkDir, db, clock, q6,
					lndReadyTimeout,
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
		err = deprecateKVDBStores(accountsDir, networkDir)
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

func kvdbToSqlProgrammaticMigration(ctx context.Context,
	basicClient lnrpc.LightningClient, accountsDir, networkDir string,
	_ *sqldb.BaseDB, clock clock.Clock, q *sqlcmig6.Queries,
	lndReadyTimeout time.Duration) error {

	start := time.Now()

	accountsActive, err := tombstone.KVDBFileExists(
		filepath.Join(accountsDir, accounts.DBFilename),
	)
	if err != nil {
		return fmt.Errorf("unable to inspect accounts kvdb: %w", err)
	}

	sessionsActive, err := tombstone.KVDBFileExists(
		filepath.Join(networkDir, session.DBFilename),
	)
	if err != nil {
		return fmt.Errorf("unable to inspect session kvdb: %w", err)
	}

	firewallActive, err := tombstone.KVDBFileExists(
		filepath.Join(networkDir, firewalldb.DBFilename),
	)
	if err != nil {
		return fmt.Errorf("unable to inspect rules kvdb: %w", err)
	}

	if !accountsActive && !sessionsActive && !firewallActive {
		log.Infof("Skipping KVDB to SQL migration for all stores: " +
			"no legacy database files exist")

		return nil
	}

	if basicClient == nil {
		return errors.New("lightning client is required for " +
			"migration but was nil")
	}

	log.Infof("Starting KVDB to SQL migration for all stores")

	accountStore, err := accounts.NewBoltStoreForMigration(
		accountsDir, accounts.DBFilename, clock,
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
		networkDir, session.DBFilename,
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
		networkDir, firewalldb.DBFilename,
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

	// We'll fetch the macaroonIDList from lnd next. This is a call to
	// lnd's main Lightning RPC server, which only starts accepting calls
	// once lnd has reached its "RPC active" state. On nodes with a large
	// channel and graph state, reaching that state can take well over a
	// minute after the wallet is unlocked (opening the main database and
	// building all of lnd's subsystems is slow), so we cannot assume lnd
	// is ready by the time the (fast) accounts and session migrations
	// above have completed. We therefore poll the request, retrying
	// every listMacaroonIDRetryDelay, until lnd becomes ready, the
	// lndReadyTimeout budget is exhausted, or the daemon shuts down (ctx
	// canceled).
	//
	// NOTE: lndReadyTimeout is intentionally generous rather than a
	// tight bound (see its default in the main config). litd cannot
	// complete this migration without lnd, so timing out here aborts
	// litd startup entirely and forces a manual restart; waiting longer
	// for a slow-but-healthy lnd is strictly preferable to that.
	//
	// listMacaroonIDRetryDelay is the delay between successive attempts
	// to reach lnd. 500ms keeps the poll responsive (lnd is typically
	// ready within a minute or two) without busy-looping against a
	// not-yet-ready RPC server.
	const listMacaroonIDRetryDelay = 500 * time.Millisecond

	waitCtx, cancel := context.WithTimeout(ctx, lndReadyTimeout)
	defer cancel()

	var (
		macaroonIDList *lnrpc.ListMacaroonIDsResponse
		attempt        int
	)
	for {
		attempt++

		macaroonIDList, err = basicClient.ListMacaroonIDs(
			ctx, &lnrpc.ListMacaroonIDsRequest{},
		)
		if err == nil {
			break
		}

		log.Warnf("Failed to list macaroon IDs when migrating "+
			"stores to SQL (attempt %d), retrying in %v: %v",
			attempt, listMacaroonIDRetryDelay, err)

		select {
		case <-waitCtx.Done():
			return fmt.Errorf("error listing macaroon IDs "+
				"when migrating stores to SQL after %d "+
				"attempts (waited up to %v for lnd's RPC "+
				"server to become ready): %w", attempt,
				lndReadyTimeout, err)

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
func deprecateKVDBStores(accountsDir, networkDir string) error {
	accountsErr := accounts.DeprecateKVDB(accountsDir)
	if accountsErr != nil {
		accountsErr = fmt.Errorf("error deprecating accounts kvdb: %w",
			accountsErr)
	}

	sessionErr := session.DeprecateKVDB(networkDir)
	if sessionErr != nil {
		sessionErr = fmt.Errorf("error deprecating session kvdb: %w",
			sessionErr)
	}

	firewallErr := firewalldb.DeprecateKVDB(networkDir)
	if firewallErr != nil {
		firewallErr = fmt.Errorf("error deprecating firewall kvdb: %w",
			firewallErr)
	}

	return errors.Join(accountsErr, sessionErr, firewallErr)
}
