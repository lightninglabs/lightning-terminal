package itest

import (
	"context"
	"crypto/tls"
	"encoding/hex"
	"fmt"
	"io/ioutil"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/btcsuite/btcd/btcec/v2"
	"github.com/btcsuite/btcd/btcutil"
	"github.com/btcsuite/btcd/chaincfg/chainhash"
	"github.com/lightninglabs/lightning-node-connect/mailbox"
	"github.com/lightninglabs/lightning-terminal/autopilotserver/mock"
	"github.com/lightninglabs/lightning-terminal/firewall"
	"github.com/lightninglabs/lightning-terminal/litrpc"
	"github.com/lightninglabs/lightning-terminal/rules"
	"github.com/lightninglabs/lightning-terminal/session"
	"github.com/lightningnetwork/lnd"
	"github.com/lightningnetwork/lnd/keychain"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/lntest"
	"github.com/stretchr/testify/require"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/credentials"
	"gopkg.in/macaroon-bakery.v2/bakery"
)

const (
	// HeaderMacaroon is the HTTP header field name that is used to send
	// the macaroon.
	HeaderMacaroon = "Macaroon"
)

var (
	rateLimit = &litrpc.RuleValue_RateLimit{
		RateLimit: &litrpc.RateLimit{
			ReadLimit: &litrpc.Rate{
				Iterations: 2,
				NumHours:   1,
			},
			WriteLimit: &litrpc.Rate{
				Iterations: 1,
				NumHours:   1,
			},
		},
	}

	policyBounds = &litrpc.RuleValue_ChanPolicyBounds{
		ChanPolicyBounds: &litrpc.ChannelPolicyBounds{
			MinBaseMsat:  100,
			MaxBaseMsat:  1000,
			MinRatePpm:   5000000,
			MaxRatePpm:   10000000,
			MinCltvDelta: 18,
			MaxCltvDelta: 40,
			MinHtlcMsat:  1000,
			MaxHtlcMsat:  10000000,
		},
	}

	historyLimit1 = &litrpc.RuleValue_HistoryLimit{
		HistoryLimit: &litrpc.HistoryLimit{
			Duration: uint64(time.Hour.Seconds() * 24 * 2),
		},
	}

	historyLimit2 = &litrpc.RuleValue_HistoryLimit{
		HistoryLimit: &litrpc.HistoryLimit{
			StartTime: uint64(
				time.Now().Add(-time.Hour * 24 * 3).Unix(),
			),
		},
	}

	sendToSelf = &litrpc.RuleValue_SendToSelf{
		SendToSelf: &litrpc.SendToSelf{},
	}

	offChainBudget = &litrpc.RuleValue_OffChainBudget{
		OffChainBudget: &litrpc.OffChainBudget{
			MaxAmtMsat:  1200000000,
			MaxFeesMsat: 200000,
		},
	}

	chanPolicyBoundsRule = &mock.RuleRanges{
		Default: &rules.ChanPolicyBounds{
			MinBaseMsat:  0,
			MaxBaseMsat:  10,
			MinRatePPM:   1,
			MaxRatePPM:   10,
			MinCLTVDelta: 18,
			MaxCLTVDelta: 18,
			MinHtlcMsat:  1000,
			MaxHtlcMsat:  10000,
		},
		MinVal: &rules.ChanPolicyBounds{
			MinBaseMsat:  0,
			MaxBaseMsat:  0,
			MinRatePPM:   0,
			MaxRatePPM:   0,
			MinCLTVDelta: 18,
			MaxCLTVDelta: 20,
			MinHtlcMsat:  100,
			MaxHtlcMsat:  1000,
		},
		MaxVal: &rules.ChanPolicyBounds{
			MinBaseMsat:  1000,
			MaxBaseMsat:  1000,
			MinRatePPM:   5000000,
			MaxRatePPM:   100000000,
			MinCLTVDelta: 40,
			MaxCLTVDelta: 60,
			MinHtlcMsat:  100000,
			MaxHtlcMsat:  1000000000000,
		},
	}

	historyLimitRule = &mock.RuleRanges{
		Default: &rules.HistoryLimit{
			StartDate: time.Unix(0, 0),
		},
		MinVal: &rules.HistoryLimit{
			Duration: time.Hour * 24,
		},
		MaxVal: &rules.HistoryLimit{},
	}
)

