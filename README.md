> This document is currently a scratchpad for developer setup and temporary hacks to run the project. It will be made more user-friendly in the future

## Setup

Create certificate for browser to backend proxy communication
```
openssl genrsa -out proxy.key 2048
openssl req -new -x509 -key proxy.key -out proxy.cert -days 365
```

## Development

Requirements: [Go](https://golang.org/doc/install), [protoc](https://github.com/protocolbuffers/protobuf/releases), [nodejs](https://nodejs.org/en/download/)

- Start your LND node
- Manually update macaroon hex in main.go `buildGrpcProxyServer` func
- Start backend server
  ```
  go run . --backend_addr=localhost:10001 --server_tls_cert_file=./proxy.cert --server_tls_key_file=./proxy.key --backend_tls=true --backend_tls_noverify=true
  ```  
> Replace `localhost:10001` with the host:port of the LND node RPC
- Run the client app in a separate terminal
  ```
  cd app
  yarn
  yarn start
  ```

Open browser at https://localhost:3000 and accept invalid cert (may not work in Chrome, use Firefox)
