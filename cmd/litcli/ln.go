package main

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/lightninglabs/taproot-assets/rfq"
	"github.com/lightninglabs/taproot-assets/rfqmath"
	"github.com/lightninglabs/taproot-assets/rpcutils"
	"github.com/lightninglabs/taproot-assets/taprpc"
	"github.com/lightninglabs/taproot-assets/taprpc/rfqrpc"
	tchrpc "github.com/lightninglabs/taproot-assets/taprpc/tapchannelrpc"
	"github.com/lightningnetwork/lnd/cmd/commands"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/lnrpc/routerrpc"
	"github.com/lightningnetwork/lnd/lntypes"
	"github.com/lightningnetwork/lnd/lnwire"
	"github.com/lightningnetwork/lnd/record"
	"github.com/urfave/cli"
	"google.golang.org/grpc"
)

const (
	// minAssetAmount is the minimum amount of an asset that can be put into
	// a channel. We choose an arbitrary value that allows for at least a
	// couple of HTLCs to be created without leading to fractions of assets
	// (which doesn't exist).
	minAssetAmount = 100
)

var lnCommands = []cli.Command{
	{
		Name: "ln",
		Usage: "Interact with Taproot Assets on the Lightning " +
			"Network.",
		Category: "Taproot Assets on LN",
		Subcommands: []cli.Command{
			fundChannelCommand,
			sendPaymentCommand,
			payInvoiceCommand,
			addInvoiceCommand,
			decodeAssetInvoiceCommand,
		},
	},
}

var fundChannelCommand = cli.Command{
	Name:     "fundchannel",
	Category: "Channels",
	Usage: "Open a Taproot Asset channel with a node on the Lightning " +
		"Network.",
	Flags: []cli.Flag{
		cli.StringFlag{
			Name: "node_key",
			Usage: "the identity public key of the target " +
				"node/peer serialized in compressed format, " +
				"must already be connected to",
		},
		cli.Uint64Flag{
			Name: "sat_per_vbyte",
			Usage: "(optional) a manual fee expressed in " +
				"sat/vByte that should be used when crafting " +
				"the transaction",
		},
		cli.Uint64Flag{
			Name: "push_amt",
			Usage: "the number of satoshis to give the remote " +
				"side as part of the initial commitment " +
				"state, this is equivalent to first opening " +
				"a channel and then sending the remote party " +
				"funds, but done all in one step; therefore, " +
				"this is equivalent to a donation to the " +
				"remote party, unless they reimburse the " +
				"funds in another way (outside the protocol)",
		},
		cli.Uint64Flag{
			Name: "asset_amount",
			Usage: "The amount of the asset to commit to the " +
				"channel.",
		},
		cli.StringFlag{
			Name: "asset_id",
			Usage: "The asset ID to commit to the channel; " +
				"cannot be used at the same time as " +
				"--group_key",
		},
		cli.StringFlag{
			Name: "group_key",
			Usage: "The group key to use for selecting assets to " +
				"commit to the channel; cannot be used at " +
				"the same time as --asset_id",
		},
	},
	Action: fundChannel,
}

