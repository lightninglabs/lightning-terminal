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

* [Restore LNC session setup for mailbox
  links](https://github.com/lightninglabs/lightning-terminal/pull/1254):
  Mailbox-specific TLS transport credentials now allow mailbox links to proceed
  without negotiated ALPN, restoring LNC session establishment and the
  `lnc_auth` flow after the `grpc-go` `v1.67.0` upgrade.

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

### Technical and Architectural Updates

## RPC Updates

## Integrated Binary Updates

### LND

### Loop

### Pool

### Faraday

### Taproot Assets

# Contributors (Alphabetical Order)

* Boris Nagaev
* darioAnongba
* Viktor-T11
