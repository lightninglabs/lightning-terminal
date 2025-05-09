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
FROM golang:1.23.6-alpine@sha256:f8113c4b13e2a8b3a168dceaee88ac27743cc84e959f43b9dbd2291e9c3f57a0 as golangbuilder

# Instead of checking out from git again, we just copy the whole working
# directory of the previous stage that includes the generated static assets.
COPY --from=nodejsbuilder /go/src/github.com/lightninglabs/lightning-terminal /go/src/github.com/lightninglabs/lightning-terminal

# Force Go to use the cgo based DNS resolver. This is required to ensure DNS
# queries required to connect to linked containers succeed.
ENV GODEBUG netdns=cgo

# Allow forcing a specific taproot-assets version through a build argument.
# Please see https://go.dev/ref/mod#version-queries for the types of
# queries that can be used to define a version.
ARG TAPROOT_ASSETS_VERSION

# Need to restate this since running in a new container from above.
ARG NO_UI

# Install dependencies and install/build lightning-terminal.
RUN apk add --no-cache --update alpine-sdk make \
  && cd /go/src/github.com/lightninglabs/lightning-terminal \
  # If a custom taproot-assets version is supplied, force it now.
  && if [ -n "$TAPROOT_ASSETS_VERSION" ]; then \
    go get -v github.com/lightninglabs/taproot-assets@$TAPROOT_ASSETS_VERSION \
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
FROM alpine:3.20.3@sha256:beefdbd8a1da6d2915566fde36db9db0b524eb737fc57cd1367effd16dc0d06d as final

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
