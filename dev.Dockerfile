# Start with a NodeJS base image that also contains yarn.
FROM node:22.8.0-alpine@sha256:bec0ea49c2333c429b62e74e91f8ba1201b060110745c3a12ff957cd51b363c6 as nodejsbuilder

# Install dependencies to build the app
RUN apk add --no-cache --update git

# Copy in the local repository to build from.
COPY . /go/src/github.com/lightninglabs/lightning-terminal

# Set to 1 to enable this option and skip build of the web UI.
ARG NO_UI

RUN cd /go/src/github.com/lightninglabs/lightning-terminal/app \
  && if [ "$NO_UI" -eq "1" ]; then \
    echo "skipping UI build";\
  else \
    yarn install \
    && yarn build; \
  fi

# The first stage is already done and all static assets should now be generated
# in the app/build sub directory.
FROM golang:1.24.6-alpine3.22@sha256:c8c5f95d64aa79b6547f3b626eb84b16a7ce18a139e3e9ca19a8c078b85ba80d as golangbuilder

# Instead of checking out from git again, we just copy the whole working
# directory of the previous stage that includes the generated static assets.
COPY --from=nodejsbuilder /go/src/github.com/lightninglabs/lightning-terminal /go/src/github.com/lightninglabs/lightning-terminal

# Force Go to use the cgo based DNS resolver. This is required to ensure DNS
# queries required to connect to linked containers succeed.
ENV GODEBUG netdns=cgo

# Allow forcing a specific lnd, taproot-assets, taprpc, and/or loop repo so that
# commits referenced by LND_VERSION, TAPROOT_ASSETS_VERSION, TAPRPC_VERSION, and
# LOOP_VERSION don't have to exist in the default repository. If any of these
# build arguments are not defined, the build continues using the default
# repository for that module. NOTE: If these arguments ARE defined then the
# corresponding `_VERSION` argument MUST also be defined, otherwise the build
# continues using the default repository defined for that module.
ARG LND_REPO
ARG TAPROOT_ASSETS_REPO
ARG TAPRPC_REPO
ARG LOOP_REPO

# Allow forcing a specific lnd, taproot-assets, taprpc, and/or loop version
# through a build argument.
# Please see https://go.dev/ref/mod#version-queries for the types of
# queries that can be used to define a version.
# If any of these build arguments are not defined then build uses the version
# already defined in go.mod and go.sum for that module.
# Note: If the corresponding `_REPO` argument is not defined, `go get` will
# be used along with `go mod tidy`, which sometimes may change the version you
# are trying to use because some other module requires the same requirement
# but of a different version. A trick to overcome this is to also use the
# `_REPO` argument and just put in the default repository for that module and
# that will cause a `go mod edit -replace=` to be used instead which won't have
# this issue.
ARG LND_VERSION
ARG TAPROOT_ASSETS_VERSION
ARG TAPRPC_VERSION
ARG LOOP_VERSION

# Need to restate this since running in a new container from above.
ARG NO_UI

# Allow defining the CGO_ENABLED variable so we can build binaries
# that will work in a different type of container.
# `go` assumes `CGO_ENABLED=1` if not defined, but we make it explicit here
# to be more clear of the default value.
ARG CGO_ENABLED=1

# Install dependencies and install/build lightning-terminal.
RUN apk add --no-cache --update alpine-sdk make \
  && cd /go/src/github.com/lightninglabs/lightning-terminal \
  # If a custom lnd version is supplied, force it now.
  && if [ -n "$LND_VERSION" ]; then \
    # If a custom lnd repo is supplied, force it now.
    if [ -n "$LND_REPO" ]; then \
      go mod edit -replace=github.com/lightningnetwork/lnd=$LND_REPO@$LND_VERSION; \
    else \
      go get -v github.com/lightningnetwork/lnd@$LND_VERSION; \
    fi \
    && go mod tidy; \
  fi \
  # If a custom taproot-assets version is supplied, force it now.
  && if [ -n "$TAPROOT_ASSETS_VERSION" ]; then \
    # If a custom taproot-assets repo is supplied, force it now.
    if [ -n "$TAPROOT_ASSETS_REPO" ]; then \
      go mod edit -replace=github.com/lightninglabs/taproot-assets=$TAPROOT_ASSETS_REPO@$TAPROOT_ASSETS_VERSION; \
    else \
      go get -v github.com/lightninglabs/taproot-assets@$TAPROOT_ASSETS_VERSION; \
    fi \
    && go mod tidy; \
  fi \
  # If a custom taprpc version is supplied, force it now.
  && if [ -n "$TAPRPC_VERSION" ]; then \
    # If a custom taprpc repo is supplied, force it now.
    if [ -n "$TAPRPC_REPO" ]; then \
      go mod edit -replace=github.com/lightninglabs/taproot-assets/taprpc=$TAPRPC_REPO@$TAPRPC_VERSION; \
    else \
      go get -v github.com/lightninglabs/taproot-assets/taprpc@$TAPRPC_VERSION; \
    fi \
    && go mod tidy; \
  fi \
  # If a custom loop version is supplied, force it now.
  && if [ -n "$LOOP_VERSION" ]; then \
    # If a custom loop repo is supplied, force it now.
    if [ -n "$LOOP_REPO" ]; then \
      go mod edit -replace=github.com/lightninglabs/loop=$LOOP_REPO@$LOOP_VERSION; \
    else \
      go get -v github.com/lightninglabs/loop@$LOOP_VERSION; \
    fi \
    && go mod tidy; \
  fi \
  && if [ "$NO_UI" -eq "1" ]; then \
    make go-install-noui \
    && make go-install-cli-noui; \
  else \
    make go-install \
    && make go-install-cli; \
  fi

# Start a new, final image to reduce size.
FROM alpine:3.22.1@sha256:4bcff63911fcb4448bd4fdacec207030997caf25e9bea4045fa6c8c44de311d1 as final

# Define a root volume for data persistence.
VOLUME /root/.lnd

# Expose lightning-terminal and lnd ports (server, rpc).
EXPOSE 8443 10009 9735

# Copy the binaries and entrypoint from the builder image.
COPY --from=golangbuilder /go/bin/litd /bin/
COPY --from=golangbuilder /go/bin/litcli /bin/
COPY --from=golangbuilder /go/bin/lncli /bin/
COPY --from=golangbuilder /go/bin/frcli /bin/
COPY --from=golangbuilder /go/bin/loop /bin/
COPY --from=golangbuilder /go/bin/pool /bin/
COPY --from=golangbuilder /go/bin/tapcli /bin/

# Add bash.
RUN apk add --no-cache \
  bash \
  jq \
  ca-certificates

# Specify the start command and entrypoint as the lightning-terminal daemon.
ENTRYPOINT ["litd"]
