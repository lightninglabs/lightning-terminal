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

* [Fix default account update expiration](https://github.com/lightninglabs/lightning-terminal/pull/1303):
  Fixed a bug in the `litcli accounts update` command where omitting the new
  expiration date would overwrite it to 0 (never expires). It now correctly
  defaults to -1 (no change).

### Functional Changes/Additions

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

### Technical and Architectural Updates

## RPC Updates

## Integrated Binary Updates

### LND

### Loop

### Pool

* Updated [`pool` to
  `v0.7.0-beta`](https://github.com/lightninglabs/lightning-terminal/pull/1313),
  which includes a fix for the auctioneer subscription stream silently
  dying on EOF, jittered reconnect backoff, and a fix for stream
  handling in the pending-open-channel consumer.

* Updated [`pool` to
  `v0.7.1-beta`](https://github.com/lightninglabs/lightning-terminal/pull/1314),
  which includes a fix for `HandleServerShutdown` silently dropping
  every account after the first per-account re-subscribe failure on a
  reconnect.

### Faraday

### Taproot Assets

# Contributors (Alphabetical Order)

* Boris Nagaev
* Cyberguru1
* darioAnongba
