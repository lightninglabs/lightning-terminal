# Release Notes

# Integrated Binary Updates

### Lightning Terminal

* [Fixed a bug where REST calls for the `WalletUnlocker` service weren't allowed
  on startup](https://github.com/lightninglabs/lightning-terminal/pull/806).
* [Added build flag 'litd_no_ui' for building litd without the ui, accessible 
with 'make go-build-noui' and 'make go-install-noui'](https://github.com/lightninglabs/lightning-terminal/pull/500).

### LND

### Loop

### Pool

### Faraday

### Taproot Assets

* [Inconsistent balance 
  reporting](https://github.com/lightninglabs/lightning-terminal/pull/871) has
  been fixed: on-channel balances are now exclusively reported through channel
  balances and will not show up in asset balances reported by tapd.

# Autopilot

# Contributors (Alphabetical Order)

* Gijs van Dam
* Oliver Gugger