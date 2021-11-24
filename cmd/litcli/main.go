package main

import (
	"context"
	"encoding/base64"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"syscall"

	terminal "github.com/lightninglabs/lightning-terminal"
	"github.com/lightninglabs/lightning-terminal/litrpc"
	"github.com/lightninglabs/lndclient"
	"github.com/lightninglabs/protobuf-hex-display/jsonpb"
	"github.com/lightninglabs/protobuf-hex-display/proto"
	"github.com/lightningnetwork/lnd"
	"github.com/lightningnetwork/lnd/lncfg"
	"github.com/urfave/cli"
	"golang.org/x/term"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
	"google.golang.org/grpc/metadata"
)

const (
	// uiPasswordEnvName is the name of the environment variable under which
	// we look for the UI password for litcli.
	uiPasswordEnvName = "UI_PASSWORD"
)

var (
	// maxMsgRecvSize is the largest message our client will receive. We
	// set this to 200MiB atm.
	maxMsgRecvSize = grpc.MaxCallRecvMsgSize(1 * 1024 * 1024 * 200)

	baseDirFlag = cli.StringFlag{
		Name:  "basedir",
		Value: terminal.DefaultLitDir,
		Usage: "path to lit's base directory",
	}
	networkFlag = cli.StringFlag{
		Name: "network, n",
		Usage: "the network litd is running on e.g. mainnet, " +
			"testnet, etc.",
		Value: terminal.DefaultNetwork,
	}
	tlsCertFlag = cli.StringFlag{
		Name:  "tlscertpath",
		Usage: "path to lit's TLS certificate",
		Value: terminal.DefaultTLSCertPath,
	}
	lndMode = cli.StringFlag{
		Name:  "lndmode",
		Usage: "the mode that lnd is running in: remote or integrated",
		Value: terminal.ModeIntegrated,
	}
	lndTlsCertFlag = cli.StringFlag{
		Name:  "lndtlscertpath",
		Usage: "path to lnd's TLS certificate",
		Value: lnd.DefaultConfig().TLSCertPath,
	}
	uiPasswordFlag = cli.StringFlag{
		Name: "uipassword",
		Usage: "the UI password for authenticating against LiT; if " +
			"not specified will read from environment variable " +
			uiPasswordEnvName + " or prompt on terminal if both " +
			"values are empty",
	}
)

func main() {
	app := cli.NewApp()

	app.Name = "litcli"
	app.Usage = "control plane for your Lightning Terminal (lit) daemon"
	app.Flags = []cli.Flag{
		cli.StringFlag{
			Name:  "rpcserver",
			Value: "localhost:8443",
			Usage: "lit daemon address host:port",
		},
		networkFlag,
		baseDirFlag,
		lndMode,
		tlsCertFlag,
		lndTlsCertFlag,
		uiPasswordFlag,
	}
	app.Commands = append(app.Commands, sessionCommands...)

	err := app.Run(os.Args)
	if err != nil {
		fatal(err)
	}
}

func fatal(err error) {
	fmt.Fprintf(os.Stderr, "[litcli] %v\n", err)
	os.Exit(1)
}

func getClient(ctx *cli.Context) (litrpc.SessionsClient, func(), error) {
	rpcServer := ctx.GlobalString("rpcserver")
	tlsCertPath, err := extractPathArgs(ctx)
	if err != nil {
		return nil, nil, err
	}
	conn, err := getClientConn(rpcServer, tlsCertPath)
	if err != nil {
		return nil, nil, err
	}
	cleanup := func() { _ = conn.Close() }

	sessionsClient := litrpc.NewSessionsClient(conn)
	return sessionsClient, cleanup, nil
}

func getClientConn(address, tlsCertPath string) (*grpc.ClientConn, error) {
	opts := []grpc.DialOption{
		grpc.WithDefaultCallOptions(maxMsgRecvSize),
	}

	// TLS cannot be disabled, we'll always have a cert file to read.
	creds, err := credentials.NewClientTLSFromFile(tlsCertPath, "")
	if err != nil {
		fatal(err)
	}

	opts = append(opts, grpc.WithTransportCredentials(creds))

	conn, err := grpc.Dial(address, opts...)
	if err != nil {
		return nil, fmt.Errorf("unable to connect to RPC server: %v",
			err)
	}

	return conn, nil
}

