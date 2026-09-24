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

* [Clear invoice mappings on account
  removal](https://github.com/lightninglabs/lightning-terminal/pull/1390):
  Account removal now clears the associated in-memory invoice mappings.

* [Default the signet autopilot
  server](https://github.com/lightninglabs/lightning-terminal/pull/1377):
  Starting `litd` with `--network=signet` failed with `no autopilot server
  address specified`, because the autopilot address was only defaulted for
  mainnet and testnet. Signet now defaults to the public signet autopilot
  server, so a signet node starts without extra configuration.

### Functional Changes/Additions

### Technical and Architectural Updates

## RPC Updates

## Integrated Binary Updates

### LND

### Loop

### Pool

### Faraday

### Taproot Assets
* [PR](https://github.com/lightninglabs/lightning-terminal/pull/1401): Bump:
  `taproot-assets@v0.8.4`.

# Contributors (Alphabetical Order)

* Tyagiquamar
* Vandit1604
* ViktorT-11
