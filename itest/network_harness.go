package itest

import (
	"context"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/btcsuite/btcd/btcutil"
	"github.com/btcsuite/btcd/chaincfg"
	"github.com/btcsuite/btcd/chaincfg/chainhash"
	"github.com/btcsuite/btcd/txscript"
	"github.com/btcsuite/btcd/wire"
	"github.com/lightninglabs/lightning-terminal/autopilotserver/mock"
	"github.com/lightningnetwork/lnd"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/lntest"
	"github.com/lightningnetwork/lnd/lntest/node"
	"github.com/lightningnetwork/lnd/lntest/wait"
	"github.com/stretchr/testify/require"
	"golang.org/x/sync/errgroup"
	"google.golang.org/grpc/grpclog"
)

// NetworkHarness is an integration testing harness for the lightning network.
// The harness by default is created with two active nodes on the network:
// Alice and Bob.
type NetworkHarness struct {
	netParams *chaincfg.Params

	// currentTestCase holds the name for the currently run test case.
	currentTestCase string

	// litdBinary is the full path to the litd binary that was specifically
	// compiled with all required itest flags.
	litdBinary string

	// Miner is a reference to a running full node that can be used to create
	// new blocks on the network.
	Miner *lntest.HarnessMiner

	LNDHarness *lntest.HarnessTest

	// server is an instance of the local Loop/Pool mock server.
	server *ServerHarness

	// BackendCfg houses the information necessary to use a node as LND
	// chain backend, such as rpc configuration, P2P information etc.
	BackendCfg node.BackendConfig

	activeNodes map[int]*HarnessNode

	nodesByPub map[string]*HarnessNode

	autopilotServer *mock.Server

	// Alice and Bob are the initial seeder nodes that are automatically
	// created to be the initial participants of the test network.
	Alice *HarnessNode
	Bob   *HarnessNode

	// Channel for transmitting stderr output from failed lightning node
	// to main process.
	lndErrorChan chan error

	mtx sync.Mutex
}

// NewNetworkHarness creates a new network test harness.
func NewNetworkHarness(lndHarness *lntest.HarnessTest, b node.BackendConfig,
	litdBinary string) (*NetworkHarness, error) {

	n := NetworkHarness{
		activeNodes:  make(map[int]*HarnessNode),
		nodesByPub:   make(map[string]*HarnessNode),
		lndErrorChan: make(chan error),
		netParams:    lndHarness.Miner.ActiveNet,
		Miner:        lndHarness.Miner,
		LNDHarness:   lndHarness,
		BackendCfg:   b,
		litdBinary:   litdBinary,
	}
	return &n, nil
}

// LookUpNodeByPub queries the set of active nodes to locate a node according
// to its public key. The second value will be true if the node was found, and
// false otherwise.
func (n *NetworkHarness) LookUpNodeByPub(pubStr string) (*HarnessNode, error) {
	n.mtx.Lock()
	defer n.mtx.Unlock()

	node, ok := n.nodesByPub[pubStr]
	if !ok {
		return nil, fmt.Errorf("unable to find node")
	}

	return node, nil
}

// ProcessErrors returns a channel used for reporting any fatal process errors.
// If any of the active nodes within the harness' test network incur a fatal
// error, that error is sent over this channel.
func (n *NetworkHarness) ProcessErrors() <-chan error {
	return n.lndErrorChan
}

