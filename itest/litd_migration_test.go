//go:build itest

package itest

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	_ "github.com/lib/pq"
	terminal "github.com/lightninglabs/lightning-terminal"
	"github.com/lightninglabs/lightning-terminal/accounts"
	"github.com/lightninglabs/lightning-terminal/db/sqlc"
	"github.com/lightninglabs/lightning-terminal/db/sqlcmig6"
	"github.com/lightninglabs/lightning-terminal/firewalldb"
	"github.com/lightninglabs/lightning-terminal/litrpc"
	"github.com/lightninglabs/lightning-terminal/session"
	"github.com/lightninglabs/lightning-terminal/subservers"
	"github.com/lightningnetwork/lnd/clock"
	"github.com/lightningnetwork/lnd/sqldb/v2"
	"github.com/stretchr/testify/require"
)

// testKvdbSQLMigration implements an itest kvdb -> SQL migration itest. The
// intention of the itest is to verify that the kvdb -> SQL migration flow works
// for a litd node which has data inserted to the bbolt database.
// To verify that, the minimum amount of data is inserted into the bbolt
// database, which is one object to each database file. Those objects are:
// * One account - accounts.DB file
// * One session - session.db file
// * One action - rules.db file
//
// As the respective unit tests for each migration extensively tests that data
// of all forms for each database file can successfully be migrated, the itest
// only focuses on testing that the full migration flow works, and leaves the
// responsibility of data variation coverage to the respective unit test.
//
// The test is executed in different steps, and uses RPCs to seed and validate
// migration fixtures:
//  1. Start a node with a bbolt backend.
//  2. Insert one account, one session and one action via RPC.
//  3. Snapshot the inserted objects via RPC.
//  4. Restart with the configured SQL backend to trigger migration.
//  5. Query objects again via RPC.
//  6. Compare the new objects to the pre-migration snapshot.
//  7. Assert the migrated objects in SQL via direct queries, to verify that it's
//     actually the SQL database that contains the migrated objects.
//  8. Assert that restarting with `databasebackend=bbolt` now fails on
//     `accounts.db`, the first deprecated kvdb file opened during startup.
//  9. Delete the SQL database and show that SQL startup reruns the migration.
//  10. If available, show that downgrading to an old LiT binary still fails to
//     start against the deprecated kvdb files.
//  11. Show that starting with the unsafe unmark flag removes the deprecation
//     markers so bbolt can be started again, then rerun the SQL migration so
//     the tombstones exist again for the remaining startup-order checks.
//  12. Delete `accounts.db` and verify that bbolt startup is still blocked by
//     the next deprecated kvdb file, `session.db`.
//  13. Delete `session.db` and verify that bbolt startup is still blocked by
//     the next deprecated kvdb file, `rules.db`.
func testKvdbSQLMigration(ctx context.Context, net *NetworkHarness,
	t *harnessTest) {

	if *litDBBackend == terminal.DatabaseBackendBbolt {
		t.t.Skipf("Skipping kvdb migration test for bbolt backend")
	}

	newStepCtx := func() (context.Context, context.CancelFunc) {
		return context.WithTimeout(ctx, defaultTimeout)
	}

	// Step 1: Start a node with a bbolt backend.
	// We want to start from an explicit bbolt backend regardless of the
	// command line flag used to run the itests.
	migNode, err := net.NewNode(
		t.t, "Migrator", nil, false, true,
		fmt.Sprintf(
			"--databasebackend=%s", terminal.DatabaseBackendBbolt,
		),
		"--firewall.request-logger.level=all",
	)
	require.NoError(t.t, err)
	defer shutdownAndAssert(net, t, migNode)

	// Setup a raw gRPC connection used to set up RPC clients.
	ctxt, cancel := newStepCtx()
	rawConn, err := connectRPC(
		ctxt, migNode.Cfg.LitAddr(), migNode.Cfg.LitTLSCertPath,
	)
	require.NoError(t.t, err)
	cancel()

	// Get the litd admin macaroon context from the migration node.
	macBytes := getLiTMacFromFile(t.t, migNode.Cfg)
	newAdminCtx := func() (context.Context, context.CancelFunc) {
		stepCtx, cancel := newStepCtx()
		return macaroonContext(stepCtx, macBytes), cancel
	}

	// LiT RPC clients are used to seed and assert migration fixtures.
	accountsClient := litrpc.NewAccountsClient(rawConn)
	sessionsClient := litrpc.NewSessionsClient(rawConn)
	autopilotClient := litrpc.NewAutopilotClient(rawConn)
	firewallClient := litrpc.NewFirewallClient(rawConn)

	// Step 2: Insert one account, one session and one action via RPC.
	ctxm, cancel := newAdminCtx()
	migrationRefs := setupMigrationData(
		ctxm, t, accountsClient, sessionsClient, autopilotClient,
		firewallClient,
	)
	cancel()

	// Step 3: Query and snapshot inserted data via RPC while on bbolt.
	ctxm, cancel = newAdminCtx()
	beforeMigration := queryMigrationData(
		ctxm, t, accountsClient, sessionsClient, firewallClient,
		migrationRefs.actionMethod,
	)
	cancel()

	// Close now so restarts can reopen stores without locks.
	rawConn.Close()

	// Step 4: Restart with configured backend to trigger migration.
	err = net.RestartNode(
		migNode, func() error { return nil }, []LitArgOption{
			WithLitArg("databasebackend", *litDBBackend),
			WithLitArg("firewall.request-logger.level", "all"),
		},
	)
	require.NoError(t.t, err)

	// Setup clients for the restarted node once more.
	ctxt, cancel = newStepCtx()
	rawConn, err = connectRPC(
		ctxt, migNode.Cfg.LitAddr(), migNode.Cfg.LitTLSCertPath,
	)
	require.NoError(t.t, err)
	cancel()

	accountsClient = litrpc.NewAccountsClient(rawConn)
	sessionsClient = litrpc.NewSessionsClient(rawConn)
	firewallClient = litrpc.NewFirewallClient(rawConn)

	// Step 5: Query migrated data via RPC and compare with pre-migration
	// snapshot.
	ctxm, cancel = newAdminCtx()
	afterMigration := queryMigrationData(
		ctxm, t, accountsClient, sessionsClient, firewallClient,
		migrationRefs.actionMethod,
	)
	cancel()

	// Step 6: Ensure that the results received by RPC prior and after the
	// migration are equal.
	assertMigrationSnapshotsEqual(t, beforeMigration, afterMigration)

	// Step 7: Assert migrated data in SQL.
	ctxt, cancel = newStepCtx()
	assertMinimalMigrationDataSQL(ctxt, t, migNode, migrationRefs)
	cancel()

	// Step 8: Verify that deprecated kvdb files now block bbolt startup.
	require.NoError(t.t, migNode.Stop())

	kvdbFiles := migrationKVDBFiles(migNode)

	assertNodeStartFails(
		t, net, migNode,
		[]LitArgOption{
			WithLitArg(
				"databasebackend",
				terminal.DatabaseBackendBbolt,
			),
			WithLitArg("firewall.request-logger.level", "all"),
		},
		fmt.Sprintf(
			"%v: %v", accounts.ErrKVDBDeprecated, kvdbFiles[0].base,
		),
	)

	// Step 9: Delete the SQL database and verify that starting with the
	// selected SQL backend reruns the kvdb -> SQL migration successfully.
	rerunSQLMigrationAndAssert(
		t, net, migNode, newStepCtx, newAdminCtx, beforeMigration,
		migrationRefs,
	)

	// Step 10: If the backward compatibility binary exists, verify that an
	// old LiT version also fails to start once kvdb was deprecated.
	require.NoError(t.t, migNode.Stop())

	downgradeBinary := fmt.Sprintf("%s-%s", net.litdBinary, "v0.15.0-alpha")
	if _, err := os.Stat(downgradeBinary); err == nil {
		if net.backwardCompat == nil {
			net.backwardCompat = make(map[string]string)
		}

		net.backwardCompat[migNode.Name()] = "v0.15.0-alpha"
		assertNodeStartFails(
			t, net, migNode, nil, "",
		)
		delete(net.backwardCompat, migNode.Name())
	}

	// Step 11: Verify that the unsafe flag removes the kvdb tombstones and
	// allows bbolt startup again.
	err = migNode.Start(
		net.litdBinary, net.backwardCompat, net.lndErrorChan, true,
		WithLitArg("databasebackend", terminal.DatabaseBackendBbolt),
		WithLitArg("unsafe-remove-kvdb-deprecation", ""),
		WithLitArg("firewall.request-logger.level", "all"),
	)
	require.NoError(t.t, err)

	ctxt, cancel = newStepCtx()
	rawConn, err = connectRPC(
		ctxt, migNode.Cfg.LitAddr(), migNode.Cfg.LitTLSCertPath,
	)
	require.NoError(t.t, err)
	cancel()

	accountsClient = litrpc.NewAccountsClient(rawConn)
	sessionsClient = litrpc.NewSessionsClient(rawConn)
	firewallClient = litrpc.NewFirewallClient(rawConn)

	ctxm, cancel = newAdminCtx()
	afterUnsafeUnmark := queryMigrationData(
		ctxm, t, accountsClient, sessionsClient, firewallClient,
		migrationRefs.actionMethod,
	)
	cancel()
	assertMigrationSnapshotsEqual(t, beforeMigration, afterUnsafeUnmark)

	// The unsafe flag should persistently remove the tombstones, so a
	// subsequent plain bbolt restart must succeed as well.
	require.NoError(t.t, rawConn.Close())
	require.NoError(t.t, migNode.Stop())

	err = migNode.Start(
		net.litdBinary, net.backwardCompat, net.lndErrorChan, true,
		WithLitArg("databasebackend", terminal.DatabaseBackendBbolt),
		WithLitArg("firewall.request-logger.level", "all"),
	)
	require.NoError(t.t, err)

	require.NoError(t.t, migNode.Stop())

	// Recreate the kvdb tombstones so startup still exercises the
	// deprecated-file checks after the unsafe unmark path above.
	rerunSQLMigrationAndAssert(
		t, net, migNode, newStepCtx, newAdminCtx, beforeMigration,
		migrationRefs,
	)

	require.NoError(t.t, migNode.Stop())

	// Step 12: Delete the first-startup kvdb file and verify that bbolt
	// startup is still blocked by the next deprecated file in the open
	// order.
	removeMigrationKVDBFile(t, kvdbFiles[0])
	assertNodeStartFails(
		t, net, migNode,
		[]LitArgOption{
			WithLitArg(
				"databasebackend",
				terminal.DatabaseBackendBbolt,
			),
			WithLitArg("firewall.request-logger.level", "all"),
		},
		fmt.Sprintf(
			"%v: %v", session.ErrKVDBDeprecated, kvdbFiles[1].base,
		),
	)

	// Step 13: Delete the second-startup kvdb file and verify that bbolt
	// startup is still blocked by the third deprecated file.
	removeMigrationKVDBFile(t, kvdbFiles[1])
	assertNodeStartFails(
		t, net, migNode,
		[]LitArgOption{
			WithLitArg(
				"databasebackend",
				terminal.DatabaseBackendBbolt,
			),
			WithLitArg("firewall.request-logger.level", "all"),
		},
		fmt.Sprintf(
			"%v: %v", firewalldb.ErrKVDBDeprecated,
			kvdbFiles[2].base,
		),
	)
}

