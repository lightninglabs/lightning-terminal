package rules

import (
	"encoding/json"
	"fmt"

	"github.com/lightninglabs/lightning-terminal/litrpc"
)

// ErrUnknownRule indicates that LiT is unaware of a values name.
var ErrUnknownRule = fmt.Errorf("unknown rule")

// LndConnIdLen is the length of the random connection ID used to create
// unique request identifiers.
const LndConnIdLen = 16

// ManagerSet is a map from a rule name to a rule Manager.
type ManagerSet map[string]Manager

// NewRuleManagerSet creates a new map of the supported rule ManagerSet.
func NewRuleManagerSet() ManagerSet {
	return map[string]Manager{
		RateLimitName:        &RateLimitMgr{},
		ChanPolicyBoundsName: &ChanPolicyBoundsMgr{},
		HistoryLimitName:     &HistoryLimitMgr{},
		ChannelRestrictName:  NewChannelRestrictMgr(),
		PeersRestrictName:    NewPeerRestrictMgr(),
	}
}

// InitEnforcer gets the appropriate rule Manager for the given name and uses it
// to create an appropriate rule Enforcer.
func (m ManagerSet) InitEnforcer(cfg Config, name string,
	values Values) (Enforcer, error) {

	mgr, ok := m[name]
	if !ok {
		return nil, fmt.Errorf("%w %s, please upgrade", ErrUnknownRule,
			name)
	}

	return mgr.NewEnforcer(cfg, values)
}

// GetAllRules returns a map of names of all the rules supported by rule
// ManagerSet.
func (m ManagerSet) GetAllRules() map[string]bool {
	rules := make(map[string]bool, len(m))
	for name := range m {
		rules[name] = true
	}
	return rules
}

// UnmarshalRuleValues identifies the appropriate rule Manager based on the
// given rule name and uses that to parse the proto value into a Value object.
func (m ManagerSet) UnmarshalRuleValues(name string, proto *litrpc.RuleValue) (
	Values, error) {

	mgr, ok := m[name]
	if !ok {
		return nil, fmt.Errorf("%w %s, please upgrade", ErrUnknownRule,
			name)
	}

	return mgr.NewValueFromProto(proto)
}

// InitRuleValues can be used to construct a Values object given raw rule
// value bytes along with the name of the appropriate rule.
func (m ManagerSet) InitRuleValues(name string, valueBytes []byte) (Values,
	error) {

	mgr, ok := m[name]
	if !ok {
		return nil, fmt.Errorf("%w %s, please upgrade", ErrUnknownRule,
			name)
	}

	v := mgr.EmptyValue()
	if err := json.Unmarshal(valueBytes, v); err != nil {
		return nil, err
	}

	return v, nil
}

// Stop stops all the managers in the set.
func (m ManagerSet) Stop() error {
	var returnErr error
	for _, mgr := range m {
		err := mgr.Stop()
		if err != nil {
			returnErr = err
		}
	}

	return returnErr
}