// SetUp starts the initial seeder nodes within the test harness. The initial
// node's wallets will be funded wallets with ten 1 BTC outputs each. Finally
// rpc clients capable of communicating with the initial seeder nodes are
// created. Nodes are initialized with the given extra command line flags, which
// should be formatted properly - "--arg=value".
func (n *NetworkHarness) SetUp(t *testing.T,
	testCase string, lndArgs []string) error {

	// Swap out grpc's default logger with our fake logger which drops the
	// statements on the floor.
	fakeLogger := grpclog.NewLoggerV2(io.Discard, io.Discard, io.Discard)
	grpclog.SetLoggerV2(fakeLogger)
	n.currentTestCase = testCase

	// Start our mock Loop/Pool server first.
	mockServerAddr := fmt.Sprintf(
		node.ListenerFormat, node.NextAvailablePort(),
	)
	n.server = NewServerHarness(mockServerAddr)
	err := n.server.Start()
	require.NoError(t, err)

	// Start a mock autopilot server.
	n.autopilotServer = mock.NewServer()
	require.NoError(t, n.autopilotServer.Start())

	// Start the initial seeder nodes within the test network, then connect
	// their respective RPC clients.
	eg := errgroup.Group{}
	eg.Go(func() error {
		var err error
		n.Alice, err = n.NewNode(t, "Alice", lndArgs, false, true)
		if err != nil {
			t.Logf("Error starting Alice: %v", err)
		}
		return err
	})
	eg.Go(func() error {
		var err error
		n.Bob, err = n.NewNode(t, "Bob", lndArgs, true, true)
		if err != nil {
			t.Logf("Error starting Bob: %v", err)
		}
		return err
	})
	require.NoError(t, eg.Wait())

	// First, make a connection between the two nodes. This will wait until
	// both nodes are fully started since the Connect RPC is guarded behind
	// the server.Started() flag that waits for all subsystems to be ready.
	ctxb := context.Background()
	n.ConnectNodes(t, n.Alice, n.Bob)

	// Load up the wallets of the seeder nodes with 10 outputs of 1 BTC
	// each.
	addrReq := &lnrpc.NewAddressRequest{
		Type: lnrpc.AddressType_WITNESS_PUBKEY_HASH,
	}

	// Bob is connected to a remote lnd that is also called Bob and already
	// got the necessary coins when being set up before. So we only need to
	// send to Alice here which is our integrated LiTd instance.
	for i := 0; i < 10; i++ {
		resp, err := n.Alice.NewAddress(ctxb, addrReq)
		if err != nil {
			return err
		}
		addr, err := btcutil.DecodeAddress(
			resp.Address, n.netParams,
		)
		if err != nil {
			return err
		}
		addrScript, err := txscript.PayToAddrScript(addr)
		if err != nil {
			return err
		}

		output := &wire.TxOut{
			PkScript: addrScript,
			Value:    btcutil.SatoshiPerBitcoin,
		}
		_, err = n.Miner.SendOutputs(
			[]*wire.TxOut{output}, 7500,
		)
		if err != nil {
			return err
		}
	}

	// We generate several blocks in order to give the outputs created
	// above a good number of confirmations.
	if _, err := n.Miner.Client.Generate(10); err != nil {
		return err
	}

	// Now we want to wait for the nodes to catch up.
	ctxt, cancel := context.WithTimeout(ctxb, lntest.DefaultTimeout)
	defer cancel()
	if err := n.Alice.WaitForBlockchainSync(ctxt); err != nil {
		return err
	}
	if err := n.Bob.WaitForBlockchainSync(ctxt); err != nil {
		return err
	}

	// Now block until both wallets have fully synced up.
	expectedBalance := int64(btcutil.SatoshiPerBitcoin * 10)
	balReq := &lnrpc.WalletBalanceRequest{}
	balanceTicker := time.NewTicker(time.Millisecond * 200)
	defer balanceTicker.Stop()
	balanceTimeout := time.After(lntest.DefaultTimeout)
out:
	for {
		select {
		case <-balanceTicker.C:
			aliceResp, err := n.Alice.WalletBalance(ctxb, balReq)
			if err != nil {
				return err
			}
			bobResp, err := n.Bob.WalletBalance(ctxb, balReq)
			if err != nil {
				return err
			}

			if aliceResp.ConfirmedBalance == expectedBalance &&
				bobResp.ConfirmedBalance == expectedBalance {

				break out
			}
		case <-balanceTimeout:
			return fmt.Errorf("balances not synced after deadline")
		}
	}

	return nil
}

// TearDown tears down all active nodes within the test lightning network.
func (n *NetworkHarness) TearDown() error {
	for _, node := range n.activeNodes {
		if err := n.ShutdownNode(node); err != nil {
			return err
		}
	}

	return nil
}

// Stop stops the test harness.
func (n *NetworkHarness) Stop() {
	close(n.lndErrorChan)

	n.autopilotServer.Stop()
}

// NewNode initializes a new HarnessNode.
func (n *NetworkHarness) NewNode(t *testing.T, name string, extraArgs []string,
	remoteMode bool, wait bool) (*HarnessNode, error) {

	litArgs := []string{
		fmt.Sprintf("--loop.server.host=%s", n.server.ServerHost),
		fmt.Sprintf("--loop.server.tlspath=%s", n.server.CertFile),
		fmt.Sprintf("--pool.auctionserver=%s", n.server.ServerHost),
		fmt.Sprintf("--pool.tlspathauctserver=%s", n.server.CertFile),
		"--autopilot.insecure",
		fmt.Sprintf(
			"--autopilot.address=localhost:%d",
			n.autopilotServer.GetPort(),
		),
	}

	return n.newNode(
		t, name, extraArgs, litArgs, false, remoteMode, nil, wait,
	)
}

// newNode initializes a new HarnessNode, supporting the ability to initialize a
// wallet with or without a seed. If hasSeed is false, the returned harness node
// can be used immediately. Otherwise, the node will require an additional
// initialization phase where the wallet is either created or restored.
func (n *NetworkHarness) newNode(t *testing.T, name string, extraArgs,
	litArgs []string, hasSeed, remoteMode bool, password []byte, wait bool,
	opts ...node.Option) (*HarnessNode, error) {

	baseCfg := &node.BaseNodeConfig{
		Name:              name,
		LogFilenamePrefix: n.currentTestCase,
		Password:          password,
		BackendCfg:        n.BackendCfg,
		NetParams:         n.netParams,
		ExtraArgs:         extraArgs,
	}
	for _, opt := range opts {
		opt(baseCfg)
	}
	cfg := &LitNodeConfig{
		BaseNodeConfig: baseCfg,
		HasSeed:        hasSeed,
		LitArgs:        litArgs,
		RemoteMode:     remoteMode,
	}

	node, err := NewNode(t, cfg, n.LNDHarness)
	if err != nil {
		return nil, err
	}

	// Put node in activeNodes to ensure Shutdown is called even if Start
	// returns an error.
	n.mtx.Lock()
	n.activeNodes[node.NodeID] = node
	n.mtx.Unlock()

	err = node.Start(n.litdBinary, n.lndErrorChan, wait)
	if err != nil {
		return nil, err
	}

	// If this node is to have a seed, it will need to be unlocked or
	// initialized via rpc. Delay registering it with the network until it
	// can be driven via an unlocked rpc connection.
	if node.Cfg.HasSeed {
		return node, nil
	}

	// With the node started, we can now record its public key within the
	// global mapping.
	n.RegisterNode(node)

	return node, nil
}

