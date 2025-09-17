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

# Allow forcing a specific lnd, taproot-assets, and taprpc version through a
# build argument.
# Please see https://go.dev/ref/mod#version-queries for the types of
# queries that can be used to define a version.
ARG LND_VERSION
ARG TAPROOT_ASSETS_VERSION
ARG TAPRPC_VERSION

# Need to restate this since running in a new container from above.
ARG NO_UI

# Install dependencies and install/build lightning-terminal.
RUN apk add --no-cache --update alpine-sdk make \
  && cd /go/src/github.com/lightninglabs/lightning-terminal \
  # If a custom lnd version is supplied, force it now.
  && if [ -n "$LND_VERSION" ]; then \
    go get -v github.com/lightningnetwork/lnd@$LND_VERSION \
    && go mod tidy; \
  fi \
  # If a custom taproot-assets version is supplied, force it now.
  && if [ -n "$TAPROOT_ASSETS_VERSION" ]; then \
    go get -v github.com/lightninglabs/taproot-assets@$TAPROOT_ASSETS_VERSION \
    && go mod tidy; \
  fi \
  # If a custom taprpc version is supplied, force it now.
  && if [ -n "$TAPRPC_VERSION" ]; then \
    go get -v github.com/lightninglabs/taproot-assets/taprpc@$TAPRPC_VERSION \
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
