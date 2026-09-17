package terminal

import (
	"net"
	"path/filepath"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
)

// bindNotifySocket binds a datagram socket in a temp dir and advertises it as
// the systemd notify socket via NOTIFY_SOCKET. It returns the connection so a
// test can read the message the notify function sends.
func bindNotifySocket(t *testing.T) *net.UnixConn {
	socketPath := filepath.Join(t.TempDir(), "n.sock")
	conn, err := net.ListenUnixgram("unixgram", &net.UnixAddr{
		Name: socketPath,
		Net:  "unixgram",
	})
	require.NoError(t, err)
	t.Cleanup(func() { _ = conn.Close() })

	t.Setenv("NOTIFY_SOCKET", socketPath)

	return conn
}

// requireNotification reads one datagram from the notify socket and asserts it
// equals want.
func requireNotification(t *testing.T, conn *net.UnixConn, want string) {
	require.NoError(t, conn.SetReadDeadline(time.Now().Add(5*time.Second)))

	buf := make([]byte, 64)
	n, err := conn.Read(buf)
	require.NoError(t, err)
	require.Equal(t, want, string(buf[:n]))
}

// TestNotifySystemdReady checks that notifySystemdReady sends READY=1 to the
// systemd notification socket and reports that it notified.
func TestNotifySystemdReady(t *testing.T) {
	conn := bindNotifySocket(t)

	notified, err := notifySystemdReady()
	require.NoError(t, err)
	require.True(t, notified)

	requireNotification(t, conn, "READY=1")
}

// TestNotifySystemdReadyNoSocket checks that notifySystemdReady is a no-op when
// NOTIFY_SOCKET is not set, i.e. litd is not running under a systemd
// Type=notify unit. It reports no notification and no error.
func TestNotifySystemdReadyNoSocket(t *testing.T) {
	t.Setenv("NOTIFY_SOCKET", "")

	notified, err := notifySystemdReady()
	require.NoError(t, err)
	require.False(t, notified)
}

// TestNotifySystemdStopping checks that notifySystemdStopping sends STOPPING=1
// to the systemd notification socket and reports that it notified.
func TestNotifySystemdStopping(t *testing.T) {
	conn := bindNotifySocket(t)

	notified, err := notifySystemdStopping()
	require.NoError(t, err)
	require.True(t, notified)

	requireNotification(t, conn, "STOPPING=1")
}

// TestNotifySystemdStoppingNoSocket checks that notifySystemdStopping is a
// no-op when NOTIFY_SOCKET is not set. It reports no notification and no
// error.
func TestNotifySystemdStoppingNoSocket(t *testing.T) {
	t.Setenv("NOTIFY_SOCKET", "")

	notified, err := notifySystemdStopping()
	require.NoError(t, err)
	require.False(t, notified)
}
