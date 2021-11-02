# Using a custom path for LiT

If required LiT can be built to be accessed through a custom path (e.g. `/lit/`)
in the browser instead of the default root path (`/`).

To build LiT with a custom path, run the following command:

```shell
⛰  make PUBLIC_URL=/my-custom-path
```

**Make sure to not include a `/` at the end of the path.** To revert to the
original, root path, set the variable to empty (`make PUBLIC_URL=`) or leave
it out completely.

## Docker image built with a path prefix

There is a docker image that's automatically built with the prefix `/lit`
available on Docker Hub. Just append `-path-prefix` to any version tag (after
`v0.5.2-alpha`). For example:

```shell
# Default image.
⛰  docker pull lightninglabs/lightning-terminal:v0.5.3-alpha

# Image with /lit path prefix.
⛰  docker pull lightninglabs/lightning-terminal:v0.5.3-alpha-path-prefix
```

## Use with nginx reverse proxy

There is [an example nginx](example-nginx.conf) config file that demonstrates
how rewrite rules can be set up to run LiT under the `/lit` path prefix (and
internally forward all `grpc-web` requests to the LiT proxy while still
forwarding "native" gRPC requests to the `lnd` instance that's also running
behind the nginx reverse proxy).

The example reverse proxy can be run with:

```shell
⛰  cd docs
⛰  docker run --name lit-nginx \
      -v $(pwd)/example-nginx.conf:/etc/nginx/nginx.conf:ro -p 8081:80 -d nginx
```
