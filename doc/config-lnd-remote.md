# Connecting LiT to a standalone LND process

By default LiT assumes that `lnd` is running as a standalone process locally. However
`litd` can connect to `lnd` running on a remote host.

## Quickstart

To connect Lightning Terminal to a remote LND instance first make sure your `lnd.conf`
file contains the following additional configuration settings:

```text
tlsextraip=<externally-reachable-ip-address>
rpclisten=0.0.0.0:10009
rpcmiddleware.enable=true
```

Copy the following files that are located in your `~/.lnd/data/chain/bitcoin/mainnet`
directory on your remote machine to `/some/folder/with/lnd/data/` on your local machine
(where you’ll be running LiT):

- tls.cert
- admin.macaroon

(Note that with LiT prior to `v0.3.5-alpha` all `*.macaroon` files need to be
copied from the lnd machine.)

Create a `lit.conf` file. The default location LiT will look for the configuration file
depends on your operating system:

- MacOS: `~/Library/Application Support/Lit/lit.conf`
- Linux: `~/.lit/lit.conf`
- Windows: `~/AppData/Roaming/Lit/lit.conf`

Alternatively you can specify a different location by passing `--lit-dir=~/.lit`. After
creating `lit.conf` populate it with the following configuration settings:

```text
remote.lnd.rpcserver=<externally-reachable-ip-address>:10009
remote.lnd.macaroonpath=/some/folder/with/lnd/data/admin.macaroon
remote.lnd.tlscertpath=/some/folder/with/lnd/data/tls.cert
```

> NOTE: It is highly recommended to not place the LND connection credentials
inside the terminal home directory (`~/.lit/`) as `litd` may overwrite some of
these files.

Run LiT:

```shell
⛰  ./litd --uipassword=UP48lm4VjqxmOxB9X9stry6VTKBRQI
```

Visit https://localhost:8443 to access LiT.

## Additional Configuration

The default "remote" mode means that `lnd` is started as a standalone process, possibly on another
host, and `litd` connects to it, right after starting its UI server. Once the connection
to the remote `lnd` node has been established, `litd` then goes ahead and starts
`faraday`, `pool` and `loop` and connects them to that `lnd` node as well.

### Connecting LiT to a remote faraday node

To instruct LiT to not start its own integrated `faraday` daemon but instead
connect to an existing node, use the following configuration options:

```text
faraday-mode=remote
remote.faraday.rpcserver=<externally-reachable-ip-address>:8465
remote.faraday.macaroonpath=/some/folder/with/faraday/data/faraday.macaroon
remote.faraday.tlscertpath=/some/folder/with/faraday/data/tls.cert
```

### Connecting LiT to a remote loopd node

To instruct LiT to not start its own integrated `loopd` daemon but instead
connect to an existing node, use the following configuration options:

```text
loop-mode=remote
remote.loop.rpcserver=<externally-reachable-ip-address>:11010
remote.loop.macaroonpath=/some/folder/with/loop/data/loop.macaroon
remote.loop.tlscertpath=/some/folder/with/loop/data/tls.cert
```

### Connecting LiT to a remote poold node

To instruct LiT to not start its own integrated `poold` daemon but instead
connect to an existing node, use the following configuration options:

```text
pool-mode=remote
remote.pool.rpcserver=<externally-reachable-ip-address>:12010
remote.pool.macaroonpath=/some/folder/with/pool/data/pool.macaroon
remote.pool.tlscertpath=/some/folder/with/pool/data/tls.cert
```

## Use command line parameters only

In addition to the LiT specific and remote `lnd` parameters, you must also provide
configuration to the `loop`, `pool`, and `faraday` daemons. For the remote `lnd` node, all
`remote.lnd` flags must be specified. Note that `loopd` and `faraday` will automatically
connect to the same remote `lnd` node, so you do not need to provide them with any
additional parameters unless you want to override them. If you do override them, be sure
to add the `loop.`, `pool.`, and `faraday.` prefixes.

To see all available command line options, run `litd --help`.

The most minimal example command to start `litd` and connect it to a local `lnd`
node that is running with default configuration settings is:

```shell
⛰  litd --uipassword=My$trongP@ssword
```

All other command line flags are only needed to overwrite the default behavior.

Here is an example command to start `litd` connected to a testnet `lnd` that is
running on another host and overwrites a few default settings in `loop`, `pool`,
and `faraday` (optional):

```shell
⛰  litd \
  --httpslisten=0.0.0.0:8443 \
  --uipassword=My$trongP@ssword \
  --letsencrypt \
  --letsencrypthost=loop.merchant.com \
  --lit-dir=~/.lit \
  --network=testnet \
  --remote.lit-debuglevel=debug \
  --remote.lnd.rpcserver=some-other-host:10009 \
  --remote.lnd.macaroonpath=/some/folder/with/lnd/data/admin.macaroon \
  --remote.lnd.tlscertpath=/some/folder/with/lnd/data/tls.cert \
  --loop.loopoutmaxparts=5 \
  --pool.newnodesonly=true \
  --faraday.min_monitored=48h \
  --faraday.connect_bitcoin \
  --faraday.bitcoin.host=some-other-host \
  --faraday.bitcoin.user=testnetuser \
  --faraday.bitcoin.password=testnetpw
```

## Use a configuration file

You can also store the configuration in a persistent `~/.lit/lit.conf` file, so you do not
need to type in the command line arguments every time you start the server. Just remember
to use the appropriate prefixes as necessary.

