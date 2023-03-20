FROM golang:1.19.4-buster

RUN apt-get update && apt-get install -y \
  git \
  protobuf-compiler='3.6*' \
  clang-format='1:7.0*'

# We don't want any default values for these variables to make sure they're
# explicitly provided by parsing the go.mod file. Otherwise we might forget to
# update them here if we bump the versions.
ARG PROTOBUF_VERSION
ARG GRPC_GATEWAY_VERSION

ENV PROTOC_GEN_GO_GRPC_VERSION="v1.1.0"
ENV FALAFEL_VERSION="v0.9.1"

RUN cd /tmp \
  && go install google.golang.org/protobuf/cmd/protoc-gen-go@${PROTOBUF_VERSION} \
  && go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@${PROTOC_GEN_GO_GRPC_VERSION} \
  && go install github.com/grpc-ecosystem/grpc-gateway/v2/protoc-gen-grpc-gateway@${GRPC_GATEWAY_VERSION} \
  && go install github.com/grpc-ecosystem/grpc-gateway/v2/protoc-gen-openapiv2@${GRPC_GATEWAY_VERSION} \
  && go install github.com/lightninglabs/falafel@${FALAFEL_VERSION}

WORKDIR /build

CMD ["/bin/bash", "/build/litrpc/gen_protos.sh"]
