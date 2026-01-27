//go:build itest

package itest

import (
	"context"
	"encoding/hex"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/btcsuite/btcd/btcutil"
	terminal "github.com/lightninglabs/lightning-terminal"
	"github.com/lightninglabs/lightning-terminal/accounts"
	"github.com/lightninglabs/lightning-terminal/db/sqlcmig6"
	"github.com/lightninglabs/lightning-terminal/litrpc"
	"github.com/lightningnetwork/lnd/clock"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/lntest"
	"github.com/lightningnetwork/lnd/lntypes"
	"github.com/lightningnetwork/lnd/lnwire"
	"github.com/lightningnetwork/lnd/sqldb/v2"
	"github.com/stretchr/testify/require"
)

// testKvdbSQLMigration implements the kvdb -> SQL migration itest.
// The itest mimics the unit tests in accounts/sql_migration_test.go,
// session/sql_migration_test.go, and firewalldb/sql_migration_test.go,
// excluding the randomized cases.
//
// testKvdbSQLMigration proceeds in steps:
// 1. Start a node with a bbolt backend.
// 2. Insert data into bbolt via litcli or direct store access.
// 3. Assert data in bbolt via direct store access.
// 4. Assert data via litcli where possible.
// 5. Restart with the configured backend to trigger kvdb -> SQL migration.
// 6. Assert data in SQL via direct database access.
// 7. Assert data via litcli where possible.
func testKvdbSQLMigration(ctx context.Context, net *NetworkHarness,
	t *harnessTest) {

	if *litDBBackend == terminal.DatabaseBackendBbolt {
		t.t.Skipf("Skipping kvdb migration test for bbolt backend")
	}

	ctxt, cancel := context.WithTimeout(ctx, defaultTimeout)
	defer cancel()

	// Step 1: Start a node with a bbolt backend.
	// We want to start from an explicit bbolt backend regardless of the
	// command line flag used to run the itests.
	migNode, err := net.NewNode(
		t.t, "Migrator", nil, false, true,
		fmt.Sprintf(
			"--databasebackend=%s", terminal.DatabaseBackendBbolt,
		),
	)
	require.NoError(t.t, err)
	defer shutdownAndAssert(net, t, migNode)

	// Fund the migration node.
	net.SendCoins(t.t, btcutil.SatoshiPerBitcoin, migNode)

	// Use Bob as the peer for the migration node and the node for payments.
	net.EnsureConnected(t.t, migNode, net.Bob)

	// Open a channel from the migration node -> Bob.
	channelOp := openChannelAndAssert(
		t, net, migNode, net.Bob, lntest.OpenChannelParams{
			Amt:     300000,
			PushAmt: 100000,
		},
	)
	defer closeChannelAndAssert(t, net, migNode, channelOp, false)

	// Setup a raw gRPC connection used to set up RPC clients.
	rawConn, err := connectRPC(
		ctxt, migNode.Cfg.LitAddr(), migNode.Cfg.LitTLSCertPath,
	)
	require.NoError(t.t, err)
	defer rawConn.Close()

	// Get the litd admin macaroon context from the migration node.
	macBytes := getLiTMacFromFile(t.t, migNode.Cfg)
	ctxm := macaroonContext(ctxt, macBytes)

	// LiT RPC clients are used to seed test fixtures.
	accountsClient := litrpc.NewAccountsClient(rawConn)

	// Lightning/router clients are used to create account
	// invoices/payments.
	lightningClient := lnrpc.NewLightningClient(rawConn)

	// Step 2a: Insert data into bbolt via litcli or direct store access.
	// setupAccountMigrationData persists accounts and related data which
	// are intended to mimic the data inserted in the
	// accounts/sql_migration_test.go migration tests.
	//
	// NOTE: For accounts migration tests explicitly, we can add all the
	// required data by just executing `litcli accounts CMD` commands.
	// Therefore, this is done prior to stopping the node. For all other
	// migration tests, we need to insert data by directly connecting to the
	// database as `litcli` does not provide enough flexibility to insert
	// the exact data we need to mimic the migration unit tests.
	accountsData := setupAccountMigrationData(
		ctxt, ctxm, t, accountsClient, lightningClient, net.Bob,
	)

	// Close now so restarts can reopen bbolt stores without locks.
	rawConn.Close()

	// Restart with bbolt to insert and verify migration data before
	// triggering the sqlite migration.
	// Note that we cannot connect directly to the bbolt backend while the
	// node is running, which is why the node is restarted and the data
	// insertion + asserted through the callback of the `RestartNode`
	// function. That is then executed after the node has been stopped, but
	// before it has been restarted.
	err = net.RestartNode(
		migNode, func() error {
			// Step 2b: Insert bbolt-only fixtures via direct store
			// access.
			accountStore, err := accounts.NewBoltStore(
				filepath.Dir(migNode.Cfg.LitMacPath),
				accounts.DBFilename, clock.NewDefaultClock(),
			)
			if err != nil {
				return err
			}
			defer accountStore.Close()

			err = setupBBoltMigrationData(
				accountStore, accountsData,
			)
			if err != nil {
				return err
			}

			// Step 3: Assert data in bbolt via direct store access.
			return assertMigrationDataInBBoltDB(
				ctxt, accountStore, accountsData,
			)
		}, []LitArgOption{
			WithLitArg(
				"databasebackend",
				terminal.DatabaseBackendBbolt,
			),
		},
	)
	require.NoError(t.t, err)

	// Step 4: Assert data via litcli where possible.
	assertMigrationDataViaLitCLI(ctxt, t, migNode, accountsData)

	// Step 5: Restart the node once more with the configured backend to
	// trigger the kvdb -> SQL migration.
	err = net.RestartNode(
		migNode, func() error { return nil }, []LitArgOption{
			WithLitArg("databasebackend", *litDBBackend),
		},
	)
	require.NoError(t.t, err)

	// Step 6: Assert data in SQL via direct database access.
	assertMigrationDataSQL(ctxt, t, migNode, accountsData)

	// Step 7: Assert data via litcli where possible.
	assertMigrationDataViaLitCLI(ctxt, t, migNode, accountsData)
}

