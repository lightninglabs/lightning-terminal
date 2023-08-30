package autopilotserver

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/btcsuite/btcd/btcec/v2"
	"github.com/lightninglabs/lightning-terminal/autopilotserver/mock"
	"github.com/lightningnetwork/lnd/lntest/wait"
	"github.com/stretchr/testify/require"
)

// TestAutopilotClient tests that the Client correctly interacts with the
// Autopilot server.
func TestAutopilotClient(t *testing.T) {
	ctx := context.Background()

	// Spin up a new mock Autopilot server.
	server := mock.NewServer()
	require.NoError(t, server.Start())
	t.Cleanup(server.Stop)

	// Create a new client and connect it to the mock server. We set a very
	// short ping cadence so that we can test that the client correctly
	// ensures re-activation of a session.
	addr := fmt.Sprintf("localhost:%d", server.GetPort())
	client, err := NewClient(&Config{
		Address:     addr,
		Insecure:    true,
		PingCadence: time.Second,
	})
	require.NoError(t, err)
	require.NoError(t, client.Start())
	t.Cleanup(client.Stop)

	privKey, err := btcec.NewPrivateKey()
	require.NoError(t, err)
	pubKey := privKey.PubKey()

	// Activating a session that the server does not yet know about should
	// error.
	_, err = client.ActivateSession(ctx, pubKey)
	require.ErrorContains(t, err, "no such client")

	// Register the client.
	_, err = client.RegisterSession(ctx, pubKey, "", false, nil, nil, nil)
	require.NoError(t, err)

	// Assert that the server sees the new client and has it in the Active
	// state.
	state, err := server.GetClientState(pubKey)
	require.NoError(t, err)
	require.True(t, mock.ClientStateActive == state)

	// Let the server move the client to an Inactive state.
	err = server.SetClientState(pubKey, mock.ClientStateInactive)
	require.NoError(t, err)
	state, err = server.GetClientState(pubKey)
	require.NoError(t, err)
	require.True(t, mock.ClientStateInactive == state)

	// Manually inform the server that the session is active.
	_, err = client.ActivateSession(ctx, pubKey)
	require.NoError(t, err)

	// Assert that the server moved the client to the Active state.
	state, err = server.GetClientState(pubKey)
	require.NoError(t, err)
	require.True(t, mock.ClientStateActive == state)

	// Once again, let the server move the client to the inactive state.
	err = server.SetClientState(pubKey, mock.ClientStateInactive)
	require.NoError(t, err)
	state, err = server.GetClientState(pubKey)
	require.NoError(t, err)
	require.True(t, mock.ClientStateInactive == state)

	// Now wait for client to re-activate the session with the server
	err = wait.Predicate(func() bool {
		state, err = server.GetClientState(pubKey)
		require.NoError(t, err)
		return state == mock.ClientStateActive
	}, time.Second*5)
	require.NoError(t, err)
}
