FROM golang:1.25.10-bookworm@sha256:154bd7001b6eb339e88c964442c0ad6ed5e53f09844cc818a41ce4ecb3ce3b43

MAINTAINER Olaoluwa Osuntokun <laolu@lightning.engineering>

# Golang build related environment variables that are static and used for all
# architectures/OSes.
ENV GODEBUG netdns=cgo
ENV GO111MODULE=auto
ENV CGO_ENABLED=0

# Set up cache directories. Those will be mounted from the host system to speed
# up builds. If go isn't installed on the host system, those will fall back to
# temp directories during the build (see make/release_flags.mk).
ENV GOCACHE=/tmp/build/.cache
ENV GOMODCACHE=/tmp/build/.modcache

RUN apt-get update && apt-get install -y \
    git \
    make \
    tar \
    zip \
    bash \
  && mkdir -p /tmp/build/litd \
  && mkdir -p /tmp/build/.cache \
  && mkdir -p /tmp/build/.modcache \
  && chmod -R 777 /tmp/build/

WORKDIR /tmp/build/litd
