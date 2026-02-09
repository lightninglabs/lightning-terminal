//go:build itest

package itest

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/binary"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"reflect"
	"sort"
	"strings"
	"testing"
	"time"

	"github.com/btcsuite/btcd/btcutil"
	terminal "github.com/lightninglabs/lightning-terminal"
	"github.com/lightninglabs/lightning-terminal/accounts"
	"github.com/lightninglabs/lightning-terminal/db/sqlc"
	"github.com/lightninglabs/lightning-terminal/db/sqlcmig6"
	"github.com/lightninglabs/lightning-terminal/firewalldb"
	"github.com/lightninglabs/lightning-terminal/litrpc"
	"github.com/lightninglabs/lightning-terminal/session"
	"github.com/lightningnetwork/lnd/clock"
	"github.com/lightningnetwork/lnd/fn"
	"github.com/lightningnetwork/lnd/kvdb"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/lntest"
	"github.com/lightningnetwork/lnd/lntypes"
	"github.com/lightningnetwork/lnd/lnwire"
	"github.com/lightningnetwork/lnd/macaroons"
	"github.com/lightningnetwork/lnd/sqldb/v2"
	"github.com/lightningnetwork/lnd/tlv"
	"github.com/stretchr/testify/require"
	"go.etcd.io/bbolt"
	"gopkg.in/macaroon-bakery.v2/bakery"
	"gopkg.in/macaroon-bakery.v2/bakery/checkers"
	"gopkg.in/macaroon.v2"
)

const (
	actionTestFeatureName          = "migration-action-feature"
	actionTestTrigger              = "migration-action-trigger"
	actionTestIntent               = "migration-action-intent"
	actionTestActorName            = "migration-action-actor"
	actionTestRPCMethod            = "Test.Method"
	actionTestRPCParams            = "{\"test\":\"data\"}"
	actionTestJSON                 = "{\"test\":\"data\"}"
	accountTypeID         tlv.Type = 1
	accountTypeType       tlv.Type = 2
	accountInitialBalance tlv.Type = 3
	accountCurrentBalance tlv.Type = 4
	accountLastUpdate     tlv.Type = 5
	accountExpirationDate tlv.Type = 6
	accountInvoices       tlv.Type = 7
	accountPayments       tlv.Type = 8
	accountLabel          tlv.Type = 9
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

	// Hold bbolt data to assert before and after migration.
	var sessionData sessionMigrationData
	var fWallData firewallMigrationData

	// Fetch the macRootKeyIDMap which maps macaroon suffixes to full root
	// key IDs. Note that this is done before shutting down the node, as
	// we need the node to be up and running to connect to it.
	macRootKeyMap, err := macRootKeyIDMap(ctxt, t.t, migNode.Cfg)
	require.NoError(t.t, err)

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
			dbDir := filepath.Dir(migNode.Cfg.LitMacPath)

			accountStore, err := accounts.NewBoltStore(
				dbDir, accounts.DBFilename,
				clock.NewDefaultClock(),
			)
			if err != nil {
				return err
			}
			defer accountStore.Close()

			sessionData, fWallData, err = setupBBoltMigrationData(
				ctxt, t, accountStore, dbDir, accountsData,
				macRootKeyMap,
			)
			if err != nil {
				return err
			}

			// Step 3: Assert data in bbolt via direct store access.
			return assertMigrationDataInBBoltDB(
				ctxt, accountStore, dbDir, accountsData,
				sessionData, fWallData,
			)
		}, []LitArgOption{
			WithLitArg(
				"databasebackend",
				terminal.DatabaseBackendBbolt,
			),
		},
	)
	require.NoError(t.t, err)

	// Refresh the macaroon root key map of the fWallData after the restart
	// because lnd assigns new root key IDs, so the earlier map no longer
	// matches migrated data.
	updateActionMacRootKeyIDs(ctxt, t.t, migNode.Cfg, &fWallData)

	// Step 4: Assert data via litcli where possible.
	assertMigrationDataViaLitCLI(
		ctxt, t, migNode, accountsData, sessionData, fWallData,
	)

	// Step 5: Restart the node once more with the configured backend to
	// trigger the kvdb -> SQL migration.
	err = net.RestartNode(
		migNode, func() error { return nil }, []LitArgOption{
			WithLitArg("databasebackend", *litDBBackend),
		},
	)
	require.NoError(t.t, err)

	// Step 6: Assert data in SQL via direct database access.
	assertMigrationDataSQL(
		ctxt, t, migNode, accountsData, sessionData, fWallData,
	)

	// Step 7: Assert data via litcli where possible.
	assertMigrationDataViaLitCLI(
		ctxt, t, migNode, accountsData, sessionData, fWallData,
	)
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

type macaroonPermExpectation struct {
	entity string
	action string
}
type macaroonRecipeExpectation struct {
	perms   []macaroonPermExpectation
	caveats []string
}

type sessionMigrationExpectation struct {
	label          string
	sessionType    litrpc.SessionType
	devServer      bool
	privacyFlags   uint64
	featureConfigs map[string]string
	macaroonRecipe *macaroonRecipeExpectation
	accountID      string
	groupID        []byte
}

type sessionMigrationData struct {
	expectations map[string]sessionMigrationExpectation
}

type firewallKVEntryExpectation struct {
	ruleName    string
	groupAlias  *session.ID
	featureName *string
	key         string
	value       []byte
	perm        bool
}

type firewallKVMigrationData struct {
	entries []*firewallKVEntryExpectation
}

type firewallActionMigrationData struct {
	actions []*firewalldb.Action
}

type firewallMigrationData struct {
	firewallKVMigrationData
	firewallPrivacyPairMigrationData
	firewallActionMigrationData
}