// migrationDataRefs stores stable identifiers used to refetch and assert the
// test fixtures before and after migration.
type migrationDataRefs struct {
	accountID    string
	sessionID    []byte
	actionMethod string
}

// migrationDataSnapshot captures the RPC objects for the migration fixtures at
// one point in time, so pre/post-migration data can be compared directly.
type migrationDataSnapshot struct {
	account *litrpc.Account
	session *litrpc.Session
	action  *litrpc.Action
}

// setupMigrationData creates one account, one session and one
// action through RPCs only. Note that the function intentionally inserts a
// single object into every kvdb database file, which is the minimal dataset
// required to verify that data from each database file gets migrated to SQL
// when executing the itest.
func setupMigrationData(adminCtx context.Context,
	t *harnessTest,
	accountsClient litrpc.AccountsClient,
	sessionsClient litrpc.SessionsClient,
	autopilotClient litrpc.AutopilotClient,
	firewallClient litrpc.FirewallClient) migrationDataRefs {

	// 1. Insert an account.
	accountResp, err := accountsClient.CreateAccount(
		adminCtx, &litrpc.CreateAccountRequest{
			AccountBalance: 10_000,
			ExpirationDate: time.Now().Add(time.Hour).Unix(),
			Label:          "migration-rpc-account",
		},
	)
	require.NoError(t.t, err)

	// 2. Insert a session.
	sessionResp, err := sessionsClient.AddSession(
		adminCtx, &litrpc.AddSessionRequest{
			Label:       "migration-rpc-session",
			SessionType: litrpc.SessionType_TYPE_MACAROON_ADMIN,
			ExpiryTimestampSeconds: uint64(
				time.Now().Add(30 * time.Minute).Unix(),
			),
			MailboxServerAddr: mailboxServerAddr,
		},
	)
	require.NoError(t.t, err)

	// 3. Insert an action.
	_, err = autopilotClient.ListAutopilotFeatures(
		adminCtx, &litrpc.ListAutopilotFeaturesRequest{},
	)
	require.NoError(t.t, err)

	// Note that this function intentionally uses the ListAutopilotFeatures
	// method, as that then becomes easily queryable. As the
	// firewall.request-logger.level=all config option is used for this
	// test, more than one action will be created during its execution.
	// Therefore, using this specific method makes it easy to query this
	// specific action added below.
	actionMethod := "/litrpc.Autopilot/ListAutopilotFeatures"
	actionsResp, err := firewallClient.ListActions(
		adminCtx, &litrpc.ListActionsRequest{
			MethodName:     actionMethod,
			StartTimestamp: uint64(time.Now().Unix()),
			MaxNumActions:  1,
			Reversed:       true,
		},
	)
	require.NoError(t.t, err)
	require.Len(t.t, actionsResp.Actions, 1)

	return migrationDataRefs{
		accountID:    accountResp.Account.Id,
		sessionID:    sessionResp.Session.Id,
		actionMethod: actionMethod,
	}
}

