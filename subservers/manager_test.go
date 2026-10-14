package subservers

import (
	"context"
	"net"
	"path/filepath"
	"testing"
	"time"

	"github.com/lightninglabs/lightning-terminal/litrpc"
	"github.com/lightninglabs/lightning-terminal/perms"
	"github.com/lightninglabs/lightning-terminal/status"
	"github.com/lightningnetwork/lnd/cert"
	"github.com/stretchr/testify/require"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
	"gopkg.in/macaroon-bakery.v2/bakery"
)

// TestRemoteSubServerStatus asserts that the status server follows a remote
// sub-server's connection after startup, so a runtime disconnect is no longer
// reported as running.
func TestRemoteSubServerStatus(t *testing.T) {
	t.Parallel()

	certFile, creds := genTestCert(t)

	lis, err := net.Listen("tcp", "127.0.0.1:0")
	require.NoError(t, err)
	addr := lis.Addr().String()

	srv := grpc.NewServer(grpc.Creds(creds))
	go func() {
		_ = srv.Serve(lis)
	}()

	permsMgr, err := perms.NewManager(false)
	require.NoError(t, err)

	statusMgr := status.NewStatusManager()
	mgr := NewManager(permsMgr, statusMgr)

	faraday := NewFaradaySubServer(nil, &RemoteDaemonConfig{
		RPCServer:   addr,
		TLSCertPath: certFile,
	}, true)
	require.NoError(t, mgr.AddServer(faraday, true))

	mgr.ConnectRemoteSubServers()
	defer func() {
		require.NoError(t, mgr.Stop())
	}()

	running := func() bool {
		resp, err := statusMgr.SubServerStatus(
			context.Background(), &litrpc.SubServerStatusReq{},
		)
		require.NoError(t, err)

		return resp.SubServers[faraday.Name()].Running
	}

	require.True(t, running())

	// Take the remote sub-server down: it must no longer be reported as
	// running.
	srv.Stop()
	require.Eventually(t, func() bool {
		return !running()
	}, 30*time.Second, 200*time.Millisecond)

	// Bring it back up on the same address: it must be reported as running
	// again.
	var lis2 net.Listener
	require.Eventually(t, func() bool {
		lis2, err = net.Listen("tcp", addr)

		return err == nil
	}, 10*time.Second, 100*time.Millisecond)

	srv2 := grpc.NewServer(grpc.Creds(creds))
	go func() {
		_ = srv2.Serve(lis2)
	}()
	defer srv2.Stop()

	require.Eventually(t, running, 30*time.Second, 200*time.Millisecond)
}

// stopCountSubServer is a stub SubServer that counts the calls to its
// integrated Stop.
type stopCountSubServer struct {
	SubServer

	name   string
	remote bool
	stops  int
}

func (s *stopCountSubServer) Name() string {
	return s.name
}

func (s *stopCountSubServer) Remote() bool {
	return s.remote
}

func (s *stopCountSubServer) Stop() error {
	s.stops++
	return nil
}

func (s *stopCountSubServer) ServerErrChan() chan error {
	return nil
}

func (s *stopCountSubServer) Permissions() map[string][]bakery.Op {
	return nil
}

func (s *stopCountSubServer) WhiteListedURLs() map[string]struct{} {
	return nil
}

// TestManagerStopMixed asserts that Manager.Stop only calls the integrated
// Stop of an integrated sub-server that started. A remote sub-server with no
// connection and an integrated sub-server that never started have no process
// to stop.
func TestManagerStopMixed(t *testing.T) {
	t.Parallel()

	permsMgr, err := perms.NewManager(false)
	require.NoError(t, err)

	mgr := NewManager(permsMgr, status.NewStatusManager())

	remote := &stopCountSubServer{name: "remote", remote: true}
	neverStarted := &stopCountSubServer{name: "never-started"}
	started := &stopCountSubServer{name: "started"}
	for _, ss := range []SubServer{remote, neverStarted, started} {
		require.NoError(t, mgr.AddServer(ss, true))
	}
	mgr.servers[started.Name()].setStarted(true)

	require.NoError(t, mgr.Stop())

	require.Zero(t, remote.stops)
	require.Zero(t, neverStarted.stops)
	require.Equal(t, 1, started.stops)
}

// genTestCert writes a self-signed certificate pair to a temporary directory
// and returns the certificate path along with the server credentials for it.
func genTestCert(t *testing.T) (string, credentials.TransportCredentials) {
	t.Helper()

	dir := t.TempDir()
	certFile := filepath.Join(dir, "proxy.cert")
	keyFile := filepath.Join(dir, "proxy.key")

	certBytes, keyBytes, err := cert.GenCertPair(
		"litd test cert", nil, nil, false, 24*time.Hour,
	)
	require.NoError(t, err)
	require.NoError(t, cert.WriteCertPair(
		certFile, keyFile, certBytes, keyBytes,
	))

	creds, err := credentials.NewServerTLSFromFile(certFile, keyFile)
	require.NoError(t, err)

	return certFile, creds
}