func fundChannel(c *cli.Context) error {
	ctx := getContext()
	tapdConn, cleanup, err := connectSuperMacClient(ctx, c)
	if err != nil {
		return fmt.Errorf("error creating tapd connection: %w", err)
	}

	defer cleanup()

	tapdClient := taprpc.NewTaprootAssetsClient(tapdConn)
	tchrpcClient := tchrpc.NewTaprootAssetChannelsClient(tapdConn)
	assets, err := tapdClient.ListAssets(ctx, &taprpc.ListAssetRequest{})
	if err != nil {
		return fmt.Errorf("error fetching assets: %w", err)
	}

	assetIDBytes, groupKeyBytes, err := parseAssetIdentifier(c)
	if err != nil {
		return fmt.Errorf("unable to parse asset identifier: %w", err)
	}

	requestedAmount := c.Uint64("asset_amount")
	if requestedAmount < minAssetAmount {
		return fmt.Errorf("requested amount must be at least %d",
			minAssetAmount)
	}

	nodePubBytes, err := hex.DecodeString(c.String("node_key"))
	if err != nil {
		return fmt.Errorf("unable to decode node public key: %w", err)
	}

	assetFound := false
	totalAmount := uint64(0)
	for _, rpcAsset := range assets.Assets {
		if len(assetIDBytes) > 0 && !bytes.Equal(
			rpcAsset.AssetGenesis.AssetId, assetIDBytes,
		) {

			continue
		}

		if len(groupKeyBytes) > 0 && rpcAsset.AssetGroup == nil {
			continue
		}

		if len(groupKeyBytes) > 0 && !bytes.Equal(
			rpcAsset.AssetGroup.TweakedGroupKey, groupKeyBytes,
		) {

			continue
		}

		totalAmount += rpcAsset.Amount
		if totalAmount >= requestedAmount {
			assetFound = true

			break
		}

		assetFound = true
	}

	if !assetFound {
		return fmt.Errorf("asset with ID %x not found or no combined "+
			"UTXOs with at least amount %d is available",
			assetIDBytes, requestedAmount)
	}

	resp, err := tchrpcClient.FundChannel(
		ctx, &tchrpc.FundChannelRequest{
			AssetAmount:        requestedAmount,
			AssetId:            assetIDBytes,
			GroupKey:           groupKeyBytes,
			PeerPubkey:         nodePubBytes,
			FeeRateSatPerVbyte: uint32(c.Uint64("sat_per_vbyte")),
			PushSat:            c.Int64("push_amt"),
		},
	)
	if err != nil {
		return fmt.Errorf("error funding channel: %w", err)
	}

	printJSON(resp)

	return nil
}

var (
	assetIDFlag = cli.StringFlag{
		Name: "asset_id",
		Usage: "the asset ID of the asset to use when sending " +
			"payments with assets; cannot be used at the same " +
			"time as --group_key",
	}

	groupKeyFlag = cli.StringFlag{
		Name: "group_key",
		Usage: "the group key of the asset to use when sending " +
			"payments with assets; cannot be used at the same " +
			"time as --asset_id",
	}

	assetAmountFlag = cli.Uint64Flag{
		Name: "asset_amount",
		Usage: "the amount of the asset to send in the asset keysend " +
			"payment",
	}

	rfqPeerPubKeyFlag = cli.StringFlag{
		Name: "rfq_peer_pubkey",
		Usage: "(optional) the public key of the peer to ask for a " +
			"quote when converting from assets to sats; if left " +
			"unset then rfq peers will be picked automatically",
	}

	allowOverpayFlag = cli.BoolFlag{
		Name: "allow_overpay",
		Usage: "allow sending asset payments that are uneconomical " +
			"because the required non-dust amount for an asset " +
			"carrier HTLC plus one asset unit is higher than the " +
			"total invoice/payment amount that arrives at the " +
			"destination; meaning that the total amount sent " +
			"exceeds the total amount received plus routing fees",
	}
)

// resultStreamWrapper is a wrapper around the SendPaymentClient stream that
// implements the generic PaymentResultStream interface.
type resultStreamWrapper struct {
	amountMsat int64
	stream     tchrpc.TaprootAssetChannels_SendPaymentClient
}

