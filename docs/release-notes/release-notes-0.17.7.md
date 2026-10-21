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

* [Declare the mapped SQL errors on the pointer
  receiver](https://github.com/lightninglabs/lightning-terminal/pull/1439):
  `MapSQLError` builds `ErrSqlUniqueConstraintViolation`,
  `ErrSerializationError`, `ErrDeadlockError` and `ErrSchemaError` as
  pointers, but `Error` and `Unwrap` were declared on the value receiver, so
  the value type satisfied `error` too. Matching one of these errors against
  the value type never succeeded, and did so silently instead of failing to
  compile.

### Functional Changes/Additions

* [Disable Loop by default on regtest and
  simnet](https://github.com/lightninglabs/lightning-terminal/pull/1422):
  Lightning Terminal now defaults `loop-mode` to `disable` on regtest and
  simnet, where no Loop server is available. Users can still explicitly
  configure another Loop mode.

### Technical and Architectural Updates
* [Update the Go toolchain and upstream dependencies](https://github.com/lightninglabs/lightning-terminal/pull/1440):
  This updates the build toolchain to Go 1.27.3 and aligns LND and Loop
  dependencies.
  Loop's generated clients now include on-chain cost and status fields for
  deposits and static-address loop-ins.

* [Add a release build workflow on tag
  push](https://github.com/lightninglabs/lightning-terminal/pull/1418):
  Pushing a release tag builds the release archives in CI and attaches
  them to a draft GitHub release. The release manager signs and timestamps
  the manifest before publishing the draft.
* Vendor the Go dependency graph for contained, reproducible builds.

## RPC Updates

## Integrated Binary Updates

### LND

### Loop

### Pool

### Faraday

### Taproot Assets

* [Bump `taproot-assets@v0.8.6`](https://github.com/lightninglabs/lightning-terminal/pull/1432),
  which fixes canceled asset invoice shards, invoice rate overcredit,
  standalone sale no-op HTLCs, and invalid address or proof keys. The module
  is pinned to the exact v0.8.6 tag.

# Contributors (Alphabetical Order)

* Leonhard Weese
* Olaoluwa Osuntokun
