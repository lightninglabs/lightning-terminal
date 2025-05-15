package itest

import (
	"os"
	"strings"
	"testing"
	"time"

	"github.com/btcsuite/btclog/v2"
	"github.com/lightningnetwork/lnd/lntest"
	"github.com/lightningnetwork/lnd/lnwallet/chainfee"
	"github.com/stretchr/testify/require"
)

// TestLightningTerminal performs a series of integration tests amongst a
// programmatically driven network of lnd nodes.
func TestLightningTerminal(t *testing.T) {
	// If no tests are registered, then we can exit early.
	if len(allTestCases) == 0 {
		t.Skip("integration tests not selected with flag 'itest'")
	}

	// TODO(elle): temporary override of the default maximum number of mined
	//  blocks per test. We will need to do quite a bit of refactoring
	//  before we can remove this so we override it for now to allow us to
	//  do the refactor in stages.
	lntest.MaxBlocksMinedPerTest = 250

	// Now we can set up our test harness (LND instance), with the chain
	// backend we just created.
	binary := getLitdBinary()

	lndBinary := strings.ReplaceAll(
		getLitdBinary(), itestLitdBinary, itestLndBinary,
	)
	aliceBobArgs := []string{
		"--default-remote-max-htlcs=483",
		"--dust-threshold=5000000",
		"--rpcmiddleware.enable",
	}

	// Run the subset of the test cases selected in this tranche.
	for _, testCase := range allTestCases {
		success := t.Run(testCase.name, func(t1 *testing.T) {
			cleanTestCaseName := strings.ReplaceAll(
				testCase.name, " ", "_",
			)

			feeService := lntest.NewFeeService(t)
			feeService.SetFeeRate(chainfee.FeePerKwFloor, 1)
			lndHarness := lntest.SetupHarness(
				t1, lndBinary, "bbolt", true, feeService,
			)
			t1.Cleanup(func() {
				lndHarness.Stop()
			})

			// Start a chain backend.
			chainBackend, _, err := lntest.NewBackend(
				lndHarness.Miner().P2PAddress(),
				harnessNetParams,
			)
			require.NoError(t1, err, "new backend")

			// Connect miner to chain backend to it.
			require.NoError(
				t1, chainBackend.ConnectMiner(),
				"connect miner",
			)

			lndSubTest := lndHarness.Subtest(t1)
			litdHarness, err := NewNetworkHarness(
				lndSubTest, chainBackend, binary, feeService,
				testCase.backwardCompat,
			)
			require.NoError(t1, err)

			err = litdHarness.SetUp(
				t1, cleanTestCaseName, aliceBobArgs,
				testCase.noAliceBob,
			)
			require.NoError(t1, err, "harness setup failed")

			// Create a separate harness test for the testcase to
			// avoid overwriting the external harness test that is
			// tied to the parent test.
			ht := newHarnessTest(t1, litdHarness)
			ht.RunTestCase(testCase)

			select {
			case err := <-litdHarness.lndErrorChan:
				require.NoError(t1, err)
			default:
			}
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

func init() {
	logger := btclog.NewSLogger(btclog.NewDefaultHandler(os.Stdout))
	UseLogger(logger.SubSystem(Subsystem))
}
