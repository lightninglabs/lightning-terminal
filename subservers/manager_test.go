package subservers

import (
	"context"
	"errors"
	"testing"

	restProxy "github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
	"github.com/lightninglabs/lightning-terminal/litrpc"
	"github.com/lightninglabs/lightning-terminal/perms"
	"github.com/lightninglabs/lightning-terminal/status"
	"github.com/lightninglabs/lndclient"
	tafn "github.com/lightninglabs/taproot-assets/fn"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/stretchr/testify/require"
	"google.golang.org/grpc"
	"gopkg.in/macaroon-bakery.v2/bakery"
)

// mockSubServer is a lightweight SubServer test double.
type mockSubServer struct {
	// name is returned by Name().
	name string

	// remote toggles Remote() return value.
	remote bool

	// startErr is returned from Start() when set.
	startErr error

	// started tracks whether Start() succeeded.
	started bool
}

// Name returns the mock sub-server name.
func (t *mockSubServer) Name() string {
	return t.name
}

// Remote indicates whether the sub-server runs remotely.
func (t *mockSubServer) Remote() bool {
	return t.remote
}

// RemoteConfig returns nil for the mock.
func (t *mockSubServer) RemoteConfig() *RemoteDaemonConfig {
	return nil
}

// Start marks the server started unless startErr is set.
func (t *mockSubServer) Start(_ lnrpc.LightningClient,
	_ *lndclient.GrpcLndServices, _ bool) error {

	if t.startErr != nil {
		return t.startErr
	}

	t.started = true

	return nil
}

// Stop marks the server as stopped.
func (t *mockSubServer) Stop() error {
	t.started = false
	return nil
}

// RegisterGrpcService is a no-op for the mock.
func (t *mockSubServer) RegisterGrpcService(_ grpc.ServiceRegistrar) {}

// RegisterRestService is a no-op for the mock.
func (t *mockSubServer) RegisterRestService(_ context.Context,
	_ *restProxy.ServeMux, _ string, _ []grpc.DialOption) error {

	return nil
}

// ServerErrChan returns nil for the mock.
func (t *mockSubServer) ServerErrChan() chan error {
	return nil
}

// MacPath returns an empty string for the mock.
func (t *mockSubServer) MacPath() string {
	return ""
}

// Permissions returns nil for the mock.
func (t *mockSubServer) Permissions() map[string][]bakery.Op {
	return nil
}

// WhiteListedURLs returns nil for the mock.
func (t *mockSubServer) WhiteListedURLs() map[string]struct{} {
	return nil
}

// Impl returns an empty option for the mock.
func (t *mockSubServer) Impl() tafn.Option[any] {
	return tafn.None[any]()
}

// ValidateMacaroon always succeeds for the mock.
func (t *mockSubServer) ValidateMacaroon(context.Context,
	[]bakery.Op, string) error {

	return nil
}

// newTestManager creates a Manager and status Manager with permissive perms.
func newTestManager(t *testing.T) (*Manager, *status.Manager) {
	t.Helper()

	permsMgr, err := perms.NewManager(true)
	require.NoError(t, err)

	statusMgr := status.NewStatusManager()

	return NewManager(permsMgr, statusMgr), statusMgr
}

// TestStartIntegratedServersCriticalFailureStopsStartup ensures critical
// startup errors abort integrated startup.
func TestStartIntegratedServersCriticalFailureStopsStartup(t *testing.T) {
	manager, statusMgr := newTestManager(t)

	nonCritical := &mockSubServer{name: "loop"}
	critical := &mockSubServer{
		name:     TAP,
		startErr: errors.New("boom"),
	}

	require.NoError(t, manager.AddServer(nonCritical, true))
	require.NoError(t, manager.AddServer(critical, true))

	err := manager.StartIntegratedServers(nil, nil, true)
	require.Error(t, err)
	require.Contains(t, err.Error(), TAP)

	resp, err := statusMgr.SubServerStatus(
		context.Background(), &litrpc.SubServerStatusReq{},
	)
	require.NoError(t, err)

	statuses := resp.SubServers
	require.Contains(t, statuses, TAP)
	require.Equal(t, "boom", statuses[TAP].Error)
	require.False(t, statuses[TAP].Running)

	require.False(
		t, nonCritical.started, "non-critical sub-server should not "+
			"start after critical failure",
	)
}

// TestStartIntegratedServersNonCriticalFailureContinues verifies non-critical
// startup failures are tolerated.
func TestStartIntegratedServersNonCriticalFailureContinues(t *testing.T) {
	manager, statusMgr := newTestManager(t)

	failing := &mockSubServer{
		name:     "loop",
		startErr: errors.New("start failed"),
	}
	succeeding := &mockSubServer{name: "pool"}

	require.NoError(t, manager.AddServer(failing, true))
	require.NoError(t, manager.AddServer(succeeding, true))

	err := manager.StartIntegratedServers(nil, nil, true)
	require.NoError(t, err)

	resp, err := statusMgr.SubServerStatus(
		context.Background(), &litrpc.SubServerStatusReq{},
	)
	require.NoError(t, err)

	statuses := resp.SubServers

	require.Contains(t, statuses, failing.name)
	require.Equal(t, "start failed", statuses[failing.name].Error)
	require.False(t, statuses[failing.name].Running)

	require.True(t, succeeding.started)
	require.Contains(t, statuses, succeeding.name)
	require.True(t, statuses[succeeding.name].Running)
	require.Empty(t, statuses[succeeding.name].Error)
}
