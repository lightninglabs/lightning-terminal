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
