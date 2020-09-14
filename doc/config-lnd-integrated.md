# Configuring LiT with integrated lnd node

The "integrated" mode means that `lnd` is started within the same process as
`litd`. Once the integrated `lnd` has been unlocked, `litd` then goes ahead and
starts `faraday` and `loop` and connects them to the integrated `lnd` node.
As a final step the UI server is then also started.

Currently the UI server cannot connect to `loop` or `faraday` daemons that
aren't running in the same process. But that feature will also be available in
future versions.

## Use command line parameters only

In addition to the LiT specific parameters, you must also provide configuration
to the `lnd`, `loop` and `faraday` daemons. For `lnd`, each flag must be
prefixed with `lnd.` (ex: `lnd.lnddir=~/.lnd`). Please see the
[sample-lnd.conf](https://github.com/lightningnetwork/lnd/blob/master/sample-lnd.conf)
file for more details on the available parameters. Note that `loopd` and
`faraday` will automatically connect to the in-process `lnd` node, so you do not
need to provide them with any additional parameters unless you want to override
them. If you do override them, be sure to add the `loop.` and `faraday.`
prefixes.

To see all available command line options, run `litd --help`.

Here is an example command to start `litd` on testnet with a local `bitcoind`
node:

```
$ ./litd \
  --httpslisten=0.0.0.0:443 \
  --uipassword=My$trongP@ssword \
  --letsencrypt \
  --letsencrypthost=loop.merchant.com \
  --lnd-mode=integrated \
  --lnd.lnddir=/root/.lnd \
  --lnd.alias=merchant \
  --lnd.externalip=loop.merchant.com \
  --lnd.rpclisten=0.0.0.0:10009 \
  --lnd.listen=0.0.0.0:9735 \
  --lnd.bitcoin.active \
  --lnd.bitcoin.testnet \
  --lnd.bitcoin.node=bitcoind \
  --lnd.bitcoind.rpchost=localhost \
  --lnd.bitcoind.rpcuser=testnetuser \
  --lnd.bitcoind.rpcpass=testnetpw \
  --lnd.bitcoind.zmqpubrawblock=localhost:28332 \
  --lnd.bitcoind.zmqpubrawtx=localhost:28333 \
  --lnd.debuglevel=debug \
  --loop.loopoutmaxparts=5 \
  --faraday.min_monitored=48h \
  --faraday.connect_bitcoin \
  --faraday.bitcoin.host=localhost \
  --faraday.bitcoin.user=testnetuser \
  --faraday.bitcoin.password=testnetpw
```

## Use a configuration file

You can also store the configuration in a persistent `~/.lit/lit.conf` file, so
you do not need to type in the command line arguments every time you start the
server. Just remember to use the appropriate prefixes as necessary.

Make sure you don't add any section headers (the lines starting with `[` and
ending with `]`, for example `[Application Options]`) as these don't work with
the additional levels of sub configurations. You can replace them with a
comment (starting with the `#` character) to get the same grouping effect as
before.

Example `~/.lit/lit.conf`:

```
# Application Options
httpslisten=0.0.0.0:443
letsencrypt=true
letsencrypthost=loop.merchant.com
lnd-mode=integrated

# Lnd
lnd.lnddir=~/.lnd
lnd.alias=merchant
lnd.externalip=loop.merchant.com
lnd.rpclisten=0.0.0.0:10009
lnd.listen=0.0.0.0:9735
lnd.debuglevel=debug

# Lnd - bitcoin
lnd.bitcoin.active=true
lnd.bitcoin.testnet=true
lnd.bitcoin.node=bitcoind

# Lnd - bitcoind
lnd.bitcoind.rpchost=localhost
lnd.bitcoind.rpcuser=testnetuser
lnd.bitcoind.rpcpass=testnetpw
lnd.bitcoind.zmqpubrawblock=localhost:28332
lnd.bitcoind.zmqpubrawtx=localhost:28333

# Loop
loop.loopoutmaxparts=5

# Faraday
faraday.min_monitored=48h

# Faraday - bitcoin
faraday.connect_bitcoin=true
faraday.bitcoin.host=localhost
faraday.bitcoin.user=testnetuser
faraday.bitcoin.password=testnetpw

```