// extractPathArgs parses the TLS certificate from the command.
func extractPathArgs(ctx *cli.Context) (string, error) {
	// We'll start off by parsing the network. This is needed to determine
	// the correct path to the TLS certificate and macaroon when not
	// specified.
	networkStr := strings.ToLower(ctx.GlobalString("network"))
	_, err := lndclient.Network(networkStr).ChainParams()
	if err != nil {
		return "", err
	}

	// We'll now fetch the basedir so we can make a decision on how to
	// properly read the cert. This will either be the default,
	// or will have been overwritten by the end user.
	baseDir := lncfg.CleanAndExpandPath(ctx.GlobalString(baseDirFlag.Name))
	lndmode := strings.ToLower(ctx.GlobalString(lndMode.Name))

	if lndmode == terminal.ModeIntegrated {
		tlsCertPath := lncfg.CleanAndExpandPath(ctx.GlobalString(
			lndTlsCertFlag.Name,
		))

		return tlsCertPath, nil
	}

	tlsCertPath := lncfg.CleanAndExpandPath(ctx.GlobalString(
		tlsCertFlag.Name,
	))

	// If a custom base directory was set, we'll also check if custom paths
	// for the TLS cert file was set as well. If not, we'll override the
	// paths so they can be found within the custom base directory set.
	// This allows us to set a custom base directory, along with custom
	// paths to the TLS cert file.
	if baseDir != terminal.DefaultLitDir || networkStr != terminal.DefaultNetwork {
		tlsCertPath = filepath.Join(
			baseDir, networkStr, terminal.DefaultTLSCertFilename,
		)
	}

	return tlsCertPath, nil
}

func printRespJSON(resp proto.Message) { // nolint
	jsonMarshaler := &jsonpb.Marshaler{
		EmitDefaults: true,
		OrigName:     true,
		Indent:       "\t", // Matches indentation of printJSON.
	}

	jsonStr, err := jsonMarshaler.MarshalToString(resp)
	if err != nil {
		fmt.Println("unable to decode response: ", err)
		return
	}

	fmt.Println(jsonStr)
}

func getAuthContext(cliCtx *cli.Context) context.Context {
	uiPassword, err := getUIPassword(cliCtx)
	if err != nil {
		fatal(err)
	}

	basicAuth := base64.StdEncoding.EncodeToString(
		[]byte(fmt.Sprintf("%s:%s", uiPassword, uiPassword)),
	)

	ctxb := context.Background()
	md := metadata.MD{}

	md.Set("macaroon", "no-macaroons-for-litcli")
	md.Set("authorization", fmt.Sprintf("Basic %s", basicAuth))

	return metadata.NewOutgoingContext(ctxb, md)
}

func getUIPassword(ctx *cli.Context) (string, error) {
	// The command line flag has precedence.
	uiPassword := strings.TrimSpace(ctx.GlobalString(uiPasswordFlag.Name))

	// To automate things with litcli, we also offer reading the password
	// from environment variables if the flag wasn't specified.
	if uiPassword == "" {
		uiPassword = strings.TrimSpace(os.Getenv(uiPasswordEnvName))
	}

	if uiPassword == "" {
		// If there's no value in the environment, we'll now prompt the
		// user to enter their password on the terminal.
		fmt.Printf("Input your LiT UI password: ")

		// The variable syscall.Stdin is of a different type in the
		// Windows API that's why we need the explicit cast. And of
		// course the linter doesn't like it either.
		pw, err := term.ReadPassword(int(syscall.Stdin)) // nolint:unconvert
		fmt.Println()

		if err != nil {
			return "", err
		}
		uiPassword = strings.TrimSpace(string(pw))
	}

	if uiPassword == "" {
		return "", fmt.Errorf("no UI password provided")
	}

	return uiPassword, nil
}
