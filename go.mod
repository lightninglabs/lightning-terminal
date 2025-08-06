module github.com/lightninglabs/lightning-terminal

go 1.23.10

require (
	github.com/btcsuite/btcd v0.24.3-0.20250318170759-4f4ea81776d6
	github.com/btcsuite/btcd/btcec/v2 v2.3.4
	github.com/btcsuite/btcd/btcutil v1.1.5
	github.com/btcsuite/btcd/chaincfg/chainhash v1.1.0
	github.com/btcsuite/btclog/v2 v2.0.1-0.20250728225537-6090e87c6c5b
	github.com/btcsuite/btcwallet/walletdb v1.5.1
	github.com/davecgh/go-spew v1.1.1
	github.com/go-errors/errors v1.0.1
	github.com/golang-migrate/migrate/v4 v4.17.0
	github.com/grpc-ecosystem/grpc-gateway/v2 v2.22.0
	github.com/improbable-eng/grpc-web v0.12.0
	github.com/jackc/pgconn v1.14.3
	github.com/jackc/pgerrcode v0.0.0-20240316143900-6e2875d9b438
	github.com/jessevdk/go-flags v1.4.0
	github.com/lib/pq v1.10.9
	github.com/lightninglabs/faraday v0.2.16-alpha
	github.com/lightninglabs/faraday/frdrpc v1.0.1
	github.com/lightninglabs/lightning-node-connect/gbn v1.0.1
	github.com/lightninglabs/lightning-node-connect/mailbox v1.0.1
	github.com/lightninglabs/lightning-terminal/autopilotserverrpc v0.0.3
	github.com/lightninglabs/lightning-terminal/litrpc v1.0.2
	github.com/lightninglabs/lightning-terminal/perms v1.0.1
	github.com/lightninglabs/lndclient v0.19.0-12
	github.com/lightninglabs/loop v0.31.2-beta.0.20250730111713-3b0f6e84dc14
	github.com/lightninglabs/loop/looprpc v1.0.8
	github.com/lightninglabs/loop/swapserverrpc v1.0.15
	github.com/lightninglabs/pool v0.6.6-beta
	github.com/lightninglabs/pool/auctioneerrpc v1.1.3
	github.com/lightninglabs/pool/poolrpc v1.0.1
	github.com/lightninglabs/taproot-assets v0.6.1-0.20250806135252-08f114ecaa27
	github.com/lightninglabs/taproot-assets/taprpc v1.0.10-0.20250806135252-08f114ecaa27
	github.com/lightningnetwork/lnd v0.19.2-beta
	github.com/lightningnetwork/lnd/cert v1.2.2
	github.com/lightningnetwork/lnd/clock v1.1.1
	github.com/lightningnetwork/lnd/fn v1.2.5
	github.com/lightningnetwork/lnd/fn/v2 v2.0.8
	github.com/lightningnetwork/lnd/kvdb v1.4.16
	github.com/lightningnetwork/lnd/sqldb v1.0.11-0.20250623231731-45c15646c68b
	github.com/lightningnetwork/lnd/tlv v1.3.2
	github.com/lightningnetwork/lnd/tor v1.1.6
	github.com/mwitkow/go-conntrack v0.0.0-20190716064945-2f068394615f
	github.com/mwitkow/grpc-proxy v0.0.0-20230212185441-f345521cb9c9
	github.com/ory/dockertest/v3 v3.10.0
	github.com/pmezard/go-difflib v1.0.0
	github.com/stretchr/testify v1.10.0
	github.com/urfave/cli v1.22.14
	go.etcd.io/bbolt v1.3.11
	golang.org/x/crypto v0.37.0
	golang.org/x/exp v0.0.0-20240325151524-a685a6edb6d8
	golang.org/x/net v0.39.0
	golang.org/x/sync v0.13.0
	google.golang.org/grpc v1.65.0
	google.golang.org/protobuf v1.34.2
	gopkg.in/macaroon-bakery.v2 v2.3.0
	gopkg.in/macaroon.v2 v2.1.0
	modernc.org/sqlite v1.34.5
	pgregory.net/rapid v1.2.0
)

