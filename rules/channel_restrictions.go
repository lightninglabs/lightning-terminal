package rules

import (
	"context"
	"fmt"
	"sync"

	"github.com/lightninglabs/lightning-terminal/firewalldb"
	"github.com/lightninglabs/lightning-terminal/litrpc"
	mid "github.com/lightninglabs/lightning-terminal/rpcmiddleware"
	"github.com/lightninglabs/lightning-terminal/session"
	"github.com/lightningnetwork/lnd/lnrpc"
	"google.golang.org/protobuf/proto"
)

var (
	// Compile-time checks to ensure that ChannelRestrict,
	// ChannelRestrictMgr and ChannelRestrictEnforcer implement the
	// appropriate Manager, Enforcer and Values interface.
	_ Manager  = (*ChannelRestrictMgr)(nil)
	_ Enforcer = (*ChannelRestrictEnforcer)(nil)
	_ Values   = (*ChannelRestrict)(nil)
)

// ChannelRestrictName is the string identifier of the ChannelRestrict rule.
const ChannelRestrictName = "channel-restriction"

// ChannelRestrictMgr manages the ChannelRestrict rule.
type ChannelRestrictMgr struct {
	// here we can have known chanID to ChanOutpoint map (and vice versa)
	// then in NewEnforcer, if chan comes in we dont know of, then we
	// refresh the maps.

	// chanIDToPoint is a map from channel ID to channel points for our
	// known set of channels.
	chanIDToPoint map[uint64]string

	// chanPointToID is a map from channel point to channel ID's for our
	// known set of channels.
	chanPointToID map[string]uint64

	// checkedIDs tracks channel IDs that we have already attempted to find
	// in LND's list of open channels but were not present.
	checkedIDs map[uint64]bool

	// mu is a mutex used to protect the maps and other state in the manager
	// from concurrent access.
	mu sync.Mutex
}

// NewChannelRestrictMgr constructs a new instance of a ChannelRestrictMgr.
func NewChannelRestrictMgr() *ChannelRestrictMgr {
	return &ChannelRestrictMgr{
		chanIDToPoint: make(map[uint64]string),
		chanPointToID: make(map[string]uint64),
		checkedIDs:    make(map[uint64]bool),
	}
}

// Stop cleans up the resources held by the manager.
//
// NOTE: This is part of the Manager interface.
func (c *ChannelRestrictMgr) Stop() error {
	return nil
}

// NewEnforcer constructs a new ChannelRestrict rule enforcer using the passed
// values and config.
//
// NOTE: This is part of the Manager interface.
func (c *ChannelRestrictMgr) NewEnforcer(ctx context.Context, cfg Config,
	values Values) (Enforcer, error) {

	channels, ok := values.(*ChannelRestrict)
	if !ok {
		return nil, fmt.Errorf("values must be of type "+
			"ChannelRestrict, got %T", values)
	}

	chanMap := make(map[uint64]bool, len(channels.DenyList))
	for _, chanID := range channels.DenyList {
		chanMap[chanID] = true
	}

	// We'll attempt to update our internal channel maps for any IDs in our
	// deny list that we don't already know about and haven't checked yet.
	err := c.maybeUpdateChannelMaps(ctx, cfg, channels.DenyList)
	if err != nil {
		return nil, err
	}

	return &ChannelRestrictEnforcer{
		mgr:             c,
		ChannelRestrict: channels,
		channelMap:      chanMap,
	}, nil
}

// NewValueFromProto converts the given proto value into a ChannelRestrict Value
// object.
//
// NOTE: This is part of the Manager interface.
func (c *ChannelRestrictMgr) NewValueFromProto(v *litrpc.RuleValue) (Values,
	error) {

	rv, ok := v.Value.(*litrpc.RuleValue_ChannelRestrict)
	if !ok {
		return nil, fmt.Errorf("incorrect RuleValue type")
	}

	chanIDs := rv.ChannelRestrict.ChannelIds

	if len(chanIDs) == 0 {
		return nil, fmt.Errorf("channel restrict list cannot be " +
			"empty. If no channel restrictions should be applied " +
			"then there is no need to add the rule")
	}

	return &ChannelRestrict{
		DenyList: chanIDs,
	}, nil
}

// EmptyValue returns a new ChannelRestrict instance.
//
// NOTE: This is part of the Manager interface.
func (c *ChannelRestrictMgr) EmptyValue() Values {
	return &ChannelRestrict{}
}

