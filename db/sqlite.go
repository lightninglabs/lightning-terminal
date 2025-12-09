package db

import (
	"database/sql"
	"fmt"
	"net/url"
	"path/filepath"
	"testing"
	"time"

	"github.com/golang-migrate/migrate/v4"
	sqlite_migrate "github.com/golang-migrate/migrate/v4/database/sqlite"
	"github.com/lightninglabs/lightning-terminal/db/sqlc"
	"github.com/stretchr/testify/require"
	_ "modernc.org/sqlite" // Register relevant drivers.
)

const (
	// sqliteOptionPrefix is the string prefix sqlite uses to set various
	// options. This is used in the following format:
	//   * sqliteOptionPrefix || option_name = option_value.
	sqliteOptionPrefix = "_pragma"

	// sqliteTxLockImmediate is a dsn option used to ensure that write
	// transactions are started immediately.
	sqliteTxLockImmediate = "_txlock=immediate"

	// defaultMaxConns is the number of permitted active and idle
	// connections. We want to limit this so it isn't unlimited. We use the
	// same value for the number of idle connections as, this can speed up
	// queries given a new connection doesn't need to be established each
	// time.
	defaultMaxConns = 25

	// defaultConnMaxLifetime is the maximum amount of time a connection can
	// be reused for before it is closed.
	defaultConnMaxLifetime = 10 * time.Minute
)

