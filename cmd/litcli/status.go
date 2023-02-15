package main

import (
	"context"

	"github.com/lightninglabs/lightning-terminal/litrpc"
	"github.com/urfave/cli"
)

var statusCommands = []cli.Command{
	{
		Name:     "status",
		Usage:    "info about litd status",
		Category: "Status",
		Action:   getStatus,
	},
}

func getStatus(ctx *cli.Context) error {
	clientConn, cleanup, err := connectClient(ctx)
	if err != nil {
		return err
	}
	defer cleanup()
	client := litrpc.NewStatusClient(clientConn)

	ctxb := context.Background()
	resp, err := client.SubServerState(
		ctxb, &litrpc.SubServerStatusReq{},
	)
	if err != nil {
		return err
	}

	printRespJSON(resp)

	return nil
}
