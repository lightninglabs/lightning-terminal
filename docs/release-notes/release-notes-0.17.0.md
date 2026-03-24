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

* [Show asset information on
  payinvoice](https://github.com/lightninglabs/lightning-terminal/pull/1253):
  The `litcli ln payinvoice` command now displays an asset-aware confirmation
  prompt before sending a payment.

### Technical and Architectural Updates
* The Faraday subserver [is made an active
  component](https://github.com/lightninglabs/lightning-terminal/pull/1251)
  instead of only incorporating its RPC server.

## RPC Updates

## Integrated Binary Updates

### LND

### Loop

### Pool

### Faraday

### Taproot Assets

# Contributors (Alphabetical Order)

* bitromortac
* darioAnongba
