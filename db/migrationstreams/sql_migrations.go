//go:build !dev

package migrationstreams

import (
	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/pgx/v5"
	"github.com/lightninglabs/lightning-terminal/db"
	"github.com/lightningnetwork/lnd/sqldb/v2"
)

var (
	LitdMigrationStream = sqldb.MigrationStream{
		TrackingTableName: pgx.DefaultMigrationsTable,
		SQLFileDirectory:  "sqlc/migrations",
		SQLFiles:          db.SqlSchemas,

		// LatestMigrationVersion is the latest migration version of the
		// database.  This is used to implement downgrade protection for
		// the daemon.
		//
		// NOTE: This MUST be updated when a new migration is added.
		LatestMigrationVersion: db.LatestMigrationVersion,

		MakeProgrammaticMigrations: func(db *sqldb.BaseDB) (
			map[uint]migrate.ProgrammaticMigrEntry, error) {

			return make(map[uint]migrate.ProgrammaticMigrEntry), nil
		},
	}
	LitdMigrationStreams = []sqldb.MigrationStream{LitdMigrationStream}
)
