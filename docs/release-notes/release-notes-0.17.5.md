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

### Functional Changes/Additions

* [Keep litd running after lnd
  stops](https://github.com/lightninglabs/lightning-terminal/pull/1329):
  In integrated mode, litd no longer shuts down when lnd stops. It now marks lnd
  as errored, tears down the lnd dependent sub-servers and keeps running so its
  status endpoint stays available to report what happened. Note that calling
  lnd's `StopDaemon` (for example `lncli stop`) no longer stops litd; use litd's
  own `StopDaemon` to stop everything.

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
