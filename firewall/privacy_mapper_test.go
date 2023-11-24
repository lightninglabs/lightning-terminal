package firewall

import (
	"context"
	"encoding/json"
	"fmt"
	"testing"
	"time"

	"github.com/lightninglabs/lightning-terminal/firewalldb"
	"github.com/lightninglabs/lightning-terminal/session"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/rpcperms"
	"github.com/stretchr/testify/require"
	"google.golang.org/protobuf/proto"
	"gopkg.in/macaroon-bakery.v2/bakery"
	"gopkg.in/macaroon.v2"
)

// TestPrivacyMapper tests that the PrivacyMapper correctly intercepts specific
// RPC calls.
func TestPrivacyMapper(t *testing.T) {
	tests := []struct {
		name                string
		uri                 string
		msgType             rpcperms.InterceptType
		msg                 proto.Message
		expectedReplacement proto.Message
	}{
		{
			name:    "GetInfo Response",
			uri:     "/lnrpc.Lightning/GetInfo",
			msgType: rpcperms.TypeResponse,
			msg: &lnrpc.GetInfoResponse{
				Alias:          "Tinker Bell",
				IdentityPubkey: "Tinker Bell's pub key",
				Uris: []string{
					"Neverland 1",
					"Neverland 2",
				},
			},
			expectedReplacement: &lnrpc.GetInfoResponse{
				IdentityPubkey: "a44ef01c3bff970ef495c",
			},
		},
		{
			name:    "ForwardingHistory Response",
			uri:     "/lnrpc.Lightning/ForwardingHistory",
			msgType: rpcperms.TypeResponse,
			msg: &lnrpc.ForwardingHistoryResponse{
				ForwardingEvents: []*lnrpc.ForwardingEvent{
					{
						AmtIn:       2_000,
						AmtInMsat:   2_000_000,
						AmtOut:      1_000,
						AmtOutMsat:  1_000_000,
						Fee:         1_000,
						FeeMsat:     1_000_000,
						Timestamp:   1_000,
						TimestampNs: 1_000_000_000_000,
						ChanIdIn:    123,
						ChanIdOut:   321,
					},
					{
						AmtIn:       3_000,
						AmtInMsat:   3_000_000,
						AmtOut:      2_000,
						AmtOutMsat:  2_000_000,
						Fee:         1_000,
						FeeMsat:     1_000_000,
						Timestamp:   1_000,
						TimestampNs: 1_000_000_000_000,
						ChanIdIn:    678,
						ChanIdOut:   876,
					},
				},
			},
			expectedReplacement: &lnrpc.ForwardingHistoryResponse{
				ForwardingEvents: []*lnrpc.ForwardingEvent{
					{
						AmtIn:       1_900,
						AmtInMsat:   1_900_200,
						AmtOut:      950,
						AmtOutMsat:  950_100,
						Fee:         950,
						FeeMsat:     950_100,
						Timestamp:   400,
						TimestampNs: 400_000_000_100,
						ChanIdIn:    5178778334600911958,
						ChanIdOut:   3446430762436373227,
					},
					{
						AmtIn:       2_850,
						AmtInMsat:   2_850_200,
						AmtOut:      1_900,
						AmtOutMsat:  1_900_100,
						Fee:         950,
						FeeMsat:     950_100,
						Timestamp:   400,
						TimestampNs: 400_000_000_100,
						ChanIdIn:    8672172843977902018,
						ChanIdOut:   1378354177616075123,
					},
				},
			},
		},
		{
			name:    "FeeReport Response",
			uri:     "/lnrpc.Lightning/FeeReport",
			msgType: rpcperms.TypeResponse,
			msg: &lnrpc.FeeReportResponse{
				ChannelFees: []*lnrpc.ChannelFeeReport{
					{
						ChanId:       123,
						ChannelPoint: "abcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd:0",
					},
					{
						ChanId:       321,
						ChannelPoint: "abcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd:1",
					},
				},
			},
			expectedReplacement: &lnrpc.FeeReportResponse{
				ChannelFees: []*lnrpc.ChannelFeeReport{
					{
						ChanId:       5178778334600911958,
						ChannelPoint: "097ef666a61919ff3413b3b701eae3a5cbac08f70c0ca567806e1fa6acbfe384:2161781494",
					},
					{
						ChanId:       3446430762436373227,
						ChannelPoint: "45ec471bfccb0b7b9a8bc4008248931c59ad994903e07b54f54821ea3ef5cc5c:1642614131",
					},
				},
			},
		},
		{
			name:    "ListChannels Request",
			uri:     "/lnrpc.Lightning/ListChannels",
			msgType: rpcperms.TypeRequest,
			msg: &lnrpc.ListChannelsRequest{
				Peer: []byte{200, 19, 68, 149},
			},
			expectedReplacement: &lnrpc.ListChannelsRequest{
				Peer: []byte{1, 2, 3, 4},
			},
		},
		{
			name:    "ListChannels Response",
			uri:     "/lnrpc.Lightning/ListChannels",
			msgType: rpcperms.TypeResponse,
			msg: &lnrpc.ListChannelsResponse{
				Channels: []*lnrpc.Channel{
					{
						Capacity:              1_000_000,
						RemoteBalance:         600_000,
						LocalBalance:          499_000,
						CommitFee:             1_000,
						TotalSatoshisSent:     500_000,
						TotalSatoshisReceived: 450_000,
						RemotePubkey:          "01020304",
						Initiator:             false,
						ChanId:                123,
						ChannelPoint:          "abcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd:0",
						PendingHtlcs:          []*lnrpc.HTLC{{HashLock: []byte("aaaa")}, {HashLock: []byte("bbbb")}},
					},
				},
			},
			expectedReplacement: &lnrpc.ListChannelsResponse{
				Channels: []*lnrpc.Channel{
					{
						Capacity:              1_000_000,
						RemoteBalance:         525_850,
						LocalBalance:          474_150,
						CommitFee:             1_000,
						TotalSatoshisSent:     475_100,
						TotalSatoshisReceived: 427_600,
						RemotePubkey:          "c8134495",
						Initiator:             true,
						ChanId:                5178778334600911958,
						ChannelPoint:          "097ef666a61919ff3413b3b701eae3a5cbac08f70c0ca567806e1fa6acbfe384:2161781494",
						PendingHtlcs:          []*lnrpc.HTLC{{}, {}},
					},
				},
			},
		},
		{
			name:    "UpdateChannelPolicy Request txid string",
			uri:     "/lnrpc.Lightning/UpdateChannelPolicy",
			msgType: rpcperms.TypeRequest,
			msg: &lnrpc.PolicyUpdateRequest{
				Scope: &lnrpc.PolicyUpdateRequest_ChanPoint{
					ChanPoint: &lnrpc.ChannelPoint{
						FundingTxid: &lnrpc.ChannelPoint_FundingTxidStr{
							FundingTxidStr: "097ef666a61919ff3413b3b701eae3a5cbac08f70c0ca567806e1fa6acbfe384",
						},
						OutputIndex: 2161781494,
					},
				},
			},
			expectedReplacement: &lnrpc.PolicyUpdateRequest{
				Scope: &lnrpc.PolicyUpdateRequest_ChanPoint{
					ChanPoint: &lnrpc.ChannelPoint{
						FundingTxid: &lnrpc.ChannelPoint_FundingTxidStr{
							FundingTxidStr: "abcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd",
						},
						OutputIndex: 0,
					},
				},
			},
		},
		{
			name:    "UpdateChannelPolicy Request txid bytes",
			uri:     "/lnrpc.Lightning/UpdateChannelPolicy",
			msgType: rpcperms.TypeRequest,
			msg: &lnrpc.PolicyUpdateRequest{
				Scope: &lnrpc.PolicyUpdateRequest_ChanPoint{
					ChanPoint: &lnrpc.ChannelPoint{
						FundingTxid: &lnrpc.ChannelPoint_FundingTxidBytes{
							FundingTxidBytes: []byte{132, 227, 191, 172, 166, 31, 110, 128, 103, 165, 12, 12, 247, 8, 172, 203, 165, 227, 234, 1, 183, 179, 19, 52, 255, 25, 25, 166, 102, 246, 126, 9},
						},
						OutputIndex: 2161781494,
					},
				},
			},
			expectedReplacement: &lnrpc.PolicyUpdateRequest{
				Scope: &lnrpc.PolicyUpdateRequest_ChanPoint{
					ChanPoint: &lnrpc.ChannelPoint{
						FundingTxid: &lnrpc.ChannelPoint_FundingTxidStr{
							FundingTxidStr: "abcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd",
						},
						OutputIndex: 0,
					},
				},
			},
		},
		{
			name:    "UpdateChannelPolicy Response",
			uri:     "/lnrpc.Lightning/UpdateChannelPolicy",
			msgType: rpcperms.TypeResponse,
			msg: &lnrpc.PolicyUpdateResponse{
				FailedUpdates: []*lnrpc.FailedUpdate{
					{
						Outpoint: &lnrpc.OutPoint{
							TxidStr:     "abcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd",
							OutputIndex: 0,
						},
					},
				},
			},
			expectedReplacement: &lnrpc.PolicyUpdateResponse{
				FailedUpdates: []*lnrpc.FailedUpdate{
					{
						Outpoint: &lnrpc.OutPoint{
							TxidStr:     "097ef666a61919ff3413b3b701eae3a5cbac08f70c0ca567806e1fa6acbfe384",
							OutputIndex: 2161781494,
						},
					},
				},
			},
		},
	}

	decodedID := &lnrpc.MacaroonId{
		StorageId: []byte("123"),
	}
	b, err := proto.Marshal(decodedID)
	require.NoError(t, err)

	rawID := make([]byte, len(b)+1)
	rawID[0] = byte(bakery.LatestVersion)
	copy(rawID[1:], b)

	mac, err := macaroon.New(
		[]byte("123"), rawID, "", macaroon.V2,
	)
	require.NoError(t, err)

	macBytes, err := mac.MarshalBinary()
	require.NoError(t, err)

	sessionID, err := session.IDFromMacaroon(mac)
	require.NoError(t, err)

	mapPreloadRealToPseudo := map[string]string{
		"Tinker Bell's pub key": "a44ef01c3bff970ef495c",
		"000000000000007b":      "47deb774fc605c56",
		"0000000000000141":      "2fd42e84b9ffaaeb",
		"00000000000002a6":      "7859bf41241787c2",
		"000000000000036c":      "1320e5d25b7b5973",
		"abcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd:0": "097ef666a61919ff3413b3b701eae3a5cbac08f70c0ca567806e1fa6acbfe384:2161781494",
		"abcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd:1": "45ec471bfccb0b7b9a8bc4008248931c59ad994903e07b54f54821ea3ef5cc5c:1642614131",
		"01020304": "c8134495",
	}

	db := newMockDB(t, mapPreloadRealToPseudo, sessionID)

	err = db.AddSessionAndGroupIDPair(sessionID, sessionID)
	require.NoError(t, err)

	// randIntn is used for deterministic testing.
	randIntn := func(n int) (int, error) { return 100, nil }
	p := NewPrivacyMapper(db.NewSessionDB, randIntn, db)

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			rawMsg, err := proto.Marshal(test.msg)
			require.NoError(t, err)

			interceptReq := &rpcperms.InterceptionRequest{
				Type:            test.msgType,
				Macaroon:        mac,
				RawMacaroon:     macBytes,
				FullURI:         test.uri,
				ProtoSerialized: rawMsg,
				ProtoTypeName: string(
					proto.MessageName(test.msg),
				),
			}

			mwReq, err := interceptReq.ToRPC(1, 2)
			require.NoError(t, err)

			resp, err := p.Intercept(context.Background(), mwReq)
			require.NoError(t, err)

			feedback := resp.GetFeedback()
			if test.expectedReplacement == nil {
				require.False(t, feedback.ReplaceResponse)
				return
			}

			expectedRaw, err := proto.Marshal(
				test.expectedReplacement,
			)
			require.NoError(t, err)
			require.Equal(
				t, expectedRaw, feedback.ReplacementSerialized,
			)
		})
	}

	// Subtest to test behavior with real randomness.
	t.Run("Response with randomness", func(t *testing.T) {
		msg := &lnrpc.ForwardingHistoryResponse{
			ForwardingEvents: []*lnrpc.ForwardingEvent{
				{
					AmtIn:       2_000,
					AmtInMsat:   2_000_000,
					AmtOut:      1_000,
					AmtOutMsat:  1_000_000,
					Fee:         0,
					FeeMsat:     1,
					Timestamp:   1_000_000,
					TimestampNs: 1_000_000 * 1e9,
					ChanIdIn:    123,
					ChanIdOut:   321,
				},
			},
		}
		rawMsg, err := proto.Marshal(msg)
		require.NoError(t, err)

		p = NewPrivacyMapper(db.NewSessionDB, CryptoRandIntn, db)
		require.NoError(t, err)

		// We test the independent outgoing amount (incoming amount
		// would also be dependend on the fee variation).
		amtOutMsat := msg.ForwardingEvents[0].AmtOutMsat
		amtInterval := uint64(amountVariation * float64(amtOutMsat))
		minAmt := amtOutMsat - amtInterval
		maxAmt := amtOutMsat + amtInterval

		// We keep track of the timestamp. We test only the timestamp in
		// seconds as there can be numerical inaccuracies with the
		// nanosecond one.
		timestamp := msg.ForwardingEvents[0].Timestamp
		timestampInterval := uint64(timeVariation) / 1e9
		minTime := timestamp - timestampInterval
		maxTime := timestamp + timestampInterval

		// We need a certain number of samples to have statistical
		// accuracy.
		numSamples := 10_000

		// We require a five percent accuracy for 10_000 samples.
		relativeTestAccuracy := 0.05

		amounts := make([]uint64, numSamples)
		timestamps := make([]uint64, numSamples)

		for i := 0; i < numSamples; i++ {
			interceptReq := &rpcperms.InterceptionRequest{
				Type:            rpcperms.TypeResponse,
				Macaroon:        mac,
				RawMacaroon:     macBytes,
				FullURI:         "/lnrpc.Lightning/ForwardingHistory",
				ProtoSerialized: rawMsg,
				ProtoTypeName: string(
					proto.MessageName(msg),
				),
			}

			mwReq, err := interceptReq.ToRPC(1, 2)
			require.NoError(t, err)

			resp, err := p.Intercept(context.Background(), mwReq)
			require.NoError(t, err)

			feedback := resp.GetFeedback()

			fw := &lnrpc.ForwardingHistoryResponse{}
			err = proto.Unmarshal(
				feedback.ReplacementSerialized, fw,
			)
			require.NoError(t, err)

			amounts[i] = fw.ForwardingEvents[0].AmtOutMsat
			require.LessOrEqual(t, amounts[i], maxAmt)
			require.GreaterOrEqual(t, amounts[i], minAmt)

			timestamps[i] = fw.ForwardingEvents[0].Timestamp
			require.LessOrEqual(t, timestamps[i], maxTime)
			require.GreaterOrEqual(t, timestamps[i], minTime)
		}

		// The formula for the expected variance is taken from
		// https://en.wikipedia.org/wiki/Continuous_uniform_distribution
		expectedVar := func(min, max uint64) uint64 {
			return (max - min) * (max - min) / 12
		}

		// Test amounts for mean and variance.
		expectedAmtVariance := expectedVar(minAmt, maxAmt)
		require.InEpsilon(t, expectedAmtVariance, variance(amounts),
			relativeTestAccuracy)
		require.InEpsilon(t, amtOutMsat, mean(amounts),
			relativeTestAccuracy)

		// Test timestamps for mean and variance.
		expectedTimeVariance := expectedVar(minTime, maxTime)
		require.InEpsilon(t, expectedTimeVariance, variance(timestamps),
			relativeTestAccuracy)
		require.InEpsilon(t, timestamp, mean(timestamps),
			relativeTestAccuracy)
	})
}

