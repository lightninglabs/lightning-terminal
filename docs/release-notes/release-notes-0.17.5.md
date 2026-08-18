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

* [Fix a startup deadlock when tapd runs in integrated
  mode](https://github.com/lightninglabs/lightning-terminal/pull/1371):
  litd waited for lnd to be fully synced to chain before starting any of its
  sub-servers, but lnd only reports itself as synced once its blockbeat has
  caught up, and block processing can be blocked on tapd's aux sweeper, which
  only becomes available once tapd is started. With a channel being resolved on
  chain, litd stalled for 60 seconds per block, and for as long as blocks kept
  arriving faster than that, tapd never came up at all. Any channel triggers
  this, not just asset channels. litd now starts tapd first, then waits for
  lnd's chain sync, then starts the remaining sub-servers, so loop, pool and
  faraday still start against a synced lnd. We additionally require an HTLC
  interceptor to be attached whenever tapd runs in-process, so lnd fails
  forwards back instead of forwarding them without any RFQ policy checks.

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

* bitromortac
* George Tsagkarelis
