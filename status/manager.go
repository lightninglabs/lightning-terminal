package status

import (
	"context"
	"errors"
	"fmt"
	"sync"

	"github.com/lightninglabs/lightning-terminal/litrpc"
)

// SubServerOption defines a functional option that can be used to modify the
// values of a subServer's fields.
type SubServerOption func(status *subServer)

// WithIsReadyOverride is a functional option that can be used to set a callback
// function that is used to check if a system is ready _iff_ the system running
// status is not yet true. The call-back will be passed the request URI along
// with any manual status that has been set for the subsystem.
func WithIsReadyOverride(fn func(string, string) (bool, bool)) SubServerOption {
	return func(status *subServer) {
		status.isReadyOverride = fn
	}
}

// subServer represents the status of a sub-server.
type subServer struct {
	// disabled is true if the sub-server is available in the LiT bundle but
	// has explicitly been disabled by the user.
	disabled bool

	// running is true if the sub-server is enabled and has successfully
	// been started.
	running bool

	// customStatus is a string that details a custom status of the
	// sub-server, if the the sub-server is in a custom state. This status
	// can be set to a unique status that only exists for the specific
	// sub-server, and will be displayed to the user with the
	// litrpc.SubServerStatus.
	customStatus string

	// err will be a non-empty string if the sub-server failed to start.
	err string

	// isReadyOverride is a call back that, when set and only if `running`
	// is not yet true, will be used to determine if a system is ready for
	// a call. We will pass the request URI to this method along with the
	// `manualStatus`. The first returned boolean is true if the system
	// should be seen as ready and the second is true if the override does
	// handle the given request. If it does not, then we will fall back to
	// our normal is-ready check.
	isReadyOverride func(string, string) (bool, bool)
}

// newSubServer constructs a new subServer.
func newSubServer(disabled bool, opts ...SubServerOption) *subServer {
	s := &subServer{
		disabled: disabled,
	}
	for _, opt := range opts {
		opt(s)
	}
	return s
}

// Manager manages the status of any sub-server registered to it. It is also an
// implementation of the litrpc.StatusServer which can be queried for the status
// of various LiT sub-servers.
type Manager struct {
	litrpc.UnimplementedStatusServer

	subServers map[string]*subServer
	mu         sync.RWMutex
}

// NewStatusManager constructs a new Manager.
func NewStatusManager() *Manager {
	return &Manager{
		subServers: make(map[string]*subServer),
	}
}

// IsSystemReady shows if the given sub-server ready to handle the a request for
// the passed request URI. The first returned boolean is true if the system
// is ready to handle the request. The second returned boolean is true if the
// system has been disabled.
func (s *Manager) IsSystemReady(name, req string) (bool, bool, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	server, ok := s.subServers[name]
	if !ok {
		return false, false, errors.New("a sub-server with " +
			"name %s has not yet been registered")
	}

	if server.disabled {
		return false, true, nil
	}

	// If there is no override for this server or if the server is already
	// running then we just return the 'running' status.
	if server.isReadyOverride == nil || server.running {
		return server.running, false, nil
	}

	// Otherwise, we check the override to see if this request is handled
	// by the override and if it is, then if the override permits this call.
	isReady, handled := server.isReadyOverride(req, server.customStatus)
	if handled {
		return isReady, false, nil
	}

	// Otherwise, we just return the running status.
	return server.running, false, nil
}

// SubServerStatus queries the current status of a given sub-server.
//
// NOTE: this is part of the litrpc.StatusServer interface.
func (s *Manager) SubServerStatus(_ context.Context,
	_ *litrpc.SubServerStatusReq) (*litrpc.SubServerStatusResp,
	error) {

	s.mu.RLock()
	defer s.mu.RUnlock()

	resp := make(map[string]*litrpc.SubServerStatus, len(s.subServers))
	for server, status := range s.subServers {
		resp[server] = &litrpc.SubServerStatus{
			Disabled:     status.disabled,
			Running:      status.running,
			Error:        status.err,
			CustomStatus: status.customStatus,
		}
	}

	return &litrpc.SubServerStatusResp{
		SubServers: resp,
	}, nil
}

// RegisterSubServer will create a new sub-server entry for the Manager to
// keep track of.
func (s *Manager) RegisterSubServer(name string, opts ...SubServerOption) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	s.registerSubServerUnsafe(name, true, opts...)
}

// RegisterAndEnableSubServer will create a new sub-server entry for the
// Manager to keep track of and will set it as enabled.
func (s *Manager) RegisterAndEnableSubServer(name string,
	opts ...SubServerOption) {

	s.mu.RLock()
	defer s.mu.RUnlock()

	s.registerSubServerUnsafe(name, false, opts...)
}

func (s *Manager) registerSubServerUnsafe(name string, disabled bool,
	opts ...SubServerOption) {

	ss := newSubServer(disabled, opts...)

	s.subServers[name] = ss
}

// SetCustomStatus updates the custom status of the given sub-server to the
// passed status.
func (s *Manager) SetCustomStatus(name, customStatus string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	ss, ok := s.subServers[name]
	if !ok {
		return
	}

	ss.customStatus = customStatus
}

// SetEnabled marks the sub-server with the given name as enabled.
//
// NOTE: This will silently fail if the referenced sub-server has not yet been
// registered.
func (s *Manager) SetEnabled(name string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	log.Debugf("Setting the %s sub-server as enabled", name)

	ss, ok := s.subServers[name]
	if !ok {
		return
	}

	ss.disabled = false
}

// SetRunning can be used to set the status of a sub-server as Running
// with no errors.
//
// NOTE: This will silently fail if the referenced sub-server has not yet been
// registered.
func (s *Manager) SetRunning(name string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	log.Debugf("Setting the %s sub-server as running", name)

	ss, ok := s.subServers[name]
	if !ok {
		return
	}

	ss.running = true
	ss.err = ""
	ss.customStatus = ""
}

// SetStopped can be used to set the status of a sub-server as not Running and
// with no errors.
//
// NOTE: This will silently fail if the referenced sub-server has not yet been
// registered.
func (s *Manager) SetStopped(name string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	log.Debugf("Setting the %s sub-server as stopped", name)

	ss, ok := s.subServers[name]
	if !ok {
		return
	}

	ss.running = false
	ss.err = ""
	ss.customStatus = ""
}

// SetErrored can be used to set the status of a sub-server as not Running
// and also to set an error message for the sub-server.
//
// NOTE: This will silently fail if the referenced sub-server has not yet been
// registered.
func (s *Manager) SetErrored(name string, errStr string,
	params ...interface{}) {

	s.mu.Lock()
	defer s.mu.Unlock()

	err := fmt.Sprintf(errStr, params...)

	log.Debugf("Setting the %s sub-server as errored: %s", name, err)

	ss, ok := s.subServers[name]
	if !ok {
		return
	}

	log.Errorf("could not start the %s sub-server: %s", name, err)

	ss.running = false
	ss.err = err
	ss.customStatus = ""
}