// RegisterNode records a new HarnessNode in the NetworkHarnesses map of known
// nodes. This method should only be called with nodes that have successfully
// retrieved their public keys via FetchNodeInfo.
func (n *NetworkHarness) RegisterNode(node *HarnessNode) {
	n.mtx.Lock()
	n.nodesByPub[node.PubKeyStr] = node
	n.mtx.Unlock()
}

func (n *NetworkHarness) connect(ctx context.Context,
	req *lnrpc.ConnectPeerRequest, a *HarnessNode) error {

	syncTimeout := time.After(lntest.DefaultTimeout)
tryconnect:
	if _, err := a.ConnectPeer(ctx, req); err != nil {
		// If the chain backend is still syncing, retry.
		if strings.Contains(err.Error(), lnd.ErrServerNotActive.Error()) ||
			strings.Contains(err.Error(), "i/o timeout") {

			select {
			case <-time.After(100 * time.Millisecond):
				goto tryconnect
			case <-syncTimeout:
				return fmt.Errorf("chain backend did not " +
					"finish syncing")
			}
		}
		return err
	}

	return nil
}

// EnsureConnected will try to connect to two nodes, returning no error if they
// are already connected. If the nodes were not connected previously, this will
// behave the same as ConnectNodes. If a pending connection request has already
// been made, the method will block until the two nodes appear in each other's
// peers list, or until the 15s timeout expires.
func (n *NetworkHarness) EnsureConnected(t *testing.T, a, b *HarnessNode) {
	ctxb := context.Background()
	ctx, cancel := context.WithTimeout(ctxb, lntest.DefaultTimeout*2)
	defer cancel()

	// errConnectionRequested is used to signal that a connection was
	// requested successfully, which is distinct from already being
	// connected to the peer.
	errConnectionRequested := errors.New("connection request in progress")

	tryConnect := func(a, b *HarnessNode) error {
		bInfo, err := b.GetInfo(ctx, &lnrpc.GetInfoRequest{})
		if err != nil {
			return err
		}

		req := &lnrpc.ConnectPeerRequest{
			Addr: &lnrpc.LightningAddress{
				Pubkey: bInfo.IdentityPubkey,
				Host:   b.Cfg.P2PAddr(),
			},
		}

		var predErr error
		err = wait.Predicate(func() bool {
			ctx, cancel := context.WithTimeout(ctx, lntest.DefaultTimeout)
			defer cancel()

			err := n.connect(ctx, req, a)
			switch {
			// Request was successful, wait for both to display the
			// connection.
			case err == nil:
				predErr = errConnectionRequested
				return true

			// If the two are already connected, we return early
			// with no error.
			case strings.Contains(
				err.Error(), "already connected to peer",
			):
				predErr = nil
				return true

			default:
				predErr = err
				return false
			}
		}, lntest.DefaultTimeout)
		if err != nil {
			return fmt.Errorf("connection not succeeded within 15 "+
				"seconds: %v", predErr)
		}

		return predErr
	}

	aErr := tryConnect(a, b)
	bErr := tryConnect(b, a)
	switch {
	// If both reported already being connected to each other, we can exit
	// early.
	case aErr == nil && bErr == nil:

	// Return any critical errors returned by either alice.
	case aErr != nil && aErr != errConnectionRequested:
		t.Fatalf(
			"ensure connection between %s and %s failed "+
				"with error from %s: %v",
			a.Cfg.Name, b.Cfg.Name, a.Cfg.Name, aErr,
		)

	// Return any critical errors returned by either bob.
	case bErr != nil && bErr != errConnectionRequested:
		t.Fatalf("ensure connection between %s and %s failed "+
			"with error from %s: %v",
			a.Cfg.Name, b.Cfg.Name, b.Cfg.Name, bErr,
		)

	// Otherwise one or both requested a connection, so we wait for the
	// peers lists to reflect the connection.
	default:
	}

	findSelfInPeerList := func(a, b *HarnessNode) bool {
		// If node B is seen in the ListPeers response from node A,
		// then we can exit early as the connection has been fully
		// established.
		resp, err := b.ListPeers(ctx, &lnrpc.ListPeersRequest{})
		if err != nil {
			return false
		}

		for _, peer := range resp.Peers {
			if peer.PubKey == a.PubKeyStr {
				return true
			}
		}

		return false
	}

	err := wait.Predicate(func() bool {
		return findSelfInPeerList(a, b) && findSelfInPeerList(b, a)
	}, lntest.DefaultTimeout)

	require.NoErrorf(
		t, err, "unable to connect %s to %s, "+
			"got error: peers not connected within %v seconds",
		a.Cfg.Name, b.Cfg.Name, lntest.DefaultTimeout,
	)
}

