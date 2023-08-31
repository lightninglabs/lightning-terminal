package rules

import (
	"context"
	"fmt"
	"sync"

	"github.com/lightninglabs/lightning-terminal/firewalldb"
	"github.com/lightninglabs/lightning-terminal/litrpc"
	mid "github.com/lightninglabs/lightning-terminal/rpcmiddleware"
	"github.com/lightninglabs/lndclient"
	"github.com/lightningnetwork/lnd/lnrpc"
	"google.golang.org/protobuf/proto"
)

var (
	// Compile-time checks to ensure that PeerRestrictMgr,
	// PeerRestrict and PeerRestrictEnforcer implement the
	// appropriate Manager, Enforcer and Values interface.
	_ Manager  = (*PeerRestrictMgr)(nil)
	_ Enforcer = (*PeerRestrictEnforcer)(nil)
	_ Values   = (*PeerRestrict)(nil)
)

// PeersRestrictName is the string identifier of the PeerRestrict rule.
const PeersRestrictName = "peer-restriction"

// PeerRestrictMgr manages the PeerRestrict rule.
type PeerRestrictMgr struct {
	chanPointToPeerID map[string]string
	peerIDToChanPoint map[string]map[string]bool
	mu                sync.Mutex
}

// NewPeerRestrictMgr constructs a new PeerRestrictMgr.
func NewPeerRestrictMgr() *PeerRestrictMgr {
	return &PeerRestrictMgr{
		chanPointToPeerID: make(map[string]string),
		peerIDToChanPoint: make(map[string]map[string]bool),
	}
}

// Stop cleans up the resources held by the manager.
//
// NOTE: This is part of the Manager interface.
func (c *PeerRestrictMgr) Stop() error {
	return nil
}

// NewEnforcer constructs a new PeerRestrict rule enforcer using the passed
// values and config.
//
// NOTE: This is part of the Manager interface.
func (c *PeerRestrictMgr) NewEnforcer(cfg Config, values Values) (Enforcer,
	error) {

	peers, ok := values.(*PeerRestrict)
	if !ok {
		return nil, fmt.Errorf("values must be of type "+
			"PeerRestrict, got %T", values)
	}

	peerMap := make(map[string]bool, len(peers.DenyList))
	for _, peerID := range peers.DenyList {
		peerMap[peerID] = true
		if err := c.maybeUpdateMaps(cfg, peerID); err != nil {
			return nil, err
		}
	}

	return &PeerRestrictEnforcer{
		cfg:          cfg,
		mgr:          c,
		PeerRestrict: peers,
		peerMap:      peerMap,
	}, nil
}

// NewValueFromProto converts the given proto value into a PeerRestrict Value
// object.
//
// NOTE: This is part of the Manager interface.
func (c *PeerRestrictMgr) NewValueFromProto(v *litrpc.RuleValue) (Values,
	error) {

	rv, ok := v.Value.(*litrpc.RuleValue_PeerRestrict)
	if !ok {
		return nil, fmt.Errorf("incorrect RuleValue type")
	}

	peerIDs := rv.PeerRestrict.PeerIds

	if len(peerIDs) == 0 {
		return nil, fmt.Errorf("peer restrict list cannot be " +
			"empty. If no channel restrictions should be applied " +
			"then there is no need to add the rule")
	}

	return &PeerRestrict{
		DenyList: peerIDs,
	}, nil
}

// EmptyValue returns a new PeerRestrict instance.
//
// NOTE: This is part of the Manager interface.
func (c *PeerRestrictMgr) EmptyValue() Values {
	return &PeerRestrict{}
}

// maybeUpdateMaps updates the managers peer-to-channel and channel-to-peer maps
// if the given peer ID is unknown to the manager.
func (c *PeerRestrictMgr) maybeUpdateMaps(cfg peerRestrictCfg,
	id string) error {

	c.mu.Lock()
	defer c.mu.Unlock()

	if _, ok := c.peerIDToChanPoint[id]; ok {
		return nil
	}

	return c.updateMapsUnsafe(cfg)
}