// testFWRateLimitAndPrivacyMapper tests that an Autopilot session is forced to
// adhere to the rate limits applied to the features of a session. Along the
// way, the privacy mapper is also tested.
func testFWRateLimitAndPrivacyMapper(net *NetworkHarness, t *harnessTest) {
	ctx := context.Background()

	// Some very basic functionality tests to make sure lnd is working fine
	// in integrated mode.
	net.SendCoins(t.t, btcutil.SatoshiPerBitcoin, net.Alice)

	// We expect a non-empty alias (truncated node ID) to be returned.
	resp, err := net.Alice.GetInfo(ctx, &lnrpc.GetInfoRequest{})
	require.NoError(t.t, err)
	require.NotEmpty(t.t, resp.Alias)
	require.Contains(t.t, resp.Alias, "0")

	// Open a channel between Alice and Bob so that we have something to
	// query later.
	channelOp := openChannelAndAssert(
		t, net, net.Alice, net.Bob, lntest.OpenChannelParams{
			Amt: 100000,
		},
	)
	defer closeChannelAndAssert(t, net, net.Alice, channelOp, true)

	// We extract the txid of the channel so that we can use it later to
	// check that the autopilot's actions successfully completed and to
	// check that the txid that the autopilot server sees is not the same
	// as this one.
	realTxidBytes, err := getChanPointFundingTxid(channelOp)
	require.NoError(t.t, err)
	realTxid, err := chainhash.NewHash(realTxidBytes)
	require.NoError(t.t, err)

	// We create a connection to the Alice node's RPC server.
	cfg := net.Alice.Cfg
	rawConn, err := connectRPC(ctx, cfg.LitAddr(), cfg.LitTLSCertPath)
	require.NoError(t.t, err)
	defer rawConn.Close()

	macBytes, err := ioutil.ReadFile(cfg.LitMacPath)
	require.NoError(t.t, err)
	ctxm := macaroonContext(ctx, macBytes)

	// Test that the connection to Alice's rpc server is working and that
	// the autopilot server is returning a non-empty feature list.
	litClient := litrpc.NewAutopilotClient(rawConn)
	featResp, err := litClient.ListAutopilotFeatures(
		ctxm, &litrpc.ListAutopilotFeaturesRequest{},
	)
	require.NoError(t.t, err)
	require.NotEmpty(t.t, featResp)

	// Add a new Autopilot session that subscribes to both a "HealthCheck",
	// and an "AutoFees" feature. Apply rate limits to the two features.
	// This call is expected to also result in Litd registering this session
	// with the mock autopilot server.
	sessResp, err := litClient.AddAutopilotSession(
		ctxm, &litrpc.AddAutopilotSessionRequest{
			Label: "integration-test",
			ExpiryTimestampSeconds: uint64(
				time.Now().Add(5 * time.Minute).Unix(),
			),
			MailboxServerAddr: mailboxServerAddr,
			Features: map[string]*litrpc.FeatureConfig{
				"HealthCheck": {
					Rules: &litrpc.RulesMap{
						Rules: map[string]*litrpc.RuleValue{
							rules.RateLimitName: {
								Value: rateLimit,
							},
						},
					},
				},
				"AutoFees": {
					Rules: &litrpc.RulesMap{
						Rules: map[string]*litrpc.RuleValue{
							rules.RateLimitName: {
								Value: rateLimit,
							},
						},
					},
				},
			},
		},
	)
	require.NoError(t.t, err)

	// From the response, we can extract Lit's local public key.
	litdPub, err := btcec.ParsePubKey(sessResp.Session.LocalPublicKey)
	require.NoError(t.t, err)

	// We then query the autopilot server to extract the private key that
	// it will be using for this session.
	pilotPriv, err := net.autopilotServer.GetPrivKey(litdPub)
	require.NoError(t.t, err)

	// Now we can connect to the mailbox from the PoV of the autopilot
	// server.
	pilotConn, metaDataInjector, err := connectMailboxWithRemoteKey(
		ctx, pilotPriv, litdPub,
	)
	require.NoError(t.t, err)
	defer pilotConn.Close()
	lndConn := lnrpc.NewLightningClient(pilotConn)

	// The autopilot server is expected to add a MetaInfo caveat to any
	// request that it makes. So we add that now and specify that it is
	// initially making requests on behalf of the HealthCheck feature.
	metaInfo := &firewall.InterceptMetaInfo{
		ActorName: "Autopilot Server",
		Feature:   "HealthCheck",
	}
	caveat, err := metaInfo.ToCaveat()
	require.NoError(t.t, err)
	caveatCreds := metaDataInjector.addCaveat(caveat)

	// Make first read request. Also check that the public key that the
	// autopilot server receives from this request is not the same as
	// Alice's actual public key. This is due to the actions of the privacy
	// mapper.
	getInfoReq, err := lndConn.GetInfo(
		ctx, &lnrpc.GetInfoRequest{}, caveatCreds,
	)
	require.NoError(t.t, err)
	require.NotEqual(
		t.t, hex.EncodeToString(net.Alice.PubKey[:]),
		getInfoReq.IdentityPubkey,
	)

	// Make second read request. Also check that the privacy mapper is
	// consistent with returning the same pseudo pub key.
	getInfoReq2, err := lndConn.GetInfo(
		ctx, &lnrpc.GetInfoRequest{}, caveatCreds,
	)
	require.NoError(t.t, err)
	require.Equal(
		t.t, getInfoReq.IdentityPubkey, getInfoReq2.IdentityPubkey,
	)

	// The third read request should fail due to exceeding the read limit.
	_, err = lndConn.GetInfo(ctx, &lnrpc.GetInfoRequest{}, caveatCreds)
	assertStatusErr(t.t, err, codes.ResourceExhausted)

	// The autopilot should still be able to make calls for the AutoFees
	// feature though.
	metaInfo = &firewall.InterceptMetaInfo{
		ActorName: "Autopilot Server",
		Feature:   "AutoFees",
	}
	caveat, err = metaInfo.ToCaveat()
	require.NoError(t.t, err)
	caveatCreds = metaDataInjector.addCaveat(caveat)

	// GetInfo should not be allowed for the AutoFees feature.
	_, err = lndConn.GetInfo(ctx, &lnrpc.GetInfoRequest{}, caveatCreds)
	require.Error(t.t, err)

	// Make a valid read request for the feature.
	channelsResp, err := lndConn.ListChannels(
		ctx, &lnrpc.ListChannelsRequest{}, caveatCreds,
	)
	require.NoError(t.t, err)
	require.Len(t.t, channelsResp.Channels, 1)

	txid, index, err := decodeChannelPoint(
		channelsResp.Channels[0].ChannelPoint,
	)
	require.NoError(t.t, err)

	// Make sure that the txid returned by the call for Alice's channel is
	// not the same as the real txid of the channel.
	require.NotEqual(t.t, txid, realTxid.String())

	chanPoint := &lnrpc.ChannelPoint{
		FundingTxid: &lnrpc.ChannelPoint_FundingTxidStr{
			FundingTxidStr: txid,
		},
		OutputIndex: index,
	}

	// As the autopilot server, update the fees of the channel.
	_, err = lndConn.UpdateChannelPolicy(
		ctx, &lnrpc.PolicyUpdateRequest{
			BaseFeeMsat: 9,
			FeeRate:     8,
			Scope: &lnrpc.PolicyUpdateRequest_ChanPoint{
				ChanPoint: chanPoint,
			},
			TimeLockDelta: 20,
			MaxHtlcMsat:   100000,
		}, caveatCreds,
	)
	require.NoError(t.t, err)

	// Using the real txid, from the PoV of Alice, lets query this channel
	// and make sure that the update successfully happened.
	feeResp, err := net.Alice.FeeReport(ctx, &lnrpc.FeeReportRequest{})
	require.NoError(t.t, err)
	require.Len(t.t, feeResp.ChannelFees, 1)

	txid2, _, err := decodeChannelPoint(feeResp.ChannelFees[0].ChannelPoint)
	require.NoError(t.t, err)
	require.Equal(t.t, realTxid.String(), txid2)
	require.Equal(t.t, float64(8), feeResp.ChannelFees[0].FeeRate)

	// Now we will check the same thing but from the PoV of the autopilot
	// server using the fake txid.
	feeResp, err = lndConn.FeeReport(
		ctx, &lnrpc.FeeReportRequest{}, caveatCreds,
	)
	require.NoError(t.t, err)
	require.Len(t.t, feeResp.ChannelFees, 1)

	txid3, _, err := decodeChannelPoint(feeResp.ChannelFees[0].ChannelPoint)
	require.NoError(t.t, err)
	require.Equal(t.t, txid, txid3)
	require.Equal(t.t, float64(8), feeResp.ChannelFees[0].FeeRate)

	// Check that any more read or write requests from the autopilot server
	// are disallowed due to the read and write rate limits being reached.
	_, err = lndConn.FeeReport(ctx, &lnrpc.FeeReportRequest{}, caveatCreds)
	assertStatusErr(t.t, err, codes.ResourceExhausted)

	_, err = lndConn.UpdateChannelPolicy(
		ctx, &lnrpc.PolicyUpdateRequest{
			BaseFeeMsat: 10,
			FeeRate:     4,
			Scope: &lnrpc.PolicyUpdateRequest_ChanPoint{
				ChanPoint: chanPoint,
			},
			TimeLockDelta: 20,
			MaxHtlcMsat:   100000,
		}, caveatCreds,
	)
	assertStatusErr(t.t, err, codes.ResourceExhausted)
}

