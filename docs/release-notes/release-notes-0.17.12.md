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

### Technical and Architectural Updates

## RPC Updates

## Integrated Binary Updates

### LND

### Loop

### Pool

### Faraday

### Taproot Assets

* [PR](https://github.com/lightninglabs/lightning-terminal/pull/1475): Bump
  `taproot-assets@v0.8.9`.

  Taproot Assets v0.8.9 has an activation height: mainnet block 978,493,
  expected around 2026-12-02. Close every asset channel so that the
  closing transaction confirms before the activation height, and reopen
  it once both peers run this release. See the [activation
  guide](https://github.com/lightninglabs/taproot-assets/blob/v0.8.9/docs/v0.8.9-activation.md)
  for the other networks' heights and the full steps.

# Contributors (Alphabetical Order)

* Jared Tobin
