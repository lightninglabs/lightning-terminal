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

## Integrated Binary Updates

### LND

* Updated [`lnd` to 
  `v0.19.0-beta.rc2`](https://github.com/lightninglabs/lightning-terminal/pull/987).

### Loop

* Updated [Loop to
  `v0.30.0-beta`](https://github.com/lightninglabs/lightning-terminal/pull/987).

### Pool

### Faraday

### Taproot Assets

* Updated [`tapd` to
  `v0.5.2`](https://github.com/lightninglabs/lightning-terminal/pull/987).
* All Taproot Asset Channel related commands (`litcli ln ...`) can now [use
  a new `--group_key` flag to interact with grouped asset
  channels](https://github.com/lightninglabs/lightning-terminal/pull/1052).

# Contributors (Alphabetical Order)

* Elle Mouton
* Viktor
