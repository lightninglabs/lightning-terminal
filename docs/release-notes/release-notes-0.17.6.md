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

* [Reject session expiry timestamps outside SQL-supported
  range](https://github.com/lightninglabs/lightning-terminal/pull/1423):
  The session RPC server now rejects session and autopilot session expiry
  timestamps exceeding the SQL-supported time range or 64-bit integer limits,
  preventing database conversion errors.

### Functional Changes/Additions

### Technical and Architectural Updates

## RPC Updates

## Integrated Binary Updates

### LND

* [PR](https://github.com/lightninglabs/lightning-terminal/pull/1417): Bump
  `lnd@v0.21.4-beta`.

### Loop

### Pool

### Faraday

### Taproot Assets

* [PR](https://github.com/lightninglabs/lightning-terminal/pull/1417): Bump:
  `taproot-assets@v0.8.5`.

# Contributors (Alphabetical Order)

* Tyagiquamar

