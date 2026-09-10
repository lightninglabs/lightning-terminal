package subservers

import (
	"context"
	"sync"
	"testing"

	restProxy "github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
	"github.com/lightninglabs/lightning-terminal/status"
	"github.com/lightninglabs/lndclient"
	"github.com/lightninglabs/taproot-assets/fn"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/stretchr/testify/require"
	"google.golang.org/grpc"
	"gopkg.in/macaroon-bakery.v2/bakery"
)

// fakeSubServer is a minimal SubServer implementation that records whether it
// has been started.
type fakeSubServer struct {
	name string

	mu      sync.Mutex
	started bool
}

func (f *fakeSubServer) Name() string {
	return f.name
}

func (f *fakeSubServer) Remote() bool {
	return false
}

func (f *fakeSubServer) RemoteConfig() *RemoteDaemonConfig {
	return nil
}

func (f *fakeSubServer) Start(_ lnrpc.LightningClient,
	_ *lndclient.GrpcLndServices, _ bool) error {

	f.mu.Lock()
	defer f.mu.Unlock()

	f.started = true

	return nil
}

func (f *fakeSubServer) Stop() error {
	return nil
}

func (f *fakeSubServer) RegisterGrpcService(grpc.ServiceRegistrar) {}

func (f *fakeSubServer) RegisterRestService(context.Context,
	*restProxy.ServeMux, string, []grpc.DialOption) error {

	return nil
}

func (f *fakeSubServer) ServerErrChan() chan error {
	return nil
}

func (f *fakeSubServer) MacPath() string {
	return ""
}

func (f *fakeSubServer) Permissions() map[string][]bakery.Op {
	return nil
}

func (f *fakeSubServer) WhiteListedURLs() map[string]struct{} {
	return nil
}

func (f *fakeSubServer) Impl() fn.Option[any] {
	return fn.None[any]()
}

func (f *fakeSubServer) ValidateMacaroon(context.Context, []bakery.Op,
	string) error {

	return nil
}

func (f *fakeSubServer) isStarted() bool {
	f.mu.Lock()
	defer f.mu.Unlock()

	return f.started
}

// newTestManager returns a manager with one fake sub-server for each of the
// integrated daemons, along with the fakes so the test can inspect them.
func newTestManager(t *testing.T) (*Manager, map[string]*fakeSubServer) {
	t.Helper()

	fakes := map[string]*fakeSubServer{
		LOOP:    {name: LOOP},
		POOL:    {name: POOL},
		FARADAY: {name: FARADAY},
		TAP:     {name: TAP},
	}

	servers := make(map[string]*subServerWrapper, len(fakes))
	for name, fake := range fakes {
		servers[name] = &subServerWrapper{SubServer: fake}
	}

	mgr := &Manager{
		servers:      servers,
		statusServer: status.NewStatusManager(),
	}

	return mgr, fakes
}

// TestStartTapdOnlyStartsTapd asserts that StartTapd starts the tapd
// sub-server and nothing else.
func TestStartTapdOnlyStartsTapd(t *testing.T) {
	t.Parallel()

	mgr, fakes := newTestManager(t)

	mgr.StartTapd(nil, nil, false)

	for name, fake := range fakes {
		require.Equal(t, name == TAP, fake.isStarted(), name)
	}
}

// TestStartTapdWithoutTapd asserts that StartTapd is a no-op if tapd isn't
// part of the manager's sub-servers at all.
func TestStartTapdWithoutTapd(t *testing.T) {
	t.Parallel()

	mgr, fakes := newTestManager(t)
	delete(mgr.servers, TAP)

	mgr.StartTapd(nil, nil, false)

	for name, fake := range fakes {
		require.False(t, fake.isStarted(), name)
	}
}

// TestStartRemainingSkipsTapd asserts that StartRemainingIntegratedServers
// starts every integrated sub-server except tapd.
func TestStartRemainingSkipsTapd(t *testing.T) {
	t.Parallel()

	mgr, fakes := newTestManager(t)

	mgr.StartRemainingIntegratedServers(nil, nil, false)

	for name, fake := range fakes {
		require.Equal(t, name != TAP, fake.isStarted(), name)
	}
}
