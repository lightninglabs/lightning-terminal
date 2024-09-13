# Start with a NodeJS base image that also contains yarn.
FROM node:22.8.0-bookworm as nodejsbuilder

RUN apt-get update && apt-get install -y \
  git \
  protobuf-compiler='3.21.12*' \
  clang-format='1:14.0*'

RUN mkdir /build

WORKDIR /build

CMD ["/bin/bash", "-c", "cd app && yarn install && yarn protos"]