// queryMigrationData fetches the migration fixtures via RPC.
func queryMigrationData(adminCtx context.Context, t *harnessTest,
	accountsClient litrpc.AccountsClient,
	sessionsClient litrpc.SessionsClient,
	firewallClient litrpc.FirewallClient,
	actionMethod string) migrationDataSnapshot {

	accountsResp, err := accountsClient.ListAccounts(
		adminCtx, &litrpc.ListAccountsRequest{},
	)
	require.NoError(t.t, err)
	require.Len(t.t, accountsResp.Accounts, 1)

	sessionsResp, err := sessionsClient.ListSessions(
		adminCtx, &litrpc.ListSessionsRequest{},
	)
	require.NoError(t.t, err)
	require.Len(t.t, sessionsResp.Sessions, 1)

	actionsResp, err := firewallClient.ListActions(
		adminCtx, &litrpc.ListActionsRequest{
			MethodName: actionMethod,
			Reversed:   true,
		},
	)
	require.NoError(t.t, err)
	require.Len(t.t, actionsResp.Actions, 1)

	return migrationDataSnapshot{
		account: accountsResp.Accounts[0],
		session: sessionsResp.Sessions[0],
		action:  actionsResp.Actions[0],
	}
}

// assertMigrationSnapshotsEqual asserts that the post-migration RPC
// snapshot matches the pre-migration RPC snapshot. The session comparison
// applies a focused normalization for known kvdb vs SQL macaroon recipe
// representation differences.
func assertMigrationSnapshotsEqual(t *harnessTest,
	before migrationDataSnapshot,
	after migrationDataSnapshot) {

	require.NotNil(t.t, before.account)
	require.NotNil(t.t, before.session)
	require.NotNil(t.t, before.action)
	require.NotNil(t.t, after.account)
	require.NotNil(t.t, after.session)
	require.NotNil(t.t, after.action)

	// As a nil macaroon recipe will be represented differently in kvdb vs
	// SQL dbs, we need to override that field in the session.
	overrideRPCMacaroonRecipe(before.session, after.session)

	require.Equal(t.t, before.account, after.account)
	require.Equal(t.t, before.session, after.session)
	require.Equal(t.t, before.action, after.action)
}

