package db

import (
	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/pgx/v5"
	"github.com/lightningnetwork/lnd/sqldb/v2"
)

const (
	// LatestMigrationVersion is the latest migration version of the
	// database. This is used to implement downgrade protection for the
	// daemon.
	//
	// NOTE: This MUST be updated when a new migration is added.
	LatestMigrationVersion = 5

	// LatestDevMigrationVersion is the latest dev migration version of the
	// database. This is used to implement downgrade protection for the
	// daemon. This represents the latest number used in the migrations_dev
	// directory.
	//
	// NOTE: This MUST be updated when a migration is added or removed, from
	// the migrations_dev directory.
	LatestDevMigrationVersion = 1
)

// MakeTestMigrationStreams creates the migration streams for the unit test
// environment.
//
// NOTE: This function is not located in the migrationstreams package to avoid
// cyclic dependencies. This test migration stream does not run the kvdb to sql
// migration, as we already have separate unit tests which tests the migration.
func MakeTestMigrationStreams() []sqldb.MigrationStream {
	migStream := sqldb.MigrationStream{
		TrackingTableName: pgx.DefaultMigrationsTable,
		SQLFileDirectory:  "sqlc/migrations",
		SQLFiles:          SqlSchemas,

		// LatestMigrationVersion is the latest migration version of the
		// database.  This is used to implement downgrade protection for
		// the daemon.
		//
		// NOTE: This MUST be updated when a new migration is added.
		LatestMigrationVersion: LatestMigrationVersion,

		MakeProgrammaticMigrations: func(db *sqldb.BaseDB) (
			map[uint]migrate.ProgrammaticMigrEntry, error) {

			return make(map[uint]migrate.ProgrammaticMigrEntry), nil
		},
	}

	migStreamDev := sqldb.MigrationStream{
		TrackingTableName: pgx.DefaultMigrationsTable + "_dev",
		SQLFileDirectory:  "sqlc/migrations_dev",
		SQLFiles:          SqlSchemas,

		// LatestMigrationVersion is the latest migration version of the
		// dev migrations database. This is used to implement downgrade
		// protection for the daemon.
		//
		// NOTE: This MUST be updated when a new dev migration is added.
		LatestMigrationVersion: LatestDevMigrationVersion,

		MakeProgrammaticMigrations: func(db *sqldb.BaseDB) (
			map[uint]migrate.ProgrammaticMigrEntry, error) {

			return make(map[uint]migrate.ProgrammaticMigrEntry), nil
		},
	}

	return []sqldb.MigrationStream{migStream, migStreamDev}
}
