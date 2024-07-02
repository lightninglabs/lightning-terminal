package itest

import (
	"context"
	"crypto/tls"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/btcsuite/btcd/btcec/v2"
	"github.com/btcsuite/btcd/btcutil"
	"github.com/btcsuite/btcd/chaincfg/chainhash"
	"github.com/btcsuite/btcd/wire"
	"github.com/lightninglabs/lightning-node-connect/mailbox"
	"github.com/lightninglabs/lightning-terminal/autopilotserver/mock"
	"github.com/lightninglabs/lightning-terminal/firewall"
	"github.com/lightninglabs/lightning-terminal/firewalldb"
	"github.com/lightninglabs/lightning-terminal/litrpc"
	"github.com/lightninglabs/lightning-terminal/rules"
	"github.com/lightninglabs/lightning-terminal/session"
	"github.com/lightningnetwork/lnd"
	"github.com/lightningnetwork/lnd/keychain"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/lntest"
	"github.com/lightningnetwork/lnd/lntest/wait"
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

	pubChannelsOnly = &litrpc.RuleValue_ChannelConstraint{
		ChannelConstraint: &litrpc.ChannelConstraint{
			MinCapacitySat: 500_000,
			MaxCapacitySat: 6_000_000,
			MaxPushSat:     0,
			PrivateAllowed: false,
			PublicAllowed:  true,
		},
	}

	onchainBudget = &litrpc.RuleValue_OnChainBudget{
		OnChainBudget: &litrpc.OnChainBudget{
			AbsoluteAmtSats: 10_000_000,
			MaxSatPerVByte:  30,
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

	onChainBudgetRule = &mock.RuleRanges{
		Default: &rules.OnChainBudget{
			AbsoluteAmtSats: 10_000_000,
			MaxSatPerVByte:  30,
		},
		MinVal: &rules.OnChainBudget{
			AbsoluteAmtSats: 1_000_000,
			MaxSatPerVByte:  20,
		},
		MaxVal: &rules.OnChainBudget{
			AbsoluteAmtSats: 100_000_000,
			MaxSatPerVByte:  2_000,
		},
	}

	chanConstraintsRule = &mock.RuleRanges{
		Default: &rules.ChannelConstraint{
			MinCapacitySat: 600_000,
			MaxCapacitySat: 6_000_000,
			MaxPushSat:     0,
			PrivateAllowed: true,
			PublicAllowed:  true,
		},
		MinVal: &rules.ChannelConstraint{
			MinCapacitySat: 500_000,
			MaxCapacitySat: 500_000,
			MaxPushSat:     0,
			PrivateAllowed: false,
			PublicAllowed:  false,
		},
		MaxVal: &rules.ChannelConstraint{
			MinCapacitySat: 10_000_000,
			MaxCapacitySat: 10_000_000_000,
			MaxPushSat:     0,
			PrivateAllowed: true,
			PublicAllowed:  true,
		},
	}
)

// assertStatusErr asserts that the given error contains the given status code.
func assertStatusErr(t *testing.T, err error, code codes.Code) {
	require.Error(t, err)
	require.Contains(t, err.Error(), code.String())
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
	defer closeChannelAndAssert(t, net, net.Alice, channelOp, false)

	t.t.Run("history limit rule", func(_ *testing.T) {
		testHistoryLimitRule(net, t)
	})

	t.t.Run("channel policy bounds rule", func(_ *testing.T) {
		testChanPolicyBoundsRule(net, t)
	})

	t.t.Run("peer and channel restrict rules", func(_ *testing.T) {
		testPeerAndChannelRestrictRules(net, t)
	})

	t.t.Run("rate limit and privacy mapper", func(_ *testing.T) {
		testRateLimitAndPrivacyMapper(net, t)
	})

	t.t.Run("session linking", func(_ *testing.T) {
		testSessionLinking(net, t)
	})

	t.t.Run("channel constraint and budget rules", func(tt *testing.T) {
		testChannelOpening(net, t, tt)
	})

	t.t.Run("privacy flags", func(_ *testing.T) {
		testPrivacyFlags(net, t)
	})
}

// testPrivacyFlags tests that the privacy flags are enforced correctly.
// We want to test the three privacy related interactions:
// 1. the privacy mapper for the interception of messages
// 2. the rule enforcer's privacy mapping
// 3. the feature config's obfuscation
func testPrivacyFlags(net *NetworkHarness, t *harnessTest) {
	ctx := context.Background()

	net.autopilotServer.ResetDefaultFeatures()

	// We assert that we only have a single channel open between Alice and
	// Bob.
	aliceChannels, err := net.Alice.ListChannels(
		ctx, &lnrpc.ListChannelsRequest{},
	)
	require.NoError(t.t, err)
	require.Len(t.t, aliceChannels.Channels, 1)
	require.Equal(t.t, net.Bob.PubKeyStr,
		aliceChannels.Channels[0].RemotePubkey)

	// Set up a connection to Alice's lit RPC server.
	cfg := net.Alice.Cfg
	rawConn, err := connectRPC(ctx, cfg.LitAddr(), cfg.LitTLSCertPath)
	require.NoError(t.t, err)
	defer rawConn.Close()

	litAutopilotClient := litrpc.NewAutopilotClient(rawConn)

	macBytes, err := os.ReadFile(cfg.LitMacPath)
	require.NoError(t.t, err)
	ctxm := macaroonContext(ctx, macBytes)

	// Set up private and non-private features within the mock autopilot
	// server.
	privateFeature := &mock.Feature{
		Description: "manages your channel privately",
		Rules: map[string]*mock.RuleRanges{
			rules.PeersRestrictName: {
				Default: &rules.PeerRestrict{},
				MinVal:  &rules.PeerRestrict{},
				MaxVal:  &rules.PeerRestrict{},
			},
		},
		Permissions: map[string][]bakery.Op{
			"/lnrpc.Lightning/ListChannels": {{
				Entity: "offchain",
				Action: "read",
			}},
		},
		// We set no flags to indicate that we want full privacy.
		PrivacyFlags: 0,
	}

	clearPubkeysFlags := session.PrivacyFlags{session.ClearPubkeys}
	nonPrivateFeature := &mock.Feature{
		Description: "manages your channel with cleartext pubkeys",
		Rules: map[string]*mock.RuleRanges{
			rules.PeersRestrictName: {
				Default: &rules.PeerRestrict{},
				MinVal:  &rules.PeerRestrict{},
				MaxVal:  &rules.PeerRestrict{},
			},
		},
		Permissions: map[string][]bakery.Op{
			"/lnrpc.Lightning/ListChannels": {{
				Entity: "offchain",
				Action: "read",
			}},
		},
		PrivacyFlags: clearPubkeysFlags.Serialize(),
	}

	net.autopilotServer.SetFeatures(map[string]*mock.Feature{
		"Private":    privateFeature,
		"NonPrivate": nonPrivateFeature,
	})

	featResp, err := litAutopilotClient.ListAutopilotFeatures(
		ctxm, &litrpc.ListAutopilotFeaturesRequest{},
	)
	require.NoError(t.t, err)
	require.Len(t.t, featResp.Features, 2)

	// Now we set up an initial autopilot session. The session will register
	// both features. They have different privacy flags, which will result
	// in registering a session with the lowest overall privacy.
	sessFeatures := map[string]*litrpc.FeatureConfig{
		"Private":    {},
		"NonPrivate": {},
	}

	session0, err := litAutopilotClient.AddAutopilotSession(
		ctxm, &litrpc.AddAutopilotSessionRequest{
			Label: "integration-test",
			ExpiryTimestampSeconds: uint64(
				time.Now().Add(5 * time.Minute).Unix(),
			),
			MailboxServerAddr: mailboxServerAddr,
			Features:          sessFeatures,
		},
	)
	require.NoError(t.t, err)

	assertPrivacyFlags(net, t, session0.Session, clearPubkeysFlags)

	// The peer restrict list contains Bob's pubkey in order to check
	// against the privacy db later if the pubkey was obfuscated before any
	// request was made or not.
	peerRestrict := &litrpc.RuleValue_PeerRestrict{
		PeerRestrict: &litrpc.PeerRestrict{
			PeerIds: []string{net.Bob.PubKeyStr},
		},
	}

	// Create a feature configuration map for some pubkey, it will be
	// obfuscated depending on the privacy flags.
	configPubkey := "0e092708c9e737115ff14a85b65466561280d" +
		"77c1b8cd666bc655536ad81ccca85"

	config := struct {
		PubKeys []string `json:"pubkeys"`
	}{
		PubKeys: []string{configPubkey},
	}
	configBytes, err := json.Marshal(config)
	require.NoError(t.t, err)

	// We now set up a single *private* feature within a session using
	// restrictions and a config.
	privFeature := map[string]*litrpc.FeatureConfig{
		"Private": {
			Rules: &litrpc.RulesMap{
				Rules: map[string]*litrpc.RuleValue{
					rules.PeersRestrictName: {
						Value: peerRestrict,
					},
				},
			},
			Config: configBytes,
		},
	}

	session1, err := litAutopilotClient.AddAutopilotSession(
		ctxm, &litrpc.AddAutopilotSessionRequest{
			Label: "integration-test",
			ExpiryTimestampSeconds: uint64(
				time.Now().Add(5 * time.Minute).Unix(),
			),
			MailboxServerAddr: mailboxServerAddr,
			Features:          privFeature,
		},
	)
	require.NoError(t.t, err)

	assertPrivacyFlags(net, t, session1.Session, session.PrivacyFlags{})

	// Set up a client connection to query the privacy mapper.
	litFWClient := litrpc.NewFirewallClient(rawConn)

	// We should have a pseudo pair in the privacy mapper for Bob's pubkey
	// due to the peer restriction and a pseudo pair for the config pubkey
	// due to the feature config.
	assertPseudo(ctxm, t.t, litFWClient, session1.Session.GroupId,
		net.Bob.PubKeyStr, "")
	assertPseudo(ctxm, t.t, litFWClient, session1.Session.GroupId,
		configPubkey, "")

	// We now set up a partially deobfuscated session.
	nonPrivFeature := map[string]*litrpc.FeatureConfig{
		"NonPrivate": {
			Rules: &litrpc.RulesMap{
				Rules: map[string]*litrpc.RuleValue{
					rules.PeersRestrictName: {
						Value: peerRestrict,
					},
				},
			},
			Config: configBytes,
		},
	}

	session2, err := litAutopilotClient.AddAutopilotSession(
		ctxm, &litrpc.AddAutopilotSessionRequest{
			Label: "integration-test",
			ExpiryTimestampSeconds: uint64(
				time.Now().Add(5 * time.Minute).Unix(),
			),
			MailboxServerAddr: mailboxServerAddr,
			Features:          nonPrivFeature,
		},
	)
	require.NoError(t.t, err)

	assertPrivacyFlags(net, t, session2.Session, clearPubkeysFlags)

	// We shouldn't have a pseudo pair in the privacy mapper for Bob's
	// pubkey or the config pubkey as pubkey mapping was turned off.
	assertPseudo(ctxm, t.t, litFWClient, session2.Session.GroupId,
		net.Bob.PubKeyStr, "no such key found")
	assertPseudo(ctxm, t.t, litFWClient, session2.Session.GroupId,
		configPubkey, "no such key found")

	// Set up a client from the PoV of the autopilot server for the private
	// session.
	lndConn1, metaDataInjector, cleanup1 := newAutopilotLndConn(
		ctx, t.t, net, session1.Session,
	)
	t.t.Cleanup(func() { require.NoError(t.t, cleanup1()) })

	metaInfo1 := &firewall.InterceptMetaInfo{
		ActorName: "Autopilot Server",
		Feature:   "Private",
	}
	caveat1, err := metaInfo1.ToCaveat()
	require.NoError(t.t, err)
	caveatCreds1 := metaDataInjector.addCaveat(caveat1)

	// Set up a client from the PoV of the autopilot server for the
	// non-private session.
	lndConn2, metaDataInjector, cleanup2 := newAutopilotLndConn(
		ctx, t.t, net, session2.Session,
	)
	t.t.Cleanup(func() { require.NoError(t.t, cleanup2()) })

	// The autopilot server is expected to add a MetaInfo caveat to any
	// request that it makes. So we add that now and specify that it is
	// initially making requests on behalf of the NonPrivate feature.
	metaInfo2 := &firewall.InterceptMetaInfo{
		ActorName: "Autopilot Server",
		Feature:   "NonPrivate",
	}
	caveat2, err := metaInfo2.ToCaveat()
	require.NoError(t.t, err)
	caveatCreds2 := metaDataInjector.addCaveat(caveat2)

	// We compare Alice's channels to the obfuscated and non-obfuscated
	// channels.
	obfuscatedChannels, err := lndConn1.ListChannels(
		ctx, &lnrpc.ListChannelsRequest{}, caveatCreds1,
	)
	require.NoError(t.t, err)
	require.Len(t.t, obfuscatedChannels.Channels, 1)

	nonObfuscatedChannels, err := lndConn2.ListChannels(
		ctx, &lnrpc.ListChannelsRequest{}, caveatCreds2,
	)
	require.NoError(t.t, err)
	require.Len(t.t, nonObfuscatedChannels.Channels, 1)

	clearChan := aliceChannels.Channels[0]
	nonObfChan := nonObfuscatedChannels.Channels[0]
	obfChan := obfuscatedChannels.Channels[0]

	// In the non-obfuscated response we expect to see the clear text
	// pubkey, while in the obfuscated response we expect to see a different
	// pubkey.
	require.Equal(t.t, clearChan.RemotePubkey, nonObfChan.RemotePubkey)
	require.NotEqual(t.t, clearChan.RemotePubkey, obfChan.RemotePubkey)

	// Other fields are still obfuscated.
	require.NotEqual(t.t, clearChan.ChannelPoint, nonObfChan.ChannelPoint)
	require.NotEqual(t.t, obfChan.ChannelPoint, nonObfChan.ChannelPoint)

	// We now link to the private session registering a non-private
	// feature. We expect that the new privacy flags have downgraded the
	// privacy. Revoke the previous obfuscated session.
	_, err = litAutopilotClient.RevokeAutopilotSession(
		ctxm, &litrpc.RevokeAutopilotSessionRequest{
			LocalPublicKey: session1.Session.LocalPublicKey,
		},
	)
	require.NoError(t.t, err)

	session3, err := litAutopilotClient.AddAutopilotSession(
		ctxm, &litrpc.AddAutopilotSessionRequest{
			Label: "integration-test",
			ExpiryTimestampSeconds: uint64(
				time.Now().Add(5 * time.Minute).Unix(),
			),
			MailboxServerAddr: mailboxServerAddr,
			Features:          nonPrivFeature,
			LinkedGroupId:     session1.Session.GroupId,
		},
	)
	require.NoError(t.t, err)

	assertPrivacyFlags(net, t, session3.Session, clearPubkeysFlags)
}

// testSessionLinking will test the expected behaviour across linked sessions.
func testSessionLinking(net *NetworkHarness, t *harnessTest) {
	ctx := context.Background()

	/*
		Open up a few more channels for Alice so that we can make use
		of the channel restriction rule in the sessions that we will
		create in this test. One channel already exists, so let's open
		two more.
	*/
	channelAB2Op := openChannelAndAssert(
		t, net, net.Alice, net.Bob, lntest.OpenChannelParams{
			Amt: 100000,
		},
	)
	defer closeChannelAndAssert(t, net, net.Alice, channelAB2Op, false)

	channelAB3Op := openChannelAndAssert(
		t, net, net.Alice, net.Bob, lntest.OpenChannelParams{
			Amt: 100000,
		},
	)
	defer closeChannelAndAssert(t, net, net.Alice, channelAB3Op, false)

	// List Alice's channels so that we can extract the channel points for
	// the three channels.
	chans, err := net.Alice.ListChannels(ctx, &lnrpc.ListChannelsRequest{})
	require.NoError(t.t, err)
	require.Len(t.t, chans.Channels, 3)

	// Create a lookup map with Alice's channels. Also let the first 2
	// channels be in the "restricted" list.
	var (
		aliceChans = make(
			map[string]bool, len(chans.Channels),
		)
		chansToRestrict       = make([]uint64, 2)
		unrestrictedChanID    uint64
		unrestrictedChanPoint string
	)
	for i, c := range chans.Channels {
		aliceChans[c.ChannelPoint] = true

		if i >= 2 {
			unrestrictedChanID = c.ChanId
			unrestrictedChanPoint = c.ChannelPoint

			continue
		}

		chansToRestrict[i] = c.ChanId
	}

	channelRestrict := &litrpc.RuleValue_ChannelRestrict{
		ChannelRestrict: &litrpc.ChannelRestrict{
			ChannelIds: chansToRestrict,
		},
	}

	// Construct a new feature definition that allows for both channel
	// restriction and rate limit rules.
	autofeesFeature := &mock.Feature{
		Description: "manages your channel fees",
		Rules: map[string]*mock.RuleRanges{
			rules.ChannelRestrictName: {
				Default: &rules.ChannelRestrict{},
				MinVal:  &rules.ChannelRestrict{},
				MaxVal:  &rules.ChannelRestrict{},
			},
			rules.RateLimitName: mock.RateLimitRule,
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
	}

	// Override the autopilots feature set with two identical looking
	// features with different names. The reason we do this is so that
	// we can test that obfuscated values are shared amongst features in
	// the same session.
	net.autopilotServer.SetFeatures(map[string]*mock.Feature{
		"AutoFees":  autofeesFeature,
		"AutoFees2": autofeesFeature,
	})

	// Set up a connection to Alice's RPC server.
	cfg := net.Alice.Cfg
	rawConn, err := connectRPC(ctx, cfg.LitAddr(), cfg.LitTLSCertPath)
	require.NoError(t.t, err)
	defer rawConn.Close()

	macBytes, err := os.ReadFile(cfg.LitMacPath)
	require.NoError(t.t, err)
	ctxm := macaroonContext(ctx, macBytes)

	// Test that the connection to Alice's rpc server is working and that
	// the autopilot server is returning a non-empty feature list.
	litFWClient := litrpc.NewFirewallClient(rawConn)
	litAutopilotClient := litrpc.NewAutopilotClient(rawConn)
	featResp, err := litAutopilotClient.ListAutopilotFeatures(
		ctxm, &litrpc.ListAutopilotFeaturesRequest{},
	)
	require.NoError(t.t, err)
	require.NotEmpty(t.t, featResp)

	// Create a feature configuration map.
	config := struct {
		PubKeys    []string `json:"pubkeys"`
		ChanPoints []string `json:"chanpoints"`
	}{
		PubKeys: []string{
			hex.EncodeToString(net.Bob.PubKey[:]),
			"0e092708c9e737115ff14a85b65466561280d" +
				"77c1b8cd666bc655536ad81ccca85",
		},
		ChanPoints: []string{
			unrestrictedChanPoint,
			"0e092708c9e737115ff14a85b65466561280d" +
				"77c1b8cd666bc655536ad81ccca3:1",
		},
	}

	configBytes, err := json.Marshal(config)
	require.NoError(t.t, err)

	// Now we set up an initial autopilot session. The session will register
	// to both features, and it will place the channel restriction on both
	// features. It will also apply a low rate limit on both features, and
	// it will have some feature configs.
	sessFeatures := map[string]*litrpc.FeatureConfig{
		"AutoFees": {
			Rules: &litrpc.RulesMap{
				Rules: map[string]*litrpc.RuleValue{
					rules.ChannelRestrictName: {
						Value: channelRestrict,
					},
					rules.RateLimitName: {
						Value: rateLimit,
					},
				},
			},
			Config: configBytes,
		},
		"AutoFees2": {
			Rules: &litrpc.RulesMap{
				Rules: map[string]*litrpc.RuleValue{
					rules.ChannelRestrictName: {
						Value: channelRestrict,
					},
					rules.RateLimitName: {
						Value: rateLimit,
					},
				},
			},
			Config: configBytes,
		},
	}

	sessResp, err := litAutopilotClient.AddAutopilotSession(
		ctxm, &litrpc.AddAutopilotSessionRequest{
			Label: "integration-test",
			ExpiryTimestampSeconds: uint64(
				time.Now().Add(5 * time.Minute).Unix(),
			),
			MailboxServerAddr: mailboxServerAddr,
			Features:          sessFeatures,
		},
	)
	require.NoError(t.t, err)

	// getPseudo is a helper that can be used to query Alice's privacy map
	// DB to get the pseudo value for a given real value.
	getPseudo := func(groupID []byte, input any, expError string) string {
		return assertPseudo(
			ctxm, t.t, litFWClient, groupID, input, expError,
		)
	}

	// At this point, we already expect there to be entries in the privacy
	// map DB for the restricted channel IDs. Collect them now.
	obfuscatedChansToRestrict := make(map[uint64]bool)
	for _, c := range chansToRestrict {
		oc := getPseudo(sessResp.Session.GroupId, c, "")
		ocInt, err := firewalldb.StrToUint64(oc)
		require.NoError(t.t, err)

		obfuscatedChansToRestrict[ocInt] = true
	}

	// Also try to query the channel that does not have a restriction. At
	// this point we do not expect an entry in the privacy mapper.
	getPseudo(
		sessResp.Session.GroupId, unrestrictedChanID,
		"no such key found",
	)

	// We do expect an entry in the privacy mapper for all items in the
	// config map though. So we make sure that the channel point of the
	// unrestricted channel is in the db.
	obfUnrestrictedChanPoint := getPseudo(
		sessResp.Session.GroupId, unrestrictedChanPoint, "",
	)

	// Now, let's connect to the LiT node from the point of view of the
	// autopilot server.
	lndConn, metaDataInjector, cleanup1 := newAutopilotLndConn(
		ctx, t.t, net, sessResp.Session,
	)
	t.t.Cleanup(func() { require.NoError(t.t, cleanup1()) })

	// The autopilot server is expected to add a MetaInfo caveat to any
	// request that it makes. So we add that now and specify that it is
	// initially making requests on behalf of the AutoFees feature.
	metaInfo1 := &firewall.InterceptMetaInfo{
		ActorName: "Autopilot Server",
		Feature:   "AutoFees",
	}
	caveat1, err := metaInfo1.ToCaveat()
	require.NoError(t.t, err)
	caveatCreds1 := metaDataInjector.addCaveat(caveat1)

	// From the PoV of the Autopilot server, we do a quick FeeReport call.
	// This will force the Privacy Mapper on Alice's node to create the
	// real-pseudo pairs for all her channel id's and points. Note that
	// this should only create one new ChanID entry since two were already
	// created previously.
	feeReport, err := lndConn.FeeReport(
		ctx, &lnrpc.FeeReportRequest{}, caveatCreds1,
	)
	require.NoError(t.t, err)
	require.Len(t.t, feeReport.ChannelFees, 3)

	// For completeness, we do the same call from the autopilot server but
	// from the "AutoFees2" feature. This should return the same result.
	metaInfo2 := &firewall.InterceptMetaInfo{
		ActorName: "Autopilot Server",
		Feature:   "AutoFees2",
	}
	caveat2, err := metaInfo2.ToCaveat()
	require.NoError(t.t, err)
	caveatCreds2 := metaDataInjector.addCaveat(caveat2)
	feeReport2, err := lndConn.FeeReport(
		ctx, &lnrpc.FeeReportRequest{}, caveatCreds2,
	)
	require.NoError(t.t, err)
	require.ElementsMatch(
		t.t, feeReport.ChannelFees, feeReport2.ChannelFees,
	)

	// Once again query Alice's privacy mapper to ensure that the obfuscated
	// channel IDs of the restricted channels have not changed.
	aliceObfchans := make(map[uint64]bool)
	for _, c := range chansToRestrict {
		oc := getPseudo(sessResp.Session.GroupId, c, "")
		ocInt, err := firewalldb.StrToUint64(oc)
		require.NoError(t.t, err)
		require.True(t.t, obfuscatedChansToRestrict[ocInt])

		aliceObfchans[ocInt] = true
	}

	// This time, there should also be an entry for the unrestricted
	// channel.
	obfuscatedUnrestrictedChan := getPseudo(
		sessResp.Session.GroupId, unrestrictedChanID, "",
	)
	obfUnrestrictedChanID, err := firewalldb.StrToUint64(
		obfuscatedUnrestrictedChan,
	)
	require.NoError(t.t, err)

	aliceObfchans[obfUnrestrictedChanID] = true

	// Iterate over the channels list sent to the autopilot server in the
	// fee report and ensure that they match the set of obfuscated channel
	// IDs we have for Alice.
	for _, channel := range feeReport.ChannelFees {
		require.True(t.t, aliceObfchans[channel.ChanId])

		// Check that the obfuscated channel point for the unrestricted
		// channel's ID is equal to the one created before due to the
		// contents of the feature config.
		if channel.ChanId == obfUnrestrictedChanID {
			require.Equal(t.t, channel.ChannelPoint,
				obfUnrestrictedChanPoint)
		}
	}

	// Now we will perform a single write call from the autopilot server on
	// the unrestricted channel.
	pseudoTxid, pseudoIndex, err := decodeChannelPoint(
		obfUnrestrictedChanPoint,
	)
	require.NoError(t.t, err)

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
		}, caveatCreds1,
	)
	require.NoError(t.t, err)

	// Try to create a new session linked to the previous one. This should
	// fail due to the previous one still being active.
	_, err = litAutopilotClient.AddAutopilotSession(
		ctxm, &litrpc.AddAutopilotSessionRequest{
			Label: "integration-test",
			ExpiryTimestampSeconds: uint64(
				time.Now().Add(5 * time.Minute).Unix(),
			),
			MailboxServerAddr: mailboxServerAddr,
			Features:          sessFeatures,
			LinkedGroupId:     sessResp.Session.GroupId,
		},
	)
	require.ErrorContains(t.t, err, "is still active")

	// Revoke the previous one and repeat.
	_, err = litAutopilotClient.RevokeAutopilotSession(
		ctxm, &litrpc.RevokeAutopilotSessionRequest{
			LocalPublicKey: sessResp.Session.LocalPublicKey,
		},
	)
	require.NoError(t.t, err)

	sessResp2, err := litAutopilotClient.AddAutopilotSession(
		ctxm, &litrpc.AddAutopilotSessionRequest{
			Label: "integration-test",
			ExpiryTimestampSeconds: uint64(
				time.Now().Add(5 * time.Minute).Unix(),
			),
			MailboxServerAddr: mailboxServerAddr,
			Features:          sessFeatures,
			LinkedGroupId:     sessResp.Session.GroupId,
		},
	)
	require.NoError(t.t, err)

	// Since the new session is linked to the first one, we expect the
	// channel IDs in the restricted list to have the same privacy mapping
	// as before.
	for _, c := range chansToRestrict {
		oc := getPseudo(sessResp2.Session.GroupId, c, "")
		ocInt, err := firewalldb.StrToUint64(oc)
		require.NoError(t.t, err)

		require.True(t.t, obfuscatedChansToRestrict[ocInt])
	}

	// Now we connect to LiT from the PoV of the autopilot server but this
	// time using the new session.
	lndConn, metaDataInjector, cleanup2 := newAutopilotLndConn(
		ctx, t.t, net, sessResp2.Session,
	)
	t.t.Cleanup(func() { require.NoError(t.t, cleanup2()) })

	caveatCreds1 = metaDataInjector.addCaveat(caveat1)

	// List the channels and ensure that the same mapping was used as for
	// the previous session.
	feeReport3, err := lndConn.FeeReport(
		ctx, &lnrpc.FeeReportRequest{}, caveatCreds1,
	)
	require.NoError(t.t, err)

	for _, channel := range feeReport3.ChannelFees {
		require.True(t.t, aliceObfchans[channel.ChanId])
	}

	// Now we will test that the rule enforcer's DB is shared across the two
	// linked sessions. In the first session, we made one read call and one
	// write call with the "AutoFees" feature. Since this new session is
	// linked to that one, we should have one read call remaining and no
	// write calls remaining. We used the second read call above for the
	// call to FeeReport, and so we now expect a second call to FeeReport
	// to fail too.
	_, err = lndConn.FeeReport(ctx, &lnrpc.FeeReportRequest{}, caveatCreds1)
	assertStatusErr(t.t, err, codes.ResourceExhausted)

	_, err = lndConn.UpdateChannelPolicy(
		ctx, &lnrpc.PolicyUpdateRequest{
			BaseFeeMsat: 9,
			FeeRate:     8,
			Scope: &lnrpc.PolicyUpdateRequest_ChanPoint{
				ChanPoint: chanPoint,
			},
			TimeLockDelta: 20,
			MaxHtlcMsat:   100000,
		}, caveatCreds1,
	)
	assertStatusErr(t.t, err, codes.ResourceExhausted)
}

// testChannelOpening tests that a client connected via a firewall can open
// channels to a peer respecting the channel rules set by the firewall.
func testChannelOpening(net *NetworkHarness, ht *harnessTest, t *testing.T) {
	ctx := context.Background()

	// We create a connection to the Alice node's RPC server.
	cfg := net.Alice.Cfg
	rawConn, err := connectRPC(ctx, cfg.LitAddr(), cfg.LitTLSCertPath)
	require.NoError(t, err)
	defer rawConn.Close()

	// Create a node to open channels to.
	charlie, err := net.NewNode(t, "Charlie", nil, false, true)
	require.NoError(t, err)
	defer shutdownAndAssert(net, ht, charlie)

	macBytes, err := os.ReadFile(cfg.LitMacPath)
	require.NoError(t, err)
	ctxm := macaroonContext(ctx, macBytes)

	// Set up the privacy flags used for channel opening.
	flags := session.PrivacyFlags{
		session.ClearPubkeys, session.ClearNetworkAddresses,
	}

	// We override the autopilot to offer a channel open service that has a
	// rules attached that apply to channel opening.
	net.autopilotServer.SetFeatures(map[string]*mock.Feature{
		"OpenChannels": {
			Description: "open channels while you sleep!",
			Rules: map[string]*mock.RuleRanges{
				rules.OnChainBudgetName:    onChainBudgetRule,
				rules.ChanConstraintName:   chanConstraintsRule,
				rules.ChanPolicyBoundsName: chanPolicyBoundsRule,
			},
			Permissions: map[string][]bakery.Op{
				"/lnrpc.Lightning/ListChannels": {{
					Entity: "offchain",
					Action: "read",
				}},
				"/lnrpc.Lightning/OpenChannelSync": {{
					Entity: "onchain",
					Action: "write",
				}},
				"/lnrpc.Lightning/BatchOpenChannel": {{
					Entity: "onchain",
					Action: "write",
				}},
				"/lnrpc.Lightning/ConnectPeer": {{
					Entity: "peers",
					Action: "write",
				}},
				"/lnrpc.Lightning/PendingChannels": {{
					Entity: "offchain",
					Action: "read",
				}},
			},
			PrivacyFlags: flags.Serialize(),
		},
	})

	// Test that the connection to Alice's rpc server is working and that
	// the autopilot server is returning a non-empty feature list.
	litClient := litrpc.NewAutopilotClient(rawConn)
	featResp, err := litClient.ListAutopilotFeatures(
		ctxm, &litrpc.ListAutopilotFeaturesRequest{},
	)
	require.NoError(t, err)
	require.NotEmpty(t, featResp)

	// Add a new Autopilot session that subscribes to the "OpenChannels"
	// feature and set the rule that disallows private channels and allows
	// public ones. We set budget and policy rules as well.
	sessResp, err := litClient.AddAutopilotSession(
		ctxm, &litrpc.AddAutopilotSessionRequest{
			Label: "integration-test",
			ExpiryTimestampSeconds: uint64(
				time.Now().Add(5 * time.Minute).Unix(),
			),
			MailboxServerAddr: mailboxServerAddr,
			Features: map[string]*litrpc.FeatureConfig{
				"OpenChannels": {
					Rules: &litrpc.RulesMap{
						Rules: map[string]*litrpc.RuleValue{
							rules.ChanConstraintName: {
								Value: pubChannelsOnly,
							},
							rules.OnChainBudgetName: {
								Value: onchainBudget,
							},
							rules.ChanPolicyBoundsName: {
								Value: policyBounds,
							},
						},
					},
				},
			},
			PrivacyFlags:    flags.Serialize(),
			PrivacyFlagsSet: true,
		},
	)
	require.NoError(t, err)

	// We now connect to the mailbox from the PoV of the autopilot server.
	lndConn1, metaDataInjector, cleanup1 := newAutopilotLndConn(
		ctx, t, net, sessResp.Session,
	)
	t.Cleanup(func() { require.NoError(t, cleanup1()) })

	// The autopilot server is expected to add a MetaInfo caveat to any
	// request that it makes. So we add that now and specify that it is
	// initially making requests on behalf of the OpenChannels feature.
	metaInfo := &firewall.InterceptMetaInfo{
		ActorName: "Autopilot Server",
		Feature:   "OpenChannels",
	}
	caveat, err := metaInfo.ToCaveat()
	require.NoError(t, err)
	caveatCreds := metaDataInjector.addCaveat(caveat)

	// Should be able to tell alice to connect to charlie using charlie's
	// real pub key and address since the relevant flags were set.
	_, err = lndConn1.ConnectPeer(
		ctx, &lnrpc.ConnectPeerRequest{
			Addr: &lnrpc.LightningAddress{
				Pubkey: charlie.PubKeyStr,
				Host:   charlie.Cfg.P2PAddr(),
			},
		}, caveatCreds,
	)
	require.NoError(t, err)

	// Private channels are not allowed (testing the channel constraint
	// rule).
	_, err = lndConn1.BatchOpenChannel(
		ctx, &lnrpc.BatchOpenChannelRequest{
			Channels: []*lnrpc.BatchOpenChannel{
				{
					NodePubkey:         charlie.PubKey[:],
					LocalFundingAmount: 6_000_000,
					Private:            true,
					MinHtlcMsat:        1_000,
				},
			},
		}, caveatCreds,
	)
	require.ErrorContains(t, err, "private channels not allowed")

	// A public channel that is too big should also fail (testing the
	// channel constraint rule). We also test that the min htlc amount is
	// wrong (testing the policy rule), giving us back an error for both
	// rule violations.
	_, err = lndConn1.BatchOpenChannel(
		ctx, &lnrpc.BatchOpenChannelRequest{
			Channels: []*lnrpc.BatchOpenChannel{
				{
					NodePubkey:         charlie.PubKey[:],
					LocalFundingAmount: 6_000_001,
					MinHtlcMsat:        10,
				},
			},
		}, caveatCreds,
	)
	require.ErrorContains(t, err, "invalid total capacity")
	require.ErrorContains(t, err, "invalid min htlc msat amount")

	// Now test a successful channel open, spending 6 Msat out of the 10
	// Msat budget.
	batchResp, err := lndConn1.BatchOpenChannel(
		ctx, &lnrpc.BatchOpenChannelRequest{
			Channels: []*lnrpc.BatchOpenChannel{
				{
					NodePubkey:         charlie.PubKey[:],
					LocalFundingAmount: 6_000_000,
					MinHtlcMsat:        1_000,
					Memo:               "mymemo",
				},
			},
		}, caveatCreds,
	)
	require.NoError(t, err)

	// lastMemo is used to check that the memo field is unique accross
	// different channel opens.
	var lastMemo string
	assertChannelExistsAndClose := func(txIdHidden []byte,
		outIdxHidden uint32) {

		net.Miner.AssertNumTxsInMempool(1)
		net.Miner.MineBlocks(6)

		// The channel open response's txid is to be interpreted as a
		// byte reveresed hash, which is used to check that the channel
		// is present.
		txHashHidden, err := chainhash.NewHash(txIdHidden)
		require.NoError(t, err)

		aliceFW := litrpc.NewFirewallClient(rawConn)

		// Query Alice's privacy mapper to see what the real txid is.
		chanPoint := fmt.Sprintf(
			"%s:%d", txHashHidden.String(), outIdxHidden,
		)
		privMapResp, err := aliceFW.PrivacyMapConversion(
			ctxm, &litrpc.PrivacyMapConversionRequest{
				SessionId: sessResp.Session.Id,
				Input:     chanPoint,
			},
		)
		require.NoError(t, err)

		// We assert that the channel exists using the real channel
		// point.
		txid, outputIndex, err := firewalldb.DecodeChannelPoint(
			privMapResp.Output,
		)
		require.NoError(t, err)

		tx, err := chainhash.NewHashFromStr(txid)
		require.NoError(t, err)

		outpoint := wire.OutPoint{
			Hash:  *tx,
			Index: outputIndex,
		}
		err = ht.lndHarness.AssertChannelExists(
			ht.lndHarness.Alice, &outpoint,
		)
		require.NoError(t, err)

		// Before doing any further tests, make sure to close out the
		// channel should tests fail.
		defer closeChannelAndAssert(ht, net, net.Alice,
			&lnrpc.ChannelPoint{
				FundingTxid: &lnrpc.ChannelPoint_FundingTxidStr{
					FundingTxidStr: txid,
				},
				OutputIndex: outputIndex,
			}, false)

		// We check that a memo was added to the channel.
		channels, err := net.Alice.ListChannels(
			ctx, &lnrpc.ListChannelsRequest{},
		)
		require.NoError(t, err)

		var thisMemo string
		for _, channel := range channels.Channels {
			if channel.ChannelPoint == outpoint.String() {
				parts := strings.Split(channel.Memo, ":")
				require.GreaterOrEqual(t, len(parts), 2)
				thisMemo = parts[0]
				require.NotEqual(t, thisMemo, lastMemo)

				// We expect the format of
				// onBudget-lndConnID-reqID.
				parts = strings.Split(thisMemo, "-")
				require.Len(t, parts, 3)
				require.Equal(t, parts[0], "onBudget")
				require.Len(t, parts[1], rules.LndConnIdLen)
			}
		}

		lastMemo = thisMemo
	}

	require.Len(t, batchResp.PendingChannels, 1)
	open := batchResp.PendingChannels[0]

	// We check that the memo prefix was removed from pending open channels.
	var pending *lnrpc.PendingChannelsResponse
	err = wait.NoError(func() error {
		pending, err = lndConn1.PendingChannels(
			ctx, &lnrpc.PendingChannelsRequest{}, caveatCreds,
		)
		require.NoError(t, err)

		if len(pending.PendingOpenChannels) != 1 {
			return fmt.Errorf("unexpected number of channels")
		}
		return nil
	}, lntest.DefaultTimeout)
	require.NoError(t, err)
	require.Equal(t, "mymemo", pending.PendingOpenChannels[0].Channel.Memo)

	assertChannelExistsAndClose(open.Txid, open.OutputIndex)

	// We try to open another channel, spending more than the budget allows.
	_, err = lndConn1.BatchOpenChannel(
		ctx, &lnrpc.BatchOpenChannelRequest{
			Channels: []*lnrpc.BatchOpenChannel{
				{
					NodePubkey:         charlie.PubKey[:],
					LocalFundingAmount: 4_000_001,
					MinHtlcMsat:        1_000,
				},
			},
		}, caveatCreds,
	)
	require.ErrorContains(t, err, "exceeds budget limit")

	// Now test a successful open that is within the budget.
	batchResp, err = lndConn1.BatchOpenChannel(
		ctx, &lnrpc.BatchOpenChannelRequest{
			Channels: []*lnrpc.BatchOpenChannel{
				{
					NodePubkey:         charlie.PubKey[:],
					LocalFundingAmount: 4_000_000,
					FeeRate:            30,
					MinHtlcMsat:        1_000,
				},
			},
		}, caveatCreds,
	)
	require.NoError(t, err)

	require.Len(t, batchResp.PendingChannels, 1)
	open = batchResp.PendingChannels[0]
	assertChannelExistsAndClose(open.Txid, open.OutputIndex)

	// Revoke the previous session.
	_, err = litClient.RevokeAutopilotSession(
		ctxm, &litrpc.RevokeAutopilotSessionRequest{
			LocalPublicKey: sessResp.Session.LocalPublicKey,
		},
	)
	require.NoError(t, err)

	// Link another session to the first one increasing the budget, which
	// effectively adds another 5 Msat to the budget.
	increasedBudget := &litrpc.RuleValue_OnChainBudget{
		OnChainBudget: &litrpc.OnChainBudget{
			AbsoluteAmtSats: 15_000_000,
			MaxSatPerVByte:  200,
		},
	}

	sessResp, err = litClient.AddAutopilotSession(
		ctxm, &litrpc.AddAutopilotSessionRequest{
			Label: "integration-test",
			ExpiryTimestampSeconds: uint64(
				time.Now().Add(5 * time.Minute).Unix(),
			),
			MailboxServerAddr: mailboxServerAddr,
			Features: map[string]*litrpc.FeatureConfig{
				"OpenChannels": {
					Rules: &litrpc.RulesMap{
						Rules: map[string]*litrpc.RuleValue{
							rules.OnChainBudgetName: {
								Value: increasedBudget,
							},
							rules.ChanConstraintName: {
								Value: pubChannelsOnly,
							},
							rules.ChanPolicyBoundsName: {
								Value: policyBounds,
							},
						},
					},
				},
			},
			PrivacyFlags:    flags.Serialize(),
			PrivacyFlagsSet: true,
			LinkedGroupId:   sessResp.Session.GroupId,
		},
	)
	require.NoError(t, err)

	lndConn2, metaDataInjector, cleanup2 := newAutopilotLndConn(
		ctx, t, net, sessResp.Session,
	)

	// The autopilot server is expected to add a MetaInfo caveat to any
	// request that it makes. So we add that now and specify that it is
	// initially making requests on behalf of the OpenChannels feature.
	caveatCreds = metaDataInjector.addCaveat(caveat)

	// We can't open a channel that is too big.
	_, err = lndConn2.BatchOpenChannel(
		ctx, &lnrpc.BatchOpenChannelRequest{
			Channels: []*lnrpc.BatchOpenChannel{
				{
					NodePubkey:         charlie.PubKey[:],
					LocalFundingAmount: 5_000_001,
					FeeRate:            30,
					MinHtlcMsat:        1_000,
				},
			},
		}, caveatCreds,
	)
	require.ErrorContains(t, err, "exceeds budget limit")

	// But we can open another 2.5 Msat channel.
	batchResp, err = lndConn2.BatchOpenChannel(
		ctx, &lnrpc.BatchOpenChannelRequest{
			Channels: []*lnrpc.BatchOpenChannel{
				{
					NodePubkey:         charlie.PubKey[:],
					LocalFundingAmount: 2_500_000,
					FeeRate:            30,
					MinHtlcMsat:        1_000,
				},
			},
		}, caveatCreds,
	)
	require.NoError(t, err)

	require.Len(t, batchResp.PendingChannels, 1)
	open = batchResp.PendingChannels[0]
	assertChannelExistsAndClose(open.Txid, open.OutputIndex)

	// Test that the ChannelOpenSync call also checks rules.
	_, err = lndConn2.OpenChannelSync(
		ctx, &lnrpc.OpenChannelRequest{
			NodePubkey:         charlie.PubKey[:],
			LocalFundingAmount: 2_500_001,
			FeeRate:            30,
			MinHtlcMsat:        10,
			Private:            true,
		}, caveatCreds,
	)
	require.ErrorContains(t, err, "private channels not allowed")
	require.ErrorContains(t, err, "invalid min htlc msat amount")
	require.ErrorContains(t, err, "exceeds budget limit")

	// Test that ChannelOpenSync can open a channel.
	openResp, err := lndConn2.OpenChannelSync(
		ctx, &lnrpc.OpenChannelRequest{
			NodePubkey:         charlie.PubKey[:],
			LocalFundingAmount: 1_250_000,
			FeeRate:            30,
			MinHtlcMsat:        1000,
		}, caveatCreds,
	)
	require.NoError(t, err)

	assertChannelExistsAndClose(
		openResp.GetFundingTxidBytes(), openResp.OutputIndex,
	)

	// We check that a restart of litd will change the channel memo prefix
	// which should be unique per litd run. We restart Alice and open a new
	// connection and test that a different memo prefix is used.
	require.NoError(t, cleanup2())

	err = ht.lndHarness.RestartNode(ht.lndHarness.Alice, nil, nil)
	require.NoError(t, err)

	lndConn2, metaDataInjector, cleanup2 = newAutopilotLndConn(
		ctx, t, net, sessResp.Session,
	)
	t.Cleanup(func() { require.NoError(t, cleanup2()) })

	caveatCreds = metaDataInjector.addCaveat(caveat)

	memoBefore := lastMemo
	openResp, err = lndConn2.OpenChannelSync(
		ctx, &lnrpc.OpenChannelRequest{
			NodePubkey:         charlie.PubKey[:],
			LocalFundingAmount: 1_250_000,
			FeeRate:            30,
			MinHtlcMsat:        1000,
		}, caveatCreds,
	)
	require.NoError(t, err)

	assertChannelExistsAndClose(
		openResp.GetFundingTxidBytes(), openResp.OutputIndex,
	)

	prefixBefore := strings.Split(memoBefore, "-")[1]
	prefixAfter := strings.Split(lastMemo, "-")[1]
	require.NotEqual(t, prefixBefore, prefixAfter)
}

// testRateLimitAndPrivacyMapper tests that an Autopilot session is forced to
// adhere to the rate limits applied to the features of a session. Along the
// way, the privacy mapper is also tested.
func testRateLimitAndPrivacyMapper(net *NetworkHarness, t *harnessTest) {
	ctx := context.Background()

	// Fetch the channel that Alice has so that we can get the channel
	// point.
	resp, err := net.Alice.ListChannels(ctx, &lnrpc.ListChannelsRequest{})
	require.NoError(t.t, err)
	require.Len(t.t, resp.Channels, 1)

	// We extract the txid of the channel so that we can use it later to
	// check that the autopilot's actions successfully completed and to
	// check that the txid that the autopilot server sees is not the same
	// as this one.
	realTxid := strings.Split(resp.Channels[0].ChannelPoint, ":")[0]

	// We create a connection to the Alice node's RPC server.
	cfg := net.Alice.Cfg
	rawConn, err := connectRPC(ctx, cfg.LitAddr(), cfg.LitTLSCertPath)
	require.NoError(t.t, err)
	defer rawConn.Close()

	macBytes, err := os.ReadFile(cfg.LitMacPath)
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

	net.autopilotServer.ResetDefaultFeatures()

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

	// We now connect to the mailbox from the PoV of the autopilot server.
	lndConn, metaDataInjector, cleanup := newAutopilotLndConn(
		ctx, t.t, net, sessResp.Session,
	)
	t.t.Cleanup(func() { require.NoError(t.t, cleanup()) })

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
	require.NotEqual(t.t, txid, realTxid)

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
	require.Equal(t.t, realTxid, txid2)
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

	// We now connect to the mailbox from the PoV of the autopilot server.
	lndConn, metaDataInjector, cleanup := newAutopilotLndConn(
		ctx, t.t, net, sessResp.Session,
	)
	t.t.Cleanup(func() { require.NoError(t.t, cleanup()) })

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

	// We now connect to the mailbox from the PoV of the autopilot server.
	lndConn, metaDataInjector, cleanup := newAutopilotLndConn(
		ctx, t.t, net, sessResp.Session,
	)
	t.t.Cleanup(func() { require.NoError(t.t, cleanup()) })

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
	defer closeChannelAndAssert(t, net, net.Alice, channelAB2Op, false)

	// Open two channels between Alice and Charlie.
	channelAC1Op := openChannelAndAssert(
		t, net, net.Alice, charlie, lntest.OpenChannelParams{
			Amt: 100000,
		},
	)
	defer closeChannelAndAssert(t, net, net.Alice, channelAC1Op, false)

	channelAC2Op := openChannelAndAssert(
		t, net, net.Alice, charlie, lntest.OpenChannelParams{
			Amt: 100000,
		},
	)
	defer closeChannelAndAssert(t, net, net.Alice, channelAC2Op, false)

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

	// We now connect to the mailbox from the PoV of the autopilot server.
	lndConn, metaDataInjector, cleanup := newAutopilotLndConn(
		ctx, t.t, net, sessResp.Session,
	)
	t.t.Cleanup(func() { require.NoError(t.t, cleanup()) })

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

	// We now connect to the mailbox from the PoV of the autopilot server.
	lndConn, metaDataInjector, cleanup := newAutopilotLndConn(
		ctx, t.t, net, sessResp.Session,
	)
	t.t.Cleanup(func() { require.NoError(t.t, cleanup()) })

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

// assertPrivacyFlags is a helper function that asserts that the privacy
// flags for the session are as expected.
func assertPrivacyFlags(net *NetworkHarness, t *harnessTest,
	sess *litrpc.Session, expectedFlags session.PrivacyFlags) {

	litdPub, err := btcec.ParsePubKey(sess.LocalPublicKey)
	require.NoError(t.t, err)

	flags, err := net.autopilotServer.GetPrivacyFlags(litdPub)
	require.NoError(t.t, err)

	require.True(t.t, flags.Equal(expectedFlags))
}

// assertPseudo is a helper that can be used to query a privacy map DB to get
// the pseudo value for a given real value.
func assertPseudo(ctxm context.Context, t *testing.T,
	litFWClient litrpc.FirewallClient, groupID []byte, input any,
	expError string) string {

	var in string

	switch inp := input.(type) {
	case string:
		in = inp
	case uint64:
		in = firewalldb.Uint64ToStr(inp)
	default:
		t.Fatalf("unhandled input type: %T", input)
	}

	privMapResp, err := litFWClient.PrivacyMapConversion(
		ctxm, &litrpc.PrivacyMapConversionRequest{
			GroupId:      groupID,
			RealToPseudo: true,
			Input:        in,
		},
	)
	if expError != "" {
		require.ErrorContains(t, err, expError)

		return ""
	}
	require.NoError(t, err)

	return privMapResp.Output
}

// newAutopilotLndConn creates a new connection to the mailbox server from the
// PoV of the autopilot server. It also returns a cleanup function that should
// be called when the test is done.
func newAutopilotLndConn(ctx context.Context, t *testing.T, net *NetworkHarness,
	session *litrpc.Session) (lnrpc.LightningClient, *metadataInjector,
	func() error) {

	// From the session creation response, we can extract Lit's local public
	// key.
	litdPub, err := btcec.ParsePubKey(session.LocalPublicKey)
	require.NoError(t, err)

	// We then query the autopilot server to extract the private key that
	// will be used for this session.
	pilotPriv, err := net.autopilotServer.GetPrivKey(litdPub)
	require.NoError(t, err)

	// Now we can connect to the mailbox from the PoV of the autopilot
	// server.
	pilotConn, metaDataInjector, err := connectMailboxWithRemoteKey(
		ctx, pilotPriv, litdPub,
	)
	require.NoError(t, err)

	lndConn := lnrpc.NewLightningClient(pilotConn)

	return lndConn, metaDataInjector, pilotConn.Close
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