// ConnectNodes attempts to create a connection between nodes a and b.
func (n *NetworkHarness) ConnectNodes(t *testing.T, a, b *HarnessNode) {
	n.connectNodes(t, a, b, false)
}

// ConnectNodesPerm attempts to connect nodes a and b and sets node b as
// a peer that node a should persistently attempt to reconnect to if they
// become disconnected.
func (n *NetworkHarness) ConnectNodesPerm(t *testing.T,
	a, b *HarnessNode) {

	n.connectNodes(t, a, b, true)
}

// connectNodes establishes an encrypted+authenticated p2p connection from node
// a towards node b. The function will return a non-nil error if the connection
// was unable to be established. If the perm parameter is set to true then
// node a will persistently attempt to reconnect to node b if they get
// disconnected.
//
// NOTE: This function may block for up to 15-seconds as it will not return
// until the new connection is detected as being known to both nodes.
func (n *NetworkHarness) connectNodes(t *testing.T, a, b *HarnessNode,
	perm bool) {

	ctxb := context.Background()
	ctx, cancel := context.WithTimeout(ctxb, lntest.DefaultTimeout)
	defer cancel()

	bobInfo, err := b.GetInfo(ctx, &lnrpc.GetInfoRequest{})
	require.NoErrorf(
		t, err, "unable to connect %s to %s, got error: %v",
		a.Cfg.Name, b.Cfg.Name, err,
	)

	req := &lnrpc.ConnectPeerRequest{
		Addr: &lnrpc.LightningAddress{
			Pubkey: bobInfo.IdentityPubkey,
			Host:   b.Cfg.P2PAddr(),
		},
		Perm: perm,
	}

	err = n.connect(ctx, req, a)
	require.NoErrorf(
		t, err, "unable to connect %s to %s, got error: %v",
		a.Cfg.Name, b.Cfg.Name, err,
	)

	err = wait.Predicate(func() bool {
		// If node B is seen in the ListPeers response from node A,
		// then we can exit early as the connection has been fully
		// established.
		resp, err := a.ListPeers(ctx, &lnrpc.ListPeersRequest{})
		if err != nil {
			return false
		}

		for _, peer := range resp.Peers {
			if peer.PubKey == b.PubKeyStr {
				return true
			}
		}

		return false
	}, lntest.DefaultTimeout)

	require.NoErrorf(
		t, err, "unable to connect %s to %s, "+
			"got error: peers not connected within %v seconds",
		a.Cfg.Name, b.Cfg.Name, lntest.DefaultTimeout,
	)
}

// DisconnectNodes disconnects node a from node b by sending RPC message
// from a node to b node
func (n *NetworkHarness) DisconnectNodes(a, b *HarnessNode) error {
	ctxb := context.Background()
	ctx, cancel := context.WithTimeout(ctxb, lntest.DefaultTimeout)
	defer cancel()

	bobInfo, err := b.GetInfo(ctx, &lnrpc.GetInfoRequest{})
	if err != nil {
		return err
	}

	req := &lnrpc.DisconnectPeerRequest{
		PubKey: bobInfo.IdentityPubkey,
	}

	if _, err := a.DisconnectPeer(ctx, req); err != nil {
		return err
	}

	return nil
}

// RestartNode attempts to restart a lightning node by shutting it down
// cleanly, then restarting the process. This function is fully blocking. Upon
// restart, the RPC connection to the node will be re-attempted, continuing iff
// the connection attempt is successful. If the callback parameter is non-nil,
// then the function will be executed after the node shuts down, but *before*
// the process has been started up again.
//
// This method can be useful when testing edge cases such as a node broadcast
// and invalidated prior state, or persistent state recovery, simulating node
// crashes, etc. Additionally, each time the node is restarted, the caller can
// pass a set of SCBs to pass in via the Unlock method allowing them to restore
// channels during restart.
func (n *NetworkHarness) RestartNode(node *HarnessNode, callback func() error,
	litArgOpts []LitArgOption,
	chanBackups ...*lnrpc.ChanBackupSnapshot) error {

	err := n.RestartNodeNoUnlock(node, callback, true, litArgOpts...)
	if err != nil {
		return err
	}

	// If the node doesn't have a password set, then we can exit here as we
	// don't need to unlock it.
	if len(node.Cfg.Password) == 0 {
		return nil
	}

	// Otherwise, we'll unlock the wallet, then complete the final steps
	// for the node initialization process.
	unlockReq := &lnrpc.UnlockWalletRequest{
		WalletPassword: node.Cfg.Password,
	}
	if len(chanBackups) != 0 {
		unlockReq.ChannelBackups = chanBackups[0]
		unlockReq.RecoveryWindow = 1000
	}

	if err := node.Unlock(context.Background(), unlockReq); err != nil {
		return err
	}

	// Give the node some time to catch up with the chain before we continue
	// with the tests.
	ctxc, done := context.WithTimeout(context.Background(), lntest.DefaultTimeout)
	defer done()
	return node.WaitForBlockchainSync(ctxc)
}

