# Start with a NodeJS base image that also contains yarn.
FROM node:16.14.2-alpine as nodejsbuilder

# Copy in the local repository to build from.
COPY . /go/src/github.com/lightninglabs/lightning-terminal

RUN cd /go/src/github.com/lightninglabs/lightning-terminal/app \
  && yarn install \
  && yarn build

# The first stage is already done and all static assets should now be generated
# in the app/build sub directory.
# If you change this value, please also update:
# /Dockerfile
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
  && make go-install \
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
