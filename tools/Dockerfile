FROM golang:1.25.11-bookworm@sha256:b96f24a8d7d010ea0acb9c3ba99064740f02b6b984612b28bd3c9c5ab9453e38

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
