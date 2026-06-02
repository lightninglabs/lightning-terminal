FROM golang:1.25.10-bookworm@sha256:154bd7001b6eb339e88c964442c0ad6ed5e53f09844cc818a41ce4ecb3ce3b43

RUN apt-get update && apt-get install -y git
ENV GOCACHE=/tmp/build/.cache
ENV GOMODCACHE=/tmp/build/.modcache
ENV GOFLAGS="-buildvcs=false"

COPY . /tmp/tools

RUN cd /tmp \
  && mkdir -p /tmp/build/.cache \
  && mkdir -p /tmp/build/.modcache \
  && cd /tmp/tools \
  && CGO_ENABLED=0 go install -trimpath github.com/golangci/golangci-lint/cmd/golangci-lint \
  && CGO_ENABLED=0 golangci-lint custom \
  && mv ./custom-gcl /usr/local/bin/custom-gcl \
  && chmod -R 777 /tmp/build/ 

WORKDIR /build