type accountMigrationExpectation struct {
	id             string
	label          string
	expirationDate int64
	initialBalance uint64
	invoices       int
	payments       int
	lastUpdate     int64
}

type accountMigrationData struct {
	expectations     map[string]accountMigrationExpectation
	sessionAccountID string
}

// setupAccountMigrationData creates account fixtures for migration tests
// that mimic accounts/sql_migration_test.go, excluding the randomized account
// test. The expected accounts db state is then returned.
func setupAccountMigrationData(ctx context.Context, adminCtx context.Context,
	t *harnessTest, accountsClient litrpc.AccountsClient,
	lightningClient lnrpc.LightningClient,
	peer *HarnessNode) accountMigrationData {

	now := time.Now()
	expectations := make(map[string]accountMigrationExpectation)

	createAccount := func(balance uint64, expiry int64,
		label string) *litrpc.CreateAccountResponse {

		resp, err := accountsClient.CreateAccount(
			adminCtx, &litrpc.CreateAccountRequest{
				AccountBalance: balance,
				ExpirationDate: expiry,
				Label:          label,
			},
		)
		require.NoError(t.t, err)

		expectations[label] = accountMigrationExpectation{
			id:             resp.Account.Id,
			label:          label,
			expirationDate: expiry,
			initialBalance: balance,
		}

		return resp
	}

	// Mimics accounts/sql_migration_test.go "account no expiry".
	noExpiry := createAccount(0, 0, "migration-no-expiry")

	// Mimics accounts/sql_migration_test.go "account with expiry".
	expiryDate := now.Add(time.Hour).Unix()
	createAccount(0, expiryDate, "migration-with-expiry")

	// Mimics accounts/sql_migration_test.go "account with balance".
	createAccount(100000, 0, "migration-balance")

	// Mimics accounts/sql_migration_test.go "account with set UpdatedAt".
	updateExpiry := now.Add(2 * time.Hour).Unix()
	updatedResp := createAccount(
		0, now.Add(30*time.Minute).Unix(), "migration-updated",
	)
	updatedAcct, err := accountsClient.UpdateAccount(
		adminCtx, &litrpc.UpdateAccountRequest{
			Id:             updatedResp.Account.Id,
			AccountBalance: -1,
			ExpirationDate: updateExpiry,
		},
	)
	require.NoError(t.t, err)
	updated := expectations["migration-updated"]
	updated.expirationDate = updateExpiry
	updated.lastUpdate = updatedAcct.LastUpdate
	expectations["migration-updated"] = updated

	// Mimics accounts/sql_migration_test.go "account with invoices".
	invoicesResp := createAccount(0, 0, "migration-invoices")
	invoiceCtx := macaroonContext(ctx, invoicesResp.Macaroon)
	payNode(
		invoiceCtx, ctx, t, peer.RouterClient, lightningClient,
		4000, "acct-inbound-1",
	)
	payNode(
		invoiceCtx, ctx, t, peer.RouterClient, lightningClient,
		3000, "acct-inbound-2",
	)
	invoiceExpectation := expectations["migration-invoices"]
	invoiceExpectation.invoices = 2
	expectations["migration-invoices"] = invoiceExpectation

	// Mimics accounts/sql_migration_test.go "account with payments".
	// NOTE: As there's no way to insert payments into the accounts store
	// directly by just using `litcli`, we insert the payments outside
	// of this function, by directly connecting to the bbolt db.
	createAccount(50000, 0, "migration-payments")
	paymentExpectation := expectations["migration-payments"]
	paymentExpectation.payments = 4
	expectations["migration-payments"] = paymentExpectation

	// Note that we don't mimic the accounts/sql_migration_test.go
	// "multiple accounts", as the test data already contains multiple
	// accounts due to the rest of the test data.

	return accountMigrationData{
		expectations:     expectations,
		sessionAccountID: noExpiry.Account.Id,
	}
}