type mockDB struct {
	privDB map[string]*mockPrivacyMapDB

	sessionIDIndex map[session.ID]session.ID
	groupIDIndex   map[session.ID][]session.ID
}

func newMockDB(t *testing.T, preloadRealToPseudo map[string]string,
	sessID session.ID) mockDB {

	db := mockDB{
		privDB:         make(map[string]*mockPrivacyMapDB),
		sessionIDIndex: make(map[session.ID]session.ID),
		groupIDIndex:   make(map[session.ID][]session.ID),
	}
	sessDB := db.NewSessionDB(sessID)

	_ = sessDB.Update(func(tx firewalldb.PrivacyMapTx) error {
		for r, p := range preloadRealToPseudo {
			require.NoError(t, tx.NewPair(r, p))
		}
		return nil
	})

	return db
}

func (m mockDB) NewSessionDB(sessionID session.ID) firewalldb.PrivacyMapDB {
	db, ok := m.privDB[string(sessionID[:])]
	if ok {
		return db
	}

	newDB := newMockPrivacyMapDB()
	m.privDB[string(sessionID[:])] = newDB

	return newDB
}

func (m mockDB) AddSessionAndGroupIDPair(sessionID, groupID session.ID) error {
	m.sessionIDIndex[sessionID] = groupID
	m.groupIDIndex[groupID] = append(m.groupIDIndex[groupID], sessionID)
	return nil
}

