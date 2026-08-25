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

* [Fix the default remote lnd macaroon path on non-default
  networks](https://github.com/lightninglabs/lightning-terminal/pull/1386):
  In remote lnd mode, litd rewrites the default macaroon path when a
  non-default `--network` is selected, so that `--network=regtest` alone is
  enough. The file name was taken from `lnd.DefaultConfig().AdminMacPath`,
  which lnd only populates in its own `ValidateConfig`, a step litd never runs
  in remote mode. The resulting path was the network's chain directory rather
  than the `admin.macaroon` file inside it, and startup failed with
  `read .../chain/bitcoin/regtest: is a directory`.

### Functional Changes/Additions

### Technical and Architectural Updates

## RPC Updates

## Integrated Binary Updates

### LND

### Loop

### Pool

### Faraday

### Taproot Assets

# Contributors (Alphabetical Order)
