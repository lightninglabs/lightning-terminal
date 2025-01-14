package main

import (
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
			cli.BoolFlag{
				Name: "read_only",
				Usage: "Whether the macaroon should " +
					"only contain read permissions.",
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

func getInfo(cli *cli.Context) error {
	clientConn, cleanup, err := connectClient(cli, false)
	if err != nil {
		return err
	}
	defer cleanup()
	client := litrpc.NewProxyClient(clientConn)

	ctx := getContext()
	resp, err := client.GetInfo(ctx, &litrpc.GetInfoRequest{})
	if err != nil {
		return err
	}

	printRespJSON(resp)

	return nil
}

func shutdownLit(cli *cli.Context) error {
	clientConn, cleanup, err := connectClient(cli, false)
	if err != nil {
		return err
	}
	defer cleanup()
	client := litrpc.NewProxyClient(clientConn)

	ctx := getContext()
	_, err = client.StopDaemon(ctx, &litrpc.StopDaemonRequest{})
	if err != nil {
		return err
	}

	fmt.Println("Successfully shutdown LiTd")

	return nil
}

func bakeSuperMacaroon(cli *cli.Context) error {
	var suffixBytes [4]byte
	if cli.IsSet("root_key_suffix") {
		suffixHex, err := hex.DecodeString(
			cli.String("root_key_suffix"),
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

	clientConn, cleanup, err := connectClient(cli, false)
	if err != nil {
		return err
	}
	defer cleanup()
	client := litrpc.NewProxyClient(clientConn)

	ctx := getContext()
	resp, err := client.BakeSuperMacaroon(
		ctx, &litrpc.BakeSuperMacaroonRequest{
			RootKeyIdSuffix: suffix,
			ReadOnly:        cli.Bool("read_only"),
		},
	)
	if err != nil {
		return err
	}

	// If the user specified the optional --save_to parameter, we'll save
	// the macaroon to that file.
	if cli.IsSet("save_to") {
		macSavePath := lncfg.CleanAndExpandPath(cli.String("save_to"))
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
