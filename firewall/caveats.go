package firewall

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/lightningnetwork/lnd/macaroons"
)

const (
	// RuleEnforcerCaveat is the name of the custom caveat that contains all
	// the rules that need to be enforced in the firewall.
	RuleEnforcerCaveat = "lit-mac-fw"

	// MetaInfoValuePrefix is the static prefix a macaroon caveat value has
	// to mark the beginning of the meta information JSON data.
	MetaInfoValuePrefix = "meta"

	// MetaRulesValuePrefix is the static prefix a macaroon caveat value has
	// to mark the beginning of the rules list JSON data.
	MetaRulesValuePrefix = "rules"
)

var (
	// MetaInfoFullCaveatPrefix is the full prefix a caveat needs to have to
	// be recognized as a meta information caveat.
	MetaInfoFullCaveatPrefix = fmt.Sprintf("%s %s %s",
		macaroons.CondLndCustom, RuleEnforcerCaveat,
		MetaInfoValuePrefix)

	// MetaRulesFullCaveatPrefix is the full prefix a caveat needs to have
	// to be recognized as a rules list caveat.
	MetaRulesFullCaveatPrefix = fmt.Sprintf("%s %s %s",
		macaroons.CondLndCustom, RuleEnforcerCaveat,
		MetaRulesValuePrefix)

	// ErrNoMetaInfoCaveat is the error that is returned if a caveat doesn't
	// have the prefix to be recognized as a meta information caveat.
	ErrNoMetaInfoCaveat = fmt.Errorf("not a meta info caveat")

	// ErrNoRulesCaveat is the error that is returned if a caveat doesn't
	// have the prefix to be recognized as a rules list caveat.
	ErrNoRulesCaveat = fmt.Errorf("not a rules list caveat")
)

// InterceptMetaInfo is the JSON serializable struct containing meta information
// about a request made by an automated node management software against LiT.
// The meta information is added as a macaroon caveat.
type InterceptMetaInfo struct {
	// ActorName is the name of the actor service (=management software)
	// that is issuing this request.
	ActorName string `json:"actor_name"`

	// Trigger is the action or condition that triggered this intercepted
	// request to be made.
	Trigger string `json:"trigger"`

	// Intent is the desired outcome or end condition this request aims to
	// arrive at.
	Intent string `json:"intent"`
}

// ToCaveat returns the full custom caveat string representation of the
// interception meta information in this format:
//     lnd-custom lit-mac-fw meta:<JSON_encoded_meta_information>
func (i *InterceptMetaInfo) ToCaveat() (string, error) {
	jsonBytes, err := json.Marshal(i)
	if err != nil {
		return "", fmt.Errorf("error JSON marshaling: %v", err)
	}

	return fmt.Sprintf("%s:%s", MetaInfoFullCaveatPrefix, jsonBytes), nil
}

// ParseMetaInfoCaveat tries to parse the given caveat string as a meta
// information struct.
func ParseMetaInfoCaveat(caveat string) (*InterceptMetaInfo, error) {
	if !strings.HasPrefix(caveat, MetaInfoFullCaveatPrefix) {
		return nil, ErrNoMetaInfoCaveat
	}

	// Only the prefix isn't enough.
	if len(caveat) <= len(MetaInfoFullCaveatPrefix)+1 {
		return nil, ErrNoMetaInfoCaveat
	}

	// There's a colon after the prefix that we need to skip as well.
	jsonData := caveat[len(MetaInfoFullCaveatPrefix)+1:]
	i := &InterceptMetaInfo{}

	if err := json.Unmarshal([]byte(jsonData), i); err != nil {
		return nil, fmt.Errorf("error unmarshaling JSON: %v", err)
	}

	return i, nil
}

// InterceptRule is the JSON serializable struct containing all the rules and
// their limits/settings that need to be enforced on a request made by an
// automated node management software against LiT. The rule information is added
// as a custom macaroon caveat.
type InterceptRule struct {
	// Name is the name of the rule. It must correspond to a
	Name string `json:"name"`

	// Restrictions is a key/value map of all the parameters that apply to
	// this rule.
	Restrictions map[string]string `json:"restrictions"`
}

// RulesToCaveat encodes a list of rules as a full custom caveat string
// representation in this format:
//     lnd-custom lit-mac-fw rules:[<array_of_JSON_encoded_rules>]
func RulesToCaveat(rules []*InterceptRule) (string, error) {
	jsonBytes, err := json.Marshal(rules)
	if err != nil {
		return "", fmt.Errorf("error JSON marshaling: %v", err)
	}

	return fmt.Sprintf("%s:%s", MetaRulesFullCaveatPrefix, jsonBytes), nil
}

// ParseRuleCaveat tries to parse the given caveat string as a rule struct.
func ParseRuleCaveat(caveat string) ([]*InterceptRule, error) {
	if !strings.HasPrefix(caveat, MetaRulesFullCaveatPrefix) {
		return nil, ErrNoRulesCaveat
	}

	// Only the prefix isn't enough.
	if len(caveat) <= len(MetaRulesFullCaveatPrefix)+1 {
		return nil, ErrNoRulesCaveat
	}

	// There's a colon after the prefix that we need to skip as well.
	jsonData := caveat[len(MetaRulesFullCaveatPrefix)+1:]
	var rules []*InterceptRule

	if err := json.Unmarshal([]byte(jsonData), &rules); err != nil {
		return nil, fmt.Errorf("error unmarshaling JSON: %v", err)
	}

	return rules, nil
}