// RestartNodeNoUnlock attempts to restart a lightning node by shutting it down
// cleanly, then restarting the process. In case the node was setup with a seed,
// it will be left in the unlocked state. This function is fully blocking. If
// the callback parameter is non-nil, then the function will be executed after
// the node shuts down, but *before* the process has been started up again.
func (n *NetworkHarness) RestartNodeNoUnlock(node *HarnessNode,
	callback func() error, wait bool, litArgOpts ...LitArgOption) error {

	if err := node.Stop(); err != nil {
		return err
	}

	if callback != nil {
		if err := callback(); err != nil {
			return err
		}
	}

	return node.Start(n.litdBinary, n.lndErrorChan, wait, litArgOpts...)
}

// SuspendNode stops the given node and returns a callback that can be used to
// start it again.
func (n *NetworkHarness) SuspendNode(node *HarnessNode) (func() error, error) {
	if err := node.Stop(); err != nil {
		return nil, err
	}

	restart := func() error {
		return node.Start(n.litdBinary, n.lndErrorChan, true)
	}

	return restart, nil
}

// ShutdownNode stops an active lnd process and returns when the process has
// exited and any temporary directories have been cleaned up.
func (n *NetworkHarness) ShutdownNode(node *HarnessNode) error {
	if err := node.shutdown(); err != nil {
		return err
	}

	delete(n.activeNodes, node.NodeID)
	return nil
}

// KillNode kills the node (but won't wait for the node process to stop).
func (n *NetworkHarness) KillNode(node *HarnessNode) error {
	if err := node.kill(); err != nil {
		return err
	}

	delete(n.activeNodes, node.NodeID)
	return nil
}

// StopNode stops the target node, but doesn't yet clean up its directories.
// This can be used to temporarily bring a node down during a test, to be later
// started up again.
func (n *NetworkHarness) StopNode(node *HarnessNode) error {
	return node.Stop()
}

// OpenChannel attempts to open a channel between srcNode and destNode with the
// passed channel funding parameters. If the passed context has a timeout, then
// if the timeout is reached before the channel pending notification is
// received, an error is returned. The confirmed boolean determines whether we
// should fund the channel with confirmed outputs or not.
func (n *NetworkHarness) OpenChannel(srcNode, destNode *HarnessNode,
	p lntest.OpenChannelParams) (lnrpc.Lightning_OpenChannelClient, error) {

	ctxb := context.Background()

	// The cancel is intentionally left out here because the returned
	// item(open channel client) relies on the context being active. This
	// will be fixed once we finish refactoring the NetworkHarness.
	ctx, _ := context.WithTimeout(ctxb, wait.ChannelOpenTimeout) // nolint: govet

	// Wait until srcNode and destNode have the latest chain synced.
	// Otherwise, we may run into a check within the funding manager that
	// prevents any funding workflows from being kicked off if the chain
	// isn't yet synced.
	if err := srcNode.WaitForBlockchainSync(ctx); err != nil {
		return nil, fmt.Errorf("unable to sync srcNode chain: %v", err)
	}
	if err := destNode.WaitForBlockchainSync(ctx); err != nil {
		return nil, fmt.Errorf("unable to sync destNode chain: %v", err)
	}

	minConfs := int32(1)
	if p.SpendUnconfirmed {
		minConfs = 0
	}

	openReq := &lnrpc.OpenChannelRequest{
		NodePubkey:         destNode.PubKey[:],
		LocalFundingAmount: int64(p.Amt),
		PushSat:            int64(p.PushAmt),
		Private:            p.Private,
		MinConfs:           minConfs,
		SpendUnconfirmed:   p.SpendUnconfirmed,
		MinHtlcMsat:        int64(p.MinHtlc),
		RemoteMaxHtlcs:     uint32(p.RemoteMaxHtlcs),
		FundingShim:        p.FundingShim,
		SatPerByte:         int64(p.SatPerVByte),
		CommitmentType:     p.CommitmentType,
	}

	respStream, err := srcNode.OpenChannel(ctx, openReq)
	if err != nil {
		return nil, fmt.Errorf("unable to open channel between "+
			"alice and bob: %v", err)
	}

	chanOpen := make(chan struct{})
	errChan := make(chan error)
	go func() {
		// Consume the "channel pending" update. This waits until the node
		// notifies us that the final message in the channel funding workflow
		// has been sent to the remote node.
		resp, err := respStream.Recv()
		if err != nil {
			errChan <- err
			return
		}
		if _, ok := resp.Update.(*lnrpc.OpenStatusUpdate_ChanPending); !ok {
			errChan <- fmt.Errorf("expected channel pending update, "+
				"instead got %v", resp)
			return
		}

		close(chanOpen)
	}()

	select {
	case <-ctx.Done():
		return nil, fmt.Errorf("timeout reached before chan pending "+
			"update sent: %v", err)
	case err := <-errChan:
		return nil, err
	case <-chanOpen:
		return respStream, nil
	}
}

