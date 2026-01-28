include make/compile_flags.mk

# Create a globally-consistent, build-input identifier.
VERSION_TAG = $(shell git describe --abbrev=40 --broken --tags --always --match 'v*')
VERSION_CHECK = @$(call print, "Building master with date version tag")

DOCKER_RELEASE_HELPER = docker run \
  -it \
  --rm \
  --user $(shell id -u):$(shell id -g) \
  -v $(shell pwd):/tmp/build/litd \
  -v $(shell bash -c "go env GOCACHE || (mkdir -p /tmp/go-cache; echo /tmp/go-cache)"):/tmp/build/.cache \
  -v $(shell bash -c "go env GOMODCACHE || (mkdir -p /tmp/go-modcache; echo /tmp/go-modcache)"):/tmp/build/.modcache \
  -e SKIP_VERSION_CHECK \
  litd-release-helper

BUILD_SYSTEM = darwin-amd64 \
darwin-arm64 \
linux-386 \
linux-amd64 \
linux-armv6 \
linux-armv7 \
linux-arm64 \
windows-amd64

LND_RELEASE_TAGS = litd $(COMPILE_TAGS)

# By default we will build all systems. But with the 'sys' tag, a specific
# system can be specified. This is useful to release for a subset of
# systems/architectures.
ifneq ($(sys),)
BUILD_SYSTEM = $(sys)
endif

# Use all build tags by default but allow them to be overwritten.
ifneq ($(tags),)
LND_RELEASE_TAGS = $(tags)
endif
