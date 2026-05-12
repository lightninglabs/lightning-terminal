//go:build dev

package migsets

import (
	"context"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/pgx/v5"
	"github.com/lightninglabs/lightning-terminal/db"
	"github.com/lightningnetwork/lnd/clock"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/sqldb/v2"
)

// MakeMigrationSets creates the migration sets for the dev environments.
func MakeMigrationSets(ctx context.Context,
	basicClient lnrpc.LightningClient, macPath string,
	clock clock.Clock) []sqldb.MigrationSet {

	// Create the prod migration set.
	migSet := sqldb.MigrationSet{
		TrackingTableName: pgx.DefaultMigrationsTable,
		SQLFileDirectory:  "sqlc/migrations",
		SQLFiles:          db.SqlSchemas,

		// LatestMigrationVersion is the latest migration version of the
		// database.  This is used to implement downgrade protection for
		// the daemon.
		//
		// NOTE: This MUST be updated when a new migration is added.
		LatestMigrationVersion: db.LatestMigrationVersion,

		MakeProgrammaticMigrations: func(baseDB *sqldb.BaseDB) (
			map[uint]migrate.ProgrammaticMigrEntry, error) {

			// Any programmatic migrations added to this map will be
			// executed when the migration number for the uint key
			// is applied. If no entry exists for a given uint, then
			// no programmatic migration will be executed for that
			// migration number.
			res := make(map[uint]migrate.ProgrammaticMigrEntry)

			res[db.KVDBtoSQLMigVersion] = Mig6ProgrammaticMigration(
				ctx, basicClient, baseDB, macPath, clock,
				db.KVDBtoSQLMigVersion,
			)

			return res, nil
		},
	}

	// If there are no dev migrations in the sqlc/migrations_dev folder, we
	// can return early.
	if !db.HasDevMigrations() {
		return []sqldb.MigrationSet{migSet}
	}

	// Create the dev migration set.
	migSetDev := sqldb.MigrationSet{
		TrackingTableName: pgx.DefaultMigrationsTable + "_dev",
		SQLFileDirectory:  "sqlc/migrations_dev",
		SQLFiles:          db.SqlSchemas,

		// LatestMigrationVersion is the latest migration version of the
		// dev migrations database. This is used to implement downgrade
		// protection for the daemon.
		//
		// NOTE: This MUST be updated when a new dev migration is added.
		LatestMigrationVersion: db.LatestDevMigrationVersion,

		MakeProgrammaticMigrations: func(_ *sqldb.BaseDB) (
			map[uint]migrate.ProgrammaticMigrEntry, error) {

			return make(map[uint]migrate.ProgrammaticMigrEntry), nil
		},
	}

	return []sqldb.MigrationSet{migSet, migSetDev}
}
