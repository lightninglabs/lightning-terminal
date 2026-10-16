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

* [Disable Loop by default on regtest and
  simnet](https://github.com/lightninglabs/lightning-terminal/pull/1422):
  Lightning Terminal now defaults `loop-mode` to `disable` on regtest and
  simnet, where no Loop server is available. Users can still explicitly
  configure another Loop mode.

### Technical and Architectural Updates

* [Add a release build workflow on tag
  push](https://github.com/lightninglabs/lightning-terminal/pull/1418):
  Pushing a release tag builds the release archives in CI and attaches
  them to a draft GitHub release. The release manager signs and timestamps
  the manifest before publishing the draft.

## RPC Updates

## Integrated Binary Updates

### LND

### Loop

### Pool

### Faraday

### Taproot Assets

# Contributors (Alphabetical Order)

Leonhard Weese