// setupBBoltMigrationData seeds the bbolt db with sessions, firewall data, and
// payments, by creating a direct connection to the bbolt db.
func setupBBoltMigrationData(accountStore *accounts.BoltStore,
	accountsData accountMigrationData) error {

	return setupMigrationPayments(accountStore, accountsData)
}

// setupMigrationPayments inserts payments into the bbolt accounts store to
// mimic the payments in accounts/sql_migration_test.go "account with payments"
// unit test.
func setupMigrationPayments(store accounts.Store,
	accountsData accountMigrationData) error {

	paymentExpectation, ok :=
		accountsData.expectations["migration-payments"]
	if !ok {
		return fmt.Errorf("missing payment account data")
	}

	parsedID, err := accounts.ParseAccountID(paymentExpectation.id)
	if err != nil {
		return err
	}

	payments := []struct {
		hash   lntypes.Hash
		amount lnwire.MilliSatoshi
		status lnrpc.Payment_PaymentStatus
	}{
		{
			hash:   lntypes.Hash{1, 1, 1, 1},
			amount: 100,
			status: lnrpc.Payment_UNKNOWN,
		},
		{
			hash:   lntypes.Hash{2, 2, 2, 2},
			amount: 200,
			status: lnrpc.Payment_IN_FLIGHT,
		},
		{
			hash:   lntypes.Hash{3, 3, 3, 3},
			amount: 200,
			status: lnrpc.Payment_SUCCEEDED,
		},
		{
			hash:   lntypes.Hash{4, 4, 4, 4},
			amount: 200,
			status: lnrpc.Payment_FAILED,
		},
	}

	for _, payment := range payments {
		_, err = store.UpsertAccountPayment(
			context.Background(), *parsedID, payment.hash,
			payment.amount, payment.status,
		)
		if err != nil {
			return err
		}
	}

	return nil
}

// assertMigrationDataInBBoltDB validates bbolt data before migration.
func assertMigrationDataInBBoltDB(ctx context.Context,
	accountStore *accounts.BoltStore,
	accountsData accountMigrationData) error {

	return assertAccountsMigrationDataBolt(ctx, accountStore, accountsData)
}

