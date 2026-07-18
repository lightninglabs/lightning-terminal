# Release Notes

- [Lightning Terminal](#lightning-terminal)
    - [Bug Fixes](#bug-fixes)
    - [Functional Changes/Additions](#functional-changesadditions)
    - [Technical and Architectural Updates](#technical-and-architectural-updates)
- [Integrated Binary Updates](#integrated-binary-updates)
    - [LND](#lnd)
    - [Loop](#loop)
    - [Pool](#pool)
    - [Faraday](#faraday)
    - [Taproot Assets](#taproot-assets)
- [Contributors](#contributors-alphabetical-order)

## Lightning Terminal

### Bug Fixes

* [Gate wallet-ready status on lnd's actual RPC
  readiness](https://github.com/lightninglabs/lightning-terminal/pull/1353):
  Fixed a startup race where litd could report the LND sub-server as "Wallet
  Ready" before lnd's RPC interceptor had actually left its
  `WAITING_TO_START` state, so the very next call could still fail with
  `rpc error: ... waiting to start`.

### Functional Changes/Additions

### Technical and Architectural Updates

* [Stop itest litd nodes via litd's own
  `StopDaemon`](https://github.com/lightninglabs/lightning-terminal/pull/1356):
  The itest harness now sets up a lit connection for every node, seed based or
  not, so nodes are stopped through litd's own `StopDaemon`. For stateless init
  nodes, which keep no macaroon files on disk, the harness bakes a lit super
  macaroon from the admin macaroon to authenticate that call.

* [Report litd's own version for `litd
  -V`](https://github.com/lightninglabs/lightning-terminal/pull/1337): The `-V`
  flag now prints litd's version instead of the integrated lnd version.

## RPC Updates

## Integrated Binary Updates

### LND

### Loop

### Pool

### Faraday

### Taproot Assets

# Contributors (Alphabetical Order)

* 0xfandom
* bitromortac
