> This document is currently a scratchpad for developer setup and temporary hacks to run the project. It will be made more user-friendly in the future

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
