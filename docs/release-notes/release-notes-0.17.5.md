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

* [Clamp implausible timestamps during KV to SQL session
  migration](https://github.com/lightninglabs/lightning-terminal/pull/1403):
  The session store migration now clamps implausible legacy timestamps into
  the range the SQL stores can represent, instead of aborting with a scan
  error on every startup. The read-back validation error now also includes
  the session ID, so the offending record can be identified from the log
  alone.

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
* ViktorT-11