The default location for the `lit.conf` file will depend on your operating
system:

- **On MacOS**: `~/Library/Application Support/Lit/lit.conf`
- **On Linux**: `~/.lit/lit.conf`
- **On Windows**: `~/AppData/Roaming/Lit/lit.conf`

## Upgrade Existing Nodes

If you already have existing `lnd`, `loop`, or `faraday` nodes, you can easily
upgrade them to the LiT single executable while keeping all of your past data.

For `lnd`:

- if you use an `lnd.conf` file for configurations, copy that file to your 
  LiT directory (`~/.lit` for example, see last section for other operating
  system's default directories) and call it `lit.conf`. Then edit `lit.conf`
  and add the `lnd.` prefix to each of the configuration parameters. You also
  have to remove any section headers (the lines starting with `[` and ending
  with `]`, for example `[Application Options]`) as these don't work with
  the additional levels of sub configurations. You can replace them with a
  comment (starting with the `#` character) to get the same grouping effect as
  before.

  Before:

  ```
  [Application Options]
  alias=merchant
  
  [bitcoin]
  bitcoin.active=true
  ```

  After:

  ```
  # Application Options
  lnd.alias=merchant
  
  # bitcoin
  lnd.bitcoin.active=true
  ```

- if you use command line arguments for configuration, add the `lnd.` prefix to
  each argument to `litd`

  Before:

  ```
  $ lnd --lnddir=~/.lnd --alias=merchant ...
  ```

  After:

  ```
  $ litd lnd.lnddir=~/.lnd --lnd.alias=merchant ...
  ```

For `loop`:

- if you use an `loop.conf` file for configurations, copy the parameters into
  the `lit.conf` and add the `loop.` prefix to each of the configuration
  parameters. Also remove any section headers or replace them with comments.

  Before: (in `loop.conf`)

  ```
  [Application Options]
  loopoutmaxparts=5
  ```

  After: (in `lnd.conf`)

  ```
  # Loop
  loop.loopoutmaxparts=5
  ```

- if you use command line arguments for configuration, add the `loop.` prefix to
  each argument to `litd`

  Before:

  ```
  $ loop --loopoutmaxparts=5 --debuglevel=debug ...
  ```

  After:

  ```
  $ litd --loop.loopoutmaxparts=5 --loop.debuglevel=debug ...
  ```

For `faraday`:

- the standalone `faraday` daemon does not load configuration from a file, but 
  you can now store the parameters into the `lit.conf` file. Just add the
  `faraday.` prefix to each of the configuration parameters.

  Before: (from command line)

  ```
  $ faraday --min_monitored=48h
  ```

  After: (in `lit.conf`)

  ```
  # Faraday
  faraday.min_monitored=48h
  ```

- if you use command line arguments for configuration, add the `faraday.` prefix
  to each argument to `litd`

  Before:

  ```
  $ faraday --min_monitored=48h --debuglevel=debug ...
  ```

  After:

  ```
  $ litd --faraday.min_monitored=48h --faraday.debuglevel=debug...
  ```

## Upgrading from LiT v0.1.1-alpha or earlier

If you used command line arguments only, you don't need to change anything when
updating from LiT `v0.1.1-alpha` or earlier.

If you used an `lnd.conf` file for LiT configurations, move that file to your 
LiT directory (`~/.lit` for example, see last section for other operating
system's default directories) and call it `lit.conf`. Then edit `lit.conf`
and remove any section headers (the lines starting with `[` and ending
with `]`, for example `[Application Options]`) as these don't work with
the additional levels of sub configurations. You can replace them with a
comment (starting with the `#` character) to get the same grouping effect as
before.

## Example commands for interacting with the command line

Because not all functionality of `lnd` (or `loop`/`faraday` for that matter) is
available through the web UI, it will still be necessary to interact with those
daemons through the command line.

Because all components listen on the same gRPC port and use the same TLS
certificate, some of the command line options might be 

`lncli --network=testnet -- getinfo`