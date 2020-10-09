# Lightning Terminal (LiT)

![CI](https://github.com/lightninglabs/lightning-terminal/workflows/CI/badge.svg)

Lightning Terminal (LiT) is a browser-based interface for managing channel liquidity.

![screenshot](./app/src/assets/images/screenshot.png)

## Features
- Visualize your channels and balances
- Perform submarine swaps via the [Lightning Loop](https://lightning.engineering/loop) service
- Classify channels according to your node's operating mode
- Run a single binary that integrates both [`loopd`](https://github.com/lightninglabs/loop) and [`faraday`](https://github.com/lightninglabs/faraday) daemons all in one

## Installation
Download the latest binaries from the [releases](https://github.com/lightninglabs/lightning-terminal/releases) page. You can also download the latest binaries from the command line:

```
TARBALL="lightning-terminal-linux-amd64-v0.2.0-alpha"
BASE="https://github.com/lightninglabs/lightning-terminal/releases/latest/download"
wget -q $BASE/$TARBALL.tar.gz -O - | tar -xz && cd $TARBALL
```

## Execution
Run Lightning Terminal with a local LND instance:

```
./litd --uipassword=UP48lm4VjqxmOxB9X9stry6VTKBRQI
```

Visit https://localhost:8443 to access Terminal.

Note that a password with a minimum of 8 characters is required to run Lightning Terminal. In a production environment, it's recommended that you store this password as an environment variable.

To use LiT with a remote LND instance please [follow these instructions](./doc/remote.md). If you would like to replace your existing LND instance with the one integrated within LiT please see [configuring Terminal](./doc/config-lnd-integrated.md).

## Configuration
If you plan to access the website from a remote computer and don’t want to deal with the browser warning you about the self-signed certificate, you can configure the HTTP server to use a certificate from [Let's Encrypt](https://letsencrypt.org/). View the
[Let's Encrypt Configuration](./doc/letsencrypt.md) doc for instructions on how to
configure this.

## Upgrading
If you used command line arguments with previous versions then you don't need to change anything when upgrading. 

To upgrade from v0.1.1-alpha or earlier simply create a `lit.conf` file in your LiT directory. The default location LiT uses depends on your operating system:
- MacOS: `~/Library/Application Support/Lit/lit.conf`
- Linux: `~/.lit/lit.conf`
- Windows: `~/AppData/Roaming/Lit/lit.conf`

Move all the configuration settings specific to LiT from `lnd.conf` to `lit.conf` and remove the `lnd.` prefix from the configuration settings in `lnd.conf`. Note that any section headers (`[ Example ]`) in `lit.conf` should be removed or changed to comments (`# Example`). 

## Usage
Read the [walkthrough](doc/WALKTHROUGH.md) document to learn more about how to use LiT.

## Troubleshooting
If you encounter any issues please see our [troubleshooting guide](./doc/troubleshooting.md).

## Build from source
If you’d prefer to compile from source code please follow [these instructions](./doc/compile.md).

## Compatibility

Lightning Terminal is backwards compatible with LND back to version v0.11.0-beta

| LiT              | LND          |
| ---------------- | ------------ |
| **v0.2.0-alpha** | v0.11.0-beta |

## Daemon Versions packaged with LiT

| LiT              | LND          | Loop        | Faraday      |
| ---------------- | ------------ | ----------- | ------------ |
| **v0.2.0-alpha** | v0.11.1-beta | v0.9.0-beta | v0.2.0-alpha |
| **v0.1.1-alpha** | v0.11.0-beta | v0.8.1-beta | v0.2.0-alpha |
| **v0.1.0-alpha** | v0.10.3-beta | v0.6.5-beta | v0.2.0-alpha |