// overrideRPCMacaroonRecipe normalizes the one known RPC representation
// mismatch in this test: kvdb can return a non-nil MacaroonRecipe while SQL can
// return nil for equivalent empty recipe data.
func overrideRPCMacaroonRecipe(kvSession *litrpc.Session,
	sqlSession *litrpc.Session) {

	if kvSession == nil || sqlSession == nil {
		return
	}

	// Normalize SQL nil vs empty recipe when kvdb had an explicit empty
	// macaroon recipe.
	if kvSession.MacaroonRecipe != nil && sqlSession.MacaroonRecipe == nil {
		sqlSession.MacaroonRecipe = &litrpc.MacaroonRecipe{}
	}
}

// assertMinimalMigrationDataSQL checks that migration fixtures are available
// through SQL-backed stores after migration. Note that the SQL assertion is
// only intended to verify that an entry for the respective inserted object
// exists in the database, and not that all fields are the same. Test coverage
// for that has already been implemented in unit tests, which is responsible for
// those assertions.
func assertMinimalMigrationDataSQL(ctx context.Context, t *harnessTest,
	node *HarnessNode, data migrationDataRefs) {

	sqlStore := openMigrationSQLStore(t, node)
	defer sqlStore.Close()

	queries := sqlcmig6.NewForType(sqlStore, sqlStore.BackendType)

	accountsList, err := queries.ListAllAccounts(ctx)
	require.NoError(t.t, err)

	require.Len(t.t, accountsList, 1)
	dbAccount := accountsList[0]

	alias, err := accounts.AccountIDFromInt64(dbAccount.Alias)
	require.NoError(t.t, err)

	require.Equal(t.t, data.accountID, alias.String())

	sessions, err := queries.ListSessions(ctx)
	require.NoError(t.t, err)
	require.Len(t.t, sessions, 1)

	dbSession := sessions[0]
	require.Equal(t.t, data.sessionID, dbSession.Alias)

	actionStore := firewalldb.NewSQLDB(
		sqlStore, sqlc.NewForType(sqlStore, sqlStore.BackendType),
		clock.NewDefaultClock(),
	)
	actions, _, _, err := actionStore.ListActions(
		ctx, nil, firewalldb.WithActionMethodName(data.actionMethod),
	)
	require.NoError(t.t, err)
	require.NotEmpty(t.t, actions)
	require.Len(t.t, actions, 1)

	require.Equal(t.t, data.actionMethod, actions[0].RPCMethod)
}

