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

* [Add `lastHop` parameter for Loop In 
  quotes](https://github.com/lightninglabs/lightning-terminal/pull/920).
  Fixes fee estimation bug when using Loop In for a specific channel.

* [Fix inconsistent timestamp local such that we strictly use UTC 
  time](https://github.com/lightninglabs/lightning-terminal/pull/976). 
  This will mean that previously serialised timestamps that were not first 
  converted to UTC will not be interpreted as UTC and so may be off by a few
  hours depending on the timezone of where the server is running. This should 
  not be an issue for majority of cases. The possible side effects are that an 
  LNC session's expiry may differ by a few hours. There is an unlikely edge case
  that can happen if an LNC session is created, not connected to, and then LiT
  is upgraded all within a 10 min timespan. If this happens then the session may
  immediately be revoked. The solution to this is just to recreate the session. 

### Functional Changes/Additions

### Technical and Architectural Updates

* [Add some Makefile 
  helpers](https://github.com/lightninglabs/lightning-terminal/pull/928) that 
  allow for more control over running unit tests. 
 
## Integrated Binary Updates

### LND

* The integrated `lnd` instance was
  [updated](https://github.com/lightninglabs/lightning-terminal/pull/959) to
  [`v0.18.5-beta.rc1`](https://github.com/lightningnetwork/lnd/pull/9460).

### Loop

### Pool

### Faradayaa

* The integrated `faraday` instance was
  [updated](https://github.com/lightninglabs/lightning-terminal/pull/952) to
  [`v0.2.14-alpha](https://github.com/lightninglabs/faraday/releases/tag/v0.2.14-alpha).

### Taproot Assets

* The integrated `tapd` instance was
  [updated](https://github.com/lightninglabs/lightning-terminal/pull/959) to
  [`v0.5.1-alpha.rc3`](https://github.com/lightninglabs/taproot-assets/releases/tag/v0.5.1-rc3).

# Contributors (Alphabetical Order)

* Andras Banki-Horvath
* Elias Rad
* Elle Mouton
* jiangmencity
* Oliver Gugger
* Rachel Fish
* Tristav
* zhoufanjin