Make sure you don't add any section headers (the lines starting with `[` and ending with
`]`, for example `[Application Options]`) as these don't work with the additional levels
of sub configurations. You can replace them with a comment (starting with the `#`
character) to get the same grouping effect as before.

The most minimal example of a `~/.lit/lit.conf` file that connects to a local `lnd` node
that is running with default configuration settings is:

```text
# Application Options
uipassword=My$trongP@ssword
```

All other configuration settings are only needed to overwrite the default behavior.

Here is an example `~/.lit/lit.conf` file that connects LiT to a testnet `lnd` node
running on another host and overwrites a few default settings in `loop`, `pool`,
 and `faraday` (optional):

```text
# Application Options
httpslisten=0.0.0.0:8443
uipassword=My$trongP@ssword
letsencrypt=true
letsencrypthost=loop.merchant.com
lit-dir=~/.lit
network=testnet

# Remote options
remote.lit-debuglevel=debug

# Remote lnd options
remote.lnd.rpcserver=some-other-host:10009
remote.lnd.macaroonpath=/some/folder/with/lnd/data/admin.macaroon
remote.lnd.tlscertpath=/some/folder/with/lnd/data/tls.cert

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

The default location for the `lit.conf` file will depend on your operating system:

- **On MacOS**: `~/Library/Application Support/Lit/lit.conf`
- **On Linux**: `~/.lit/lit.conf`
- **On Windows**: `~/AppData/Roaming/Lit/lit.conf`

## Example commands for interacting with the command line

Because not all functionality of `lnd` (or `loop`/`faraday` for that matter) is available
through the web UI, it will still be necessary to interact with those daemons through the
command line.

We are going through an example for each of the command line tools and will explain the
reasons for the extra flags. The examples assume that LiT is started with the following
configuration (only relevant parts shown here):

```text
httpslisten=0.0.0.0:8443
lit-dir=~/.lit
network=testnet

remote.lnd.rpcserver=some-other-host:10009
remote.lnd.macaroonpath=/some/folder/with/lnd/data/admin.macaroon
remote.lnd.tlscertpath=/some/folder/with/lnd/data/tls.cert
```

Because in the remote `lnd` mode all other LiT components (`loop`, `pool`,
`faraday` and the UI server) listen on the same port (`8443` in this example) and
use the same TLS certificate (`~/.lit/tls.cert` in this example), some command
line calls now need some extra options that weren't necessary before.

**NOTE**: All mentioned command line tools have the following behavior in common: You
either specify the `--network` flag and the `--tlscertpath` and `--macaroonpath` are
implied by looking inside the default directories for that network. Or you specify the
`--tlscertpath` and `--macaroonpath` flags explicitly, then you **must not** set the
`--network` flag. Otherwise, you will get an error like
`[lncli] could not load global options: unable to read macaroon path (check the network setting!): open /home/<user>/.lnd/data/chain/bitcoin/testnet/admin.macaroon: no such file or directory`.

### Example `lncli` command

The `lncli` commands in the "remote" mode are the same as if `lnd` was running standalone
on a remote host. We need to specify all flags explicitly.

```shell
⛰  lncli --rpcserver=some-other-host:10009 \
  --tlscertpath=/some/folder/with/lnd/data/tls.cert \
  --macaroonpath=/some/folder/with/lnd/data/admin.macaroon \
  getinfo
```

### Example `loop` command

This is where things get a bit tricky. Because as mentioned above, `loopd` also runs on
the same port as the UI server. That's why we have to both specify the `host:port` as well
as the TLS certificate of LiT. But `loopd` verifies its own macaroon, so we have to
specify that one from the `.loop` directory.

```shell
⛰  loop --rpcserver=localhost:8443 --tlscertpath=~/.lit/tls.cert \
  --macaroonpath=~/.loop/testnet/loop.macaroon \
  quote out 500000
```

You can easily create an alias for this by adding the following line to your `~/.bashrc`
file:

```shell
⛰  alias lit-loop="loop --rpcserver=localhost:8443 --tlscertpath=~/.lit/tls.cert --macaroonpath=~/.loop/testnet/loop.macaroon"
```

### Example `pool` command

Again, `poold` also runs on the same port as the UI server and we have to
specify the `host:port` and the TLS certificate of LiT but use the macaroon from
the `.pool` directory.

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

Faraday's command line tool follows the same pattern as loop. We also have to specify the
server and TLS flags for `lnd` but use `faraday`'s macaroon:

```shell
⛰  frcli --rpcserver=localhost:8443 --tlscertpath=~/.lit/tls.cert \
  --macaroonpath=~/.faraday/testnet/faraday.macaroon \
  audit
```

You can easily create an alias for this by adding the following line to your `~/.bashrc`
file:

```shell
⛰  alias lit-frcli="frcli --rpcserver=localhost:8443 --tlscertpath=~/.lit/tls.cert --macaroonpath=~/.faraday/testnet/faraday.macaroon"
```

## Shutting down LiT

In the remote mode, there is no explicit command for stopping LiT yet. But a
clean shutdown can be achieved by either pressing `<Ctrl> + c` in the terminal
where LiT is running. Or, if LiT is running in the background, the following
command can be used to send an interrupt signal which will trigger the clean
shutdown:

```shell
⛰  kill -s INT $(pidof litd)
```
