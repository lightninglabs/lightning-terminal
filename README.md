# Lightning Terminal (LiT)

![CI](https://github.com/lightninglabs/lightning-terminal/workflows/CI/badge.svg)

Lightning Terminal (LiT) is a browser-based interface for managing channel liquidity.

![screenshot](./app/src/assets/images/screenshot.png)

## Installation
Download the latest binaries from the [releases](https://github.com/lightninglabs/lightning-terminal/releases) page. You can also download the latest binaries from the command line:

```
TARBALL="lightning-terminal-linux-amd64-v0.2.0-alpha"
BASE="https://github.com/lightninglabs/lightning-terminal/releases/latest/download"
wget -q $BASE/$TARBALL.tar.gz -O - | tar -xz && cd $TARBALL
```

## Execution
Run Terminal with a local LND instance:

```
./litd --uipassword=UP48lm4VjqxmOxB9X9stry6VTKBRQI
```

Visit https://localhost:8443 to access Terminal.

Note that a password with a minimum of 8 characters is required to run Terminal. In a production environment, it's recommended that you store this password as an environment variable.

To use Terminal with a remote LND instance please [follow these instructions](./doc/remote.md). 

## Configuration
If you plan to access the website from a remote computer and don’t want to deal with the browser warning you about the self-signed certificate, you can configure the HTTP server to use a certificate from [Let's Encrypt](https://letsencrypt.org/). View the
[Let's Encrypt Configuration](./doc/letsencrypt.md) doc for instructions on how to
configure this.

For more configuration options please see [configuring Terminal](./doc/configuring.md).

## Usage
Read the [walkthrough](doc/WALKTHROUGH.md) document to learn more about how to use Lightning Terminal.

## Build from source
If you’d prefer to compile from source code please follow [these instructions](./doc/compile.md).

## Compatibility

Lightning Terminal is backwards compatible with LND back to version v0.10.3-beta

| LiT              | LND          |
| ---------------- | ------------ |
| **v0.2.0-alpha** | v0.10.3-beta |
