package itest

import (
	"fmt"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/btcsuite/btcd/integration/rpctest"
	"github.com/lightningnetwork/lnd/lntest"
	"github.com/stretchr/testify/require"
)

// TestLightningTerminal performs a series of integration tests amongst a
// programmatically driven network of lnd nodes.
func TestLightningTerminal(t *testing.T) {
	// If no tests are registered, then we can exit early.
	if len(allTestCases) == 0 {
		t.Skip("integration tests not selected with flag 'itest'")
	}

	// Parse testing flags that influence our test execution.
	logDir := "."
	require.NoError(t, os.MkdirAll(logDir, 0700))

	// Before we start any node, we need to make sure that any btcd node
	// that is started through the RPC harness uses a unique port as well to
	// avoid any port collisions.
	rpctest.ListenAddressGenerator = lntest.GenerateBtcdListenerAddresses

	// Declare the network harness here to gain access to its
	// 'OnTxAccepted' call back.
	var litdHarness *NetworkHarness

	// Create an instance of the btcd's rpctest.Harness that will act as
	// the miner for all tests. This will be used to fund the wallets of
	// the nodes within the test network and to drive blockchain related
	// events within the network. Revert the default setting of accepting
	// non-standard transactions on simnet to reject them. Transactions on
	// the lightning network should always be standard to get better
	// guarantees of getting included in to blocks.
	//
	// We will also connect it to our chain backend.
	miner, err := lntest.NewMiner()
	require.NoError(t, err, "failed to create new miner")
	defer func() {
		require.NoError(t, miner.Stop(), "failed to stop miner")
	}()

	// Start a chain backend.
	chainBackend, cleanUp, err := lntest.NewBackend(
		miner.P2PAddress(), harnessNetParams,
	)
	require.NoError(t, err, "new backend")
	defer func() {
		require.NoError(t, cleanUp(), "cleanup")
	}()

	// Before we start anything, we want to overwrite some of the connection
	// settings to make the tests more robust. We might need to restart the
	// miner while there are already blocks present, which will take a bit
	// longer than the 1 second the default settings amount to. Doubling
	// both values will give us retries up to 4 seconds.
	miner.MaxConnRetries = rpctest.DefaultMaxConnectionRetries * 2
	miner.ConnectionRetryTimeout = rpctest.DefaultConnectionRetryTimeout * 2

	// Set up miner and connect chain backend to it.
	require.NoError(t, miner.SetUp(true, 50))
	require.NoError(t, miner.Client.NotifyNewTransactions(false))
	require.NoError(t, chainBackend.ConnectMiner(), "connect miner")

	// Now we can set up our test harness (LND instance), with the chain
	// backend we just created.
	ht := newHarnessTest(t, nil)
	binary := getLitdBinary()
	litdHarness, err = NewNetworkHarness(miner, chainBackend, binary)
	if err != nil {
		ht.Fatalf("unable to create lightning network harness: %v", err)
	}
	defer litdHarness.Stop()

	// Spawn a new goroutine to watch for any fatal errors that any of the
	// running lnd processes encounter. If an error occurs, then the test
	// case should naturally as a result and we log the server error here to
	// help debug.
	go func() {
		for {
			select {
			case err, more := <-litdHarness.ProcessErrors():
				if !more {
					return
				}
				ht.Logf("litd finished with error (stderr):\n%v",
					err)
			}
		}
	}()

	// Next mine enough blocks in order for segwit and the CSV package
	// soft-fork to activate on SimNet.
	numBlocks := harnessNetParams.MinerConfirmationWindow * 2
	if _, err := miner.Client.Generate(numBlocks); err != nil {
		ht.Fatalf("unable to generate blocks: %v", err)
	}

	// With the btcd harness created, we can now complete the
	// initialization of the network. args - list of lnd arguments,
	// example: "--debuglevel=debug"
	// TODO(roasbeef): create master balanced channel with all the monies?
	aliceBobArgs := []string{
		"--default-remote-max-htlcs=483",
		"--dust-threshold=5000000",
	}

	// Run the subset of the test cases selected in this tranche.
	for _, testCase := range allTestCases {
		testCase := testCase
		name := fmt.Sprintf("%s/%s", chainBackend.Name(), testCase.name)

		success := t.Run(name, func(t1 *testing.T) {
			cleanTestCaseName := strings.ReplaceAll(
				testCase.name, " ", "_",
			)

			err = litdHarness.SetUp(
				t1, cleanTestCaseName, aliceBobArgs,
			)
			require.NoError(t1,
				err, "unable to set up test lightning network",
			)
			defer func() {
				require.NoError(t1, litdHarness.TearDown())
			}()

			litdHarness.EnsureConnected(
				t1, litdHarness.Alice, litdHarness.Bob,
			)

			logLine := fmt.Sprintf(
				"STARTING ============ %v ============\n",
				testCase.name,
			)

			litdHarness.Alice.AddToLog(logLine)
			litdHarness.Bob.AddToLog(logLine)

			// Create a separate harness test for the testcase to
			// avoid overwriting the external harness test that is
			// tied to the parent test.
			ht := newHarnessTest(t1, litdHarness)
			ht.RunTestCase(testCase)
		})

		// Stop at the first failure. Mimic behavior of original test
		// framework.
		if !success {
			// Log failure time to help relate the lnd logs to the
			// failure.
			t.Logf("Failure time: %v", time.Now().Format(
				"2006-01-02 15:04:05.000",
			))
			break
		}
	}
}
