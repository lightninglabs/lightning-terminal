# Start with a NodeJS base image that also contains yarn.
FROM node:22.8.0-bookworm@sha256:bd00c03095f7586432805dbf7989be10361d27987f93de904b1fc003949a4794 as nodejsbuilder

RUN apt-get update && apt-get install -y \
  git \
  protobuf-compiler='3.21.12*' \
  clang-format='1:14.0*'

RUN mkdir /build

WORKDIR /build

CMD ["/bin/bash", "-c", "cd app && yarn install && yarn protos"]
