package firewalldb

import (
	"context"
	"time"

	"github.com/lightninglabs/lightning-terminal/session"
)

// ActionState represents the state of an action.
type ActionState uint8

const (
	// ActionStateUnknown means that the action's state was never
	// initialised. This should never be the case.
	ActionStateUnknown ActionState = 0

	// ActionStateInit represents that an Action has been created but that
	// is still in the pending state.
	ActionStateInit ActionState = 1

	// ActionStateDone represents that an Action has been executed
	// successfully.
	ActionStateDone ActionState = 2

	// ActionStateError represents that an Action did not complete
	// successfully.
	ActionStateError ActionState = 3
)

// Action represents an RPC call made through the firewall.
type Action struct {
	// SessionID is the ID of the session that this action belongs to.
	// Note that this is not serialized on persistence since the action is
	// already stored under a bucket identified by the session ID.
	SessionID session.ID

	// ActorName is the name of the entity who performed the Action.
	ActorName string

	// FeatureName is the name of the feature that the Action is being
	// performed by.
	FeatureName string

	// Trigger is the meta info detailing what caused this action to be
	// executed.
	Trigger string

	// Intent is the meta info detailing what the intended outcome of this
	// action will be.
	Intent string

	// StructuredJsonData is extra, structured, info that the Autopilot can
	// send to Litd serialised as a json string.
	StructuredJsonData string

	// RPCMethod is the URI that was called.
	RPCMethod string

	// RPCParams is the method parameters of the request in JSON form.
	RPCParamsJson []byte

	// AttemptedAt is the time at which this action was created.
	AttemptedAt time.Time

	// State represents the state of the Action.
	State ActionState

	// ErrorReason is the human-readable reason for why the action failed.
	// It will only be set if State is ActionStateError.
	ErrorReason string
}

// ListActionsQuery can be used to tweak the query to ListActions and
// ListSessionActions.
type ListActionsQuery struct {
	// IndexOffset is index of the action to inspect.
	IndexOffset uint64

	// MaxNum is the maximum number of actions to return. If it is set to 0,
	// then no maximum is enforced.
	MaxNum uint64

	// Reversed indicates whether the actions should be returned in reverse
	// order.
	Reversed bool

	// CountAll should be set to true if the total number of actions that
	// satisfy the query should be counted and returned. Note that this will
	// make the query slower.
	CountAll bool
}

// ActionsWriteDB is an abstraction over the Actions DB that will allow a
// caller to add new actions as well as change the values of an existing action.
type ActionsWriteDB interface {
	AddAction(sessionID session.ID, action *Action) (uint64, error)
	SetActionState(al *ActionLocator, state ActionState,
		errReason string) error
}

// RuleAction represents a method call that was performed at a certain time at
// a certain time.
type RuleAction struct {
	// Method is the URI of the rpc method that was called.
	Method string

	// PerformedAt is the time at which the action was attempted.
	PerformedAt time.Time
}

// ActionsDB represents a DB backend that contains Action entries that can
// be queried. It allows us to abstract away the details of the data storage
// method.
type ActionsDB interface {
	// ListActions returns a  list of past Action items.
	ListActions(ctx context.Context) ([]*RuleAction, error)
}

// ActionsReadDB is an abstraction gives a caller access to either a group
// specific or group and feature specific rules.ActionDB.
type ActionsReadDB interface {
	GroupActionsDB() ActionsDB
	GroupFeatureActionsDB() ActionsDB
}

// ActionReadDBGetter represents a function that can be used to construct
// an ActionsReadDB.
type ActionReadDBGetter interface {
	GetActionsReadDB(groupID session.ID, featureName string) ActionsReadDB
}

// GetActionsReadDB is a method on DB that constructs an ActionsReadDB.
func (db *BoltDB) GetActionsReadDB(groupID session.ID,
	featureName string) ActionsReadDB {

	return &allActionsReadDB{
		db:          db,
		groupID:     groupID,
		featureName: featureName,
	}
}

// allActionsReadDb is an implementation of the ActionsReadDB.
type allActionsReadDB struct {
	db          *BoltDB
	groupID     session.ID
	featureName string
}

var _ ActionsReadDB = (*allActionsReadDB)(nil)

// GroupActionsDB returns a rules.ActionsDB that will give the caller access
// to all of a groups Actions.
func (a *allActionsReadDB) GroupActionsDB() ActionsDB {
	return &groupActionsReadDB{a}
}

// GroupFeatureActionsDB returns a rules.ActionsDB that will give the caller
// access to only a specific features Actions in a specific group.
func (a *allActionsReadDB) GroupFeatureActionsDB() ActionsDB {
	return &groupFeatureActionsReadDB{a}
}

// groupActionsReadDB is an implementation of the rules.ActionsDB that will
// provide read access to all the Actions of a particular group.
type groupActionsReadDB struct {
	*allActionsReadDB
}

var _ ActionsDB = (*groupActionsReadDB)(nil)

// ListActions will return all the Actions for a particular group.
func (s *groupActionsReadDB) ListActions(ctx context.Context) ([]*RuleAction,
	error) {

	sessionActions, err := s.db.ListGroupActions(
		ctx, s.groupID, func(a *Action, _ bool) (bool, bool) {
			return a.State == ActionStateDone, true
		},
	)
	if err != nil {
		return nil, err
	}

	actions := make([]*RuleAction, len(sessionActions))
	for i, action := range sessionActions {
		actions[i] = actionToRulesAction(action)
	}

	return actions, nil
}

// groupFeatureActionsReadDB is an implementation of the rules.ActionsDB that
// will provide read access to all the Actions of a feature within a particular
// group.
type groupFeatureActionsReadDB struct {
	*allActionsReadDB
}

var _ ActionsDB = (*groupFeatureActionsReadDB)(nil)

// ListActions will return all the Actions for a particular group that were
// executed by a particular feature.
func (a *groupFeatureActionsReadDB) ListActions(ctx context.Context) (
	[]*RuleAction, error) {

	featureActions, err := a.db.ListGroupActions(
		ctx, a.groupID, func(action *Action, _ bool) (bool, bool) {
			return action.State == ActionStateDone &&
				action.FeatureName == a.featureName, true
		},
	)
	if err != nil {
		return nil, err
	}

	actions := make([]*RuleAction, len(featureActions))
	for i, action := range featureActions {
		actions[i] = actionToRulesAction(action)
	}

	return actions, nil
}

func actionToRulesAction(a *Action) *RuleAction {
	return &RuleAction{
		Method:      a.RPCMethod,
		PerformedAt: a.AttemptedAt,
	}
}

// ActionLocator helps us find an action in the database.
type ActionLocator struct {
	SessionID session.ID
	ActionID  uint64
}
