## Compile from Source Code

To compile from source code, you'll need to have some prerequisite developer tooling
installed on your machine.

| Dependency                                          | Description                                                                                                                                                                          |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [golang](https://golang.org/doc/install)            | LiT's backend web server is written in Go. The minimum version supported is Go v1.13.                                                                                                |
| [protoc](https://grpc.io/docs/protoc-installation/) | Required to compile LND & Loop gRPC proto files at build time.                                                                                                                        |
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
`lncli`, `loop`, and `frcli` are not created by `make install`. You will need to download
those binaries from the [lnd](https://github.com/lightningnetwork/lnd/releases),
[loop](https://github.com/lightninglabs/loop/releases), and
[faraday](https://github.com/lightninglabs/faraday/releases) repos manually.
