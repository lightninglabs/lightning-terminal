package main

import (
	"context"

	"github.com/lightninglabs/lightning-terminal/litrpc"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/urfave/cli"
)

var statusCommands = []cli.Command{
	{
		Name:        "status",
		Usage:       "View info about litd status",
		Description: "View info about litd status.\n",
		Category:    "LiT",
		Action:   getStatus,
	},
}

func getStatus(ctx *cli.Context) error {
	clientConn, cleanup, err := connectClient(ctx, true)
	if err != nil {
		return err
	}
	defer cleanup()
	litClient := litrpc.NewStatusClient(clientConn)

	// Get LiT's status.
	ctxb := context.Background()
	litResp, err := litClient.SubServerStatus(
		ctxb, &litrpc.SubServerStatusReq{},
	)
	if err != nil {
		return err
	}

	printRespJSON(litResp)

	// Get LND's state.
	lndClient := lnrpc.NewStateClient(clientConn)
	lndResp, err := lndClient.GetState(ctxb, &lnrpc.GetStateRequest{})
	if err != nil {
		return err
	}

	printRespJSON(lndResp)

	return nil
}
