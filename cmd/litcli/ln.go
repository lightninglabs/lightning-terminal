package main

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"strconv"
	"time"

	"github.com/lightninglabs/taproot-assets/asset"
	"github.com/lightninglabs/taproot-assets/rfqmsg"
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
			Value: 1,
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
	tapdConn, cleanup, err := connectTapdClient(c)
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
	for _, rpcAsset := range assets.Assets {
		if !bytes.Equal(rpcAsset.AssetGenesis.AssetId, assetIDBytes) {
			continue
		}

		if rpcAsset.Amount < requestedAmount {
			continue
		}

		assetFound = true
	}

	if !assetFound {
		return fmt.Errorf("asset with ID %x not found or no UTXO with "+
			"at least amount %d is available", assetIDBytes,
			requestedAmount)
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

type assetBalance struct {
	AssetID       string
	Name          string
	LocalBalance  uint64
	RemoteBalance uint64
	Channel       *lnrpc.Channel
}

type channelBalResp struct {
	Assets map[string]*assetBalance `json:"assets"`
}

func computeAssetBalances(lnd lnrpc.LightningClient) (*channelBalResp, error) {
	ctxb := context.Background()
	openChans, err := lnd.ListChannels(
		ctxb, &lnrpc.ListChannelsRequest{},
	)
	if err != nil {
		return nil, fmt.Errorf("unable to fetch channels: %w", err)
	}

	balanceResp := &channelBalResp{
		Assets: make(map[string]*assetBalance),
	}
	for _, openChan := range openChans.Channels {
		if len(openChan.CustomChannelData) == 0 {
			continue
		}

		var assetData rfqmsg.JsonAssetChannel
		err = json.Unmarshal(openChan.CustomChannelData, &assetData)
		if err != nil {
			return nil, fmt.Errorf("unable to unmarshal asset "+
				"data: %w", err)
		}

		for _, assetOutput := range assetData.Assets {
			assetID := assetOutput.AssetInfo.AssetGenesis.AssetID
			assetName := assetOutput.AssetInfo.AssetGenesis.Name

			balance, ok := balanceResp.Assets[assetID]
			if !ok {
				balance = &assetBalance{
					AssetID: assetID,
					Name:    assetName,
					Channel: openChan,
				}
				balanceResp.Assets[assetID] = balance
			}

			balance.LocalBalance += assetOutput.LocalBalance
			balance.RemoteBalance += assetOutput.RemoteBalance
		}
	}

	return balanceResp, nil
}

var (
	assetIDFlag = cli.StringFlag{
		Name: "asset_id",
		Usage: "the asset ID of the asset to use when sending " +
			"payments with assets",
	}
)

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
	ArgsUsage: commands.SendPaymentCommand.ArgsUsage + " --asset_id=X",
	Flags:     append(commands.SendPaymentCommand.Flags, assetIDFlag),
	Action:    sendPayment,
}

