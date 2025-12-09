FROM golang:1.24.9-bookworm@sha256:e400aebe4e96e1d52b510fb7a82c417d9377f595f0160eb1bd979d441711d20c

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
