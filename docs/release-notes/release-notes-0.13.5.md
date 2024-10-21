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

* [Fixed a bug](https://github.com/lightninglabs/lightning-terminal/pull/850) 
  due to google-protobuf where a channel with SCID aliases on would cause 
  terminal frontend to be unable to call the `ListChannels` RPC].

### Functional Changes/Additions

* [Add a new `litcli bakesupermacaroon`](https://github.com/lightninglabs/lightning-terminal/pull/858) 
  helper command. This new command can be used either with a LiT macaroon which 
  has the appropriate permissions or with an LND macaroon which has the 
  permissions required to call the LND `BakeMacaroon` call. This later case is 
  especially useful in stateless-init mode where users will not have access to 
  a LiT macaroon to perform this call with. 

* [Convert litrpc package into a module](https://github.com/lightninglabs/lightning-terminal/pull/823).

* Add [custom channel
  functionality](https://github.com/lightninglabs/lightning-terminal/pull/848)
  to `litd`. Custom channels with Taproot Assets can now be created when `litd`
  runs in integrated `lnd` mode (`lnd-mode=integrated`) with the Taproot Assets
  daemon also running in integrated mode (`taproot-assets-mode=integrated`).

### Technical and Architectural Updates

* [Convert litrpc package into a module](https://github.com/lightninglabs/lightning-terminal/pull/823).

* Check internal maps before registering new sub-servers for both the 
  [status and sub-server manager.](https://github.com/lightninglabs/lightning-terminal/pull/877)
 
### Autopilot

## Integrated Binary Updates

### LND

### Loop

### Pool

### Faraday

### Taproot Assets

# Contributors (Alphabetical Order)

* Andras Banki-Horvath
* Elle Mouton
* George Tsagkarelis
* Gijs van Dam
* Jamal James
* Jonathan Harvey-Buschel
* Kevin Cai
* Oliver Gugger