// Recv receives the next payment result from the stream.
//
// NOTE: This method is part of the PaymentResultStream interface.
func (w *resultStreamWrapper) Recv() (*lnrpc.Payment, error) {
	// printQuote unmarshals and prints an accepted quote.
	printQuote := func(quote *rfqrpc.PeerAcceptedSellQuote) error {
		rpcRate := quote.BidAssetRate
		rate, err := rpcutils.UnmarshalRfqFixedPoint(rpcRate)
		if err != nil {
			return fmt.Errorf("unable to unmarshal fixed point: %w",
				err)
		}

		amountMsat := lnwire.MilliSatoshi(w.amountMsat)
		milliSatsFP := rfqmath.MilliSatoshiToUnits(amountMsat, *rate)
		numUnits := milliSatsFP.ScaleTo(0).ToUint64()

		if numUnits == 0 {
			return nil
		}

		msatPerUnit := uint64(w.amountMsat) / numUnits

		fmt.Printf("Got quote for %v asset units at %v msat/unit from "+
			"peer %s with SCID %d\n", numUnits, msatPerUnit,
			quote.Peer, quote.Scid)

		return nil
	}

	// A boolean to indicate whether the first quote was printed via the
	// legacy single-rfq response field.
	legacyFirstPrint := false

	for {
		resp, err := w.stream.Recv()
		if err != nil {
			return nil, err
		}

		res := resp.Result

		switch r := res.(type) {
		case *tchrpc.SendPaymentResponse_AcceptedSellOrder:
			err := printQuote(r.AcceptedSellOrder)
			if err != nil {
				return nil, err
			}

			legacyFirstPrint = true

		case *tchrpc.SendPaymentResponse_AcceptedSellOrders:
			quotes := r.AcceptedSellOrders.AcceptedSellOrders

			for _, quote := range quotes {
				// If the first item was returned via the legacy
				// field then skip printing it again here. This
				// skip only applies to the first element.
				if legacyFirstPrint {
					legacyFirstPrint = false
					continue
				}

				err := printQuote(quote)
				if err != nil {
					return nil, err
				}
			}

		case *tchrpc.SendPaymentResponse_PaymentResult:
			return r.PaymentResult, nil

		default:
			return nil, fmt.Errorf("unexpected response type: %T",
				r)
		}
	}
}

var sendPaymentCommand = cli.Command{
	Name:     "sendpayment",
	Category: commands.SendPaymentCommand.Category,
	Usage: "Send a keysend payment to a direct peer over Lightning, " +
		"potentially using a multi-asset channel.",
	Description: `
	Send a keysend asset payment over the Lightning Network. A keysend
	payment is an invoice-less payment that is sent to a node using its
	public key, specified by the --dest argument.

	Asset keysend payments are only supported to be sent to direct peers.
	Multi-hop asset payments must be sent using invoices and the
	corresponding 'ln payinvoice' subcommand.

	To send a multi-asset LN keysend payment, the --asset_id=X or
	--group_key=X argument can be used to specify the asset to use.

	Note that this command will only work with the --keysend argument set.
	`,
	ArgsUsage: "--keysend --dest=N [--asset_id=X | --group_key=X] " +
		"--asset_amount=Y [--rfq_peer_pubkey=Z] [--allow_overpay]",
	Flags: []cli.Flag{
		cli.BoolFlag{
			Name: "keysend",
			Usage: "will generate a pre-image and encode it in " +
				"the sphinx packet, a dest must be set",
		},
		cli.StringFlag{
			Name: "dest, d",
			Usage: "the compressed identity pubkey of the " +
				"payment recipient",
		},
		assetIDFlag, groupKeyFlag,
		assetAmountFlag, rfqPeerPubKeyFlag, allowOverpayFlag,
		cli.Int64Flag{
			Name:  "amt, a",
			Usage: "number of satoshis to send",
		},
		cli.Int64Flag{
			Name: "final_cltv_delta",
			Usage: "the number of blocks the last hop has to " +
				"reveal the preimage",
		},
		cli.StringFlag{
			Name:  "pay_addr",
			Usage: "the payment address of the generated invoice",
		},
		cli.DurationFlag{
			Name: "timeout",
			Usage: "the maximum amount of time we should spend " +
				"trying to fulfill the payment, failing " +
				"after the timeout has elapsed",
			Value: time.Second * 60,
		},
		cli.Int64SliceFlag{
			Name: "outgoing_chan_id",
			Usage: "short channel id of the outgoing channel to " +
				"use for the first hop of the payment; can " +
				"be specified multiple times in the same " +
				"command",
			Value: &cli.Int64Slice{},
		},
		cli.BoolFlag{
			Name:  "force, f",
			Usage: "will skip payment request confirmation",
		},
		cli.BoolFlag{
			Name:  "allow_self_payment",
			Usage: "allow sending a circular payment to self",
		},
		cli.StringFlag{
			Name: "data",
			Usage: "attach custom data to the payment. The " +
				"required format is: <record_id>=<hex_value>," +
				"<record_id>=<hex_value>,.. For example: " +
				"--data 3438382=0a21ff. Custom record ids " +
				"start from 65536.",
		},
		cli.UintFlag{
			Name: "max_parts",
			Usage: "the maximum number of partial payments that " +
				"may be used",
			Value: routerrpc.DefaultMaxParts,
		},
		cli.UintFlag{
			Name: "max_shard_size_sat",
			Usage: "the largest payment split that should be " +
				"attempted if payment splitting is required " +
				"to attempt a payment, specified in satoshis",
		},
		cli.UintFlag{
			Name: "max_shard_size_msat",
			Usage: "the largest payment split that should be " +
				"attempted if payment splitting is required " +
				"to attempt a payment, specified in " +
				"milli-satoshis",
		},
		cli.BoolFlag{
			Name: "amp",
			Usage: "if set to true, then AMP will be used to " +
				"complete the payment",
		},
	},
	Action: sendPayment,
}

