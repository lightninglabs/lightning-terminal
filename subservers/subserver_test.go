package subservers

import (
	"net"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
	"google.golang.org/grpc"
	"google.golang.org/grpc/connectivity"
	"google.golang.org/grpc/credentials/insecure"
)

// nameOnlySubServer is a stub SubServer that only implements Name and Remote,
// the methods that watchRemoteConn and stop rely on.
type nameOnlySubServer struct {
	SubServer

	name string
}

func (n *nameOnlySubServer) Name() string {
	return n.name
}

func (n *nameOnlySubServer) Remote() bool {
	return true
}

// TestWatchRemoteConn asserts that a remote sub-server's runtime disconnect and
// recovery are reported through the status callbacks, so the status server no
// longer keeps a sub-server marked as running after it disconnects.
func TestWatchRemoteConn(t *testing.T) {
	t.Parallel()

	// Start a real gRPC server so the client connection has a backend to
	// connect to.
	lis, err := net.Listen("tcp", "127.0.0.1:0")
	require.NoError(t, err)
	addr := lis.Addr().String()

	srv := grpc.NewServer()
	go func() {
		_ = srv.Serve(lis)
	}()

	conn, err := grpc.NewClient(
		addr, grpc.WithTransportCredentials(insecure.NewCredentials()),
	)
	require.NoError(t, err)

	ss := &subServerWrapper{
		SubServer:  &nameOnlySubServer{name: "test"},
		remoteConn: conn,
		quit:       make(chan struct{}),
	}

	erroredChan := make(chan struct{}, 8)
	runningChan := make(chan struct{}, 8)
	watch := func() {
		ss.watchRemoteConn(
			func(error) { erroredChan <- struct{}{} },
			func() { runningChan <- struct{}{} },
		)
	}

	// The second call must not start another watcher, or each transition
	// would be reported twice.
	watch()
	watch()
	defer func() {
		require.NoError(t, ss.stop())
	}()

	// Wait until the connection is ready so the watcher starts from a
	// healthy state before we take the backend down.
	require.Eventually(t, func() bool {
		conn.Connect()
		return conn.GetState() == connectivity.Ready
	}, 10*time.Second, 50*time.Millisecond)

	// Take the backend down: the watcher must report the disconnect.
	// Stop also closes the listener it was serving on.
	srv.Stop()

	select {
	case <-erroredChan:
	case <-time.After(10 * time.Second):
		t.Fatal("expected the disconnect to be reported")
	}

	// A second watcher would report the same transition again.
	select {
	case <-erroredChan:
		t.Fatal("disconnect reported twice")
	case <-time.After(time.Second):
	}

	// Bring the backend back on the same address: the watcher must report
	// that the sub-server is running again.
	var lis2 net.Listener
	require.Eventually(t, func() bool {
		lis2, err = net.Listen("tcp", addr)
		return err == nil
	}, 10*time.Second, 100*time.Millisecond)

	srv2 := grpc.NewServer()
	go func() {
		_ = srv2.Serve(lis2)
	}()
	defer srv2.Stop()

	select {
	case <-runningChan:
	case <-time.After(20 * time.Second):
		t.Fatal("expected the recovery to be reported")
	}
}