var (
	// sqliteSchemaReplacements is a map of schema strings that need to be
	// replaced for sqlite. There currently aren't any replacements, because
	// the SQL files are written with SQLite compatibility in mind.
	sqliteSchemaReplacements = map[string]string{}
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

// SqliteStore is a sqlite3 based database for the Taproot Asset daemon.
type SqliteStore struct {
	cfg *SqliteConfig

	*BaseDB
}

// NewSqliteStore attempts to open a new sqlite database based on the passed
// config.
func NewSqliteStore(cfg *SqliteConfig) (*SqliteStore, error) {
	// The set of pragma options are accepted using query options. For now
	// we only want to ensure that foreign key constraints are properly
	// enforced.
	pragmaOptions := []struct {
		name  string
		value string
	}{
		{
			name:  "foreign_keys",
			value: "on",
		},
		{
			name:  "journal_mode",
			value: "WAL",
		},
		{
			name:  "busy_timeout",
			value: "5000",
		},
		{
			// With the WAL mode, this ensures that we also do an
			// extra WAL sync after each transaction. The normal
			// sync mode skips this and gives better performance,
			// but risks durability.
			name:  "synchronous",
			value: "full",
		},
		{
			// This is used to ensure proper durability for users
			// running on Mac OS. It uses the correct fsync system
			// call to ensure items are fully flushed to disk.
			name:  "fullfsync",
			value: "true",
		},
	}
	sqliteOptions := make(url.Values)
	for _, option := range pragmaOptions {
		sqliteOptions.Add(
			sqliteOptionPrefix,
			fmt.Sprintf("%v=%v", option.name, option.value),
		)
	}

	// Construct the DSN which is just the database file name, appended
	// with the series of pragma options as a query URL string. For more
	// details on the formatting here, see the modernc.org/sqlite docs:
	// https://pkg.go.dev/modernc.org/sqlite#Driver.Open.
	dsn := fmt.Sprintf(
		"%v?%v&%v", cfg.DatabaseFileName, sqliteOptions.Encode(),
		sqliteTxLockImmediate,
	)
	db, err := sql.Open("sqlite", dsn)
	if err != nil {
		return nil, err
	}

	db.SetMaxOpenConns(defaultMaxConns)
	db.SetMaxIdleConns(defaultMaxConns)
	db.SetConnMaxLifetime(defaultConnMaxLifetime)

	queries := sqlc.NewSqlite(db)
	s := &SqliteStore{
		cfg: cfg,
		BaseDB: &BaseDB{
			DB:      db,
			Queries: queries,
		},
	}

	// Now that the database is open, populate the database with our set of
	// schemas based on our embedded in-memory file system.
	if !cfg.SkipMigrations {
		if err := s.ExecuteMigrations(s.backupAndMigrate); err != nil {
			return nil, fmt.Errorf("error executing migrations: "+
				"%w", err)
		}
	}

	return s, nil
}

// backupSqliteDatabase creates a backup of the given SQLite database.
func backupSqliteDatabase(srcDB *sql.DB, dbFullFilePath string) error {
	if srcDB == nil {
		return fmt.Errorf("backup source database is nil")
	}

	// Create a database backup file full path from the given source
	// database full file path.
	//
	// Get the current time and format it as a Unix timestamp in
	// nanoseconds.
	timestamp := time.Now().UnixNano()

	// Add the timestamp to the backup name.
	backupFullFilePath := fmt.Sprintf(
		"%s.%d.backup", dbFullFilePath, timestamp,
	)

	log.Infof("Creating backup of database file: %v -> %v",
		dbFullFilePath, backupFullFilePath)

	// Create the database backup.
	vacuumIntoQuery := "VACUUM INTO ?;"
	stmt, err := srcDB.Prepare(vacuumIntoQuery)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(backupFullFilePath)
	if err != nil {
		return err
	}

	return nil
}

// backupAndMigrate is a helper function that creates a database backup before
// initiating the migration, and then migrates the database to the latest
// version.
func (s *SqliteStore) backupAndMigrate(mig *migrate.Migrate,
	currentDbVersion int, maxMigrationVersion uint) error {

	// Determine if a database migration is necessary given the current
	// database version and the maximum migration version.
	versionUpgradePending := currentDbVersion < int(maxMigrationVersion)
	if !versionUpgradePending {
		log.Infof("Current database version is up-to-date, skipping "+
			"migration attempt and backup creation "+
			"(current_db_version=%v, max_migration_version=%v)",
			currentDbVersion, maxMigrationVersion)
		return nil
	}

	// At this point, we know that a database migration is necessary.
	// Create a backup of the database before starting the migration.
	if !s.cfg.SkipMigrationDbBackup {
		log.Infof("Creating database backup (before applying " +
			"migration(s))")

		err := backupSqliteDatabase(s.DB, s.cfg.DatabaseFileName)
		if err != nil {
			return err
		}
	} else {
		log.Infof("Skipping database backup creation before applying " +
			"migration(s)")
	}

	log.Infof("Applying migrations to database")
	return mig.Up()
}

// ExecuteMigrations runs migrations for the sqlite database, depending on the
// target given, either all migrations or up to a given version.
func (s *SqliteStore) ExecuteMigrations(target MigrationTarget,
	optFuncs ...MigrateOpt) error {

	opts := defaultMigrateOptions()
	for _, optFunc := range optFuncs {
		optFunc(opts)
	}

	driver, err := sqlite_migrate.WithInstance(
		s.DB, &sqlite_migrate.Config{},
	)
	if err != nil {
		return fmt.Errorf("error creating sqlite migration: %w", err)
	}

	sqliteFS := newReplacerFS(sqlSchemas, sqliteSchemaReplacements)
	return applyMigrations(
		sqliteFS, driver, "sqlc/migrations", "sqlite", target, opts,
	)
}

// NewTestSqliteDB is a helper function that creates an SQLite database for
// testing.
func NewTestSqliteDB(t *testing.T) *SqliteStore {
	t.Helper()

	// TODO(roasbeef): if we pass :memory: for the file name, then we get
	// an in mem version to speed up tests
	dbPath := filepath.Join(t.TempDir(), "tmp.db")
	t.Logf("Creating new SQLite DB handle for testing: %s", dbPath)

	return NewTestSqliteDbHandleFromPath(t, dbPath)
}

// NewTestSqliteDbHandleFromPath is a helper function that creates a SQLite
// database handle given a database file path.
func NewTestSqliteDbHandleFromPath(t *testing.T, dbPath string) *SqliteStore {
	t.Helper()

	sqlDB, err := NewSqliteStore(&SqliteConfig{
		DatabaseFileName: dbPath,
		SkipMigrations:   false,
	})
	require.NoError(t, err)

	t.Cleanup(func() {
		require.NoError(t, sqlDB.DB.Close())
	})

	return sqlDB
}

// NewTestSqliteDBWithVersion is a helper function that creates an SQLite
// database for testing and migrates it to the given version.
func NewTestSqliteDBWithVersion(t *testing.T, version uint) *SqliteStore {
	t.Helper()

	t.Logf("Creating new SQLite DB for testing, migrating to version %d",
		version)

	// TODO(roasbeef): if we pass :memory: for the file name, then we get
	// an in mem version to speed up tests
	dbFileName := filepath.Join(t.TempDir(), "tmp.db")
	sqlDB, err := NewSqliteStore(&SqliteConfig{
		DatabaseFileName: dbFileName,
		SkipMigrations:   true,
	})
	require.NoError(t, err)

	err = sqlDB.ExecuteMigrations(TargetVersion(version))
	require.NoError(t, err)

	t.Cleanup(func() {
		require.NoError(t, sqlDB.DB.Close())
	})

	return sqlDB
}
