package main

import (
	"crypto/tls"

	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	grpc_logrus "github.com/grpc-ecosystem/go-grpc-middleware/logging/logrus"
	grpc_prometheus "github.com/grpc-ecosystem/go-grpc-prometheus"
	"github.com/improbable-eng/grpc-web/go/grpcweb"
	"github.com/mwitkow/grpc-proxy/proxy"
	"github.com/sirupsen/logrus"
	"golang.org/x/net/context"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
	"google.golang.org/grpc/metadata"
)

func buildGrpcProxyServer(logger *logrus.Entry, grpcAddr string, secure bool) *grpcweb.WrappedGrpcServer {
	// gRPC-wide changes.
	grpc.EnableTracing = true
	grpc_logrus.ReplaceGrpcLogger(logger)

	// gRPC proxy logic.
	backendConn := dialBackendOrFail(grpcAddr, secure)
	director := func(ctx context.Context, fullMethodName string) (context.Context, *grpc.ClientConn, error) {
		md, _ := metadata.FromIncomingContext(ctx)
		outCtx, _ := context.WithCancel(ctx)
		mdCopy := md.Copy()

		delete(mdCopy, "user-agent")
		// If this header is present in the request from the web client,
		// the actual connection to the backend will not be established.
		// https://github.com/improbable-eng/grpc-web/issues/568
		delete(mdCopy, "connection")
		outCtx = metadata.NewOutgoingContext(outCtx, mdCopy)
		return outCtx, backendConn, nil
	}
	// Server with logging and monitoring enabled.
	grpcServer := grpc.NewServer(
		grpc.CustomCodec(proxy.Codec()), // needed for proxy to function.
		grpc.UnknownServiceHandler(proxy.TransparentHandler(director)),
		// The current maximum receive msg size per https://github.com/grpc/grpc-go/blob/v1.8.2/server.go#L54
		grpc.MaxRecvMsgSize(1024*1024*4),
		grpc_middleware.WithUnaryServerChain(
			grpc_logrus.UnaryServerInterceptor(logger),
			grpc_prometheus.UnaryServerInterceptor,
		),
		grpc_middleware.WithStreamServerChain(
			grpc_logrus.StreamServerInterceptor(logger),
			grpc_prometheus.StreamServerInterceptor,
		),
	)
	options := []grpcweb.Option{
		grpcweb.WithCorsForRegisteredEndpointsOnly(false),
		grpcweb.WithOriginFunc(func(origin string) bool {
			// allow all CORS requests
			return true
		}),
	}

	return grpcweb.WrapServer(grpcServer, options...)
}

func dialBackendOrFail(grpcAddr string, secure bool) *grpc.ClientConn {
	opt := []grpc.DialOption{}
	opt = append(opt, grpc.WithCodec(proxy.Codec()))

	if secure {
		tlsConfig := &tls.Config{}
		tlsConfig.MinVersion = tls.VersionTLS12
		tlsConfig.InsecureSkipVerify = true
		opt = append(opt, grpc.WithTransportCredentials(credentials.NewTLS(tlsConfig)))
	} else {
		opt = append(opt, grpc.WithInsecure())
	}

	opt = append(opt,
		grpc.WithDefaultCallOptions(grpc.MaxCallRecvMsgSize(1024*1024*4)),
		grpc.WithBackoffMaxDelay(grpc.DefaultBackoffConfig.MaxDelay),
	)

	logrus.Infof("Dialing backend GRPC server at %s", grpcAddr)
	cc, err := grpc.Dial(grpcAddr, opt...)
	if err != nil {
		logrus.Fatalf("failed dialing backend: %v", err)
	}
	return cc
}