type firewallPrivacyPairMigrationData struct {
	privPairs map[session.ID]map[string]string
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
func setupBBoltMigrationData(ctx context.Context, t *harnessTest,
	accountStore *accounts.BoltStore, dbDir string,
	accountsData accountMigrationData,
	macRootKeyIDs map[[4]byte]uint64) (sessionMigrationData,
	firewallMigrationData, error) {

	err := setupMigrationPayments(accountStore, accountsData)
	if err != nil {
		return sessionMigrationData{}, firewallMigrationData{}, err
	}

	sessionData, err := setupSessionMigrationData(
		ctx, t, accountStore, dbDir,
	)
	if err != nil {
		return sessionMigrationData{}, firewallMigrationData{}, err
	}

	firewallData, err := setupFirewallMigrationData(
		ctx, t, accountStore, dbDir, macRootKeyIDs,
	)
	if err != nil {
		return sessionMigrationData{}, firewallMigrationData{}, err
	}

	return sessionData, firewallData, nil
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

// setupSessionMigrationData creates session fixtures for migration tests that
// mimic session/sql_migration_test.go, excluding randomized session tests.
func setupSessionMigrationData(ctx context.Context, t *harnessTest,
	accountStore accounts.Store,
	dbDir string) (sessionMigrationData, error) {

	data := sessionMigrationData{
		expectations: make(map[string]sessionMigrationExpectation),
	}

	sessionStore, err := session.NewDB(
		dbDir, session.DBFilename, clock.NewDefaultClock(),
		accountStore,
	)
	if err != nil {
		return data, err
	}
	defer sessionStore.Close()

	expiry := time.Unix(1000, 0)

	createSession := func(label string, typ session.Type,
		serverAddr string, opts ...session.Option) (*session.Session,
		error) {

		sess, err := sessionStore.NewSession(
			ctx, label, typ, expiry, serverAddr, opts...,
		)
		if err != nil {
			return nil, err
		}

		err = sessionStore.ShiftState(
			ctx, sess.ID, session.StateCreated,
		)
		if err != nil {
			return nil, err
		}

		return sess, nil
	}

	addExpectation := func(sess *session.Session) {
		data.expectations[sess.Label] = buildSessionExpectation(sess)
	}

	findSessionByLabel := func(label string) (*session.Session, error) {
		sessions, err := sessionStore.ListAllSessions(ctx)
		if err != nil {
			return nil, err
		}

		for _, sess := range sessions {
			if sess.Label == label {
				return sess, nil
			}
		}

		return nil, fmt.Errorf("session %s not found", label)
	}

	// Mimic "one session no options".
	sess, err := createSession(
		"migration-session-basic", session.TypeMacaroonAdmin, "",
	)
	if err != nil {
		return data, err
	}
	addExpectation(sess)

	// Mimic "multiple sessions no options".
	sess, err = createSession(
		"migration-session-multi-1", session.TypeMacaroonAdmin, "",
	)
	if err != nil {
		return data, err
	}
	addExpectation(sess)

	sess, err = createSession(
		"migration-session-multi-2", session.TypeMacaroonAdmin, "",
	)
	if err != nil {
		return data, err
	}
	addExpectation(sess)

	sess, err = createSession(
		"migration-session-multi-3", session.TypeMacaroonAdmin, "",
	)
	if err != nil {
		return data, err
	}
	addExpectation(sess)

	// Mimic "one session with one privacy flag".
	sess, err = createSession(
		"migration-session-privacy-one",
		session.TypeMacaroonAdmin, "",
		session.WithPrivacy(session.PrivacyFlags{
			session.ClearPubkeys,
		}),
	)
	if err != nil {
		return data, err
	}
	addExpectation(sess)

	// Mimic "one session with multiple privacy flags".
	sess, err = createSession(
		"migration-session-privacy-multi",
		session.TypeMacaroonAdmin, "",
		session.WithPrivacy(session.PrivacyFlags{
			session.ClearChanInitiator,
			session.ClearHTLCs,
			session.ClearClosingTxIds,
		}),
	)
	if err != nil {
		return data, err
	}
	addExpectation(sess)

	// Mimic "one session with a feature config".
	featureConfig := session.FeaturesConfig{
		"AutoFees":      {1, 2, 3, 4},
		"AutoSomething": {4, 3, 4, 5, 6, 6},
	}
	sess, err = createSession(
		"migration-session-feature",
		session.TypeMacaroonAdmin, "",
		session.WithFeatureConfig(featureConfig),
	)
	if err != nil {
		return data, err
	}
	addExpectation(sess)

	// Mimic "one session with a feature config with empty".
	featureConfigEmpty := session.FeaturesConfig{
		"AutoFees": {},
	}
	sess, err = createSession(
		"migration-session-feature-empty",
		session.TypeMacaroonAdmin, "",
		session.WithFeatureConfig(featureConfigEmpty),
	)
	if err != nil {
		return data, err
	}
	addExpectation(sess)

	// Mimic "one session with a feature config with nil".
	featureConfigNil := session.FeaturesConfig{
		"AutoFees": nil,
	}
	sess, err = createSession(
		"migration-session-feature-nil",
		session.TypeMacaroonAdmin, "",
		session.WithFeatureConfig(featureConfigNil),
	)
	if err != nil {
		return data, err
	}
	addExpectation(sess)

	// Mimic "one session with dev server".
	sess, err = createSession(
		"migration-session-dev-server",
		session.TypeMacaroonAdmin, "",
		session.WithDevServer(),
	)
	if err != nil {
		return data, err
	}
	addExpectation(sess)

	macCaveats := []macaroon.Caveat{
		{
			Id: []byte("migration-caveat"),
		},
	}
	macPerms := []bakery.Op{
		{
			Entity: "offchain",
			Action: "read",
		},
	}

	// Mimic "one session with macaroon recipe".
	sess, err = createSession(
		"migration-session-mac-recipe",
		session.TypeMacaroonAdmin, "foo.bar.baz:1234",
		session.WithMacaroonRecipe(macCaveats, macPerms),
	)
	if err != nil {
		return data, err
	}
	addExpectation(sess)

	// Mimic "one session with macaroon recipe nil caveats".
	sess, err = createSession(
		"migration-session-mac-nil-caveats",
		session.TypeMacaroonAdmin, "foo.bar.baz:1234",
		session.WithMacaroonRecipe(nil, macPerms),
	)
	if err != nil {
		return data, err
	}
	addExpectation(sess)

	// Mimic "one session with macaroon recipe nil perms".
	sess, err = createSession(
		"migration-session-mac-nil-perms",
		session.TypeMacaroonAdmin, "foo.bar.baz:1234",
		session.WithMacaroonRecipe(macCaveats, nil),
	)
	if err != nil {
		return data, err
	}
	addExpectation(sess)

	// Mimic "macaroon recipe with nil perms and caveats".
	sess, err = createSession(
		"migration-session-mac-nil-all",
		session.TypeMacaroonAdmin, "foo.bar.baz:1234",
		session.WithMacaroonRecipe(nil, nil),
	)
	if err != nil {
		return data, err
	}
	addExpectation(sess)

	// Mimic "one session with a linked account".
	linkedAccount, err := accountStore.NewAccount(
		ctx, 1234, time.Now().Add(time.Hour), "",
	)
	if err != nil {
		return data, err
	}
	accountCaveat := checkers.Condition(
		macaroons.CondLndCustom,
		fmt.Sprintf("%s %x", accounts.CondAccount, linkedAccount.ID[:]),
	)
	accountCaveats := []macaroon.Caveat{
		{
			Id: []byte(accountCaveat),
		},
	}
	sess, err = createSession(
		"migration-session-linked-account",
		session.TypeMacaroonAccount, "",
		session.WithAccount(linkedAccount.ID),
		session.WithMacaroonRecipe(accountCaveats, nil),
	)
	if err != nil {
		return data, err
	}
	addExpectation(sess)

	// Mimic "one session with a deleted linked account".
	removedAccount, err := accountStore.NewAccount(
		ctx, 1234, time.Now().Add(time.Hour), "",
	)
	if err != nil {
		return data, err
	}
	removedCaveat := checkers.Condition(
		macaroons.CondLndCustom,
		fmt.Sprintf(
			"%s %x", accounts.CondAccount, removedAccount.ID[:],
		),
	)
	removedCaveats := []macaroon.Caveat{
		{
			Id: []byte(removedCaveat),
		},
	}
	sess, err = createSession(
		"migration-session-removed-account",
		session.TypeMacaroonAccount, "",
		session.WithAccount(removedAccount.ID),
		session.WithMacaroonRecipe(removedCaveats, nil),
	)
	if err != nil {
		return data, err
	}
	addExpectation(sess)

	err = accountStore.RemoveAccount(ctx, removedAccount.ID)
	if err != nil {
		return data, err
	}
	removedExpectation := data.expectations[sess.Label]
	removedExpectation.accountID = ""
	data.expectations[sess.Label] = removedExpectation

	// Mimic "linked session".
	groupSess, err := createSession(
		"migration-session-group-root",
		session.TypeMacaroonAdmin, "",
	)
	if err != nil {
		return data, err
	}
	addExpectation(groupSess)

	err = sessionStore.ShiftState(
		ctx, groupSess.ID, session.StateCreated,
	)
	if err != nil {
		return data, err
	}

	err = sessionStore.ShiftState(
		ctx, groupSess.ID, session.StateRevoked,
	)
	if err != nil {
		return data, err
	}

	sess, err = createSession(
		"migration-session-group-linked",
		session.TypeMacaroonAdmin, "",
		session.WithLinkedGroupID(&groupSess.ID),
	)
	if err != nil {
		return data, err
	}
	addExpectation(sess)

	// Mimic "multiple sessions with the same ID".
	dup1, err := createSession(
		"migration-session-dup-1", session.TypeMacaroonAdmin, "",
	)
	if err != nil {
		return data, err
	}

	dup2, err := createSession(
		"migration-session-dup-2", session.TypeMacaroonAdmin, "",
	)
	if err != nil {
		return data, err
	}

	dup3, err := createSession(
		"migration-session-dup-3", session.TypeMacaroonAdmin, "",
	)
	if err != nil {
		return data, err
	}

	err = updateSessionIDAndCreatedAt(
		sessionStore, dup3.ID, dup2.MacaroonRootKey,
		dup2.CreatedAt.Add(time.Minute),
	)
	if err != nil {
		return data, err
	}

	dup4, err := createSession(
		"migration-session-dup-4", session.TypeMacaroonAdmin, "",
	)
	if err != nil {
		return data, err
	}

	dup5, err := createSession(
		"migration-session-dup-5", session.TypeMacaroonAdmin, "",
	)
	if err != nil {
		return data, err
	}

	dup6, err := createSession(
		"migration-session-dup-6", session.TypeMacaroonAdmin, "",
	)
	if err != nil {
		return data, err
	}

	err = updateSessionIDAndCreatedAt(
		sessionStore, dup5.ID, dup4.MacaroonRootKey,
		dup4.CreatedAt.Add(time.Minute),
	)
	if err != nil {
		return data, err
	}

	err = updateSessionIDAndCreatedAt(
		sessionStore, dup6.ID, dup4.MacaroonRootKey,
		dup4.CreatedAt.Add(time.Minute*2),
	)
	if err != nil {
		return data, err
	}

	dup1, err = findSessionByLabel(dup1.Label)
	if err != nil {
		return data, err
	}
	addExpectation(dup1)

	dup3, err = findSessionByLabel(dup3.Label)
	if err != nil {
		return data, err
	}
	addExpectation(dup3)

	dup6, err = findSessionByLabel(dup6.Label)
	if err != nil {
		return data, err
	}
	addExpectation(dup6)

	return data, nil
}

// buildSessionExpectation converts a bbolt session into the expected RPC
// representation after migration.
func buildSessionExpectation(s *session.Session) sessionMigrationExpectation {
	featureConfigs := make(map[string]string)
	if s.FeatureConfig != nil {
		for name, cfg := range *s.FeatureConfig {
			featureConfigs[name] = string(cfg)
		}
	}

	var recipe *macaroonRecipeExpectation
	if s.MacaroonRecipe != nil {
		perms := make(
			[]macaroonPermExpectation, 0,
			len(s.MacaroonRecipe.Permissions),
		)
		for _, perm := range s.MacaroonRecipe.Permissions {
			perms = append(perms, macaroonPermExpectation{
				entity: perm.Entity,
				action: perm.Action,
			})
		}

		caveats := make(
			[]string, 0, len(s.MacaroonRecipe.Caveats),
		)
		for _, cav := range s.MacaroonRecipe.Caveats {
			caveats = append(caveats, string(cav.Id))
		}

		recipe = &macaroonRecipeExpectation{
			perms:   perms,
			caveats: caveats,
		}
	}

	var accountID string
	s.AccountID.WhenSome(func(id accounts.AccountID) {
		accountID = hex.EncodeToString(id[:])
	})

	return sessionMigrationExpectation{
		label:          s.Label,
		sessionType:    sessionTypeToRPC(s.Type),
		devServer:      s.DevServer,
		privacyFlags:   s.PrivacyFlags.Serialize(),
		featureConfigs: featureConfigs,
		macaroonRecipe: recipe,
		accountID:      accountID,
		groupID:        s.GroupID[:],
	}
}

// sessionTypeToRPC maps the session store type to the RPC enum variant.
func sessionTypeToRPC(typ session.Type) litrpc.SessionType {
	switch typ {
	case session.TypeMacaroonReadonly:
		return litrpc.SessionType_TYPE_MACAROON_READONLY
	case session.TypeMacaroonAdmin:
		return litrpc.SessionType_TYPE_MACAROON_ADMIN
	case session.TypeMacaroonCustom:
		return litrpc.SessionType_TYPE_MACAROON_CUSTOM
	case session.TypeUIPassword:
		return litrpc.SessionType_TYPE_UI_PASSWORD
	case session.TypeAutopilot:
		return litrpc.SessionType_TYPE_AUTOPILOT
	case session.TypeMacaroonAccount:
		return litrpc.SessionType_TYPE_MACAROON_ACCOUNT
	default:
		return litrpc.SessionType_TYPE_MACAROON_ADMIN
	}
}

// updateSessionIDAndCreatedAt overrides the ID and CreatedAt of a session
// to mimic legacy duplicate-ID states.
//
// NOTE: this mimics updateSessionIDAndCreatedAt in
// session/sql_migration_test.go, which can't be used from itests.
func updateSessionIDAndCreatedAt(store *session.BoltStore, oldID session.ID,
	newRootKey uint64, newCreatedAt time.Time) error {

	newID := session.IDFromMacRootKeyID(newRootKey)
	if oldID == newID {
		return fmt.Errorf("can't update session ID to the same ID")
	}

	return store.Update(func(tx *bbolt.Tx) error {
		sessionBkt := tx.Bucket([]byte("session"))
		if sessionBkt == nil {
			return fmt.Errorf("session bucket not found")
		}

		idIndexBkt := sessionBkt.Bucket([]byte("id-index"))
		if idIndexBkt == nil {
			return fmt.Errorf("id-index bucket not found")
		}

		idBkt := idIndexBkt.Bucket(oldID[:])
		if idBkt == nil {
			return fmt.Errorf("session ID entry not found")
		}

		sessionKey := idBkt.Get([]byte("key"))
		if len(sessionKey) == 0 {
			return fmt.Errorf("session key missing for ID")
		}

		rawSession := sessionBkt.Get(sessionKey)
		if len(rawSession) == 0 {
			return fmt.Errorf("session not found")
		}

		sess, err := session.DeserializeSession(
			bytes.NewReader(rawSession),
		)
		if err != nil {
			return err
		}

		sess.ID = newID
		sess.GroupID = newID
		sess.MacaroonRootKey = newRootKey
		sess.CreatedAt = newCreatedAt

		var buf bytes.Buffer
		if err := session.SerializeSession(&buf, sess); err != nil {
			return err
		}

		return sessionBkt.Put(sessionKey, buf.Bytes())
	})
}

// setupFirewallMigrationData creates firewalldb fixtures for migration tests
// that mimic firewalldb/sql_migration_test.go, excluding randomized tests.
func setupFirewallMigrationData(ctx context.Context, t *harnessTest,
	accountStore *accounts.BoltStore, dbDir string,
	macRootKeyIDs map[[4]byte]uint64) (firewallMigrationData,
	error) {

	firewallKVData, err := setupFirewallKVMigrationData(
		ctx, t, accountStore, dbDir,
	)
	if err != nil {
		return firewallMigrationData{}, err
	}

	firewallPrivacyData, err := setupFirewallPrivacyMapperMigrationData(
		ctx, accountStore, dbDir,
	)
	if err != nil {
		return firewallMigrationData{}, err
	}

	firewallActionData, err := setupFirewallActionMigrationData(
		ctx, t, accountStore, dbDir, macRootKeyIDs,
	)
	if err != nil {
		return firewallMigrationData{}, err
	}

	return firewallMigrationData{
		firewallKVMigrationData:          firewallKVData,
		firewallPrivacyPairMigrationData: firewallPrivacyData,
		firewallActionMigrationData:      firewallActionData,
	}, nil
}

// setupFirewallKVMigrationData seeds firewall kv entries for migration.
func setupFirewallKVMigrationData(ctx context.Context, t *harnessTest,
	accountStore accounts.Store,
	dbDir string) (firewallKVMigrationData, error) {

	data := firewallKVMigrationData{
		entries: make([]*firewallKVEntryExpectation, 0),
	}

	dbClock := clock.NewDefaultClock()
	sessionStore, err := session.NewDB(
		dbDir, session.DBFilename, dbClock, accountStore,
	)
	if err != nil {
		return data, err
	}
	defer sessionStore.Close()

	firewallStore, err := firewalldb.NewBoltDB(
		dbDir, firewalldb.DBFilename,
		sessionStore, accountStore, dbClock,
	)
	if err != nil {
		return data, err
	}
	defer firewallStore.Close()

	addExpected := func(entry *firewallKVEntryExpectation) {
		data.entries = append(data.entries, entry)
	}

	addTempAndPerm := func(rule string, groupAlias *session.ID,
		featureName *string, key string, value []byte) error {

		tempEntry := &firewallKVEntryExpectation{
			ruleName:    rule,
			groupAlias:  groupAlias,
			featureName: featureName,
			key:         key,
			value:       value,
			perm:        false,
		}
		if err := insertFirewallKVEntry(
			ctx, firewallStore, tempEntry,
		); err != nil {
			return err
		}

		permEntry := &firewallKVEntryExpectation{
			ruleName:    rule,
			groupAlias:  groupAlias,
			featureName: featureName,
			key:         key,
			value:       value,
			perm:        true,
		}
		if err := insertFirewallKVEntry(
			ctx, firewallStore, permEntry,
		); err != nil {
			return err
		}
		addExpected(permEntry)

		return nil
	}

	newGroupAlias := func(label string,
		keep bool) (session.ID, error) {

		sess, err := sessionStore.NewSession(
			ctx, label, session.TypeAutopilot,
			time.Unix(1000, 0), "firewall.test",
		)
		if err != nil {
			return session.ID{}, err
		}

		if keep {
			err = sessionStore.ShiftState(
				ctx, sess.ID, session.StateCreated,
			)
			if err != nil {
				return session.ID{}, err
			}
		}

		return sess.GroupID, nil
	}

	ruleName := "migration-firewall-rule"
	ruleName2 := "migration-firewall-rule-2"
	featureName := "migration-feature"
	featureName2 := "migration-feature-2"
	entryKey := "migration-entry-key"
	entryKey2 := "migration-entry-key-2"
	entryKey3 := "migration-entry-key-3"
	entryKey4 := "migration-entry-key-4"
	entryValue := []byte{1, 2, 3}

	// Mimic "global kv entries".
	err = addTempAndPerm(
		ruleName, nil, nil, entryKey, entryValue,
	)
	if err != nil {
		return data, err
	}

	// Mimic "session specific kv entries".
	groupAlias, err := newGroupAlias("fw-session", true)
	if err != nil {
		return data, err
	}
	err = addTempAndPerm(
		ruleName, &groupAlias, nil, entryKey, entryValue,
	)
	if err != nil {
		return data, err
	}

	// Mimic "session specific kv entries deleted session".
	deletedGroup, err := newGroupAlias("fw-session-deleted", false)
	if err != nil {
		return data, err
	}
	err = insertFirewallKVEntry(
		ctx, firewallStore, &firewallKVEntryExpectation{
			ruleName:    ruleName,
			groupAlias:  &deletedGroup,
			featureName: nil,
			key:         entryKey,
			value:       entryValue,
			perm:        false,
		},
	)
	if err != nil {
		return data, err
	}

	err = insertFirewallKVEntry(
		ctx, firewallStore, &firewallKVEntryExpectation{
			ruleName:    ruleName,
			groupAlias:  &deletedGroup,
			featureName: nil,
			key:         entryKey,
			value:       entryValue,
			perm:        true,
		},
	)
	if err != nil {
		return data, err
	}

	// Mimic "session specific kv entries deleted and existing sessions".
	existingGroup, err := newGroupAlias("fw-session-existing", true)
	if err != nil {
		return data, err
	}
	err = addTempAndPerm(
		ruleName2, &existingGroup, nil, entryKey2, entryValue,
	)
	if err != nil {
		return data, err
	}
	err = insertFirewallKVEntry(
		ctx, firewallStore, &firewallKVEntryExpectation{
			ruleName:    ruleName2,
			groupAlias:  &deletedGroup,
			featureName: nil,
			key:         entryKey2,
			value:       entryValue,
			perm:        false,
		},
	)
	if err != nil {
		return data, err
	}

	// Mimic "feature specific kv entries".
	featureGroup, err := newGroupAlias("fw-feature", true)
	if err != nil {
		return data, err
	}
	err = addTempAndPerm(
		ruleName, &featureGroup, &featureName, entryKey, entryValue,
	)
	if err != nil {
		return data, err
	}

	// Mimic "feature specific kv entries deleted session".
	err = insertFirewallKVEntry(
		ctx, firewallStore, &firewallKVEntryExpectation{
			ruleName:    ruleName,
			groupAlias:  &deletedGroup,
			featureName: &featureName,
			key:         entryKey,
			value:       entryValue,
			perm:        false,
		},
	)
	if err != nil {
		return data, err
	}

	// Mimic "feature specific kv entries deleted and existing sessions".
	featureExisting, err := newGroupAlias(
		"fw-feature-existing", true,
	)
	if err != nil {
		return data, err
	}
	err = addTempAndPerm(
		ruleName2, &featureExisting, &featureName2,
		entryKey2, entryValue,
	)
	if err != nil {
		return data, err
	}
	err = insertFirewallKVEntry(
		ctx, firewallStore, &firewallKVEntryExpectation{
			ruleName:    ruleName2,
			groupAlias:  &deletedGroup,
			featureName: &featureName2,
			key:         entryKey2,
			value:       entryValue,
			perm:        true,
		},
	)
	if err != nil {
		return data, err
	}

	// Mimic "all kv entry combinations".
	allGroup, err := newGroupAlias("fw-all", true)
	if err != nil {
		return data, err
	}
	err = addTempAndPerm(
		ruleName2, nil, nil, entryKey, entryValue,
	)
	if err != nil {
		return data, err
	}
	err = addTempAndPerm(
		ruleName2, &allGroup, nil, entryKey, entryValue,
	)
	if err != nil {
		return data, err
	}
	err = addTempAndPerm(
		ruleName2, &allGroup, &featureName, entryKey, entryValue,
	)
	if err != nil {
		return data, err
	}
	err = addTempAndPerm(
		ruleName2, &allGroup, &featureName2, entryKey, entryValue,
	)
	if err != nil {
		return data, err
	}

	nilValue := []byte(nil)
	emptyValue := []byte{}

	err = addTempAndPerm(
		ruleName2, nil, nil, entryKey2, nilValue,
	)
	if err != nil {
		return data, err
	}
	err = addTempAndPerm(
		ruleName2, nil, nil, entryKey3, nilValue,
	)
	if err != nil {
		return data, err
	}
	err = addTempAndPerm(
		ruleName2, nil, nil, entryKey4, emptyValue,
	)
	if err != nil {
		return data, err
	}

	err = addTempAndPerm(
		ruleName2, &allGroup, nil, entryKey2, nilValue,
	)
	if err != nil {
		return data, err
	}
	err = addTempAndPerm(
		ruleName2, &allGroup, nil, entryKey3, nilValue,
	)
	if err != nil {
		return data, err
	}
	err = addTempAndPerm(
		ruleName2, &allGroup, nil, entryKey4, emptyValue,
	)
	if err != nil {
		return data, err
	}

	err = addTempAndPerm(
		ruleName2, &allGroup, &featureName, entryKey2, nilValue,
	)
	if err != nil {
		return data, err
	}
	err = addTempAndPerm(
		ruleName2, &allGroup, &featureName, entryKey3, nilValue,
	)
	if err != nil {
		return data, err
	}
	err = addTempAndPerm(
		ruleName2, &allGroup, &featureName, entryKey4, emptyValue,
	)
	if err != nil {
		return data, err
	}

	return data, nil
}

// insertFirewallKVEntry inserts a single firewall kv entry into BoltDB.
func insertFirewallKVEntry(ctx context.Context,
	firewallStore *firewalldb.BoltDB,
	entry *firewallKVEntryExpectation) error {

	var groupID session.ID
	if entry.groupAlias != nil {
		groupID = *entry.groupAlias
	}

	featureName := ""
	if entry.featureName != nil {
		featureName = *entry.featureName
	}

	kvStores := firewallStore.GetKVStores(
		entry.ruleName, groupID, featureName,
	)

	return kvStores.Update(ctx, func(ctx context.Context,
		tx firewalldb.KVStoreTx) error {

		var store firewalldb.KVStore

		switch {
		case entry.groupAlias == nil && !entry.perm:
			store = tx.GlobalTemp()
		case entry.groupAlias == nil && entry.perm:
			store = tx.Global()
		case entry.groupAlias != nil && !entry.perm:
			store = tx.LocalTemp()
		default:
			store = tx.Local()
		}

		return store.Set(ctx, entry.key, entry.value)
	})
}

// setupFirewallPrivacyMapperMigrationData seeds privacy mapper entries.
func setupFirewallPrivacyMapperMigrationData(ctx context.Context,
	accountStore accounts.Store,
	dbDir string) (firewallPrivacyPairMigrationData, error) {

	data := firewallPrivacyPairMigrationData{
		privPairs: make(map[session.ID]map[string]string),
	}

	dbClock := clock.NewDefaultClock()
	sessionStore, err := session.NewDB(
		dbDir, session.DBFilename, dbClock, accountStore,
	)
	if err != nil {
		return data, err
	}
	defer sessionStore.Close()

	firewallStore, err := firewalldb.NewBoltDB(
		dbDir, firewalldb.DBFilename,
		sessionStore, accountStore, dbClock,
	)
	if err != nil {
		return data, err
	}
	defer firewallStore.Close()

	addPrivacyPairs := func(groupID session.ID, numPairs int) error {
		pairs := make(map[string]string)
		for i := 0; i < numPairs; i++ {
			realKey := fmt.Sprintf("real-%d", i)
			pseudoKey := fmt.Sprintf("pseudo-%d", i)
			err := firewallStore.PrivacyDB(groupID).Update(
				ctx, func(ctx context.Context,
					tx firewalldb.PrivacyMapTx) error {

					return tx.NewPair(
						ctx, realKey, pseudoKey,
					)
				},
			)
			if err != nil {
				return err
			}
			pairs[realKey] = pseudoKey
		}

		data.privPairs[groupID] = pairs
		return nil
	}

	newGroupAlias := func(label string,
		keep bool) (session.ID, error) {

		sess, err := sessionStore.NewSession(
			ctx, label, session.TypeAutopilot,
			time.Unix(1000, 0), "firewall.test",
		)
		if err != nil {
			return session.ID{}, err
		}

		if keep {
			err = sessionStore.ShiftState(
				ctx, sess.ID, session.StateCreated,
			)
			if err != nil {
				return session.ID{}, err
			}
		}

		return sess.GroupID, nil
	}

	// Mimic "one session and privacy pair".
	privGroup, err := newGroupAlias("fw-privacy-one", true)
	if err != nil {
		return data, err
	}
	err = addPrivacyPairs(privGroup, 1)
	if err != nil {
		return data, err
	}

	// Mimic "one session with multiple privacy pair".
	privMulti, err := newGroupAlias("fw-privacy-multi", true)
	if err != nil {
		return data, err
	}
	err = addPrivacyPairs(privMulti, 10)
	if err != nil {
		return data, err
	}

	// Mimic "multiple sessions and privacy pairs".
	for i := 0; i < 5; i++ {
		label := fmt.Sprintf("fw-privacy-many-%d", i)
		privGroup, err = newGroupAlias(label, true)
		if err != nil {
			return data, err
		}
		err = addPrivacyPairs(privGroup, 10)
		if err != nil {
			return data, err
		}
	}

	// Mimic "deleted session with privacy pair".
	deletedPriv, err := newGroupAlias("fw-privacy-deleted", false)
	if err != nil {
		return data, err
	}
	err = firewallStore.PrivacyDB(deletedPriv).Update(
		ctx, func(ctx context.Context,
			tx firewalldb.PrivacyMapTx) error {

			return tx.NewPair(ctx, "real-del", "pseudo-del")
		},
	)
	if err != nil {
		return data, err
	}

	// Mimic "deleted and existing sessions with privacy pairs".
	deletedPriv2, err := newGroupAlias("fw-privacy-del2", false)
	if err != nil {
		return data, err
	}
	err = firewallStore.PrivacyDB(deletedPriv2).Update(
		ctx, func(ctx context.Context,
			tx firewalldb.PrivacyMapTx) error {

			return tx.NewPair(ctx, "real-del2", "pseudo-del2")
		},
	)
	if err != nil {
		return data, err
	}

	existingPriv, err := newGroupAlias("fw-privacy-keep", true)
	if err != nil {
		return data, err
	}
	err = addPrivacyPairs(existingPriv, 1)
	if err != nil {
		return data, err
	}

	err = sessionStore.DeleteReservedSessions(ctx)
	if err != nil {
		return data, err
	}

	return data, nil
}

// setupFirewallActionMigrationData seeds firewalldb actions that are
// validated after sqlite migration.
func setupFirewallActionMigrationData(ctx context.Context, t *harnessTest,
	accountStore *accounts.BoltStore, dbDir string,
	macRootKeyIDs map[[4]byte]uint64) (firewallActionMigrationData, error) {

	var (
		testClock = clock.NewTestClock(time.Now())
		baseTime  = testClock.Now()
		data      = firewallActionMigrationData{
			actions: make([]*firewalldb.Action, 0),
		}
	)

	sessionStore, err := session.NewDB(
		dbDir, session.DBFilename, testClock, accountStore,
	)
	if err != nil {
		return data, err
	}
	defer sessionStore.Close()

	firewallStore, err := firewalldb.NewBoltDB(
		dbDir, firewalldb.DBFilename, sessionStore, accountStore,
		testClock,
	)
	if err != nil {
		return data, err
	}
	defer firewallStore.Close()

	usedSuffixes := make(map[[4]byte]struct{})

	registerSuffix := func(suffix [4]byte) {
		usedSuffixes[suffix] = struct{}{}
	}

	accountSuffix := func(id accounts.AccountID) [4]byte {
		var suffix [4]byte
		copy(suffix[:], id[:4])
		return suffix
	}

	nextUnusedSuffix := func() [4]byte {
		suffix := [4]byte{0xfa, 0xce, 0x00, 0x01}
		for i := 0; i < 255; i++ {
			if _, ok := usedSuffixes[suffix]; !ok {
				registerSuffix(suffix)
				return suffix
			}
			suffix[3]++
		}
		return suffix
	}

	advanceClock := func() time.Time {
		next := testClock.Now().Add(time.Second)
		testClock.SetTime(next)
		return next
	}

	actionRootKey := func(suffix [4]byte) uint64 {
		return resolveMacRootKeyID(suffix, macRootKeyIDs)
	}

	addAction := func(req firewalldb.AddActionReq,
		expectedSession fn.Option[session.ID],
		expectedAccount fn.Option[accounts.AccountID]) error {

		reqForStore := req
		reqForStore.SessionID = fn.None[session.ID]()

		attemptedAt := advanceClock().UTC()
		_, err := firewallStore.AddAction(ctx, &reqForStore)
		if err != nil {
			return err
		}

		action := &firewalldb.Action{
			AddActionReq: req,
			AttemptedAt:  attemptedAt,
			State:        firewalldb.ActionStateInit,
		}
		action.SessionID = expectedSession
		action.AccountID = expectedAccount

		data.actions = append(data.actions, action)

		return nil
	}

	createSession := func(label string, expiry time.Time,
		typ session.Type, opts ...session.Option) (*session.Session,
		error) {

		sess, err := sessionStore.NewSession(
			ctx, label, typ, expiry, mailboxServerAddr, opts...,
		)
		if err != nil {
			return nil, err
		}

		err = sessionStore.ShiftState(
			ctx, sess.ID, session.StateCreated,
		)
		if err != nil {
			return nil, err
		}

		registerSuffix(sess.ID)
		return sess, nil
	}

	createAccount := func(expiry time.Time) (
		*accounts.OffChainBalanceAccount, error) {

		acct, err := accountStore.NewAccount(ctx, 1234, expiry, "")
		if err != nil {
			return nil, err
		}

		registerSuffix(accountSuffix(acct.ID))
		return acct, nil
	}

	createSessionWithAccount := func(label string) (*session.Session,
		*accounts.OffChainBalanceAccount, error) {

		acct, err := createAccount(baseTime.Add(24 * time.Hour))
		if err != nil {
			return nil, nil, err
		}

		accountCaveat := checkers.Condition(
			macaroons.CondLndCustom,
			fmt.Sprintf("%s %x", accounts.CondAccount, acct.ID[:]),
		)

		caveats := []macaroon.Caveat{
			{
				Id: []byte(accountCaveat),
			},
		}

		sess, err := createSession(
			label, baseTime.Add(24*time.Hour),
			session.TypeMacaroonAccount,
			session.WithAccount(acct.ID),
			session.WithMacaroonRecipe(caveats, nil),
		)
		if err != nil {
			return nil, nil, err
		}

		return sess, acct, nil
	}

	// Mimic "action with no session or account".
	req := actionTestRequest()
	suffix := nextUnusedSuffix()
	req.MacaroonRootKeyID = fn.Some(actionRootKey(suffix))
	req.SessionID = fn.None[session.ID]()
	req.AccountID = fn.None[accounts.AccountID]()
	err = addAction(
		req, fn.None[session.ID](), fn.None[accounts.AccountID](),
	)
	if err != nil {
		return data, err
	}

	// Mimic "action with session but no account".
	sess, err := createSession(
		"action-session", baseTime.Add(24*time.Hour),
		session.TypeMacaroonAdmin,
	)
	if err != nil {
		return data, err
	}
	req = actionTestRequest()
	req.MacaroonRootKeyID = fn.Some(actionRootKey(sess.ID))
	req.SessionID = fn.Some(sess.ID)
	req.AccountID = fn.None[accounts.AccountID]()
	err = addAction(req, fn.Some(sess.ID), fn.None[accounts.AccountID]())
	if err != nil {
		return data, err
	}

	// Mimic "action with filtered session".
	expiredSess, err := createSession(
		"action-expired-session", baseTime.Add(-time.Hour),
		session.TypeMacaroonAdmin,
	)
	if err != nil {
		return data, err
	}
	req = actionTestRequest()
	req.MacaroonRootKeyID = fn.Some(actionRootKey(expiredSess.ID))
	req.SessionID = fn.None[session.ID]()
	req.AccountID = fn.None[accounts.AccountID]()
	err = addAction(
		req, fn.None[session.ID](), fn.None[accounts.AccountID](),
	)
	if err != nil {
		return data, err
	}

	revokedSess, err := createSession(
		"action-revoked-session", baseTime.Add(24*time.Hour),
		session.TypeMacaroonAdmin,
	)
	if err != nil {
		return data, err
	}
	err = sessionStore.ShiftState(
		ctx, revokedSess.ID, session.StateRevoked,
	)
	if err != nil {
		return data, err
	}
	req = actionTestRequest()
	req.MacaroonRootKeyID = fn.Some(actionRootKey(revokedSess.ID))
	req.SessionID = fn.None[session.ID]()
	req.AccountID = fn.None[accounts.AccountID]()
	err = addAction(
		req, fn.None[session.ID](), fn.None[accounts.AccountID](),
	)
	if err != nil {
		return data, err
	}

	// Mimic "action with session with linked account".
	linkedSess, linkedAcct, err := createSessionWithAccount(
		"action-linked-session",
	)
	if err != nil {
		return data, err
	}
	req = actionTestRequest()
	req.MacaroonRootKeyID = fn.Some(actionRootKey(linkedSess.ID))
	req.SessionID = fn.Some(linkedSess.ID)
	req.AccountID = fn.Some(linkedAcct.ID)
	err = addAction(
		req, fn.Some(linkedSess.ID), fn.Some(linkedAcct.ID),
	)
	if err != nil {
		return data, err
	}

	// Mimic "action with account".
	acct, err := createAccount(baseTime.Add(24 * time.Hour))
	if err != nil {
		return data, err
	}
	req = actionTestRequest()
	req.MacaroonRootKeyID = fn.Some(actionRootKey(accountSuffix(acct.ID)))
	req.SessionID = fn.None[session.ID]()
	req.AccountID = fn.Some(acct.ID)
	err = addAction(req, fn.None[session.ID](), fn.Some(acct.ID))
	if err != nil {
		return data, err
	}

	// Mimic "actions with filtered account".
	expiredAcct, err := createAccount(baseTime.Add(-time.Hour))
	if err != nil {
		return data, err
	}
	req = actionTestRequest()
	req.MacaroonRootKeyID = fn.Some(
		actionRootKey(accountSuffix(expiredAcct.ID)),
	)
	req.SessionID = fn.None[session.ID]()
	req.AccountID = fn.None[accounts.AccountID]()
	err = addAction(
		req, fn.None[session.ID](), fn.None[accounts.AccountID](),
	)
	if err != nil {
		return data, err
	}

	activeAcct, err := createAccount(baseTime.Add(24 * time.Hour))
	if err != nil {
		return data, err
	}
	req = actionTestRequest()
	req.ActorName = actionTestActorName
	req.MacaroonRootKeyID = fn.Some(
		actionRootKey(accountSuffix(activeAcct.ID)),
	)
	req.SessionID = fn.None[session.ID]()
	req.AccountID = fn.None[accounts.AccountID]()
	err = addAction(
		req, fn.None[session.ID](), fn.None[accounts.AccountID](),
	)
	if err != nil {
		return data, err
	}

	sendAcct, err := createAccount(baseTime.Add(24 * time.Hour))
	if err != nil {
		return data, err
	}
	req = actionTestRequest()
	req.RPCMethod = "/routerrpc.Router/SendPaymentV2"
	req.MacaroonRootKeyID = fn.Some(
		actionRootKey(accountSuffix(sendAcct.ID)),
	)
	req.SessionID = fn.None[session.ID]()
	req.AccountID = fn.None[accounts.AccountID]()
	err = addAction(
		req, fn.None[session.ID](), fn.None[accounts.AccountID](),
	)
	if err != nil {
		return data, err
	}

	invoiceAcct, err := createAccount(baseTime.Add(24 * time.Hour))
	if err != nil {
		return data, err
	}
	req = actionTestRequest()
	req.RPCMethod = "/lnrpc.Lightning/AddInvoice"
	req.MacaroonRootKeyID = fn.Some(
		actionRootKey(accountSuffix(invoiceAcct.ID)),
	)
	req.SessionID = fn.None[session.ID]()
	req.AccountID = fn.None[accounts.AccountID]()
	err = addAction(
		req, fn.None[session.ID](), fn.None[accounts.AccountID](),
	)
	if err != nil {
		return data, err
	}

	// Mimic "action with multiple accounts".
	multiAcct1, err := createAccount(baseTime.Add(48 * time.Hour))
	if err != nil {
		return data, err
	}
	multiAcct2, err := createAccount(baseTime.Add(24 * time.Hour))
	if err != nil {
		return data, err
	}
	newAcct2ID, err := updateAccountIDForTest(
		accountStore.DB, multiAcct2.ID, multiAcct1.ID,
	)
	if err != nil {
		return data, err
	}
	multiAcct2.ID = newAcct2ID

	req = actionTestRequest()
	req.MacaroonRootKeyID = fn.Some(
		actionRootKey(accountSuffix(multiAcct1.ID)),
	)
	req.SessionID = fn.None[session.ID]()
	req.AccountID = fn.Some(multiAcct2.ID)
	err = addAction(
		req, fn.None[session.ID](), fn.Some(multiAcct2.ID),
	)
	if err != nil {
		return data, err
	}

	// Mimic "action with session and account".
	sessCollide, err := createSession(
		"action-session-collide", baseTime.Add(24*time.Hour),
		session.TypeMacaroonAdmin,
	)
	if err != nil {
		return data, err
	}
	accountCollide, err := createAccount(baseTime.Add(24 * time.Hour))
	if err != nil {
		return data, err
	}
	var prefixID accounts.AccountID
	prefixID = accounts.AccountID{}
	copy(prefixID[:4], sessCollide.ID[:])
	newAcctID, err := updateAccountIDForTest(
		accountStore.DB, accountCollide.ID, prefixID,
	)
	if err != nil {
		return data, err
	}
	accountCollide.ID = newAcctID
	registerSuffix(accountSuffix(accountCollide.ID))

	req = actionTestRequest()
	req.MacaroonRootKeyID = fn.Some(actionRootKey(sessCollide.ID))
	req.SessionID = fn.Some(sessCollide.ID)
	req.AccountID = fn.None[accounts.AccountID]()
	err = addAction(
		req, fn.Some(sessCollide.ID),
		fn.None[accounts.AccountID](),
	)
	if err != nil {
		return data, err
	}

	// Mimic "action with session with linked account and account".
	collideSess, linkedAcct2, err := createSessionWithAccount(
		"action-linked-collide",
	)
	if err != nil {
		return data, err
	}
	otherAcct, err := createAccount(baseTime.Add(24 * time.Hour))
	if err != nil {
		return data, err
	}
	prefixID = accounts.AccountID{}
	copy(prefixID[:4], collideSess.ID[:])
	newOtherID, err := updateAccountIDForTest(
		accountStore.DB, otherAcct.ID, prefixID,
	)
	if err != nil {
		return data, err
	}
	otherAcct.ID = newOtherID

	req = actionTestRequest()
	req.MacaroonRootKeyID = fn.Some(actionRootKey(collideSess.ID))
	req.SessionID = fn.Some(collideSess.ID)
	req.AccountID = fn.Some(linkedAcct2.ID)
	err = addAction(
		req, fn.Some(collideSess.ID), fn.Some(linkedAcct2.ID),
	)
	if err != nil {
		return data, err
	}

	return data, nil
}

// actionTestRequest returns the baseline action request for migration tests.
func actionTestRequest() firewalldb.AddActionReq {
	return firewalldb.AddActionReq{
		ActorName:          "",
		FeatureName:        actionTestFeatureName,
		Trigger:            actionTestTrigger,
		Intent:             actionTestIntent,
		StructuredJsonData: actionTestJSON,
		RPCMethod:          actionTestRPCMethod,
		RPCParamsJson:      []byte(actionTestRPCParams),
	}
}

// assertMigrationDataInBBoltDB validates bbolt data before migration.
func assertMigrationDataInBBoltDB(ctx context.Context,
	accountStore *accounts.BoltStore, dbDir string,
	accountsData accountMigrationData, sessionData sessionMigrationData,
	firewallData firewallMigrationData) error {

	err := assertAccountsMigrationDataBolt(ctx, accountStore, accountsData)
	if err != nil {
		return err
	}

	err = assertSessionMigrationDataBolt(
		ctx, accountStore, dbDir, sessionData,
	)
	if err != nil {
		return err
	}

	err = assertFirewallKVMigrationDataBolt(
		ctx, accountStore, dbDir, firewallData,
	)
	if err != nil {
		return err
	}

	err = assertFirewallPrivacyMapperMigrationDataBolt(
		ctx, accountStore, dbDir, firewallData,
	)
	if err != nil {
		return err
	}

	return assertFirewallActionMigrationDataBolt(
		ctx, accountStore, dbDir, firewallData,
	)
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

// assertSessionMigrationDataBolt checks session data in the bbolt store
// before triggering the sqlite migration.
func assertSessionMigrationDataBolt(ctx context.Context,
	accountStore accounts.Store, dbDir string,
	data sessionMigrationData) error {

	dbClock := clock.NewDefaultClock()
	sessionStore, err := session.NewDB(
		dbDir, session.DBFilename, dbClock, accountStore,
	)
	if err != nil {
		return err
	}
	defer sessionStore.Close()

	sessions, err := sessionStore.ListAllSessions(ctx)
	if err != nil {
		return err
	}

	// Note that other migration tests for may add sessions, and therefore
	// we only check that the session store contains at least the expected
	// amount, and not the exact amount.
	if len(sessions) < len(data.expectations) {
		return fmt.Errorf(
			"expected at least %d sessions, got %d",
			len(data.expectations), len(sessions),
		)
	}

	sessionsByLabel := make(map[string]*session.Session)
	for _, sess := range sessions {
		sessionsByLabel[sess.Label] = sess
	}

	for label, expected := range data.expectations {
		sess, ok := sessionsByLabel[label]
		if !ok {
			return fmt.Errorf("session %s not found", label)
		}

		actual := buildSessionExpectation(sess)
		err := normalizeRemovedAccountExpectation(
			ctx, accountStore, expected, &actual,
		)
		if err != nil {
			return err
		}

		if err := compareSessionExpectation(
			label, expected, actual,
		); err != nil {
			return err
		}
	}

	return nil
}

// assertFirewallKVMigrationDataBolt checks firewall kv entries in bbolt.
func assertFirewallKVMigrationDataBolt(ctx context.Context,
	accountStore accounts.Store, dbDir string,
	data firewallMigrationData) error {

	dbClock := clock.NewDefaultClock()
	sessionStore, err := session.NewDB(
		dbDir, session.DBFilename, dbClock, accountStore,
	)
	if err != nil {
		return err
	}
	defer sessionStore.Close()

	firewallStore, err := firewalldb.NewBoltDB(
		dbDir, firewalldb.DBFilename, sessionStore,
		accountStore, dbClock,
	)
	if err != nil {
		return err
	}
	defer firewallStore.Close()

	for _, entry := range data.entries {
		err := assertFirewallKVEntryBolt(
			ctx, firewallStore, entry,
		)
		if err != nil {
			return err
		}
	}

	return nil
}

// assertFirewallKVEntryBolt verifies a single kv entry in bbolt.
func assertFirewallKVEntryBolt(ctx context.Context,
	firewallStore *firewalldb.BoltDB,
	entry *firewallKVEntryExpectation) error {

	var groupID session.ID
	if entry.groupAlias != nil {
		groupID = *entry.groupAlias
	}

	featureName := ""
	if entry.featureName != nil {
		featureName = *entry.featureName
	}

	kvStores := firewallStore.GetKVStores(
		entry.ruleName, groupID, featureName,
	)

	return kvStores.View(ctx, func(ctx context.Context,
		tx firewalldb.KVStoreTx) error {

		var store firewalldb.KVStore

		switch {
		case entry.groupAlias == nil && !entry.perm:
			store = tx.GlobalTemp()
		case entry.groupAlias == nil && entry.perm:
			store = tx.Global()
		case entry.groupAlias != nil && !entry.perm:
			store = tx.LocalTemp()
		default:
			store = tx.Local()
		}

		value, err := store.Get(ctx, entry.key)
		if err != nil {
			return err
		}

		if !bytes.Equal(value, entry.value) {
			return fmt.Errorf(
				"kv entry %s value mismatch", entry.key,
			)
		}

		return nil
	})
}

// assertFirewallPrivacyMapperMigrationDataBolt checks privacy pairs in bbolt.
func assertFirewallPrivacyMapperMigrationDataBolt(ctx context.Context,
	accountStore accounts.Store, dbDir string,
	data firewallMigrationData) error {

	dbClock := clock.NewDefaultClock()
	sessionStore, err := session.NewDB(
		dbDir, session.DBFilename, dbClock, accountStore,
	)
	if err != nil {
		return err
	}
	defer sessionStore.Close()

	firewallStore, err := firewalldb.NewBoltDB(
		dbDir, firewalldb.DBFilename, sessionStore,
		accountStore, dbClock,
	)
	if err != nil {
		return err
	}
	defer firewallStore.Close()

	for groupID, pairs := range data.privPairs {
		err := assertFirewallPrivacyPairsBolt(
			ctx, firewallStore, groupID, pairs,
		)
		if err != nil {
			return err
		}
	}

	return nil
}

// assertFirewallPrivacyPairsBolt checks privacy pairs for a group ID.
func assertFirewallPrivacyPairsBolt(ctx context.Context,
	firewallStore *firewalldb.BoltDB, groupID session.ID,
	expected map[string]string) error {

	return firewallStore.PrivacyDB(groupID).View(
		ctx, func(ctx context.Context,
			tx firewalldb.PrivacyMapTx) error {

			pairs, err := tx.FetchAllPairs(ctx)
			if err != nil {
				return err
			}
			if pairs == nil {
				return fmt.Errorf("privacy pairs not found")
			}

			for real, pseudo := range expected {
				got, ok := pairs.GetPseudo(real)
				if !ok {
					return fmt.Errorf(
						"privacy pair missing for %s",
						real,
					)
				}
				if got != pseudo {
					return fmt.Errorf(
						"privacy pair mismatch for %s",
						real,
					)
				}
			}

			return nil
		},
	)
}

// assertFirewallActionMigrationDataBolt checks action rows in bbolt.
func assertFirewallActionMigrationDataBolt(ctx context.Context,
	accountStore accounts.Store, dbDir string,
	data firewallMigrationData) error {

	dbClock := clock.NewDefaultClock()
	sessionStore, err := session.NewDB(
		dbDir, session.DBFilename, dbClock, accountStore,
	)
	if err != nil {
		return err
	}
	defer sessionStore.Close()

	firewallStore, err := firewalldb.NewBoltDB(
		dbDir, firewalldb.DBFilename, sessionStore,
		accountStore, dbClock,
	)
	if err != nil {
		return err
	}
	defer firewallStore.Close()

	actions, _, _, err := firewallStore.ListActions(
		ctx, nil,
		firewalldb.WithActionFeatureName(actionTestFeatureName),
	)
	if err != nil {
		return err
	}
	if len(actions) != len(data.actions) {
		return fmt.Errorf(
			"expected %d actions, got %d",
			len(data.actions), len(actions),
		)
	}

	for i, action := range actions {
		if err := compareBoltActions(
			data.actions[i], action,
		); err != nil {
			return fmt.Errorf("action %d: %w", i, err)
		}
	}

	return nil
}

// compareBoltActions checks action fields persisted in bbolt.
func compareBoltActions(expected *firewalldb.Action,
	actual *firewalldb.Action) error {

	if expected == nil || actual == nil {
		return fmt.Errorf("action cannot be nil")
	}

	expectedAttempted := expected.AttemptedAt
	actualAttempted := actual.AttemptedAt

	exp := *expected
	got := *actual

	exp.AttemptedAt = time.Time{}
	got.AttemptedAt = time.Time{}
	exp.AccountID = fn.None[accounts.AccountID]()
	got.AccountID = fn.None[accounts.AccountID]()
	exp.SessionID = fn.None[session.ID]()
	got.SessionID = fn.None[session.ID]()
	exp.MacaroonRootKeyID = normalizeMacRootKeyID(
		exp.MacaroonRootKeyID,
	)
	got.MacaroonRootKeyID = normalizeMacRootKeyID(
		got.MacaroonRootKeyID,
	)

	if !reflect.DeepEqual(exp, got) {
		return fmt.Errorf("action mismatch")
	}

	if expectedAttempted.Unix() != actualAttempted.Unix() {
		return fmt.Errorf("action attempted-at mismatch")
	}

	return nil
}

// normalizeMacRootKeyID matches kvdb's truncated root key storage.
func normalizeMacRootKeyID(id fn.Option[uint64]) fn.Option[uint64] {
	normalized := id
	id.WhenSome(func(rootID uint64) {
		sessID := session.IDFromMacRootKeyID(rootID)
		normalized = fn.Some(
			uint64(binary.BigEndian.Uint32(sessID[:])),
		)
	})

	return normalized
}

// assertMigrationDataViaLitCLI checks migration data using litcli commands.
func assertMigrationDataViaLitCLI(ctx context.Context, t *harnessTest,
	node *HarnessNode, accountsData accountMigrationData,
	sessionData sessionMigrationData, firewallData firewallMigrationData) {

	listResp, err := listAccountsViaLitCLI(ctx, node)
	require.NoError(t.t, err)
	assertAccountMigrationDataFromList(t, listResp, accountsData)

	sessionsResp, err := listSessionsViaLitCLI(ctx, node)
	require.NoError(t.t, err)
	assertSessionMigrationDataFromList(t, sessionsResp, sessionData)

	assertPrivacyPairsViaLitCLI(ctx, t, node, firewallData)

	actionsResp, err := listActionsViaLitCLI(
		ctx, node, len(firewallData.actions),
	)
	require.NoError(t.t, err)
	assertActionMigrationDataFromList(
		t, actionsResp, firewallData,
	)
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

// listSessionsViaLitCLI runs `litcli sessions list all` and parses output
// into an RPC response.
func listSessionsViaLitCLI(ctx context.Context, node *HarnessNode) (
	*litrpc.ListSessionsResponse, error) {

	litcliPath, err := exec.LookPath("litcli")
	if err != nil {
		return nil, fmt.Errorf("litcli not found in PATH")
	}

	cmd := exec.CommandContext(
		ctx, litcliPath, "sessions", "list", "all",
	)
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
			"litcli sessions list all failed: %w: %s",
			err, strings.TrimSpace(string(output)),
		)
	}

	raw := strings.TrimSpace(string(output))
	if raw == "" {
		return nil, fmt.Errorf("litcli sessions list returned no data")
	}

	var resp litrpc.ListSessionsResponse
	err = lnrpc.ProtoJSONUnmarshalOpts.Unmarshal(
		[]byte(raw), &resp,
	)
	if err != nil {
		return nil, err
	}

	return &resp, nil
}

// listActionsViaLitCLI runs `litcli actions` and parses the response.
func listActionsViaLitCLI(ctx context.Context, node *HarnessNode,
	maxActions int) (*litrpc.ListActionsResponse, error) {

	litcliPath, err := exec.LookPath("litcli")
	if err != nil {
		return nil, fmt.Errorf("litcli not found in PATH")
	}

	args := []string{
		"actions",
		fmt.Sprintf("--feature=%s", actionTestFeatureName),
		"--oldest_first",
	}
	if maxActions > 0 {
		args = append(
			args, fmt.Sprintf("--max_num_actions=%d", maxActions),
		)
	}

	cmd := exec.CommandContext(ctx, litcliPath, args...)
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
			"litcli actions failed: %w: %s",
			err, strings.TrimSpace(string(output)),
		)
	}

	raw := strings.TrimSpace(string(output))
	if raw == "" {
		return nil, fmt.Errorf("litcli actions returned no data")
	}

	var resp litrpc.ListActionsResponse
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

// assertSessionMigrationDataFromList checks session data from a list response.
func assertSessionMigrationDataFromList(t *harnessTest,
	resp *litrpc.ListSessionsResponse,
	data sessionMigrationData) {

	require.NotNil(t.t, resp)
	require.GreaterOrEqual(
		t.t, len(resp.Sessions), len(data.expectations),
	)
	sessionsByLabel := make(map[string]*litrpc.Session)
	for _, sess := range resp.Sessions {
		sessionsByLabel[sess.Label] = sess
	}

	for label, expected := range data.expectations {
		sess, ok := sessionsByLabel[label]
		require.Truef(t.t, ok, "session %s not found", label)

		// If the account was removed after session creation, the RPC list
		// still reports the account ID. Match that behavior by aligning
		// the expected value before asserting.
		expected = normalizeRemovedAccountExpectationList(
			t, sess, expected,
		)

		require.Equal(t.t, expected.sessionType, sess.SessionType)
		require.Equal(t.t, expected.devServer, sess.DevServer)
		require.Equal(t.t, expected.privacyFlags, sess.PrivacyFlags)
		require.Equal(t.t, expected.accountID, sess.AccountId)
		require.Equal(t.t, expected.groupID, sess.GroupId)

		assertFeatureConfigs(
			t, sess.FeatureConfigs, expected.featureConfigs,
		)
		assertMacaroonRecipe(
			t, sess.MacaroonRecipe, expected.macaroonRecipe,
		)
	}
}

// assertFeatureConfigs checks that expected feature configs are preserved.
func assertFeatureConfigs(t *harnessTest,
	actual map[string]string, expected map[string]string) {

	if len(expected) == 0 {
		require.Len(t.t, actual, 0)
		return
	}

	require.Len(t.t, actual, len(expected))
	for name, expectedValue := range expected {
		actualValue, ok := actual[name]
		require.Truef(t.t, ok, "feature config %s missing", name)
		require.Equal(t.t, expectedValue, actualValue)
	}
}

// assertMacaroonRecipe checks that migrated macaroon recipe fields are kept.
func assertMacaroonRecipe(t *harnessTest, actual *litrpc.MacaroonRecipe,
	expected *macaroonRecipeExpectation) {

	if expected == nil {
		if actual == nil {
			return
		}

		require.Empty(t.t, actual.Permissions)
		require.Empty(t.t, actual.Caveats)
		return
	}

	if len(expected.perms) == 0 && len(expected.caveats) == 0 {
		if actual == nil {
			return
		}

		require.Empty(t.t, actual.Permissions)
		require.Empty(t.t, actual.Caveats)
		return
	}

	require.NotNil(t.t, actual)
	require.Equal(
		t.t, len(expected.caveats), len(actual.Caveats),
	)
	require.Equal(
		t.t, len(expected.perms), len(actual.Permissions),
	)

	expectedCaveats := append([]string{}, expected.caveats...)
	actualCaveats := append([]string{}, actual.Caveats...)
	sort.Strings(expectedCaveats)
	sort.Strings(actualCaveats)
	require.Equal(t.t, expectedCaveats, actualCaveats)

	expectedPerms := make([]macaroonPermExpectation, len(expected.perms))
	copy(expectedPerms, expected.perms)
	sort.Slice(expectedPerms, func(i, j int) bool {
		if expectedPerms[i].entity == expectedPerms[j].entity {
			return expectedPerms[i].action < expectedPerms[j].action
		}

		return expectedPerms[i].entity < expectedPerms[j].entity
	})

	actualPerms := make([]macaroonPermExpectation, len(actual.Permissions))
	for i, perm := range actual.Permissions {
		actualPerms[i] = macaroonPermExpectation{
			entity: perm.Entity,
			action: perm.Action,
		}
	}
	sort.Slice(actualPerms, func(i, j int) bool {
		if actualPerms[i].entity == actualPerms[j].entity {
			return actualPerms[i].action < actualPerms[j].action
		}

		return actualPerms[i].entity < actualPerms[j].entity
	})

	require.Equal(t.t, expectedPerms, actualPerms)
}

// assertPrivacyPairsViaLitCLI validates privacy pairs via litcli.
func assertPrivacyPairsViaLitCLI(ctx context.Context, t *harnessTest,
	node *HarnessNode, data firewallMigrationData) {

	for groupID, pairs := range data.privPairs {
		for real, pseudo := range pairs {
			gotPseudo, err := privacyMapStrViaLitCLI(
				ctx, node, groupID, true, real,
			)
			require.NoError(t.t, err)
			require.Equal(t.t, pseudo, gotPseudo)

			gotReal, err := privacyMapStrViaLitCLI(
				ctx, node, groupID, false, pseudo,
			)
			require.NoError(t.t, err)
			require.Equal(t.t, real, gotReal)
		}
	}
}

// privacyMapStrViaLitCLI runs litcli privacy string conversions.
func privacyMapStrViaLitCLI(ctx context.Context, node *HarnessNode,
	groupID session.ID, realToPseudo bool, input string) (string, error) {

	litcliPath, err := exec.LookPath("litcli")
	if err != nil {
		return "", fmt.Errorf("litcli not found in PATH")
	}

	groupHex := hex.EncodeToString(groupID[:])
	args := []string{
		"privacy",
		fmt.Sprintf("--group_id=%s", groupHex),
	}
	if realToPseudo {
		args = append(args, "--realtopseudo")
	}
	args = append(args, "str", fmt.Sprintf("--input=%s", input))

	cmd := exec.CommandContext(ctx, litcliPath, args...)
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
		return "", fmt.Errorf(
			"litcli privacy str failed: %w: %s",
			err, strings.TrimSpace(string(output)),
		)
	}

	raw := strings.TrimSpace(string(output))
	if raw == "" {
		return "", fmt.Errorf("litcli privacy str returned no data")
	}

	var resp litrpc.PrivacyMapConversionResponse
	err = lnrpc.ProtoJSONUnmarshalOpts.Unmarshal(
		[]byte(raw), &resp,
	)
	if err != nil {
		return "", err
	}

	return resp.Output, nil
}