// assertStatusErr asserts that the given error contains the given status code.
func assertStatusErr(t *testing.T, err error, code codes.Code) {
	require.Error(t, err)
	require.True(t, strings.Contains(err.Error(), code.String()))
}

// testFirewallRules tests that the various firewall rules are enforced
// correctly.
func testFirewallRules(ctx context.Context, net *NetworkHarness,
	t *harnessTest) {

	// Some very basic functionality tests to make sure lnd is working fine
	// in integrated mode.
	net.SendCoins(t.t, btcutil.SatoshiPerBitcoin, net.Alice)

	// We expect a non-empty alias (truncated node ID) to be returned.
	resp, err := net.Alice.GetInfo(ctx, &lnrpc.GetInfoRequest{})
	require.NoError(t.t, err)
	require.NotEmpty(t.t, resp.Alias)
	require.Contains(t.t, resp.Alias, "0")

	// Open a channel between Alice and Bob so that we have something to
	// query later.
	channelOp := openChannelAndAssert(
		t, net, net.Alice, net.Bob, lntest.OpenChannelParams{
			Amt: 100000,
		},
	)
	defer closeChannelAndAssert(t, net, net.Alice, channelOp, true)

	t.t.Run("history limit rule", func(_ *testing.T) {
		testHistoryLimitRule(net, t)
	})

	t.t.Run("channel policy bounds rule", func(_ *testing.T) {
		testChanPolicyBoundsRule(net, t)
	})

	t.t.Run("peer and channel restrict rules", func(_ *testing.T) {
		testPeerAndChannelRestrictRules(net, t)
	})
}

// testHistoryLimitRule tests that the autopilot server is forced to adhere to
// the history-limit rule.
func testHistoryLimitRule(net *NetworkHarness, t *harnessTest) {
	ctx := context.Background()

	// We create a connection to the Alice node's RPC server.
	cfg := net.Alice.Cfg
	rawConn, err := connectRPC(ctx, cfg.LitAddr(), cfg.LitTLSCertPath)
	require.NoError(t.t, err)
	defer rawConn.Close()

	macBytes, err := ioutil.ReadFile(cfg.LitMacPath)
	require.NoError(t.t, err)
	ctxm := macaroonContext(ctx, macBytes)

	// Now we will override the autopilots features set so that we can
	// just focus on the fee bounds rule for now.
	net.autopilotServer.SetFeatures(map[string]*mock.Feature{
		"AutoFees": {
			Description: "manages your channel fees",
			Rules: map[string]*mock.RuleRanges{
				rules.HistoryLimitName: historyLimitRule,
			},
			Permissions: map[string][]bakery.Op{
				"/lnrpc.Lightning/ForwardingHistory": {{
					Entity: "offchain",
					Action: "read",
				}},
			},
		},
		"AutoFees2": {
			Description: "manages your channel fees another way!",
			Rules: map[string]*mock.RuleRanges{
				rules.HistoryLimitName: historyLimitRule,
			},
			Permissions: map[string][]bakery.Op{
				"/lnrpc.Lightning/ForwardingHistory": {{
					Entity: "offchain",
					Action: "read",
				}},
			},
		},
	})

	// Test that the connection to Alice's rpc server is working and that
	// the autopilot server is returning a non-empty feature list.
	litClient := litrpc.NewAutopilotClient(rawConn)
	featResp, err := litClient.ListAutopilotFeatures(
		ctxm, &litrpc.ListAutopilotFeaturesRequest{},
	)
	require.NoError(t.t, err)
	require.NotEmpty(t.t, featResp)

	// Add a new Autopilot session that subscribes to the "AutoFees" feature
	// and apply a history limit that uses a Duration to it. Then we will
	// also add an "AutoFees2" feature and apply a history limit that uses
	// a Start-data to it.
	sessResp, err := litClient.AddAutopilotSession(
		ctxm, &litrpc.AddAutopilotSessionRequest{
			Label: "integration-test",
			ExpiryTimestampSeconds: uint64(
				time.Now().Add(5 * time.Minute).Unix(),
			),
			MailboxServerAddr: mailboxServerAddr,
			Features: map[string]*litrpc.FeatureConfig{
				"AutoFees": {
					Rules: &litrpc.RulesMap{
						Rules: map[string]*litrpc.RuleValue{
							rules.HistoryLimitName: {
								Value: historyLimit1,
							},
						},
					},
				},
				"AutoFees2": {
					Rules: &litrpc.RulesMap{
						Rules: map[string]*litrpc.RuleValue{
							rules.HistoryLimitName: {
								Value: historyLimit2,
							},
						},
					},
				},
			},
		},
	)
	require.NoError(t.t, err)

	// From the response, we can extract Lit's local public key.
	litdPub, err := btcec.ParsePubKey(sessResp.Session.LocalPublicKey)
	require.NoError(t.t, err)

	// We then query the autopilot server to extract the private key that
	// it will be using for this session.
	pilotPriv, err := net.autopilotServer.GetPrivKey(litdPub)
	require.NoError(t.t, err)

	// Now we can connect to the mailbox from the PoV of the autopilot
	// server.
	pilotConn, metaDataInjector, err := connectMailboxWithRemoteKey(
		ctx, pilotPriv, litdPub,
	)
	require.NoError(t.t, err)
	defer pilotConn.Close()

	lndConn := lnrpc.NewLightningClient(pilotConn)

	// First, we will test the "AutoFees" feature which uses a duration to
	// specify a history limit. The duration specified is 48 hours and so
	// the autopilot should not be able to query for more data more than 48
	// hours old.

	// The autopilot server is expected to add a MetaInfo caveat to any
	// request that it makes. So we add that now and specify that it is
	// initially making requests on behalf of the AutoFees feature.
	metaInfo := &firewall.InterceptMetaInfo{
		ActorName: "Autopilot Server",
		Feature:   "AutoFees",
	}
	caveat, err := metaInfo.ToCaveat()
	require.NoError(t.t, err)
	caveatCreds := metaDataInjector.addCaveat(caveat)

	// If the autopilot queries for data starting from 72 hours ago, the
	// call should fail.
	_, err = lndConn.ForwardingHistory(
		ctx, &lnrpc.ForwardingHistoryRequest{
			StartTime: uint64(
				time.Now().Add(-time.Hour * 24 * 3).Unix(),
			),
		}, caveatCreds,
	)
	assertStatusErr(t.t, err, codes.ResourceExhausted)

	// If the autopilot queries for data starting from somewhere within the
	// last 48 hours, the call should succeed.
	_, err = lndConn.ForwardingHistory(
		ctx, &lnrpc.ForwardingHistoryRequest{
			StartTime: uint64(
				time.Now().Add(-time.Hour * 24).Unix(),
			),
		}, caveatCreds,
	)
	require.NoError(t.t, err)

	// Now, we will test the "AutoFees2" feature which uses a start date to
	// specify a history limit. The start date specified is now minus 72
	// hours and so the autopilot should not be able to query for more data
	// more than 72 hours old.
	metaInfo.Feature = "AutoFees2"
	caveat, err = metaInfo.ToCaveat()
	require.NoError(t.t, err)
	caveatCreds = metaDataInjector.addCaveat(caveat)

	// If the autopilot queries for data starting from 96 hours ago, the
	// call should fail.
	_, err = lndConn.ForwardingHistory(
		ctx, &lnrpc.ForwardingHistoryRequest{
			StartTime: uint64(
				time.Now().Add(-time.Hour * 24 * 4).Unix(),
			),
		}, caveatCreds,
	)
	assertStatusErr(t.t, err, codes.ResourceExhausted)

	// If the autopilot queries for data starting from somewhere within the
	// last 72 hours, the call should succeed.
	_, err = lndConn.ForwardingHistory(
		ctx, &lnrpc.ForwardingHistoryRequest{
			StartTime: uint64(
				time.Now().Add(-time.Hour * 24 * 2).Unix(),
			),
		}, caveatCreds,
	)
	require.NoError(t.t, err)
}

