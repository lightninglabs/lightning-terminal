module github.com/lightninglabs/lightning-terminal

require (
	github.com/btcsuite/btcd v0.22.0-beta.0.20211005184431-e3449998be39
	github.com/btcsuite/btclog v0.0.0-20170628155309-84c8d2346e9f
	github.com/btcsuite/btcutil v1.0.3-0.20210527170813-e2ba6805a890
	github.com/desertbit/timer v0.0.0-20180107155436-c41aec40b27f // indirect
	github.com/grpc-ecosystem/grpc-gateway/v2 v2.5.0
	github.com/improbable-eng/grpc-web v0.12.0
	github.com/jessevdk/go-flags v1.4.0
	github.com/lightninglabs/faraday v0.2.7-alpha
	github.com/lightninglabs/lightning-node-connect v0.1.4-alpha
	github.com/lightninglabs/lndclient v0.14.0-5
	github.com/lightninglabs/loop v0.15.1-beta
	github.com/lightninglabs/pool v0.5.2-alpha
	github.com/lightningnetwork/lnd v0.14.0-beta
	github.com/lightningnetwork/lnd/cert v1.1.0
	github.com/mwitkow/go-conntrack v0.0.0-20190716064945-2f068394615f
	github.com/mwitkow/grpc-proxy v0.0.0-20181017164139-0f1106ef9c76
	github.com/rs/cors v1.7.0 // indirect
	github.com/stretchr/testify v1.7.0
	go.etcd.io/bbolt v1.3.6
	golang.org/x/crypto v0.0.0-20210921155107-089bfa567519
	google.golang.org/grpc v1.39.0
	google.golang.org/protobuf v1.27.1
	gopkg.in/macaroon-bakery.v2 v2.1.0
	gopkg.in/macaroon.v2 v2.1.0
)

// A PR was merged without bumping the kvdb module version. We'll be able to
// remove this once lnd 0.14.1-beta is out.
replace github.com/lightningnetwork/lnd/kvdb => github.com/lightningnetwork/lnd/kvdb v1.2.1

// A PR was merged without bumping the auctioneerrpc module version. We'll be
// able to remove this once pool 0.5.3-alpha is out.
replace github.com/lightninglabs/pool/auctioneerrpc => github.com/lightninglabs/pool/auctioneerrpc v1.0.4

go 1.16