// updateMapsUnsafe updates the manager's peer-to-channel and channel-to-peer
// maps. It is not thread safe and so must only be called if the manager's
// mutex is being held.
func (c *PeerRestrictMgr) updateMapsUnsafe(cfg peerRestrictCfg) error {
	lnd := cfg.GetLndClient()
	chans, err := lnd.ListChannels(context.Background(), false, false)
	if err != nil {
		return err
	}

	c.chanPointToPeerID = make(map[string]string)
	c.peerIDToChanPoint = make(map[string]map[string]bool)

	for _, channel := range chans {
		peerID := channel.PubKeyBytes.String()
		_, ok := c.peerIDToChanPoint[peerID]
		if !ok {
			c.peerIDToChanPoint[peerID] = make(map[string]bool)
		}

		c.peerIDToChanPoint[peerID][channel.ChannelPoint] = true
		c.chanPointToPeerID[channel.ChannelPoint] = peerID
	}

	return nil
}

func (c *PeerRestrictMgr) getPeerFromChanPoint(cfg peerRestrictCfg,
	cp string) (string, bool, error) {

	c.mu.Lock()
	defer c.mu.Unlock()

	peer, ok := c.chanPointToPeerID[cp]
	if ok {
		return peer, ok, nil
	}

	err := c.updateMapsUnsafe(cfg)
	if err != nil {
		return "", false, err
	}

	peer, ok = c.chanPointToPeerID[cp]
	return peer, ok, nil
}

// peerRestrictCfg is the config required by PeerRestrictMgr. It can be derived
// from the main rules Config struct.
type peerRestrictCfg interface {
	GetLndClient() lndclient.LightningClient
}

// PeerRestrictEnforcer  enforces requests and responses against a PeerRestrict
// rule.
type PeerRestrictEnforcer struct {
	mgr *PeerRestrictMgr
	cfg peerRestrictCfg
	*PeerRestrict

	peerMap map[string]bool
}

// HandleRequest checks the validity of a request using the PeerRestrict
// rpcmiddleware.RoundTripCheckers.
//
// NOTE: this is part of the Enforcer interface.
func (c *PeerRestrictEnforcer) HandleRequest(ctx context.Context, uri string,
	msg proto.Message) (proto.Message, error) {

	checkers := c.checkers()
	if checkers == nil {
		return nil, nil
	}

	checker, ok := checkers[uri]
	if !ok {
		return nil, nil
	}

	if !checker.HandlesRequest(msg.ProtoReflect().Type()) {
		return nil, fmt.Errorf("invalid implementation, checker for "+
			"URI %s does not accept request of type %v", uri,
			msg.ProtoReflect().Type())
	}

	return checker.HandleRequest(ctx, msg)
}

// HandleResponse handles a response using the PeerRestrict
// rpcmiddleware.RoundTripCheckers.
//
// NOTE: this is part of the Enforcer interface.
func (c *PeerRestrictEnforcer) HandleResponse(ctx context.Context, uri string,
	msg proto.Message) (proto.Message, error) {

	checkers := c.checkers()
	if checkers == nil {
		return nil, nil
	}

	checker, ok := checkers[uri]
	if !ok {
		return nil, nil
	}

	if !checker.HandlesResponse(msg.ProtoReflect().Type()) {
		return nil, fmt.Errorf("invalid implementation, checker for "+
			"URI %s does not accept response of type %v", uri,
			msg.ProtoReflect().Type())
	}

	return checker.HandleResponse(ctx, msg)
}

// HandleErrorResponse handles and possible alters an error. This is a noop for
// the PeerRestrict rule.
//
// NOTE: this is part of the Enforcer interface.
func (c *PeerRestrictEnforcer) HandleErrorResponse(_ context.Context,
	_ string, _ error) (error, error) {

	return nil, nil
}