// assertAccountsMigrationDataBolt checks account data in the bbolt store.
func assertAccountsMigrationDataBolt(ctx context.Context,
	accountStore accounts.Store, data accountMigrationData) error {

	accountsList, err := accountStore.Accounts(ctx)
	if err != nil {
		return err
	}

	// Note that other migration tests for sessions and firewalldb may add
	// accounts, and therefore we only check that the accounts store
	// contains at least the expected amount, and not exactly the amount.
	if len(accountsList) < len(data.expectations) {
		return fmt.Errorf(
			"expected at least %d accounts, got %d",
			len(data.expectations), len(accountsList),
		)
	}

	accountsByLabel := make(
		map[string]*accounts.OffChainBalanceAccount,
	)
	for _, acct := range accountsList {
		accountsByLabel[acct.Label] = acct
	}

	for label, expected := range data.expectations {
		acct, ok := accountsByLabel[label]
		if !ok {
			return fmt.Errorf("account %s not found", label)
		}

		if hex.EncodeToString(acct.ID[:]) != expected.id {
			return fmt.Errorf("account %s id mismatch", label)
		}

		expiry := int64(0)
		if !acct.ExpirationDate.IsZero() {
			expiry = acct.ExpirationDate.Unix()
		}
		if expiry != expected.expirationDate {
			return fmt.Errorf(
				"account %s expiration mismatch", label,
			)
		}

		initial := uint64(acct.InitialBalance.ToSatoshis())
		if initial != expected.initialBalance {
			return fmt.Errorf(
				"account %s balance mismatch", label,
			)
		}

		if len(acct.Invoices) != expected.invoices {
			return fmt.Errorf(
				"account %s invoices mismatch", label,
			)
		}
		if len(acct.Payments) != expected.payments {
			return fmt.Errorf(
				"account %s payments mismatch", label,
			)
		}

		if expected.lastUpdate > 0 {
			if acct.LastUpdate.Unix() != expected.lastUpdate {
				return fmt.Errorf(
					"account %s last update mismatch",
					label,
				)
			}
		}
	}

	return nil
}

// assertMigrationDataViaLitCLI checks migration data using litcli commands.
func assertMigrationDataViaLitCLI(ctx context.Context, t *harnessTest,
	node *HarnessNode, accountsData accountMigrationData) {

	listResp, err := listAccountsViaLitCLI(ctx, node)
	require.NoError(t.t, err)
	assertAccountMigrationDataFromList(t, listResp, accountsData)
}

// listAccountsViaLitCLI runs `litcli accounts list` and parses the response.
func listAccountsViaLitCLI(ctx context.Context, node *HarnessNode) (
	*litrpc.ListAccountsResponse, error) {

	litcliPath, err := exec.LookPath("litcli")
	if err != nil {
		return nil, fmt.Errorf("litcli not found in PATH")
	}

	cmd := exec.CommandContext(ctx, litcliPath, "accounts", "list")
	cmd.Env = append(os.Environ(),
		fmt.Sprintf("LITCLI_RPCSERVER=%s", node.Cfg.LitAddr()),
		fmt.Sprintf(
			"LITCLI_TLSCERTPATH=%s", node.Cfg.LitTLSCertPath,
		),
		fmt.Sprintf("LITCLI_MACAROONPATH=%s", node.Cfg.LitMacPath),
		fmt.Sprintf(
			"LITCLI_NETWORK=%s", node.Cfg.NetParams.Name,
		),
		fmt.Sprintf("LITCLI_BASEDIR=%s", node.Cfg.LitDir),
	)

	output, err := cmd.CombinedOutput()
	if err != nil {
		return nil, fmt.Errorf(
			"litcli accounts list failed: %w: %s",
			err, strings.TrimSpace(string(output)),
		)
	}

	raw := strings.TrimSpace(string(output))
	if raw == "" {
		return nil, fmt.Errorf("litcli accounts list returned no data")
	}

	var resp litrpc.ListAccountsResponse
	err = lnrpc.ProtoJSONUnmarshalOpts.Unmarshal(
		[]byte(raw), &resp,
	)
	if err != nil {
		return nil, err
	}

	return &resp, nil
}

