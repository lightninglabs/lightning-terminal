package main

import (
	"context"
	"encoding/hex"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	terminal "github.com/lightninglabs/lightning-terminal"
	"github.com/lightninglabs/lightning-terminal/litrpc"
	"github.com/lightninglabs/lndclient"
	"github.com/lightningnetwork/lnd/cmd/commands"
	"github.com/lightningnetwork/lnd/lncfg"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/macaroons"
	"github.com/urfave/cli"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
	"google.golang.org/protobuf/proto"
	"gopkg.in/macaroon.v2"
)

const (
	// defaultMacaroonTimeout is the default macaroon timeout in seconds
	// that we set when sending it over the line.
	defaultMacaroonTimeout int64 = 60
)

var (
	// maxMsgRecvSize is the largest message our client will receive. We
	// set this to 200MiB atm.
	maxMsgRecvSize = grpc.MaxCallRecvMsgSize(1 * 1024 * 1024 * 200)

	baseDirFlag = cli.StringFlag{
		Name:  "basedir",
		Value: terminal.DefaultLitDir,
		Usage: "Path to LiT's base directory",
	}
	networkFlag = cli.StringFlag{
		Name: "network, n",
		Usage: "The network litd is running on e.g. mainnet, " +
			"testnet, etc.",
		Value: terminal.DefaultNetwork,
	}
	tlsCertFlag = cli.StringFlag{
		Name:  "tlscertpath",
		Usage: "Path to lit's TLS certificate",
		Value: terminal.DefaultTLSCertPath,
	}
	macaroonPathFlag = cli.StringFlag{
		Name:  "macaroonpath",
		Usage: "Path to lit's macaroon file",
		Value: terminal.DefaultMacaroonPath,
	}
)

func main() {
	app := cli.NewApp()

	app.Version = terminal.Version()
	app.Name = "litcli"
	app.Usage = "control plane for your Lightning Terminal (lit) daemon"
	app.Flags = []cli.Flag{
		cli.StringFlag{
			Name:  "rpcserver",
			Value: "localhost:8443",
			Usage: "LiT daemon address host:port",
		},
		networkFlag,
		baseDirFlag,
		tlsCertFlag,
		macaroonPathFlag,
		// The following two flags are only required for the 'litcli ln'
		// sub commands, because they call into lnd's commands package
		// that requires them. They only need to be _defined_, but
		// they're not actually actively used.
		cli.StringFlag{
			Name:   "lnddir",
			Usage:  "Path to lnd's base directory",
			Hidden: true,
			Value:  commands.DefaultLndDir,
		},
		cli.Int64Flag{
			Name:   "macaroontimeout",
			Value:  60,
			Hidden: true,
			Usage: "Anti-replay macaroon validity time in " +
				"seconds.",
		},
	}
	app.Commands = append(app.Commands, sessionCommands...)
	app.Commands = append(app.Commands, accountsCommands...)
	app.Commands = append(app.Commands, listActionsCommand)
	app.Commands = append(app.Commands, privacyMapCommands)
	app.Commands = append(app.Commands, autopilotCommands)
	app.Commands = append(app.Commands, litCommands...)
	app.Commands = append(app.Commands, helperCommands)
	app.Commands = append(app.Commands, statusCommands...)
	app.Commands = append(app.Commands, lnCommands...)

	err := app.Run(os.Args)
	if err != nil {
		fatal(err)
	}
}

func fatal(err error) {
	fmt.Fprintf(os.Stderr, "[litcli] %v\n", err)
	os.Exit(1)
}

func connectClient(ctx *cli.Context, noMac bool) (grpc.ClientConnInterface,
	func(), error) {

	rpcServer := ctx.GlobalString("rpcserver")
	tlsCertPath, macPath, err := extractPathArgs(ctx)
	if err != nil {
		return nil, nil, err
	}
	conn, err := getClientConn(rpcServer, tlsCertPath, macPath, noMac, nil)
	if err != nil {
		return nil, nil, err
	}
	cleanup := func() { _ = conn.Close() }

	return conn, cleanup, nil
}

func connectClientWithMac(ctx *cli.Context,
	mac []byte) (grpc.ClientConnInterface, func(), error) {

	rpcServer := ctx.GlobalString("rpcserver")
	tlsCertPath, macPath, err := extractPathArgs(ctx)
	if err != nil {
		return nil, nil, err
	}
	conn, err := getClientConn(rpcServer, tlsCertPath, macPath, false, mac)
	if err != nil {
		return nil, nil, err
	}
	cleanup := func() { _ = conn.Close() }

	return conn, cleanup, nil
}

