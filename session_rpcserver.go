package terminal

import (
	"context"
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/btcsuite/btcd/btcec/v2"
	"github.com/lightninglabs/lightning-node-connect/mailbox"
	"github.com/lightninglabs/lightning-terminal/accounts"
	"github.com/lightninglabs/lightning-terminal/litrpc"
	"github.com/lightninglabs/lightning-terminal/perms"
	"github.com/lightninglabs/lightning-terminal/session"
	"github.com/lightningnetwork/lnd/macaroons"
	"google.golang.org/grpc"
	"gopkg.in/macaroon-bakery.v2/bakery"
	"gopkg.in/macaroon-bakery.v2/bakery/checkers"
	"gopkg.in/macaroon.v2"
)

// readOnlyAction defines the keyword that a permission action should be set to
// when the entity is set to "uri" in order to activate the special case that
// will result in all read-only permissions known to lit to be added to a
// session's macaroon. The purpose of the three '*'s is to make this keyword
// an invalid URI and an invalid regex so that it does not ever clash with the
// other special cases.
const readOnlyAction = "***readonly***"

// sessionRpcServer is the gRPC server for the Session RPC interface.
type sessionRpcServer struct {
	litrpc.UnimplementedSessionsServer

	cfg           *sessionRpcServerConfig
	db            *session.DB
	sessionServer *session.Server

	quit     chan struct{}
	wg       sync.WaitGroup
	stopOnce sync.Once
}

// sessionRpcServerConfig holds the values used to configure the
// sessionRpcServer.
type sessionRpcServerConfig struct {
	basicAuth               string
	dbDir                   string
	grpcOptions             []grpc.ServerOption
	registerGrpcServers     func(server *grpc.Server)
	superMacBaker           session.MacaroonBaker
	firstConnectionDeadline time.Duration
	permMgr                 *perms.Manager
}

// newSessionRPCServer creates a new sessionRpcServer using the passed config.
func newSessionRPCServer(cfg *sessionRpcServerConfig) (*sessionRpcServer,
	error) {

	// Create an instance of the local Terminal Connect session store DB.
	db, err := session.NewDB(cfg.dbDir, session.DBFilename)
	if err != nil {
		return nil, fmt.Errorf("error creating session DB: %v", err)
	}

	// Create the gRPC server that handles adding/removing sessions and the
	// actual mailbox server that spins up the Terminal Connect server
	// interface.
	server := session.NewServer(
		func(opts ...grpc.ServerOption) *grpc.Server {
			allOpts := append(cfg.grpcOptions, opts...)
			grpcServer := grpc.NewServer(allOpts...)

			cfg.registerGrpcServers(grpcServer)

			return grpcServer
		},
	)

	return &sessionRpcServer{
		cfg:           cfg,
		db:            db,
		sessionServer: server,
		quit:          make(chan struct{}),
	}, nil
}

// start all the components necessary for the sessionRpcServer to start serving
// requests. This includes starting the macaroon service and resuming all
// non-revoked sessions.
func (s *sessionRpcServer) start() error {
	// Start up all previously created sessions.
	sessions, err := s.db.ListSessions()
	if err != nil {
		return fmt.Errorf("error listing sessions: %v", err)
	}
	for _, sess := range sessions {
		if err := s.resumeSession(sess); err != nil {
			return fmt.Errorf("error resuming sesion: %v", err)
		}
	}

	return nil
}

// stop cleans up any sessionRpcServer resources.
func (s *sessionRpcServer) stop() error {
	var returnErr error
	s.stopOnce.Do(func() {
		if err := s.db.Close(); err != nil {
			log.Errorf("Error closing session DB: %v", err)
			returnErr = err
		}
		s.sessionServer.Stop()

		close(s.quit)
		s.wg.Wait()
	})

	return returnErr
}

