VERSION_TAG = $(shell date +%Y%m%d)-01
VERSION_CHECK = @$(call print, "Building master with date version tag")

BUILD_SYSTEM = darwin-386 \
darwin-amd64 \
linux-386 \
linux-amd64 \
linux-armv6 \
linux-armv7 \
linux-arm64 \
windows-386 \
windows-amd64 \
windows-arm

LND_RELEASE_TAGS = grub autopilotrpc signrpc walletrpc chainrpc invoicesrpc watchtowerrpc

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