// assertActionMigrationDataFromList checks actions from a list response.
func assertActionMigrationDataFromList(t *harnessTest,
	resp *litrpc.ListActionsResponse,
	data firewallMigrationData) {

	require.NotNil(t.t, resp)
	require.Len(t.t, resp.Actions, len(data.actions))

	for i, action := range resp.Actions {
		err := compareActionWithRPC(data.actions[i], action)
		require.NoErrorf(t.t, err, "action %d mismatch", i)
	}
}

// compareActionWithRPC compares expected actions with the RPC response.
func compareActionWithRPC(expected *firewalldb.Action,
	actual *litrpc.Action) error {

	if expected == nil || actual == nil {
		return fmt.Errorf("action cannot be nil")
	}

	if expected.ActorName != actual.ActorName {
		return fmt.Errorf("actor name mismatch")
	}

	if expected.FeatureName != actual.FeatureName {
		return fmt.Errorf("feature name mismatch")
	}

	if expected.Trigger != actual.Trigger {
		return fmt.Errorf("trigger mismatch")
	}

	if expected.Intent != actual.Intent {
		return fmt.Errorf("intent mismatch")
	}

	if expected.StructuredJsonData != actual.StructuredJsonData {
		return fmt.Errorf("structured json mismatch")
	}

	if expected.RPCMethod != actual.RpcMethod {
		return fmt.Errorf("rpc method mismatch")
	}

	if string(expected.RPCParamsJson) != actual.RpcParamsJson {
		return fmt.Errorf("rpc params mismatch")
	}

	expectedState := actionStateToRPC(expected.State)
	if expectedState != actual.State {
		return fmt.Errorf("state mismatch")
	}

	if expected.ErrorReason != actual.ErrorReason {
		return fmt.Errorf("error reason mismatch")
	}

	if expected.AttemptedAt.Unix() != int64(actual.Timestamp) {
		return fmt.Errorf("timestamp mismatch")
	}

	err := compareMacaroonIdentifier(
		expected.MacaroonRootKeyID, actual.MacaroonIdentifier,
	)
	if err != nil {
		return err
	}

	return nil
}

