# Start with a NodeJS base image that also contains yarn.
FROM node:22.8.0-alpine@sha256:bec0ea49c2333c429b62e74e91f8ba1201b060110745c3a12ff957cd51b363c6 as nodejsbuilder

# Install dependencies to build the app
RUN apk add --no-cache --update git

# Copy in the local repository to build from.
COPY . /go/src/github.com/lightninglabs/lightning-terminal

RUN cd /go/src/github.com/lightninglabs/lightning-terminal/app \
  && yarn install \
  && yarn build

# The first stage is already done and all static assets should now be generated
# in the app/build sub directory.
FROM golang:1.22.6-alpine@sha256:1a478681b671001b7f029f94b5016aed984a23ad99c707f6a0ab6563860ae2f3 as golangbuilder

# Instead of checking out from git again, we just copy the whole working
# directory of the previous stage that includes the generated static assets.
COPY --from=nodejsbuilder /go/src/github.com/lightninglabs/lightning-terminal /go/src/github.com/lightninglabs/lightning-terminal

# Force Go to use the cgo based DNS resolver. This is required to ensure DNS
# queries required to connect to linked containers succeed.
ENV GODEBUG netdns=cgo

# allow forcing a specific taproot-assets version through a build argument
# see https://go.dev/ref/mod#version-queries for the types of queries that can be used to define a version
ARG TAPROOT_ASSETS_VERSION

# Install dependencies and install/build lightning-terminal.
RUN apk add --no-cache --update alpine-sdk make \
  && cd /go/src/github.com/lightninglabs/lightning-terminal \
  # if custom taproot-assets version supplied, apply it
  && if [ -n "$TAPROOT_ASSETS_VERSION" ]; then \
    go get -v github.com/lightninglabs/taproot-assets@$TAPROOT_ASSETS_VERSION \
    && go mod tidy; \
  fi \
  && make go-install \
  && make go-install-cli

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
