# Configuring LiT with remote lnd node

The "remote" mode means that `lnd` is started as a standalone process, possibly
on another host, and `litd` connects to it.
Once the connection to the remote `lnd` node has been established, `litd` then
goes ahead and starts `faraday` and `loop` and connects them to that `lnd` node
as well. As a final step the UI server is also started.

Currently the UI server cannot connect to `loop` or `faraday` daemons that
aren't running in the same process. But that feature will also be available in
future versions.

## Use command line parameters only

In addition to the LiT specific and remote `lnd` parameters, you must also
provide configuration to the `loop` and `faraday` daemons. For the remote `lnd`
node, all `remote.lnd` flags must be specified. Note that `loopd` and
`faraday` will automatically connect to the same remote `lnd` node, so you do
not need to provide them with any additional parameters unless you want to
override them. If you do override them, be sure to add the `loop.` and `faraday.`
prefixes.

To see all available command line options, run `litd --help`.

Here is an example command to start `litd` connected to a testnet `lnd`:

```
$ ./litd \
  --httpslisten=0.0.0.0:443 \
  --uipassword=My$trongP@ssword \
  --letsencrypt \
  --letsencrypthost=loop.merchant.com \
  --lnd-mode=remote \
  --lit-dir=~/.lit \
  --remote.lit-debuglevel=debug \
  --remote.lnd.network=testnet \
  --remote.lnd.rpcserver=some-other-host:10009 \
  --remote.lnd.macaroonpath=/some/folder/with/lnd/data/admin.macaroon \
  --remote.lnd.tlscertpath=/some/folder/with/lnd/data/tls.cert \
  --loop.loopoutmaxparts=5 \
  --faraday.min_monitored=48h \
  --faraday.connect_bitcoin \
  --faraday.bitcoin.host=some-other-host \
  --faraday.bitcoin.user=testnetuser \
  --faraday.bitcoin.password=testnetpw
```

NOTE: Even though LiT itself only needs `lnd`'s macaroon specified in
`--remote.lnd.macaroonpath`, the `loop` and `faraday` daemons will require other
macaroons and will look for them in the same folder. It is advised to copy all
`*.macaroon` files and the `tls.cert` file from the remote host to the host that
is running `litd`.

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
lnd-mode=remote
lit-dir=~/.lit

# Remote options
remote.lit-debuglevel=debug

# Remote lnd options
remote.lnd.network=testnet
remote.lnd.rpcserver=some-other-host:10009
remote.lnd.macaroonpath=/some/folder/with/lnd/data/admin.macaroon
remote.lnd.tlscertpath=/some/folder/with/lnd/data/tls.cert

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


## Example commands for interacting with the command line

Because not all functionality of `lnd` (or `loop`/`faraday` for that matter) is
available through the web UI, it will still be necessary to interact with those
daemons through the command line.

We are going through an example for each of the command line tools and will
explain the reasons for the extra flags.
The examples assume that LiT is started with the following configuration (only
relevant parts shown here):

```text
httpslisten=0.0.0.0:443
lnd-mode=remote
lit-dir=~/.lit

remote.lnd.network=testnet
remote.lnd.rpcserver=some-other-host:10009
remote.lnd.macaroonpath=/some/folder/with/lnd/data/admin.macaroon
remote.lnd.tlscertpath=/some/folder/with/lnd/data/tls.cert
```

Because in the remote `lnd` mode all other LiT components (`loop`, `faraday` and
the UI server) listen on the same port (`443` in this example) and use the same
TLS certificate (`~/.lit/tls.cert` in this example), some command line calls now
need some extra options that weren't necessary before.

**NOTE**: All mentioned command line tools have the following behavior in
common: You either specify the `--network` flag and the `--tlscertpath` and
`--macaroonpath` are implied by looking inside the default directories for that
network. Or you specify the `--tlscertpath` and `--macaroonpath` flags
explicitly, then you **must not** set the `--network` flag. Otherwise, you will
get an error like `[lncli] could not load global options: unable to read macaroon
path (check the network setting!): open /home/<user>/.lnd/data/chain/bitcoin/testnet/admin.macaroon:
no such file or directory`.

### Example `lncli` command

The `lncli` commands in the "remote" mode are the same as if `lnd` was
running standalone on a remote host. We need to specify all flags explicitly.

```shell script
$ lncli --rpcserver=some-other-host:10009 \
  --tlscertpath=/some/folder/with/lnd/data/tls.cert \
  --macaroonpath=/some/folder/with/lnd/data/admin.macaroon \
  getinfo
```

### Example `loop` command

This is where things get a bit tricky. Because as mentioned above, `loopd` also
runs on the same port as the UI server. That's why we have to both specify the
`host:port` as well as the TLS certificate of LiT. But `loopd` verifies its
own macaroon, so we have to specify that one from the `.loop` directory.

```shell script
$ loop --rpcserver=localhost:443 --tlscertpath=~/.lit/tls.cert \
  --macaroonpath=~/.loop/testnet/loop.macaroon \
  quote out 500000
```

You can easily create an alias for this by adding the following line to your
`~/.bashrc` file:

```shell script
alias lit-loop="loop --rpcserver=localhost:443 --tlscertpath=~/.lit/tls.cert --macaroonpath=~/.loop/testnet/loop.macaroon"
```

### Example `frcli` command

Faraday's command line tool follows the same pattern as loop. We also have to
specify the server and TLS flags for `lnd` but use `faraday`'s macaroon:

```shell script
$ frcli --rpcserver=localhost:443 --tlscertpath=~/.lit/tls.cert \
  --macaroonpath=~/.faraday/testnet/faraday.macaroon \
  audit
```

You can easily create an alias for this by adding the following line to your
`~/.bashrc` file:

```shell script
alias lit-frcli="frcli --rpcserver=localhost:443 --tlscertpath=~/.lit/tls.cert --macaroonpath=~/.faraday/testnet/faraday.macaroon"
```
