package scripting

import (
	"context"
	"fmt"

	"github.com/lightninglabs/lightning-terminal/litrpc"
)

// RPCServer implements the litrpc.ScriptsServer interface.
type RPCServer struct {
	litrpc.UnimplementedScriptsServer

	manager *Manager
	kvStore KVStore
}

// NewRPCServer creates a new scripts RPC server.
func NewRPCServer(manager *Manager, kvStore KVStore) *RPCServer {
	return &RPCServer{
		manager: manager,
		kvStore: kvStore,
	}
}

// CreateScript creates a new script.
func (s *RPCServer) CreateScript(ctx context.Context,
	req *litrpc.CreateScriptRequest) (*litrpc.CreateScriptResponse, error) {

	script, err := s.manager.CreateScript(ctx, req)
	if err != nil {
		return nil, err
	}

	return &litrpc.CreateScriptResponse{
		Script: scriptToProto(script, false),
	}, nil
}

// UpdateScript updates an existing script.
func (s *RPCServer) UpdateScript(ctx context.Context,
	req *litrpc.UpdateScriptRequest) (*litrpc.UpdateScriptResponse, error) {

	script, err := s.manager.UpdateScript(ctx, req)
	if err != nil {
		return nil, err
	}

	return &litrpc.UpdateScriptResponse{
		Script: scriptToProto(script, false),
	}, nil
}

// DeleteScript deletes a script.
func (s *RPCServer) DeleteScript(ctx context.Context,
	req *litrpc.DeleteScriptRequest) (*litrpc.DeleteScriptResponse, error) {

	if err := s.manager.DeleteScript(ctx, req.Name, req.DeleteKvData); err != nil {
		return nil, err
	}

	return &litrpc.DeleteScriptResponse{}, nil
}

// GetScript retrieves a script by name.
func (s *RPCServer) GetScript(ctx context.Context,
	req *litrpc.GetScriptRequest) (*litrpc.GetScriptResponse, error) {

	script, isRunning, err := s.manager.GetScript(ctx, req.Name)
	if err != nil {
		return nil, err
	}
	if script == nil {
		return nil, fmt.Errorf("script not found: %s", req.Name)
	}

	return &litrpc.GetScriptResponse{
		Script: scriptToProto(script, isRunning),
	}, nil
}

// ListScripts returns all scripts.
func (s *RPCServer) ListScripts(ctx context.Context,
	req *litrpc.ListScriptsRequest) (*litrpc.ListScriptsResponse, error) {

	scripts, err := s.manager.ListScripts(ctx)
	if err != nil {
		return nil, err
	}

	protoScripts := make([]*litrpc.Script, len(scripts))
	for i, script := range scripts {
		isRunning := s.manager.IsScriptRunning(script.Name)
		protoScripts[i] = scriptToProto(script, isRunning)
	}

	return &litrpc.ListScriptsResponse{
		Scripts: protoScripts,
	}, nil
}

// StartScript starts a script execution.
func (s *RPCServer) StartScript(ctx context.Context,
	req *litrpc.StartScriptRequest) (*litrpc.StartScriptResponse, error) {

	execID, resultJSON, err := s.manager.StartScript(ctx, req.Name, req.ArgsJson)
	if err != nil {
		return nil, err
	}

	return &litrpc.StartScriptResponse{
		ExecutionId: execID,
		ResultJson:  resultJSON,
	}, nil
}

// StopScript stops a running script.
func (s *RPCServer) StopScript(ctx context.Context,
	req *litrpc.StopScriptRequest) (*litrpc.StopScriptResponse, error) {

	if err := s.manager.StopScript(ctx, req.Name); err != nil {
		return nil, err
	}

	return &litrpc.StopScriptResponse{}, nil
}

// ListRunningScripts returns all running scripts.
func (s *RPCServer) ListRunningScripts(ctx context.Context,
	req *litrpc.ListRunningScriptsRequest) (*litrpc.ListRunningScriptsResponse, error) {

	running, err := s.manager.ListRunningScripts(ctx)
	if err != nil {
		return nil, err
	}

	protoRunning := make([]*litrpc.RunningScript, len(running))
	for i, r := range running {
		protoRunning[i] = &litrpc.RunningScript{
			Name:        r.ScriptName,
			ExecutionId: uint64(r.ExecutionID),
			StartedAt:   uint64(r.StartedAt.Unix()),
		}
	}

	return &litrpc.ListRunningScriptsResponse{
		RunningScripts: protoRunning,
	}, nil
}

