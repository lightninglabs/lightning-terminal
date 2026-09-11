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

* [Fail `litd` startup on `tapd` startup error when taproot assets mode is
  enabled](https://github.com/lightninglabs/lightning-terminal/pull/XXXX):
  When `taproot-assets-mode` is set to `integrated` or `remote`, `tapd`
  startup errors are now treated as fatal, preventing `litd` from running in
  a broken state where `lnd` expects `tapd` to be available but it is not.

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

* oth-body