// testChanPolicyBoundsRule tests that the autopilot server is forced to adhere
// to the fee-bounds rule.
func testChanPolicyBoundsRule(net *NetworkHarness, t *harnessTest) {
	ctx := context.Background()

	// We create a connection to the Alice node's RPC server.
	cfg := net.Alice.Cfg
	rawConn, err := connectRPC(ctx, cfg.LitAddr(), cfg.LitTLSCertPath)
	require.NoError(t.t, err)
	defer rawConn.Close()

	macBytes, err := ioutil.ReadFile(cfg.LitMacPath)
	require.NoError(t.t, err)
	ctxm := macaroonContext(ctx, macBytes)

	// Now we will override the autopilots features set so that we can
	// just focus on the fee bounds rule for now.
	net.autopilotServer.SetFeatures(map[string]*mock.Feature{
		"AutoFees": {
			Description: "manages your channel fees",
			Rules: map[string]*mock.RuleRanges{
				rules.ChanPolicyBoundsName: chanPolicyBoundsRule,
			},
			Permissions: map[string][]bakery.Op{
				"/lnrpc.Lightning/UpdateChannelPolicy": {{
					Entity: "offchain",
					Action: "write",
				}},
				"/lnrpc.Lightning/FeeReport": {{
					Entity: "offchain",
					Action: "read",
				}},
			},
		},
	})

	// Test that the connection to Alice's rpc server is working and that
	// the autopilot server is returning a non-empty feature list.
	litClient := litrpc.NewAutopilotClient(rawConn)
	featResp, err := litClient.ListAutopilotFeatures(
		ctxm, &litrpc.ListAutopilotFeaturesRequest{},
	)
	require.NoError(t.t, err)
	require.NotEmpty(t.t, featResp)

	// Add a new Autopilot session that subscribes to the "AutoFees" feature
	// and apply a rate limit to it.
	sessResp, err := litClient.AddAutopilotSession(
		ctxm, &litrpc.AddAutopilotSessionRequest{
			Label: "integration-test",
			ExpiryTimestampSeconds: uint64(
				time.Now().Add(5 * time.Minute).Unix(),
			),
			MailboxServerAddr: mailboxServerAddr,
			Features: map[string]*litrpc.FeatureConfig{
				"AutoFees": {
					Rules: &litrpc.RulesMap{
						Rules: map[string]*litrpc.RuleValue{
							rules.ChanPolicyBoundsName: {
								Value: policyBounds,
							},
						},
					},
				},
			},
		},
	)
	require.NoError(t.t, err)

	// From the response, we can extract Lit's local public key.
	litdPub, err := btcec.ParsePubKey(sessResp.Session.LocalPublicKey)
	require.NoError(t.t, err)

	// We then query the autopilot server to extract the private key that
	// it will be using for this session.
	pilotPriv, err := net.autopilotServer.GetPrivKey(litdPub)
	require.NoError(t.t, err)

	// Now we can connect to the mailbox from the PoV of the autopilot
	// server.
	pilotConn, metaDataInjector, err := connectMailboxWithRemoteKey(
		ctx, pilotPriv, litdPub,
	)
	require.NoError(t.t, err)
	defer pilotConn.Close()
	lndConn := lnrpc.NewLightningClient(pilotConn)

	// The autopilot server is expected to add a MetaInfo caveat to any
	// request that it makes. So we add that now and specify that it is
	// initially making requests on behalf of the HealthCheck feature.
	metaInfo := &firewall.InterceptMetaInfo{
		ActorName: "Autopilot Server",
		Feature:   "AutoFees",
	}
	caveat, err := metaInfo.ToCaveat()
	require.NoError(t.t, err)
	caveatCreds := metaDataInjector.addCaveat(caveat)

	// First, get the current fee rates of the litd node.
	var chanFees *lnrpc.ChannelFeeReport
	assertFees := func(expectedFeeRate float64, expectedBase int64) {
		feeResp, err := lndConn.FeeReport(
			ctx, &lnrpc.FeeReportRequest{}, caveatCreds,
		)
		require.NoError(t.t, err)
		require.Len(t.t, feeResp.ChannelFees, 1)
		require.Equal(
			t.t, expectedFeeRate, feeResp.ChannelFees[0].FeeRate,
		)
		require.Equal(
			t.t, expectedBase, feeResp.ChannelFees[0].BaseFeeMsat,
		)
		chanFees = feeResp.ChannelFees[0]
	}

	assertFees(1e-06, 1000)

	txid, index, err := decodeChannelPoint(chanFees.ChannelPoint)
	require.NoError(t.t, err)

	chanPoint := &lnrpc.ChannelPoint{
		FundingTxid: &lnrpc.ChannelPoint_FundingTxidStr{
			FundingTxidStr: txid,
		},
		OutputIndex: index,
	}

	// Now try to update the fees by violating the minimum allowed base
	// fee rate. This should fail.
	_, err = lndConn.UpdateChannelPolicy(
		ctx, &lnrpc.PolicyUpdateRequest{
			BaseFeeMsat: 10,
			FeeRate:     4,
			Scope: &lnrpc.PolicyUpdateRequest_ChanPoint{
				ChanPoint: chanPoint,
			},
			TimeLockDelta: 20,
			MaxHtlcMsat:   100000,
		}, caveatCreds,
	)
	assertStatusErr(t.t, err, codes.ResourceExhausted)
	assertFees(1e-06, 1000)

	// Base fee too high.
	_, err = lndConn.UpdateChannelPolicy(
		ctx, &lnrpc.PolicyUpdateRequest{
			BaseFeeMsat: 60000,
			FeeRate:     4,
			Scope: &lnrpc.PolicyUpdateRequest_ChanPoint{
				ChanPoint: chanPoint,
			},
			TimeLockDelta: 20,
			MaxHtlcMsat:   100000,
		}, caveatCreds,
	)
	assertStatusErr(t.t, err, codes.ResourceExhausted)
	assertFees(1e-06, 1000)

	// Fee rate too low.
	_, err = lndConn.UpdateChannelPolicy(
		ctx, &lnrpc.PolicyUpdateRequest{
			BaseFeeMsat: 500,
			FeeRate:     0,
			Scope: &lnrpc.PolicyUpdateRequest_ChanPoint{
				ChanPoint: chanPoint,
			},
			TimeLockDelta: 10,
			MaxHtlcMsat:   100000,
		}, caveatCreds,
	)
	assertStatusErr(t.t, err, codes.ResourceExhausted)
	assertFees(1e-06, 1000)

	// Fee rate too high.
	_, err = lndConn.UpdateChannelPolicy(
		ctx, &lnrpc.PolicyUpdateRequest{
			BaseFeeMsat: 500,
			FeeRate:     100,
			Scope: &lnrpc.PolicyUpdateRequest_ChanPoint{
				ChanPoint: chanPoint,
			},
			TimeLockDelta: 20,
			MaxHtlcMsat:   100000,
		}, caveatCreds,
	)
	assertStatusErr(t.t, err, codes.ResourceExhausted)
	assertFees(1e-06, 1000)

	// Valid fee change!
	_, err = lndConn.UpdateChannelPolicy(
		ctx, &lnrpc.PolicyUpdateRequest{
			BaseFeeMsat: 500,
			FeeRate:     7,
			Scope: &lnrpc.PolicyUpdateRequest_ChanPoint{
				ChanPoint: chanPoint,
			},
			TimeLockDelta: 20,
			MaxHtlcMsat:   100000,
		}, caveatCreds,
	)
	require.NoError(t.t, err)
	assertFees(7, 500)
}

