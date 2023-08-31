package rules

import (
	"context"
	"encoding/json"

	"github.com/lightninglabs/lightning-terminal/firewalldb"
	"github.com/lightninglabs/lightning-terminal/litrpc"
	"google.golang.org/protobuf/proto"
)

// Manager is the interface that any firewall rule managers will need to
// implement. A rule Manager is used to construct a rule Enforcer or rule
// Values.
type Manager interface {
	// NewEnforcer constructs a new rule enforcer using the passed values
	// and config.
	NewEnforcer(cfg Config, values Values) (Enforcer, error)

	// NewValueFromProto converts the given proto value into a Value object.
	NewValueFromProto(p *litrpc.RuleValue) (Values, error)

	// EmptyValue returns a new Values instance of the type that this
	// Manager handles.
	EmptyValue() Values

	// Stop cleans up the resources held by the manager.
	Stop() error
}

// Enforcer is the interface that any firewall rule enforcer must implement.
// An enforcer accepts, rejects, and possible alters an RPC proto message for a
// specific URI.
type Enforcer interface {
	// HandleRequest checks the validity of a request and possibly edits it.
	HandleRequest(ctx context.Context, uri string,
		protoMsg proto.Message) (proto.Message, error)

	// HandleResponse handles and possibly alters a response.
	HandleResponse(ctx context.Context, uri string,
		protoMsg proto.Message) (proto.Message, error)

	// HandleErrorResponse handles and possibly alters a response error.
	HandleErrorResponse(ctx context.Context, uri string, err error) (error,
		error)
}

// Values represents the static values that encompass the settings of the rule.
type Values interface {
	// RuleName returns the name of the rule that these values are to be
	// used with.
	RuleName() string

	// VerifySane checks that the rules values are valid given the allowed
	// minimum and maximum values.
	VerifySane(minVal, maxVal Values) error

	// ToProto converts the rule Values to the litrpc counterpart.
	ToProto() *litrpc.RuleValue

	// RealToPseudo converts the rule Values to a new one that uses pseudo
	// keys, channel IDs, channel points etc. It returns a map of any new
	// real to pseudo strings that should be persisted that it did not find
	// in the given PrivacyMapReader.
	RealToPseudo(db firewalldb.PrivacyMapReader) (Values, map[string]string,
		error)

	// PseudoToReal attempts to convert any appropriate pseudo fields in
	// the rule Values to their corresponding real values. It uses the
	// passed PrivacyMapDB to find the real values.
	PseudoToReal(db firewalldb.PrivacyMapDB) (Values, error)
}

// Marshal converts the rule Values to a json byte slice.
func Marshal(v Values) ([]byte, error) {
	return json.Marshal(v)
}
