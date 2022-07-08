package firewall

import (
	"context"
	"testing"

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
						AmtIn:     100,
						ChanIdIn:  123,
						ChanIdOut: 321,
					},
					{
						Fee:       200,
						ChanIdIn:  678,
						ChanIdOut: 876,
					},
				},
			},
			expectedReplacement: &lnrpc.ForwardingHistoryResponse{
				ForwardingEvents: []*lnrpc.ForwardingEvent{
					{
						AmtIn:     100,
						ChanIdIn:  5178778334600911958,
						ChanIdOut: 3446430762436373227,
					},
					{
						Fee:       200,
						ChanIdIn:  8672172843977902018,
						ChanIdOut: 1378354177616075123,
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
						ChannelPoint: "45ec471bfccb0b7b9a8bc4008248931c59ad994903e07b54f54821ea3ef5cc5c62:1642614131",
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
						RemotePubkey: "01020304",
						ChanId:       123,
						ChannelPoint: "abcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd:0",
					},
				},
			},
			expectedReplacement: &lnrpc.ListChannelsResponse{
				Channels: []*lnrpc.Channel{
					{
						RemotePubkey: "c8134495",
						ChanId:       5178778334600911958,
						ChannelPoint: "097ef666a61919ff3413b3b701eae3a5cbac08f70c0ca567806e1fa6acbfe384:2161781494",
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
		"abcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd:1": "45ec471bfccb0b7b9a8bc4008248931c59ad994903e07b54f54821ea3ef5cc5c62:1642614131",
		"01020304": "c8134495",
	}

	db := newMockDB(t, mapPreloadRealToPseudo, sessionID)
	p := NewPrivacyMapper(db.NewSessionDB)

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
}

type mockDB map[string]*mockPrivacyMapDB

func newMockDB(t *testing.T, preloadRealToPseudo map[string]string,
	sessID session.ID) mockDB {

	db := make(mockDB)
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
	db, ok := m[string(sessionID[:])]
	if ok {
		return db
	}

	newDB := newMockPrivacyMapDB()
	m[string(sessionID[:])] = newDB

	return newDB
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

var _ firewalldb.PrivacyMapDB = (*mockPrivacyMapDB)(nil)