// AddSession adds and starts a new Terminal Connect session.
func (s *sessionRpcServer) AddSession(_ context.Context,
	req *litrpc.AddSessionRequest) (*litrpc.AddSessionResponse, error) {

	expiry := time.Unix(int64(req.ExpiryTimestampSeconds), 0)
	if time.Now().After(expiry) {
		return nil, fmt.Errorf("expiry must be in the future")
	}

	typ, err := unmarshalRPCType(req.SessionType)
	if err != nil {
		return nil, err
	}

	// Store the entity-action permission pairs in a map in order to
	// de-dup any repeat perms.
	permissions := make(map[string]map[string]struct{})

	// addPerm is a closure that can be used to add entity-action pairs to
	// the permissions map.
	addPerm := func(entity, action string) {
		_, ok := permissions[entity]
		if !ok {
			permissions[entity] = make(map[string]struct{})
		}

		permissions[entity][action] = struct{}{}
	}

	var caveats []macaroon.Caveat
	switch typ {
	// For the default session types we use empty caveats and permissions,
	// the macaroons are baked correctly when creating the session.
	case session.TypeMacaroonAdmin, session.TypeMacaroonReadonly:

	// For account based sessions we just add the account ID caveat, the
	// permissions are added dynamically when creating the session.
	case session.TypeMacaroonAccount:
		id, err := accounts.ParseAccountID(req.AccountId)
		if err != nil {
			return nil, fmt.Errorf("invalid account ID: %v", err)
		}

		cav := checkers.Condition(macaroons.CondLndCustom, fmt.Sprintf(
			"%s %x", accounts.CondAccount, id[:],
		))
		caveats = append(caveats, macaroon.Caveat{
			Id: []byte(cav),
		})

	// For the custom macaroon type, we use the custom permissions specified
	// in the request. For the time being, the caveats list will be empty
	// for this type.
	case session.TypeMacaroonCustom:
		if len(req.MacaroonCustomPermissions) == 0 {
			return nil, fmt.Errorf("custom macaroon " +
				"permissions must be specified for the " +
				"custom macaroon session type")
		}

		for _, op := range req.MacaroonCustomPermissions {
			if op.Entity != macaroons.PermissionEntityCustomURI {
				addPerm(op.Entity, op.Action)

				continue
			}

			// If the action specified was equal to the
			// readOnlyAction keyword, then this is taken to mean
			// that the permissions for all read-only URIs should be
			// granted.
			if op.Action == readOnlyAction {
				readPerms := s.cfg.permMgr.ActivePermissions(
					true,
				)

				for _, p := range readPerms {
					addPerm(p.Entity, p.Action)
				}

				continue
			}

			// First check if this is a regex URI.
			uris, isRegex := s.cfg.permMgr.MatchRegexURI(op.Action)
			if isRegex {
				// This is a regex URI, and so we add each of
				// the matching URIs returned from the
				// permissions' manager.
				for _, uri := range uris {
					addPerm(op.Entity, uri)
				}
				continue
			}

			// This is not a wild card URI, so just check that the
			// permissions' manager is aware of this URI.
			_, ok := s.cfg.permMgr.URIPermissions(op.Action)
			if !ok {
				return nil, fmt.Errorf("URI %s is unknown to "+
					"LiT", op.Action)
			}

			addPerm(op.Entity, op.Action)
		}

	// No other types are currently supported.
	default:
		return nil, fmt.Errorf("invalid session type, only admin, " +
			"readonly, account and custom macaroon types " +
			"supported in LiT")
	}

	// Collect the de-duped permissions.
	var uniquePermissions []bakery.Op
	for entity, actions := range permissions {
		for action := range actions {
			uniquePermissions = append(uniquePermissions, bakery.Op{
				Entity: entity,
				Action: action,
			})
		}
	}

	sess, err := session.NewSession(
		req.Label, typ, expiry, req.MailboxServerAddr, req.DevServer,
		uniquePermissions, caveats,
	)
	if err != nil {
		return nil, fmt.Errorf("error creating new session: %v", err)
	}

	if err := s.db.StoreSession(sess); err != nil {
		return nil, fmt.Errorf("error storing session: %v", err)
	}

	if err := s.resumeSession(sess); err != nil {
		return nil, fmt.Errorf("error starting session: %v", err)
	}

	rpcSession, err := marshalRPCSession(sess)
	if err != nil {
		return nil, fmt.Errorf("error marshaling session: %v", err)
	}

	return &litrpc.AddSessionResponse{
		Session: rpcSession,
	}, nil
}

