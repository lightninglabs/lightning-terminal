# Release Notes

# Integrated Binary Updates

### Lightning Terminal

* [Fixed a bug](https://github.com/lightninglabs/lightning-terminal/pull/850) 
  due to google-protobuf where a channel with SCID aliases on would cause 
  terminal frontend to be unable to call the `ListChannels` RPC].

* Add a new [`litcli bakesupermacaroon`](https://github.com/lightninglabs/lightning-terminal/pull/858) 
  helper command. This new command can be used either with a LiT macaroon which 
  has the appropriate permissions or with an LND macaroon which has the 
  permissions required to call the LND `BakeMacaroon` call. This later case is 
  especially useful in stateless-init mode where users will not have access to 
  a LiT macaroon to perform this call with. 

- [Convert litrpc package into a module](https://github.com/lightninglabs/lightning-terminal/pull/823).

### LND

### Loop

### Pool

### Faraday

### Taproot Assets

# Autopilot

# Contributors (Alphabetical Order)

* Andras Banki-Horvath
* Elle Mouton
* Kevin Cai