func testPeerAndChannelRestrictRules(net *NetworkHarness, t *harnessTest) {
	ctx := context.Background()

	charlie, err := net.NewNode(t.t, "Charlie", nil, false, true)
	require.NoError(t.t, err)
	defer shutdownAndAssert(net, t, charlie)

	net.SendCoins(t.t, btcutil.SatoshiPerBitcoin, charlie)
	net.EnsureConnected(t.t, net.Alice, charlie)

	// Open another channel between Alice and Bob.
	channelAB2Op := openChannelAndAssert(
		t, net, net.Alice, net.Bob, lntest.OpenChannelParams{
			Amt: 100000,
		},
	)
	defer closeChannelAndAssert(t, net, net.Alice, channelAB2Op, true)

	// Open two channels between Alice and Charlie.
	channelAC1Op := openChannelAndAssert(
		t, net, net.Alice, charlie, lntest.OpenChannelParams{
			Amt: 100000,
		},
	)
	defer closeChannelAndAssert(t, net, net.Alice, channelAC1Op, true)

	channelAC2Op := openChannelAndAssert(
		t, net, net.Alice, charlie, lntest.OpenChannelParams{
			Amt: 100000,
		},
	)
	defer closeChannelAndAssert(t, net, net.Alice, channelAC2Op, true)

	// List Alice's channels so that we can extract the channel points
	// for the four channels.
	chans, err := net.Alice.ListChannels(ctx, &lnrpc.ListChannelsRequest{})
	require.NoError(t.t, err)
	require.Len(t.t, chans.Channels, 4)

	var chanABPoints, chanACPoints []string
	var chanToRestrict uint64
	for _, c := range chans.Channels {
		if c.RemotePubkey == hex.EncodeToString(net.Bob.PubKey[:]) {
			chanABPoints = append(chanABPoints, c.ChannelPoint)
			continue
		}
		chanACPoints = append(chanACPoints, c.ChannelPoint)
		chanToRestrict = c.ChanId
	}

	// We create a connection to the Alice node's RPC server.
	cfg := net.Alice.Cfg
	rawConn, err := connectRPC(ctx, cfg.LitAddr(), cfg.LitTLSCertPath)
	require.NoError(t.t, err)
	defer rawConn.Close()

	macBytes, err := ioutil.ReadFile(cfg.LitMacPath)
	require.NoError(t.t, err)
	ctxm := macaroonContext(ctx, macBytes)

	// Now we will override the autopilots features set so that we can
	// just focus on the peer and channel restriction rules for now.
	net.autopilotServer.SetFeatures(map[string]*mock.Feature{
		"AutoFees": {
			Description: "manages your channel fees",
			Rules: map[string]*mock.RuleRanges{
				rules.PeersRestrictName: {
					Default: &rules.PeerRestrict{},
					MinVal:  &rules.PeerRestrict{},
					MaxVal:  &rules.PeerRestrict{},
				},
				rules.ChannelRestrictName: {
					Default: &rules.ChannelRestrict{},
					MinVal:  &rules.ChannelRestrict{},
					MaxVal:  &rules.ChannelRestrict{},
				},
			},
			Permissions: map[string][]bakery.Op{
				"/lnrpc.Lightning/UpdateChannelPolicy": {{
					Entity: "offchain",
					Action: "write",
				}},
				"/lnrpc.Lightning/FeeReport": {{
					Entity: "offchain",
					Action: "read",
				}},
			},
		},
	})

	// Test that the connection to Alice's rpc server is working and that
	// the autopilot server is returning a non-empty feature list.
	litCAutopilotClient := litrpc.NewAutopilotClient(rawConn)
	featResp, err := litCAutopilotClient.ListAutopilotFeatures(
		ctxm, &litrpc.ListAutopilotFeaturesRequest{},
	)
	require.NoError(t.t, err)
	require.NotEmpty(t.t, featResp)

	// Construct a peer-restriction list using Bob's pub key.
	bobKey := hex.EncodeToString(net.Bob.PubKey[:])
	peerRestrict := &litrpc.RuleValue_PeerRestrict{
		PeerRestrict: &litrpc.PeerRestrict{
			PeerIds: []string{bobKey},
		},
	}

	// Next, construct a channel-restriction list using one of the channels
	channelRestrict := &litrpc.RuleValue_ChannelRestrict{
		ChannelRestrict: &litrpc.ChannelRestrict{
			ChannelIds: []uint64{chanToRestrict},
		},
	}

	// Add a new Autopilot session that subscribes to the "AutoFees" feature
	// and apply a peer restriction list to it.
	sessResp, err := litCAutopilotClient.AddAutopilotSession(
		ctxm, &litrpc.AddAutopilotSessionRequest{
			Label: "integration-test",
			ExpiryTimestampSeconds: uint64(
				time.Now().Add(5 * time.Minute).Unix(),
			),
			MailboxServerAddr: mailboxServerAddr,
			Features: map[string]*litrpc.FeatureConfig{
				"AutoFees": {
					Rules: &litrpc.RulesMap{
						Rules: map[string]*litrpc.RuleValue{
							rules.PeersRestrictName: {
								Value: peerRestrict,
							},
							rules.ChannelRestrictName: {
								Value: channelRestrict,
							},
						},
					},
				},
			},
		},
	)
	require.NoError(t.t, err)

	// From the response, we can extract Lit's local public key.
	litdPub, err := btcec.ParsePubKey(sessResp.Session.LocalPublicKey)
	require.NoError(t.t, err)

	// We then query the autopilot server to extract the private key that
	// it will be using for this session.
	pilotPriv, err := net.autopilotServer.GetPrivKey(litdPub)
	require.NoError(t.t, err)

	// Now we can connect to the mailbox from the PoV of the autopilot
	// server.
	pilotConn, metaDataInjector, err := connectMailboxWithRemoteKey(
		ctx, pilotPriv, litdPub,
	)
	require.NoError(t.t, err)
	defer pilotConn.Close()
	lndConn := lnrpc.NewLightningClient(pilotConn)

	// The autopilot server is expected to add a MetaInfo caveat to any
	// request that it makes. So we add that now and specify that it is
	// initially making requests on behalf of the HealthCheck feature.
	metaInfo := &firewall.InterceptMetaInfo{
		ActorName: "Autopilot Server",
		Feature:   "AutoFees",
	}
	caveat, err := metaInfo.ToCaveat()
	require.NoError(t.t, err)
	caveatCreds := metaDataInjector.addCaveat(caveat)

	// From the PoV of the Autopilot server, we do a quick FeeReport call.
	// This will force the Privacy Mapper on Alice's node to create the
	// real-pseudo pairs for all her channel id's and points. We do this
	// so that we can know which channels we are referring to when we make
	// calls from the autopilot later on in this test.
	feeReport, err := lndConn.FeeReport(
		ctx, &lnrpc.FeeReportRequest{}, caveatCreds,
	)
	require.NoError(t.t, err)
	require.Len(t.t, feeReport.ChannelFees, 4)

	// Query Alice's privacy mapper to see which pseudo channel ID the
	// autopilot should use when it tries to update one of the channels
	// that Alice has with Bob.
	litClient := litrpc.NewFirewallClient(rawConn)
	privMapResp, err := litClient.PrivacyMapConversion(
		ctxm, &litrpc.PrivacyMapConversionRequest{
			SessionId:    sessResp.Session.Id,
			RealToPseudo: true,
			Input:        chanABPoints[0],
		},
	)
	require.NoError(t.t, err)

	pseudoChanPoint := privMapResp.Output
	pseudoTxid, pseudoIndex, err := decodeChannelPoint(pseudoChanPoint)
	require.NoError(t.t, err)

	// Make sure that this channel point did in fact appear in the list
	// provided to the autopilot.
	var found bool
	for _, c := range feeReport.ChannelFees {
		if pseudoChanPoint == c.ChannelPoint {
			found = true
		}
	}
	require.True(t.t, found)

	// Now, from the autopilot's PoV, try to update the fees on this
	// channel. It should fail due to the fact that the channel peer, Bob,
	// is in the peer-restriction rule that Alice applied to the session.
	chanPoint := &lnrpc.ChannelPoint{
		FundingTxid: &lnrpc.ChannelPoint_FundingTxidStr{
			FundingTxidStr: pseudoTxid,
		},
		OutputIndex: pseudoIndex,
	}
	_, err = lndConn.UpdateChannelPolicy(
		ctx, &lnrpc.PolicyUpdateRequest{
			BaseFeeMsat: 9,
			FeeRate:     8,
			Scope: &lnrpc.PolicyUpdateRequest_ChanPoint{
				ChanPoint: chanPoint,
			},
			TimeLockDelta: 20,
			MaxHtlcMsat:   100000,
		}, caveatCreds,
	)
	assertStatusErr(t.t, err, codes.ResourceExhausted)
	require.ErrorContains(t.t, err, "illegal action on peer in peer "+
		"restriction list")

	// We now do the same thing for the other channel that Alice has with
	// Bob. This should also fail due to Bob being on the peer-restrict
	// list.
	privMapResp, err = litClient.PrivacyMapConversion(
		ctxm, &litrpc.PrivacyMapConversionRequest{
			SessionId:    sessResp.Session.Id,
			RealToPseudo: true,
			Input:        chanABPoints[1],
		},
	)
	require.NoError(t.t, err)

	pseudoChanPoint = privMapResp.Output
	pseudoTxid, pseudoIndex, err = decodeChannelPoint(pseudoChanPoint)
	require.NoError(t.t, err)

	// Now, from the autopilot's PoV, try to update the fees on this
	// channel. It should fail due to the fact that the channel peer, Bob,
	// is in the peer-restriction rule that Alice applied to the session.
	chanPoint = &lnrpc.ChannelPoint{
		FundingTxid: &lnrpc.ChannelPoint_FundingTxidStr{
			FundingTxidStr: pseudoTxid,
		},
		OutputIndex: pseudoIndex,
	}
	_, err = lndConn.UpdateChannelPolicy(
		ctx, &lnrpc.PolicyUpdateRequest{
			BaseFeeMsat: 9,
			FeeRate:     8,
			Scope: &lnrpc.PolicyUpdateRequest_ChanPoint{
				ChanPoint: chanPoint,
			},
			TimeLockDelta: 20,
			MaxHtlcMsat:   100000,
		}, caveatCreds,
	)
	assertStatusErr(t.t, err, codes.ResourceExhausted)
	require.ErrorContains(t.t, err, "illegal action on peer in peer "+
		"restriction list")

	// Again we query Alice's privacy mapper to see which pseudo channel ID
	// the autopilot should use for the channel she has with Charlie.
	// We first do this for the channel that is in the channel restrict
	// list.
	privMapResp, err = litClient.PrivacyMapConversion(
		ctxm, &litrpc.PrivacyMapConversionRequest{
			SessionId:    sessResp.Session.Id,
			RealToPseudo: true,
			Input:        chanACPoints[1],
		},
	)
	require.NoError(t.t, err)

	pseudoChanPoint = privMapResp.Output
	pseudoTxid, pseudoIndex, err = decodeChannelPoint(pseudoChanPoint)
	require.NoError(t.t, err)

	// The call to update the channel policy should fail due to this
	// channel being in the channel-restrict list.
	chanPoint = &lnrpc.ChannelPoint{
		FundingTxid: &lnrpc.ChannelPoint_FundingTxidStr{
			FundingTxidStr: pseudoTxid,
		},
		OutputIndex: pseudoIndex,
	}
	_, err = lndConn.UpdateChannelPolicy(
		ctx, &lnrpc.PolicyUpdateRequest{
			BaseFeeMsat: 9,
			FeeRate:     8,
			Scope: &lnrpc.PolicyUpdateRequest_ChanPoint{
				ChanPoint: chanPoint,
			},
			TimeLockDelta: 20,
			MaxHtlcMsat:   100000,
		}, caveatCreds,
	)
	assertStatusErr(t.t, err, codes.ResourceExhausted)
	require.ErrorContains(t.t, err, "illegal action on channel in channel "+
		"restriction list")

	// Finally, we repeat the test on the other channel that Alice has
	// with Charlie (the channel _not_ in the channel-restrict list).
	privMapResp, err = litClient.PrivacyMapConversion(
		ctxm, &litrpc.PrivacyMapConversionRequest{
			SessionId:    sessResp.Session.Id,
			RealToPseudo: true,
			Input:        chanACPoints[0],
		},
	)
	require.NoError(t.t, err)

	pseudoChanPoint = privMapResp.Output
	pseudoTxid, pseudoIndex, err = decodeChannelPoint(pseudoChanPoint)
	require.NoError(t.t, err)

	// The call to update the channel policy should succeed.
	chanPoint = &lnrpc.ChannelPoint{
		FundingTxid: &lnrpc.ChannelPoint_FundingTxidStr{
			FundingTxidStr: pseudoTxid,
		},
		OutputIndex: pseudoIndex,
	}
	_, err = lndConn.UpdateChannelPolicy(
		ctx, &lnrpc.PolicyUpdateRequest{
			BaseFeeMsat: 9,
			FeeRate:     8,
			Scope: &lnrpc.PolicyUpdateRequest_ChanPoint{
				ChanPoint: chanPoint,
			},
			TimeLockDelta: 20,
			MaxHtlcMsat:   100000,
		}, caveatCreds,
	)
	require.NoError(t.t, err)
}

