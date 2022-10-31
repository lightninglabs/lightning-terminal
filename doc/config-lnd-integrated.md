# Configuring LiT with integrated lnd node

The "integrated" mode means that `lnd` is started within the same process as
`litd`, alongside the UI server. Once the integrated `lnd` has been unlocked,
`litd` then goes ahead and starts `faraday`, `pool` and `loop` and connects them
to the integrated `lnd` node.

Currently the UI server cannot connect to `loop`, `pool` or `faraday` daemons
that aren't running in the same process. But that feature will also be available
in future versions.

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

```shell
⛰  litd \
  --httpslisten=0.0.0.0:8443 \
  --uipassword=My$trongP@ssword \
  --letsencrypt \
  --letsencrypthost=loop.merchant.com \
  --network=testnet \
  --lnd-mode=integrated \
  --lnd.lnddir=/root/.lnd \
  --lnd.alias=merchant \
  --lnd.externalip=loop.merchant.com \
  --lnd.rpclisten=0.0.0.0:10009 \
  --lnd.listen=0.0.0.0:9735 \
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

```text
# Application Options
httpslisten=0.0.0.0:8443
tlscertpath=~/.lit/tls.cert
tlskeypath=~/.lit/tls.key
letsencrypt=true
letsencrypthost=loop.merchant.com
lnd-mode=integrated
network=testnet

# Lnd
lnd.lnddir=~/.lnd
lnd.alias=merchant
lnd.externalip=loop.merchant.com
lnd.rpclisten=0.0.0.0:10009
lnd.listen=0.0.0.0:9735
lnd.debuglevel=debug

# Lnd - bitcoin
lnd.bitcoin.node=bitcoind

# Lnd - bitcoind
lnd.bitcoind.rpchost=localhost
lnd.bitcoind.rpcuser=testnetuser
lnd.bitcoind.rpcpass=testnetpw
lnd.bitcoind.zmqpubrawblock=localhost:28332
lnd.bitcoind.zmqpubrawtx=localhost:28333

# Loop
loop.loopoutmaxparts=5

# Pool
pool.newnodesonly=true

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

## LiT and LND interfaces

Port 10009 is the port that LND uses to expose its gRPC interface. LND's tls 
cert and macaroons will be required when making requests to this interface.

Port 8443 is a port that LiT uses to expose a variety of interfaces: gRPC, 
REST, grpc-web. When making requests using this interface, LiT's tls cert and 
macaroons should be used. 

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

  ```text
  [Application Options]
  alias=merchant
  
  [bitcoin]
  bitcoin.active=true
  ```

  After:

  ```text
  # New flag to tell LiT to run its own lnd in integrated mode. We need to set
  # this because "remote" is the new default value if we don't specify anything.
  # We also don't need to explicitly activate the Bitcoin network anymore as
  # that is the default for LiT.
  lnd-mode=integrated

  # Application Options
  lnd.alias=merchant
  ```

- if you use command line arguments for configuration, add the `lnd.` prefix to
  each argument to `litd`

  Before:

  ```shell
  ⛰  lnd --lnddir=~/.lnd --alias=merchant ...
  ```

  After:

  ```shell
  ⛰  litd lnd.lnddir=~/.lnd --lnd.alias=merchant ...
  ```

For `loop`:

- if you use an `loop.conf` file for configurations, copy the parameters into
  the `lit.conf` and add the `loop.` prefix to each of the configuration
  parameters. Also remove any section headers or replace them with comments.

  Before: (in `loop.conf`)

  ```text
  [Application Options]
  loopoutmaxparts=5
  ```

  After: (in `lit.conf`)

  ```text
  # Loop
  loop.loopoutmaxparts=5
  ```

- if you use command line arguments for configuration, add the `loop.` prefix to
  each argument to `litd`

  Before:

  ```shell
  ⛰  loop --loopoutmaxparts=5 --debuglevel=debug ...
  ```

  After:

  ```shell
  ⛰  litd --loop.loopoutmaxparts=5 --loop.debuglevel=debug ...
  ```

For `faraday`:

