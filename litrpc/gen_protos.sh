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

    # Only generate JSON/WASM stubs if requested.
    if [[ "$1" == "no-wasm" ]]; then
      return
    fi

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
generate no-wasm
popd