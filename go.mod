module github.com/lightninglabs/shushtar

require (
	github.com/btcsuite/btclog v0.0.0-20170628155309-84c8d2346e9f
	github.com/desertbit/timer v0.0.0-20180107155436-c41aec40b27f // indirect
	github.com/gorilla/websocket v1.4.2 // indirect
	github.com/grpc-ecosystem/grpc-gateway v1.12.2
	github.com/improbable-eng/grpc-web v0.12.0
	github.com/jessevdk/go-flags v1.4.0
	github.com/lightninglabs/faraday v0.1.0-alpha.0.20200518080657-d3726a59507c
	github.com/lightninglabs/loop v0.6.2-beta.0.20200528104150-c281cab8a036
	github.com/lightningnetwork/lnd v0.10.1-beta.rc1
	github.com/lightningnetwork/lnd/cert v1.0.2
	github.com/mwitkow/go-conntrack v0.0.0-20190716064945-2f068394615f
	github.com/mwitkow/grpc-proxy v0.0.0-20181017164139-0f1106ef9c76
	github.com/prometheus/client_golang v1.5.1 // indirect
	github.com/rakyll/statik v0.1.7
	github.com/rs/cors v1.7.0 // indirect
	golang.org/x/crypto v0.0.0-20200510223506-06a226fb4e37
	golang.org/x/net v0.0.0-20200324143707-d3edc9973b7e // indirect
	golang.org/x/sys v0.0.0-20200406155108-e3b113bbe6a4 // indirect
	google.golang.org/grpc v1.28.0
	gopkg.in/macaroon-bakery.v2 v2.1.0
	gopkg.in/macaroon.v2 v2.1.0
)

// Manually solve the conflict between loop's lndclient version of lnd and what
// we explicitly need for the unified binary to work.
replace github.com/lightningnetwork/lnd => github.com/lightningnetwork/lnd v0.10.0-beta.rc6.0.20200528052558-24c865450a77

// Needed because lnd now imports the etcd client which doesn't follow the go
// mod guidelines. Unfortunately replace directives from dependency projects
// aren't picked up so we need to specify this here and in lnd.
replace github.com/coreos/go-systemd => github.com/coreos/go-systemd/v22 v22.0.0

go 1.13