func testLargeHttpHeader(ctx context.Context, net *NetworkHarness,
	t *harnessTest) {

	// First we add all LND's permissions so that any call we make to LND to
	// test that the connection is working will succeed.
	perms := lnd.MainRPCServerPermissions()

	// Now we pad the above valid perms with a bunch of junk perms. This is
	// done in order to make the macaroon that will be sent in the header
	// very big.
	for i := 0; i < 800; i++ {
		uniqueString := fmt.Sprintf("unique long string %d", i)
		perms[uniqueString] = []bakery.Op{
			{
				Entity: uniqueString,
				Action: "fake-action",
			},
		}
	}

	// We first override the autopilots features set. We create a feature
	// with a very large permissions set. This is done so that we can test
	// that a grpc/http header of a certain size does not break things.
	net.autopilotServer.SetFeatures(map[string]*mock.Feature{
		"TestFeature": {
			Rules:       map[string]*mock.RuleRanges{},
			Permissions: perms,
		},
	})

	// We expect a non-empty alias to be returned.
	aliceInfo, err := net.Alice.GetInfo(ctx, &lnrpc.GetInfoRequest{})
	require.NoError(t.t, err)
	require.NotEmpty(t.t, aliceInfo.Alias)

	// We create a connection to the Alice node's RPC server.
	cfg := net.Alice.Cfg
	rawConn, err := connectRPC(ctx, cfg.LitAddr(), cfg.LitTLSCertPath)
	require.NoError(t.t, err)
	defer rawConn.Close()

	macBytes, err := ioutil.ReadFile(cfg.LitMacPath)
	require.NoError(t.t, err)
	ctxm := macaroonContext(ctx, macBytes)

	// Test that the connection to Alice's rpc server is working and that
	// the autopilot server is returning a non-empty feature list.
	litClient := litrpc.NewAutopilotClient(rawConn)
	featResp, err := litClient.ListAutopilotFeatures(
		ctxm, &litrpc.ListAutopilotFeaturesRequest{},
	)
	require.NoError(t.t, err)
	require.NotEmpty(t.t, featResp)

	// Add a new Autopilot session that subscribes to a "Test", feature.
	// This call is expected to also result in Litd registering this session
	// with the mock autopilot server.
	sessResp, err := litClient.AddAutopilotSession(
		ctxm, &litrpc.AddAutopilotSessionRequest{
			Label: "integration-test",
			ExpiryTimestampSeconds: uint64(
				time.Now().Add(5 * time.Minute).Unix(),
			),
			MailboxServerAddr: mailboxServerAddr,
			Features: map[string]*litrpc.FeatureConfig{
				"TestFeature": {
					Rules: &litrpc.RulesMap{
						Rules: map[string]*litrpc.RuleValue{},
					},
				},
			},
			// Switch the privacy mapper off for simplicity’s sake.
			NoPrivacyMapper: true,
		},
	)
	require.NoError(t.t, err)

	// From the response, we can extract Lit's local public key.
	litdPub, err := btcec.ParsePubKey(sessResp.Session.LocalPublicKey)
	require.NoError(t.t, err)

	// We then query the autopilot server to extract the private key that
	// it will be using for this session.
	pilotPriv, err := net.autopilotServer.GetPrivKey(litdPub)
	require.NoError(t.t, err)

	// Now we can connect to the mailbox from the PoV of the autopilot
	// server.
	pilotConn, metaDataInjector, err := connectMailboxWithRemoteKey(
		ctx, pilotPriv, litdPub,
	)
	require.NoError(t.t, err)
	defer pilotConn.Close()
	lndConn := lnrpc.NewLightningClient(pilotConn)

	// The autopilot server is expected to add a MetaInfo caveat to any
	// request that it makes. So we add that now and specify that it is
	// initially making requests on behalf of the HealthCheck feature.
	metaInfo := &firewall.InterceptMetaInfo{
		ActorName: "Autopilot Server",
		Feature:   "TestFeature",
	}
	caveat, err := metaInfo.ToCaveat()
	require.NoError(t.t, err)
	caveatCreds := metaDataInjector.addCaveat(caveat)

	// Now we assert that the size of the macaroon that will go in the
	// request header is larger than a certain threshold.
	meta, err := caveatCreds.Creds.GetRequestMetadata(ctx, "")
	require.NoError(t.t, err)
	require.Greater(t.t, len([]byte(meta[HeaderMacaroon])), 40000)

	// Assert that requests from the autopilot work with this large header.
	getInfoReq, err := lndConn.GetInfo(
		ctx, &lnrpc.GetInfoRequest{}, caveatCreds,
	)
	require.NoError(t.t, err)
	require.Equal(t.t, aliceInfo.Alias, getInfoReq.Alias)
}

