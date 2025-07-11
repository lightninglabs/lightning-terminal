//go:build dev

package migrationstreams

import (
	"context"
	"database/sql"
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
	"github.com/lightningnetwork/lnd/sqldb/v2"
)

// MakePostStepCallbacksMig6 turns the post migration checks into a map of post
// step callbacks that can be used with the migrate package. The keys of the map
// are the migration versions, and the values are the callbacks that will be
// executed after the migration with the corresponding version is applied.
func MakePostStepCallbacksMig6(ctx context.Context, db *sqldb.BaseDB,
	macPath string, clock clock.Clock,
	migVersion uint) migrate.PostStepCallback {

	mig6queries := sqlcmig6.NewForType(db, db.BackendType)
	mig6executor := sqldb.NewTransactionExecutor(
		db, func(tx *sql.Tx) *sqlcmig6.Queries {
			return mig6queries.WithTx(tx)
		},
	)

	return func(_ *migrate.Migration, _ database.Driver) error {
		// We ignore the actual driver that's being returned here, since
		// we use migrate.NewWithInstance() to create the migration
		// instance from our already instantiated database backend that
		// is also passed into this function.
		return mig6executor.ExecTx(
			ctx, sqldb.NewWriteTx(),
			func(q6 *sqlcmig6.Queries) error {
				log.Infof("Running post migration callback "+
					"for migration version %d", migVersion)

				return kvdbToSqlMigrationCallback(
					ctx, macPath, db, clock, q6,
				)
			}, sqldb.NoOpReset,
		)
	}
}

func kvdbToSqlMigrationCallback(ctx context.Context, macPath string,
	_ *sqldb.BaseDB, clock clock.Clock, q *sqlcmig6.Queries) error {

	start := time.Now()
	log.Infof("Starting KVDB to SQL migration for all stores")

	accountStore, err := accounts.NewBoltStore(
		filepath.Dir(macPath), accounts.DBFilename, clock,
	)
	if err != nil {
		return err
	}

	err = accounts.MigrateAccountStoreToSQL(ctx, accountStore.DB, q)
	if err != nil {
		return fmt.Errorf("error migrating account store to "+
			"SQL: %v", err)
	}

	sessionStore, err := session.NewDB(
		filepath.Dir(macPath), session.DBFilename,
		clock, accountStore,
	)
	if err != nil {
		return err
	}

	err = session.MigrateSessionStoreToSQL(ctx, sessionStore.DB, q)
	if err != nil {
		return fmt.Errorf("error migrating session store to "+
			"SQL: %v", err)
	}

	firewallStore, err := firewalldb.NewBoltDB(
		filepath.Dir(macPath), firewalldb.DBFilename,
		sessionStore, accountStore, clock,
	)
	if err != nil {
		return err
	}

	err = firewalldb.MigrateFirewallDBToSQL(ctx, firewallStore.DB, q)
	if err != nil {
		return fmt.Errorf("error migrating firewalldb store "+
			"to SQL: %v", err)
	}

	log.Infof("Succesfully migrated all KVDB stores to SQL in: %v",
		time.Since(start))

	return nil
}
