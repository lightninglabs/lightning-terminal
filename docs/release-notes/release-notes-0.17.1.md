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

* [Don't mask account payment errors when request values are
  absent](https://github.com/lightninglabs/lightning-terminal/pull/1322):
  When a streaming account payment (`SendPaymentV2`/`SendToRouteV2`) fails and
  lnd returns a terminal error after the request values have already been
  cleaned up, lnd's underlying error is now passed through to the caller instead
  of being masked by a confusing `no request values found for request: <id>`
  error.

### Functional Changes/Additions

### Technical and Architectural Updates

* [Report litd's own version for `litd
  -V`](https://github.com/lightninglabs/lightning-terminal/pull/1337): The `-V`
  flag now prints litd's version instead of the integrated lnd version.

* [Allow overriding faraday and frdrpc in
  `dev.Dockerfile`](https://github.com/lightninglabs/lightning-terminal/pull/1299):
  Added `FARADAY_REPO`/`FARADAY_VERSION` and `FRDRPC_REPO`/`FRDRPC_VERSION`
  build arguments so dev images can be built against an arbitrary `faraday`
  commit or fork, mirroring the existing overrides for `lnd`, `taproot-assets`,
  `taprpc`, and `loop`.

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
* Vandit Singh