// ValidateScript validates a script without creating it.
func (s *RPCServer) ValidateScript(ctx context.Context,
	req *litrpc.ValidateScriptRequest) (*litrpc.ValidateScriptResponse, error) {

	result := s.manager.ValidateScriptSource(req.Source)

	return &litrpc.ValidateScriptResponse{
		Valid:    result.Valid,
		Error:    result.Error,
		Warnings: result.Warnings,
	}, nil
}

// GetExecutionHistory returns execution history.
func (s *RPCServer) GetExecutionHistory(ctx context.Context,
	req *litrpc.GetExecutionHistoryRequest) (*litrpc.GetExecutionHistoryResponse, error) {

	limit := req.Limit
	if limit == 0 {
		limit = 100
	}

	executions, err := s.manager.GetExecutionHistory(ctx, req.Name, limit, req.Offset)
	if err != nil {
		return nil, err
	}

	protoExecs := make([]*litrpc.ScriptExecution, len(executions))
	for i, exec := range executions {
		protoExecs[i] = executionToProto(exec)
	}

	return &litrpc.GetExecutionHistoryResponse{
		Executions: protoExecs,
	}, nil
}

// KVGet retrieves a value from the KV store.
func (s *RPCServer) KVGet(ctx context.Context,
	req *litrpc.KVGetRequest) (*litrpc.KVGetResponse, error) {

	bucket := req.Bucket
	if bucket == "" {
		return nil, fmt.Errorf("bucket is required")
	}

	value, found, err := s.kvStore.Get(bucket, req.Key)
	if err != nil {
		return nil, err
	}

	return &litrpc.KVGetResponse{
		Value: value,
		Found: found,
	}, nil
}

// KVPut stores a value in the KV store.
func (s *RPCServer) KVPut(ctx context.Context,
	req *litrpc.KVPutRequest) (*litrpc.KVPutResponse, error) {

	bucket := req.Bucket
	if bucket == "" {
		return nil, fmt.Errorf("bucket is required")
	}

	if err := s.kvStore.Put(bucket, req.Key, req.Value); err != nil {
		return nil, err
	}

	return &litrpc.KVPutResponse{}, nil
}

// KVDelete removes a value from the KV store.
func (s *RPCServer) KVDelete(ctx context.Context,
	req *litrpc.KVDeleteRequest) (*litrpc.KVDeleteResponse, error) {

	bucket := req.Bucket
	if bucket == "" {
		return nil, fmt.Errorf("bucket is required")
	}

	if err := s.kvStore.Delete(bucket, req.Key); err != nil {
		return nil, err
	}

	return &litrpc.KVDeleteResponse{}, nil
}

// KVList returns all keys in a bucket.
func (s *RPCServer) KVList(ctx context.Context,
	req *litrpc.KVListRequest) (*litrpc.KVListResponse, error) {

	bucket := req.Bucket
	if bucket == "" {
		return nil, fmt.Errorf("bucket is required")
	}

	keys, err := s.kvStore.List(bucket, req.Prefix)
	if err != nil {
		return nil, err
	}

	return &litrpc.KVListResponse{
		Keys: keys,
	}, nil
}

// scriptToProto converts a Script to its proto representation.
func scriptToProto(script *Script, isRunning bool) *litrpc.Script {
	return &litrpc.Script{
		Name:           script.Name,
		Description:    script.Description,
		Source:         script.Source,
		TimeoutSecs:    script.TimeoutSecs,
		MaxMemoryBytes: script.MaxMemoryBytes,
		AllowedUrls:    script.AllowedURLs,
		AllowedBuckets: script.AllowedBuckets,
		CreatedAt:      uint64(script.CreatedAt.Unix()),
		UpdatedAt:      uint64(script.UpdatedAt.Unix()),
		IsRunning:      isRunning,
	}
}

// executionToProto converts a ScriptExecution to its proto representation.
func executionToProto(exec *ScriptExecution) *litrpc.ScriptExecution {
	var endedAt uint64
	if !exec.EndedAt.IsZero() {
		endedAt = uint64(exec.EndedAt.Unix())
	}

	return &litrpc.ScriptExecution{
		Id:           uint64(exec.ID),
		ScriptName:   exec.ScriptName,
		StartedAt:    uint64(exec.StartedAt.Unix()),
		EndedAt:      endedAt,
		State:        exec.State,
		ResultJson:   exec.ResultJSON,
		ErrorMessage: exec.ErrorMessage,
		DurationMs:   uint64(exec.DurationMS),
	}
}