// OpenPendingChannel attempts to open a channel between srcNode and destNode with the
// passed channel funding parameters. If the passed context has a timeout, then
// if the timeout is reached before the channel pending notification is
// received, an error is returned.
func (n *NetworkHarness) OpenPendingChannel(srcNode, destNode *HarnessNode,
	amt btcutil.Amount,
	pushAmt btcutil.Amount) (*lnrpc.PendingUpdate, error) {

	ctxb := context.Background()
	ctx, cancel := context.WithTimeout(ctxb, wait.ChannelOpenTimeout)
	defer cancel()

	// Wait until srcNode and destNode have blockchain synced
	if err := srcNode.WaitForBlockchainSync(ctx); err != nil {
		return nil, fmt.Errorf("unable to sync srcNode chain: %v", err)
	}
	if err := destNode.WaitForBlockchainSync(ctx); err != nil {
		return nil, fmt.Errorf("unable to sync destNode chain: %v", err)
	}

	openReq := &lnrpc.OpenChannelRequest{
		NodePubkey:         destNode.PubKey[:],
		LocalFundingAmount: int64(amt),
		PushSat:            int64(pushAmt),
		Private:            false,
	}

	respStream, err := srcNode.OpenChannel(ctx, openReq)
	if err != nil {
		return nil, fmt.Errorf("unable to open channel between "+
			"alice and bob: %v", err)
	}

	chanPending := make(chan *lnrpc.PendingUpdate)
	errChan := make(chan error)
	go func() {
		// Consume the "channel pending" update. This waits until the node
		// notifies us that the final message in the channel funding workflow
		// has been sent to the remote node.
		resp, err := respStream.Recv()
		if err != nil {
			errChan <- err
			return
		}
		pendingResp, ok := resp.Update.(*lnrpc.OpenStatusUpdate_ChanPending)
		if !ok {
			errChan <- fmt.Errorf("expected channel pending update, "+
				"instead got %v", resp)
			return
		}

		chanPending <- pendingResp.ChanPending
	}()

	select {
	case <-ctx.Done():
		return nil, fmt.Errorf("timeout reached before chan pending " +
			"update sent")
	case err := <-errChan:
		return nil, err
	case pendingChan := <-chanPending:
		return pendingChan, nil
	}
}

// WaitForChannelOpen waits for a notification that a channel is open by
// consuming a message from the past open channel stream. If the passed context
// has a timeout, then if the timeout is reached before the channel has been
// opened, then an error is returned.
func (n *NetworkHarness) WaitForChannelOpen(
	openChanStream lnrpc.Lightning_OpenChannelClient) (*lnrpc.ChannelPoint, error) {

	ctxb := context.Background()
	ctx, cancel := context.WithTimeout(ctxb, wait.ChannelOpenTimeout)
	defer cancel()

	errChan := make(chan error)
	respChan := make(chan *lnrpc.ChannelPoint)
	go func() {
		resp, err := openChanStream.Recv()
		if err != nil {
			errChan <- fmt.Errorf("unable to read rpc resp: %v", err)
			return
		}
		fundingResp, ok := resp.Update.(*lnrpc.OpenStatusUpdate_ChanOpen)
		if !ok {
			errChan <- fmt.Errorf("expected channel open update, "+
				"instead got %v", resp)
			return
		}

		respChan <- fundingResp.ChanOpen.ChannelPoint
	}()

	select {
	case <-ctx.Done():
		return nil, fmt.Errorf("timeout reached while waiting for " +
			"channel open")
	case err := <-errChan:
		return nil, err
	case chanPoint := <-respChan:
		return chanPoint, nil
	}
}