func (m mockDB) GetGroupID(sessionID session.ID) (session.ID, error) {
	groupID, ok := m.sessionIDIndex[sessionID]
	if !ok {
		return session.ID{}, fmt.Errorf("group ID not found")
	}

	return groupID, nil
}

func (m mockDB) GetSessionIDs(groupID session.ID) ([]session.ID, error) {
	sessionIDs, ok := m.groupIDIndex[groupID]
	if !ok {
		return nil, fmt.Errorf("group ID not found")
	}

	return sessionIDs, nil
}

func newMockPrivacyMapDB() *mockPrivacyMapDB {
	return &mockPrivacyMapDB{
		r2p: make(map[string]string),
		p2r: make(map[string]string),
	}
}

type mockPrivacyMapDB struct {
	r2p map[string]string
	p2r map[string]string
}

func (m *mockPrivacyMapDB) Update(
	f func(tx firewalldb.PrivacyMapTx) error) error {

	return f(m)
}

func (m *mockPrivacyMapDB) View(
	f func(tx firewalldb.PrivacyMapTx) error) error {

	return f(m)
}

func (m *mockPrivacyMapDB) NewPair(real, pseudo string) error {
	m.r2p[real] = pseudo
	m.p2r[pseudo] = real
	return nil
}

func (m *mockPrivacyMapDB) PseudoToReal(pseudo string) (string, error) {
	r, ok := m.p2r[pseudo]
	if !ok {
		return "", firewalldb.ErrNoSuchKeyFound
	}

	return r, nil
}

