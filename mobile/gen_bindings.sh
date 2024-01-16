#!/bin/sh

mkdir -p build

# Check falafel version.
falafelVersion=$1
if [ -z $falafelVersion ]
then
        echo "falafel version not set"
        exit 1
fi

falafel=$(which falafel)
if [ $falafel ]
then
        version="v$($falafel -v)"
        if [ $version != $falafelVersion ]
        then
                echo "falafel version $falafelVersion required, had $version"
                exit 1
        fi
        echo "Using plugin $falafel $version"
else
        echo "falafel not found"
        exit 1
fi

# Name of the package for the generated APIs.
pkg="litdmobile"

# The package where the protobuf definitions originally are found.
litd_target_pkg="github.com/lightninglabs/lightning-terminal/litrpc"

lnd_target_pkg="github.com/lightningnetwork/lnd/lnrpc"
autopilot_target_pkg="github.com/lightningnetwork/lnd/lnrpc/autopilotrpc"
chain_target_pkg="github.com/lightningnetwork/lnd/lnrpc/chainrpc"
invoices_target_pkg="github.com/lightningnetwork/lnd/lnrpc/invoicesrpc"
neutrino_target_pkg="github.com/lightningnetwork/lnd/lnrpc/neutrinorpc"
router_target_pkg="github.com/lightningnetwork/lnd/lnrpc/routerrpc"
signer_target_pkg="github.com/lightningnetwork/lnd/lnrpc/signrpc"
wallet_target_pkg="github.com/lightningnetwork/lnd/lnrpc/walletrpc"
watchtower_target_pkg="github.com/lightningnetwork/lnd/lnrpc/watchtowerrpc"
watchtower_client_target_pkg="github.com/lightningnetwork/lnd/lnrpc/wtclientrpc"

loop_target_pkg="github.com/lightninglabs/loop/looprpc"
pool_target_pkg="github.com/lightninglabs/pool/poolrpc"

tapd_target_pkg="github.com/lightninglabs/taproot-assets/taprpc"
assetwallet_target_pkg="github.com/lightninglabs/taproot-assets/taprpc/assetwalletrpc"

# A mapping from grpc service to name of the custom listeners. The grpc server
# must be configured to listen on these.
listeners="accounts=lightningLis sessions=lightningLis proxy=lightningLis lightning=lightningLis walletunlocker=lightningLis state=lightningLis autopilot=lightningLis chainnotifier=lightningLis invoices=lightningLis neutrinokit=lightningLis peers=lightningLis router=lightningLis signer=lightningLis versioner=lightningLis walletkit=lightningLis watchtower=lightningLis watchtowerclient=lightningLis swapclient=lightningLis swapserver=lightningLis trader=lightningLis channelauctioneer=lightningLis taprootassets=lightningLis assetwallet=lightningLis"

# Set to 1 to create boiler plate grpc client code and listeners. If more than
# one proto file is being parsed, it should only be done once.
mem_rpc=1

LITD_PROTOS="lit-accounts.proto lit-sessions.proto proxy.proto"

LND_PROTOS="lnd.proto stateservice.proto walletunlocker.proto"
AUTOPILOT_PROTOS="autopilotrpc/autopilot.proto"
CHAIN_PROTOS="chainrpc/chainnotifier.proto"
INVOICES_PROTOS="invoicesrpc/invoices.proto"
NEUTRINO_PROTOS="neutrinorpc/neutrino.proto"
ROUTER_PROTOS="routerrpc/router.proto"
SIGNER_PROTOS="signrpc/signer.proto"
WALLET_PROTOS="walletrpc/walletkit.proto"
WATCHTOWER_PROTOS="watchtowerrpc/watchtower.proto"
WATCHTOWER_CLIENT_PROTOS="wtclientrpc/wtclient.proto"

LOOP_PROTOS="loop.proto looprpc/client.proto swapserverrpc/common.proto"

POOL_PROTOS="trader.proto auctioneerrpc/auctioneer.proto"

TAPD_PROTOS="taprootassets.proto assetwalletrpc/assetwallet.proto"

# If prefix=1 is specified, prefix the generated methods with subserver name.
# This must be enabled to support subservers with name conflicts.
use_prefix="0"
if [ "$SUBSERVER_PREFIX" = "1" ]
then
    echo "Prefixing methods with subserver name"
    use_prefix="1"
