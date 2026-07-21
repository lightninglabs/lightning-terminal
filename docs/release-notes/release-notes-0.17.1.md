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

### Technical and Architectural Updates

* [Report litd's own version for `litd
  -V`](https://github.com/lightninglabs/lightning-terminal/pull/1337): The `-V`
  flag now prints litd's version instead of the integrated lnd version.

## RPC Updates

## Integrated Binary Updates

### LND

### Loop

### Pool

### Faraday

### Taproot Assets

# Contributors (Alphabetical Order)

* 0xfandom
* bitromortac