func sendPayment(ctx *cli.Context) error {
	ctxb := context.Background()

	// Show command help if no arguments provided
	if ctx.NArg() == 0 && ctx.NumFlags() == 0 {
		_ = cli.ShowCommandHelp(ctx, "sendpayment")
		return nil
	}

	lndConn, cleanup, err := connectClient(ctx, false)
	if err != nil {
		return fmt.Errorf("unable to make rpc con: %w", err)
	}

	defer cleanup()

	lndClient := lnrpc.NewLightningClient(lndConn)

	switch {
	case !ctx.IsSet(assetIDFlag.Name):
		return fmt.Errorf("the --asset_id flag must be set")
	case !ctx.IsSet("keysend"):
		return fmt.Errorf("the --keysend flag must be set")
	case !ctx.IsSet("amt"):
		return fmt.Errorf("--amt must be set")
	}

	assetIDStr := ctx.String(assetIDFlag.Name)
	_, err = hex.DecodeString(assetIDStr)
	if err != nil {
		return fmt.Errorf("unable to decode assetID: %v", err)
	}

	// First, based on the asset ID and amount, we'll make sure that this
	// channel even has enough funds to send.
	assetBalances, err := computeAssetBalances(lndClient)
	if err != nil {
		return fmt.Errorf("unable to compute asset balances: %w", err)
	}

	balance, ok := assetBalances.Assets[assetIDStr]
	if !ok {
		return fmt.Errorf("unable to send asset_id=%v, not in "+
			"channel", assetIDStr)
	}

	amtToSend := ctx.Uint64("amt")
	if amtToSend > balance.LocalBalance {
		return fmt.Errorf("insufficient balance, want to send %v, "+
			"only have %v", amtToSend, balance.LocalBalance)
	}

	tapdConn, cleanup, err := connectTapdClient(ctx)
	if err != nil {
		return fmt.Errorf("error creating tapd connection: %w", err)
	}
	defer cleanup()

	tchrpcClient := tchrpc.NewTaprootAssetChannelsClient(tapdConn)

	encodeReq := &tchrpc.EncodeCustomRecordsRequest_RouterSendPayment{
		RouterSendPayment: &tchrpc.RouterSendPaymentData{
			AssetAmounts: map[string]uint64{
				assetIDStr: amtToSend,
			},
		},
	}
	encodeResp, err := tchrpcClient.EncodeCustomRecords(
		ctxb, &tchrpc.EncodeCustomRecordsRequest{
			Input: encodeReq,
		},
	)
	if err != nil {
		return fmt.Errorf("error encoding custom records: %w", err)
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

	// We use a constant amount of 500 to carry the asset HTLCs. In the
	// future, we can use the double HTLC trick here, though it consumes
	// more commitment space.
	const htlcCarrierAmt = 500
	req := &routerrpc.SendPaymentRequest{
		Dest:                  destNode,
		Amt:                   htlcCarrierAmt,
		DestCustomRecords:     make(map[uint64][]byte),
		FirstHopCustomRecords: encodeResp.CustomRecords,
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

	return commands.SendPaymentRequest(ctx, req)
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

	lndConn, cleanup, err := connectClient(ctx, false)
	if err != nil {
		return fmt.Errorf("unable to make rpc con: %w", err)
	}

	defer cleanup()

	lndClient := lnrpc.NewLightningClient(lndConn)

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

	// First, based on the asset ID and amount, we'll make sure that this
	// channel even has enough funds to send.
	assetBalances, err := computeAssetBalances(lndClient)
	if err != nil {
		return fmt.Errorf("unable to compute asset balances: %w", err)
	}

	balance, ok := assetBalances.Assets[assetIDStr]
	if !ok {
		return fmt.Errorf("unable to send asset_id=%v, not in "+
			"channel", assetIDStr)
	}

	if balance.LocalBalance == 0 {
		return fmt.Errorf("no asset balance available for asset_id=%v",
			assetIDStr)
	}

	var assetID asset.ID
	copy(assetID[:], assetIDBytes)

	tapdConn, cleanup, err := connectTapdClient(ctx)
	if err != nil {
		return fmt.Errorf("error creating tapd connection: %w", err)
	}

	defer cleanup()

	peerPubKey, err := hex.DecodeString(balance.Channel.RemotePubkey)
	if err != nil {
		return fmt.Errorf("unable to decode peer pubkey: %w", err)
	}

	rfqClient := rfqrpc.NewRfqClient(tapdConn)

	timeoutSeconds := uint32(60)
	fmt.Printf("Asking peer %x for quote to sell assets to pay for "+
		"invoice over %d msats; waiting up to %ds\n", peerPubKey,
		decodeResp.NumMsat, timeoutSeconds)

	resp, err := rfqClient.AddAssetSellOrder(
		ctxb, &rfqrpc.AddAssetSellOrderRequest{
			AssetSpecifier: &rfqrpc.AssetSpecifier{
				Id: &rfqrpc.AssetSpecifier_AssetIdStr{
					AssetIdStr: assetIDStr,
				},
			},
			// TODO(guggero): This should actually be the max BTC
			// amount (invoice amount plus fee limit) in
			// milli-satoshi, not the asset amount. Need to change
			// the whole RFQ API to do that though.
			MaxAssetAmount: balance.LocalBalance,
			MinAsk:         uint64(decodeResp.NumMsat),
			Expiry:         uint64(decodeResp.Expiry),
			PeerPubKey:     peerPubKey,
			TimeoutSeconds: timeoutSeconds,
		},
	)
	if err != nil {
		return fmt.Errorf("error adding sell order: %w", err)
	}

	var acceptedQuote *rfqrpc.PeerAcceptedSellQuote
	switch r := resp.Response.(type) {
	case *rfqrpc.AddAssetSellOrderResponse_AcceptedQuote:
		acceptedQuote = r.AcceptedQuote

	case *rfqrpc.AddAssetSellOrderResponse_InvalidQuote:
		return fmt.Errorf("peer %v sent back an invalid quote, "+
			"status: %v", r.InvalidQuote.Peer,
			r.InvalidQuote.Status.String())

	case *rfqrpc.AddAssetSellOrderResponse_RejectedQuote:
		return fmt.Errorf("peer %v rejected the quote, code: %v, "+
			"error message: %v", r.RejectedQuote.Peer,
			r.RejectedQuote.ErrorCode, r.RejectedQuote.ErrorMessage)

	default:
		return fmt.Errorf("unexpected response type: %T", r)
	}

	msatPerUnit := acceptedQuote.BidPrice
	numUnits := uint64(decodeResp.NumMsat) / msatPerUnit

	fmt.Printf("Got quote for %v asset units at %v msat/unit from peer "+
		"%x with SCID %d\n", numUnits, msatPerUnit, peerPubKey,
		acceptedQuote.Scid)

	tchrpcClient := tchrpc.NewTaprootAssetChannelsClient(tapdConn)

	encodeReq := &tchrpc.EncodeCustomRecordsRequest_RouterSendPayment{
		RouterSendPayment: &tchrpc.RouterSendPaymentData{
			RfqId: acceptedQuote.Id,
		},
	}
	encodeResp, err := tchrpcClient.EncodeCustomRecords(
		ctxb, &tchrpc.EncodeCustomRecordsRequest{
			Input: encodeReq,
		},
	)
	if err != nil {
		return fmt.Errorf("error encoding custom records: %w", err)
	}

	req := &routerrpc.SendPaymentRequest{
		PaymentRequest:        commands.StripPrefix(payReq),
		FirstHopCustomRecords: encodeResp.CustomRecords,
	}

	return commands.SendPaymentRequest(ctx, req)
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

	expiry := time.Now().Add(300 * time.Second)
	if ctx.IsSet("expiry") {
		expirySeconds := ctx.Uint64("expiry")
		expiry = time.Now().Add(
			time.Duration(expirySeconds) * time.Second,
		)
	}

	lndConn, cleanup, err := connectClient(ctx, false)
	if err != nil {
		return fmt.Errorf("unable to make rpc con: %w", err)
	}

	defer cleanup()

	lndClient := lnrpc.NewLightningClient(lndConn)

	assetIDBytes, err := hex.DecodeString(assetIDStr)
	if err != nil {
		return fmt.Errorf("unable to decode assetID: %v", err)
	}

	// First, based on the asset ID and amount, we'll make sure that this
	// channel even has enough funds to send.
	assetBalances, err := computeAssetBalances(lndClient)
	if err != nil {
		return fmt.Errorf("unable to compute asset balances: %w", err)
	}

	balance, ok := assetBalances.Assets[assetIDStr]
	if !ok {
		return fmt.Errorf("unable to send asset_id=%v, not in "+
			"channel", assetIDStr)
	}

	if balance.RemoteBalance == 0 {
		return fmt.Errorf("no remote asset balance available for "+
			"receiving asset_id=%v", assetIDStr)
	}

	var assetID asset.ID
	copy(assetID[:], assetIDBytes)

	tapdConn, cleanup, err := connectTapdClient(ctx)
	if err != nil {
		return fmt.Errorf("error creating tapd connection: %w", err)
	}

	defer cleanup()

	peerPubKey, err := hex.DecodeString(balance.Channel.RemotePubkey)
	if err != nil {
		return fmt.Errorf("unable to decode peer pubkey: %w", err)
	}

	rfqClient := rfqrpc.NewRfqClient(tapdConn)

	timeoutSeconds := uint32(60)
	fmt.Printf("Asking peer %x for quote to buy assets to receive for "+
		"invoice over %d units; waiting up to %ds\n", peerPubKey,
		assetAmount, timeoutSeconds)

	resp, err := rfqClient.AddAssetBuyOrder(
		ctxb, &rfqrpc.AddAssetBuyOrderRequest{
			AssetSpecifier: &rfqrpc.AssetSpecifier{
				Id: &rfqrpc.AssetSpecifier_AssetIdStr{
					AssetIdStr: assetIDStr,
				},
			},
			MinAssetAmount: assetAmount,
			Expiry:         uint64(expiry.Unix()),
			PeerPubKey:     peerPubKey,
			TimeoutSeconds: timeoutSeconds,
		},
	)
	if err != nil {
		return fmt.Errorf("error adding sell order: %w", err)
	}

	var acceptedQuote *rfqrpc.PeerAcceptedBuyQuote
	switch r := resp.Response.(type) {
	case *rfqrpc.AddAssetBuyOrderResponse_AcceptedQuote:
		acceptedQuote = r.AcceptedQuote

	case *rfqrpc.AddAssetBuyOrderResponse_InvalidQuote:
		return fmt.Errorf("peer %v sent back an invalid quote, "+
			"status: %v", r.InvalidQuote.Peer,
			r.InvalidQuote.Status.String())

	case *rfqrpc.AddAssetBuyOrderResponse_RejectedQuote:
		return fmt.Errorf("peer %v rejected the quote, code: %v, "+
			"error message: %v", r.RejectedQuote.Peer,
			r.RejectedQuote.ErrorCode, r.RejectedQuote.ErrorMessage)

	default:
		return fmt.Errorf("unexpected response type: %T", r)
	}

	msatPerUnit := acceptedQuote.AskPrice
	numMSats := lnwire.MilliSatoshi(assetAmount * msatPerUnit)

	descHash, err := hex.DecodeString(ctx.String("description_hash"))
	if err != nil {
		return fmt.Errorf("unable to parse description_hash: %w", err)
	}

	ourPolicy, err := getOurPolicy(
		lndClient, balance.Channel.ChanId, balance.Channel.RemotePubkey,
	)
	if err != nil {
		return fmt.Errorf("unable to get our policy: %w", err)
	}

	hopHint := &lnrpc.HopHint{
		NodeId:                    balance.Channel.RemotePubkey,
		ChanId:                    acceptedQuote.Scid,
		FeeBaseMsat:               uint32(ourPolicy.FeeBaseMsat),
		FeeProportionalMillionths: uint32(ourPolicy.FeeRateMilliMsat),
		CltvExpiryDelta:           ourPolicy.TimeLockDelta,
	}

	invoice := &lnrpc.Invoice{
		Memo:            ctx.String("memo"),
		ValueMsat:       int64(numMSats),
		DescriptionHash: descHash,
		FallbackAddr:    ctx.String("fallback_addr"),
		Expiry:          int64(timeoutSeconds),
		Private:         ctx.Bool("private"),
		IsAmp:           ctx.Bool("amp"),
		RouteHints: []*lnrpc.RouteHint{
			{
				HopHints: []*lnrpc.HopHint{hopHint},
			},
		},
	}

	invoiceResp, err := lndClient.AddInvoice(ctxb, invoice)
	if err != nil {
		return err
	}

	printRespJSON(invoiceResp)

	return nil
}

func getOurPolicy(lndClient lnrpc.LightningClient, chanID uint64,
	remotePubKey string) (*lnrpc.RoutingPolicy, error) {

	ctxb := context.Background()
	edge, err := lndClient.GetChanInfo(ctxb, &lnrpc.ChanInfoRequest{
		ChanId: chanID,
	})
	if err != nil {
		return nil, fmt.Errorf("unable to fetch channel: %w", err)
	}

	policy := edge.Node1Policy
	if edge.Node1Pub == remotePubKey {
		policy = edge.Node2Policy
	}

	return policy, nil
}
