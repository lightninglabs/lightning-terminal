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

* [Don't fail startup when lnd takes a while to open its
  databases](https://github.com/lightninglabs/lightning-terminal/pull/1374):
  Fixes a regression introduced in
  [#1353](https://github.com/lightninglabs/lightning-terminal/pull/1353).
  The startup wait for lnd's RPC interceptor to leave `WAITING_TO_START` was
  bounded by a fixed 15 second timeout. That signal only clears once lnd has
  completed its leader election and opened (and if necessary migrated) all of
  its databases, which happens long after lnd's gRPC listener is bound and
  which can legitimately take many minutes on nodes with a large channel and
  graph state, or on the first startup after an lnd version bump that migrates
  them. Affected nodes aborted litd startup with `lnd RPC not ready: lnd's RPC
  interceptor did not leave WAITING_TO_START within 15s` and reported both the
  `lit` and `lnd` sub-servers as errored, even though lnd itself was healthy
  and still starting up normally. The wait is now bounded by the configurable
  `--lndreadytimeout` (defaulting to 10 minutes) instead, logs its progress
  while waiting, and aborts immediately if lnd stops or reports an error rather
  than always waiting out the full timeout.

### Functional Changes/Additions

### Technical and Architectural Updates

## RPC Updates

## Integrated Binary Updates

### LND

### Loop
* [PR](https://github.com/lightninglabs/lightning-terminal/pull/1375): Bump:
  `loop@v0.34.0-beta-v0.8.1-tapd`, `loop/looprpc@v1.0.15`,
   `loop/swapserverrpc@v1.0.22`.

### Pool

### Faraday

### Taproot Assets
* [PR](https://github.com/lightninglabs/lightning-terminal/pull/1375): Bump:
  `taproot-assets@v0.8.1`, `taproot-assets/taprpc@v1.2.0`.

# Contributors (Alphabetical Order)

* Elle Mouton
