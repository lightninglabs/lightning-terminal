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

* [Gate wallet-ready status on lnd's actual RPC
  readiness](https://github.com/lightninglabs/lightning-terminal/pull/1353):
  Fixed a startup race where litd could report the LND sub-server as "Wallet
  Ready" before lnd's RPC interceptor had actually left its
  `WAITING_TO_START` state, so the very next call could still fail with
  `rpc error: ... waiting to start`.

* [Don't mask account payment errors when request values are
  absent](https://github.com/lightninglabs/lightning-terminal/pull/1322):
  When a streaming account payment (`SendPaymentV2`/`SendToRouteV2`) fails and
  lnd returns a terminal error after the request values have already been
  cleaned up, lnd's underlying error is now passed through to the caller instead
  of being masked by a confusing `no request values found for request: <id>`
  error.

* [Wait longer for lnd during the kvdb-to-SQL
  migration](https://github.com/lightninglabs/lightning-terminal/pull/1359):
  The kvdb-to-SQL data migration polls lnd's `ListMacaroonIDs` RPC, which only
  becomes available once lnd reaches its "RPC active" state. On nodes with a
  large channel/graph state, lnd can take well over a minute to get there after
  the wallet is unlocked, which exceeded the previous fixed 60-second poll
  budget and caused the migration (and therefore litd startup) to fail
  permanently, requiring a manual restart. The wait is now bounded by a
  configurable, generous timeout (`--lndreadytimeout`, defaulting to 10
  minutes) instead of a fixed attempt count.

### Functional Changes/Additions

* [Add accounts payments history subcommand](https://github.com/lightninglabs/lightning-terminal/pull/1316):
  Added the `litcli accounts payments` subcommand and corresponding gRPC
  endpoint `AccountPayments` to retrieve the off-chain payment history of
  an account, supporting pagination (sorted in ascending lexicographical
  order of their payment hash) and counting of total payments.

* [Auto-bake super macaroon on startup](https://github.com/lightninglabs/lightning-terminal/pull/1324):
  Added config options `--bake-super-macaroon` (choice: `none`, `read-only`,
  `read-write`) and `--super-macaroon-path` to automatically bake a super
  macaroon on startup and keep its permissions in sync. When set to `read-only`
  or `read-write`, the daemon will automatically bake a super macaroon
  containing read-only or read-write permissions, respectively, for all active
  sub-servers on startup. If the macaroon already exists but has different
  permissions, it will be automatically regenerated.

* [Add a configurable maximum account payment
  size](https://github.com/lightninglabs/lightning-terminal/pull/1369):
  Addresses [
  #583](https://github.com/lightninglabs/lightning-terminal/issues/583).
  Added an `accounts.max-payment-size-msat` config option. When set to a
  non-zero value, the account interceptor rejects any single account payment
  (`SendPaymentV2`/`SendToRouteV2`) whose total amount, including fees,
  exceeds the configured cap,
  providing a guard rail against a compromised or misbehaving account macaroon
  draining its balance in one large payment. It defaults to 0 (no cap),
  preserving existing behaviour. This is a first step towards the finer-grained
  per-account spending controls tracked in the issue (e.g. per-interval spend
  limits).

* [Optionally cap total account balances at the node's channel
  balance](https://github.com/lightninglabs/lightning-terminal/pull/1369):
  Addresses
  [#495](https://github.com/lightninglabs/lightning-terminal/issues/495).
  Added an opt-in `accounts.check-channel-balance` config option. When enabled,
  the accounts service rejects balance allocations (new accounts, administrative
  credits and administrative balance increases) that would push the sum of all
  account balances above the node's available local (outbound) channel balance,
  helping operators avoid over-provisioning custodial accounts beyond what the
  node can actually pay out. It defaults to off to preserve existing behaviour.

* [General UI improvements](https://github.com/lightninglabs/lightning-terminal/pull/1368):
  The sidebar is now pinned to the left edge of the window, collapses on smaller
  screens instead of covering the page, and no longer shifts the content when it
  is toggled. The Home page has been simplified, the Home and auth pages reflow
  down to mobile widths, and the app background is now black.

### Technical and Architectural Updates

* [Report litd's own version for `litd
  -V`](https://github.com/lightninglabs/lightning-terminal/pull/1337): The `-V`
  flag now prints litd's version instead of the integrated lnd version.

* [Refactor privacy mapper to prevent 32-bit truncation and optimize
  allocations](https://github.com/lightninglabs/lightning-terminal/pull/1358):
  Refactored the privacy mapper's random number generation to use `int64`
  instead of `int` to prevent architecture-dependent truncation on 32-bit
  runtimes. This represents a breaking change to the `NewPrivacyMapper` and
  `CryptoRandIntn` functions. The PR also introduced a `sync.Pool` for
  `*big.Int` to optimize allocations.

## RPC Updates

## Integrated Binary Updates

### LND
* [PR](https://github.com/lightninglabs/lightning-terminal/pull/1370): Bump:
  `lnd@v0.21.2-beta`.

### Loop
* [PR](https://github.com/lightninglabs/lightning-terminal/pull/1370): Bump:
  `loop@v0.34.0-beta`.

### Pool

### Faraday

### Taproot Assets

# Contributors (Alphabetical Order)

* 0xfandom
* bitromortac
* Cyberguru1
* Vandit Singh
