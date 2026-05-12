//go:build !dev

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

// MakeMigrationSets creates the migration sets for production environments.
func MakeMigrationSets(ctx context.Context, basicClient lnrpc.LightningClient,
	macPath string, clock clock.Clock) []sqldb.MigrationSet {

	// migSet defines the SQL migration set used to create and upgrade LiT's
	// SQL schema.
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

	return []sqldb.MigrationSet{migSet}
}
