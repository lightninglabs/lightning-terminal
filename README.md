# Lightning Terminal (LiT)

![CI](https://github.com/lightninglabs/lightning-terminal/workflows/CI/badge.svg)

![screenshot](./app/src/assets/images/screenshot.png)

Lightning Terminal (LiT) is a browser-based interface for managing the off-chain liquidity
of your `lnd` Lightning Network node. It presents a visual representation of your channels
and balances, while allowing you to perform submarine swaps via the
[Lightning Loop](https://lightning.engineering/loop) service using a graphical interface.
With a bird's eye view of all of your open channels, you can instantly see which ones need
your immediate attention.

You can configure the UI to classify channels according to your node's operating mode.

- **Optimize for Receiving**: For merchants who primarily receive inbound Lightning
  payments, the channels with high local balances will be shaded red.
- **Optimize for Routing**: For routing node operators, that want to keep their channels
  balanced close to 50%, the channels with a high balance in either direction will be
  flagged.
- **Optimize for Sending**: For exchanges, fiat gateways, and other operators who
  primarily send outgoing Lightning payments, the channels with low local balances will
  be shaded red.

## Architecture

LiT is packaged as a single binary which contains the
[`lnd`](https://github.com/lightningnetwork/lnd),
[`loopd`](https://github.com/lightninglabs/loop) and
[`faraday`](https://github.com/lightninglabs/faraday) daemons all in one. It also contains
an HTTP server to serve the web assets (html/js/css) and a GRPC proxy to forward web
requests from the browser to the appropriate GRPC server. This deployment strategy was
chosen as it greatly simplifies the operational overhead of installation, configuration
and maintenance that would be necessary to run each of these servers independently. You
only need to download one executable and run one command to get LiT up and running. We
include the CLI binaries `lncli`, `loop` and `frcli` for convenience in the downloadable
archives as well.

### Daemon Versions packaged with LiT

| LiT              | LND          | Loop        | Faraday      |
| ---------------- | ------------ | ----------- | ------------ |
/ **v0.2.0-alpha** | v0.11.1-beta | v0.9.0-beta | v0.2.1-alpha |
| **v0.1.1-alpha** | v0.11.0-beta | v0.8.1-beta | v0.2.0-alpha |
| **v0.1.0-alpha** | v0.10.3-beta | v0.6.5-beta | v0.2.0-alpha |

## Usage

Read the [Walkthrough](doc/WALKTHROUGH.md) document to learn more about how to use
Lightning Terminal.

## Installation

There are two options for installing LiT: download the published binaries for your
platform, or compile from source code.

#### Download Binaries

LiT binaries for many platforms are made available on the GitHub
[Releases](https://github.com/lightninglabs/lightning-terminal/releases) page in this
repo. There you can download the latest version and extract the archive into a directory
on your computer.

#### Compile from Source Code

To compile from source code, you'll need to have some prerequisite developer tooling
installed on your machine.

| Dependency                                          | Description                                                                                                                                                                          |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [golang](https://golang.org/doc/install)            | LiT's backend web server is written in Go. The minimum version supported is Go v1.13.                                                                                                |
| [protoc](https://grpc.io/docs/protoc-installation/) | Required to compile LND & Loop gRPC proto files at build time                                                                                                                        |
| [nodejs](https://nodejs.org/en/download/)           | LiT's frontend is written in TypeScript and built on top of the React JS web framework. To bundle the assets into Javascript & CSS compatible with web browsers, NodeJS is required. |
| [yarn](https://classic.yarnpkg.com/en/docs/install) | a popular package manager for NodeJS application dependencies                                                                                                                        |

Once you have the necessary prerequisites, LiT can be compiled by running the following
commands:

```
git clone https://github.com/lightninglabs/lightning-terminal.git
cd lightning-terminal
make install
```

This will produce the `litd` executable and add it to your `GOPATH`. The CLI binaries for
`lncli`, `loop`, and `frcli` are not created by `make install`. You will need to download
those binaries from the [lnd](https://github.com/lightningnetwork/lnd/releases),
[loop](https://github.com/lightninglabs/loop/releases), and
[faraday](https://github.com/lightninglabs/faraday/releases) repos manually.

#### Executing CLI Commands

When executing `loop` and `frcli` commands, you will need to specify the connection info
since the daemons are now integrated into `lnd`'s GRPC server.

Examples:

```
loop --rpcserver=localhost:10009 --tlscertpath=$HOME/.lnd/tls.cert --macaroonpath=$HOME/.lnd/data/chain/bitcoin/mainnet/admin.macaroon
```

```
frcli --rpcserver=localhost:10009 --tlscertpath=$HOME/.lnd/tls.cert --macaroonpath=$HOME/.lnd/data/chain/bitcoin/mainnet/admin.macaroon
```

## Configuration

LiT only has a few configuration parameters itself.

#### Required

You must set `httpslisten` to the host & port that the https server should listen on. Also
set `uipassword` to a strong password to use to login to the website in your browser. A
minimum of 8 characters is required. In a production environment, it's recommended that
you store this password as an environment variable.

#### Optional

You can also configure the HTTP server to automatically install a free SSL certificate
provided by [Let's Encrypt](https://letsencrypt.org/). This is recommended if you plan to
access the website from a remote computer and do not want to deal with the browser warning
you about the self-signed certificate. View the
[Let's Encrypt Configuration](./doc/letsencrypt.md) doc for instructions on how to
configure this.

```
Application Options:
      --httpslisten=      host:port to listen for incoming HTTP/2 connections on (default: 127.0.0.1:8443)
      --uipassword=       the password that must be entered when using the loop UI. use a strong
                          password to protect your node from unauthorized access through the web UI
      --letsencrypt       use Let's Encrypt to create a TLS certificate for the UI instead of using
                          lnd's TLS certificate. port 80 must be free to listen on and must be reachable
                          from the internet for this to work
      --letsencrypthost=  the host name to create a Let's Encrypt certificate for'
      --letsencryptdir=   the directory where the Let's Encrypt library will store its key and
                          certificate (default: /Users/<username>/Library/Application Support/Lnd/letsencrypt)
```

### Lnd mode

Starting with LiT `v0.2.0-alpha`, you now have the choice of either running an
`lnd` node in the same process as the UI (which is called the "integrated" `lnd`
mode) or connect the UI to an already running `lnd` node (called "remote" mode).

Because that single decision has an impact on the configuration options that
need to be used, the documentation has been split into two parts, each
explaining one mode in detail.

* Lnd mode **"remote"**
  + Connect to a remote `lnd` instance, start the rest (the UI, `loop`, 
  `faraday`) in the same process.
  + [Please read the `lnd` **remote** mode configuration guide here.](doc/config-lnd-remote.md)
  + This is the default mode that is used if the `--lnd-mode=` command line
    or `lnd-mode=` configuration option is not set explicitly.

* Lnd mode **"integrated"**
  + Start everything (the UI, `lnd`, `loop`, `faraday`) in one single process.
  + [Please read the `lnd` **integrated** mode configuration guide here.](doc/config-lnd-integrated.md)

### Troubleshooting

If you have trouble running your node, please first check the logs for warnings or errors.
If there are errors relating to one of the embedded servers, then you should open an issue
in their respective GitHub repos ([lnd](https://github.com/lightningnetwork/lnd/issues),
[loop](https://github.com/lightninglabs/loop/issues),
[faraday](https://github.com/lightninglabs/faraday/issues). If the issue is related to the
web app, then you should open an
[issue](https://github.com/lightninglabs/lightning-terminal/issues) here in this repo.

#### Server

Server-side logs are stored in the directory specified by `lnd.lnddir` in your
configuration. Inside, there is a `logs` dir containing the log files in subdirectories.
Be sure to set `lnd.debuglevel=debug` in your configuration to see the most verbose
logging information.

#### Browser

Client-side logs are disabled by default in production builds. Logging can be turned on by
adding a couple keys to your browser's `localStorage`. Simply run these two JS statements
in you browser's DevTools console then refresh the page:

```
localStorage.setItem('debug', '*'); localStorage.setItem('debug-level', 'debug');
```

The value for `debug` is a namespace filter which determines which portions of the app to
display logs for. The namespaces currently used by the app are as follows:

- `main`: logs general application messages
- `action`: logs all actions that modify the internal application state
- `grpc`: logs all GRPC API requests and responses

Example filters: `main,action` will only log main and action messages. `*,-action` will
log everything except action messages.

The value for `debug-level` determines the verbosity of the logs. The value can be one of
`debug`, `info`, `warn`, or `error`.
