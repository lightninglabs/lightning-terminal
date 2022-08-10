package litrpc

import (
	"github.com/lightninglabs/faraday/frdrpc"
	"github.com/lightninglabs/loop/looprpc"
	"github.com/lightninglabs/pool/poolrpc"
	"github.com/lightningnetwork/lnd/lnrpc"
	"google.golang.org/grpc"
)

// LitdClient is an interface that can be used to access all the subservers
// of Litd.
type LitdClient interface {
	// Lnd returns an lnrpc.LightingClient implementation.
	Lnd() lnrpc.LightningClient

	// Loop returns a looprpc.SwapClientClient implementation.
	Loop() looprpc.SwapClientClient

	// Pool returns a poolrpc.TraderClient implementation.
	Pool() poolrpc.TraderClient

	// Faraday returns a frdrpc.FaradayServerClient implementation.
	Faraday() frdrpc.FaradayServerClient
}

// client is an implementation of the LitdClient.
type client struct {
	lnd     lnrpc.LightningClient
	loop    looprpc.SwapClientClient
	pool    poolrpc.TraderClient
	faraday frdrpc.FaradayServerClient
}

// Lnd returns an lnrpc.LightingClient implementation.
func (c *client) Lnd() lnrpc.LightningClient {
	return c.lnd
}

// Loop returns a looprpc.SwapClientClient implementation.
func (c *client) Loop() looprpc.SwapClientClient {
	return c.loop
}

// Pool returns a poolrpc.TraderClient implementation.
func (c *client) Pool() poolrpc.TraderClient {
	return c.pool
}

// Faraday returns a frdrpc.FaradayServerClient implementation.
func (c *client) Faraday() frdrpc.FaradayServerClient {
	return c.faraday
}

// NewLitdClient constructs a new LitdClient from the passed grpc ClientConn.
func NewLitdClient(cc grpc.ClientConnInterface) LitdClient {
	return &client{
		lnd:     lnrpc.NewLightningClient(cc),
		loop:    looprpc.NewSwapClientClient(cc),
		pool:    poolrpc.NewTraderClient(cc),
		faraday: frdrpc.NewFaradayServerClient(cc),
	}
}
