## Run Lightning Terminal with a remote LND instance
To connect Lightning Terminal to a remote LND instance first make sure your `lnd.conf` file contains the following additional configuration settings:
```text
tlsextraip=<externally-reachable-ip-address>
rpclisten=0.0.0.0:10009
rpcmiddleware.enable=true
```

Copy the following files that are located in your `~/.lnd/data/chain/bitcoin/mainnet` directory on your remote machine to `/some/folder/with/lnd/data/` on your local machine (where you’ll be running LiT):
- tls.cert
- admin.macaroon

Create a `lit.conf` file. The default location LiT will look for the configuration file depends on your operating system:
- MacOS: `~/Library/Application Support/Lit/lit.conf`
- Linux: `~/.lit/lit.conf`
- Windows: `~/AppData/Roaming/Lit/lit.conf`

Alternatively you can specify a different location by passing `--lit-dir=~/.lit`.  After creating `lit.conf` populate it with the following configuration settings:
```text
remote.lnd.rpcserver=<externally-reachable-ip-address>:10009
remote.lnd.macaroonpath=/some/folder/with/lnd/data/admin.macaroon
remote.lnd.tlscertpath=/some/folder/with/lnd/data/tls.cert
```

Run LiT:
```shell
⛰  ./litd --uipassword=UP48lm4VjqxmOxB9X9stry6VTKBRQI
```

Visit https://localhost:8443 to access LiT.

For further information on configuring LiT in remote mode see [these instructions](config-lnd-remote.md).
