#!/usr/bin/env bash

# Abort on error (-e) and print commands (-v).
set -ev

# See README.md in lnrpc (of the lnd repository) why we need these specific
# versions/commits.
PROTOC_VERSION=3.4.0

# This script is specific to GitHub Actions so we only need to support linux x64.
PROTOC_URL="https://github.com/protocolbuffers/protobuf/releases/download/v${PROTOC_VERSION}/protoc-${PROTOC_VERSION}-linux-x86_64.zip"

# install_protoc copies the cached protoc binary to the $PATH or downloads it
# if no cached version is found.
install_protoc() {
  if [ -f "${PROTOC_DL_CACHE_DIR}/bin/protoc" ]; then
    echo "Using cached version of protoc"
  else
    wget -O /tmp/protoc.zip $PROTOC_URL
    mkdir -p "${PROTOC_DL_CACHE_DIR}"
    unzip -o /tmp/protoc.zip -d "${PROTOC_DL_CACHE_DIR}"
    chmod -R a+rx "${PROTOC_DL_CACHE_DIR}/"
  fi
  sudo cp "${PROTOC_DL_CACHE_DIR}/bin/protoc" /usr/local/bin
  sudo cp -r "${PROTOC_DL_CACHE_DIR}/include" /usr/local
}

install_protoc