require (
	dario.cat/mergo v1.0.2 // indirect
	github.com/Azure/go-ansiterm v0.0.0-20230124172434-306776ec8161 // indirect
	github.com/Microsoft/go-winio v0.6.2 // indirect
	github.com/NebulousLabs/fastrand v0.0.0-20181203155948-6fb6489aac4e // indirect
	github.com/NebulousLabs/go-upnp v0.0.0-20180202185039-29b680b06c82 // indirect
	github.com/Nvveen/Gotty v0.0.0-20120604004816-cd527374f1e5 // indirect
	github.com/Yawning/aez v0.0.0-20211027044916-e49e68abd344 // indirect
	github.com/aead/chacha20 v0.0.0-20180709150244-8b13a72661da // indirect
	github.com/aead/siphash v1.0.1 // indirect
	github.com/andybalholm/brotli v1.0.4 // indirect
	github.com/beorn7/perks v1.0.1 // indirect
	github.com/btcsuite/btcd/btcutil/psbt v1.1.10 // indirect
	github.com/btcsuite/btclog v0.0.0-20241003133417-09c4e92e319c // indirect
	github.com/btcsuite/btcwallet v0.16.15-0.20250805011126-a3632ae48ab3 // indirect
	github.com/btcsuite/btcwallet/wallet/txauthor v1.3.5 // indirect
	github.com/btcsuite/btcwallet/wallet/txrules v1.2.2 // indirect
	github.com/btcsuite/btcwallet/wallet/txsizes v1.2.5 // indirect
	github.com/btcsuite/btcwallet/wtxmgr v1.5.6 // indirect
	github.com/btcsuite/go-socks v0.0.0-20170105172521-4720035b7bfd // indirect
	github.com/btcsuite/websocket v0.0.0-20150119174127-31079b680792 // indirect
	github.com/btcsuite/winsvc v1.0.0 // indirect
	github.com/caddyserver/certmagic v0.17.2 // indirect
	github.com/cenkalti/backoff/v4 v4.2.1 // indirect
	github.com/cespare/xxhash/v2 v2.3.0 // indirect
	github.com/containerd/continuity v0.3.0 // indirect
	github.com/coreos/go-semver v0.3.0 // indirect
	github.com/coreos/go-systemd v0.0.0-20191104093116-d3cd4ed1dbcf // indirect
	github.com/coreos/go-systemd/v22 v22.5.0 // indirect
	github.com/cpuguy83/go-md2man/v2 v2.0.2 // indirect
	github.com/decred/dcrd/crypto/blake256 v1.0.1 // indirect
	github.com/decred/dcrd/dcrec/secp256k1/v4 v4.3.0 // indirect
	github.com/decred/dcrd/lru v1.1.2 // indirect
	github.com/desertbit/timer v0.0.0-20180107155436-c41aec40b27f // indirect
	github.com/docker/cli v28.1.1+incompatible // indirect
	github.com/docker/docker v28.1.1+incompatible // indirect
	github.com/docker/go-connections v0.5.0 // indirect
	github.com/docker/go-units v0.5.0 // indirect
	github.com/dustin/go-humanize v1.0.1 // indirect
	github.com/fergusstrange/embedded-postgres v1.25.0 // indirect
	github.com/fortytw2/leaktest v1.3.0 // indirect
	github.com/go-logr/logr v1.4.2 // indirect
	github.com/go-logr/stdr v1.2.2 // indirect
	github.com/go-macaroon-bakery/macaroonpb v1.0.0 // indirect
	github.com/go-viper/mapstructure/v2 v2.3.0 // indirect
	github.com/goccy/go-yaml v1.15.23 // indirect
	github.com/gogo/protobuf v1.3.2 // indirect
	github.com/golang-jwt/jwt/v4 v4.5.2 // indirect
	github.com/golang/protobuf v1.5.4 // indirect
	github.com/golang/snappy v0.0.4 // indirect
	github.com/google/btree v1.0.1 // indirect
	github.com/google/shlex v0.0.0-20191202100458-e7afc7fbc510 // indirect
	github.com/google/uuid v1.6.0 // indirect
	github.com/gorilla/websocket v1.5.0 // indirect
	github.com/grpc-ecosystem/go-grpc-middleware v1.4.0 // indirect
	github.com/grpc-ecosystem/go-grpc-middleware/providers/prometheus v1.0.0-rc.0 // indirect
	github.com/grpc-ecosystem/go-grpc-middleware/v2 v2.0.0-rc.3 // indirect
	github.com/grpc-ecosystem/go-grpc-prometheus v1.2.0 // indirect
	github.com/grpc-ecosystem/grpc-gateway v1.16.0 // indirect
	github.com/hashicorp/errwrap v1.1.0 // indirect
	github.com/hashicorp/go-multierror v1.1.1 // indirect
	github.com/jackc/chunkreader/v2 v2.0.1 // indirect
	github.com/jackc/pgio v1.0.0 // indirect
	github.com/jackc/pgpassfile v1.0.0 // indirect
	github.com/jackc/pgproto3/v2 v2.3.3 // indirect
	github.com/jackc/pgservicefile v0.0.0-20240606120523-5a60cdf6a761 // indirect
	github.com/jackc/pgtype v1.14.4 // indirect
	github.com/jackc/pgx/v4 v4.18.3 // indirect
	github.com/jackc/pgx/v5 v5.7.4 // indirect
	github.com/jackc/puddle v1.3.0 // indirect
	github.com/jackc/puddle/v2 v2.2.2 // indirect
	github.com/jackpal/gateway v1.0.5 // indirect
	github.com/jackpal/go-nat-pmp v0.0.0-20170405195558-28a68d0c24ad // indirect
	github.com/jedib0t/go-pretty/v6 v6.2.7 // indirect
	github.com/jonboulle/clockwork v0.2.2 // indirect
	github.com/jrick/logrotate v1.1.2 // indirect
	github.com/json-iterator/go v1.1.12 // indirect
	github.com/kkdai/bstream v1.0.0 // indirect
	github.com/klauspost/compress v1.17.9 // indirect
	github.com/klauspost/cpuid/v2 v2.2.7 // indirect
	github.com/libdns/libdns v0.2.1 // indirect
	github.com/lightninglabs/aperture v0.3.13-beta // indirect
	github.com/lightninglabs/gozmq v0.0.0-20191113021534-d20a764486bf // indirect
	github.com/lightninglabs/lightning-node-connect/hashmailrpc v1.0.3 // indirect
	github.com/lightninglabs/neutrino v0.16.1 // indirect
	github.com/lightninglabs/neutrino/cache v1.1.2 // indirect
	github.com/lightningnetwork/lightning-onion v1.2.1-0.20240815225420-8b40adf04ab9 // indirect
	github.com/lightningnetwork/lnd/healthcheck v1.2.6 // indirect
	github.com/lightningnetwork/lnd/queue v1.1.1 // indirect
	github.com/lightningnetwork/lnd/ticker v1.1.1 // indirect
	github.com/ltcsuite/ltcd v0.0.0-20190101042124-f37f8bf35796 // indirect
	github.com/mattn/go-isatty v0.0.20 // indirect
	github.com/mattn/go-runewidth v0.0.13 // indirect
	github.com/matttproud/golang_protobuf_extensions v1.0.2-0.20181231171920-c182affec369 // indirect
	github.com/mholt/acmez v1.0.4 // indirect
	github.com/miekg/dns v1.1.50 // indirect
	github.com/moby/docker-image-spec v1.3.1 // indirect
	github.com/moby/sys/user v0.3.0 // indirect
	github.com/moby/term v0.5.0 // indirect
	github.com/modern-go/concurrent v0.0.0-20180306012644-bacd9c7ef1dd // indirect
	github.com/modern-go/reflect2 v1.0.2 // indirect
	github.com/ncruces/go-strftime v0.1.9 // indirect
	github.com/opencontainers/go-digest v1.0.0 // indirect
	github.com/opencontainers/image-spec v1.1.0 // indirect
	github.com/opencontainers/runc v1.2.0 // indirect
	github.com/pkg/errors v0.9.1 // indirect
	github.com/prometheus/client_golang v1.14.0 // indirect
	github.com/prometheus/client_model v0.4.0 // indirect
	github.com/prometheus/common v0.37.0 // indirect
	github.com/prometheus/procfs v0.8.0 // indirect
	github.com/remyoudompheng/bigfft v0.0.0-20230129092748-24d4a6f8daec // indirect
	github.com/rivo/uniseg v0.2.0 // indirect
	github.com/rogpeppe/fastuuid v1.2.0 // indirect
	github.com/rs/cors v1.7.0 // indirect
	github.com/russross/blackfriday/v2 v2.1.0 // indirect
	github.com/shopspring/decimal v1.3.1 // indirect
	github.com/sirupsen/logrus v1.9.3 // indirect
	github.com/soheilhy/cmux v0.1.5 // indirect
	github.com/spf13/pflag v1.0.5 // indirect
	github.com/stretchr/objx v0.5.2 // indirect
	github.com/syndtr/goleveldb v1.0.1-0.20210819022825-2ae1ddf74ef7 // indirect
	github.com/tmc/grpc-websocket-proxy v0.0.0-20201229170055-e5319fda7802 // indirect
	github.com/tv42/zbase32 v0.0.0-20160707012821-501572607d02 // indirect
	github.com/xeipuuv/gojsonpointer v0.0.0-20180127040702-4e3ac2762d5f // indirect
	github.com/xeipuuv/gojsonreference v0.0.0-20180127040603-bd5ef7bd5415 // indirect
	github.com/xeipuuv/gojsonschema v1.2.0 // indirect
	github.com/xi2/xz v0.0.0-20171230120015-48954b6210f8 // indirect
	github.com/xiang90/probing v0.0.0-20190116061207-43a291ad63a2 // indirect
	gitlab.com/yawning/bsaes.git v0.0.0-20190805113838-0a714cd429ec // indirect
	go.etcd.io/etcd/api/v3 v3.5.12 // indirect
	go.etcd.io/etcd/client/pkg/v3 v3.5.12 // indirect
	go.etcd.io/etcd/client/v2 v2.305.12 // indirect
	go.etcd.io/etcd/client/v3 v3.5.12 // indirect
	go.etcd.io/etcd/pkg/v3 v3.5.12 // indirect
	go.etcd.io/etcd/raft/v3 v3.5.12 // indirect
	go.etcd.io/etcd/server/v3 v3.5.12 // indirect
	go.opentelemetry.io/auto/sdk v1.1.0 // indirect
	go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc v0.49.0 // indirect
	go.opentelemetry.io/otel v1.36.0 // indirect
	go.opentelemetry.io/otel/exporters/otlp/otlptrace v1.29.0 // indirect
	go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc v1.20.0 // indirect
	go.opentelemetry.io/otel/metric v1.36.0 // indirect
	go.opentelemetry.io/otel/sdk v1.36.0 // indirect
	go.opentelemetry.io/otel/trace v1.36.0 // indirect
	go.opentelemetry.io/proto/otlp v1.3.1 // indirect
	go.uber.org/atomic v1.10.0 // indirect
	go.uber.org/mock v0.4.0 // indirect
	go.uber.org/multierr v1.6.0 // indirect
	go.uber.org/zap v1.23.0 // indirect
	golang.org/x/mod v0.21.0 // indirect
	golang.org/x/sys v0.33.0 // indirect
	golang.org/x/term v0.31.0 // indirect
	golang.org/x/text v0.24.0 // indirect
	golang.org/x/time v0.5.0 // indirect
	golang.org/x/tools v0.24.0 // indirect
	google.golang.org/genproto v0.0.0-20240213162025-012b6fc9bca9 // indirect
	google.golang.org/genproto/googleapis/api v0.0.0-20240814211410-ddb44dafa142 // indirect
	google.golang.org/genproto/googleapis/rpc v0.0.0-20240814211410-ddb44dafa142 // indirect
	gopkg.in/errgo.v1 v1.0.1 // indirect
	gopkg.in/natefinch/lumberjack.v2 v2.0.0 // indirect
	gopkg.in/yaml.v2 v2.4.0 // indirect
	gopkg.in/yaml.v3 v3.0.1 // indirect
	modernc.org/libc v1.55.3 // indirect
	modernc.org/mathutil v1.6.0 // indirect
	modernc.org/memory v1.8.0 // indirect
	nhooyr.io/websocket v1.8.7 // indirect
	sigs.k8s.io/yaml v1.2.0 // indirect
)

