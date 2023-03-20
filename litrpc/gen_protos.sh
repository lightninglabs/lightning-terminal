#!/bin/bash

set -e

# generate compiles the *.pb.go stubs from the *.proto files.
function generate() {
  for file in ./*.proto; do
    # Generate the gRPC bindings for all proto files.
    protoc -I. -I.. \
      --go_out . --go_opt paths=source_relative \
      --go-grpc_out . --go-grpc_opt paths=source_relative \
      "${file}"

    # Only generate REST stubs if requested.
    if [[ "$1" == "no-rest" ]]; then
      continue
    fi

    # Generate the REST reverse proxy.
    annotationsFile=${file//proto/yaml}
    protoc -I/usr/local/include -I. -I.. \
      --grpc-gateway_out . \
      --grpc-gateway_opt logtostderr=true \
      --grpc-gateway_opt paths=source_relative \
      --grpc-gateway_opt grpc_api_configuration=${annotationsFile} \
      "${file}"

    # Finally, generate the swagger file which describes the REST API in detail.
    protoc -I/usr/local/include -I. -I.. \
      --openapiv2_out . \
      --openapiv2_opt logtostderr=true \
      --openapiv2_opt grpc_api_configuration=${annotationsFile} \
      --openapiv2_opt json_names_for_fields=false \
      "${file}"

    # Generate the JSON/WASM autopilot stubs.
    falafel=$(which falafel)
    pkg="litrpc"
    opts="package_name=$pkg,js_stubs=1"
    protoc -I. -I.. \
      --plugin=protoc-gen-custom=$falafel\
      --custom_out=. \
      --custom_opt="$opts" \
      "${file}"
  done
}

# format formats the *.proto files with the clang-format utility.
function format() {
  find . -name "*.proto" -print0 | xargs -0 clang-format --style=file -i
}

# Compile and format the litrpc package.
pushd litrpc
format
generate
popd

pushd autopilotserverrpc
format
generate no-rest
popd