func (m *mockPrivacyMapDB) RealToPseudo(real string) (string, error) {
	p, ok := m.r2p[real]
	if !ok {
		return "", firewalldb.ErrNoSuchKeyFound
	}

	return p, nil
}

func (m *mockPrivacyMapDB) FetchAllPairs() (*firewalldb.PrivacyMapPairs,
	error) {

	return firewalldb.NewPrivacyMapPairs(m.r2p), nil
}

var _ firewalldb.PrivacyMapDB = (*mockPrivacyMapDB)(nil)

// TestRandBetween tests random number generation for numbers in an interval.
func TestRandBetween(t *testing.T) {
	min := 0
	max := 10

	for i := 0; i < 100; i++ {
		val, err := randBetween(CryptoRandIntn, min, max)
		require.NoError(t, err)
		require.Less(t, val, max)
		require.GreaterOrEqual(t, val, min)
	}
}

// TestHideAmount tests that we hide amounts correctly.
func TestHideAmount(t *testing.T) {
	testAmount := uint64(10_000)
	relativeVariation := 0.05
	absoluteVariation := int(float64(testAmount) * relativeVariation)
	lowerBound := testAmount - uint64(absoluteVariation)
	upperBound := testAmount + uint64(absoluteVariation)

	tests := []struct {
		name      string
		amount    uint64
		randIntFn func(int) (int, error)
		expected  uint64
	}{
		{
			name:      "zero test amount",
			randIntFn: func(int) (int, error) { return 0, nil },
		},
		{
			name:      "test small amount",
			randIntFn: func(int) (int, error) { return 0, nil },
			amount:    1,
			expected:  1,
		},
		{
			name:      "min value",
			randIntFn: func(int) (int, error) { return 0, nil },
			amount:    testAmount,
			expected:  lowerBound,
		},
		{
			name: "max value",
			randIntFn: func(int) (int, error) {
				return int(upperBound - lowerBound), nil
			},
			amount:   testAmount,
			expected: upperBound,
		},
		{
			name:      "some fuzz",
			randIntFn: func(int) (int, error) { return 123, nil },
			amount:    testAmount,
			expected:  lowerBound + 123,
		},
	}

	for _, test := range tests {
		test := test

		t.Run(test.name, func(t *testing.T) {
			val, err := hideAmount(
				test.randIntFn,
				relativeVariation,
				test.amount,
			)
			require.NoError(t, err)
			require.Equal(t, test.expected, val)
		})
	}

	// Subtest with real randomness.
	t.Run("real randomness for small numbers", func(t *testing.T) {
		for i := 0; i < 1000; i++ {
			_, err := hideAmount(
				CryptoRandIntn,
				relativeVariation,
				uint64(i),
			)
			require.NoError(t, err)
		}
	})
}