// resumeSession tries to start an existing session if it is not expired, not
// revoked and a LiT session.
func (s *sessionRpcServer) resumeSession(sess *session.Session) error {
	pubKey := sess.LocalPublicKey
	pubKeyBytes := pubKey.SerializeCompressed()

	// We only start non-revoked, non-expired LiT sessions. Everything else
	// we just skip.
	if sess.State != session.StateInUse &&
		sess.State != session.StateCreated {

		log.Debugf("Not resuming session %x with state %d", pubKeyBytes,
			sess.State)
		return nil
	}

	// Don't resume an expired session.
	if sess.Expiry.Before(time.Now()) {
		log.Debugf("Not resuming session %x with expiry %s",
			pubKeyBytes, sess.Expiry)

		if err := s.db.RevokeSession(pubKey); err != nil {
			return fmt.Errorf("error revoking session: %v", err)
		}

		return nil
	}

	var (
		caveats     []macaroon.Caveat
		permissions []bakery.Op
		readOnly    = sess.Type == session.TypeMacaroonReadonly
	)
	switch sess.Type {
	// For the default session types we use empty caveats and permissions,
	// the macaroons are baked correctly when creating the session.
	case session.TypeMacaroonAdmin, session.TypeMacaroonReadonly:
		permissions = s.cfg.permMgr.ActivePermissions(readOnly)

	// For account based sessions we just add the account ID caveat, the
	// permissions are added dynamically when creating the session.
	case session.TypeMacaroonAccount:
		if sess.MacaroonRecipe == nil {
			return fmt.Errorf("invalid account session, expected " +
				"recipe to be set")
		}

		caveats = sess.MacaroonRecipe.Caveats
		permissions = accounts.MacaroonPermissions

	// For custom session types, we use the caveats and permissions that
	// were persisted on session creation.
	case session.TypeMacaroonCustom:
		if sess.MacaroonRecipe != nil {
			permissions = sess.MacaroonRecipe.Permissions
		}

	// No other types are currently supported.
	default:
		log.Debugf("Not resuming session %x with type %d", pubKeyBytes,
			sess.Type)
		return nil
	}

	// Add the session expiry as a macaroon caveat.
	macExpiry := checkers.TimeBeforeCaveat(sess.Expiry)
	caveats = append(caveats, macaroon.Caveat{
		Id: []byte(macExpiry.Condition),
	})

	mac, err := s.cfg.superMacBaker(
		context.Background(), sess.MacaroonRootKey,
		&session.MacaroonRecipe{
			Permissions: permissions,
			Caveats:     caveats,
		},
	)
	if err != nil {
		log.Debugf("Not resuming session %x. Could not bake "+
			"the necessary macaroon: %w", pubKeyBytes, err)
		return nil
	}

	var (
		onNewStatus     func(s mailbox.ServerStatus)
		firstConnTimout = make(chan struct{})
	)

	// If this is the first time the session is being spun up then we will
	// kick off a timer to revoke the session after a timeout unless an
	// initial connection is made. We identify such a session as one that
	// we do not yet have a static remote pub key for.
	if sess.RemotePublicKey == nil {
		deadline := sess.CreatedAt.Add(s.cfg.firstConnectionDeadline)
		if deadline.Before(time.Now()) {
			log.Debugf("Deadline for session %x has already "+
				"passed. Revoking session", pubKeyBytes)

			return s.db.RevokeSession(pubKey)
		}

		// Start the deadline timer.
		deadlineDuration := time.Until(deadline)
		deadlineTimer := time.AfterFunc(deadlineDuration, func() {
			close(firstConnTimout)
		})

		log.Warnf("Kicking off deadline timer for first connection "+
			"for session %x. A successful connection must be "+
			"made in the next %s", pubKeyBytes, deadlineDuration)

		var stopTimerOnce sync.Once
		onNewStatus = func(s mailbox.ServerStatus) {
			// We will only stop the timer if the server status
			// indicates that the client has successfully connected.
			if s != mailbox.ServerStatusInUse {
				return
			}

			// Stop the deadline timer.
			stopTimerOnce.Do(func() {
				log.Debugf("First connection for session %x "+
					"made in a timely manner",
					sess.LocalPublicKey.
						SerializeCompressed())

				deadlineTimer.Stop()
			})
		}
	}

	authData := []byte(fmt.Sprintf("%s: %s", HeaderMacaroon, mac))
	sessionClosedSub, err := s.sessionServer.StartSession(
		sess, authData, s.db.StoreSession, onNewStatus,
	)
	if err != nil {
		return err
	}

	s.wg.Add(1)
	go func() {
		defer s.wg.Done()

		ticker := time.NewTimer(time.Until(sess.Expiry))
		defer ticker.Stop()

		select {
		case <-s.quit:
			return

		case <-sessionClosedSub:
			return

		case <-ticker.C:
			log.Debugf("Stopping expired session %x with "+
				"type %d", pubKeyBytes, sess.Type)

		case <-firstConnTimout:
			log.Debugf("Deadline exceeded for first connection "+
				"for session %x. Stopping and revoking.",
				pubKeyBytes)
		}

		err = s.sessionServer.StopSession(pubKey)
		if err != nil {
			log.Debugf("Error stopping session: "+
				"%v", err)
		}

		err = s.db.RevokeSession(pubKey)
		if err != nil {
			log.Debugf("error revoking session: "+
				"%v", err)
		}
	}()

	return nil
}

