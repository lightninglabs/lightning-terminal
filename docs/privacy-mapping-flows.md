# Privacy Mapping Call Flows

The privacy mapper translates real network identifiers (pubkeys, channel
IDs, amounts) into pseudonymous values for LNC sessions, so a session
operator can interact with node data without learning the host's actual
topology. LiT applies this mapping at two different layers depending on
which service the request targets; the diagrams below contrast the two
flows.

## LND Requests (e.g. `/lnrpc.Lightning/GetInfo`)

LND calls are proxied through to LND, which applies privacy mapping via
its own middleware chain (`PrivacyMapper.Intercept`). The LNC interceptor
detects LND URIs and passes them through without mapping.

```mermaid
sequenceDiagram
    participant C as LNC Client
    participant S as Session ID Injector
    participant P as PrivacyMapper.UnaryInterceptor
    participant R as rpcProxy (auth/routing)
    participant L as LND
    participant MW as LND Middleware
    participant PM as PrivacyMapper.Intercept

    C->>S: gRPC request
    S->>P: ctx with server-assigned session ID
    P->>P: isLndURI() → true, skip
    P->>R: pass through
    R->>L: proxy to LND
    L->>MW: middleware intercept
    MW->>PM: pseudo → real (request)
    PM-->>L: mapped request
    L-->>MW: response
    MW->>PM: real → pseudo (response)
    PM-->>R: mapped response
    R-->>C: pseudonymous response
```

## Sub-daemon Requests (e.g. `/frdrpc.FaradayServer/RevenueReport`)

Non-LND calls are privacy-mapped at the gRPC interceptor level before
reaching the sub-daemon. The interceptor checks the session's
`WithPrivacyMapper` flag and applies request/response mapping inline.

```mermaid
sequenceDiagram
    participant C as LNC Client
    participant S as Session ID Injector
    participant P as PrivacyMapper.UnaryInterceptor
    participant R as rpcProxy (auth/routing)
    participant F as Sub-daemon (Faraday)

    C->>S: gRPC request
    S->>P: ctx with server-assigned session ID
    P->>P: isLndURI() → false
    P->>P: check WithPrivacyMapper
    P->>P: pseudo → real (request)
    P->>R: mapped request
    R->>F: forward to sub-daemon
    F-->>R: response
    R-->>P: raw response
    P->>P: real → pseudo (response)
    P-->>C: pseudonymous response
```
