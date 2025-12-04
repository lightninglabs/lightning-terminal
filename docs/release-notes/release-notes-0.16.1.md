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

### Functional Changes/Additions

* [PR](https://github.com/lightninglabs/lightning-terminal/pull/1183): LiT now
  fails fast if a critical integrated sub-server cannot start. The critical set
  currently includes only tapd; other integrated sub-servers can fail to start
  without blocking LiT, and their errors are recorded in status.
* Integrated-mode sub-servers now start deterministically: critical integrated
  services are launched first, followed by the remaining services in
  alphabetical order to keep startup ordering stable across runs.

### Technical and Architectural Updates

## RPC Updates

## Integrated Binary Updates

### LND

### Loop

* [PR](https://github.com/lightninglabs/lightning-terminal/pull/1191): Bump:
    `loop@v0.31.7-beta`.

### Pool

### Faraday

### Taproot Assets

# Contributors (Alphabetical Order)