// maybeUpdateChannelMaps updates the ChannelRestrictMgrs set of known channels
// iff any of the channels given by the caller are not found in the current
// map set and have not been checked previously.
func (c *ChannelRestrictMgr) maybeUpdateChannelMaps(ctx context.Context,
	cfg Config, chanIDs []uint64) error {

	c.mu.Lock()
	defer c.mu.Unlock()

	var needsSync bool
	for _, id := range chanIDs {
		_, known := c.chanIDToPoint[id]
		if !known && !c.checkedIDs[id] {
			needsSync = true
			break
		}
	}

	// If we already know about all these channels or have checked them,
	// then we don't need to do anything.
	if !needsSync {
		return nil
	}

	// Fetch a list of our open channels from LND.
	lnd := cfg.GetLndClient()
	chans, err := lnd.ListChannels(ctx, false, false)
	if err != nil {
		return err
	}

	// Update our set of maps with all currently open channels.
	for _, channel := range chans {
		c.chanPointToID[channel.ChannelPoint] = channel.ChannelID
		c.chanIDToPoint[channel.ChannelID] = channel.ChannelPoint
	}

	// For every ID we were looking for, if it's still not in our known
	// maps, we mark it as checked so we don't trigger another sync for it.
	for _, id := range chanIDs {
		if _, ok := c.chanIDToPoint[id]; !ok {
			c.checkedIDs[id] = true
		}
	}

	return nil
}

// getChannelIDWithRetryCheck performs an atomic lookup of a channel point
// while also determining whether the caller should retry their request to allow
// for channel mapping resynchronization. When a channel point is not found in
// our known mappings, we must decide whether to allow the operation or request
// a retry. If any entries in the deny list remain unmapped to channel points,
// we cannot be certain whether the unknown channel is restricted, so we signal
// for a retry to trigger a fresh synchronization with the node's current
// channel state.
func (c *ChannelRestrictMgr) getChannelIDWithRetryCheck(point string,
	denyList []uint64) (id uint64, found bool, shouldRetry bool) {

	c.mu.Lock()
	defer c.mu.Unlock()

	// First, check if we know this channel point.
	id, found = c.chanPointToID[point]
	if found {
		return id, true, false
	}

	// Channel not found. Check if we have any unmapped deny list entries.
	// If we do, we can't be sure whether this unknown channel is
	// restricted or not, so we must trigger a retry to refresh our
	// mappings.
	for _, restrictedID := range denyList {
		if _, mapped := c.chanIDToPoint[restrictedID]; !mapped {
			// We have unmapped restrictions - clear the negative
			// cache to force a fresh sync on retry.
			c.checkedIDs = make(map[uint64]bool)
			return 0, false, true
		}
	}

	// Channel not found, but all deny list entries are mapped, so this
	// unknown channel is definitely not in our restriction list.
	return 0, false, false
}

// ChannelRestrictEnforcer enforces requests and responses against a
// ChannelRestrict rule.
type ChannelRestrictEnforcer struct {
	mgr *ChannelRestrictMgr
	*ChannelRestrict
	channelMap map[uint64]bool
}

