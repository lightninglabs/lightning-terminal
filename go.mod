module github.com/lightninglabs/lightning-terminal

require (
	github.com/btcsuite/btcd v0.23.1
	github.com/btcsuite/btcd/btcec/v2 v2.2.0
	github.com/btcsuite/btcd/btcutil v1.1.1
	github.com/btcsuite/btcd/chaincfg/chainhash v1.0.1
	github.com/btcsuite/btclog v0.0.0-20170628155309-84c8d2346e9f
	github.com/desertbit/timer v0.0.0-20180107155436-c41aec40b27f // indirect
	github.com/go-errors/errors v1.0.1
	github.com/grpc-ecosystem/grpc-gateway/v2 v2.5.0
	github.com/improbable-eng/grpc-web v0.12.0
	github.com/jessevdk/go-flags v1.4.0
	github.com/lightninglabs/faraday v0.2.7-alpha.0.20220503144421-cd1e56982f09
	github.com/lightninglabs/lightning-node-connect v0.1.11-alpha
	github.com/lightninglabs/lndclient v0.15.0-9
	github.com/lightninglabs/loop v0.19.1-beta.0.20220623090540-08209f61e304
	github.com/lightninglabs/loop/swapserverrpc v1.0.1
	github.com/lightninglabs/pool v0.5.6-alpha.0.20220620074824-76bac184b501
	github.com/lightninglabs/pool/auctioneerrpc v1.0.7
	github.com/lightninglabs/protobuf-hex-display v1.4.3-hex-display
	github.com/lightningnetwork/lnd v0.15.0-beta.rc6
	github.com/lightningnetwork/lnd/cert v1.1.1
	github.com/lightningnetwork/lnd/tlv v1.0.3
	github.com/mwitkow/go-conntrack v0.0.0-20190716064945-2f068394615f
	github.com/mwitkow/grpc-proxy v0.0.0-20181017164139-0f1106ef9c76
	github.com/rs/cors v1.7.0 // indirect
	github.com/stretchr/testify v1.7.1
	github.com/urfave/cli v1.22.4
	go.etcd.io/bbolt v1.3.6
	golang.org/x/crypto v0.0.0-20211215153901-e495a2d5b3d3
	golang.org/x/net v0.0.0-20211216030914-fe4d6282115f
	golang.org/x/sync v0.0.0-20210220032951-036812b2e83c
	google.golang.org/grpc v1.39.0
	google.golang.org/protobuf v1.27.1
	gopkg.in/macaroon-bakery.v2 v2.1.0
	gopkg.in/macaroon.v2 v2.1.0
)

go 1.16
