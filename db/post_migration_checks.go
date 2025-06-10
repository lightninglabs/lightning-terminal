package db

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database"
	"github.com/lightninglabs/lightning-terminal/db/sqlc"
	"github.com/lightningnetwork/lnd/sqldb/v2"
)

// postMigrationCheck is a function type for a function that performs a
// post-migration check on the database.
type postMigrationCheck func(context.Context, *sqlc.Queries) error

var (
	// postMigrationChecks is a map of functions that are run after the
	// database migration with the version specified in the key has been
	// applied. These functions are used to perform additional checks on the
	// database state that are not fully expressible in SQL.
	postMigrationChecks = map[uint]postMigrationCheck{}
)

// makePostStepCallbacks turns the post migration checks into a map of post
// step callbacks that can be used with the migrate package. The keys of the map
// are the migration versions, and the values are the callbacks that will be
// executed after the migration with the corresponding version is applied.
func makePostStepCallbacks(db *sqldb.BaseDB,
	c map[uint]postMigrationCheck) map[uint]migrate.PostStepCallback {

	queries := sqlc.NewForType(db, db.BackendType)
	executor := sqldb.NewTransactionExecutor(
		db, func(tx *sql.Tx) *sqlc.Queries {
			return queries.WithTx(tx)
		},
	)

	var (
		ctx               = context.Background()
		postStepCallbacks = make(map[uint]migrate.PostStepCallback)
	)
	for version, check := range c {
		runCheck := func(m *migrate.Migration, q *sqlc.Queries) error {
			log.Infof("Running post-migration check for version %d",
				version)
			start := time.Now()

			err := check(ctx, q)
			if err != nil {
				return fmt.Errorf("post-migration "+
					"check failed for version %d: "+
					"%w", version, err)
			}

			log.Infof("Post-migration check for version %d "+
				"completed in %v", version, time.Since(start))

			return nil
		}

		// We ignore the actual driver that's being returned here, since
		// we use migrate.NewWithInstance() to create the migration
		// instance from our already instantiated database backend that
		// is also passed into this function.
		postStepCallbacks[version] = func(m *migrate.Migration,
			_ database.Driver) error {

			return executor.ExecTx(
				ctx, sqldb.NewWriteTx(),
				func(q *sqlc.Queries) error {
					return runCheck(m, q)
				}, sqldb.NoOpReset,
			)
		}
	}

	return postStepCallbacks
}