// HandleRequest checks the validity of a request using the ChannelRestrict
// rpcmiddleware.RoundTripCheckers.
//
// NOTE: this is part of the Enforcer interface.
func (c *ChannelRestrictEnforcer) HandleRequest(ctx context.Context, uri string,
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

// HandleResponse handles a response using the ChannelRestrict
// rpcmiddleware.RoundTripCheckers.
//
// NOTE: this is part of the Enforcer interface.
func (c *ChannelRestrictEnforcer) HandleResponse(ctx context.Context,
	uri string, msg proto.Message) (proto.Message, error) {

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
// the ChannelRestrict rule.
//
// NOTE: this is part of the Enforcer interface.
func (c *ChannelRestrictEnforcer) HandleErrorResponse(_ context.Context,
	_ string, _ error) (error, error) {

	return nil, nil
}

// checkers returns a map of URI to rpcmiddleware.RoundTripChecker which define
// how the URI should be handled.
func (c *ChannelRestrictEnforcer) checkers() map[string]mid.RoundTripChecker {
	return map[string]mid.RoundTripChecker{
		"/lnrpc.Lightning/UpdateChannelPolicy": mid.NewRequestChecker(
			&lnrpc.PolicyUpdateRequest{},
			&lnrpc.PolicyUpdateResponse{},
			func(ctx context.Context,
				r *lnrpc.PolicyUpdateRequest) error {

				if r.GetGlobal() {
					return fmt.Errorf("cant apply call " +
						"to global scope when using " +
						"a channel restriction list")
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
				point := fmt.Sprintf(
					"%s:%d", txid.String(), index,
				)

				// Atomically check if we know this channel and
				// whether we need to retry.
				id, found, shouldRetry := c.mgr.
					getChannelIDWithRetryCheck(
						point, c.DenyList,
					)

				if shouldRetry {
					return fmt.Errorf("unknown channel " +
						"point, please retry the " +
						"request")
				}

				if !found {
					// Channel is unknown but all deny list
					// entries are mapped, so this channel
					// is definitely not restricted.
					return nil
				}

				if c.channelMap[id] {
					return fmt.Errorf("illegal action on " +
						"channel in channel " +
						"restriction list")
				}

				return nil
			},
		),
	}
}

// ChannelRestrict is a rule prevents calls from acting upon a given set of
// channels.
type ChannelRestrict struct {
	// DenyList is a list of SCIDs that should not be acted upon by
	// any call.
	DenyList []uint64 `json:"channel_deny_list"`
}

// VerifySane checks that the value of the values is ok given the min and max
// allowed values. This is a noop for the ChannelRestrict rule.
//
// NOTE: this is part of the Values interface.
func (c *ChannelRestrict) VerifySane(_, _ Values) error {
	return nil
}

// RuleName returns the name of the rule that these values are to be used with.
//
// NOTE: this is part of the Values interface.
func (c *ChannelRestrict) RuleName() string {
	return ChannelRestrictName
}

// ToProto converts the rule Values to the litrpc counterpart.
//
// NOTE: this is part of the Values interface.
func (c *ChannelRestrict) ToProto() *litrpc.RuleValue {
	return &litrpc.RuleValue{
		Value: &litrpc.RuleValue_ChannelRestrict{
			ChannelRestrict: &litrpc.ChannelRestrict{
				ChannelIds: c.DenyList,
			},
		},
	}
}

// PseudoToReal assumes that the deny-list contains pseudo channel IDs and uses
// these to check the privacy map db for the corresponding real channel IDs.
// It constructs a new ChannelRestrict instance with these real channel IDs.
//
// NOTE: this is part of the Values interface.
func (c *ChannelRestrict) PseudoToReal(ctx context.Context,
	db firewalldb.PrivacyMapDB, flags session.PrivacyFlags) (Values,
	error) {

	restrictList := make([]uint64, len(c.DenyList))

	// We don't obfuscate the channel IDs if the channel id flag is set.
	if flags.Contains(session.ClearChanIDs) {
		copy(restrictList, c.DenyList)

		return &ChannelRestrict{DenyList: restrictList}, nil
	}

	err := db.View(ctx, func(ctx context.Context,
		tx firewalldb.PrivacyMapTx) error {

		for i, chanID := range c.DenyList {
			real, err := firewalldb.RevealUint64(ctx, tx, chanID)
			if err != nil {
				return err
			}

			restrictList[i] = real
		}

		return nil
	})
	if err != nil {
		return nil, err
	}

	return &ChannelRestrict{DenyList: restrictList}, nil
}

// RealToPseudo converts all the real channel IDs into pseudo IDs. It returns a
// map of any new real to pseudo strings that should be persisted that it did
// not find in the given PrivacyMapReader.
//
// NOTE: this is part of the Values interface.
func (c *ChannelRestrict) RealToPseudo(_ context.Context,
	db firewalldb.PrivacyMapReader,
	flags session.PrivacyFlags) (Values, map[string]string, error) {

	pseudoIDs := make([]uint64, len(c.DenyList))
	privMapPairs := make(map[string]string)

	// We don't obfuscate the channel IDs if the channel id flag is set.
	if flags.Contains(session.ClearChanIDs) {
		copy(pseudoIDs, c.DenyList)

		return &ChannelRestrict{DenyList: pseudoIDs}, privMapPairs, nil
	}

	for i, c := range c.DenyList {
		// TODO(elle): check that this channel actually exists

		chanID := firewalldb.Uint64ToStr(c)
		pseudo, ok := pseudoFromReal(db, privMapPairs, chanID)
		if ok {
			p, err := firewalldb.StrToUint64(pseudo)
			if err != nil {
				return nil, nil, err
			}

			pseudoIDs[i] = p
			continue
		}

		pseudoCp, pseudoCpStr := firewalldb.NewPseudoUint64()
		privMapPairs[chanID] = pseudoCpStr
		pseudoIDs[i] = pseudoCp
	}

	return &ChannelRestrict{DenyList: pseudoIDs}, privMapPairs, nil
}
