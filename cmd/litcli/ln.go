package main

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"strconv"

	"github.com/lightninglabs/taproot-assets/asset"
	"github.com/lightninglabs/taproot-assets/rfq"
	"github.com/lightninglabs/taproot-assets/rfqmath"
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
		Name:     "ln",
		Usage:    "Interact with the Lightning Network.",
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
			Name:  "asset_id",
			Usage: "The asset ID to commit to the channel.",
		},
	},
	Action: fundChannel,
}

func fundChannel(c *cli.Context) error {
	tapdConn, cleanup, err := connectSuperMacClient(c)
	if err != nil {
		return fmt.Errorf("error creating tapd connection: %w", err)
	}

	defer cleanup()

	ctxb := context.Background()
	tapdClient := taprpc.NewTaprootAssetsClient(tapdConn)
	tchrpcClient := tchrpc.NewTaprootAssetChannelsClient(tapdConn)
	assets, err := tapdClient.ListAssets(ctxb, &taprpc.ListAssetRequest{})
	if err != nil {
		return fmt.Errorf("error fetching assets: %w", err)
	}

	assetIDBytes, err := hex.DecodeString(c.String("asset_id"))
	if err != nil {
		return fmt.Errorf("error hex decoding asset ID: %w", err)
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
		if !bytes.Equal(rpcAsset.AssetGenesis.AssetId, assetIDBytes) {
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
		ctxb, &tchrpc.FundChannelRequest{
			AssetAmount:        requestedAmount,
			AssetId:            assetIDBytes,
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
			"payments with assets",
	}

	assetAmountFlag = cli.Uint64Flag{
		Name: "asset_amount",
		Usage: "the amount of the asset to send in the asset keysend " +
			"payment",
	}

	rfqPeerPubKeyFlag = cli.StringFlag{
		Name: "rfq_peer_pubkey",
		Usage: "(optional) the public key of the peer to ask for a " +
			"quote when converting from assets to sats; must be " +
			"set if there are multiple channels with the same " +
			"asset ID present",
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
	resp, err := w.stream.Recv()
	if err != nil {
		return nil, err
	}

	res := resp.Result
	switch r := res.(type) {
	// The very first response might be an accepted sell order, which we
	// just print out.
	case *tchrpc.SendPaymentResponse_AcceptedSellOrder:
		quote := r.AcceptedSellOrder
		rpcRate := quote.BidAssetRate
		rate, err := rfqrpc.UnmarshalFixedPoint(rpcRate)
		if err != nil {
			return nil, fmt.Errorf("unable to unmarshal fixed "+
				"point: %w", err)
		}

		amountMsat := lnwire.MilliSatoshi(w.amountMsat)
		milliSatsFP := rfqmath.MilliSatoshiToUnits(amountMsat, *rate)
		numUnits := milliSatsFP.ScaleTo(0).ToUint64()

		// If the calculated number of units is 0 then the asset rate
		// was not sufficient to represent the value of this payment.
		if numUnits == 0 {
			// We will calculate the minimum amount that can be
			// effectively sent with this asset by calculating the
			// value of a single asset unit, based on the provided
			// asset rate.

			// We create the single unit.
			unit := rfqmath.FixedPointFromUint64[rfqmath.BigInt](
				1, 0,
			)

			// We derive the minimum amount.
			minAmt := rfqmath.UnitsToMilliSatoshi(unit, *rate)

			// We return the error to the user.
			return nil, fmt.Errorf("smallest payment with asset "+
				"rate %v is %v, cannot send %v",
				rate.ToUint64(), minAmt, amountMsat)
		}

		msatPerUnit := uint64(w.amountMsat) / numUnits

		fmt.Printf("Got quote for %v asset units at %v msat/unit from "+
			"peer %s with SCID %d\n", numUnits, msatPerUnit,
			quote.Peer, quote.Scid)

		resp, err = w.stream.Recv()
		if err != nil {
			return nil, err
		}

		if resp == nil || resp.Result == nil ||
			resp.GetPaymentResult() == nil {

			return nil, errors.New("unexpected nil result")
		}

		return resp.GetPaymentResult(), nil

	case *tchrpc.SendPaymentResponse_PaymentResult:
		return r.PaymentResult, nil

	default:
		return nil, fmt.Errorf("unexpected response type: %T", r)
	}
}

var sendPaymentCommand = cli.Command{
	Name:     "sendpayment",
	Category: commands.SendPaymentCommand.Category,
	Usage: "Send a payment over Lightning, potentially using a " +
		"mulit-asset channel as the first hop",
	Description: commands.SendPaymentCommand.Description + `
	To send an multi-asset LN payment to a single hop, the --asset_id=X
	argument should be used.

	Note that this will only work in concert with the --keysend argument.
	`,
	ArgsUsage: commands.SendPaymentCommand.ArgsUsage + " --asset_id=X " +
		"--asset_amount=Y [--rfq_peer_pubkey=Z]",
	Flags: append(
		commands.SendPaymentCommand.Flags, assetIDFlag, assetAmountFlag,
		rfqPeerPubKeyFlag, allowOverpayFlag,
	),
	Action: sendPayment,
}

func sendPayment(ctx *cli.Context) error {
	// Show command help if no arguments provided
	if ctx.NArg() == 0 && ctx.NumFlags() == 0 {
		_ = cli.ShowCommandHelp(ctx, "sendpayment")
		return nil
	}

	lndConn, cleanup, err := connectClient(ctx, false)
	if err != nil {
		return fmt.Errorf("unable to make rpc conn: %w", err)
	}
	defer cleanup()

	tapdConn, cleanup, err := connectSuperMacClient(ctx)
	if err != nil {
		return fmt.Errorf("error creating tapd connection: %w", err)
	}
	defer cleanup()

	switch {
	case !ctx.IsSet(assetIDFlag.Name):
		return fmt.Errorf("the --asset_id flag must be set")
	case !ctx.IsSet("keysend"):
		return fmt.Errorf("the --keysend flag must be set")
	case !ctx.IsSet(assetAmountFlag.Name):
		return fmt.Errorf("--asset_amount must be set")
	}

	assetIDStr := ctx.String(assetIDFlag.Name)
	assetIDBytes, err := hex.DecodeString(assetIDStr)
	if err != nil {
		return fmt.Errorf("unable to decode assetID: %v", err)
	}

	assetAmountToSend := ctx.Uint64(assetAmountFlag.Name)
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
	case ctx.IsSet("dest"):
		destNode, err = hex.DecodeString(ctx.String("dest"))
	default:
		return fmt.Errorf("destination txid argument missing")
	}
	if err != nil {
		return err
	}

	if len(destNode) != 33 {
		return fmt.Errorf("dest node pubkey must be exactly 33 bytes, "+
			"is instead: %v", len(destNode))
	}

	rfqPeerKey, err := hex.DecodeString(ctx.String(rfqPeerPubKeyFlag.Name))
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

	if ctx.IsSet("payment_hash") {
		return errors.New("cannot set payment hash when using " +
			"keysend")
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
	allowOverpay := ctx.Bool(allowOverpayFlag.Name)

	return commands.SendPaymentRequest(
		ctx, req, lndConn, tapdConn, func(ctx context.Context,
			payConn grpc.ClientConnInterface,
			req *routerrpc.SendPaymentRequest) (
			commands.PaymentResultStream, error) {

			tchrpcClient := tchrpc.NewTaprootAssetChannelsClient(
				payConn,
			)

			stream, err := tchrpcClient.SendPayment(
				ctx, &tchrpc.SendPaymentRequest{
					AssetId:        assetIDBytes,
					AssetAmount:    assetAmountToSend,
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
	Usage:    "Pay an invoice over lightning using an asset.",
	Description: `
	This command attempts to pay an invoice using an asset channel as the
	source of the payment. The asset ID of the channel must be specified
	using the --asset_id flag.
	`,
	ArgsUsage: "pay_req --asset_id=X",
	Flags: append(commands.PaymentFlags(),
		cli.Int64Flag{
			Name: "amt",
			Usage: "(optional) number of satoshis to fulfill the " +
				"invoice",
		},
		assetIDFlag,
		rfqPeerPubKeyFlag,
		allowOverpayFlag,
	),
	Action: payInvoice,
}

func payInvoice(ctx *cli.Context) error {
	args := ctx.Args()
	ctxb := context.Background()

	var payReq string
	switch {
	case ctx.IsSet("pay_req"):
		payReq = ctx.String("pay_req")
	case args.Present():
		payReq = args.First()
	default:
		return fmt.Errorf("pay_req argument missing")
	}

	superMacConn, cleanup, err := connectSuperMacClient(ctx)
	if err != nil {
		return fmt.Errorf("unable to make rpc con: %w", err)
	}

	defer cleanup()

	lndClient := lnrpc.NewLightningClient(superMacConn)

	decodeReq := &lnrpc.PayReqString{PayReq: payReq}
	decodeResp, err := lndClient.DecodePayReq(ctxb, decodeReq)
	if err != nil {
		return err
	}

	if !ctx.IsSet(assetIDFlag.Name) {
		return fmt.Errorf("the --asset_id flag must be set")
	}

	assetIDStr := ctx.String(assetIDFlag.Name)

	assetIDBytes, err := hex.DecodeString(assetIDStr)
	if err != nil {
		return fmt.Errorf("unable to decode assetID: %v", err)
	}

	rfqPeerKey, err := hex.DecodeString(ctx.String(rfqPeerPubKeyFlag.Name))
	if err != nil {
		return fmt.Errorf("unable to decode RFQ peer public key: "+
			"%w", err)
	}

	allowOverpay := ctx.Bool(allowOverpayFlag.Name)
	req := &routerrpc.SendPaymentRequest{
		PaymentRequest: commands.StripPrefix(payReq),
	}

	return commands.SendPaymentRequest(
		ctx, req, superMacConn, superMacConn, func(ctx context.Context,
			payConn grpc.ClientConnInterface,
			req *routerrpc.SendPaymentRequest) (
			commands.PaymentResultStream, error) {

			tchrpcClient := tchrpc.NewTaprootAssetChannelsClient(
				payConn,
			)

			stream, err := tchrpcClient.SendPayment(
				ctx, &tchrpc.SendPaymentRequest{
					AssetId:        assetIDBytes,
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
	ArgsUsage: "asset_id asset_amount",
	Flags: append(
		commands.AddInvoiceCommand.Flags,
		cli.StringFlag{
			Name:  "asset_id",
			Usage: "the asset ID of the asset to receive",
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

func addInvoice(ctx *cli.Context) error {
	args := ctx.Args()
	ctxb := context.Background()

	var assetIDStr string
	switch {
	case ctx.IsSet("asset_id"):
		assetIDStr = ctx.String("asset_id")
	case args.Present():
		assetIDStr = args.First()
		args = args.Tail()
	default:
		return fmt.Errorf("asset_id argument missing")
	}

	var (
		assetAmount uint64
		preimage    []byte
		descHash    []byte
		err         error
	)
	switch {
	case ctx.IsSet("asset_amount"):
		assetAmount = ctx.Uint64("asset_amount")
	case args.Present():
		assetAmount, err = strconv.ParseUint(args.First(), 10, 64)
		if err != nil {
			return fmt.Errorf("unable to parse asset amount %w",
				err)
		}
	default:
		return fmt.Errorf("asset_amount argument missing")
	}

	if ctx.IsSet("preimage") {
		preimage, err = hex.DecodeString(ctx.String("preimage"))
		if err != nil {
			return fmt.Errorf("unable to parse preimage: %w", err)
		}
	}

	descHash, err = hex.DecodeString(ctx.String("description_hash"))
	if err != nil {
		return fmt.Errorf("unable to parse description_hash: %w", err)
	}

	expirySeconds := int64(rfq.DefaultInvoiceExpiry.Seconds())
	if ctx.IsSet("expiry") {
		expirySeconds = ctx.Int64("expiry")
	}

	assetIDBytes, err := hex.DecodeString(assetIDStr)
	if err != nil {
		return fmt.Errorf("unable to decode assetID: %v", err)
	}

	var assetID asset.ID
	copy(assetID[:], assetIDBytes)

	rfqPeerKey, err := hex.DecodeString(ctx.String(rfqPeerPubKeyFlag.Name))
	if err != nil {
		return fmt.Errorf("unable to decode RFQ peer public key: "+
			"%w", err)
	}

	tapdConn, cleanup, err := connectSuperMacClient(ctx)
	if err != nil {
		return fmt.Errorf("error creating tapd connection: %w", err)
	}
	defer cleanup()

	channelsClient := tchrpc.NewTaprootAssetChannelsClient(tapdConn)
	resp, err := channelsClient.AddInvoice(ctxb, &tchrpc.AddInvoiceRequest{
		AssetId:     assetIDBytes,
		AssetAmount: assetAmount,
		PeerPubkey:  rfqPeerKey,
		InvoiceRequest: &lnrpc.Invoice{
			Memo:            ctx.String("memo"),
			RPreimage:       preimage,
			DescriptionHash: descHash,
			FallbackAddr:    ctx.String("fallback_addr"),
			Expiry:          expirySeconds,
			Private:         ctx.Bool("private"),
			IsAmp:           ctx.Bool("amp"),
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
		"asset units specified by an asset ID",
	Description: `
	This command can be used to display the information encoded in an
	invoice.
	Given a chosen asset_id, the invoice's amount expressed in units of the
	asset will be displayed.
	
	Other information such as the decimal display of an asset, and the asset
	group information (if applicable) are also shown.
	`,
	ArgsUsage: "--pay_req=X --asset_id=X",
	Flags: []cli.Flag{
		cli.StringFlag{
			Name:  "pay_req",
			Usage: "a zpay32 encoded payment request to fulfill",
		},
		assetIDFlag,
	},
	Action: decodeAssetInvoice,
}

func decodeAssetInvoice(ctx *cli.Context) error {
	ctxb := context.Background()

	switch {
	case !ctx.IsSet("pay_req"):
		return fmt.Errorf("pay_req argument missing")
	case !ctx.IsSet(assetIDFlag.Name):
		return fmt.Errorf("the --asset_id flag must be set")
	}

	payReq := ctx.String("pay_req")

	assetIDStr := ctx.String(assetIDFlag.Name)
	assetIDBytes, err := hex.DecodeString(assetIDStr)
	if err != nil {
		return fmt.Errorf("unable to decode assetID: %v", err)
	}

	tapdConn, cleanup, err := connectSuperMacClient(ctx)
	if err != nil {
		return fmt.Errorf("unable to make rpc con: %w", err)
	}
	defer cleanup()

	channelsClient := tchrpc.NewTaprootAssetChannelsClient(tapdConn)
	resp, err := channelsClient.DecodeAssetPayReq(ctxb, &tchrpc.AssetPayReq{
		AssetId:      assetIDBytes,
		PayReqString: payReq,
	})
	if err != nil {
		return fmt.Errorf("error adding invoice: %w", err)
	}

	printRespJSON(resp)

	return nil
}
