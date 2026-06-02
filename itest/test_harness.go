package itest

import (
	"bytes"
	"context"
	"flag"
	"fmt"
	"testing"
	"time"

	"github.com/btcsuite/btcd/chaincfg"
	"github.com/btcsuite/btcd/chaincfg/chainhash"
	"github.com/btcsuite/btcd/wire"
	"github.com/go-errors/errors"
	"github.com/lightningnetwork/lnd/lntest/wait"
)

var (
	harnessNetParams = &chaincfg.RegressionNetParams

	// litdExecutable is the full path to the litd binary.
	litdExecutable = flag.String(
		"litdexec", itestLitdBinary, "full path to litd binary",
	)

	slowMineDelay = 20 * time.Millisecond

	defaultITestTimeout = 10 * time.Minute
)

const (
	defaultTimeout      = wait.DefaultTimeout
	minerMempoolTimeout = wait.MinerMempoolTimeout
	itestLitdBinary     = "litd-itest"
	itestLndBinary      = "lnd-itest"
)

// harnessTest wraps a regular testing.T providing enhanced error detection
// and propagation. All error will be augmented with a full stack-trace in
// order to aid in debugging. Additionally, any panics caused by active
// test cases will also be handled and represented as fatals.
type harnessTest struct {
	t *testing.T

	// testCase is populated during test execution and represents the
	// current test case.
	testCase *testCase

	// lndHarness is a reference to the current network harness. Will be
	// nil if not yet set up.
	lndHarness *NetworkHarness
}

// newHarnessTest creates a new instance of a harnessTest from a regular
// testing.T instance.
func newHarnessTest(t *testing.T, net *NetworkHarness) *harnessTest {
	return &harnessTest{t, nil, net}
}

// Skipf calls the underlying testing.T's Skip method, causing the current test
// to be skipped.
func (h *harnessTest) Skipf(format string, args ...interface{}) {
	h.t.Skipf(format, args...)
}

// Fatalf causes the current active test case to fail with a fatal error. All
// integration tests should mark test failures solely with this method due to
// the error stack traces it produces.
func (h *harnessTest) Fatalf(format string, a ...interface{}) {
	stacktrace := errors.Wrap(fmt.Sprintf(format, a...), 1).ErrorStack()

	if h.testCase != nil {
		h.t.Fatalf("Failed: (%v): exited with error: \n"+
			"%v", h.testCase.name, stacktrace)
	} else {
		h.t.Fatalf("Error outside of test: %v", stacktrace)
	}
}

// RunTestCase executes a harness test case. Any errors or panics will be
// represented as fatal.
func (h *harnessTest) RunTestCase(testCase *testCase) {
	h.testCase = testCase
	defer func() {
		h.testCase = nil
	}()

	defer func() {
		if err := recover(); err != nil {
			description := errors.Wrap(err, 2).ErrorStack()
			h.t.Fatalf("Failed: (%v) panicked with: \n%v",
				h.testCase.name, description)
		}
	}()

	ctxt, cancel := context.WithTimeout(
		context.Background(), defaultITestTimeout,
	)
	defer cancel()

	testCase.test(ctxt, h.lndHarness, h)
}

func (h *harnessTest) Logf(format string, args ...interface{}) {
	h.t.Logf(format, args...)
}

func (h *harnessTest) Log(args ...interface{}) {
	h.t.Log(args...)
}

func getLitdBinary() string {
	binary := itestLitdBinary
	litdExec := ""
	if litdExecutable != nil && *litdExecutable != "" {
		litdExec = *litdExecutable
	}
	if litdExec != "" {
		binary = litdExec
	}

	return binary
}

type testCase struct {
	name string
	test func(ctx context.Context, net *NetworkHarness,
		t *harnessTest)
	noAliceBob bool
}

// mineBlocksSlow mines 'num' of blocks and checks that blocks are present in
// the mining node's blockchain. numTxs should be set to the number of
// transactions (excluding the coinbase) we expect to be included in the first
// mined block. Between each mined block an artificial delay is introduced to
// give all network participants time to catch up.
//
// NOTE: This function currently is just an alias for mineBlocksSlow.
func mineBlocks(t *harnessTest, net *NetworkHarness,
	num uint32, numTxs int) []*wire.MsgBlock {

	return mineBlocksSlow(t, net, num, numTxs)
}

// mineBlocksSlow mines 'num' of blocks and checks that blocks are present in
// the mining node's blockchain. numTxs should be set to the number of
// transactions (excluding the coinbase) we expect to be included in the first
// mined block. Between each mined block an artificial delay is introduced to
// give all network participants time to catch up.
func mineBlocksSlow(t *harnessTest, net *NetworkHarness,
	num uint32, numTxs int) []*wire.MsgBlock {

	t.t.Helper()

	// If we expect transactions to be included in the blocks we'll mine,
	// we wait here until they are seen in the miner's mempool.
	var txids []chainhash.Hash
	if numTxs > 0 {
		txids = net.Miner.AssertNumTxsInMempool(numTxs)
	}

	blocks := net.Miner.MineBlocksSlow(num)

	// Assert that all the transactions were included in the first block.
	for i := range txids {
		assertTxInBlock(t, blocks[0], &txids[i])
	}

	return blocks
}

func assertTxInBlock(t *harnessTest, block *wire.MsgBlock,
	txid *chainhash.Hash) {

	for _, tx := range block.Transactions {
		sha := tx.TxHash()
		if bytes.Equal(txid[:], sha[:]) {
			return
		}
	}

	t.Fatalf("tx was not included in block")
}