// TestHideTimestamp test correct timestamp hiding.
func TestHideTimestamp(t *testing.T) {
	timestamp := time.Unix(1_000_000, 0)
	absoluteVariation := time.Duration(10) * time.Minute
	lowerBound := timestamp.Add(-absoluteVariation)
	upperBound := timestamp.Add(absoluteVariation)

	tests := []struct {
		name      string
		randIntFn func(int) (int, error)
		timestamp time.Time
		expected  time.Time
	}{
		{
			name:      "zero timestamp",
			randIntFn: func(int) (int, error) { return 0, nil },
		},
		{
			name:      "min value",
			randIntFn: func(int) (int, error) { return 0, nil },
			timestamp: timestamp,
			expected:  lowerBound,
		},
		{
			name: "max value",
			randIntFn: func(int) (int, error) {
				return int(upperBound.Sub(lowerBound)), nil
			},
			timestamp: timestamp,
			expected:  upperBound,
		},
		{
			name:      "some fuzz",
			randIntFn: func(int) (int, error) { return 123, nil },
			timestamp: timestamp,
			expected:  lowerBound.Add(time.Duration(123)),
		},
	}

	for _, test := range tests {
		test := test

		t.Run(test.name, func(t *testing.T) {
			val, err := hideTimestamp(
				test.randIntFn,
				absoluteVariation,
				test.timestamp,
			)
			require.NoError(t, err)
			require.Equal(t, test.expected, val)
		})
	}
}

