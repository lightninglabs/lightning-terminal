package terminal

import (
	"context"
	"crypto/tls"
	"fmt"
	"net"

	grpcProxy "github.com/mwitkow/grpc-proxy/proxy"
	"google.golang.org/grpc"
	"google.golang.org/grpc/backoff"
	"google.golang.org/grpc/credentials"
	"google.golang.org/grpc/test/bufconn"
)

// connectLND sets up LiT's LND connection.
func connectLND(cfg *Config, bufListener *bufconn.Listener) (*grpc.ClientConn,
	error) {

	if cfg.lndRemote {
		host, _, tlsPath, _, _ := cfg.lndConnectParams()
		return dialBackend("lnd", host, tlsPath)
	}

	// If LND is running in integrated mode, then we use a bufconn to
	// connect to lnd in integrated mode.
	return dialBufConnBackend(bufListener)
}

// dialBackend connects to a gRPC backend through the given address and uses the
// given TLS certificate to authenticate the connection.
func dialBackend(name, dialAddr, tlsCertPath string) (*grpc.ClientConn, error) {
	tlsConfig, err := credentials.NewClientTLSFromFile(tlsCertPath, "")
	if err != nil {
		return nil, fmt.Errorf("could not read %s TLS cert %s: %v",
			name, tlsCertPath, err)
	}

	opts := []grpc.DialOption{
		// From the grpcProxy doc: This codec is *crucial* to the
		// functioning of the proxy.
		grpc.WithCodec(grpcProxy.Codec()), // nolint
		grpc.WithTransportCredentials(tlsConfig),
		grpc.WithDefaultCallOptions(maxMsgRecvSize),
		grpc.WithConnectParams(grpc.ConnectParams{
			Backoff:           backoff.DefaultConfig,
			MinConnectTimeout: defaultConnectTimeout,
		}),
	}

	log.Infof("Dialing %s gRPC server at %s", name, dialAddr)
	cc, err := grpc.Dial(dialAddr, opts...)
	if err != nil {
		return nil, fmt.Errorf("failed dialing %s backend: %v", name,
			err)
	}
	return cc, nil
}

// dialBufConnBackend dials an in-memory connection to an RPC listener and
// ignores any TLS certificate mismatches.
func dialBufConnBackend(listener *bufconn.Listener) (*grpc.ClientConn, error) {
	tlsConfig := credentials.NewTLS(&tls.Config{
		InsecureSkipVerify: true,
	})

	opts := []grpc.DialOption{
		grpc.WithContextDialer(
			func(context.Context, string) (net.Conn, error) {
				return listener.Dial()
			},
		),
		// From the grpcProxy doc: This codec is *crucial* to the
		// functioning of the proxy.
		grpc.WithCodec(grpcProxy.Codec()), // nolint
		grpc.WithTransportCredentials(tlsConfig),
		grpc.WithDefaultCallOptions(maxMsgRecvSize),
		grpc.WithConnectParams(grpc.ConnectParams{
			Backoff:           backoff.DefaultConfig,
			MinConnectTimeout: defaultConnectTimeout,
		}),
	}

	return grpc.Dial("", opts...)
}