// checkers returns a map of URI to rpcmiddleware.RoundTripChecker which define
// how the URI should be handled.
func (c *PeerRestrictEnforcer) checkers() map[string]mid.RoundTripChecker {
	return map[string]mid.RoundTripChecker{
		"/lnrpc.Lightning/UpdateChannelPolicy": mid.NewRequestChecker(
			&lnrpc.PolicyUpdateRequest{},
			&lnrpc.PolicyUpdateResponse{},
			func(ctx context.Context,
				r *lnrpc.PolicyUpdateRequest) error {

				if r.GetGlobal() {
					return fmt.Errorf("cant apply call " +
						"to global scope when using " +
						"a peer restriction list")
				}

				chanPoint := r.GetChanPoint()
				if chanPoint == nil {
					return fmt.Errorf("no channel point " +
						"specified")
				}

				txid, err := lnrpc.GetChanPointFundingTxid(
					chanPoint,
				)
				if err != nil {
					return err
				}

				index := chanPoint.GetOutputIndex()
				point := fmt.Sprintf("%s:%d", txid, index)

				peerID, ok, err := c.mgr.getPeerFromChanPoint(
					c.cfg, point,
				)
				if err != nil {
					return err
				} else if !ok {
					return nil
				}

				if c.peerMap[peerID] {
					return fmt.Errorf("illegal action on " +
						"peer in peer restriction " +
						"list")
				}

				return nil
			},
		),
	}
}

// PeerRestrict is a rule prevents calls from acting upon a given set of peers.
type PeerRestrict struct {
	// DenyList is a list of peer ids that should not be acted upon by any
	// call.
	DenyList []string `json:"peer_deny_list"`
}

// VerifySane checks that the value of the values is ok given the min and max
// allowed values. This is a noop for the PeerRestrict rule.
//
// NOTE: this is part of the Values interface.
func (c *PeerRestrict) VerifySane(_, _ Values) error {
	return nil
}

// RuleName returns the name of the rule that these values are to be used with.
//
// NOTE: this is part of the Values interface.
func (c *PeerRestrict) RuleName() string {
	return PeersRestrictName
}

// ToProto converts the rule Values to the litrpc counterpart.
//
// NOTE: this is part of the Values interface.
func (c *PeerRestrict) ToProto() *litrpc.RuleValue {
	return &litrpc.RuleValue{
		Value: &litrpc.RuleValue_PeerRestrict{
			PeerRestrict: &litrpc.PeerRestrict{
				PeerIds: c.DenyList,
			},
		},
	}
}

// PseudoToReal assumes that the deny-list contains pseudo peer IDs and uses
// these to check the privacy map db for the corresponding real peer IDs.
// It constructs a new PeerRestrict instance with these real peer IDs.
//
// NOTE: this is part of the Values interface.
func (c *PeerRestrict) PseudoToReal(db firewalldb.PrivacyMapDB) (Values,
	error) {

	restrictList := make([]string, len(c.DenyList))
	err := db.View(func(tx firewalldb.PrivacyMapTx) error {
		for i, chanID := range c.DenyList {
			real, err := firewalldb.RevealString(tx, chanID)
			if err != nil {
				return err
			}

			restrictList[i] = real
		}

		return nil
	},
	)
	if err != nil {
		return nil, err
	}

	return &PeerRestrict{
		DenyList: restrictList,
	}, nil
}

// RealToPseudo converts all the real peer IDs into pseudo IDs. It returns a map
// of any new real to pseudo strings that should be persisted that it did not
// find in the given PrivacyMapReader.
//
// NOTE: this is part of the Values interface.
func (c *PeerRestrict) RealToPseudo(db firewalldb.PrivacyMapReader) (Values,
	map[string]string, error) {

	pseudoIDs := make([]string, len(c.DenyList))
	privMapPairs := make(map[string]string)
	for i, id := range c.DenyList {
		// TODO(elle): check that this peer is actually one of our
		//  channel peers.

		pseudo, ok := pseudoFromReal(db, privMapPairs, id)
		if ok {
			pseudoIDs[i] = pseudo
			continue
		}

		pseudo, err := firewalldb.NewPseudoStr(len(id))
		if err != nil {
			return nil, nil, err
		}

		privMapPairs[id] = pseudo
		pseudoIDs[i] = pseudo
	}

	return &PeerRestrict{DenyList: pseudoIDs}, privMapPairs, nil
}

// pseudoFromReal is a helper that can be used to get the associated pseudo
// value for a given real value from either the privacy map db if it is defined
// or from a set of real-to-pseudo pairs.
func pseudoFromReal(db firewalldb.PrivacyMapReader,
	privMapPairs map[string]string, real string) (string, bool) {

	// First check the map.
	pseudo, ok := privMapPairs[real]
	if ok {
		return pseudo, true
	}

	// Then check the DB reader.
	return db.GetPseudo(real)
}