func sendPayment(cliCtx *cli.Context) error {
	// Show command help if no arguments provided
	if cliCtx.NArg() == 0 && cliCtx.NumFlags() == 0 {
		_ = cli.ShowCommandHelp(cliCtx, "sendpayment")
		return nil
	}

	lndConn, cleanup, err := connectClient(cliCtx, false)
	if err != nil {
		return fmt.Errorf("unable to make rpc conn: %w", err)
	}
	defer cleanup()

	// NOTE: we don't use `getContext()` here since it assigns the global
	// signal interceptor variable which will then cause
	// commands.SendPaymentRequest to error out since it will try to do the
	// same.
	ctx := context.Background()
	tapdConn, cleanup, err := connectSuperMacClient(ctx, cliCtx)
	if err != nil {
		return fmt.Errorf("error creating tapd connection: %w", err)
	}
	defer cleanup()

	switch {
	case !cliCtx.IsSet("keysend"):
		return fmt.Errorf("the --keysend flag must be set")
	case !cliCtx.IsSet(assetAmountFlag.Name):
		return fmt.Errorf("--asset_amount must be set")
	}

	assetIDBytes, groupKeyBytes, err := parseAssetIdentifier(cliCtx)
	if err != nil {
		return fmt.Errorf("unable to parse asset identifier: %w", err)
	}

	assetAmountToSend := cliCtx.Uint64(assetAmountFlag.Name)
	if assetAmountToSend == 0 {
		return fmt.Errorf("must specify asset amount to send")
	}

	// With the asset specific work out of the way, we'll parse the rest of
	// the command as normal.
	var (
		destNode []byte
		rHash    []byte
	)

	switch {
	case cliCtx.IsSet("dest"):
		destNode, err = hex.DecodeString(cliCtx.String("dest"))
	default:
		return fmt.Errorf("destination node pubkey argument missing")
	}
	if err != nil {
		return err
	}

	if len(destNode) != 33 {
		return fmt.Errorf("dest node pubkey must be exactly 33 bytes, "+
			"is instead: %v", len(destNode))
	}

	rfqPeerKey, err := hex.DecodeString(
		cliCtx.String(rfqPeerPubKeyFlag.Name),
	)
	if err != nil {
		return fmt.Errorf("unable to decode RFQ peer public key: "+
			"%w", err)
	}

	// Use the smallest possible non-dust HTLC amount to carry the asset
	// HTLCs. In the future, we can use the double HTLC trick here, though
	// it consumes more commitment space.
	req := &routerrpc.SendPaymentRequest{
		Dest:              destNode,
		Amt:               int64(rfqmath.DefaultOnChainHtlcSat),
		DestCustomRecords: make(map[uint64][]byte),
	}

	// Read out the custom preimage for the keysend payment.
	var preimage lntypes.Preimage
	if _, err := rand.Read(preimage[:]); err != nil {
		return err
	}

	// Set the preimage. If the user supplied a preimage with the data
	// flag, the preimage that is set here will be overwritten later.
	req.DestCustomRecords[record.KeySendType] = preimage[:]

	hash := preimage.Hash()
	rHash = hash[:]

	req.PaymentHash = rHash
	allowOverpay := cliCtx.Bool(allowOverpayFlag.Name)

	return commands.SendPaymentRequest(
		cliCtx, req, lndConn, tapdConn, func(ctx context.Context,
			payConn grpc.ClientConnInterface,
			req *routerrpc.SendPaymentRequest) (
			commands.PaymentResultStream, error) {

			tchrpcClient := tchrpc.NewTaprootAssetChannelsClient(
				payConn,
			)

			stream, err := tchrpcClient.SendPayment(
				ctx, &tchrpc.SendPaymentRequest{
					AssetId:  assetIDBytes,
					GroupKey: groupKeyBytes,
					AssetAmount: cliCtx.Uint64(
						assetAmountFlag.Name,
					),
					PeerPubkey:     rfqPeerKey,
					PaymentRequest: req,
					AllowOverpay:   allowOverpay,
				},
			)
			if err != nil {
				return nil, err
			}

			return &resultStreamWrapper{
				stream: stream,
			}, nil
		},
	)
}

