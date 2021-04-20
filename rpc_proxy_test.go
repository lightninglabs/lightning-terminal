package terminal

import (
	"context"
	"fmt"
	"testing"

	"google.golang.org/grpc/metadata"
)

// Test that getLndConnectStr successfully retrieves the host, macaroon, and
// tls certificate from an lndconnect string.
func TestGetLndConnectStr(t *testing.T) {
	// Set up a terminal and rpcProxy for testing purposes.
	terminal := &LightningTerminal{}
	cfg := &Config{
		Remote: &RemoteConfig{
			Lnd: &RemoteDaemonConfig{},
		},
		LndMode: ModeStatelessRemote,
	}
	terminal.cfg = cfg

	rpcProxy := newRpcProxy(terminal.cfg, terminal, getAllPermissions())
	terminal.rpcProxy = rpcProxy

	host := "localhost"
	port := "10000"
	dummyMacStr := "0201047465737402067788991234560000062052d26ed139ea5af8" +
		"3e675500c4ccb2471f62191b745bab820f129e5588a255d2"
	testCert := "testCert"
	metadataMap := make(map[string]string)
	metadataMap["authorization"] = fmt.Sprintf("Macaroon lndconnect://%s"+
		":%s?cert=%s&macaroon=%s", host, port, testCert, dummyMacStr)
	md := metadata.New(metadataMap)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	ctx = metadata.NewIncomingContext(ctx, md)

	// Call rpcProxy's getMacaroon method to see if it works as expected.
	newCtx, err := terminal.rpcProxy.getLndConnectStr(ctx)
	if err != nil {
		t.Fatalf("Could not retrieve macaroon from lndconnect "+
			"string: %v", err)
	}

	// Check that the output context carries the macaroon as it should.
	md, ok := metadata.FromIncomingContext(newCtx)
	if !ok {
		t.Fatalf("Could not retrieve metadata from context.")
	}

	mac := md.Get("Macaroon")

	if mac[0] != dummyMacStr {
		t.Fatalf("Macaroon header metadata not set correctly.")
	}

	if cfg.Remote.Lnd.Macaroon != dummyMacStr && cfg.Remote.Lnd.TLSCert != testCert {
		t.Fatal("lnd info was not set correctly")
	}
}
