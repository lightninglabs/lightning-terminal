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

* [Improve channel restriction
  resilience](https://github.com/lightninglabs/lightning-terminal/pull/1215):
  The channel restriction rule no longer fails to initialize when restricted
  channels are closed.

### Functional Changes/Additions

* Add a `firewall.request-logger.disable` [config 
  flag](https://github.com/lightninglabs/lightning-terminal/pull/1216) and 
  require action logging when autopilot is enabled.

* [`dev.Dockerfile` now uses](https://github.com/lightninglabs/lightning-terminal/pull/1168)
  [cache mounts](https://docs.docker.com/build/cache/optimize/#use-cache-mounts)
  to cache the `GOMODCACHE` and `GOCACHE` directories so that dependencies don't
  need to be re-downloaded and re-built every time the image is re-created.
  As a result of this change, `dev.Dockerfile` now requires
  [BuildKit](https://docs.docker.com/build/buildkit) to build. When using
  `docker build`, this can be enabled by setting the environmental variable
  `DOCKER_BUILDKIT=1`. BuildKit also does not unnecessarily rebuild images when
  the build context is a remote git repository because COPY layers are more
  smartly compared to cache.

### Technical and Architectural Updates

## RPC Updates

## Integrated Binary Updates

### LND

* [PR](https://github.com/lightninglabs/lightning-terminal/pull/1230): Bump:
  `lnd@v0.20.1-beta`.

### Loop

* [PR](https://github.com/lightninglabs/lightning-terminal/pull/1230): Bump:
  `loop@v0.31.8-beta`, `loop/looprpc@v1.0.13`, `loop/swapserverrpc v1.0.20`.

### Pool

### Faraday

### Taproot Assets

* [PR](https://github.com/lightninglabs/lightning-terminal/pull/1230): Bump:
  `taproot-assets@v0.7.1`, `loop/taprpc@v1.0.12`.

# Contributors (Alphabetical Order)

* bitromortac
* Elle Mouton
* ViktorT-11
