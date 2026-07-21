package migsets

import (
	"context"
	"net"
	"os"
	"path/filepath"
	"testing"
	"time"

	"github.com/lightninglabs/lightning-terminal/accounts"
	"github.com/lightninglabs/lightning-terminal/db"
	"github.com/lightninglabs/lightning-terminal/db/sqlcmig6"
	"github.com/lightninglabs/lightning-terminal/firewalldb"
	"github.com/lightninglabs/lightning-terminal/session"
	"github.com/lightningnetwork/lnd/clock"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/sqldb/v2"
	"github.com/stretchr/testify/require"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/test/bufconn"
)

// testLndReadyTimeout is the lnd RPC-ready timeout used for the migration in
// these tests. The test lnd server is ready immediately, so any positive value
// works; we use a short one so a broken poll loop fails fast rather than
// hanging the test.
const testLndReadyTimeout = 5 * time.Second

// TestKVDBToSQLProgrammaticMigrationSkipsMissingStores verifies that the kvdb
// to SQL migration does not create missing legacy kvdb files while scanning for
// stores to migrate.
func TestKVDBToSQLProgrammaticMigrationSkipsMissingStores(t *testing.T) {
	t.Parallel()

	accountsDir := t.TempDir()
	networkDir := t.TempDir()

	sqlStore := sqldb.NewTestSqliteDB(t, db.MakeTestMigrationSets())
	queries := sqlcmig6.NewForType(
		sqlStore.BaseDB, sqlStore.BackendType,
	)

	err := kvdbToSqlProgrammaticMigration(
		context.Background(), nil, accountsDir, networkDir,
		sqlStore.BaseDB, clock.NewDefaultClock(), queries,
		testLndReadyTimeout,
	)
	require.NoError(t, err)

	requireNoFile(t, filepath.Join(accountsDir, accounts.DBFilename))
	requireNoFile(t, filepath.Join(networkDir, session.DBFilename))
	requireNoFile(t, filepath.Join(networkDir, firewalldb.DBFilename))
}

// TestKVDBToSQLProgrammaticMigrationRunsWithOneBBoltDBFiles verifies that the
// migration still runs when only the accounts kvdb exists, creates the missing
// legacy files, and migrates the existing account data to SQL.
func TestKVDBToSQLProgrammaticMigrationRunsWithOneBBoltDBFiles(t *testing.T) {
	t.Parallel()

	ctx := context.Background()
	testClock := clock.NewDefaultClock()
	accountsDir := t.TempDir()
	networkDir := t.TempDir()

	accountStore, err := accounts.NewBoltStore(
		accountsDir, accounts.DBFilename, testClock,
	)
	require.NoError(t, err)

	_, err = accountStore.NewAccount(ctx, 1234, time.Time{}, "acct-1")
	require.NoError(t, err)
	require.NoError(t, accountStore.Close())

	sqlStore := sqldb.NewTestSqliteDB(t, db.MakeTestMigrationSets())
	queries := sqlcmig6.NewForType(
		sqlStore.BaseDB, sqlStore.BackendType,
	)

	lndClient := newTestLightningClient(t)

	err = kvdbToSqlProgrammaticMigration(
		ctx, lndClient, accountsDir, networkDir,
		sqlStore.BaseDB, testClock, queries,
		testLndReadyTimeout,
	)
	require.NoError(t, err)

	requireFileExists(t, filepath.Join(accountsDir, accounts.DBFilename))
	requireFileExists(t, filepath.Join(networkDir, session.DBFilename))
	requireFileExists(t, filepath.Join(networkDir, firewalldb.DBFilename))

	dbAccounts, err := queries.ListAllAccounts(ctx)
	require.NoError(t, err)
	require.Len(t, dbAccounts, 1)

	dbSessions, err := queries.ListSessions(ctx)
	require.NoError(t, err)
	require.Empty(t, dbSessions)
}

func requireNoFile(t *testing.T, path string) {
	t.Helper()

	_, err := os.Stat(path)
	require.ErrorIs(t, err, os.ErrNotExist)
}

func requireFileExists(t *testing.T, path string) {
	t.Helper()

	_, err := os.Stat(path)
	require.NoError(t, err)
}

func newTestLightningClient(t *testing.T) lnrpc.LightningClient {
	t.Helper()

	lis := bufconn.Listen(1024 * 1024)
	server := grpc.NewServer()
	lnrpc.RegisterLightningServer(server, &testLightningServer{})

	go func() {
		_ = server.Serve(lis)
	}()

	t.Cleanup(func() {
		server.Stop()
		require.NoError(t, lis.Close())
	})

	conn, err := grpc.DialContext(
		context.Background(), "passthrough:///bufnet",
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithContextDialer(
			func(context.Context, string) (net.Conn, error) {
				return lis.Dial()
			},
		),
	)
	require.NoError(t, err)

	t.Cleanup(func() {
		require.NoError(t, conn.Close())
	})

	return lnrpc.NewLightningClient(conn)
}

type testLightningServer struct {
	lnrpc.UnimplementedLightningServer
}

func (t *testLightningServer) ListMacaroonIDs(context.Context,
	*lnrpc.ListMacaroonIDsRequest) (*lnrpc.ListMacaroonIDsResponse, error) {

	return &lnrpc.ListMacaroonIDsResponse{}, nil
}
