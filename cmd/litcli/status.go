package main

import (
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
		Action:      getStatus,
	},
}

func getStatus(cli *cli.Context) error {
	clientConn, cleanup, err := connectClient(cli, true)
	if err != nil {
		return err
	}
	defer cleanup()
	litClient := litrpc.NewStatusClient(clientConn)

	// Get LiT's status.
	ctx := getContext()
	litResp, err := litClient.SubServerStatus(
		ctx, &litrpc.SubServerStatusReq{},
	)
	if err != nil {
		return err
	}

	printRespJSON(litResp)

	// Get LND's state.
	lndClient := lnrpc.NewStateClient(clientConn)
	lndResp, err := lndClient.GetState(ctx, &lnrpc.GetStateRequest{})
	if err != nil {
		return err
	}

	printRespJSON(lndResp)

	return nil
}
