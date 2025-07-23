package db

import (
	"fmt"
	"testing"
	"time"

	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/lightningnetwork/lnd/sqldb/v2"
)

const (
	dsnTemplate = "postgres://%v:%v@%v:%d/%v?sslmode=%v"
)

var (
	// DefaultPostgresFixtureLifetime is the default maximum time a Postgres
	// test fixture is being kept alive. After that time the docker
	// container will be terminated forcefully, even if the tests aren't
	// fully executed yet. So this time needs to be chosen correctly to be
	// longer than the longest expected individual test run time.
	DefaultPostgresFixtureLifetime = 60 * time.Minute
)

// PostgresConfig holds the postgres database configuration.
//
// nolint:ll
type PostgresConfig struct {
	SkipMigrations     bool          `long:"skipmigrations" description:"Skip applying migrations on startup."`
	Host               string        `long:"host" description:"Database server hostname."`
	Port               int           `long:"port" description:"Database server port."`
	User               string        `long:"user" description:"Database user."`
	Password           string        `long:"password" description:"Database user's password."`
	DBName             string        `long:"dbname" description:"Database name to use."`
	MaxOpenConnections int           `long:"maxconnections" description:"Max open connections to keep alive to the database server."`
	MaxIdleConnections int           `long:"maxidleconnections" description:"Max number of idle connections to keep in the connection pool."`
	ConnMaxLifetime    time.Duration `long:"connmaxlifetime" description:"Max amount of time a connection can be reused for before it is closed. Valid time units are {s, m, h}."`
	ConnMaxIdleTime    time.Duration `long:"connmaxidletime" description:"Max amount of time a connection can be idle for before it is closed. Valid time units are {s, m, h}."`
	RequireSSL         bool          `long:"requiressl" description:"Whether to require using SSL (mode: require) when connecting to the server."`
}

// DSN returns the dns to connect to the database.
func (s *PostgresConfig) DSN(hidePassword bool) string {
	var sslMode = "disable"
	if s.RequireSSL {
		sslMode = "require"
	}

	password := s.Password
	if hidePassword {
		// Placeholder used for logging the DSN safely.
		password = "****"
	}

	return fmt.Sprintf(dsnTemplate, s.User, password, s.Host, s.Port,
		s.DBName, sslMode)
}

// NewTestPostgresV2DB is a helper function that creates a Postgres database for
// testing, using the sqldb v2 package's definition of the PostgresStore.
func NewTestPostgresV2DB(t *testing.T) *sqldb.PostgresStore {
	t.Helper()

	t.Logf("Creating new Postgres DB for testing")

	sqlFixture := sqldb.NewTestPgFixture(t, DefaultPostgresFixtureLifetime)
	t.Cleanup(func() {
		sqlFixture.TearDown(t)
	})

	return sqldb.NewTestPostgresDB(t, sqlFixture, LitdMigrationStreams)
}
