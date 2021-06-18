module github.com/lightninglabs/lightning-terminal

require (
	github.com/btcsuite/btclog v0.0.0-20170628155309-84c8d2346e9f
	github.com/btcsuite/btcutil v1.0.3-0.20210527170813-e2ba6805a890
	github.com/desertbit/timer v0.0.0-20180107155436-c41aec40b27f // indirect
	github.com/grpc-ecosystem/grpc-gateway v1.14.6
	github.com/improbable-eng/grpc-web v0.12.0
	github.com/jessevdk/go-flags v1.4.0
	github.com/lightninglabs/faraday v0.2.6-alpha.0.20210618001847-0106012e5835
	github.com/lightninglabs/lndclient v0.12.0-8
	github.com/lightninglabs/loop v0.14.1-beta.0.20210618002526-df5924f25a33
	github.com/lightninglabs/pool v0.5.0-alpha.0.20210618001313-dfb86d6568c4
	github.com/lightningnetwork/lnd v0.13.0-beta
	github.com/lightningnetwork/lnd/cert v1.0.3
	github.com/mwitkow/go-conntrack v0.0.0-20190716064945-2f068394615f
	github.com/mwitkow/grpc-proxy v0.0.0-20181017164139-0f1106ef9c76
	github.com/prometheus/client_golang v1.5.1 // indirect
	github.com/rakyll/statik v0.1.7
	github.com/rs/cors v1.7.0 // indirect
	golang.org/x/crypto v0.0.0-20200709230013-948cd5f35899
	google.golang.org/grpc v1.29.1
	gopkg.in/macaroon-bakery.v2 v2.1.0
	gopkg.in/macaroon.v2 v2.1.0
)

// Fix incompatibility of etcd go.mod package.
// See https://github.com/etcd-io/etcd/issues/11154
replace go.etcd.io/etcd => go.etcd.io/etcd v0.5.0-alpha.5.0.20201125193152-8a03d2e9614b

go 1.16
