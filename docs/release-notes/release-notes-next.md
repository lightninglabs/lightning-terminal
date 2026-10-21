# Next release

## Breaking Changes

* Migrate LiT and its integrated subservers to the btcd v2 modules. Go code
  importing exported Bitcoin types must use their corresponding v2 packages.
  [PR #1438](https://github.com/lightninglabs/lightning-terminal/pull/1438)

## Bug Fixes

* Match PostgreSQL errors against the selected pgx v5 driver so session
  uniqueness violations retain their database error classification.
  [PR #1438](https://github.com/lightninglabs/lightning-terminal/pull/1438)