// rerunSQLMigrationAndAssert removes the SQL database, starts litd with the
// selected SQL backend to rerun the kvdb migration, then verifies the fixtures
// via RPC and direct SQL queries.
func rerunSQLMigrationAndAssert(t *harnessTest, net *NetworkHarness,
	node *HarnessNode,
	newStepCtx func() (context.Context, context.CancelFunc),
	newAdminCtx func() (context.Context, context.CancelFunc),
	beforeMigration migrationDataSnapshot, refs migrationDataRefs) {

	t.t.Helper()

	deleteMigrationSQLDB(t, node)

	err := node.Start(
		net.litdBinary, net.backwardCompat, net.lndErrorChan, true,
		WithLitArg("databasebackend", *litDBBackend),
		WithLitArg("firewall.request-logger.level", "all"),
	)
	require.NoError(t.t, err)

	ctxt, cancel := newStepCtx()
	rawConn, err := connectRPC(
		ctxt, node.Cfg.LitAddr(), node.Cfg.LitTLSCertPath,
	)
	require.NoError(t.t, err)
	cancel()
	defer rawConn.Close()

	accountsClient := litrpc.NewAccountsClient(rawConn)
	sessionsClient := litrpc.NewSessionsClient(rawConn)
	firewallClient := litrpc.NewFirewallClient(rawConn)

	ctxm, cancel := newAdminCtx()
	afterMigration := queryMigrationData(
		ctxm, t, accountsClient, sessionsClient, firewallClient,
		refs.actionMethod,
	)
	cancel()

	assertMigrationSnapshotsEqual(t, beforeMigration, afterMigration)

	ctxt, cancel = newStepCtx()
	assertMinimalMigrationDataSQL(ctxt, t, node, refs)
	cancel()
}

