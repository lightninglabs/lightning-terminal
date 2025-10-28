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

* `dev.Dockerfile` now uses 
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

- [Bumped dependencies](https://github.com/lightninglabs/lightning-terminal/pull/1155/commits/537ed05776f64a3bbbdbd9177c8be329bf847890)
for LND, taproot-assets, loop, lndclient.
- Enhanced tap-channel integration tests to cover more edge cases and features,
and also added coverage to verify support for channel versioning:
    - https://github.com/lightninglabs/lightning-terminal/pull/1106
    - https://github.com/lightninglabs/lightning-terminal/pull/1097
    - https://github.com/lightninglabs/lightning-terminal/pull/1138
 

### LND

### Loop

### Pool

### Faraday

### Taproot Assets

# Contributors (Alphabetical Order)