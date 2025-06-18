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

* [Fixed navigation issues](https://github.com/lightninglabs/lightning-terminal/pull/1093) 
  when creating a custom Lightning Node Connect session via the UI.

### Functional Changes/Additions

* [`litcli`: global flags to allow overrides via environment 
  variables](https://github.com/lightninglabs/lightning-terminal/pull/1007) 
  `litcli --help` for more details.

### Technical and Architectural Updates

* Correctly [move a session to the Expired 
  state](https://github.com/lightninglabs/lightning-terminal/pull/985) instead
  of the Revoked state if it is in fact being revoked due to the session expiry
  being reached.
* Merge package `litclient` into `litrpc` to [reduce the number of Lightning
  Node Connect import dependencies.](https://github.com/lightninglabs/lightning-terminal/pull/1057)
* Convert package `perms` into a module to [reduce the number of Lightning
  Node Connect import dependencies.](https://github.com/lightninglabs/lightning-terminal/pull/1057)

## RPC Updates

* [Add account credit and debit
  commands](https://github.com/lightninglabs/lightning-terminal/pull/974) that
  allow increasing or decreasing the balance of an off-chain account by a
  specified amount.


* The [`accounts update` `--new_balance` flag has been
  deprecated](https://github.com/lightninglabs/lightning-terminal/pull/974).
  Use the `accounts update credit` and `accounts update debit` commands
  instead, to update an account's balance. The flag will no longer be
  supported in Lightning Terminal `v0.16.0-alpha`.

* [The `litrpc.Proxy` endpoints are now exposed over
  LNC](https://github.com/lightninglabs/lightning-terminal/pull/1033).  
  Note that this also exposes the `stop` and `bakesupermacaroon` endpoints over
  LNC. If this is not desired, it is recommended to fine-tune the macaroon
  created for the LNC session. Specifically, remove the `proxy:write`
  permission to disable access to the `stop` endpoint, and the
  `supermacaroon:write` permission to disable access to the
  `bakesupermacaroon` endpoint.

* [A `commit_hash` field has been added to the `GetInfo`
  response](https://github.com/lightninglabs/lightning-terminal/pull/1034).
  The `commit_hash` field will contain the full commit hash of the commit that
  LiT release binary build was based on. If the build had uncommitted changes,
  the `commit_hash` field will contain the most recent commit hash, suffixed by
  "-dirty".
  The contents of the `version` field in the `GetInfo` response has also been
  updated to only include the semantic version number of the LiT release,
  following the semantic versioning 2.0.0 spec (http://semver.org/).

* [A `commit_hash` field has been added to the `--version`
  output](https://github.com/lightninglabs/lightning-terminal/pull/1034).
  The `commit_hash` field will contain the full commit hash of the commit that 
  LiT release binary build was based on.

## Integrated Binary Updates

### LND

* Updated [`lnd` to 
  `v0.19.1-beta.rc1`](https://github.com/lightninglabs/lightning-terminal/pull/1082).

### Loop

* Updated [Loop to
  `v0.31.1-beta`](https://github.com/lightninglabs/lightning-terminal/pull/1077).

### Pool

* Updated [`pool` to
  `v0.6.6-beta`](https://github.com/lightninglabs/lightning-terminal/pull/1082).

### Faraday

* Updated [`faraday` to
  `v0.2.16-alpha`](https://github.com/lightninglabs/lightning-terminal/pull/1082).

### Taproot Assets

* Updated [`tapd` to
  `v0.6.0`](https://github.com/lightninglabs/lightning-terminal/pull/1089).
* All Taproot Asset Channel related commands (`litcli ln ...`) can now [use
  a new `--group_key` flag to interact with grouped asset
  channels](https://github.com/lightninglabs/lightning-terminal/pull/1052).
* The `litcli ln addinvoice` command now supports adding an invoice with a fixed
  sat/msat amount.

# Contributors (Alphabetical Order)

* Elle Mouton
* ffranr
* George Tsagkarelis
* Oliver Gugger
* Viktor
* ZZiigguurraatt
