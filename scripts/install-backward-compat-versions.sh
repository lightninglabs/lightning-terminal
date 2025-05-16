#!/bin/bash

# Build and install older versions of `litd` for backward compatibility
# integration tests.
#
# Usage:
#   ./scripts/install-backward-compat-versions.sh "<version1> <version2> ..."
#
# Example:
#   ./scripts/install-backward-compat-versions.sh "v0.12.0-beta v0.14.1-alpha"
#
# Parameters:
#   $1        Space-separated list of `litd` versions to install (required).
#
# Environment Variables:
#   REPO_URL  URL of the litd repository (defaults to:
#             https://github.com/lightninglabs/lightning-terminal.git)
#
# Notes:
#   - Each version will be installed under a version-specific path.

set -ex

VERSIONS="$1"
REPO_URL="${REPO_URL:-https://github.com/lightninglabs/lightning-terminal.git}"

# Make sure at least one version is set.
if [[ -z "${VERSIONS}" ]]; then
  echo "Usage: $0 '<version1> <version2> ...'"
  echo "Please provide at least one version to install."
  exit 1
fi

# Directory of the script file, independent of where it's called from.
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

ITEST_DIR="${DIR}/../itest"
TARGET_DIR="${ITEST_DIR}/backward-compat"

mkdir -p "${TARGET_DIR}" && cd "${TARGET_DIR}"

# First, make sure we've cloned each version of litd.
for VERSION in ${VERSIONS}; do
  VERSION_DIR="${TARGET_DIR}/litd-${VERSION}"

  # Check if the version is already installed.
  if [[ -f "${VERSION_DIR}/Makefile" ]]; then
    echo "Version ${VERSION} is already installed."
    continue
  fi

  # Clone the specified version of litd.
  echo "Installing litd ${VERSION} to ${VERSION_DIR}..."
  git clone ${REPO_URL} --depth 1 -b "$VERSION" "${VERSION_DIR}"
done

# Build the itest binary for each version.
for VERSION in ${VERSIONS}; do
  VERSION_DIR="${TARGET_DIR}/litd-${VERSION}"
  SRC="${VERSION_DIR}/itest/litd-itest"
  DST="${ITEST_DIR}/litd-itest-${VERSION}"

  if [[ -f "${DST}" ]]; then
    echo "Binary ${DST} is already available, skipping build."
    continue
  fi

  echo "Building litd ${VERSION}..."
  cd "${VERSION_DIR}"
  
  # The Makefile was changed a bit, but the "itest-only" target that skips the
  # frontend build has existed for a while. We use it to build the itest binary
  # (but don't actually run the tests).
  make itest-only icase=nothing
  
  # Copy the resulting binary to the main itest directory.
  echo "Copying ${SRC} to ${DST}"
  cp "${SRC}" "${DST}"
done

