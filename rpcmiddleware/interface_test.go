package rpcmiddleware

import (
	"fmt"
	"testing"

	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/stretchr/testify/require"
	"google.golang.org/protobuf/proto"
)

var (
	listPeersReq     = &lnrpc.ListPeersRequest{}
	listPeersReqType = listPeersReq.ProtoReflect().Type()

	listPeersResp     = &lnrpc.ListPeersResponse{}
	listPeersRespType = listPeersResp.ProtoReflect().Type()
)

// TestMessageTypeOf tests that parsing the fully qualified protobuf message
// type into its reflection type works correctly.
func TestMessageTypeOf(t *testing.T) {
	listPeersReqTypeParsed, err := MessageTypeOf("lnrpc.ListPeersRequest")
	require.NoError(t, err)
	require.Equal(t, listPeersReqType, listPeersReqTypeParsed)

	listPeersRespTypeParsed, err := MessageTypeOf("lnrpc.ListPeersResponse")
	require.NoError(t, err)
	require.Equal(t, listPeersRespType, listPeersRespTypeParsed)
}

// TestPassThrough tests that the pass through round trip checker behaves as
// expected.
func TestPassThrough(t *testing.T) {
	peersChecker := NewPassThrough(listPeersReq, listPeersResp)

	require.True(t, peersChecker.AcceptsRequest(listPeersReqType))
	require.True(t, peersChecker.HandlesResponse(listPeersRespType))
	require.Nil(t, peersChecker.HandleRequest(listPeersReq))

	resp, err := peersChecker.HandleResponse(listPeersResp)
	require.NoError(t, err)
	require.Nil(t, resp)

	require.False(t, peersChecker.AcceptsRequest(listPeersRespType))
	require.False(t, peersChecker.HandlesResponse(listPeersReqType))
}

// TestResponseRewriter tests that the response rewriter round trip checker
// behaves as expected.
func TestResponseRewriter(t *testing.T) {
	peersChecker := NewResponseRewriter(
		listPeersReq, listPeersResp,
		func(peer *lnrpc.ListPeersResponse) (proto.Message, error) {
			return peer, nil
		},
	)

	require.True(t, peersChecker.AcceptsRequest(listPeersReqType))
	require.True(t, peersChecker.HandlesResponse(listPeersRespType))
	require.Nil(t, peersChecker.HandleRequest(listPeersReq))

	resp, err := peersChecker.HandleResponse(listPeersResp)
	require.NoError(t, err)
	require.Equal(t, listPeersResp, resp)

	require.False(t, peersChecker.AcceptsRequest(listPeersRespType))
	require.False(t, peersChecker.HandlesResponse(listPeersReqType))
}

// TestFullChecker tests that the full checker round trip checker behaves as
// expected.
func TestFullChecker(t *testing.T) {
	myErr := fmt.Errorf("some error happened")
	peersChecker := NewFullChecker(
		listPeersReq, listPeersResp,
		func(peer *lnrpc.ListPeersRequest) error {
			return myErr
		},
		func(*lnrpc.ListPeersResponse) (proto.Message, error) {
			return nil, myErr
		},
	)

	require.True(t, peersChecker.AcceptsRequest(listPeersReqType))
	require.True(t, peersChecker.HandlesResponse(listPeersRespType))
	require.Equal(t, myErr, peersChecker.HandleRequest(listPeersReq))

	resp, err := peersChecker.HandleResponse(listPeersResp)
	require.Error(t, err)
	require.Equal(t, myErr, err)
	require.Nil(t, resp)

	require.False(t, peersChecker.AcceptsRequest(listPeersRespType))
	require.False(t, peersChecker.HandlesResponse(listPeersReqType))
}

// TestImplementationPanics makes sure implementation errors are caught with
// panics.
func TestImplementationPanics(t *testing.T) {
	require.PanicsWithError(
		t, "request handler must be a function", func() {
			_ = NewRequestChecker(
				listPeersReq, listPeersResp, "wrong",
			)
		},
	)
	require.PanicsWithError(
		t, "request handler must have exactly one parameter and one "+
			"return value",
		func() {
			_ = NewRequestChecker(
				listPeersReq, listPeersResp,
				func() error {
					return nil
				},
			)
		},
	)
	require.PanicsWithError(
		t, "response handler must be a function", func() {
			_ = NewResponseRewriter(
				listPeersReq, listPeersResp, "wrong",
			)
		},
	)
	require.PanicsWithError(
		t, "response handler must have exactly one parameter and two "+
			"return values",
		func() {
			_ = NewResponseRewriter(
				listPeersReq, listPeersResp,
				func() error {
					return nil
				},
			)
		},
	)
}
