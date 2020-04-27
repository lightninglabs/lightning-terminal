> This document is currently a scratchpad for developer setup and temporary hacks to run the project. It will be made more user-friendly in the future

![CI](https://github.com/lightninglabs/shushtar/workflows/CI/badge.svg)

Requirements: [Go](https://golang.org/doc/install), [protoc](https://github.com/protocolbuffers/protobuf/releases), [nodejs](https://nodejs.org/en/download/)

## One-time Setup

Create certificate for browser to backend proxy communication

```
openssl genrsa -out https.key 2048
openssl req -new -x509 -key https.key -out https.cert -days 365
```

Install client app dependencies

```sh
npm install -g yarn # if yarn isn't already installed
cd app/
yarn
```

## Development

- Spin up a local regtest env with nautilus and loopd (See [docker-regtest](https://github.com/lightninglabs/dev-resources/tree/master/docker-regtest))
- Create a `.env.local` file in the `app/` directory with the following content. Replace `<macaroon>` with the HEX encoded admin.macaroon of the LND node to connect to
  ```
  REACT_APP_DEV_MACAROON=<macaroon>
  REACT_APP_DEV_HOST=http://localhost:3000
  ```
- Start backend server, updating the ports for the LND and Loop nodes if necessary
  ```sh
  go run . --lndhost=localhost:10011 --loophost=localhost:11010
  ```
- Run the client app in a separate terminal
  ```sh
  cd app
  yarn start
  ```

Open browser at http://localhost:3000

## Testing

- Run all unit tests and output coverage
  ```sh
  yarn test:ci
  ```
- Run tests on locally modified files in watch mode
  ```sh
  yarn test
  ```

## Storybook Explorer

Storybook allows you to view the app's UI components using sample data. It is helpful when building components as you do not need to spin up a full development environment. It also allows you to get quick previews of how the components will be displayed in multiple different states, based on the props and data provided to them.

- Launch Storybook explorer
  ```sh
  yarn
  yarn storybook
  ```

## Logging

Client-side logs are disabled by default in production builds and enabled by default in a development environment. In production, logging can be turned on by adding a couple keys to your browser's `localStorage`. Simply run these two JS statements in you browser's DevTools console:

```
localStorage.setItem('debug', '*'); localStorage.setItem('debug-level', 'debug');
```

The value for `debug` is a namespace filter which determines which portions of the app to display logs for. The namespaces currently used by the app are as follows:

- `main`: logs general application messages
- `action`: logs all actions that modify the internal application state
- `grpc`: logs all GRPC API requests and responses

Example filters: `main,action` will only log main and action messages. `*,-action` will log everything except action messages.

The value for `debug-level` determines the verbosity of the logs. The value can be one of `debug`, `info`, `warn`, or `error`.