var payInvoiceCommand = cli.Command{
	Name:     "payinvoice",
	Category: "Payments",
	Usage: "Pay an invoice over Lightning, potentially using a " +
		"multi-asset channel as the first hop.",
	Description: `
	This command attempts to pay an invoice using an asset channel as the
	source of the payment. The asset of the channel must be specified using
	the --asset_id or --group_key flag.
	`,
	ArgsUsage: "pay_req [--asset_id=X | --group_key=X] " +
		"[--rfq_peer_pubkey=y] [--allow_overpay]",
	Flags: append(
		commands.PaymentFlags(),
		assetIDFlag, groupKeyFlag, rfqPeerPubKeyFlag, allowOverpayFlag,
		cli.Int64Flag{
			Name: "amt",
			Usage: "(optional) number of satoshis to fulfill the " +
				"invoice",
		},
	),
	Action: payInvoice,
}

func payInvoice(cli *cli.Context) error {
	args := cli.Args()

	// NOTE: we don't use `getContext()` here since it assigns the global
	// signal interceptor variable which will then cause
	// commands.SendPaymentRequest to error out since it will try to do the
	// same.
	ctx := context.Background()

	var payReq string
	switch {
	case cli.IsSet("pay_req"):
		payReq = cli.String("pay_req")
	case args.Present():
		payReq = args.First()
	default:
		return fmt.Errorf("pay_req argument missing")
	}

	superMacConn, cleanup, err := connectSuperMacClient(ctx, cli)
	if err != nil {
		return fmt.Errorf("unable to make rpc con: %w", err)
	}

	defer cleanup()

	lndClient := lnrpc.NewLightningClient(superMacConn)

	decodeReq := &lnrpc.PayReqString{PayReq: payReq}
	decodeResp, err := lndClient.DecodePayReq(ctx, decodeReq)
	if err != nil {
		return err
	}

	assetIDBytes, groupKeyBytes, err := parseAssetIdentifier(cli)
	if err != nil {
		return fmt.Errorf("unable to parse asset identifier: %w", err)
	}

	rfqPeerKey, err := hex.DecodeString(cli.String(rfqPeerPubKeyFlag.Name))
	if err != nil {
		return fmt.Errorf("unable to decode RFQ peer public key: "+
			"%w", err)
	}

	allowOverpay := cli.Bool(allowOverpayFlag.Name)
	req := &routerrpc.SendPaymentRequest{
		PaymentRequest: commands.StripPrefix(payReq),
	}

	return commands.SendPaymentRequest(
		cli, req, superMacConn, superMacConn, func(ctx context.Context,
			payConn grpc.ClientConnInterface,
			req *routerrpc.SendPaymentRequest) (
			commands.PaymentResultStream, error) {

			tchrpcClient := tchrpc.NewTaprootAssetChannelsClient(
				payConn,
			)

			stream, err := tchrpcClient.SendPayment(
				ctx, &tchrpc.SendPaymentRequest{
					AssetId:        assetIDBytes,
					GroupKey:       groupKeyBytes,
					PeerPubkey:     rfqPeerKey,
					PaymentRequest: req,
					AllowOverpay:   allowOverpay,
				},
			)
			if err != nil {
				return nil, err
			}

			return &resultStreamWrapper{
				amountMsat: decodeResp.NumMsat,
				stream:     stream,
			}, nil
		},
	)
}

