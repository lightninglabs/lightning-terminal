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
	{
		Name: "getinfo",
		Usage: "Returns basic information related to the active " +
			"daemon.",
		Category: "LiT",
		Action:   getInfo,
	},
}

func getInfo(ctx *cli.Context) error {
	clientConn, cleanup, err := connectClient(ctx)
	if err != nil {
		return err
	}
	defer cleanup()
	client := litrpc.NewProxyClient(clientConn)

	ctxb := context.Background()
	resp, err := client.GetInfo(ctxb, &litrpc.GetInfoRequest{})
	if err != nil {
		return err
	}

	printRespJSON(resp)

	return nil
}

func shutdownLit(ctx *cli.Context) error {
	clientConn, cleanup, err := connectClient(ctx)
	if err != nil {
		return err
	}
	defer cleanup()
	client := litrpc.NewProxyClient(clientConn)

	ctxb := context.Background()
	_, err = client.StopDaemon(ctxb, &litrpc.StopDaemonRequest{})
	if err != nil {
		return err
	}

	fmt.Println("Successfully shutdown LiTd")

	return nil
}
