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

* [Fix `dev.Dockerfile` build failure on git
  worktree checkouts](https://github.com/lightninglabs/lightning-terminal/pull/1311):
  The web UI `postbuild` step no longer aborts when the build context lacks a
  reachable git directory, which previously broke `dev.Dockerfile` builds for
  contributors using `git worktree`.

* [Restore LNC session setup for mailbox
  links](https://github.com/lightninglabs/lightning-terminal/pull/1254):
  Mailbox-specific TLS transport credentials now allow mailbox links to proceed
  without negotiated ALPN, restoring LNC session establishment and the
  `lnc_auth` flow after the `grpc-go` `v1.67.0` upgrade.

* [Fix default account update expiration](https://github.com/lightninglabs/lightning-terminal/pull/1303):
  Fixed a bug in the `litcli accounts update` command where omitting the new
  expiration date would overwrite it to 0 (never expires). It now correctly
  defaults to -1 (no change).

### Functional Changes/Additions

* [Support for SQL database
  backends](https://github.com/lightninglabs/lightning-terminal/pull/1305):
  Litd now supports SQLite and postgres database backends. The old BBolt
  database backend is now officially deprecated.

* [Migration to SQL by 
  default](https://github.com/lightninglabs/lightning-terminal/pull/1305):
  Litd will now migrate its internal databases to SQL by default the first
  time litd is restarted after this release. A new `databasebackend` config
  option can be used to choose between an SQL-backed SQLite database
  (`databasebackend=sqlite`) or a Postgres database backend
  (`databasebackend=postgres`). If the config option is not set, the database
  backend defaults to SQLite.

* [Add a startup confirmation prompt for the SQL
  migration](https://github.com/lightninglabs/lightning-terminal/pull/1315):
  Before the migration of the BBolt database to SQL is started, an explicit
  confirmation prompt is displayed. The prompt requires that the user
  explicitly confirms the migration by inputting "yes" via stdin. Any other
  input will cause the litd startup to be canceled.
  For non-interactive startup flows, the prompt can be skipped by setting the
  `auto-migrate-to-sql=true` config flag or by setting the following environment
  variable:  `LIT_AUTO_MIGRATE_TO_SQL=true`.

* [BBolt databases are
  deprecated](https://github.com/lightninglabs/lightning-terminal/pull/1305):
  Users that explicitly want to continue using the legacy `bbolt` backend must
  set `databasebackend=bbolt` before the SQL migration has been applied.
  Note that once the SQL migration completes successfully the old `bbolt`
  database is tombstoned, and the database becomes incompatible with litd. This
  also means that you will no longer be able to downgrade litd to a version
  prior to when SQL was supported, which was in this release (v0.17.0-alpha).
  The `bbolt` backend is now officially deprecated, and support for it will be
  removed in a future release.

* [Show asset information on
  payinvoice](https://github.com/lightninglabs/lightning-terminal/pull/1253):
  The `litcli ln payinvoice` command now displays an asset-aware confirmation
  prompt before sending a payment.

* [Renaming off-chain accounts](https://github.com/lightninglabs/lightning-terminal/pull/1274):
  Added the ability to rename off-chain accounts using the `litcli accounts
  update` command with a new `--new_label` flag.

* [Removal of deprecated `--new_balance`](https://github.com/lightninglabs/lightning-terminal/pull/1303):
  Removed the deprecated `--new_balance` flag and positional parameter logic from
  the `litcli accounts update` command. Users should instead use the
  `litcli accounts update debit` and `litcli accounts update credit` commands
  to modify an account's balance.

* [Add custom permissions support to sessions](https://github.com/lightninglabs/lightning-terminal/pull/1317):
  Added the `--permission` flag to `litcli sessions add` to allow specifying
  custom `entity:action` permissions (e.g. `info:read`), similar to
  `lncli bakemacaroon`, for sessions of type `custom`. Supports repeated flags,
  comma-separated lists, and mixed input.

### Technical and Architectural Updates

* [Report litd's own version for `litd
  -V`](https://github.com/lightninglabs/lightning-terminal/pull/1337): The `-V`
  flag now prints litd's version instead of the integrated lnd version.

## RPC Updates

## Integrated Binary Updates

### LND

* [Bump lnd to
  v0.21.1-beta](https://github.com/lightninglabs/lightning-terminal/pull/1331).

### Loop

* Bump [`loop` to
  v0.33.3-beta](https://github.com/lightninglabs/lightning-terminal/pull/1331),
  Additionally, `looprpc` is bumped to `v1.0.14` and `swapserverrpc` is bumped
  to `v1.0.21` match the version used in `loop` `v0.33.3-beta`.

### Pool

* Updated [`pool` to
  `v0.7.1-beta`](https://github.com/lightninglabs/lightning-terminal/pull/1314),
  which includes a fix for `HandleServerShutdown` silently dropping
  every account after the first per-account re-subscribe failure on a
  reconnect.

### Faraday

### Taproot Assets

* [Bump taproot-assets to v0.8.0 and taprpc to
  v1.1.0](https://github.com/lightninglabs/lightning-terminal/pull/1300).

# Contributors (Alphabetical Order)

* Boris Nagaev
* Calvin Zachman
* Cyberguru1
* darioAnongba
* Viktor-T11
