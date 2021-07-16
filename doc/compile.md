## Compile from Source Code

To compile from source code, you'll need to have some prerequisite developer tooling
installed on your machine.

| Dependency                                          | Description                                                                                                                                                                          |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [golang](https://golang.org/doc/install)            | LiT's backend web server is written in Go. The minimum version supported is Go v1.16.                                                                                                |
| [nodejs](https://nodejs.org/en/download/)           | LiT's frontend is written in TypeScript and built on top of the React JS web framework. To bundle the assets into Javascript & CSS compatible with web browsers, NodeJS is required. |
| [yarn](https://classic.yarnpkg.com/en/docs/install) | A popular package manager for NodeJS application dependencies.                                                                                                                        |

Once you have the necessary prerequisites, LiT can be compiled by running the following
commands:

```shell script
$ git clone https://github.com/lightninglabs/lightning-terminal.git
$ cd lightning-terminal
$ make install
```

This will produce the `litd` executable and add it to your `GOPATH`. The CLI binaries for
`lncli`, `loop`, `pool`, and `frcli` are not created by `make install`. You will
need to download those binaries from the
[lnd](https://github.com/lightningnetwork/lnd/releases),
[loop](https://github.com/lightninglabs/loop/releases),
[pool](https://github.com/lightninglabs/pool/releases), and
[faraday](https://github.com/lightninglabs/faraday/releases) repos manually.

## Building a docker image

There are two flavors of Dockerfiles available:
 - `Dockerfile`: Used for production builds. Checks out the source code from
   GitHub during build. The build argument `--build-arg checkout=v0.x.x-alpha`
   can be used to specify what git tag or commit to check out before building.
 - `dev.Dockerfile` Used for development or testing builds. Uses the local code
   when building and allows local changes to be tested more easily.

### Building a development docker image

Follow the instructions of the [previous chapter](#compile-from-source-code) to
install all necessary dependencies.

Then, instead of `make install` run the following commands:

```shell script
$ docker build -f dev.Dockerfile -t my-lit-dev-image .
```

If successful, you can then run the docker image with:

```shell script
$ docker run -p 8443:8443 --rm --name litd my-lit-dev-image \
  --httpslisten=0.0.0.0:8443 \
  ... (your configuration flags here)
```

See the [execution section in the main README](../README.md#execution) to find
out what configuration flags to use.

### Building a production docker image

To create a production build, you need to specify the git tag to create the
image from. All local files will be ignored, everything is cloned and built from
GitHub so you don't need to install any dependencies:

```shell script
$ docker build -t lightninglabs/lightning-terminal --build-arg checkout=v0.3.2-alpha .
```

### Compiling gRPC proto files

When the gRPC protocol buffer definition files for `lnd` or `loop` are
updated with new releases, the [generated](../src/types/generated/) JS/TS files should be
updated as well. This should only be done when the versions of the daemons packaged in
Terminal are updated.

To compile the proto files into JS/TS code, follow the following steps:

1. Install `docker` if you do not already have it installed. Follow the
   instructions in [this guide](https://docs.docker.com/get-docker/).

1. Run the following command to download the proto files from each repo and
   compile the JS/TS code using the updated protos.
   ```shell
   $ make protos
   ```
1. Fix any typing, linting, or unit test failures introduced by the update. Run the
   commands below to find and fix these errors in the app code.
   ```shell script
   $ cd app
   $ yarn tsc
   $ yarn lint
   $ yarn test:ci
   ```
1. Once all errors have been resolved, commit your changes and open a PR
