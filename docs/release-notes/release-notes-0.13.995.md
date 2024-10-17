# Release Notes

# Integrated Binary Updates

### Lightning Terminal

* [Ensured reproducible
  releases](https://github.com/lightninglabs/lightning-terminal/pull/852) by
  setting a fixed timestamps for the files in the release script.

### LND

### Loop

### Pool

### Faraday

### Taproot Assets

* A few bugs related to TAP channel liquidity were fixed, sending very small or
very big asset amounts is now possible. 
See [tapd PR](https://github.com/lightninglabs/taproot-assets/pull/1120).
* `ListBalances` now supports the `include_leased` flag, which will include
leased asset balances in the response.
* [The sanity checks for `fundchannel` now allow for composite 
UTXOs.](https://github.com/lightninglabs/lightning-terminal/pull/865)
* [Inconsistent balance 
  reporting](https://github.com/lightninglabs/lightning-terminal/pull/871) has
  been fixed: on-channel balances are now exclusively reported through channel
  balances and will not show up in asset balances reported by tapd.

# Autopilot

# Contributors (Alphabetical Order)

* Oliver Gugger
