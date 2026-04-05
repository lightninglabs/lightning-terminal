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

* [Show asset information on
  payinvoice](https://github.com/lightninglabs/lightning-terminal/pull/1253):
  The `litcli ln payinvoice` command now displays an asset-aware confirmation
  prompt before sending a payment.

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
