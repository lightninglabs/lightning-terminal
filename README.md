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
  primarily send outgoing Lightning payments, the channels with high local balances will
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

This will produce the `litd` executable and add it to your `GOPATH`.

## Configuration

LiT only has a few configuration parameters itself.

#### Required

You must set `httpslisten` to the host & port that the https server should listen on. Also
set `uipassword` to a strong password to use to login to the website in your browser. A
minimum of 8 characters is required. In a production environment, it's recommended that
you store this password as an environment variable.

#### Optional

You can also configure the HTTP server to automatically install a free SSL certificate
provided by [LetsEncrypt](https://letsencrypt.org/). This is recommended if you plan to
access the website from a remote computer and do not want to deal with the browser warning
you about the self-signed certificate. You just need to specify the domain name you wish
to use, and make sure port 80 is open in your in your firewall. LetsEncrypt requires this
to verify that you own the domain name. LiT will listen on port 80 to handle the
verification requests.

On some linux-based platforms, you may need to run LiT with superuser privileges since
port 80 is a system port. You can permit the
[`CAP_NET_BIND_SERVICE`](https://www.man7.org/linux/man-pages/man7/capabilities.7.html)
capability using `setcap 'CAP_NET_BIND_SERVICE=+eip' /path/to/litd` to allow binding on
port 80 without needing to run the daemon as root.

> Note: LiT only serves content over **HTTPS**. If you do not use `letsencrypt`, LiT will
> use the self-signed certificate that is auto-generated by `lnd` to encrypt the
> browser-to-server communication. Web browsers will display a warning when using the
> self-signed certificate.

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
                          certificate (default: /Users/jamal/Library/Application Support/Lnd/letsencrypt)
```

In addition to the LiT specific parameters, you must also provide configuration to the
`lnd`, `loop` and `faraday` daemons. For `lnd`, each flag must be prefixed with `lnd.`
(ex: `lnd.lnddir=~/.lnd`). Please see the
[sample-lnd.conf](https://github.com/lightningnetwork/lnd/blob/master/sample-lnd.conf)
file for more details on the available parameters. Note that `loopd` and `faraday` will
automatically connect to the in-process `lnd` node, so you do not need to provide them
with any additional parameters unless you want to override them. If you do override them,
be sure to add the `loop.` and `faraday.` prefixes.

Here is an example command to start `litd` on testnet with a local `bitcoind` node:

```
$ ./litd \
  --httpslisten=0.0.0.0:443 \
  --uipassword=My$trongP@ssword \
  --letsencrypt \
  --letsencrypthost=loop.merchant.com \
  --lnd.lnddir=/root/.lnd \
  --lnd.alias=merchant \
  --lnd.externalip=loop.merchant.com \
  --lnd.rpclisten=0.0.0.0:10009 \
  --lnd.listen=0.0.0.0:9735 \
  --lnd.bitcoin.active \
  --lnd.bitcoin.testnet \
  --lnd.bitcoin.node=bitcoind \
  --lnd.bitcoind.rpchost=localhost \
  --lnd.bitcoind.rpcuser=testnetuser \
  --lnd.bitcoind.rpcpass=testnetpw \
  --lnd.bitcoind.zmqpubrawblock=localhost:28332 \
  --lnd.bitcoind.zmqpubrawtx=localhost:28333 \
  --lnd.debuglevel=debug \
  --loop.loopoutmaxparts=5 \
  --faraday.min_monitored=48h
```

You can also store the configuration in a persistent `lnd.conf` file so you do not need to
type in the command line arguments every time you start the server. Just remember to use
the appropriate prefixes as necessary.

Also make sure to include the `lnd` general options in the `[Application Options]` section
because the section name `[Lnd]` is not unique anymore because of how we combine the
configurations of all daemons. This will hopefully be fixed in a future release.

Example `lnd.conf`:

```
[Application Options]
httpslisten=0.0.0.0:443
letsencrypt=1
letsencrypthost=loop.merchant.com

lnd.lnddir=~/.lnd
lnd.alias=merchant
lnd.externalip=loop.merchant.com
lnd.rpclisten=0.0.0.0:10009
lnd.listen=0.0.0.0:9735
lnd.debuglevel=debug

[Bitcoin]
lnd.bitcoin.active
lnd.bitcoin.testnet
lnd.bitcoin.node=bitcoind

[Bitcoind]
lnd.bitcoind.rpchost=localhost
lnd.bitcoind.rpcuser=testnetuser
lnd.bitcoind.rpcpass=testnetpw
lnd.bitcoind.zmqpubrawblock=localhost:28332
lnd.bitcoind.zmqpubrawtx=localhost:28333

[Loop]
loop.loopoutmaxparts=5

[Faraday]
faraday.min_monitored=48h

```

The default location for the `lnd.conf` file will depend on your operating system:

- **On MacOS**: `~/Library/Application Support/Lnd/lnd.conf`
- **On Linux**: `~/.lnd/lnd.conf`
- **On Windows**: `~/AppData/Roaming/Lnd/lnd.conf`

### Upgrade Existing Nodes

If you already have existing `lnd`, `loop`, or `faraday` nodes, you can easily upgrade
them to the LiT single executable while keeping all of your past data.

For `lnd`:

- if you use an `lnd.conf` file for configurations, add the `lnd.` prefix to each of the
  configuration parameters.

  Before:

  ```
  [Application Options]
  alias=merchant
  ```

  After:

  ```
  [Application Options]
  lnd.alias=merchant
  ```

- if you use command line arguments for configuration, add the `lnd.` prefix to each
  argument to `litd`

  Before:

  ```
  $ lnd --lnddir=~/.lnd --alias=merchant ...
  ```

  After:

  ```
  $ litd lnd.lnddir=~/.lnd --lnd.alias=merchant ...
  ```

For `loop`:

- if you use an `loop.conf` file for configurations, copy the parameters into the
  `lnd.conf` file that `litd` uses, and add the `loop.` prefix to each of the
  configuration parameters.

  Before: (in `loop.conf`)

  ```
  [Application Options]
  loopoutmaxparts=5
  ```

  After: (in `lnd.conf`)

  ```
  [Loop]
  loop.loopoutmaxparts=5
  ```

- if you use command line arguments for configuration, add the `loop.` prefix to each
  argument to `litd`

  Before:

  ```
  $ loop --loopoutmaxparts=5 --debuglevel=debug ...
  ```

  After:

  ```
  $ litd --loop.loopoutmaxparts=5 --loop.debuglevel=debug ...
  ```

For `faraday`:

- the standalone `faraday` daemon does not load configuration from a file, but you can now
  store the parameters into the `lnd.conf` file that `litd` uses. Just add the `faraday.`
  prefix to each of the configuration parameters.

  Before: (from command line)

  ```
  $ faraday --min_monitored=48h
  ```

  After: (in `lnd.conf`)

  ```
  [Faraday]
  faraday.min_monitored=48h
  ```

- if you use command line arguments for configuration, add the `faraday.` prefix to each
  argument to `litd`

  Before:

  ```
  $ faraday --min_monitored=48h --debuglevel=debug ...
  ```

  After:

  ```
  $ litd --faraday.min_monitored=48h --faraday.debuglevel=debug...
  ```

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
