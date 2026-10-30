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

* [LiT now disables MPTCP listeners by
  default](https://github.com/lightninglabs/lightning-terminal/pull/1456),
  restoring plain TCP as the default for `litd` and its integrated services
  and mitigating the demonstrated CVE-2026-98432 exploit path on vulnerable
  Linux kernels. Existing binaries can apply the same mitigation with
  `GODEBUG=multipathtcp=0` and a restart; upgrading to a patched kernel is
  still required to fix the underlying vulnerability. Operators can
  explicitly opt in with `GODEBUG=multipathtcp=1`.

## RPC Updates

## Integrated Binary Updates

### LND
* [PR](https://github.com/lightninglabs/lightning-terminal/pull/1450): Bump:
  `lnd@v0.21.5-beta`.

### Loop
* [PR](https://github.com/lightninglabs/lightning-terminal/pull/1450): Bump:
  `loop@v0.35.2-beta`,
  `loop/looprpc@v1.0.17`.

### Pool
* [PR](https://github.com/lightninglabs/lightning-terminal/pull/1450): Bump:
  `pool@v0.7.2-beta`.

### Faraday
* [PR](https://github.com/lightninglabs/lightning-terminal/pull/1450): Bump:
  `faraday@v0.2.20-alpha`.

### Taproot Assets
* [PR](https://github.com/lightninglabs/lightning-terminal/pull/1450): Bump:
  `taproot-assets@v0.8.8`.

# Contributors (Alphabetical Order)

* ViktorT-11