// TestHideBool test correct boolean hiding.
func TestHideBool(t *testing.T) {
	val, err := hideBool(func(int) (int, error) { return 100, nil })
	require.NoError(t, err)
	require.True(t, val)

	val, err = hideBool(func(int) (int, error) { return 1, nil })
	require.NoError(t, err)
	require.True(t, val)

	val, err = hideBool(func(int) (int, error) { return 0, nil })
	require.NoError(t, err)
	require.False(t, val)
}

// TestObfuscateConfig tests that we substitute substrings in the config
// correctly.
func TestObfuscateConfig(t *testing.T) {
	tests := []struct {
		name             string
		config           []byte
		knownMap         map[string]string
		expectedNewPairs int
		expectErr        bool
		notExpectSameLen bool
	}{
		{
			name: "empty",
		},
		{
			// We substitute pubkeys of different forms.
			name: "several pubkeys",
			config: []byte(`{"version":1,"list":` +
				`["d23da57575cdcb878ac191e1e0c8a5c4f061b11cfdc7a8ec5c9d495270de66fdbf",` +
				`"0e092708c9e737115ff14a85b65466561280d77c1b8cd666bc655536ad81ccca85",` +
				`"DEAD2708c9e737115ff14a85b65466561280d77c1b8cd666bc655536ad81ccca85",` +
				`"586b59212da4623c40dcc68c4573da1719e5893630790c9f2db8940fff3efd8cd4"]}`),
			expectedNewPairs: 4,
		},
		{
			// We don't generate new pairs for pubkeys that we
			// already have a mapping.
			name: "several pubkeys with known replacement or duplicates",
			config: []byte(`{"version":1,"list":` +
				`["d23da57575cdcb878ac191e1e0c8a5c4f061b11cfdc7a8ec5c9d495270de66fdbf",` +
				`"0e092708c9e737115ff14a85b65466561280d77c1b8cd666bc655536ad81ccca85",` +
				`"DEAD2708c9e737115ff14a85b65466561280d77c1b8cd666bc655536ad81ccca85",` +
				`"0e092708c9e737115ff14a85b65466561280d77c1b8cd666bc655536ad81ccca85",` +
				`"586b59212da4623c40dcc68c4573da1719e5893630790c9f2db8940fff3efd8cd4"]}`),
			knownMap: map[string]string{
				"586b59212da4623c40dcc68c4573da1719e5893630790c9f2db8940fff3efd8cd4": "123456789012345678901234567890123456789012345678901234567890123456",
			},
			expectedNewPairs: 3,
		},
		{
			// We don't substitute unknown items.
			name: "all invalid pubkeys",
			config: []byte(`{"version":1,"list":` +
				`["d23da57575cdcb878ac191e1e0c8a5c4f061b11",` +
				`"586b59212da4623c40dcc68c4573da1719e5893630790c9f2db8940fff3efd8cd4dead",` +
				`"x86b59212da4623c40dcc68c4573da1719e5893630790c9f2db8940fff3efd8cd4"]}`),
			expectedNewPairs: 0,
		},
		{
			// We only substitute channel ids that have a sane
			// format.
			name: "channel ids",
			config: []byte(`{"version":1,"list":` +
				`["1",` +
				`"12345",` +
				`"1234567890123",` +
				`"1234567890123456789",` +
				`"123456789012345678901"]}`),
			expectedNewPairs: 2,
		},
		{
			// We obfuscate channel points, the character length may
			// vary due to the output index.
			name: "channel points",
			config: []byte(`{"version":1,"list":` +
				`["0e092708c9e737115ff14a85b65466561280d77c1b8cd666bc655536ad81ccca:1",` +
				`"e092708c9e737115ff14a85b65466561280d77c1b8cd666bc655536ad81ccca:1",` +
				`"0e092708c9e737115ff14a85b65466561280d77c1b8cd666bc655536ad81ccca3:1",` +
				`"0e092708c9e737115ff14a85b65466561280d77c1b8cd666bc655536ad81ccca:3000"]}`),
			expectedNewPairs: 2,
			notExpectSameLen: true,
		},
		{
			// We only act on items that are in lists of strings.
			name: "single pubkey with another field",
			config: []byte(`{"version":1,"list":` +
				`["586b59212da4623c40dcc68c4573da1719e5893630790c9f2db8940fff3efd8cd4"],` +
				`"another":"0e092708c9e737115ff14a85b65466561280d77c1b8cd666bc655536ad81ccca85"}`),
			expectedNewPairs: 1,
		},
		{
			// We don't obfuscate any numbers even though they may
			// be channel ids. This is to be able to set numerical
			// values in the range of channel ids.
			name:             "number",
			config:           []byte(`{"version":1,"number":12345678901234567890}`),
			expectedNewPairs: 0,
		},
		{
			// We don't allow to mix strings with other types, which
			// may be a configuration mistake.
			name: "list of invalid types",
			config: []byte(`{"version":1,"channels":` +
				`[12345,` +
				`"e092708c9e737115ff14a85ab65466561280d77c1b8cd666bc655536ad81ccca:1"]}`),
			expectErr:        true,
			expectedNewPairs: 0,
		},
		{
			// A list of numbers is not obfuscated. Those can be
			// useful to submit histograms for example.
			name: "channel ids",
			config: []byte(`{"version":1,"list":` +
				`[1,` +
				`12345,` +
				`1234567890123,` +
				`1234567890123456789,` +
				`123456789012345678901]}`),
			expectedNewPairs: 0,
		},
	}

	// assertConfigStructure checks that the structure of the config is
	// preserved.
	assertConfigStructure := func(wantConfig, gotConfig []byte) {
		t.Helper()

		if len(wantConfig) == 0 {
			require.Equal(t, wantConfig, gotConfig)

			return
		}

		var wantConfigMap map[string]any
		err := json.Unmarshal(wantConfig, &wantConfigMap)
		require.NoError(t, err)

		var gotConfigMap map[string]any
		err = json.Unmarshal(gotConfig, &gotConfigMap)
		require.NoError(t, err)

		// We test that the number of top level items is the same.
		require.Equal(t, len(wantConfigMap), len(gotConfigMap))

		listLen := func(config map[string]any) int {
			for k, v := range config {
				if k == "list" {
					list, ok := v.([]interface{})
					require.True(t, ok)
					return len(list)
				}
			}
			return 0
		}

		// We test that we have the same number of items in the list.
		require.Equal(t, listLen(wantConfigMap), listLen(gotConfigMap))
	}

	for _, tt := range tests {
		tt := tt

		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			db := firewalldb.NewPrivacyMapPairs(tt.knownMap)

			config, privMapPairs, err := ObfuscateConfig(
				db, tt.config,
			)
			if tt.expectErr {
				require.Error(t, err)
				return
			}
			require.NoError(t, err)

			// We expect the config to be obfuscated in any parts
			// only if there is sensitive data.
			if tt.expectedNewPairs > 0 {
				require.NotEqual(t, config, tt.config)
			}

			// We check that we recognized the correct number of new
			// substitutions.
			require.Equal(t, tt.expectedNewPairs,
				len(privMapPairs))

			// We expect the same number of items in the config
			// after obfuscation.
			assertConfigStructure(tt.config, config)

			// We don't perform exact length checks for cases where
			// we know the length can change.
			if !tt.notExpectSameLen {
				require.Equal(t, len(tt.config), len(config))
			}
		})
	}
}

// mean computes the mean of the given slice of numbers.
func mean(numbers []uint64) uint64 {
	sum := uint64(0)

	for _, n := range numbers {
		sum += n
	}

	return sum / uint64(len(numbers))
}

// variance computes the variance of the given slice of numbers.
func variance(numbers []uint64) uint64 {
	mean := mean(numbers)
	sum := 0.0

	// We divide in each step to have smaller numbers.
	norm := float64(len(numbers) - 1)

	for _, n := range numbers {
		sum += float64((n-mean)*(n-mean)) / norm
	}

	return uint64(sum)
}
