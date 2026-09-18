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
