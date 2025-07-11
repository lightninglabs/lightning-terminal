//go:build dev

package migrationstreams

import (
	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/pgx/v5"
	"github.com/lightninglabs/lightning-terminal/db"
	"github.com/lightningnetwork/lnd/sqldb/v2"
)

var (
	// Create the prod migration stream.
	migStream = sqldb.MigrationStream{
		MigrateTableName: pgx.DefaultMigrationsTable,
		SQLFileDirectory: "sqlc/migrations",
		Schemas:          db.SqlSchemas,

		// LatestMigrationVersion is the latest migration version of the
		// database.  This is used to implement downgrade protection for
		// the daemon.
		//
		// NOTE: This MUST be updated when a new migration is added.
		LatestMigrationVersion: db.LatestMigrationVersion,

		MakePostMigrationChecks: func(
			db *sqldb.BaseDB) (map[uint]migrate.PostStepCallback,
			error) {

			return make(map[uint]migrate.PostStepCallback), nil
		},
	}

	// Create the dev migration stream.
	migStreamDev = sqldb.MigrationStream{
		MigrateTableName: pgx.DefaultMigrationsTable + "_dev",
		SQLFileDirectory: "sqlc/migrations_dev",
		Schemas:          db.SqlSchemas,

		// LatestMigrationVersion is the latest migration version of the
		// dev migrations database. This is used to implement downgrade
		// protection for the daemon.
		//
		// NOTE: This MUST be updated when a new dev migration is added.
		LatestMigrationVersion: db.LatestDevMigrationVersion,

		MakePostMigrationChecks: func(
			db *sqldb.BaseDB) (map[uint]migrate.PostStepCallback,
			error) {

			return make(map[uint]migrate.PostStepCallback), nil
		},
	}
	LitdMigrationStreams = []sqldb.MigrationStream{migStream, migStreamDev}
)