var addInvoiceCommand = cli.Command{
	Name:     "addinvoice",
	Category: commands.AddInvoiceCommand.Category,
	Usage:    "Add a new invoice to receive Taproot Assets.",
	Description: `
	Add a new invoice, expressing intent for a future payment, received in
	Taproot Assets.
	`,
	ArgsUsage: "[--asset_id=X | --group_key=X] --asset_amount=Y " +
		"[--rfq_peer_pubkey=Z] ",
	Flags: append(
		commands.AddInvoiceCommand.Flags,
		cli.StringFlag{
			Name: "asset_id",
			Usage: "the asset ID of the asset to receive; cannot " +
				"be used at the same time as --group_key",
		},
		cli.StringFlag{
			Name: "group_key",
			Usage: "the group key of the asset to receive; " +
				"cannot be used at the same time as --asset_id",
		},
		cli.Uint64Flag{
			Name:  "asset_amount",
			Usage: "the amount of assets to receive",
		},
		cli.StringFlag{
			Name: "rfq_peer_pubkey",
			Usage: "(optional) the public key of the peer to ask " +
				"for a quote when converting from assets to " +
				"sats for the invoice; must be set if there " +
				"are multiple channels with the same " +
				"asset ID present",
		},
	),
	Action: addInvoice,
}

func addInvoice(cli *cli.Context) error {
	ctx := getContext()

	var (
		assetAmount = cli.Uint64("asset_amount")
		msatAmount  = cli.Int64("amt_msat")
		satAmount   = cli.Int64("amt")
		preimage    []byte
		descHash    []byte
		err         error
	)
	if assetAmount == 0 && msatAmount == 0 && satAmount == 0 {
		return fmt.Errorf("must set asset amount or sat/msat amount")
	}

	if assetAmount != 0 && (msatAmount != 0 || satAmount != 0) {
		return fmt.Errorf("must only set one of asset amount or " +
			"sat/msat amount")
	}

	if msatAmount != 0 && satAmount != 0 {
		return fmt.Errorf("must only set one of amt or amt_msat")
	}

	if cli.IsSet("preimage") {
		preimage, err = hex.DecodeString(cli.String("preimage"))
		if err != nil {
			return fmt.Errorf("unable to parse preimage: %w", err)
		}
	}

	descHash, err = hex.DecodeString(cli.String("description_hash"))
	if err != nil {
		return fmt.Errorf("unable to parse description_hash: %w", err)
	}

	expirySeconds := int64(rfq.DefaultInvoiceExpiry.Seconds())
	if cli.IsSet("expiry") {
		expirySeconds = cli.Int64("expiry")
	}

	assetIDBytes, groupKeyBytes, err := parseAssetIdentifier(cli)
	if err != nil {
		return fmt.Errorf("unable to parse asset identifier: %w", err)
	}

	rfqPeerKey, err := hex.DecodeString(cli.String(rfqPeerPubKeyFlag.Name))
	if err != nil {
		return fmt.Errorf("unable to decode RFQ peer public key: "+
			"%w", err)
	}

	tapdConn, cleanup, err := connectSuperMacClient(ctx, cli)
	if err != nil {
		return fmt.Errorf("error creating tapd connection: %w", err)
	}
	defer cleanup()

	channelsClient := tchrpc.NewTaprootAssetChannelsClient(tapdConn)
	resp, err := channelsClient.AddInvoice(ctx, &tchrpc.AddInvoiceRequest{
		AssetId:     assetIDBytes,
		GroupKey:    groupKeyBytes,
		AssetAmount: assetAmount,
		PeerPubkey:  rfqPeerKey,
		InvoiceRequest: &lnrpc.Invoice{
			Memo:            cli.String("memo"),
			RPreimage:       preimage,
			DescriptionHash: descHash,
			Value:           satAmount,
			ValueMsat:       msatAmount,
			FallbackAddr:    cli.String("fallback_addr"),
			Expiry:          expirySeconds,
			Private:         cli.Bool("private"),
			IsAmp:           cli.Bool("amp"),
		},
	})
	if err != nil {
		return fmt.Errorf("error adding invoice: %w", err)
	}

	printRespJSON(resp)

	return nil
}