// CloseChannel attempts to close the channel indicated by the
// passed channel point, initiated by the passed lnNode. If the passed context
// has a timeout, an error is returned if that timeout is reached before the
// channel close is pending.
func (n *NetworkHarness) CloseChannel(lnNode *HarnessNode,
	cp *lnrpc.ChannelPoint,
	force bool) (lnrpc.Lightning_CloseChannelClient, *chainhash.Hash, error) {

	ctxb := context.Background()
	// The cancel is intentionally left out here because the returned
	// item(close channel client) relies on the context being active. This
	// will be fixed once we finish refactoring the NetworkHarness.
	ctx, _ := context.WithTimeout(ctxb, wait.ChannelCloseTimeout) // nolint: govet

	// Create a channel outpoint that we can use to compare to channels
	// from the ListChannelsResponse.
	txidHash, err := getChanPointFundingTxid(cp)
	if err != nil {
		return nil, nil, err
	}
	fundingTxID, err := chainhash.NewHash(txidHash)
	if err != nil {
		return nil, nil, err
	}
	chanPoint := wire.OutPoint{
		Hash:  *fundingTxID,
		Index: cp.OutputIndex,
	}

	// We'll wait for *both* nodes to read the channel as active if we're
	// performing a cooperative channel closure.
	if !force {
		timeout := lntest.DefaultTimeout
		listReq := &lnrpc.ListChannelsRequest{}

		// We define two helper functions, one two locate a particular
		// channel, and the other to check if a channel is active or
		// not.
		filterChannel := func(node *HarnessNode,
			op wire.OutPoint) (*lnrpc.Channel, error) {

			listResp, err := node.ListChannels(ctx, listReq)
			if err != nil {
				return nil, err
			}

			for _, c := range listResp.Channels {
				if c.ChannelPoint == op.String() {
					return c, nil
				}
			}

			return nil, fmt.Errorf("unable to find channel")
		}
		activeChanPredicate := func(node *HarnessNode) func() bool {
			return func() bool {
				channel, err := filterChannel(node, chanPoint)
				if err != nil {
					return false
				}

				return channel.Active
			}
		}

		// Next, we'll fetch the target channel in order to get the
		// harness node that will be receiving the channel close request.
		targetChan, err := filterChannel(lnNode, chanPoint)
		if err != nil {
			return nil, nil, err
		}
		receivingNode, err := n.LookUpNodeByPub(targetChan.RemotePubkey)
		if err != nil {
			return nil, nil, err
		}

		// Before proceeding, we'll ensure that the channel is active
		// for both nodes.
		err = wait.Predicate(activeChanPredicate(lnNode), timeout)
		if err != nil {
			return nil, nil, fmt.Errorf("channel of closing " +
				"node not active in time")
		}
		err = wait.Predicate(activeChanPredicate(receivingNode), timeout)
		if err != nil {
			return nil, nil, fmt.Errorf("channel of receiving " +
				"node not active in time")
		}
	}

	var (
		closeRespStream lnrpc.Lightning_CloseChannelClient
		closeTxid       *chainhash.Hash
	)

	err = wait.NoError(func() error {
		closeReq := &lnrpc.CloseChannelRequest{
			ChannelPoint: cp, Force: force,
		}
		closeRespStream, err = lnNode.CloseChannel(ctx, closeReq)
		if err != nil {
			return fmt.Errorf("unable to close channel: %v", err)
		}

		// Consume the "channel close" update in order to wait for the
		// closing transaction to be broadcast, then wait for the
		// closing tx to be seen within the network.
		closeResp, err := closeRespStream.Recv()
		if err != nil {
			return fmt.Errorf("unable to recv() from close "+
				"stream: %v", err)
		}
		pendingClose, ok := closeResp.Update.(*lnrpc.CloseStatusUpdate_ClosePending)
		if !ok {
			return fmt.Errorf("expected channel close update, "+
				"instead got %v", pendingClose)
		}

		closeTxid, err = chainhash.NewHash(
			pendingClose.ClosePending.Txid,
		)
		if err != nil {
			return fmt.Errorf("unable to decode closeTxid: "+
				"%v", err)
		}
		n.LNDHarness.Miner.AssertTxInMempool(closeTxid)

		return nil
	}, wait.ChannelCloseTimeout)
	if err != nil {
		return nil, nil, err
	}

	return closeRespStream, closeTxid, nil
}

// WaitForChannelClose waits for a notification from the passed channel close
// stream that the node has deemed the channel has been fully closed. If the
// passed context has a timeout, then if the timeout is reached before the
// notification is received then an error is returned.
func (n *NetworkHarness) WaitForChannelClose(
	closeChanStream lnrpc.Lightning_CloseChannelClient) (*chainhash.Hash, error) {

	ctxb := context.Background()
	ctx, cancel := context.WithTimeout(ctxb, wait.ChannelCloseTimeout)
	defer cancel()

	errChan := make(chan error)
	updateChan := make(chan *lnrpc.CloseStatusUpdate_ChanClose)
	go func() {
		closeResp, err := closeChanStream.Recv()
		if err != nil {
			errChan <- err
			return
		}

		closeFin, ok := closeResp.Update.(*lnrpc.CloseStatusUpdate_ChanClose)
		if !ok {
			errChan <- fmt.Errorf("expected channel close update, "+
				"instead got %v", closeFin)
			return
		}

		updateChan <- closeFin
	}()

	// Wait until either the deadline for the context expires, an error
	// occurs, or the channel close update is received.
	select {
	case <-ctx.Done():
		return nil, fmt.Errorf("timeout reached before update sent")
	case err := <-errChan:
		return nil, err
	case update := <-updateChan:
		return chainhash.NewHash(update.ChanClose.ClosingTxid)
	}
}

// AssertChannelExists asserts that an active channel identified by the
// specified channel point exists from the point-of-view of the node. It takes
// an optional set of check functions which can be used to make further
// assertions using channel's values. These functions are responsible for
// failing the test themselves if they do not pass.
func (n *NetworkHarness) AssertChannelExists(node *HarnessNode,
	chanPoint *wire.OutPoint, checks ...func(*lnrpc.Channel)) error {

	ctxb := context.Background()
	ctx, cancel := context.WithTimeout(ctxb, wait.ChannelCloseTimeout)
	defer cancel()

	req := &lnrpc.ListChannelsRequest{}

	return wait.NoError(func() error {
		resp, err := node.ListChannels(ctx, req)
		if err != nil {
			return fmt.Errorf("unable fetch node's channels: %v", err)
		}

		for _, channel := range resp.Channels {
			if channel.ChannelPoint == chanPoint.String() {
				// First check whether our channel is active,
				// failing early if it is not.
				if !channel.Active {
					return fmt.Errorf("channel %s inactive",
						chanPoint)
				}

				// Apply any additional checks that we would
				// like to verify.
				for _, check := range checks {
					check(channel)
				}

				return nil
			}
		}

		return fmt.Errorf("channel %s not found", chanPoint)
	}, lntest.DefaultTimeout)
}

// DumpLogs reads the current logs generated by the passed node, and returns
// the logs as a single string. This function is useful for examining the logs
// of a particular node in the case of a test failure.
// Logs from lightning node being generated with delay - you should
// add time.Sleep() in order to get all logs.
func (n *NetworkHarness) DumpLogs(node *HarnessNode) (string, error) {
	logFile := fmt.Sprintf("%v/simnet/lnd.log", node.Cfg.LogDir)

	buf, err := ioutil.ReadFile(logFile)
	if err != nil {
		return "", err
	}

	return string(buf), nil
}

