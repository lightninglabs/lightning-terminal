package session

import (
	"context"
	"crypto/tls"
	"net"

	"google.golang.org/grpc/credentials"
)

const http2Proto = "h2"

// NewMailboxTLSCredentials creates transport credentials for mailbox
// connections. Unlike grpc's default TLS credentials, this allows endpoints
// that don't negotiate ALPN yet. This is needed as a workaround for grpc-go
// v1.67.0 ALPN enforcement added by https://github.com/grpc/grpc-go/pull/7535
//
// TODO: remove this file when all target mailbox endpoints support ALPN.
func NewMailboxTLSCredentials(
	config *tls.Config) credentials.TransportCredentials {

	tlsConfig := &tls.Config{}
	if config != nil {
		tlsConfig = config.Clone()
	}

	return &mailboxTLSCreds{config: tlsConfig}
}

// mailboxTLSCreds is a mailbox-specific TransportCredentials implementation
// that keeps TLS enabled but tolerates peers that do not negotiate ALPN.
type mailboxTLSCreds struct {
	config *tls.Config
}

// ClientHandshake performs the client side TLS handshake for mailbox links
// while allowing an empty negotiated ALPN value from the remote endpoint.
func (c *mailboxTLSCreds) ClientHandshake(ctx context.Context, authority string,
	rawConn net.Conn) (_ net.Conn, _ credentials.AuthInfo, err error) {

	cfg := c.config.Clone()
	if cfg.ServerName == "" {
		serverName, _, err := net.SplitHostPort(authority)
		if err != nil {
			serverName = authority
		}
		cfg.ServerName = serverName
	}

	cfg.NextProtos = appendH2(cfg.NextProtos)

	conn := tls.Client(rawConn, cfg)
	if err := conn.HandshakeContext(ctx); err != nil {
		_ = conn.Close()

		return nil, nil, err
	}

	return conn, tlsAuthInfo(conn.ConnectionState()), nil
}

// ServerHandshake performs the server side TLS handshake for mailbox links
// while allowing an empty negotiated ALPN value from the peer.
func (c *mailboxTLSCreds) ServerHandshake(rawConn net.Conn) (
	net.Conn, credentials.AuthInfo, error) {

	cfg := c.config.Clone()
	cfg.NextProtos = appendH2(cfg.NextProtos)

	conn := tls.Server(rawConn, cfg)
	if err := conn.Handshake(); err != nil {
		_ = conn.Close()

		return nil, nil, err
	}

	return conn, tlsAuthInfo(conn.ConnectionState()), nil
}

// Info returns protocol metadata for these transport credentials.
func (c *mailboxTLSCreds) Info() credentials.ProtocolInfo {
	return credentials.ProtocolInfo{
		SecurityProtocol: "tls",
		SecurityVersion:  "1.2",
		ServerName:       c.config.ServerName,
	}
}

// Clone returns a copy of these transport credentials.
func (c *mailboxTLSCreds) Clone() credentials.TransportCredentials {
	return &mailboxTLSCreds{config: c.config.Clone()}
}

// OverrideServerName overrides the TLS server name used by the client side
// handshake.
func (c *mailboxTLSCreds) OverrideServerName(serverNameOverride string) error {
	c.config.ServerName = serverNameOverride

	return nil
}

// tlsAuthInfo builds credentials.AuthInfo from TLS connection state.
func tlsAuthInfo(state tls.ConnectionState) credentials.TLSInfo {
	return credentials.TLSInfo{
		State: state,
		CommonAuthInfo: credentials.CommonAuthInfo{
			SecurityLevel: credentials.PrivacyAndIntegrity,
		},
	}
}

// appendH2 ensures "h2" is present in the ALPN protocol list.
func appendH2(nextProtos []string) []string {
	for _, proto := range nextProtos {
		if proto == http2Proto {
			return nextProtos
		}
	}

	return append(nextProtos, http2Proto)
}
