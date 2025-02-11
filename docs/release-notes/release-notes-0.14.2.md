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

### Technical and Architectural Updates

* Correctly [move a session to the Expired 
  state](https://github.com/lightninglabs/lightning-terminal/pull/985) instead
  of the Revoked state if it is in fact being revoked due to the session expiry
  being reached.


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

## Integrated Binary Updates

### LND

### Loop

### Pool

### Faraday

### Taproot Assets

# Contributors (Alphabetical Order)

* Elle Mouton
* Viktor
