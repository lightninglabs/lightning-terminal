package rules

import (
	"context"
	"encoding/hex"
	"fmt"
	"testing"

	"github.com/btcsuite/btcd/chaincfg/chainhash"
	"github.com/lightninglabs/lightning-terminal/firewalldb"
	"github.com/lightninglabs/lightning-terminal/session"
	"github.com/lightninglabs/lndclient"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/routing/route"
	"github.com/stretchr/testify/require"
)

// TestPeerRestrictCheckRequest ensures that the PeerRestrictEnforcer correctly
// accepts or denys a request.
func TestPeerRestrictCheckRequest(t *testing.T) {
	txid1, index1, err := newTXID()
	require.NoError(t, err)

	txid2, index2, err := newTXID()
	require.NoError(t, err)

	txid3, index3, err := newTXID()
	require.NoError(t, err)

	chanPointStr1 := fmt.Sprintf("%s:%d", hex.EncodeToString(txid1), index1)
	chanPointStr2 := fmt.Sprintf("%s:%d", hex.EncodeToString(txid2), index2)
	chanPointStr3 := fmt.Sprintf("%s:%d", hex.EncodeToString(txid3), index3)

	peerID1, err := firewalldb.NewPseudoStr(66)
	require.NoError(t, err)

	peerID2, err := firewalldb.NewPseudoStr(66)
	require.NoError(t, err)

	peerID3, err := firewalldb.NewPseudoStr(66)
	require.NoError(t, err)

	peerKey1, err := route.NewVertexFromStr(peerID1)
	require.NoError(t, err)

	peerKey2, err := route.NewVertexFromStr(peerID2)
	require.NoError(t, err)

	peerKey3, err := route.NewVertexFromStr(peerID3)
	require.NoError(t, err)

	ctx := context.Background()
	mgr := NewPeerRestrictMgr()
	cfg := &mockLndClient{
		channels: []lndclient.ChannelInfo{
			{
				ChannelPoint: chanPointStr1,
				PubKeyBytes:  peerKey1,
			},
			{
				ChannelPoint: chanPointStr2,
				PubKeyBytes:  peerKey2,
			},
			{
				ChannelPoint: chanPointStr3,
				PubKeyBytes:  peerKey3,
			},
		},
	}

	enf, err := mgr.NewEnforcer(cfg, &PeerRestrict{
		DenyList: []string{
			peerID1, peerID2,
		},
	})
	require.NoError(t, err)

	// A request for an irrelevant URI should be allowed.
	_, err = enf.HandleRequest(ctx, "random-URI", nil)
	require.NoError(t, err)

	// If there is a channel restriction list, then no global policy updates
	// are allowed.
	_, err = enf.HandleRequest(
		ctx, "/lnrpc.Lightning/UpdateChannelPolicy",
		&lnrpc.PolicyUpdateRequest{
			Scope: &lnrpc.PolicyUpdateRequest_Global{Global: true},
		},
	)
	require.ErrorContainsf(t, err, "cant apply call to global scope "+
		"when using a peer restriction list", "")

	// Test that an action on channel point 1 in the string form is
	// disallowed.
	chanPoint1 := &lnrpc.ChannelPoint{
		FundingTxid: &lnrpc.ChannelPoint_FundingTxidStr{
			FundingTxidStr: hex.EncodeToString(txid1),
		},
		OutputIndex: index1,
	}

	_, err = enf.HandleRequest(
		ctx, "/lnrpc.Lightning/UpdateChannelPolicy",
		&lnrpc.PolicyUpdateRequest{
			Scope: &lnrpc.PolicyUpdateRequest_ChanPoint{
				ChanPoint: chanPoint1,
			},
		},
	)
	require.ErrorContainsf(t, err, "illegal action on peer in peer "+
		"restriction list", "")

	// Test that an action on channel point 2 in the byte form is
	// disallowed.
	h, err := chainhash.NewHashFromStr(hex.EncodeToString(txid2))
	require.NoError(t, err)

	chanPoint2 := &lnrpc.ChannelPoint{
		FundingTxid: &lnrpc.ChannelPoint_FundingTxidBytes{
			FundingTxidBytes: h[:],
		},
		OutputIndex: index2,
	}

	_, err = enf.HandleRequest(
		ctx, "/lnrpc.Lightning/UpdateChannelPolicy",
		&lnrpc.PolicyUpdateRequest{
			Scope: &lnrpc.PolicyUpdateRequest_ChanPoint{
				ChanPoint: chanPoint2,
			},
		},
	)
	require.ErrorContainsf(t, err, "illegal action on peer in peer "+
		"restriction list", "")

	// Test that an action on a channel not in the deny-list is allowed.
	chanPoint3 := &lnrpc.ChannelPoint{
		FundingTxid: &lnrpc.ChannelPoint_FundingTxidStr{
			FundingTxidStr: hex.EncodeToString(txid3),
		},
		OutputIndex: index3,
	}

	_, err = enf.HandleRequest(
		ctx, "/lnrpc.Lightning/UpdateChannelPolicy",
		&lnrpc.PolicyUpdateRequest{
			Scope: &lnrpc.PolicyUpdateRequest_ChanPoint{
				ChanPoint: chanPoint3,
			},
		},
	)
	require.NoError(t, err)

	// Test that we can open a channel to a non-restricted peer.
	openReqNonRestricted := &lnrpc.OpenChannelRequest{
		NodePubkey: peerKey3[:],
	}
	_, err = enf.HandleRequest(
		ctx, "/lnrpc.Lightning/OpenChannelSync", openReqNonRestricted,
	)
	require.NoError(t, err)

	// Test that we deny channel opening for a restricted peer.
	openReqRestricted := &lnrpc.OpenChannelRequest{
		NodePubkey: peerKey1[:],
	}
	_, err = enf.HandleRequest(
		ctx, "/lnrpc.Lightning/OpenChannelSync", openReqRestricted,
	)
	require.ErrorContainsf(t, err, "illegal action on peer in peer ", "")

	// Test that we cannot perform a batched channel opening when a
	// restricted peer is present.
	batchOpenReq := &lnrpc.BatchOpenChannelRequest{
		Channels: []*lnrpc.BatchOpenChannel{
			{
				NodePubkey: peerKey1[:],
			},
			{
				NodePubkey: peerKey3[:],
			},
		},
	}
	_, err = enf.HandleRequest(
		ctx, "/lnrpc.Lightning/BatchOpenChannel", batchOpenReq,
	)
	require.ErrorContainsf(t, err, "illegal action on peer in peer ", "")

	// Test that we can batch open channels if all peers are unrestricted.
	batchOpenReq = &lnrpc.BatchOpenChannelRequest{
		Channels: []*lnrpc.BatchOpenChannel{
			{
				NodePubkey: peerKey3[:],
			},
		},
	}
	_, err = enf.HandleRequest(
		ctx, "/lnrpc.Lightning/BatchOpenChannel", batchOpenReq,
	)
	require.NoError(t, err)
}

