package main

import (
	"context"
	"crypto/rand"
	"encoding/binary"
	"encoding/hex"
	"fmt"
	"os"

	"github.com/lightninglabs/lightning-terminal/litrpc"
	"github.com/lightningnetwork/lnd/lncfg"
	"github.com/urfave/cli"
)

var litCommands = []cli.Command{
	{
		Name: "bakesupermacaroon",
		Usage: "Bake a new super macaroon with all of LiT's active " +
			"permissions",
		Description: "Bake a new super macaroon with all of LiT's active " +
			"permissions.",
		Category: "LiT",
		Action:   bakeSuperMacaroon,
		Flags: []cli.Flag{
			cli.StringFlag{
				Name: "root_key_suffix",
				Usage: "A 4-byte suffix to use in the " +
					"construction of the root key ID. " +
					"If not provided, then a random one " +
					"will be generated. This must be " +
					"specified as a hex string using a " +
					"maximum of 8 characters.",
			},
			cli.StringFlag{
				Name: "save_to",
				Usage: "Save returned admin macaroon to " +
					"this file.",
			},
		},
	},
	{
		Name: "getinfo",
		Usage: "Returns basic information related to the active " +
			"daemon",
		Description: "Returns basic information related to the active " +
			"daemon.",
		Category: "LiT",
		Action:   getInfo,
	},
	{
		Name:        "stop",
		Usage:       "Shutdown the LiT daemon",
		Description: "Shutdown the LiT daemon.\n",
		Category:    "LiT",
		Action:      shutdownLit,
	},
}

func getInfo(ctx *cli.Context) error {
	clientConn, cleanup, err := connectClient(ctx, false)
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
	clientConn, cleanup, err := connectClient(ctx, false)
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

func bakeSuperMacaroon(ctx *cli.Context) error {
	var suffixBytes [4]byte
	if ctx.IsSet("root_key_suffix") {
		suffixHex, err := hex.DecodeString(
			ctx.String("root_key_suffix"),
		)
		if err != nil {
			return err
		}

		copy(suffixBytes[:], suffixHex)
	} else {
		_, err := rand.Read(suffixBytes[:])
		if err != nil {
			return err
		}
	}
	suffix := binary.BigEndian.Uint32(suffixBytes[:])

	clientConn, cleanup, err := connectClient(ctx, false)
	if err != nil {
		return err
	}
	defer cleanup()
	client := litrpc.NewProxyClient(clientConn)

	ctxb := context.Background()
	resp, err := client.BakeSuperMacaroon(
		ctxb, &litrpc.BakeSuperMacaroonRequest{
			RootKeyIdSuffix: suffix,
		},
	)
	if err != nil {
		return err
	}

	// If the user specified the optional --save_to parameter, we'll save
	// the macaroon to that file.
	if ctx.IsSet("save_to") {
		macSavePath := lncfg.CleanAndExpandPath(ctx.String("save_to"))
		superMacBytes, err := hex.DecodeString(resp.Macaroon)
		if err != nil {
			return err
		}

		err = os.WriteFile(macSavePath, superMacBytes, 0644)
		if err != nil {
			_ = os.Remove(macSavePath)
			return err
		}
		fmt.Printf("Super macaroon saved to %s\n", macSavePath)

		return nil
	}

	printRespJSON(resp)

	return nil
}
