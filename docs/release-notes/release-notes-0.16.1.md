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

### Loop

* [PR](https://github.com/lightninglabs/lightning-terminal/pull/1191): Bump:
  `loop@v0.31.7-beta`.

### Pool

### Faraday

### Taproot Assets

# Contributors (Alphabetical Order)

* bitromortac
* Elle Mouton