// SendCoins attempts to send amt satoshis from the internal mining node to the
// targeted lightning node using a P2WKH address. 6 blocks are mined after in
// order to confirm the transaction.
func (n *NetworkHarness) SendCoins(t *testing.T, amt btcutil.Amount,
	target *HarnessNode) {

	err := n.sendCoins(
		amt, target, lnrpc.AddressType_WITNESS_PUBKEY_HASH, true,
	)
	require.NoErrorf(t, err, "unable to send coins for %s", target.Cfg.Name)
}

// SendCoinsUnconfirmed sends coins from the internal mining node to the target
// lightning node using a P2WPKH address. No blocks are mined after, so the
// transaction remains unconfirmed.
func (n *NetworkHarness) SendCoinsUnconfirmed(t *testing.T, amt btcutil.Amount,
	target *HarnessNode) {

	err := n.sendCoins(
		amt, target, lnrpc.AddressType_WITNESS_PUBKEY_HASH, false,
	)
	require.NoErrorf(
		t, err, "unable to send unconfirmed coins for %s",
		target.Cfg.Name,
	)
}

// sendCoins attempts to send amt satoshis from the internal mining node to the
// targeted lightning node. The confirmed boolean indicates whether the
// transaction that pays to the target should confirm.
func (n *NetworkHarness) sendCoins(amt btcutil.Amount, target *HarnessNode,
	addrType lnrpc.AddressType, confirmed bool) error {

	ctxb := context.Background()
	ctx, cancel := context.WithTimeout(ctxb, lntest.DefaultTimeout)
	defer cancel()

	balReq := &lnrpc.WalletBalanceRequest{}
	initialBalance, err := target.WalletBalance(ctx, balReq)
	if err != nil {
		return err
	}

	// First, obtain an address from the target lightning node, preferring
	// to receive a p2wkh address s.t the output can immediately be used as
	// an input to a funding transaction.
	addrReq := &lnrpc.NewAddressRequest{
		Type: addrType,
	}
	resp, err := target.NewAddress(ctx, addrReq)
	if err != nil {
		return err
	}
	addr, err := btcutil.DecodeAddress(resp.Address, n.netParams)
	if err != nil {
		return err
	}
	addrScript, err := txscript.PayToAddrScript(addr)
	if err != nil {
		return err
	}

	// Generate a transaction which creates an output to the target
	// pkScript of the desired amount.
	output := &wire.TxOut{
		PkScript: addrScript,
		Value:    int64(amt),
	}
	_, err = n.Miner.SendOutputs([]*wire.TxOut{output}, 7500)
	if err != nil {
		return err
	}

	// Encode the pkScript in hex as this the format that it will be
	// returned via rpc.
	expPkScriptStr := hex.EncodeToString(addrScript)

	// Now, wait for ListUnspent to show the unconfirmed transaction
	// containing the correct pkscript.
	err = wait.NoError(func() error {
		req := &lnrpc.ListUnspentRequest{}
		resp, err := target.ListUnspent(ctx, req)
		if err != nil {
			return err
		}

		// When using this method, there should only ever be on
		// unconfirmed transaction.
		if len(resp.Utxos) != 1 {
			return fmt.Errorf("number of unconfirmed utxos "+
				"should be 1, found %d", len(resp.Utxos))
		}

		// Assert that the lone unconfirmed utxo contains the same
		// pkscript as the output generated above.
		pkScriptStr := resp.Utxos[0].PkScript
		if strings.Compare(pkScriptStr, expPkScriptStr) != 0 {
			return fmt.Errorf("pkscript mismatch, want: %s, "+
				"found: %s", expPkScriptStr, pkScriptStr)
		}

		return nil
	}, lntest.DefaultTimeout)
	if err != nil {
		return fmt.Errorf("unconfirmed utxo was not found in "+
			"ListUnspent: %v", err)
	}

	// If the transaction should remain unconfirmed, then we'll wait until
	// the target node's unconfirmed balance reflects the expected balance
	// and exit.
	if !confirmed {
		expectedBalance := btcutil.Amount(initialBalance.UnconfirmedBalance) + amt
		return target.WaitForBalance(expectedBalance, false)
	}

	// Otherwise, we'll generate 6 new blocks to ensure the output gains a
	// sufficient number of confirmations and wait for the balance to
	// reflect what's expected.
	if _, err := n.Miner.Client.Generate(6); err != nil {
		return err
	}

	fullInitialBalance := initialBalance.ConfirmedBalance +
		initialBalance.UnconfirmedBalance
	expectedBalance := btcutil.Amount(fullInitialBalance) + amt
	return target.WaitForBalance(expectedBalance, true)
}

// CopyFile copies the file src to dest.
func CopyFile(dest, src string) error {
	s, err := os.Open(src)
	if err != nil {
		return err
	}
	defer s.Close()

	d, err := os.Create(dest)
	if err != nil {
		return err
	}

	if _, err := io.Copy(d, s); err != nil {
		d.Close()
		return err
	}

	return d.Close()
}
