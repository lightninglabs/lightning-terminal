#!/bin/bash

set -e

# Directory of the script file, independent of where it's called from.
DIR="$(cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd)"

echo "Building protobuf compiler docker image..."
docker build -q -t lit-protobuf-builder .

echo "Compiling and formatting *.proto files..."
docker run \
  --rm \
  --user $UID:$UID \
  -e UID=$UID \
  -v "$DIR/../:/build" \
  lit-protobuf-builder
