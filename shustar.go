package main

import (
	"fmt"
	"net"
	"net/http"
	_ "net/http/pprof" // register in DefaultServerMux
	"os"
	"time"

	"crypto/tls"

	"github.com/mwitkow/go-conntrack"
	"github.com/mwitkow/go-conntrack/connhelpers"
	"github.com/sirupsen/logrus"
	_ "golang.org/x/net/trace" // register in DefaultServerMux
)

func main() {
	config, err := loadConfig()
	if err != nil {
		logrus.Errorf("error loading config: %v", err)
		return
	}

	logrus.SetOutput(os.Stdout)
	logEntry := logrus.NewEntry(logrus.StandardLogger())

	errChan := make(chan error)

	lndGrpcServer := buildGrpcProxyServer(logEntry, config.LNDHost, true)
	loopGrpcServer := buildGrpcProxyServer(logEntry, config.LoopHost, false)
	staticFileServer := http.FileServer(http.Dir("./app/build"))

	httpHandler := func(resp http.ResponseWriter, req *http.Request) {
		if lndGrpcServer.IsGrpcWebRequest(req) {
			backend := req.Header.Get("X-Grpc-Backend")
			switch backend {
			case "lnd":
				logrus.Info("Handle LND GRPC request: ", req.URL.Path)
				lndGrpcServer.ServeHTTP(resp, req)
			case "loop":
				logrus.Info("Handle Loop GRPC request: ", req.URL.Path)
				loopGrpcServer.ServeHTTP(resp, req)
			default:
				resp.WriteHeader(500)
				resp.Write([]byte("HTTP header 'X-Grpc-Backend' is missing"))
			}
		} else {
			// fallback to static file hosting for client app
			logrus.Info("Handle static file request: ", req.URL.Path)
			staticFileServer.ServeHTTP(resp, req)
		}
	}
	httpServer := &http.Server{
		WriteTimeout: time.Second * 10,
		ReadTimeout:  time.Second * 10,
		Handler:      http.HandlerFunc(httpHandler),
	}
	httpListener := buildListenerOrFail("http", config.HTTPSListen)
	httpListener = tls.NewListener(httpListener, buildServerTLSOrFail(config))

	go func() {
		logrus.Infof("Listening for http_tls on: %v", httpListener.Addr().String())
		if err := httpServer.Serve(httpListener); err != nil {
			errChan <- fmt.Errorf("http_tls server error: %v", err)
		}
	}()

	<-errChan
}

func buildListenerOrFail(name string, addr string) net.Listener {
	listener, err := net.Listen("tcp", addr)
	if err != nil {
		logrus.Fatalf("failed listening for '%v' on %v: %v", name, addr, err)
	}
	return conntrack.NewListener(listener,
		conntrack.TrackWithName(name),
		conntrack.TrackWithTcpKeepAlive(20*time.Second),
		conntrack.TrackWithTracing(),
	)
}

func buildServerTLSOrFail(config *config) *tls.Config {
	tlsConfig, err := connhelpers.TlsConfigForServerCerts(config.TLSCertPath, config.TLSKeyPath)
	if err != nil {
		logrus.Fatalf("failed reading TLS server keys: %v", err)
	}
	tlsConfig.MinVersion = tls.VersionTLS12
	tlsConfig.ClientAuth = tls.NoClientCert
	tlsConfig, err = connhelpers.TlsConfigWithHttp2Enabled(tlsConfig)
	if err != nil {
		logrus.Fatalf("can't configure h2 handling: %v", err)
	}
	return tlsConfig
}