- the standalone `faraday` daemon does not load configuration from a file, but 
  you can now store the parameters into the `lit.conf` file. Just add the
  `faraday.` prefix to each of the configuration parameters.

  Before: (from command line)

  ```shell
  ⛰  faraday --min_monitored=48h
  ```

  After: (in `lit.conf`)

  ```text
  # Faraday
  faraday.min_monitored=48h
  ```

- if you use command line arguments for configuration, add the `faraday.` prefix
  to each argument to `litd`

  Before:

  ```shell
  ⛰  faraday --min_monitored=48h --debuglevel=debug ...
  ```

  After:

  ```shell
  ⛰  litd --faraday.min_monitored=48h --faraday.debuglevel=debug...
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

We are going through an example for each of the command line tools and will
explain the reasons for the extra flags.
The examples assume that LiT is started with the following configuration (only
relevant parts shown here):

```text
lnd-mode=integrated
network=testnet

lnd.lnddir=~/.lnd
lnd.rpclisten=0.0.0.0:10009
```

Because all components listen on the same gRPC port and use the same TLS
certificate, some command line calls now need some extra options that weren't
necessary before.

**NOTE**: All mentioned command line tools have the following behavior in
common: You either specify the `--network` flag and the `--tlscertpath` and
`--macaroonpath` are implied by looking inside the default directories for that
network. Or you specify the `--tlscertpath` and `--macaroonpath` flags
explicitly, then you **must not** set the `--network` flag. Otherwise, you will
get an error like `[lncli] could not load global options: unable to read macaroon
path (check the network setting!): open /home/<user>/.lnd/data/chain/bitcoin/testnet/admin.macaroon:
no such file or directory`.

### Example `lncli` command

The `lncli` commands in the "integrated" mode are the same as if `lnd` was
running standalone. The `--lnddir` flag does not need to be specified as long
as it is the default directory (`~/.lnd` on Linux).

```shell
⛰  lncli --rpcserver=localhost:10009 --tlscertpath=~/.lnd/tls.cert getinfo
```

### Example `loop` command

This is where things get a bit tricky. Because as mentioned above, `loopd` also
runs on the same gRPC server as `lnd`. That's why we have to both specify the
`host:port` as well as the TLS certificate of `lnd`. But `loopd` verifies its
own macaroon, so we have to specify that one from the `.loop` directory.

```shell
⛰  loop --rpcserver=localhost:8443 --tlscertpath=~/.lit/tls.cert \
  --macaroonpath=~/.loop/testnet/loop.macaroon \
  quote out 500000
```

You can easily create an alias for this by adding the following line to your
`~/.bashrc` file:

```shell
⛰  alias lit-loop="loop --rpcserver=localhost:8443 --tlscertpath=~/.lit/tls.cert --macaroonpath=~/.loop/testnet/loop.macaroon"
```

### Example `pool` command

Again, `poold` also runs on the same gRPC server as `lnd` and we have to specify
the `host:port` and the TLS certificate of `lnd` but use the macaroon from the
`.pool` directory.

```shell
⛰  pool --rpcserver=localhost:8443 --tlscertpath=~/.lit/tls.cert \
  --macaroonpath=~/.pool/testnet/pool.macaroon \
  accounts list
```

You can easily create an alias for this by adding the following line to your
`~/.bashrc` file:

```shell
⛰  alias lit-pool="pool --rpcserver=localhost:8443 --tlscertpath=~/.lit/tls.cert --macaroonpath=~/.pool/testnet/pool.macaroon"
```

### Example `frcli` command

Faraday's command line tool follows the same pattern as loop. We also have to
specify the server and TLS flags for `lnd` but use `faraday`'s macaroon:

```shell
⛰  frcli --rpcserver=localhost:8443 --tlscertpath=~/.lit/tls.cert \
  --macaroonpath=~/.faraday/testnet/faraday.macaroon \
  audit
```

You can easily create an alias for this by adding the following line to your
`~/.bashrc` file:

```shell
⛰  alias lit-frcli="frcli --rpcserver=localhost:8443 --tlscertpath=~/.lit/tls.cert --macaroonpath=~/.faraday/testnet/faraday.macaroon"
```

## Shutting down LiT

In the integrated mode LiT can be shut down by stopping the integrated `lnd`
node:

```shell
⛰  lncli stop
```
