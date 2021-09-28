module github.com/lightninglabs/lightning-terminal

require (
	github.com/btcsuite/btclog v0.0.0-20170628155309-84c8d2346e9f
	github.com/btcsuite/btcutil v1.0.3-0.20210527170813-e2ba6805a890
	github.com/desertbit/timer v0.0.0-20180107155436-c41aec40b27f // indirect
	github.com/grpc-ecosystem/grpc-gateway/v2 v2.5.0
	github.com/improbable-eng/grpc-web v0.12.0
	github.com/jessevdk/go-flags v1.4.0
	github.com/lightninglabs/faraday v0.2.6-alpha.0.20210921141539-6134fcb8f727
	github.com/lightninglabs/lndclient v0.14.0-0
	github.com/lightninglabs/loop v0.15.0-beta.0.20210921141505-4fb76c79442e
	github.com/lightninglabs/pool v0.5.1-alpha.0.20210921141413-04d77fd502ec
	github.com/lightningnetwork/lnd v0.13.0-beta.rc5.0.20210921132504-8d8db527237e
	github.com/lightningnetwork/lnd/cert v1.0.3
	github.com/mwitkow/go-conntrack v0.0.0-20190716064945-2f068394615f
	github.com/mwitkow/grpc-proxy v0.0.0-20181017164139-0f1106ef9c76
	github.com/rs/cors v1.7.0 // indirect
	golang.org/x/crypto v0.0.0-20201002170205-7f63de1d35b0
	google.golang.org/grpc v1.38.0
	google.golang.org/protobuf v1.26.0
	gopkg.in/macaroon-bakery.v2 v2.1.0
	gopkg.in/macaroon.v2 v2.1.0
)

replace github.com/lightningnetwork/lnd => github.com/orbitalturtle/lnd v0.12.0-beta.rc6.0.20210925024443-b77f6b9c5429

replace github.com/lightninglabs/pool => github.com/orbitalturtle/pool v0.4.4-alpha.0.20210924221022-7584bd9c4b5d

replace github.com/lightninglabs/faraday => github.com/orbitalturtle/faraday v0.2.3-alpha.0.20210926063130-bb6060dc67fe

replace github.com/lightninglabs/loop => github.com/orbitalturtle/loop v0.12.2-beta.0.20210927211637-7e694f01e26c

replace github.com/lightninglabs/lndclient => github.com/guggero/lndclient v0.11.0-2.0.20210921141129-268bfb6c4797

go 1.16
