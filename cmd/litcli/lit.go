package main

import (
	"context"
	"fmt"

	"github.com/lightninglabs/lightning-terminal/litrpc"
	"github.com/urfave/cli"
)

var litCommands = []cli.Command{
	{
		Name:     "stop",
		Usage:    "shutdown the LiT daemon",
		Category: "LiT",
		Action:   shutdownLit,
	},
}

func shutdownLit(ctx *cli.Context) error {
	clientConn, cleanup, err := connectClient(ctx)
	if err != nil {
		return err
	}
	defer cleanup()
	client := litrpc.NewLitServiceClient(clientConn)

	ctxb := context.Background()
	_, err = client.StopDaemon(ctxb, &litrpc.StopDaemonRequest{})
	if err != nil {
		return err
	}

	fmt.Println("Successfully shutdown LiTd")

	return nil
}
