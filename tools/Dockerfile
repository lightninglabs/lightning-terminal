FROM golang:1.23.12-bookworm@sha256:d22457a90736648a605cf54c33a7a310bb290e1ac78af2bcbc1d87821c52c4b7

RUN apt-get update && apt-get install -y git
ENV GOCACHE=/tmp/build/.cache
ENV GOMODCACHE=/tmp/build/.modcache
ENV GOFLAGS="-buildvcs=false"

COPY . /tmp/tools

RUN cd /tmp \
  && mkdir -p /tmp/build/.cache \
  && mkdir -p /tmp/build/.modcache \
  && cd /tmp/tools \
  && go install -trimpath github.com/golangci/golangci-lint/cmd/golangci-lint \
  && chmod -R 777 /tmp/build/ 

WORKDIR /build