var decodeAssetInvoiceCommand = cli.Command{
	Name:     "decodeassetinvoice",
	Category: "Payments",
	Usage: "Decodes an LN invoice and displays the invoice's amount in " +
		"asset units specified by an asset ID or group key.",
	Description: `
	This command can be used to display the information encoded in an
	invoice.
	Given a chosen asset_id or group_key, the invoice's amount expressed in
	units of the asset will be displayed.
	
	Other information such as the decimal display of an asset, and the asset
	group information (if applicable) are also shown.
	`,
	ArgsUsage: "--pay_req=X [--asset_id=X | --group_key=X]",
	Flags: []cli.Flag{
		cli.StringFlag{
			Name:  "pay_req",
			Usage: "a zpay32 encoded payment request to fulfill",
		},
		assetIDFlag, groupKeyFlag,
	},
	Action: decodeAssetInvoice,
}

func decodeAssetInvoice(cli *cli.Context) error {
	ctx := getContext()

	if !cli.IsSet("pay_req") {
		return fmt.Errorf("pay_req argument missing")
	}

	payReq := cli.String("pay_req")

	assetIDBytes, groupKeyBytes, err := parseAssetIdentifier(cli)
	if err != nil {
		return fmt.Errorf("unable to parse asset identifier: %w", err)
	}

	tapdConn, cleanup, err := connectSuperMacClient(ctx, cli)
	if err != nil {
		return fmt.Errorf("unable to make rpc con: %w", err)
	}
	defer cleanup()

	channelsClient := tchrpc.NewTaprootAssetChannelsClient(tapdConn)
	resp, err := channelsClient.DecodeAssetPayReq(ctx, &tchrpc.AssetPayReq{
		AssetId:      assetIDBytes,
		GroupKey:     groupKeyBytes,
		PayReqString: payReq,
	})
	if err != nil {
		return fmt.Errorf("error adding invoice: %w", err)
	}

	printRespJSON(resp)

	return nil
}

// parseAssetIdentifier parses either the asset ID or group key from the command
// line arguments.
func parseAssetIdentifier(cli *cli.Context) ([]byte, []byte, error) {
	if !cli.IsSet(assetIDFlag.Name) && !cli.IsSet(groupKeyFlag.Name) {
		return nil, nil, fmt.Errorf("either the --asset_id or " +
			"--group_key flag must be set")
	}

	var (
		assetIDBytes  []byte
		groupKeyBytes []byte
		err           error
	)
	if cli.IsSet("asset_id") {
		assetIDBytes, err = hex.DecodeString(cli.String("asset_id"))
		if err != nil {
			return nil, nil, fmt.Errorf("error hex decoding asset "+
				"ID: %w", err)
		}
	}

	if cli.IsSet("group_key") {
		groupKeyBytes, err = hex.DecodeString(cli.String("group_key"))
		if err != nil {
			return nil, nil, fmt.Errorf("error hex decoding group "+
				"key: %w", err)
		}
	}

	if len(assetIDBytes) > 0 && len(groupKeyBytes) > 0 {
		return nil, nil, fmt.Errorf("only one of --asset_id and " +
			"--group_key can be set")
	}

	return assetIDBytes, groupKeyBytes, nil
}
