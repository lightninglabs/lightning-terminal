FROM golang:1.15.5-alpine as builder

# Copy in the local repository to build from.
COPY . /go/src/github.com/lightninglabs/lightning-terminal

# Force Go to use the cgo based DNS resolver. This is required to ensure DNS
# queries required to connect to linked containers succeed.
ENV GODEBUG netdns=cgo

# Explicitly turn on the use of modules (until this becomes the default).
ENV GO111MODULE on

ENV NODE_VERSION=v12.17.0

# Install dependencies and install/build lightning-terminal.
RUN apk add --no-cache --update alpine-sdk \
    git \
    make \
    curl \
    bash \
    binutils \
    tar \
    protobuf-dev \
&& touch ~/.bashrc \
&& curl -sfSLO https://unofficial-builds.nodejs.org/download/release/${NODE_VERSION}/node-${NODE_VERSION}-linux-x64-musl.tar.xz \
&& tar -xf node-${NODE_VERSION}-linux-x64-musl.tar.xz -C /usr --strip 1 \
&& rm node-${NODE_VERSION}-linux-x64-musl.tar.xz \
&& curl -o- -L https://yarnpkg.com/install.sh | bash \
&& . ~/.bashrc \
&&  cd /go/src/github.com/lightninglabs/lightning-terminal \
&&  make install \
&& go install -v -trimpath github.com/lightningnetwork/lnd/cmd/lncli \
&& go install -v -trimpath github.com/lightninglabs/faraday/cmd/frcli \
&& go install -v -trimpath github.com/lightninglabs/loop/cmd/loop \
&& go install -v -trimpath github.com/lightninglabs/pool/cmd/pool

# Start a new, final image to reduce size.
FROM alpine as final

# Define a root volume for data persistence.
VOLUME /root/.lnd

# Expose lightning-terminal and lnd ports (server, rpc).
EXPOSE 8443 10009 9735

# Copy the binaries and entrypoint from the builder image.
COPY --from=builder /go/bin/litd /bin/
COPY --from=builder /go/bin/lncli /bin/
COPY --from=builder /go/bin/frcli /bin/
COPY --from=builder /go/bin/loop /bin/
COPY --from=builder /go/bin/pool /bin/

# Add bash.
RUN apk add --no-cache \
    bash \
    jq \
    ca-certificates

# Specify the start command and entrypoint as the lightning-terminal daemon.
ENTRYPOINT ["litd"]