// assertAccountMigrationDataFromList checks account data in a list response.
func assertAccountMigrationDataFromList(t *harnessTest,
	listResp *litrpc.ListAccountsResponse,
	data accountMigrationData) {

	require.NotNil(t.t, listResp)

	// Note that other migration tests for sessions and firewalldb may add
	// accounts, and therefore we only check that the accounts store
	// contains at least the expected amount, and not exactly the amount.
	require.GreaterOrEqual(
		t.t, len(listResp.Accounts), len(data.expectations),
	)
	accountsByLabel := make(map[string]*litrpc.Account)
	for _, acct := range listResp.Accounts {
		accountsByLabel[acct.Label] = acct
	}

	for label, expected := range data.expectations {
		acct, ok := accountsByLabel[label]
		require.Truef(t.t, ok, "account %s not found", label)
		require.Equal(t.t, expected.id, acct.Id)
		require.Equal(t.t, expected.expirationDate, acct.ExpirationDate)
		require.Equal(t.t, expected.initialBalance, acct.InitialBalance)
		require.Len(t.t, acct.Invoices, expected.invoices)
		require.Len(t.t, acct.Payments, expected.payments)
		if expected.lastUpdate > 0 {
			require.Equal(t.t, expected.lastUpdate, acct.LastUpdate)
		}
	}
}

// assertMigrationDataSQL connects to the SQL DB to assert the migration
// results.
func assertMigrationDataSQL(ctx context.Context, t *harnessTest,
	node *HarnessNode, accountsData accountMigrationData) {

	assertAccountMigrationDataSQL(ctx, t, node, accountsData)
}

// assertAccountMigrationDataSQL connects to the SQL DB and queries account
// data to assert migration results.
func assertAccountMigrationDataSQL(ctx context.Context, t *harnessTest,
	node *HarnessNode, data accountMigrationData) {

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
	defer sqlStore.BaseDB.Close()

	queries := sqlcmig6.NewForType(sqlStore.BaseDB, sqlStore.BackendType)

	accountsList, err := queries.ListAllAccounts(ctx)
	require.NoError(t.t, err)

	// Note that other migration tests for sessions and firewalldb may add
	// accounts, and therefore we only check that the accounts store
	// contains at least the expected amount, and not exactly the amount.
	require.GreaterOrEqual(
		t.t, len(accountsList), len(data.expectations),
	)

	accountsByLabel := make(map[string]sqlcmig6.Account)
	for _, acct := range accountsList {
		if acct.Label.Valid {
			accountsByLabel[acct.Label.String] = acct
		}
	}

	for label, expected := range data.expectations {
		acct, ok := accountsByLabel[label]
		require.Truef(t.t, ok, "account %s not found", label)

		alias, err := accounts.AccountIDFromInt64(acct.Alias)
		require.NoError(t.t, err)
		require.Equal(t.t, expected.id, alias.String())

		expiry := int64(0)
		if !acct.Expiration.IsZero() {
			expiry = acct.Expiration.Unix()
		}
		require.Equal(t.t, expected.expirationDate, expiry)

		initial := lnwire.MilliSatoshi(
			acct.InitialBalanceMsat,
		).ToSatoshis()
		require.Equal(t.t, expected.initialBalance, uint64(initial))

		invoices, err := queries.ListAccountInvoices(ctx, acct.ID)
		require.NoError(t.t, err)
		require.Len(t.t, invoices, expected.invoices)

		payments, err := queries.ListAccountPayments(ctx, acct.ID)
		require.NoError(t.t, err)
		require.Len(t.t, payments, expected.payments)

		if expected.lastUpdate > 0 {
			require.Equal(
				t.t, expected.lastUpdate,
				acct.LastUpdated.Unix(),
			)
		}
	}
}