// actionStateToRPC maps firewall action state to the RPC enum.
func actionStateToRPC(state firewalldb.ActionState) litrpc.ActionState {
	switch state {
	case firewalldb.ActionStateInit:
		return litrpc.ActionState_STATE_PENDING
	case firewalldb.ActionStateDone:
		return litrpc.ActionState_STATE_DONE
	case firewalldb.ActionStateError:
		return litrpc.ActionState_STATE_ERROR
	default:
		return litrpc.ActionState_STATE_UNKNOWN
	}
}

// compareMacaroonIdentifier matches RPC macaroon identifiers to expected IDs.
func compareMacaroonIdentifier(expected fn.Option[uint64],
	actual []byte) error {

	if expected.IsSome() {
		rootID := expected.UnwrapOr(0)
		sessID := session.IDFromMacRootKeyID(rootID)
		if !bytes.Equal(sessID[:], actual) {
			return fmt.Errorf("macaroon identifier mismatch")
		}
		return nil
	}

	if len(actual) == 0 {
		return nil
	}

	zero := make([]byte, 4)
	if bytes.Equal(actual, zero) {
		return nil
	}

	return fmt.Errorf("unexpected macaroon identifier")
}

// assertMigrationDataSQL connects to the SQL DB to assert the migration
// results.
func assertMigrationDataSQL(ctx context.Context, t *harnessTest,
	node *HarnessNode, accountsData accountMigrationData,
	sessionData sessionMigrationData, firewallData firewallMigrationData) {

	assertAccountMigrationDataSQL(ctx, t, node, accountsData)
	assertSessionMigrationDataSQL(ctx, t, node, sessionData)
	assertFirewallMigrationDataSQL(ctx, t, node, firewallData)
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

// assertSessionMigrationDataSQL connects to the SQL DB and queries sessions
// to assert migration results.
func assertSessionMigrationDataSQL(ctx context.Context, t *harnessTest,
	node *HarnessNode, data sessionMigrationData) {

	dbPath := filepath.Join(
		node.Cfg.LitDir,
		node.Cfg.NetParams.Name,
		"litd.db",
	)

	sqlStore, err := sqldb.NewSqliteStore(
		&sqldb.SqliteConfig{
			SkipMigrations:        true,
			SkipMigrationDbBackup: true,
		}, dbPath,
	)
	require.NoError(t.t, err)
	defer sqlStore.BaseDB.Close()

	queries := sqlcmig6.NewForType(
		sqlStore.BaseDB, sqlStore.BackendType,
	)

	sessions, err := queries.ListSessions(ctx)
	require.NoError(t.t, err)
	require.GreaterOrEqual(
		t.t, len(sessions), len(data.expectations),
	)

	sessionsByLabel := make(map[string]sqlcmig6.Session)
	for _, sess := range sessions {
		sessionsByLabel[sess.Label] = sess
	}

	for label, expected := range data.expectations {
		dbSess, ok := sessionsByLabel[label]
		require.Truef(t.t, ok, "session %s not found", label)

		actual, err := buildSessionExpectationFromSQL(
			ctx, queries, dbSess,
		)
		require.NoError(t.t, err)

		err = compareSessionExpectation(label, expected, actual)
		require.NoError(t.t, err)
	}
}

// assertFirewallMigrationDataSQL connects to the SQL DB via helpers that
// query firewall data to assert migration results.
func assertFirewallMigrationDataSQL(ctx context.Context, t *harnessTest,
	node *HarnessNode, data firewallMigrationData) {

	assertFirewallKVMigrationDataSQL(ctx, t, node, data)
	assertFirewallPrivacyMapperMigrationDataSQL(ctx, t, node, data)
	assertFirewallActionMigrationDataSQL(ctx, t, node, data)
}

// assertFirewallKVMigrationDataSQL connects to the SQL DB and queries KV
// entries to assert migration results.
func assertFirewallKVMigrationDataSQL(ctx context.Context, t *harnessTest,
	node *HarnessNode, data firewallMigrationData) {

	dbPath := filepath.Join(
		node.Cfg.LitDir,
		node.Cfg.NetParams.Name,
		"litd.db",
	)

	sqlStore, err := sqldb.NewSqliteStore(
		&sqldb.SqliteConfig{
			SkipMigrations:        true,
			SkipMigrationDbBackup: true,
		}, dbPath,
	)
	require.NoError(t.t, err)
	defer sqlStore.BaseDB.Close()

	queries := sqlcmig6.NewForType(
		sqlStore.BaseDB, sqlStore.BackendType,
	)

	ruleIDs := make(map[string]int64)
	featureIDs := make(map[string]int64)
	groupIDs := make(map[[4]byte]int64)

	getRuleID := func(ruleName string) int64 {
		id, ok := ruleIDs[ruleName]
		if ok {
			return id
		}

		ruleID, err := queries.GetRuleID(ctx, ruleName)
		require.NoError(t.t, err)
		ruleIDs[ruleName] = ruleID

		return ruleID
	}

	getGroupID := func(alias session.ID) int64 {
		id, ok := groupIDs[alias]
		if ok {
			return id
		}

		groupID, err := queries.GetSessionIDByAlias(ctx, alias[:])
		require.NoError(t.t, err)
		groupIDs[alias] = groupID

		return groupID
	}

	getFeatureID := func(name string) int64 {
		id, ok := featureIDs[name]
		if ok {
			return id
		}

		featureID, err := queries.GetFeatureID(ctx, name)
		require.NoError(t.t, err)
		featureIDs[name] = featureID

		return featureID
	}

	for _, entry := range data.entries {
		ruleID := getRuleID(entry.ruleName)

		switch {
		case entry.groupAlias == nil:
			val, err := queries.GetGlobalKVStoreRecord(
				ctx, sqlcmig6.GetGlobalKVStoreRecordParams{
					Key:    entry.key,
					Perm:   entry.perm,
					RuleID: ruleID,
				},
			)
			require.NoError(t.t, err)
			require.True(
				t.t, bytes.Equal(entry.value, val),
			)

		case entry.featureName == nil:
			groupID := getGroupID(*entry.groupAlias)
			val, err := queries.GetGroupKVStoreRecord(
				ctx, sqlcmig6.GetGroupKVStoreRecordParams{
					Key:    entry.key,
					Perm:   entry.perm,
					RuleID: ruleID,
					GroupID: sql.NullInt64{
						Int64: groupID,
						Valid: true,
					},
				},
			)
			require.NoError(t.t, err)
			require.True(
				t.t, bytes.Equal(entry.value, val),
			)

		default:
			groupID := getGroupID(*entry.groupAlias)
			featureID := getFeatureID(*entry.featureName)
			val, err := queries.GetFeatureKVStoreRecord(
				ctx, sqlcmig6.GetFeatureKVStoreRecordParams{
					Key:    entry.key,
					Perm:   entry.perm,
					RuleID: ruleID,
					GroupID: sql.NullInt64{
						Int64: groupID,
						Valid: true,
					},
					FeatureID: sql.NullInt64{
						Int64: featureID,
						Valid: true,
					},
				},
			)
			require.NoError(t.t, err)
			require.True(
				t.t, bytes.Equal(entry.value, val),
			)
		}
	}
}

// assertFirewallPrivacyMapperMigrationDataSQL connects to the SQL DB and
// queries privacy pairs to assert migration results.
func assertFirewallPrivacyMapperMigrationDataSQL(ctx context.Context,
	t *harnessTest, node *HarnessNode, data firewallMigrationData) {

	dbPath := filepath.Join(
		node.Cfg.LitDir,
		node.Cfg.NetParams.Name,
		"litd.db",
	)

	sqlStore, err := sqldb.NewSqliteStore(
		&sqldb.SqliteConfig{
			SkipMigrations:        true,
			SkipMigrationDbBackup: true,
		}, dbPath,
	)
	require.NoError(t.t, err)
	defer sqlStore.BaseDB.Close()

	queries := sqlcmig6.NewForType(
		sqlStore.BaseDB, sqlStore.BackendType,
	)

	groupIDs := make(map[[4]byte]int64)

	getGroupID := func(alias session.ID) int64 {
		id, ok := groupIDs[alias]
		if ok {
			return id
		}

		groupID, err := queries.GetSessionIDByAlias(ctx, alias[:])
		require.NoError(t.t, err)
		groupIDs[alias] = groupID

		return groupID
	}

	var totalExpected, totalFound int
	for groupAlias, pairs := range data.privPairs {
		groupID := getGroupID(groupAlias)
		storePairs, err := queries.GetAllPrivacyPairs(
			ctx, groupID,
		)
		require.NoError(t.t, err)
		require.Len(t.t, storePairs, len(pairs))

		totalExpected += len(pairs)
		for _, storePair := range storePairs {
			pseudo, ok := pairs[storePair.RealVal]
			require.True(t.t, ok)
			require.Equal(t.t, pseudo, storePair.PseudoVal)
		}
	}

	dbSessions, err := queries.ListSessions(ctx)
	require.NoError(t.t, err)
	for _, dbSession := range dbSessions {
		dbPairs, err := queries.GetAllPrivacyPairs(
			ctx, dbSession.ID,
		)
		if err == sql.ErrNoRows {
			continue
		}
		require.NoError(t.t, err)
		totalFound += len(dbPairs)
	}

	require.Equal(t.t, totalExpected, totalFound)
}

// assertFirewallActionMigrationDataSQL connects to the SQL DB and queries
// actions to assert migration results.
func assertFirewallActionMigrationDataSQL(ctx context.Context, t *harnessTest,
	node *HarnessNode, data firewallMigrationData) {

	dbPath := filepath.Join(
		node.Cfg.LitDir,
		node.Cfg.NetParams.Name,
		"litd.db",
	)

	sqlStore, err := sqldb.NewSqliteStore(
		&sqldb.SqliteConfig{
			SkipMigrations:        true,
			SkipMigrationDbBackup: true,
		}, dbPath,
	)
	require.NoError(t.t, err)
	defer sqlStore.BaseDB.Close()

	queries := sqlc.NewForType(
		sqlStore.BaseDB, sqlStore.BackendType,
	)
	actionStore := firewalldb.NewSQLDB(
		sqlStore.BaseDB, queries, clock.NewDefaultClock(),
	)

	actions, _, _, err := actionStore.ListActions(
		ctx, nil,
		firewalldb.WithActionFeatureName(actionTestFeatureName),
	)
	require.NoError(t.t, err)
	require.Len(t.t, actions, len(data.actions))

	for i, action := range actions {
		assertFirewallActionsEqual(t, data.actions[i], action)
	}
}

// assertFirewallActionsEqual compares actions while normalizing timestamps.
func assertFirewallActionsEqual(t *harnessTest,
	expected *firewalldb.Action, got *firewalldb.Action) {

	expectedAttemptedAt := expected.AttemptedAt
	gotAttemptedAt := got.AttemptedAt

	expected.AttemptedAt = time.Time{}
	got.AttemptedAt = time.Time{}

	require.Equal(t.t, expected, got)
	require.Equal(
		t.t, expectedAttemptedAt.Unix(), gotAttemptedAt.Unix(),
	)

	expected.AttemptedAt = expectedAttemptedAt
	got.AttemptedAt = gotAttemptedAt
}

// buildSessionExpectationFromSQL converts SQL rows into expectations.
func buildSessionExpectationFromSQL(ctx context.Context,
	queries *sqlcmig6.Queries,
	dbSess sqlcmig6.Session) (sessionMigrationExpectation, error) {

	featureConfigs := make(map[string]string)
	configRows, err := queries.GetSessionFeatureConfigs(ctx, dbSess.ID)
	if err != nil {
		return sessionMigrationExpectation{}, err
	}
	for _, cfg := range configRows {
		featureConfigs[cfg.FeatureName] = string(cfg.Config)
	}

	var recipe *macaroonRecipeExpectation
	caveats, err := queries.GetSessionMacaroonCaveats(ctx, dbSess.ID)
	if err != nil {
		return sessionMigrationExpectation{}, err
	}
	perms, err := queries.GetSessionMacaroonPermissions(ctx, dbSess.ID)
	if err != nil {
		return sessionMigrationExpectation{}, err
	}
	if len(caveats) > 0 || len(perms) > 0 {
		permsExp := make(
			[]macaroonPermExpectation, 0, len(perms),
		)
		for _, perm := range perms {
			permsExp = append(permsExp, macaroonPermExpectation{
				entity: perm.Entity,
				action: perm.Action,
			})
		}

		caveatsExp := make([]string, 0, len(caveats))
		for _, cav := range caveats {
			caveatsExp = append(
				caveatsExp, string(cav.CaveatID),
			)
		}

		recipe = &macaroonRecipeExpectation{
			perms:   permsExp,
			caveats: caveatsExp,
		}
	}

	privFlagsRows, err := queries.GetSessionPrivacyFlags(
		ctx, dbSess.ID,
	)
	if err != nil {
		return sessionMigrationExpectation{}, err
	}
	privFlags := make(
		session.PrivacyFlags, 0, len(privFlagsRows),
	)
	for _, flag := range privFlagsRows {
		privFlags = append(
			privFlags, session.PrivacyFlag(flag.Flag),
		)
	}

	var accountID string
	if dbSess.AccountID.Valid {
		acct, err := queries.GetAccount(
			ctx, dbSess.AccountID.Int64,
		)
		if err != nil {
			return sessionMigrationExpectation{}, err
		}

		alias, err := accounts.AccountIDFromInt64(acct.Alias)
		if err != nil {
			return sessionMigrationExpectation{}, err
		}
		accountID = alias.String()
	}

	var groupID []byte
	if dbSess.GroupID.Valid {
		alias, err := queries.GetAliasBySessionID(
			ctx, dbSess.GroupID.Int64,
		)
		if err != nil {
			return sessionMigrationExpectation{}, err
		}
		groupID = alias
	}

	return sessionMigrationExpectation{
		label:          dbSess.Label,
		sessionType:    sessionTypeToRPC(session.Type(dbSess.Type)),
		devServer:      dbSess.DevServer,
		privacyFlags:   privFlags.Serialize(),
		featureConfigs: featureConfigs,
		macaroonRecipe: recipe,
		accountID:      accountID,
		groupID:        groupID,
	}, nil
}

// normalizeRemovedAccountExpectation clears bbolt account IDs that
// reference deleted accounts.
func normalizeRemovedAccountExpectation(ctx context.Context,
	accountStore accounts.Store, expected sessionMigrationExpectation,
	actual *sessionMigrationExpectation) error {

	if actual == nil {
		return fmt.Errorf("actual session expectation missing")
	}

	if expected.accountID != "" || actual.accountID == "" {
		return nil
	}

	accountID, err := accounts.ParseAccountID(actual.accountID)
	if err != nil {
		return err
	}

	_, err = accountStore.Account(ctx, *accountID)
	if err == nil {
		return fmt.Errorf("account %s still exists", actual.accountID)
	}
	if !errors.Is(err, accounts.ErrAccNotFound) {
		return err
	}

	actual.accountID = ""
	return nil
}

// compareSessionExpectation verifies a bbolt session against expectations.
func compareSessionExpectation(label string,
	expected sessionMigrationExpectation,
	actual sessionMigrationExpectation) error {

	if expected.sessionType != actual.sessionType {
		return fmt.Errorf(
			"session %s type mismatch", label,
		)
	}

	if expected.devServer != actual.devServer {
		return fmt.Errorf(
			"session %s dev server mismatch", label,
		)
	}

	if expected.privacyFlags != actual.privacyFlags {
		return fmt.Errorf(
			"session %s privacy flags mismatch", label,
		)
	}

	if expected.accountID != actual.accountID {
		return fmt.Errorf(
			"session %s account id mismatch", label,
		)
	}

	if !bytes.Equal(expected.groupID, actual.groupID) {
		return fmt.Errorf(
			"session %s group id mismatch", label,
		)
	}

	err := compareFeatureConfigMap(
		label, expected.featureConfigs, actual.featureConfigs,
	)
	if err != nil {
		return err
	}

	return compareMacaroonRecipeExpectation(
		label, expected.macaroonRecipe, actual.macaroonRecipe,
	)
}

// compareFeatureConfigMap matches expected session feature configs.
func compareFeatureConfigMap(label string, expected map[string]string,
	actual map[string]string) error {

	if len(expected) == 0 && len(actual) == 0 {
		return nil
	}

	if len(expected) != len(actual) {
		return fmt.Errorf(
			"session %s feature config length mismatch", label,
		)
	}

	for name, expectedValue := range expected {
		actualValue, ok := actual[name]
		if !ok {
			return fmt.Errorf(
				"session %s feature config %s missing",
				label, name,
			)
		}
		if actualValue != expectedValue {
			return fmt.Errorf(
				"session %s feature config %s mismatch",
				label, name,
			)
		}
	}

	return nil
}

// compareMacaroonRecipeExpectation matches expected session macaroon
// recipe data.
func compareMacaroonRecipeExpectation(label string,
	expected *macaroonRecipeExpectation,
	actual *macaroonRecipeExpectation) error {

	if expected == nil {
		if actual == nil {
			return nil
		}
		if len(actual.perms) == 0 && len(actual.caveats) == 0 {
			return nil
		}
		return fmt.Errorf("session %s recipe mismatch", label)
	}

	if len(expected.perms) == 0 && len(expected.caveats) == 0 {
		if actual == nil {
			return nil
		}
		if len(actual.perms) == 0 && len(actual.caveats) == 0 {
			return nil
		}
		return fmt.Errorf("session %s recipe mismatch", label)
	}

	if actual == nil {
		return fmt.Errorf("session %s recipe missing", label)
	}

	if len(expected.caveats) != len(actual.caveats) {
		return fmt.Errorf(
			"session %s caveat count mismatch", label,
		)
	}

	if len(expected.perms) != len(actual.perms) {
		return fmt.Errorf(
			"session %s permission count mismatch", label,
		)
	}

	expectedCaveats := append([]string{}, expected.caveats...)
	actualCaveats := append([]string{}, actual.caveats...)
	sort.Strings(expectedCaveats)
	sort.Strings(actualCaveats)
	if !equalStringSlices(expectedCaveats, actualCaveats) {
		return fmt.Errorf(
			"session %s caveats mismatch", label,
		)
	}

	expectedPerms := append(
		[]macaroonPermExpectation{}, expected.perms...,
	)
	actualPerms := append(
		[]macaroonPermExpectation{}, actual.perms...,
	)
	sort.Slice(expectedPerms, func(i, j int) bool {
		if expectedPerms[i].entity == expectedPerms[j].entity {
			return expectedPerms[i].action < expectedPerms[j].action
		}

		return expectedPerms[i].entity < expectedPerms[j].entity
	})
	sort.Slice(actualPerms, func(i, j int) bool {
		if actualPerms[i].entity == actualPerms[j].entity {
			return actualPerms[i].action < actualPerms[j].action
		}

		return actualPerms[i].entity < actualPerms[j].entity
	})
	if !equalPermSlices(expectedPerms, actualPerms) {
		return fmt.Errorf(
			"session %s permissions mismatch", label,
		)
	}

	return nil
}

// equalStringSlices compares two string slices that are already sorted.
func equalStringSlices(left []string, right []string) bool {
	if len(left) != len(right) {
		return false
	}

	for i := range left {
		if left[i] != right[i] {
			return false
		}
	}

	return true
}

// equalPermSlices compares macaroon permission slices that are sorted.
func equalPermSlices(left []macaroonPermExpectation,
	right []macaroonPermExpectation) bool {

	if len(left) != len(right) {
		return false
	}

	for i := range left {
		if left[i] != right[i] {
			return false
		}
	}

	return true
}

// normalizeRemovedAccountExpectationList clears expected account IDs when
// the session reports a removed account.
func normalizeRemovedAccountExpectationList(t *harnessTest,
	sess *litrpc.Session,
	expected sessionMigrationExpectation) sessionMigrationExpectation {

	if sess == nil {
		return expected
	}

	if expected.accountID == "" && sess.AccountId != "" {
		expected.accountID = sess.AccountId
	}

	return expected
}

// resolveMacRootKeyID returns a full root key ID for the macaroon suffix.
func resolveMacRootKeyID(suffix [4]byte,
	macRootKeyIDs map[[4]byte]uint64) uint64 {

	if rootKeyID, ok := macRootKeyIDs[suffix]; ok {
		return rootKeyID
	}

	var rootKeyBytes [8]byte
	copy(rootKeyBytes[4:], suffix[:])
	return binary.BigEndian.Uint64(rootKeyBytes[:])
}

// updateAccountIDForTest rewrites a bbolt account ID to force collisions.
func updateAccountIDForTest(db kvdb.Backend, oldID accounts.AccountID,
	targetPrefix accounts.AccountID) (accounts.AccountID, error) {

	newID, err := nextAccountIDWithPrefix(db, targetPrefix)
	if err != nil {
		return accounts.AccountID{}, err
	}

	err = kvdb.Update(db, func(tx kvdb.RwTx) error {
		bucket := tx.ReadWriteBucket([]byte("accounts"))
		if bucket == nil {
			return fmt.Errorf("accounts bucket not found")
		}

		raw := bucket.Get(oldID[:])
		if len(raw) == 0 {
			return fmt.Errorf("account not found")
		}

		acct, err := deserializeAccountForTest(raw)
		if err != nil {
			return err
		}

		acct.ID = newID
		encoded, err := serializeAccountForTest(acct)
		if err != nil {
			return err
		}

		if len(bucket.Get(newID[:])) != 0 {
			return fmt.Errorf("new account id already exists")
		}

		if err := bucket.Put(newID[:], encoded); err != nil {
			return err
		}

		return bucket.Delete(oldID[:])
	}, func() {})
	if err != nil {
		return accounts.AccountID{}, err
	}

	return newID, nil
}

// nextAccountIDWithPrefix creates a unique account ID with a shared prefix.
func nextAccountIDWithPrefix(db kvdb.Backend,
	prefix accounts.AccountID) (accounts.AccountID, error) {

	var newID accounts.AccountID
	copy(newID[:4], prefix[:4])

	for i := uint32(1); i < 128; i++ {
		binary.BigEndian.PutUint32(newID[4:], i)
		var exists bool
		err := kvdb.View(db, func(tx kvdb.RTx) error {
			bucket := tx.ReadBucket([]byte("accounts"))
			if bucket == nil {
				return fmt.Errorf("accounts bucket not found")
			}
			exists = len(bucket.Get(newID[:])) != 0
			return nil
		}, func() {})
		if err != nil {
			return accounts.AccountID{}, err
		}
		if !exists {
			return newID, nil
		}
	}

	return accounts.AccountID{}, fmt.Errorf("no free account id found")
}

// serializeAccountForTest encodes an account using the accounts TLV format.
func serializeAccountForTest(account *accounts.OffChainBalanceAccount) (
	[]byte, error) {

	if account == nil {
		return nil, fmt.Errorf("account cannot be nil")
	}

	var (
		buf            bytes.Buffer
		id             = account.ID[:]
		accountType    = uint8(account.Type)
		initialBalance = uint64(account.InitialBalance)
		currentBalance = uint64(account.CurrentBalance)
		lastUpdate     = uint64(account.LastUpdate.UnixNano())
		label          = []byte(account.Label)
	)

	tlvRecords := []tlv.Record{
		tlv.MakePrimitiveRecord(accountTypeID, &id),
		tlv.MakePrimitiveRecord(accountTypeType, &accountType),
		tlv.MakePrimitiveRecord(accountInitialBalance, &initialBalance),
		tlv.MakePrimitiveRecord(accountCurrentBalance, &currentBalance),
		tlv.MakePrimitiveRecord(accountLastUpdate, &lastUpdate),
	}

	if !account.ExpirationDate.IsZero() {
		expiry := uint64(account.ExpirationDate.UnixNano())
		tlvRecords = append(tlvRecords, tlv.MakePrimitiveRecord(
			accountExpirationDate, &expiry,
		))
	}

	tlvRecords = append(
		tlvRecords,
		newAccountInvoiceRecord(accountInvoices, &account.Invoices),
		newAccountPaymentRecord(accountPayments, &account.Payments),
		tlv.MakePrimitiveRecord(accountLabel, &label),
	)

	tlvStream, err := tlv.NewStream(tlvRecords...)
	if err != nil {
		return nil, err
	}

	if err := tlvStream.Encode(&buf); err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}

// deserializeAccountForTest decodes an account using the accounts TLV format.
func deserializeAccountForTest(content []byte) (
	*accounts.OffChainBalanceAccount, error) {

	var (
		r              = bytes.NewReader(content)
		id             []byte
		accountType    uint8
		initialBalance uint64
		currentBalance uint64
		lastUpdate     uint64
		expirationDate uint64
		invoices       accounts.AccountInvoices
		payments       accounts.AccountPayments
		label          []byte
	)

	tlvStream, err := tlv.NewStream(
		tlv.MakePrimitiveRecord(accountTypeID, &id),
		tlv.MakePrimitiveRecord(accountTypeType, &accountType),
		tlv.MakePrimitiveRecord(accountInitialBalance, &initialBalance),
		tlv.MakePrimitiveRecord(accountCurrentBalance, &currentBalance),
		tlv.MakePrimitiveRecord(accountLastUpdate, &lastUpdate),
		tlv.MakePrimitiveRecord(accountExpirationDate, &expirationDate),
		newAccountInvoiceRecord(accountInvoices, &invoices),
		newAccountPaymentRecord(accountPayments, &payments),
		tlv.MakePrimitiveRecord(accountLabel, &label),
	)
	if err != nil {
		return nil, err
	}

	parsedTypes, err := tlvStream.DecodeWithParsedTypes(r)
	if err != nil {
		return nil, err
	}

	account := &accounts.OffChainBalanceAccount{
		Type:           accounts.AccountType(accountType),
		InitialBalance: lnwire.MilliSatoshi(initialBalance),
		CurrentBalance: int64(currentBalance),
		LastUpdate:     time.Unix(0, int64(lastUpdate)),
		Invoices:       invoices,
		Payments:       payments,
		Label:          string(label),
	}
	copy(account.ID[:], id)

	if t, ok := parsedTypes[accountExpirationDate]; ok && t == nil {
		account.ExpirationDate = time.Unix(0, int64(expirationDate))
	}

	return account, nil
}

// newAccountInvoiceRecord returns a TLV record for account invoices.
func newAccountInvoiceRecord(tlvType tlv.Type,
	invoiceMap *accounts.AccountInvoices) tlv.Record {

	recordSize := func() uint64 {
		return uint64(len(*invoiceMap) * lntypes.HashSize)
	}
	return tlv.MakeDynamicRecord(
		tlvType, invoiceMap, recordSize,
		accountInvoiceEntryMapEncoder,
		accountInvoiceEntryMapDecoder,
	)
}

// newAccountPaymentRecord returns a TLV record for account payments.
func newAccountPaymentRecord(tlvType tlv.Type,
	hashMap *accounts.AccountPayments) tlv.Record {

	recordSize := func() uint64 {
		return uint64(len(*hashMap) * (lntypes.HashSize + 1 + 8))
	}
	return tlv.MakeDynamicRecord(
		tlvType, hashMap, recordSize, accountPaymentEntryMapEncoder,
		accountPaymentEntryMapDecoder,
	)
}

// accountPaymentEntryMapEncoder encodes account payments.
func accountPaymentEntryMapEncoder(w io.Writer, val any,
	buf *[8]byte) error {

	if val == nil {
		return nil
	}

	hashMap, ok := val.(*accounts.AccountPayments)
	if !ok {
		return fmt.Errorf("invalid payment map type: %T", val)
	}

	if err := tlv.WriteVarInt(w, uint64(len(*hashMap)), buf); err != nil {
		return err
	}

	for hash, entry := range *hashMap {
		item := [32]byte(hash)
		if err := tlv.EBytes32(w, &item, buf); err != nil {
			return err
		}

		status := []byte{byte(entry.Status)}
		if _, err := w.Write(status); err != nil {
			return err
		}

		err := tlv.EUint64T(w, uint64(entry.FullAmount), buf)
		if err != nil {
			return err
		}
	}

	return nil
}

// accountPaymentEntryMapDecoder decodes account payments.
func accountPaymentEntryMapDecoder(r io.Reader, val any, buf *[8]byte,
	_ uint64) error {

	if val == nil {
		return nil
	}

	hashMap, ok := val.(*accounts.AccountPayments)
	if !ok {
		return fmt.Errorf("invalid payment map type: %T", val)
	}

	numItems, err := tlv.ReadVarInt(r, buf)
	if err != nil {
		return err
	}

	entries := make(accounts.AccountPayments, numItems)
	for i := uint64(0); i < numItems; i++ {
		var item [32]byte
		if err := tlv.DBytes32(r, &item, buf, 32); err != nil {
			return err
		}

		status := make([]byte, 1)
		if _, err := r.Read(status); err != nil {
			return err
		}

		var fullAmt uint64
		if err := tlv.DUint64(r, &fullAmt, buf, 8); err != nil {
			return err
		}

		entries[item] = &accounts.PaymentEntry{
			Status:     lnrpc.Payment_PaymentStatus(status[0]),
			FullAmount: lnwire.MilliSatoshi(fullAmt),
		}
	}

	*hashMap = entries

	return nil
}

// accountInvoiceEntryMapEncoder encodes account invoice hashes.
func accountInvoiceEntryMapEncoder(w io.Writer, val any,
	buf *[8]byte) error {

	if invoiceMap, ok := val.(*accounts.AccountInvoices); ok {
		if err := tlv.WriteVarInt(
			w, uint64(len(*invoiceMap)), buf,
		); err != nil {
			return err
		}

		for hash := range *invoiceMap {
			item := [32]byte(hash)
			if err := tlv.EBytes32(w, &item, buf); err != nil {
				return err
			}
		}

		return nil
	}

	return tlv.NewTypeForEncodingErr(val, "*AccountInvoices")
}

// accountInvoiceEntryMapDecoder decodes account invoice hashes.
func accountInvoiceEntryMapDecoder(r io.Reader, val any,
	buf *[8]byte, _ uint64) error {

	if invoiceMap, ok := val.(*accounts.AccountInvoices); ok {
		numItems, err := tlv.ReadVarInt(r, buf)
		if err != nil {
			return err
		}

		hashes := make(accounts.AccountInvoices, numItems)
		for i := uint64(0); i < numItems; i++ {
			var item [32]byte
			if err := tlv.DBytes32(r, &item, buf, 32); err != nil {
				return err
			}
			hashes[item] = struct{}{}
		}

		*invoiceMap = hashes
		return nil
	}

	return tlv.NewTypeForEncodingErr(val, "*AccountInvoices")
}

// macRootKeyIDMap returns a map of macaroon root key ID suffixes to full
// values fetched from lnd.
func macRootKeyIDMap(ctx context.Context, t *testing.T,
	cfg *LitNodeConfig) (map[[4]byte]uint64, error) {

	// connectRPC opens the lnd gRPC connection for macaroon root keys.
	lndConn, err := connectRPC(
		ctx, cfg.RPCAddr(), cfg.TLSCertPath,
	)
	if err != nil {
		return nil, err
	}
	defer lndConn.Close()

	// Get the lnd admin macaroon context from the migration node.
	lndMacBytes := getLndMacFromFile(t, cfg)
	lndCtx := macaroonContext(ctx, lndMacBytes)

	// An LND client is used to get lnd's RootKeyIDs, needed during the
	// action migration assertions.
	lndClient := lnrpc.NewLightningClient(lndConn)

	resp, err := lndClient.ListMacaroonIDs(
		lndCtx, &lnrpc.ListMacaroonIDsRequest{},
	)
	if err != nil {
		return nil, err
	}

	rootKeyMap := make(map[[4]byte]uint64)
	if resp == nil {
		return rootKeyMap, nil
	}

	for _, rootKeyID := range resp.RootKeyIds {
		var rootKeyBytes [8]byte
		binary.BigEndian.PutUint64(rootKeyBytes[:], rootKeyID)

		var suffix [4]byte
		copy(suffix[:], rootKeyBytes[4:])
		rootKeyMap[suffix] = rootKeyID
	}

	return rootKeyMap, nil
}

// getLndMacFromFile reads the lnd admin macaroon for the node.
func getLndMacFromFile(t *testing.T, cfg *LitNodeConfig) []byte {
	macBytes, err := os.ReadFile(cfg.AdminMacPath)
	require.NoError(t, err)

	return macBytes
}

// updateActionMacRootKeyIDs refreshes action root key IDs using the latest
// macaroon ID mapping.
func updateActionMacRootKeyIDs(ctx context.Context, t *testing.T,
	cfg *LitNodeConfig, data *firewallMigrationData) {

	macRootKeyIDs, err := macRootKeyIDMap(ctx, t, cfg)
	require.NoError(t, err)

	for _, action := range data.actions {
		if action == nil {
			continue
		}

		action.MacaroonRootKeyID.WhenSome(func(rootID uint64) {
			var rootKeyBytes [8]byte
			binary.BigEndian.PutUint64(rootKeyBytes[:], rootID)

			var suffix [4]byte
			copy(suffix[:], rootKeyBytes[4:])

			if full, ok := macRootKeyIDs[suffix]; ok {
				action.MacaroonRootKeyID = fn.Some(full)
			}
		})
	}
}