// ListSessions returns all sessions known to the session store.
func (s *sessionRpcServer) ListSessions(_ context.Context,
	_ *litrpc.ListSessionsRequest) (*litrpc.ListSessionsResponse, error) {

	sessions, err := s.db.ListSessions()
	if err != nil {
		return nil, fmt.Errorf("error fetching sessions: %v", err)
	}

	response := &litrpc.ListSessionsResponse{
		Sessions: make([]*litrpc.Session, len(sessions)),
	}
	for idx, sess := range sessions {
		response.Sessions[idx], err = marshalRPCSession(sess)
		if err != nil {
			return nil, fmt.Errorf("error marshaling session: %v",
				err)
		}
	}

	return response, nil
}

// RevokeSession revokes a single session and also stops it if it is currently
// active.
func (s *sessionRpcServer) RevokeSession(_ context.Context,
	req *litrpc.RevokeSessionRequest) (*litrpc.RevokeSessionResponse, error) {

	pubKey, err := btcec.ParsePubKey(req.LocalPublicKey)
	if err != nil {
		return nil, fmt.Errorf("error parsing public key: %v", err)
	}

	if err := s.db.RevokeSession(pubKey); err != nil {
		return nil, fmt.Errorf("error revoking session: %v", err)
	}

	// If the session expired already it might not be running anymore. So we
	// only log possible errors here.
	if err := s.sessionServer.StopSession(pubKey); err != nil {
		log.Debugf("Error stopping session: %v", err)
	}

	return &litrpc.RevokeSessionResponse{}, nil
}

