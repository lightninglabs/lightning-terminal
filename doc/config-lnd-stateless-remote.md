# Configuring LiT in stateless-remote mode

Stateless remote is a mode where LiT can be run without any sensitive data 
stored on disk. Instead, the macaroon and TLS certificate data are passed in.

## Configuring stateless-remote mode

The lit.conf (which is by default located in the .lit folder) config should 
look like this:

```
httpslisten=[::]:8443
uipassword=<insert password>
lnd-mode=stateless-remote
```

## Generating a "super" macaroon

In order to use this new stateless-remote mode. We'll need to bake a new 
"super" macaroon that is able to access LND, Pool, Loop, and Faraday. Using 
LND BakeMacaroon to create a macaroon via the command line like:

`lncli bakemacaroon --allow_external_permissions onchain:read offchain:read address:read message:read peers:read info:read invoices:read signer:read macaroon:read onchain:write offchain:write address:write message:write peers:write info:write invoices:write signer:generate macaroon:generate macaroon:write recommendation:read report:read audit:read insights:read rates:read loop:out loop:in swap:execute swap:read terms:read auth:read suggestions:read suggestions:write account:read account:write order:read order:write auction:read auth:read`

## Pass in an lndconnect string

Now, create a lndconnect string containing the host info, macaroon, and tls 
certificate, like so: https://github.com/LN-Zap/lndconnect/blob/master/lnd_connect_uri.md

In full, an example lndconnect string might look like:


`lndconnect://localhost:10009?cert=MIICbzCCAhWgAwIBAgIRAL3ybHGc4hSVHoSO49QTHzIwCgYIKoZIzj0EAwIwMzEfMB0GA1UEChMWbG5kIGF1dG9nZW5lcmF0ZWQgY2VydDEQMA4GA1UEAxMHb3JiaXRhbDAeFw0yMTA3MTEwNTM5MjVaFw0yMjA5MDUwNTM5MjVaMDMxHzAdBgNVBAoTFmxuZCBhdXRvZ2VuZXJhdGVkIGNlcnQxEDAOBgNVBAMTB29yYml0YWwwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAARy136neRMl40N2KRC%2BQXZUCbpFvYgwe1vEDmksNHBDggqY4zDDMg8OorWeUCCb%2BGaAi0z0M1sirB%2FNKu9xm4Yco4IBCDCCAQQwDgYDVR0PAQH%2FBAQDAgKkMBMGA1UdJQQMMAoGCCsGAQUFBwMBMA8GA1UdEwEB%2FwQFMAMBAf8wHQYDVR0OBBYEFESdIcJVWCF4aUqHVlqv%2BmtMORO%2FMIGsBgNVHREEgaQwgaGCB29yYml0YWyCCWxvY2FsaG9zdIIEdW5peIIKdW5peHBhY2tldIIHYnVmY29ubocEfwAAAYcQAAAAAAAAAAAAAAAAAAAAAYcEwKgABIcErBEAAYcErBIAAYcQJgEEQU0Ao5A2CXYVJBFsb4cQJgEEQU0Ao5AwGun%2F3cB0g4cQ%2FoAAAAAAAADv29UMGwZVEYcQ%2FoAAAAAAAAAAQtT%2F%2Foii0DAKBggqhkjOPQQDAgNIADBFAiEAt3%2FeNBX09qjejnZykwSls95ppasWjGHmkpqaM7T6%2BQgCIGyjfzJHx8RRy2uSbCfHctaR5%2F5v4sNUSelJIpT0o4c1&macaroon=0201047465737402067788991234560000062052d26ed139ea5af83e675500c4ccb2471f62191b745bab820f129e5588a255d2`

When making the lndconnect string, make sure to do the following:

* Remove linebreaks (\n) from the certificate, as grpc will reject a metadata
string value with linebreaks.
* Make sure the query string is valid, by encoding the url. `+` is not a valid
 character to be passed in by way of a query string, for instance.

Once litd is running, open localhost:8443 and enter the lndconnect string.


