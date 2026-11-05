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

* [Notify systemd when litd is
  ready](https://github.com/lightninglabs/lightning-terminal/pull/1380):
  litd now notifies systemd once it has finished starting, so a unit using
  `Type=notify` no longer hangs on `systemctl start`. It also notifies systemd
  on shutdown. Both are no-ops when litd is not run under systemd. An example
  `contrib/init/litd.service` unit file is included.

### Technical and Architectural Updates

## RPC Updates

## Integrated Binary Updates

### LND

### Loop

### Pool

### Faraday

### Taproot Assets

# Contributors (Alphabetical Order)

* Vandit1604
