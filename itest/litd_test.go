package itest

import (
	"flag"
	"fmt"
	"math/rand"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/btcsuite/btclog/v2"
	"github.com/lightningnetwork/lnd/lntest"
	"github.com/lightningnetwork/lnd/lnwallet/chainfee"
	"github.com/stretchr/testify/require"
)

const (
	// defaultSplitTranches is the default number of tranches to divide the
	// test suite into when no override is provided.
	defaultSplitTranches uint = 1

	// defaultRunTranche is the default tranche index to execute when no
	// explicit tranche is selected.
	defaultRunTranche uint = 0
)

var (
	// testCasesSplitTranches is the number of tranches the test cases
	// should be split into. By default this is set to 1, so no splitting
	// happens. If this value is increased, then the -runtranche flag must
	// be specified as well to indicate which part should be run in the
	// current invocation.
	testCasesSplitTranches = flag.Uint(
		"splittranches", defaultSplitTranches,
		"split the test cases in this many tranches and run the "+
			"tranche at 0-based index specified by the "+
			"-runtranche flag",
	)

	// shuffleSeedFlag enables deterministic shuffling of test cases to
	// balance workload across tranches.
	shuffleSeedFlag = flag.Uint64(
		"shuffleseed", 0, "if set, shuffles the test cases using this "+
			"as the source of randomness",
	)

	// testCasesRunTranche selects which tranche (0-based) to execute.
	testCasesRunTranche = flag.Uint(
		"runtranche", defaultRunTranche,
		"run the tranche of the split test cases with the given "+
			"(0-based) index",
	)
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

	testCases, trancheIndex, trancheOffset := selectTestTranche()
	totalTestCases := len(allTestCases)

	// Run the subset of the test cases selected in this tranche.
	for idx, testCase := range testCases {
		testOrdinal := int(trancheOffset) + idx + 1
		testName := fmt.Sprintf(
			"tranche%02d/%02d-of-%d/%s", int(trancheIndex),
			testOrdinal, totalTestCases, testCase.name,
		)

		success := t.Run(testName, func(t1 *testing.T) {
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

// maybeShuffleTestCases shuffles the test cases if the flag `shuffleseed` is
// set and not 0. This is used by parallel test runs to even out the work
// across tranches.
func maybeShuffleTestCases() {
	// Exit if not set or set to 0.
	if shuffleSeedFlag == nil || *shuffleSeedFlag == 0 {
		return
	}

	// Init the seed and shuffle the test cases.
	// #nosec G404 -- This is not for cryptographic purposes.
	r := rand.New(rand.NewSource(int64(*shuffleSeedFlag)))
	r.Shuffle(len(allTestCases), func(i, j int) {
		allTestCases[i], allTestCases[j] =
			allTestCases[j], allTestCases[i]
	})
}

// createIndices divides the number of test cases into pairs of indices that
// specify the start and end of a tranche.
func createIndices(numCases, numTranches uint) [][2]uint {
	base := numCases / numTranches
	remainder := numCases % numTranches

	indices := make([][2]uint, numTranches)
	start := uint(0)

	for i := uint(0); i < numTranches; i++ {
		end := start + base
		if i < remainder {
			end++
		}
		indices[i] = [2]uint{start, end}
		start = end
	}

	return indices
}

// selectTestTranche returns the sub slice of the test cases that should be run
// as the current split tranche as well as the index and slice offset of the
// tranche.
func selectTestTranche() ([]*testCase, uint, uint) {
	numTranches := defaultSplitTranches
	if testCasesSplitTranches != nil {
		numTranches = *testCasesSplitTranches
	}
	runTranche := defaultRunTranche
	if testCasesRunTranche != nil {
		runTranche = *testCasesRunTranche
	}

	// There's a special flake-hunt mode where we run the same test multiple
	// times in parallel. In that case the tranche index is equal to the
	// thread ID, but we need to actually run all tests for the regex
	// selection to work.
	threadID := runTranche
	if numTranches == 1 {
		runTranche = 0
	}

	// Shuffle the test cases if the `shuffleseed` flag is set.
	maybeShuffleTestCases()

	numCases := uint(len(allTestCases))
	indices := createIndices(numCases, numTranches)
	index := indices[runTranche]
	trancheOffset, trancheEnd := index[0], index[1]

	return allTestCases[trancheOffset:trancheEnd], threadID,
		trancheOffset
}

func init() {
	logger := btclog.NewSLogger(btclog.NewDefaultHandler(os.Stdout))
	UseLogger(logger.SubSystem(Subsystem))
}
