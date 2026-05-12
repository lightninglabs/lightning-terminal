package db

import (
	"io/fs"

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
	LatestMigrationVersion = 6

	// KVDBtoSQLMigVersion is the version of the migration that migrates the
	// kvdb to the sql database.
	//
	// NOTE: This version value should not be updated when a new migration
	// is added, as this represents a specific migration.
	KVDBtoSQLMigVersion = 6

	// LatestDevMigrationVersion is the latest dev migration version of the
	// database. This is used to implement downgrade protection for the
	// daemon. This represents the latest number used in the migrations_dev
	// directory.
	//
	// NOTE: This MUST be updated when a migration is added or removed, from
	// the migrations_dev directory.
	LatestDevMigrationVersion = 0
)

// HasDevMigrations reports whether any dev SQL migration files are embedded in
// the current build. This lets dev builds omit the separate dev migration set
// cleanly when the directory exists but currently contains no migration files.
func HasDevMigrations() bool {
	files, err := fs.Glob(SqlSchemas, "sqlc/migrations_dev/*.*.sql")
	if err != nil {
		return false
	}

	return len(files) > 0
}

// MakeTestMigrationSets creates the migration sets for the unit test
// environment.
//
// NOTE: This function is not located in the migsets package to avoid
// cyclic dependencies. This test migration set does not run the kvdb to sql
// migration, as we already have separate unit tests which tests the migration.
func MakeTestMigrationSets() []sqldb.MigrationSet {
	migSet := sqldb.MigrationSet{
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

	// If there are no dev migrations in the sqlc/migrations_dev folder, we
	// can return early.
	if !HasDevMigrations() {
		return []sqldb.MigrationSet{migSet}
	}

	migSetDev := sqldb.MigrationSet{
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

	return []sqldb.MigrationSet{migSet, migSetDev}
}
