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

* [Bind session ID to presented
  macaroon](https://github.com/lightninglabs/lightning-terminal/pull/1387):
  Firewall now verifies that the session ID supplied in gRPC metadata matches
  the presented session macaroon.

### Functional Changes/Additions

### Technical and Architectural Updates

## RPC Updates

* [Inbound fees are passed
  through](https://github.com/lightninglabs/lightning-terminal/pull/1382) the
  privacy mapper for the FeeReport endpoint.

## Integrated Binary Updates

### LND

### Loop

### Pool

### Faraday

### Taproot Assets

# Contributors (Alphabetical Order)

* bitromortac
* ViktorT-11
