package status

import (
	"context"
	"errors"
	"fmt"
	"sync"

	"github.com/lightninglabs/lightning-terminal/litrpc"
)

// SubServerStatus represents the status of a sub-server.
type SubServerStatus struct {
	// Disabled is true if the sub-server is available in the LiT bundle but
	// has explicitly been disabled by the user.
	Disabled bool

	// Running is true if the sub-server is enabled and has successfully
	// been started.
	Running bool

	// Err will be a non-empty string if the sub-server failed to start.
	Err string
}

// newSubServerStatus constructs a new SubServerStatus.
func newSubServerStatus() *SubServerStatus {
	return &SubServerStatus{
		Disabled: true,
	}
}

// Manager manages the status of any sub-server registered to it. It is also an
// implementation of the litrpc.StatusServer which can be queried for the status
// of various LiT sub-servers.
type Manager struct {
	litrpc.UnimplementedStatusServer

	subServers map[string]*SubServerStatus
	mu         sync.RWMutex
}

// NewStatusManager constructs a new Manager.
func NewStatusManager() *Manager {
	return &Manager{
		subServers: make(map[string]*SubServerStatus),
	}
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
			Disabled: status.Disabled,
			Running:  status.Running,
			Error:    status.Err,
		}
	}

	return &litrpc.SubServerStatusResp{
		SubServers: resp,
	}, nil
}

// RegisterSubServer will create a new sub-server entry for the Manager to
// keep track of.
func (s *Manager) RegisterSubServer(name string) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	s.subServers[name] = newSubServerStatus()
}

// RegisterAndEnableSubServer will create a new sub-server entry for the
// Manager to keep track of and will set it as enabled.
func (s *Manager) RegisterAndEnableSubServer(name string) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	ss := newSubServerStatus()
	ss.Disabled = false

	s.subServers[name] = ss
}

// GetStatus returns the current status of a given sub-server. This will
// silently fail if the referenced sub-server has not yet been registered.
func (s *Manager) GetStatus(name string) (*SubServerStatus, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	status, ok := s.subServers[name]
	if !ok {
		return nil, errors.New("a sub-server with name %s has not " +
			"yet been registered")
	}

	return status, nil
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

	ss.Disabled = false
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

	ss.Running = true
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

	ss.Running = false
	ss.Err = ""
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

	log.Debugf("Setting the %s sub-server as errored: %s", name, errStr)

	ss, ok := s.subServers[name]
	if !ok {
		return
	}

	err := fmt.Sprintf(errStr, params...)
	log.Errorf("could not start the %s sub-server: %s", name, err)

	ss.Running = false
	ss.Err = err
}
