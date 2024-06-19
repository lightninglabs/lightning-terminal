# Test scenarios

The possible number of combinations of local/remote configurations has become
quite large over time.

The following tests should be run whenever something in the local/remote config
or proxying changes:

## `lnd` integrated

### All daemons integrated

```shell
--httpslisten=[::]:8443
--uipassword=testnet3
--network=regtest
--lnd-mode=integrated
...
```

1. Open UI, make sure Loop and Pool calls are served correctly
2. Use `lncli` against LiT
   `lncli --network regtest getinfo`
3. Use `pool` and `loop` CLI against `lnd` main gRPC server (port `10009`) 
   - `loop --rpcserver=localhost:10009 --tlscertpath=~/.lnd/tls.cert --macaroonpath=~/.loop/regtest/loop.macaroon terms`
   - `pool --rpcserver=localhost:10009 --tlscertpath=~/.lnd/tls.cert --macaroonpath=~/.pool/regtest/pool.macaroon getinfo`
4. Use `pool` and `loop` CLI against  LiT proxy server (port `8443`)
   - `loop --rpcserver=localhost:8443 --tlscertpath=~/.lnd/tls.cert --macaroonpath=~/.loop/regtest/loop.macaroon terms`
   - `pool --rpcserver=localhost:8443 --tlscertpath=~/.lnd/tls.cert --macaroonpath=~/.pool/regtest/pool.macaroon getinfo`

### Loop daemon remote

```shell
--httpslisten=[::]:8443
--uipassword=testnet3
--network=regtest
--lnd-mode=integrated
--loop-mode=remote
...
```

1. Open UI, make sure Loop and Pool calls are served correctly
2. Use `lncli` against LiT
   `lncli --network regtest getinfo`
3. Use `pool` and `loop` CLI against `lnd` main gRPC server (port `10009`)
   - `loop --rpcserver=localhost:10009 --tlscertpath=~/.lnd/tls.cert --macaroonpath=~/.loop/regtest/loop.macaroon terms`
     **Expect to get an `unknown service` error!**
   - `pool --rpcserver=localhost:10009 --tlscertpath=~/.lnd/tls.cert --macaroonpath=~/.pool/regtest/pool.macaroon getinfo`
     **Expect to get an `unknown service` error!**
4. Use `pool` and `loop` CLI against  LiT proxy server (port `8443`)
   - `loop --rpcserver=localhost:8443 --tlscertpath=~/.lnd/tls.cert --macaroonpath=~/.loop/regtest/loop.macaroon terms`
   - `pool --rpcserver=localhost:8443 --tlscertpath=~/.lnd/tls.cert --macaroonpath=~/.pool/regtest/pool.macaroon getinfo`

## `lnd` remote

### All daemons integrated

```shell
--httpslisten=[::]:8443
--uipassword=testnet3
--network=regtest
--remote.lnd.rpcserver=localhost:10009
...
```

1. Open UI, make sure Loop and Pool calls are served correctly
2. Use `lncli` against LiT
   `lncli --network regtest --rpcserver=localhost:8443 --tlscertpath=~/.lit/tls.cert --macaroonpath=~/.lnd/data/chain/bitcoin/regtest/admin.macaroon getinfo`
3. Use `pool` and `loop` CLI against LiT proxy server (port `8443`)
   - `loop --rpcserver=localhost:8443 --tlscertpath=~/.lit/tls.cert --macaroonpath=~/.loop/regtest/loop.macaroon terms`
   - `pool --rpcserver=localhost:8443 --tlscertpath=~/.lit/tls.cert --macaroonpath=~/.pool/regtest/pool.macaroon getinfo`

### Loop daemon remote

```shell
--httpslisten=[::]:8443
--uipassword=testnet3
--network=regtest
--remote.lnd.rpcserver=localhost:10009
--loop-mode=remote
...
```

1. Open UI, make sure Loop and Pool calls are served correctly
2. Use `lncli` against LiT
   `lncli --network regtest --rpcserver=localhost:8443 --tlscertpath=~/.lit/tls.cert --macaroonpath=~/.lnd/data/chain/bitcoin/regtest/admin.macaroon getinfo`
3. Use `pool` and `loop` CLI against LiT proxy server (port `8443`)
   - `loop --rpcserver=localhost:8443 --tlscertpath=~/.lit/tls.cert --macaroonpath=~/.loop/regtest/loop.macaroon terms`
   - `pool --rpcserver=localhost:8443 --tlscertpath=~/.lit/tls.cert --macaroonpath=~/.pool/regtest/pool.macaroon getinfo`
