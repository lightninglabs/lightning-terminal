## Troubleshooting

If you have trouble running your node, please first check the logs for warnings or errors.
If there are errors relating to one of the embedded servers, then you should open an issue
in their respective GitHub repos ([lnd](https://github.com/lightningnetwork/lnd/issues),
[loop](https://github.com/lightninglabs/loop/issues),
[pool](https://github.com/lightninglabs/pool/issues),
[faraday](https://github.com/lightninglabs/faraday/issues). If the issue is related to the
web app, then you should open an
[issue](https://github.com/lightninglabs/lightning-terminal/issues) here in this repo.

### Server

Server-side logs are stored in the directory specified by `lnd.lnddir` in your
configuration. Inside, there is a `logs` dir containing the log files in subdirectories.
Be sure to set `lnd.debuglevel=debug` in your configuration to see the most verbose
logging information.

### Browser

Client-side logs are disabled by default in production builds. Logging can be turned on by
adding a couple keys to your browser's `localStorage`. Simply run these two JS statements
in you browser's DevTools console then refresh the page:

```javascript
localStorage.setItem('debug', '*'); localStorage.setItem('debug-level', 'debug');
```

The value for `debug` is a namespace filter which determines which portions of the app to
display logs for. The namespaces currently used by the app are as follows:

- `main`: logs general application messages
- `action`: logs all actions that modify the internal application state
- `grpc`: logs all GRPC API requests and responses

Example filters: `main,action` will only log main and action messages. `*,-action` will
log everything except action messages.

The value for `debug-level` determines the verbosity of the logs. The value can be one of
`debug`, `info`, `warn`, or `error`.