func getClientConn(address, tlsCertPath, macaroonPath string, noMac bool,
	customMac []byte) (*grpc.ClientConn, error) {

	opts := []grpc.DialOption{
		grpc.WithDefaultCallOptions(maxMsgRecvSize),
	}

	switch {
	case len(customMac) > 0:
		macOption, err := macFromBytes(customMac)
		if err != nil {
			return nil, err
		}
		opts = append(opts, macOption)

	case noMac:
		// Don't do anything.

	default:
		macOption, err := readMacaroon(macaroonPath)
		if err != nil {
			return nil, err
		}

		opts = append(opts, macOption)
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

// extractPathArgs parses the TLS certificate and macaroon paths from the
// command.
func extractPathArgs(ctx *cli.Context) (string, string, error) {
	// We'll start off by parsing the network. This is needed to determine
	// the correct path to the TLS certificate and macaroon when not
	// specified.
	networkStr := strings.ToLower(ctx.GlobalString("network"))
	_, err := lndclient.Network(networkStr).ChainParams()
	if err != nil {
		return "", "", err
	}

	// Get the base dir so that we can reconstruct the default tls and
	// macaroon paths if needed.
	baseDir := lncfg.CleanAndExpandPath(ctx.GlobalString(baseDirFlag.Name))

	macaroonPath := lncfg.CleanAndExpandPath(ctx.GlobalString(
		macaroonPathFlag.Name,
	))

	// If the macaroon path flag has not been set to a custom value,
	// then reconstruct it with the possibly new base dir and network
	// values.
	if macaroonPath == terminal.DefaultMacaroonPath {
		macaroonPath = filepath.Join(
			baseDir, networkStr, terminal.DefaultMacaroonFilename,
		)
	}

	tlsCertPath := lncfg.CleanAndExpandPath(ctx.GlobalString(
		tlsCertFlag.Name,
	))

	// If a custom TLS path was set, use it as is.
	if tlsCertPath != terminal.DefaultTLSCertPath {
		return tlsCertPath, macaroonPath, nil
	}

	// If a custom base directory was set, we'll also check if custom paths
	// for the TLS cert file was set as well. If not, we'll override the
	// paths so they can be found within the custom base directory set.
	// This allows us to set a custom base directory, along with custom
	// paths to the TLS cert file.
	if baseDir != terminal.DefaultLitDir {
		tlsCertPath = filepath.Join(
			baseDir, terminal.DefaultTLSCertFilename,
		)
	}

	return tlsCertPath, macaroonPath, nil
}

// readMacaroon tries to read the macaroon file at the specified path and create
// gRPC dial options from it.
func readMacaroon(macPath string) (grpc.DialOption, error) {
	// Load the specified macaroon file.
	macBytes, err := os.ReadFile(macPath)
	if err != nil {
		return nil, fmt.Errorf("unable to read macaroon path : %v", err)
	}

	return macFromBytes(macBytes)
}

// macFromBytes returns a macaroon from the given byte slice.
func macFromBytes(macBytes []byte) (grpc.DialOption, error) {
	mac := &macaroon.Macaroon{}
	if err := mac.UnmarshalBinary(macBytes); err != nil {
		return nil, fmt.Errorf("unable to decode macaroon: %v", err)
	}

	macConstraints := []macaroons.Constraint{
		// We add a time-based constraint to prevent replay of the
		// macaroon. It's good for 60 seconds by default to make up for
		// any discrepancy between client and server clocks, but leaking
		// the macaroon before it becomes invalid makes it possible for
		// an attacker to reuse the macaroon. In addition, the validity
		// time of the macaroon is extended by the time the server clock
		// is behind the client clock, or shortened by the time the
		// server clock is ahead of the client clock (or invalid
		// altogether if, in the latter case, this time is more than 60
		// seconds).
		macaroons.TimeoutConstraint(defaultMacaroonTimeout),
	}

	// Apply constraints to the macaroon.
	constrainedMac, err := macaroons.AddConstraints(mac, macConstraints...)
	if err != nil {
		return nil, err
	}

	// Now we append the macaroon credentials to the dial options.
	cred, err := macaroons.NewMacaroonCredential(constrainedMac)
	if err != nil {
		return nil, fmt.Errorf("error creating macaroon credential: %v",
			err)
	}
	return grpc.WithPerRPCCredentials(cred), nil
}

func printRespJSON(resp proto.Message) { // nolint
	jsonBytes, err := lnrpc.ProtoJSONMarshalOpts.Marshal(resp)
	if err != nil {
		fmt.Println("unable to decode response: ", err)
		return
	}

	fmt.Println(string(jsonBytes))
}

func connectSuperMacClient(ctx *cli.Context) (grpc.ClientConnInterface,
	func(), error) {

	litdConn, cleanup, err := connectClient(ctx, false)
	if err != nil {
		return nil, nil, fmt.Errorf("error connecting client: %w", err)
	}
	defer cleanup()

	ctxb := context.Background()
	litClient := litrpc.NewProxyClient(litdConn)
	macResp, err := litClient.BakeSuperMacaroon(
		ctxb, &litrpc.BakeSuperMacaroonRequest{},
	)
	if err != nil {
		return nil, nil, fmt.Errorf("error baking macaroon: %w", err)
	}

	macBytes, err := hex.DecodeString(macResp.Macaroon)
	if err != nil {
		return nil, nil, fmt.Errorf("error decoding macaroon: %w", err)
	}

	return connectClientWithMac(ctx, macBytes)
}