replace (
	github.com/lightninglabs/lightning-terminal/autopilotserverrpc => ./autopilotserverrpc
	github.com/lightninglabs/lightning-terminal/litrpc => ./litrpc
	github.com/lightninglabs/lightning-terminal/perms => ./perms
)

// We want to format raw bytes as hex instead of base64. The forked version
// allows us to specify that as an option. This is required for the
// taproot-assets dependency to function properly.
replace google.golang.org/protobuf => github.com/lightninglabs/protobuf-go-hex-display v1.34.2-hex-display

// We are using a fork of the migration library in tapd with custom
// functionality that did not yet make it into the upstream repository. Because
// it is a replace in the tapd repository, it doesn't get propagated here
// automatically, so we need to add it manually.
replace github.com/golang-migrate/migrate/v4 => github.com/lightninglabs/migrate/v4 v4.18.2-9023d66a-fork-pr-2

replace github.com/lightningnetwork/lnd => github.com/GeorgeTsagk/lnd v0.0.0-20250806121655-c98792e8a1c1

replace github.com/lightningnetwork/lnd/sqldb => github.com/GeorgeTsagk/lnd/sqldb v0.0.0-20250806121655-c98792e8a1c1

replace github.com/lightninglabs/lndclient => github.com/GeorgeTsagk/lndclient v0.0.0-20250806122136-d60d44f906c3
