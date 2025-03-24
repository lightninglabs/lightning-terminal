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

* [`litcli`: global flags to allow overrides via environment 
  variables](https://github.com/lightninglabs/lightning-terminal/pull/1007) 
  `litcli --help` for more details.

### Technical and Architectural Updates

* Correctly [move a session to the Expired 
  state](https://github.com/lightninglabs/lightning-terminal/pull/985) instead
  of the Revoked state if it is in fact being revoked due to the session expiry
  being reached.

## RPC Updates

## Integrated Binary Updates

### LND

### Loop

### Pool

### Faraday

### Taproot Assets

# Contributors (Alphabetical Order)

* Elle Mouton