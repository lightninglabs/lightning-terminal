package itest

import (
	"fmt"
	"strings"
	"testing"
	"time"

	"github.com/lightningnetwork/lnd/build"
	"github.com/lightningnetwork/lnd/lntest"
	"github.com/lightningnetwork/lnd/signal"
	"github.com/stretchr/testify/require"
)

var interceptor *signal.Interceptor

// TestLightningTerminal performs a series of integration tests amongst a
// programmatically driven network of lnd nodes.
func TestLightningTerminal(t *testing.T) {
	// If no tests are registered, then we can exit early.
	if len(allTestCases) == 0 {
		t.Skip("integration tests not selected with flag 'itest'")
	}

	// Now we can set up our test harness (LND instance), with the chain
	// backend we just created.
	ht := newHarnessTest(t, nil)
	ht.setupLogging()
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
		testCase := testCase

		success := t.Run(testCase.name, func(t1 *testing.T) {
			cleanTestCaseName := strings.ReplaceAll(
				testCase.name, " ", "_",
			)

			feeService := lntest.NewFeeService(t)
			lndHarness := lntest.SetupHarness(
				t1, lndBinary, "bbolt", feeService,
			)
			t1.Cleanup(func() {
				lndHarness.Stop()
			})

			// Start a chain backend.
			chainBackend, _, err := lntest.NewBackend(
				lndHarness.Miner.P2PAddress(), harnessNetParams,
			)
			require.NoError(t1, err, "new backend")

			// Connect miner to chain backend to it.
			require.NoError(
				t1, chainBackend.ConnectMiner(),
				"connect miner",
			)

			lndSubTest := lndHarness.Subtest(t1)
			litdHarness, err := NewNetworkHarness(
				lndSubTest, chainBackend, binary,
			)
			require.NoError(t1, err)

			err = litdHarness.SetUp(
				t1, cleanTestCaseName, aliceBobArgs,
			)
			require.NoError(t1, err, "harness setup failed")
			t1.Cleanup(func() {
				require.NoError(t1, litdHarness.TearDown())
				litdHarness.Stop()
			})

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

func (h *harnessTest) setupLogging() {
	logWriter := build.NewRotatingLogWriter()

	if interceptor != nil {
		return
	}

	ic, err := signal.Intercept()
	require.NoError(h.t, err)
	interceptor = &ic

	err = build.ParseAndSetDebugLevels("debug", logWriter)
	require.NoError(h.t, err)
}
