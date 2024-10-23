#!/bin/bash

set -e

# Directory of the script file, independent of where it's called from.
DIR="$(cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd)"

echo "Building app compiler docker image..."
docker build -q -t lit-app-builder .

echo "Compiling app files..."
docker run \
  --rm \
  --user $(id -u):$(id -g) \
  -v "$DIR/../:/build" \
  lit-app-builder
