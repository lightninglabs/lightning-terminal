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

* [Disable the `GRPC` internal low-level connection logger by
  default](https://github.com/lightninglabs/lightning-terminal/pull/896).
  It can still be enabled by adding `,GRPC=info` at the end of the
  `lnd.debuglevel` or `remote.lit-debuglevel` configuration options.

* [Add a new `lndrpctimeout` configuration
  option](https://github.com/lightninglabs/lightning-terminal/pull/899) that
  configures the default timeout that is used when waiting for a response on any
  call to `lnd`. This value is used by **all** subservers for all calls, so a
  sufficiently long duration (>= 30 seconds) should be used. The default value
  was bumped from 30 seconds to 3 minutes.

* Add support for connecting LiT to a [signet 
  network](https://github.com/lightninglabs/lightning-terminal/pull/902). This 
  can be done using the `--network=signet` config option.

* Add [custom channel
  functionality](https://github.com/lightninglabs/lightning-terminal/pull/848)
  to `litd`. Custom channels with Taproot Assets can now be created when `litd`
  runs in integrated `lnd` mode (`lnd-mode=integrated`) with the Taproot Assets
  daemon also running in integrated mode (`taproot-assets-mode=integrated`).

* [Add itest](https://github.com/lightninglabs/lightning-terminal/pull/892) for
  the MinRelayFee check added in Taproot Assets. The test ensures that
  transactions with fees below the minimum relay fee are rejected.

### Technical and Architectural Updates

## Integrated Binary Updates

### LND

### Loop

### Pool

### Faraday

### Taproot Assets

# Contributors (Alphabetical Order)

* Elle Mouton
* George Tsagkarelis
* Gijs van Dam
* Jamal James
* Jonathan Harvey-Buschel
* Oliver Gugger
