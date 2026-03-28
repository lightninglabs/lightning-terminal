package subservers

import (
	"context"
	"errors"
	"fmt"
	"testing"

	restProxy "github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
	"github.com/lightninglabs/lightning-terminal/status"
	"github.com/lightninglabs/lndclient"
	"github.com/lightninglabs/taproot-assets/fn"
	"github.com/lightningnetwork/lnd/lnrpc"
	"google.golang.org/grpc"
	"gopkg.in/macaroon-bakery.v2/bakery"
)

// mockSubServer is a minimal implementation of the SubServer interface for
// testing.
type mockSubServer struct {
	name     string
	remote   bool
	startErr error
}

var _ SubServer = (*mockSubServer)(nil)

func (m *mockSubServer) Name() string    { return m.name }
func (m *mockSubServer) Remote() bool    { return m.remote }
func (m *mockSubServer) MacPath() string { return "" }

func (m *mockSubServer) RemoteConfig() *RemoteDaemonConfig {
	return &RemoteDaemonConfig{}
}

func (m *mockSubServer) Start(_ lnrpc.LightningClient,
	_ *lndclient.GrpcLndServices, _ bool) error {

	return m.startErr
}

func (m *mockSubServer) Stop() error { return nil }

func (m *mockSubServer) RegisterGrpcService(_ grpc.ServiceRegistrar) {}

func (m *mockSubServer) RegisterRestService(_ context.Context,
	_ *restProxy.ServeMux, _ string, _ []grpc.DialOption) error {

	return nil
}

func (m *mockSubServer) ServerErrChan() chan error { return nil }

func (m *mockSubServer) Permissions() map[string][]bakery.Op {
	return nil
}

func (m *mockSubServer) WhiteListedURLs() map[string]struct{} {
	return nil
}

func (m *mockSubServer) Impl() fn.Option[any] {
	return fn.None[any]()
}

func (m *mockSubServer) ValidateMacaroon(_ context.Context,
	_ []bakery.Op, _ string) error {

	return nil
}

func newTestManager() *Manager {
	return &Manager{
		servers:      make(map[string]*subServerWrapper),
		statusServer: status.NewStatusManager(),
		critical:     make(map[string]bool),
	}
}

// addMockServer registers a mock sub-server directly in the manager's internal
// map, bypassing AddServer (which requires a functional perms.Manager). The
// status manager is also updated to track the sub-server.
func addMockServer(t *testing.T, mgr *Manager, mock *mockSubServer) {
	t.Helper()

	err := mgr.statusServer.RegisterSubServer(mock.Name())
	if err != nil {
		t.Fatalf("failed to register sub-server %s with status "+
			"manager: %v", mock.Name(), err)
	}

	mgr.statusServer.SetEnabled(mock.Name())

	mgr.servers[mock.Name()] = &subServerWrapper{
		SubServer: mock,
		quit:      make(chan struct{}),
	}
}

// TestStartIntegratedServersCriticalFailure verifies that
// StartIntegratedServers returns an error when a critical sub-server fails to
// start, while still attempting to start all other sub-servers.
func TestStartIntegratedServersCriticalFailure(t *testing.T) {
	mgr := newTestManager()

	failErr := errors.New("tapd init failed")
	tapMock := &mockSubServer{name: TAP, startErr: failErr}
	loopMock := &mockSubServer{name: LOOP}
	faradayMock := &mockSubServer{name: FARADAY}

	addMockServer(t, mgr, tapMock)
	addMockServer(t, mgr, loopMock)
	addMockServer(t, mgr, faradayMock)

	mgr.SetCritical(TAP)

	err := mgr.StartIntegratedServers(nil, nil, false)
	if err == nil {
		t.Fatal("expected error from StartIntegratedServers when " +
			"critical sub-server fails, got nil")
	}

	if !errors.Is(err, failErr) {
		t.Fatalf("expected wrapped error to contain %v, got: %v",
			failErr, err)
	}

	// Verify non-critical servers were still started despite the critical
	// failure (map iteration order is random, so we check both).
	for _, name := range []string{LOOP, FARADAY} {
		ss, ok := mgr.servers[name]
		if !ok {
			t.Fatalf("server %s not found", name)
		}
		if !ss.started() {
			t.Errorf("non-critical server %s should have been "+
				"started even though critical server failed",
				name)
		}
	}
}

// TestStartIntegratedServersNonCriticalFailure verifies that
// StartIntegratedServers does NOT return an error when a non-critical
// sub-server fails.
func TestStartIntegratedServersNonCriticalFailure(t *testing.T) {
	mgr := newTestManager()

	loopMock := &mockSubServer{
		name:     LOOP,
		startErr: errors.New("loop init failed"),
	}
	tapMock := &mockSubServer{name: TAP}

	addMockServer(t, mgr, loopMock)
	addMockServer(t, mgr, tapMock)

	mgr.SetCritical(TAP)

	err := mgr.StartIntegratedServers(nil, nil, false)
	if err != nil {
		t.Fatalf("non-critical failure should not cause error, "+
			"got: %v", err)
	}
}

// TestStartIntegratedServersNoCritical verifies the original behavior: when
// no servers are marked critical, all errors are non-fatal.
func TestStartIntegratedServersNoCritical(t *testing.T) {
	mgr := newTestManager()

	tapMock := &mockSubServer{
		name:     TAP,
		startErr: errors.New("tapd init failed"),
	}
	addMockServer(t, mgr, tapMock)

	// No SetCritical call.
	err := mgr.StartIntegratedServers(nil, nil, false)
	if err != nil {
		t.Fatalf("without critical servers, no error should be "+
			"returned, got: %v", err)
	}
}

// TestStartIntegratedServersCriticalDisabled verifies that marking a server
// as critical has no effect if the server was never added (i.e., disabled).
func TestStartIntegratedServersCriticalDisabled(t *testing.T) {
	mgr := newTestManager()

	loopMock := &mockSubServer{name: LOOP}
	addMockServer(t, mgr, loopMock)

	// Mark TAP as critical but don't add it — simulates
	// taproot-assets-mode=disable where AddServer is called with
	// enable=false.
	mgr.SetCritical(TAP)

	err := mgr.StartIntegratedServers(nil, nil, false)
	if err != nil {
		t.Fatalf("critical server that is disabled should not "+
			"cause error, got: %v", err)
	}
}

// TestStatusSetOnCriticalFailure verifies that the status manager correctly
// records the error for a critical sub-server that fails.
func TestStatusSetOnCriticalFailure(t *testing.T) {
	mgr := newTestManager()

	tapMock := &mockSubServer{
		name:     TAP,
		startErr: fmt.Errorf("database corrupt"),
	}
	addMockServer(t, mgr, tapMock)
	mgr.SetCritical(TAP)

	_ = mgr.StartIntegratedServers(nil, nil, false)

	resp, err := mgr.statusServer.SubServerStatus(
		context.Background(), nil,
	)
	if err != nil {
		t.Fatalf("failed to query status: %v", err)
	}

	tapStatus, ok := resp.SubServers[TAP]
	if !ok {
		t.Fatal("TAP not found in status response")
	}

	if tapStatus.Running {
		t.Error("TAP should not be marked as running")
	}

	if tapStatus.Error == "" {
		t.Error("TAP should have an error message set")
	}
}
