# Start with a NodeJS base image that also contains yarn.
FROM node:12.17.0-buster as nodejsbuilder

RUN apt-get update && apt-get install -y \
  git \
  protobuf-compiler='3.6*' \
  clang-format='1:7.0*'

RUN mkdir /build

WORKDIR /build

CMD ["/bin/bash", "-c", "cd app && yarn install && yarn protos"]
