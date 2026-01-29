package db

import (
	_ "modernc.org/sqlite" // Register relevant drivers.
)

// SqliteConfig holds all the config arguments needed to interact with our
// sqlite DB.
//
// nolint:ll
type SqliteConfig struct {
	// SkipMigrations if true, then all the tables will be created on start
	// up if they don't already exist.
	SkipMigrations bool `long:"skipmigrations" description:"Skip applying migrations on startup."`

	// SkipMigrationDbBackup if true, then a backup of the database will not
	// be created before applying migrations.
	SkipMigrationDbBackup bool `long:"skipmigrationdbbackup" description:"Skip creating a backup of the database before applying migrations."`

	// DatabaseFileName is the full file path where the database file can be
	// found.
	DatabaseFileName string `long:"dbfile" description:"The full path to the database."`
}
