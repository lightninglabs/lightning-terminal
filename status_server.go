package terminal

import (
	"context"
	"fmt"
	"sync"

	"github.com/lightninglabs/lightning-terminal/litrpc"
)

// statusServer is an implementation of the litrpc.StatusServer which can be
// queried for the status of various LiT sub-servers.
type statusServer struct {
	litrpc.UnimplementedStatusServer

	subServers map[string]*subServerStatus
	mu         sync.RWMutex
}

// subServerStatus represents the status of a sub-server.
type subServerStatus struct {
	running bool
	err     string
}

// newSubServerStatus constructs a new subServerStatus.
func newSubServerStatus() *subServerStatus {
	return &subServerStatus{}
}

// newStatusServer constructs a new statusServer.
func newStatusServer() *statusServer {
	return &statusServer{
		subServers: map[string]*subServerStatus{},
	}
}

// RegisterSubServer will create a new sub-server entry for the statusServer to
// keep track of.
func (s *statusServer) RegisterSubServer(name string) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	s.subServers[name] = newSubServerStatus()
}

// SubServerState queries the current status of a given sub-server.
//
// NOTE: this is part of the litrpc.StatusServer interface.
func (s *statusServer) SubServerState(_ context.Context,
	_ *litrpc.SubServerStatusReq) (*litrpc.SubServerStatusResp,
	error) {

	s.mu.RLock()
	defer s.mu.RUnlock()

	resp := make(map[string]*litrpc.SubServerStatus, len(s.subServers))
	for server, status := range s.subServers {
		resp[server] = &litrpc.SubServerStatus{
			Running: status.running,
			Error:   status.err,
		}
	}

	return &litrpc.SubServerStatusResp{
		SubServers: resp,
	}, nil
}

// getSubServerState queries the current status of a given sub-server.
func (s *statusServer) getSubServerState(name string) (bool, string) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	system, ok := s.subServers[name]
	if !ok {
		return false, ""
	}

	return system.running, system.err
}

// setServerRunning can be used to set the status of a sub-server as running
// with no errors.
func (s *statusServer) setServerRunning(name string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.subServers[name] = &subServerStatus{
		running: true,
	}
}

// setServerStopped can be used to set the status of a sub-server as not running
// and with no errors.
func (s *statusServer) setServerStopped(name string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.subServers[name] = &subServerStatus{
		running: false,
	}
}

// setServerErrored can be used to set the status of a sub-server as not running
// and also to set an error message for the sub-server.
func (s *statusServer) setServerErrored(name string, errStr string,
	params ...interface{}) {

	s.mu.Lock()
	defer s.mu.Unlock()

	err := fmt.Sprintf(errStr, params...)
	log.Errorf("could not start the %s sub-server: %s", name, err)

	s.subServers[name] = &subServerStatus{
		running: false,
		err:     err,
	}
}