// TestPeerRestrictionRealToPseudo tests that the PeerRestriction's RealToPseudo
// method correctly determines which real strings to generate pseudo pairs for
// based on the privacy map db passed to it.
func TestPeerRestrictRealToPseudo(t *testing.T) {
	tests := []struct {
		name           string
		privacyFlags   session.PrivacyFlags
		dbPreLoad      map[string]string
		expectNewPairs map[string]bool
	}{
		{
			// If there is no preloaded DB, then we expect all the
			// values in the deny list to be returned from the
			// RealToPseudo method.
			name: "no pre loaded db",
			expectNewPairs: map[string]bool{
				"peer 1": true,
				"peer 2": true,
				"peer 3": true,
			},
		},
		{
			// If the DB is preloaded with an entry for "peer 2"
			// then we don't expect that entry to be returned in the
			// set of new pairs.
			name: "partially pre-loaded DB",
			dbPreLoad: map[string]string{
				"peer 2": "obfuscated peer 2",
			},
			expectNewPairs: map[string]bool{
				"peer 1": true,
				"peer 3": true,
			},
		},
		{
			name: "turned off mapping",
			privacyFlags: []session.PrivacyFlag{
				session.ClearPubkeys,
			},
		},
	}

	// Construct the PeerRestrict deny list. Note that we repeat one of
	// the entries here in order to ensure that the RealToPseudo method is
	// forced to look up any real-to-pseudo pairs that it already
	// generated.
	pr := &PeerRestrict{
		DenyList: []string{
			"peer 1",
			"peer 2",
			"peer 2",
			"peer 3",
		},
	}

	for _, test := range tests {
		test := test
		t.Run(test.name, func(t *testing.T) {
			t.Parallel()

			privMapPairDB := firewalldb.NewPrivacyMapPairs(
				test.dbPreLoad,
			)

			// Add the pseudo values from the preloaded DB to the
			// expected deny list.
			expectedDenyList := make(map[string]bool)
			for _, p := range test.dbPreLoad {
				expectedDenyList[p] = true
			}

			// Call the RealToPseudo method on the PeerRestrict
			// rule. This will return the rule value in its pseudo
			// form along with any new privacy map pairs that should
			// be added to the DB.
			v, newPairs, err := pr.RealToPseudo(
				privMapPairDB, test.privacyFlags,
			)
			require.NoError(t, err)
			require.Len(t, newPairs, len(test.expectNewPairs))

			// We add each new pair to the expected deny list too.
			for r, p := range newPairs {
				require.True(t, test.expectNewPairs[r])

				expectedDenyList[p] = true
			}

			// We expect the original deny list if we switch off
			// privacy mapping.
			if test.privacyFlags.Contains(session.ClearPubkeys) {
				for _, p := range pr.DenyList {
					expectedDenyList[p] = true
				}
			}

			// Assert that the element in the resulting deny list
			// matches all the elements in our expected deny list.
			denyList, ok := v.(*PeerRestrict)
			require.True(t, ok)

			// Assert that the resulting deny list is the same
			// length as the un-obfuscated one.
			require.Len(t, denyList.DenyList, len(pr.DenyList))

			// Now iterate over the deny list and assert that each
			// value appears in our expected deny list.
			for _, peer := range denyList.DenyList {
				require.True(t, expectedDenyList[peer])
			}
		})
	}
}
