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

## RPC Updates
- [Updated litcli](https://github.com/lightninglabs/lightning-terminal/pull/1125)
to support sending an asset payment without specifying a single peer. This will
use the new multi-rfq feature of taproot-assets which will automatically pick
the rfq peers for you. The field `rfq_peer_pubkey` is now optional for both
adding invoices and sending payments.

## Integrated Binary Updates

- [Bumped dependencies](https://github.com/lightninglabs/lightning-terminal/pull/1155/commits/537ed05776f64a3bbbdbd9177c8be329bf847890)
for LND, taproot-assets, loop, lndclient.
- Enhanced tap-channel integration tests to cover more edge cases and features,
and also added coverage to verify support for channel versioning:
    - https://github.com/lightninglabs/lightning-terminal/pull/1106
    - https://github.com/lightninglabs/lightning-terminal/pull/1097
    - https://github.com/lightninglabs/lightning-terminal/pull/1138
 

### LND

### Loop

### Pool

### Faraday

### Taproot Assets

# Contributors (Alphabetical Order)