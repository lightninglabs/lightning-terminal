package terminal

import (
	"net"
	"os"
	"path/filepath"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
)

// TestNotifySystemdReady checks that notifySystemdReady sends the READY=1
// message to the systemd notification socket when NOTIFY_SOCKET is set.
func TestNotifySystemdReady(t *testing.T) {
	// Bind a datagram socket and advertise it as the systemd notify socket.
	dir, err := os.MkdirTemp("", "notify")
	require.NoError(t, err)
	t.Cleanup(func() { _ = os.RemoveAll(dir) })

	socketPath := filepath.Join(dir, "n.sock")
	conn, err := net.ListenUnixgram("unixgram", &net.UnixAddr{
		Name: socketPath,
		Net:  "unixgram",
	})
	require.NoError(t, err)
	t.Cleanup(func() { _ = conn.Close() })

	t.Setenv("NOTIFY_SOCKET", socketPath)

	notifySystemdReady()

	// The ready notification must have arrived on the socket.
	require.NoError(t, conn.SetReadDeadline(time.Now().Add(5*time.Second)))
	buf := make([]byte, 64)
	n, err := conn.Read(buf)
	require.NoError(t, err)
	require.Equal(t, "READY=1", string(buf[:n]))
}

// TestNotifySystemdReadyNoSocket checks that notifySystemdReady is a no-op when
// NOTIFY_SOCKET is not set, i.e. litd is not running under a systemd
// Type=notify unit. It must return normally without blocking or panicking.
func TestNotifySystemdReadyNoSocket(t *testing.T) {
	t.Setenv("NOTIFY_SOCKET", "")
	notifySystemdReady()
}