type migrationKVDBFile struct {
	base string
	path string
}

// migrationKVDBFiles returns the startup order of the deprecated kvdb files
// when litd opens the bbolt backend: accounts, then sessions, then firewall.
func migrationKVDBFiles(node *HarnessNode) []migrationKVDBFile {
	networkDir := filepath.Join(node.Cfg.LitDir, node.Cfg.NetParams.Name)

	return []migrationKVDBFile{
		{
			base: accounts.DBFilename,
			path: filepath.Join(networkDir, accounts.DBFilename),
		},
		{
			base: session.DBFilename,
			path: filepath.Join(networkDir, session.DBFilename),
		},
		{
			base: firewalldb.DBFilename,
			path: filepath.Join(networkDir, firewalldb.DBFilename),
		},
	}
}

// removeMigrationKVDBFile deletes one kvdb file so the next deprecated file in
// the bbolt startup order becomes the first blocker.
func removeMigrationKVDBFile(t *harnessTest, file migrationKVDBFile) {
	t.t.Helper()

	err := os.Remove(file.path)
	require.NoError(t.t, err)
}

// openMigrationSQLStore opens a SQL database handle for the backend selected
// by the itest `-litdbbackend` flag.
//
// The migration test starts on bbolt and then restarts litd with
// `-litdbbackend=<backend>` to trigger kvdb -> SQL migration. This helper
// mirrors that backend choice and opens the matching SQL store so the test can
// assert migrated rows directly:
//   - `sqlite`: opens the node-local `litd.db` SQLite file.
//   - `postgres`: opens the configured Postgres database from the node config.
//
// The returned value is always a `*sqldb.BaseDB`, independent of which SQL
// implementation is used underneath.
func openMigrationSQLStore(t *harnessTest,
	node *HarnessNode) *sqldb.BaseDB {

	switch *litDBBackend {
	case terminal.DatabaseBackendPostgres:
		pgConf := node.Cfg.PostgresConfig

		require.NotNil(
			t.t, pgConf,
			"postgres config required for postgres backend",
		)

		sqlStore, err := sqldb.NewPostgresStore(
			&sqldb.PostgresConfig{
				Dsn:                pgConf.DSN(false),
				SkipMigrations:     true,
				RequireSSL:         pgConf.RequireSSL,
				MaxOpenConnections: pgConf.MaxOpenConnections,
				MaxIdleConnections: pgConf.MaxIdleConnections,
				ConnMaxLifetime:    pgConf.ConnMaxLifetime,
				ConnMaxIdleTime:    pgConf.ConnMaxIdleTime,
			},
		)
		require.NoError(t.t, err)

		return sqlStore.BaseDB

	case terminal.DatabaseBackendSqlite:
		dbPath := filepath.Join(
			node.Cfg.LitDir, node.Cfg.NetParams.Name, "litd.db",
		)

		sqlStore, err := sqldb.NewSqliteStore(
			&sqldb.SqliteConfig{
				SkipMigrations:        true,
				SkipMigrationDbBackup: true,
			}, dbPath,
		)
		require.NoError(t.t, err)

		return sqlStore.BaseDB

	default:
		t.t.Fatalf("unsupported sql backend %v", *litDBBackend)
		return nil
	}
}