// marshalRPCSession converts a session into its RPC counterpart.
func marshalRPCSession(sess *session.Session) (*litrpc.Session, error) {
	rpcState, err := marshalRPCState(sess.State)
	if err != nil {
		return nil, err
	}

	rpcType, err := marshalRPCType(sess.Type)
	if err != nil {
		return nil, err
	}

	var remotePubKey []byte
	if sess.RemotePublicKey != nil {
		remotePubKey = sess.RemotePublicKey.SerializeCompressed()
	}

	mnemonic, err := mailbox.PassphraseEntropyToMnemonic(sess.PairingSecret)
	if err != nil {
		return nil, err
	}

	macRecipe := marshalRPCMacaroonRecipe(sess.MacaroonRecipe)

	var revokedAt uint64
	if !sess.RevokedAt.IsZero() {
		revokedAt = uint64(sess.RevokedAt.Unix())
	}

	return &litrpc.Session{
		Id:                     sess.ID[:],
		Label:                  sess.Label,
		SessionState:           rpcState,
		SessionType:            rpcType,
		ExpiryTimestampSeconds: uint64(sess.Expiry.Unix()),
		MailboxServerAddr:      sess.ServerAddr,
		DevServer:              sess.DevServer,
		PairingSecret:          sess.PairingSecret[:],
		PairingSecretMnemonic:  strings.Join(mnemonic[:], " "),
		LocalPublicKey:         sess.LocalPublicKey.SerializeCompressed(),
		RemotePublicKey:        remotePubKey,
		CreatedAt:              uint64(sess.CreatedAt.Unix()),
		RevokedAt:              revokedAt,
		MacaroonRecipe:         macRecipe,
	}, nil
}

// marshalRPCMacaroonRecipe converts a macaroon recipe (permissions and caveats)
// into its RPC counterpart.
func marshalRPCMacaroonRecipe(
	recipe *session.MacaroonRecipe) *litrpc.MacaroonRecipe {

	if recipe == nil {
		return nil
	}

	perms := make([]*litrpc.MacaroonPermission, len(recipe.Permissions))
	for i, op := range recipe.Permissions {
		perms[i] = &litrpc.MacaroonPermission{
			Entity: op.Entity,
			Action: op.Action,
		}
	}

	caveats := make([]string, len(recipe.Caveats))
	for i, cav := range recipe.Caveats {
		caveats[i] = string(cav.Id)
	}

	return &litrpc.MacaroonRecipe{
		Permissions: perms,
		Caveats:     caveats,
	}
}

// marshalRPCState converts a session state to its RPC counterpart.
func marshalRPCState(state session.State) (litrpc.SessionState, error) {
	switch state {
	case session.StateCreated:
		return litrpc.SessionState_STATE_CREATED, nil

	case session.StateInUse:
		return litrpc.SessionState_STATE_IN_USE, nil

	case session.StateRevoked:
		return litrpc.SessionState_STATE_REVOKED, nil

	case session.StateExpired:
		return litrpc.SessionState_STATE_EXPIRED, nil

	default:
		return 0, fmt.Errorf("unknown state <%d>", state)
	}
}

// marshalRPCType converts a session type to its RPC counterpart.
func marshalRPCType(typ session.Type) (litrpc.SessionType, error) {
	switch typ {
	case session.TypeMacaroonReadonly:
		return litrpc.SessionType_TYPE_MACAROON_READONLY, nil

	case session.TypeMacaroonAdmin:
		return litrpc.SessionType_TYPE_MACAROON_ADMIN, nil

	case session.TypeMacaroonCustom:
		return litrpc.SessionType_TYPE_MACAROON_CUSTOM, nil

	case session.TypeUIPassword:
		return litrpc.SessionType_TYPE_UI_PASSWORD, nil

	case session.TypeMacaroonAccount:
		return litrpc.SessionType_TYPE_MACAROON_ACCOUNT, nil

	default:
		return 0, fmt.Errorf("unknown type <%d>", typ)
	}
}

// unmarshalRPCType converts an RPC session type to its session counterpart.
func unmarshalRPCType(typ litrpc.SessionType) (session.Type, error) {
	switch typ {
	case litrpc.SessionType_TYPE_MACAROON_READONLY:
		return session.TypeMacaroonReadonly, nil

	case litrpc.SessionType_TYPE_MACAROON_ADMIN:
		return session.TypeMacaroonAdmin, nil

	case litrpc.SessionType_TYPE_MACAROON_CUSTOM:
		return session.TypeMacaroonCustom, nil

	case litrpc.SessionType_TYPE_UI_PASSWORD:
		return session.TypeUIPassword, nil

	case litrpc.SessionType_TYPE_MACAROON_ACCOUNT:
		return session.TypeMacaroonAccount, nil

	default:
		return 0, fmt.Errorf("unknown type <%d>", typ)
	}
}
