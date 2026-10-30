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

* [Fix integrated Loop and Pool closing LiT's shared lnd
  connection](https://github.com/lightninglabs/lightning-terminal/pull/1459)
  when they stop or hit a runtime error. Before, every other component
  (macaroon service, tapd, faraday, accounts) then failed with `grpc: the
  client connection is closing` even though lnd was healthy
  ([#1381](https://github.com/lightninglabs/lightning-terminal/issues/1381)).
  Loop and Pool now only receive a non-closable view of the connection.

### Functional Changes/Additions

### Technical and Architectural Updates

* [Document the sub-server lnd connection ownership
  model](https://github.com/lightninglabs/lightning-terminal/pull/1459) in
  [`docs/subserver-connection-ownership.md`](../subserver-connection-ownership.md).

## RPC Updates

## Integrated Binary Updates

### LND

### Loop
* [PR](https://github.com/lightninglabs/lightning-terminal/pull/1459): Bump
  `loop` to the connection-ownership fix
  ([loop#1272](https://github.com/lightninglabs/loop/pull/1272)).

### Pool
* [PR](https://github.com/lightninglabs/lightning-terminal/pull/1459): Bump
  `pool` to the connection-ownership fix
  ([pool#528](https://github.com/lightninglabs/pool/pull/528)).

### Faraday

### Taproot Assets

# Contributors (Alphabetical Order)