// assertNodeStartFails waits for the node startup path to complete and asserts
// that startup fails with an error containing the expected text.
func assertNodeStartFails(t *harnessTest, net *NetworkHarness,
	node *HarnessNode, litArgOpts []LitArgOption, expectedErr string) {

	t.t.Helper()

	if expectedErr != "" {
		err := node.Start(
			net.litdBinary, net.backwardCompat, net.lndErrorChan,
			false, litArgOpts...,
		)
		require.NoError(t.t, err)

		assertLitStatusError(t, node, expectedErr)

		if node.cmd != nil && node.cmd.Process != nil {
			_ = node.cmd.Process.Kill()
		}

		waitForNodeExit(t, node)

		return
	}

	err := node.Start(
		net.litdBinary, net.backwardCompat, net.lndErrorChan, true,
		litArgOpts...,
	)
	require.Error(t.t, err)

	waitForNodeExit(t, node)
}

// assertLitStatusError waits for the public LiT status endpoint to report the
// expected error string for the LiT sub-server.
func assertLitStatusError(t *harnessTest, node *HarnessNode,
	expectedErr string) {

	t.t.Helper()

	deadline := time.Now().Add(defaultTimeout)
	var lastErr error

	for time.Now().Before(deadline) {
		ctxt, cancel := context.WithTimeout(
			context.Background(), 2*time.Second,
		)
		rawConn, err := connectLitRPC(
			ctxt, node.Cfg.LitAddr(), node.Cfg.LitTLSCertPath, "",
		)
		cancel()
		if err != nil {
			lastErr = err
			time.Sleep(200 * time.Millisecond)
			continue
		}

		statusClient := litrpc.NewStatusClient(rawConn)
		ctxt, cancel = context.WithTimeout(
			context.Background(), 2*time.Second,
		)
		resp, err := statusClient.SubServerStatus(
			ctxt, &litrpc.SubServerStatusReq{},
		)
		cancel()
		_ = rawConn.Close()
		if err != nil {
			lastErr = err
			time.Sleep(200 * time.Millisecond)
			continue
		}

		litStatus, ok := resp.SubServers[subservers.LIT]
		if ok && strings.Contains(litStatus.GetError(), expectedErr) {
			return
		}

		lastErr = fmt.Errorf(
			"lit status error %q did not contain %q",
			litStatus.GetError(), expectedErr,
		)
		time.Sleep(200 * time.Millisecond)
	}

	require.FailNowf(
		t.t, "expected %s status failure", "%v", lastErr,
	)
}

// waitForNodeExit waits for the node process to exit and force kills it if the
// failed-start path leaves the process around.
func waitForNodeExit(t *harnessTest, node *HarnessNode) {
	t.t.Helper()

	select {
	case <-node.processExit:
	case <-time.After(5 * time.Second):
		if node.cmd != nil && node.cmd.Process != nil {
			_ = node.cmd.Process.Kill()
		}

		select {
		case <-node.processExit:
		case <-time.After(10 * time.Second):
			t.t.Fatalf("timed out waiting for %s process exit",
				node.Name())
		}
	}
}

// deleteMigrationSQLDB removes the SQL database contents so starting LiT with
// the SQL backend reruns the kvdb -> SQL migration.
func deleteMigrationSQLDB(t *harnessTest, node *HarnessNode) {
	t.t.Helper()

	switch *litDBBackend {
	case terminal.DatabaseBackendSqlite:
		dbPath := filepath.Join(
			node.Cfg.LitDir, node.Cfg.NetParams.Name, "litd.db",
		)

		err := os.Remove(dbPath)
		require.NoError(t.t, err)

	case terminal.DatabaseBackendPostgres:
		pgConf := node.Cfg.PostgresConfig
		require.NotNil(t.t, pgConf)

		dbConn, err := sql.Open("postgres", pgConf.DSN(false))
		require.NoError(t.t, err)
		defer dbConn.Close()

		_, err = dbConn.ExecContext(
			context.Background(),
			`DROP SCHEMA IF EXISTS public CASCADE;
			 CREATE SCHEMA public;`,
		)
		require.NoError(t.t, err)

	default:
		t.t.Fatalf("unsupported sql backend %v", *litDBBackend)
	}
}
