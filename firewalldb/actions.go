package firewalldb

import (
	"bytes"
	"context"
	"encoding/binary"
	"errors"
	"fmt"
	"io"
	"time"

	"github.com/lightninglabs/lightning-terminal/session"
	"github.com/lightningnetwork/lnd/tlv"
	"go.etcd.io/bbolt"
)

const (
	typeActorName          tlv.Type = 1
	typeFeature            tlv.Type = 2
	typeTrigger            tlv.Type = 3
	typeIntent             tlv.Type = 4
	typeStructuredJsonData tlv.Type = 5
	typeRPCMethod          tlv.Type = 6
	typeRPCParamsJson      tlv.Type = 7
	typeAttemptedAt        tlv.Type = 8
	typeState              tlv.Type = 9
	typeErrorReason        tlv.Type = 10

	typeLocatorSessionID tlv.Type = 1
	typeLocatorActionID  tlv.Type = 2
)

/*
	The Actions are stored in the following structure in the KV db:

	actions-bucket -> actions -> <session-id> -> <action-index> -> serialised action

		       -> actions-index -> <id> -> {sessionID:action-index}
*/

var (
	// actionsBucketKey is the key that will be used for the main Actions
	// bucket.
	actionsBucketKey = []byte("actions-bucket")

	// actionsKey is the key used for the sub-bucket containing the
	// session actions.
	actionsKey = []byte("actions")

	// actionsIndex is the key used for the sub-bucket containing a map
	// from monotonically increasing IDs to action locators.
	actionsIndex = []byte("actions-index")
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

// AddAction serialises and adds an Action to the DB under the given sessionID.
func (db *DB) AddAction(sessionID session.ID, action *Action) (uint64, error) {
	var buf bytes.Buffer
	if err := SerializeAction(&buf, action); err != nil {
		return 0, err
	}

	var id uint64
	err := db.DB.Update(func(tx *bbolt.Tx) error {
		mainActionsBucket, err := getBucket(tx, actionsBucketKey)
		if err != nil {
			return err
		}

		actionsBucket := mainActionsBucket.Bucket(actionsKey)
		if actionsBucket == nil {
			return ErrNoSuchKeyFound
		}

		sessBucket, err := actionsBucket.CreateBucketIfNotExists(
			sessionID[:],
		)
		if err != nil {
			return err
		}

		nextActionIndex, err := sessBucket.NextSequence()
		if err != nil {
			return err
		}
		id = nextActionIndex

		var actionIndex [8]byte
		byteOrder.PutUint64(actionIndex[:], nextActionIndex)
		err = sessBucket.Put(actionIndex[:], buf.Bytes())
		if err != nil {
			return err
		}

		actionsIndexBucket := mainActionsBucket.Bucket(actionsIndex)
		if actionsIndexBucket == nil {
			return ErrNoSuchKeyFound
		}

		nextSeq, err := actionsIndexBucket.NextSequence()
		if err != nil {
			return err
		}

		locator := ActionLocator{
			SessionID: sessionID,
			ActionID:  nextActionIndex,
		}

		var buf bytes.Buffer
		err = serializeActionLocator(&buf, &locator)
		if err != nil {
			return err
		}

		var seqNoBytes [8]byte
		byteOrder.PutUint64(seqNoBytes[:], nextSeq)
		return actionsIndexBucket.Put(seqNoBytes[:], buf.Bytes())
	})
	if err != nil {
		return 0, err
	}

	return id, nil
}

func putAction(tx *bbolt.Tx, al *ActionLocator, a *Action) error {
	var buf bytes.Buffer
	if err := SerializeAction(&buf, a); err != nil {
		return err
	}

	mainActionsBucket, err := getBucket(tx, actionsBucketKey)
	if err != nil {
		return err
	}

	actionsBucket := mainActionsBucket.Bucket(actionsKey)
	if actionsBucket == nil {
		return ErrNoSuchKeyFound
	}

	sessBucket := actionsBucket.Bucket(al.SessionID[:])
	if sessBucket == nil {
		return fmt.Errorf("session bucket for session ID %x does not "+
			"exist", al.SessionID)
	}

	var id [8]byte
	binary.BigEndian.PutUint64(id[:], al.ActionID)

	return sessBucket.Put(id[:], buf.Bytes())
}

func getAction(actionsBkt *bbolt.Bucket, al *ActionLocator) (*Action, error) {
	sessBucket := actionsBkt.Bucket(al.SessionID[:])
	if sessBucket == nil {
		return nil, fmt.Errorf("session bucket for session ID "+
			"%x does not exist", al.SessionID)
	}

	var id [8]byte
	binary.BigEndian.PutUint64(id[:], al.ActionID)

	actionBytes := sessBucket.Get(id[:])
	return DeserializeAction(bytes.NewReader(actionBytes), al.SessionID)
}

// SetActionState finds the action specified by the ActionLocator and sets its
// state to the given state.
func (db *DB) SetActionState(al *ActionLocator, state ActionState,
	errorReason string) error {

	if errorReason != "" && state != ActionStateError {
		return fmt.Errorf("error reason should only be set for " +
			"ActionStateError")
	}

	return db.DB.Update(func(tx *bbolt.Tx) error {
		mainActionsBucket, err := getBucket(tx, actionsBucketKey)
		if err != nil {
			return err
		}

		actionsBucket := mainActionsBucket.Bucket(actionsKey)
		if actionsBucket == nil {
			return ErrNoSuchKeyFound
		}

		action, err := getAction(actionsBucket, al)
		if err != nil {
			return err
		}

		action.State = state
		action.ErrorReason = errorReason

		return putAction(tx, al, action)
	})
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

// ListActionsFilterFn defines a function that can be used to determine if an
// action should be included in a set of results or not. The reversed parameter
// indicates if the actions are being traversed in reverse order or not.
// The first return boolean indicates if the action should be included or not
// and the second one indicates if the iteration should be stopped or not.
type ListActionsFilterFn func(a *Action, reversed bool) (bool, bool)

// ListActions returns a list of Actions that pass the filterFn requirements.
// The indexOffset and maxNum params can be used to control the number of
// actions returned. The return values are the list of actions, the last index
// and the total count (iff query.CountTotal is set).
func (db *DB) ListActions(filterFn ListActionsFilterFn,
	query *ListActionsQuery) ([]*Action, uint64, uint64, error) {

	var (
		actions    []*Action
		totalCount uint64
		lastIndex  uint64
	)
	err := db.View(func(tx *bbolt.Tx) error {
		mainActionsBucket, err := getBucket(tx, actionsBucketKey)
		if err != nil {
			return err
		}

		actionsBucket := mainActionsBucket.Bucket(actionsKey)
		if actionsBucket == nil {
			return ErrNoSuchKeyFound
		}

		actionsIndexBucket := mainActionsBucket.Bucket(actionsIndex)
		if actionsIndexBucket == nil {
			return ErrNoSuchKeyFound
		}

		readAction := func(index, locatorBytes []byte) (*Action,
			error) {

			locator, err := deserializeActionLocator(
				bytes.NewReader(locatorBytes),
			)
			if err != nil {
				return nil, err
			}

			return getAction(actionsBucket, locator)
		}

		actions, lastIndex, totalCount, err = paginateActions(
			query, actionsIndexBucket.Cursor(), readAction,
			filterFn,
		)
		return err
	})
	if err != nil {
		return nil, 0, 0, err
	}

	return actions, lastIndex, totalCount, nil
}

// ListSessionActions returns a list of the given session's Actions that pass
// the filterFn requirements.
func (db *DB) ListSessionActions(sessionID session.ID,
	filterFn ListActionsFilterFn, query *ListActionsQuery) ([]*Action,
	uint64, uint64, error) {

	var (
		actions    []*Action
		totalCount uint64
		lastIndex  uint64
	)
	err := db.View(func(tx *bbolt.Tx) error {
		mainActionsBucket, err := getBucket(tx, actionsBucketKey)
		if err != nil {
			return err
		}

		actionsBucket := mainActionsBucket.Bucket(actionsKey)
		if actionsBucket == nil {
			return ErrNoSuchKeyFound
		}

		sessionsBucket := actionsBucket.Bucket(sessionID[:])
		if sessionsBucket == nil {
			return nil
		}

		readAction := func(_, v []byte) (*Action, error) {
			return DeserializeAction(bytes.NewReader(v), sessionID)
		}

		actions, lastIndex, totalCount, err = paginateActions(
			query, sessionsBucket.Cursor(), readAction, filterFn,
		)

		return err
	})
	if err != nil {
		return nil, 0, 0, err
	}

	return actions, lastIndex, totalCount, nil
}

// ListGroupActions returns a list of the given session group's Actions that
// pass the filterFn requirements.
//
// TODO: update to allow for pagination.
func (db *DB) ListGroupActions(groupID session.ID,
	filterFn ListActionsFilterFn) ([]*Action, error) {

	if filterFn == nil {
		filterFn = func(a *Action, reversed bool) (bool, bool) {
			return true, true
		}
	}

	sessionIDs, err := db.sessionIDIndex.GetSessionIDs(groupID)
	if err != nil {
		return nil, err
	}

	var (
		actions []*Action
		errDone = errors.New("done iterating")
	)
	err = db.View(func(tx *bbolt.Tx) error {
		mainActionsBucket, err := getBucket(tx, actionsBucketKey)
		if err != nil {
			return err
		}

		actionsBucket := mainActionsBucket.Bucket(actionsKey)
		if actionsBucket == nil {
			return ErrNoSuchKeyFound
		}

		// Iterate over each session ID in this group.
		for _, sessionID := range sessionIDs {
			sessionsBucket := actionsBucket.Bucket(sessionID[:])
			if sessionsBucket == nil {
				return nil
			}

			err = sessionsBucket.ForEach(func(_, v []byte) error {
				action, err := DeserializeAction(
					bytes.NewReader(v), sessionID,
				)
				if err != nil {
					return err
				}

				include, cont := filterFn(action, false)
				if include {
					actions = append(actions, action)
				}

				if !cont {
					return errDone
				}

				return nil
			})
			if err != nil {
				return err
			}
		}

		return nil
	})
	if err != nil && !errors.Is(err, errDone) {
		return nil, err
	}

	return actions, nil
}

// SerializeAction binary serializes the given action to the writer using the
// tlv format.
func SerializeAction(w io.Writer, action *Action) error {
	if action == nil {
		return fmt.Errorf("action cannot be nil")
	}

	var (
		actor       = []byte(action.ActorName)
		feature     = []byte(action.FeatureName)
		trigger     = []byte(action.Trigger)
		intent      = []byte(action.Intent)
		data        = []byte(action.StructuredJsonData)
		rpcMethod   = []byte(action.RPCMethod)
		params      = action.RPCParamsJson
		attemptedAt = uint64(action.AttemptedAt.Unix())
		state       = uint8(action.State)
		errorReason = []byte(action.ErrorReason)
	)

	tlvRecords := []tlv.Record{
		tlv.MakePrimitiveRecord(typeActorName, &actor),
		tlv.MakePrimitiveRecord(typeFeature, &feature),
		tlv.MakePrimitiveRecord(typeTrigger, &trigger),
		tlv.MakePrimitiveRecord(typeIntent, &intent),
		tlv.MakePrimitiveRecord(typeStructuredJsonData, &data),
		tlv.MakePrimitiveRecord(typeRPCMethod, &rpcMethod),
		tlv.MakePrimitiveRecord(typeRPCParamsJson, &params),
		tlv.MakePrimitiveRecord(typeAttemptedAt, &attemptedAt),
		tlv.MakePrimitiveRecord(typeState, &state),
		tlv.MakePrimitiveRecord(typeErrorReason, &errorReason),
	}

	tlvStream, err := tlv.NewStream(tlvRecords...)
	if err != nil {
		return err
	}

	return tlvStream.Encode(w)
}

// DeserializeAction deserializes an action from the given reader, expecting
// the data to be encoded in the tlv format.
func DeserializeAction(r io.Reader, sessionID session.ID) (*Action, error) {
	var (
		action                = Action{}
		actor, featureName    []byte
		trigger, intent, data []byte
		rpcMethod, params     []byte
		attemptedAt           uint64
		state                 uint8
		errorReason           []byte
	)
	tlvStream, err := tlv.NewStream(
		tlv.MakePrimitiveRecord(typeActorName, &actor),
		tlv.MakePrimitiveRecord(typeFeature, &featureName),
		tlv.MakePrimitiveRecord(typeTrigger, &trigger),
		tlv.MakePrimitiveRecord(typeIntent, &intent),
		tlv.MakePrimitiveRecord(typeStructuredJsonData, &data),
		tlv.MakePrimitiveRecord(typeRPCMethod, &rpcMethod),
		tlv.MakePrimitiveRecord(typeRPCParamsJson, &params),
		tlv.MakePrimitiveRecord(typeAttemptedAt, &attemptedAt),
		tlv.MakePrimitiveRecord(typeState, &state),
		tlv.MakePrimitiveRecord(typeErrorReason, &errorReason),
	)
	if err != nil {
		return nil, err
	}

	_, err = tlvStream.DecodeWithParsedTypes(r)
	if err != nil {
		return nil, err
	}

	action.SessionID = sessionID
	action.ActorName = string(actor)
	action.FeatureName = string(featureName)
	action.Trigger = string(trigger)
	action.Intent = string(intent)
	action.StructuredJsonData = string(data)
	action.RPCMethod = string(rpcMethod)
	action.RPCParamsJson = params
	action.AttemptedAt = time.Unix(int64(attemptedAt), 0)
	action.State = ActionState(state)
	action.ErrorReason = string(errorReason)

	return &action, nil
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
func (db *DB) GetActionsReadDB(groupID session.ID,
	featureName string) ActionsReadDB {

	return &allActionsReadDB{
		db:          db,
		groupID:     groupID,
		featureName: featureName,
	}
}

// allActionsReadDb is an implementation of the ActionsReadDB.
type allActionsReadDB struct {
	db          *DB
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
func (s *groupActionsReadDB) ListActions(_ context.Context) ([]*RuleAction,
	error) {

	sessionActions, err := s.db.ListGroupActions(
		s.groupID, func(a *Action, _ bool) (bool, bool) {
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
func (a *groupFeatureActionsReadDB) ListActions(_ context.Context) (
	[]*RuleAction, error) {

	featureActions, err := a.db.ListGroupActions(
		a.groupID, func(action *Action, _ bool) (bool, bool) {
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

// serializeActionLocator binary serializes the given ActionLocator to the
// writer using the tlv format.
func serializeActionLocator(w io.Writer, al *ActionLocator) error {
	if al == nil {
		return fmt.Errorf("action locator cannot be nil")
	}

	var (
		sessionID = al.SessionID[:]
		actionID  = al.ActionID
	)

	tlvRecords := []tlv.Record{
		tlv.MakePrimitiveRecord(typeLocatorSessionID, &sessionID),
		tlv.MakePrimitiveRecord(typeLocatorActionID, &actionID),
	}

	tlvStream, err := tlv.NewStream(tlvRecords...)
	if err != nil {
		return err
	}

	return tlvStream.Encode(w)
}

// deserializeActionLocator deserializes an ActionLocator from the given reader,
// expecting the data to be encoded in the tlv format.
func deserializeActionLocator(r io.Reader) (*ActionLocator, error) {
	var (
		sessionID []byte
		actionID  uint64
	)
	tlvStream, err := tlv.NewStream(
		tlv.MakePrimitiveRecord(typeLocatorSessionID, &sessionID),
		tlv.MakePrimitiveRecord(typeLocatorActionID, &actionID),
	)
	if err != nil {
		return nil, err
	}

	_, err = tlvStream.DecodeWithParsedTypes(r)
	if err != nil {
		return nil, err
	}

	id, err := session.IDFromBytes(sessionID)
	if err != nil {
		return nil, err
	}

	return &ActionLocator{
		SessionID: id,
		ActionID:  actionID,
	}, nil
}
