# Start with a NodeJS base image that also contains yarn.
FROM node:16.14.2-alpine as nodejsbuilder

# Pass a tag, branch or a commit using build-arg. This allows a docker image to
# be built from a specified Git state. The default image will use the Git tip of
# master by default.
ARG checkout="master"

# The public URL the static files should be served under. This must be empty to
# work for the root path (/).
ARG public_url=""

# There seem to be multiple problems when using yarn for a build inside of a
# docker image:
#   1. For building and installing node-gyp, python is required. This seems to
#      be missing from the NodeJS base image for ARM builds (or is just required
#      when building for ARM?).
#   2. Because of a problem in the docker internal network on ARM, some TCP
#      packages are being dropped and the yarn installation times out. This can
#      be mitigated by switching to HTTP and increasing the network timeout.
#      See https://github.com/yarnpkg/yarn/issues/5259 for more info.
RUN apk add --no-cache --update alpine-sdk \
  git \
  && git clone https://github.com/lightninglabs/lightning-terminal /go/src/github.com/lightninglabs/lightning-terminal \
  && cd /go/src/github.com/lightninglabs/lightning-terminal \
  && git checkout $checkout \
  && cd app \
  && npm config set registry "http://registry.npmjs.org" \
  && yarn config set registry "http://registry.npmjs.org" \
  && yarn install --frozen-lockfile --network-timeout 1000000 \
  && PUBLIC_URL=$public_url yarn build

# The first stage is already done and all static assets should now be generated
# in the app/build sub directory.
# If you change this value, please also update:
# /dev.Dockerfile
# /.github/workflows/main.yml
FROM golang:1.21-alpine as golangbuilder

# Instead of checking out from git again, we just copy the whole working
# directory of the previous stage that includes the generated static assets.
COPY --from=nodejsbuilder /go/src/github.com/lightninglabs/lightning-terminal /go/src/github.com/lightninglabs/lightning-terminal

# Force Go to use the cgo based DNS resolver. This is required to ensure DNS
# queries required to connect to linked containers succeed.
ENV GODEBUG netdns=cgo

# Install dependencies and install/build lightning-terminal.
RUN apk add --no-cache --update alpine-sdk \
  make \
  && cd /go/src/github.com/lightninglabs/lightning-terminal \
  && make go-install PUBLIC_URL=$public_url \
  && make go-install-cli

# Start a new, final image to reduce size.
FROM alpine as final

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
