package rpcmiddleware

import (
	"context"
	"fmt"
	"testing"

	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/stretchr/testify/require"
	"google.golang.org/protobuf/proto"
)

var (
	ctxb = context.Background()

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

	require.True(t, peersChecker.HandlesRequest(listPeersReqType))
	require.True(t, peersChecker.HandlesResponse(listPeersRespType))

	req, err := peersChecker.HandleRequest(ctxb, listPeersReq)
	require.NoError(t, err)
	require.Nil(t, req)

	resp, err := peersChecker.HandleResponse(ctxb, listPeersResp)
	require.NoError(t, err)
	require.Nil(t, resp)

	require.False(t, peersChecker.HandlesRequest(listPeersRespType))
	require.False(t, peersChecker.HandlesResponse(listPeersReqType))
}

// TestRequestDenier tests that the request denier round trip checker behaves as
// expected.
func TestRequestDenier(t *testing.T) {
	peersChecker := NewRequestDenier(listPeersReq, listPeersResp)

	require.True(t, peersChecker.HandlesRequest(listPeersReqType))
	require.True(t, peersChecker.HandlesResponse(listPeersRespType))

	req, err := peersChecker.HandleRequest(ctxb, listPeersReq)
	require.ErrorIs(t, err, ErrNotSupported)
	require.Nil(t, req)

	resp, err := peersChecker.HandleResponse(ctxb, listPeersResp)
	require.ErrorIs(t, err, ErrNotSupported)
	require.Nil(t, resp)

	require.False(t, peersChecker.HandlesRequest(listPeersRespType))
	require.False(t, peersChecker.HandlesResponse(listPeersReqType))
}

// TestRequestChecker tests that the request checker round trip checker
// behaves as expected.
func TestRequestChecker(t *testing.T) {
	peersChecker := NewRequestChecker(
		listPeersReq, listPeersResp,
		func(context.Context, *lnrpc.ListPeersRequest) error {
			return nil
		},
	)

	require.True(t, peersChecker.HandlesRequest(listPeersReqType))
	require.True(t, peersChecker.HandlesResponse(listPeersRespType))

	req, err := peersChecker.HandleRequest(ctxb, listPeersReq)
	require.NoError(t, err)
	require.Nil(t, req)

	resp, err := peersChecker.HandleResponse(ctxb, listPeersResp)
	require.NoError(t, err)
	require.Nil(t, resp)

	require.False(t, peersChecker.HandlesRequest(listPeersRespType))
	require.False(t, peersChecker.HandlesResponse(listPeersReqType))
}

// TestRequestRewriter tests that the request rewriter round trip checker
// behaves as expected.
func TestRequestRewriter(t *testing.T) {
	peersChecker := NewRequestRewriter(
		listPeersReq, listPeersResp,
		func(ctx context.Context,
			peer *lnrpc.ListPeersRequest) (proto.Message, error) {

			return peer, nil
		},
	)

	require.True(t, peersChecker.HandlesRequest(listPeersReqType))
	require.True(t, peersChecker.HandlesResponse(listPeersRespType))

	req, err := peersChecker.HandleRequest(ctxb, listPeersReq)
	require.NoError(t, err)
	require.Equal(t, listPeersReq, req)

	resp, err := peersChecker.HandleResponse(ctxb, listPeersResp)
	require.NoError(t, err)
	require.Nil(t, resp)

	require.False(t, peersChecker.HandlesRequest(listPeersRespType))
	require.False(t, peersChecker.HandlesResponse(listPeersReqType))
}

// TestResponseRewriter tests that the response rewriter round trip checker
// behaves as expected.
func TestResponseRewriter(t *testing.T) {
	peersChecker := NewResponseRewriter(
		listPeersReq, listPeersResp,
		func(ctx context.Context,
			peer *lnrpc.ListPeersResponse) (proto.Message, error) {

			return peer, nil
		}, PassThroughErrorHandler,
	)

	require.True(t, peersChecker.HandlesRequest(listPeersReqType))
	require.True(t, peersChecker.HandlesResponse(listPeersRespType))

	req, err := peersChecker.HandleRequest(ctxb, listPeersReq)
	require.NoError(t, err)
	require.Nil(t, req)

	resp, err := peersChecker.HandleResponse(ctxb, listPeersResp)
	require.NoError(t, err)
	require.Equal(t, listPeersResp, resp)

	require.False(t, peersChecker.HandlesRequest(listPeersRespType))
	require.False(t, peersChecker.HandlesResponse(listPeersReqType))
}

// TestFullChecker tests that the full checker round trip checker behaves as
// expected.
func TestFullChecker(t *testing.T) {
	myErr := fmt.Errorf("some error happened")
	peersChecker := NewFullChecker(
		listPeersReq, listPeersResp,
		func(ctx context.Context, peer *lnrpc.ListPeersRequest) error {
			return myErr
		},
		func(context.Context, *lnrpc.ListPeersResponse) (proto.Message,
			error) {

			return nil, myErr
		}, PassThroughErrorHandler,
	)

	require.True(t, peersChecker.HandlesRequest(listPeersReqType))
	require.True(t, peersChecker.HandlesResponse(listPeersRespType))

	_, err := peersChecker.HandleRequest(ctxb, listPeersReq)
	require.Equal(t, myErr, err)

	resp, err := peersChecker.HandleResponse(ctxb, listPeersResp)
	require.Error(t, err)
	require.Equal(t, myErr, err)
	require.Nil(t, resp)

	require.False(t, peersChecker.HandlesRequest(listPeersRespType))
	require.False(t, peersChecker.HandlesResponse(listPeersReqType))
}

// TestFullRewriter tests that the full re-writer round trip checker behaves as
// expected.
func TestFullRewriter(t *testing.T) {
	myErr := fmt.Errorf("some error happened")
	peersChecker := NewFullRewriter(
		listPeersReq, listPeersResp,
		func(ctx context.Context,
			peer *lnrpc.ListPeersRequest) (proto.Message, error) {

			return nil, myErr
		},
		func(context.Context, *lnrpc.ListPeersResponse) (proto.Message,
			error) {

			return nil, myErr
		}, PassThroughErrorHandler,
	)

	require.True(t, peersChecker.HandlesRequest(listPeersReqType))
	require.True(t, peersChecker.HandlesResponse(listPeersRespType))

	_, err := peersChecker.HandleRequest(ctxb, listPeersReq)
	require.Equal(t, myErr, err)

	resp, err := peersChecker.HandleResponse(ctxb, listPeersResp)
	require.Error(t, err)
	require.Equal(t, myErr, err)
	require.Nil(t, resp)

	require.False(t, peersChecker.HandlesRequest(listPeersRespType))
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
		t, "request handler must have exactly two parameter and one "+
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
		t, "message handler must be a function", func() {
			_ = NewRequestRewriter(
				listPeersReq, listPeersResp, "wrong",
			)
		},
	)
	require.PanicsWithError(
		t, "message handler must have exactly two parameter and two "+
			"return values",
		func() {
			_ = NewRequestRewriter(
				listPeersReq, listPeersResp,
				func() error {
					return nil
				},
			)
		},
	)
	require.PanicsWithError(
		t, "message handler must be a function", func() {
			_ = NewResponseRewriter(
				listPeersReq, listPeersResp, "wrong",
				PassThroughErrorHandler,
			)
		},
	)
	require.PanicsWithError(
		t, "message handler must have exactly two parameter and two "+
			"return values",
		func() {
			_ = NewResponseRewriter(
				listPeersReq, listPeersResp,
				func() error {
					return nil
				}, PassThroughErrorHandler,
			)
		},
	)
}
