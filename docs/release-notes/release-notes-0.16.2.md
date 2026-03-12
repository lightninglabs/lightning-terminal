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

* [Fix flaky custom channels liquidity edge case
  test](https://github.com/lightninglabs/lightning-terminal/pull/1250):
  Added block mining after invoice cancellation to ensure HTLC failures
  propagate properly before test assertions, resolving intermittent test
  failures.

### Functional Changes/Additions

### Technical and Architectural Updates

* [Clean up deprecated fields in perms/mock.go
  Config structs](https://github.com/lightninglabs/lightning-terminal/pull/1250):
  Removed unused struct fields and imports from mock configuration to improve
  code maintainability.

## RPC Updates

## Integrated Binary Updates

### LND

### Loop

### Pool

### Faraday

### Taproot Assets

# Contributors (Alphabetical Order)

* Nova