// connectMailboxWithRemoteKey tries to establish a connection through LNC using
// the given local and remote keys and the test mailbox server.
func connectMailboxWithRemoteKey(ctx context.Context,
	localKey *btcec.PrivateKey, remoteKey *btcec.PublicKey) (
	*grpc.ClientConn, *metadataInjector, error) {

	ecdh := &keychain.PrivKeyECDH{PrivKey: localKey}
	connData := mailbox.NewConnData(ecdh, remoteKey, nil, nil, nil, nil)
	noiseConn := mailbox.NewNoiseGrpcConn(connData)

	transportConn, err := mailbox.NewGrpcClient(
		ctx, mailboxServerAddr, connData,
		grpc.WithTransportCredentials(credentials.NewTLS(&tls.Config{})),
	)
	if err != nil {
		return nil, nil, err
	}

	dialOpts := []grpc.DialOption{
		grpc.WithContextDialer(transportConn.Dial),
		grpc.WithTransportCredentials(noiseConn),
		grpc.WithBlock(),
	}

	conn, err := grpc.DialContext(ctx, mailboxServerAddr, dialOpts...)
	return conn, &metadataInjector{originalCredentials: noiseConn}, err
}

type metadataInjector struct {
	originalCredentials credentials.PerRPCCredentials
}