fi

litd_opts="package_name=$pkg,target_package=$litd_target_pkg,api_prefix=$use_prefix,listeners=$listeners,mem_rpc=$mem_rpc"

lnd_opts="package_name=$pkg,target_package=$lnd_target_pkg,api_prefix=0,listeners=$listeners,mem_rpc=$mem_rpc"
autopilot_opts="package_name=$pkg,target_package=$autopilot_target_pkg,api_prefix=$use_prefix,listeners=$listeners,mem_rpc=$mem_rpc"
chain_opts="package_name=$pkg,target_package=$chain_target_pkg,api_prefix=$use_prefix,listeners=$listeners,mem_rpc=$mem_rpc"
invoices_opts="package_name=$pkg,target_package=$invoices_target_pkg,api_prefix=$use_prefix,listeners=$listeners,mem_rpc=$mem_rpc"
neutrino_opts="package_name=$pkg,target_package=$neutrino_target_pkg,api_prefix=$use_prefix,listeners=$listeners,mem_rpc=$mem_rpc"
router_opts="package_name=$pkg,target_package=$router_target_pkg,api_prefix=$use_prefix,listeners=$listeners,mem_rpc=$mem_rpc"
signer_opts="package_name=$pkg,target_package=$signer_target_pkg,api_prefix=$use_prefix,listeners=$listeners,mem_rpc=$mem_rpc"
wallet_opts="package_name=$pkg,target_package=$wallet_target_pkg,api_prefix=$use_prefix,listeners=$listeners,mem_rpc=$mem_rpc"
watchtower_opts="package_name=$pkg,target_package=$watchtower_target_pkg,api_prefix=$use_prefix,listeners=$listeners,mem_rpc=$mem_rpc"
watchtower_client_opts="package_name=$pkg,target_package=$watchtower_client_target_pkg,api_prefix=$use_prefix,listeners=$listeners,mem_rpc=$mem_rpc"

loop_opts="package_name=$pkg,target_package=$loop_target_pkg,api_prefix=$use_prefix,listeners=$listeners,mem_rpc=$mem_rpc"
pool_opts="package_name=$pkg,target_package=$pool_target_pkg,api_prefix=$use_prefix,listeners=$listeners,mem_rpc=$mem_rpc"
auctioneer_opts="package_name=$pkg,target_package=$auctioneer_target_pkg,api_prefix=$use_prefix,listeners=$listeners,mem_rpc=$mem_rpc"
tapd_opts="package_name=$pkg,target_package=$tapd_target_pkg,api_prefix=$use_prefix,listeners=$listeners,mem_rpc=$mem_rpc"
assetwallet_opts="package_name=$pkg,target_package=$assetwallet_target_pkg,api_prefix=$use_prefix,listeners=$listeners,mem_rpc=$mem_rpc"

for file in $LITD_PROTOS; do
  echo "Generating mobile protos from ${file}"

  protoc -I/usr/local/include -I. \
         --plugin=protoc-gen-custom=$falafel\
         --custom_out=./build \
         --custom_opt="$litd_opts" \
         --proto_path=../proto \
         "${file}"
done

for file in $LND_PROTOS; do
  echo "Generating mobile protos from ${file}"

  protoc -I/usr/local/include -I. \
         --plugin=protoc-gen-custom=$falafel\
         --custom_out=./build \
         --custom_opt="$lnd_opts" \
         --proto_path=../proto \
         "${file}"
done

for file in $AUTOPILOT_PROTOS; do
  echo "Generating mobile protos from ${file}"

  protoc -I/usr/local/include -I. \
         --plugin=protoc-gen-custom=$falafel\
         --custom_out=./build \
         --custom_opt="$autopilot_opts" \
         --proto_path=../proto \
         "${file}"
done

for file in $CHAIN_PROTOS; do
  echo "Generating mobile protos from ${file}"

  protoc -I/usr/local/include -I. \
         --plugin=protoc-gen-custom=$falafel\
         --custom_out=./build \
         --custom_opt="$chain_opts" \
         --proto_path=../proto \
         "${file}"
done

for file in $INVOICES_PROTOS; do
  echo "Generating mobile protos from ${file}"

  protoc -I/usr/local/include -I. \
         --plugin=protoc-gen-custom=$falafel\
         --custom_out=./build \
         --custom_opt="$invoices_opts" \
         --proto_path=../proto \
         "${file}"
