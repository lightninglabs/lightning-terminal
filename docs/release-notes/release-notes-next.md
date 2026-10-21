# Next release

## Breaking Changes

* Migrate LiT and its integrated subservers to the btcd v2 modules. Go code
  importing exported Bitcoin types must use their corresponding v2 packages.
  [PR #1438](https://github.com/lightninglabs/lightning-terminal/pull/1438)

## Bug Fixes

* Match PostgreSQL errors against the selected pgx v5 driver so session
  uniqueness violations retain their database error classification.
  [PR #1438](https://github.com/lightninglabs/lightning-terminal/pull/1438)

* Preserve lnd v0.21.4 forwarding-response recovery when updating the btcd v2
  dependencies. Verify that pending settle/fail responses and their circuits
  survive reopening an existing channel database.
  [PR #1438](https://github.com/lightninglabs/lightning-terminal/pull/1438)