func (m *metadataInjector) addCaveat(caveat string) grpc.PerRPCCredsCallOption {
	return grpc.PerRPCCredsCallOption{
		Creds: &caveatCredentials{
			originalCredentials: m.originalCredentials,
			caveat:              caveat,
		},
	}
}

type caveatCredentials struct {
	originalCredentials credentials.PerRPCCredentials
	caveat              string
}

func (c *caveatCredentials) GetRequestMetadata(ctx context.Context,
	uri ...string) (map[string]string, error) {

	metadata, err := c.originalCredentials.GetRequestMetadata(ctx, uri...)
	if err != nil {
		return nil, err
	}

	macHex, ok := metadata[HeaderMacaroon]
	if !ok || len(macHex) == 0 {
		return metadata, nil
	}

	mac, err := session.ParseMacaroon(macHex)
	if err != nil {
		return nil, err
	}

	if err := mac.AddFirstPartyCaveat([]byte(c.caveat)); err != nil {
		return nil, err
	}

	macBytes, err := mac.MarshalBinary()
	if err != nil {
		return nil, err
	}

	metadata[HeaderMacaroon] = hex.EncodeToString(macBytes)

	return metadata, nil
}

// RequireTransportSecurity indicates whether the credentials requires
// transport security.
func (c *caveatCredentials) RequireTransportSecurity() bool {
	return true
}

func decodeChannelPoint(cp string) (string, uint32, error) {
	parts := strings.Split(cp, ":")
	if len(parts) != 2 {
		return "", 0, fmt.Errorf("bad channel point encoding")
	}

	index, err := strconv.ParseInt(parts[1], 10, 64)
	if err != nil {
		return "", 0, err
	}

	return parts[0], uint32(index), nil
}