done

for file in $NEUTRINO_PROTOS; do
  echo "Generating mobile protos from ${file}"

  protoc -I/usr/local/include -I. \
         --plugin=protoc-gen-custom=$falafel\
         --custom_out=./build \
         --custom_opt="$neutrino_opts" \
         --proto_path=../proto \
         "${file}"
done

for file in $ROUTER_PROTOS; do
  echo "Generating mobile protos from ${file}"

  protoc -I/usr/local/include -I. \
         --plugin=protoc-gen-custom=$falafel\
         --custom_out=./build \
         --custom_opt="$router_opts" \
         --proto_path=../proto \
         "${file}"
done

for file in $SIGNER_PROTOS; do
  echo "Generating mobile protos from ${file}"

  protoc -I/usr/local/include -I. \
         --plugin=protoc-gen-custom=$falafel\
         --custom_out=./build \
         --custom_opt="$signer_opts" \
         --proto_path=../proto \
         "${file}"
done

for file in $WALLET_PROTOS; do
  echo "Generating mobile protos from ${file}"

  protoc -I/usr/local/include -I. \
         --plugin=protoc-gen-custom=$falafel\
         --custom_out=./build \
         --custom_opt="$wallet_opts" \
         --proto_path=../proto \
         "${file}"
done

for file in $WATCHTOWER_PROTOS; do
  echo "Generating mobile protos from ${file}"

  protoc -I/usr/local/include -I. \
         --plugin=protoc-gen-custom=$falafel\
         --custom_out=./build \
         --custom_opt="$watchtower_opts" \
         --proto_path=../proto \
         "${file}"
done

for file in $WATCHTOWER_CLIENT_PROTOS; do
  echo "Generating mobile protos from ${file}"

  protoc -I/usr/local/include -I. \
         --plugin=protoc-gen-custom=$falafel\
         --custom_out=./build \
         --custom_opt="$watchtower_client_opts" \
         --proto_path=../proto \
         "${file}"
done

for file in $LOOP_PROTOS; do
  echo "Generating mobile protos from ${file}"

  protoc -I/usr/local/include -I. \
         --plugin=protoc-gen-custom=$falafel\
         --custom_out=./build \
         --custom_opt="$loop_opts" \
         --proto_path=../proto \
         "${file}"
done

for file in $POOL_PROTOS; do
  echo "Generating mobile protos from ${file}"

  protoc -I/usr/local/include -I. \
         --plugin=protoc-gen-custom=$falafel\
         --custom_out=./build \
         --custom_opt="$pool_opts" \
         --proto_path=../proto \
         "${file}"
done

# for file in $TAPD_PROTOS; do
echo "Generating mobile protos from taprootassets.proto"
protoc -I/usr/local/include -I. \
        --plugin=protoc-gen-custom=$falafel\
        --custom_out=./build \
        --custom_opt="$tapd_opts" \
        --proto_path=../proto \
        taprootassets.proto

echo "Generating mobile protos from assetwalletrpc/assetwallet.proto"
protoc -I/usr/local/include -I. \
        --plugin=protoc-gen-custom=$falafel\
        --custom_out=./build \
        --custom_opt="$assetwallet_opts" \
        --proto_path=../proto \
        assetwalletrpc/assetwallet.proto
# done

# TODO update protoc command to avoid this replace hack
sed -i '12i	"github.com/lightningnetwork/lnd/lnrpc/signrpc"' ./walletkit_api_generated.go
sed -i '12i	"github.com/lightninglabs/pool/auctioneerrpc"' ./trader_api_generated.go
sed -i '14i "github.com/lightninglabs/taproot-assets/taprpc/assetwalletrpc"' ./assetwallet_api_generated.go

trader_replacements="BatchSnapshotRequest BatchSnapshotsRequest"
for call in $trader_replacements; do
  echo "Making replacements for trader_api_generated.go: ${call}"
  sed -i "s/poolrpc.${call}/auctioneerrpc.${call}/g" ./trader_api_generated.go
done

echo "Making replacements for channelauctioneer_api_generated.go"
sed -i "s/poolrpc/auctioneerrpc/g" ./channelauctioneer_api_generated.go

# Run goimports to resolve any dependencies among the sub-servers.
goimports -w ./*_generated.go
