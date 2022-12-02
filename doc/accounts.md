# Custodial accounts

This document describes how the "accounts" feature of LiT can be used to create
custodial user accounts with their own balances on an existing `lnd` node.

## What is an account?

An account in the LiT context is a virtual construct that provides restricted
access to an existing `lnd`/LiT node. An account has a virtual (off-chain only)
balance in satoshis and an optional expiration. That allows a node operator to
give someone else (or some client application, see [Use cases](#use-cases))
restricted access to their node with the ability to only spend up to a certain
amount of the node's channel balance.

NOTE: An account's balance is purely virtual. If an account is created with an
initial balance higher than the node's actual overall channel balance, that is
equivalent to fractional reserve banking. Therefore, the user accepting an
account restricted access enters a trust relationship with the node operator
that the promised balance of the account is actually spendable.

## How do accounts work?

The accounts systems is made possible thanks to the power of
[macaroons](https://github.com/lightningnetwork/lnd/blob/master/docs/macaroons.md)
and the [RPC middleware
interceptor](https://github.com/lightningnetwork/lnd/blob/master/lnrpc/lightning.proto#L558)
of `lnd`.

**What does that mean?**     

It means a node operator can give another user or client application access to
their node through the default gRPC interface of `lnd`, which makes this access
mode fully compatible with any remote (or local) user interfaces or
apps/browser plugins, as well as any [LNC (Lightning Node
Connect)](https://github.com/lightninglabs/lightning-node-connect) connection.

What features and balance the restricted user has access to is **solely
controlled by the macaroon that is given to the user**. So a user that wants to
get restricted access to a node will receive a macaroon that is bound to an
account that is defined in LiT. Because of the cryptographic setup of macaroons,
that restriction cannot be removed from the macaroon by the user without
invalidating the macaroon itself. Therefore, any user/application using such a
restricted macaroon will trigger special rules in the RPC middleware interceptor
mentioned above. See [the features](#features) section below to find out what
those rules are.

## Features

When an account-restricted macaroon is used, the RPC middleware interceptor
enforces the following rules on the RPC interface:

* Any payment made by a custodial/restricted user account is deducted from an
  account's virtual balance (the full amount, including off-chain routing fees).
* If a payment (or the sum of multiple in-flight payments) exceeds the account's
  virtual balance, it is denied.
* The on-chain balance of any RPC responses such as the `WalletBalance` RPC is
  always shown as `0`. A custodial/restricted user shouldn't be able to see what
  on-chain balance is available to the node operator as an account can only
  spend off-chain balances anyway.
* The off-chain balance (e.g. the response returned by the `ChannelBalance` RPC)
  always reflects the account's virtual balance and not the node's overall
  channel balance (and any remote balances are always shown as `0`).
* The list of active/pending/closed channels is always returned empty. The
  custodial/restricted user should not need to care (or even know) about
  channels and their internal workings.
* The list of payments and invoices is filtered to only return payments/invoices
  created or paid by the account.
* Invoices created by an account are mapped to that account. If/when such a
  mapped invoice is paid, the amount is credited to that account's virtual
  balance.

## Use cases

The following (definitely non-exhaustive) list of use cases is made possible by
the accounts system:
 - The "Uncle Jim" model: The tech-savvy person of the family (e.g. "Uncle Jim")
   operates a Lightning node. He manages the liquidity of the node and provides
   the capital for the channels. He can onboard his family members by creating
   an account, locking a macaroon to that account and then scanning a QR code
   with an app like [Zeus](https://github.com/ZeusLN/zeus) on the family
   member's smartphone.
 - The "spend up to a certain amount automatically" model: A web user has a
   browser extension like [Alby](https://getalby.com/) installed and wants to
   allow that extension to pay invoices for paywalls automatically up to a
   certain amount per month. That amount could be enforced by the account so the
   browser extension doesn't have to keep track of its spending actions. And an
   account can be shared between extensions installed in different browsers.
 - The "allowance" model: A parent wants to give their child their allowance in
   Lightning satoshis. They create an account over the allowance amount and top
   up the account each week/month.

## HOWTO

This section describes how an account can be created and used.

### Create the account

The first thing that needs to be done is to create the account with its initial
balance (and an optional expiry). This **needs to be done by the node
operator**, meaning access to the `lit.macaroon` is required.

Example:
```shell
$ litcli accounts create 50000 --save_to /tmp/accounts.macaroon

{
        "account": {
                "id": "d64dbc31b28edf66",
                "initial_balance": "50000",
                "current_balance": "50000",
                "last_update": "1652353332",
                "expiration_date": "0"
        },
        "macaroon": "020103........."
}
Account macaroon saved to /tmp/accounts.macaroon
```

This created a new account (ID `d64dbc31b28edf66`) with an initial balance of
50k satoshis and no expiration. A new macaroon was baked that contains the
correct permissions and is locked to that account. The macaroon file was stored
under `/tmp/accounts.macaroon` in this example.

### Use the macaroon

This step is done by the user/app that should be given the restricted access. An
example could be to create a QR code with a tool like
[`lndconnect`](https://github.com/LN-Zap/lndconnect) that can be scanned by
mobile apps to connect to the node. Or some browser extensions require the user
to upload the macaroon to the browser.

**It's absolutely crucial to use the macaroon generated in the previous step
here** to make sure the restrictions are applied.

The permissions and restrictions of a macaroon can always be inspected by:
```shell
$ lncli printmacaroon --macaroon_file /tmp/accounts.macaroon

{
        "version": 2,
        "location": "lnd",
        "root_key_id": "0",
        "permissions": [
                "info:read",
                "invoices:read",
                "invoices:write",
                "offchain:read",
                "offchain:write",
                "onchain:read"
        ],
        "caveats": [
                "lnd-custom account d64dbc31b28edf66"
        ]
}
```

The important part is the `lnd-custom account ...` part in the `caveats`
section.

Example of using `lncli` to check the account balance (assuming integrated `lnd`
mode, adjust RPC server/port and TLS cert for remote mode):
```shell
$ lncli --macaroonpath=/tmp/accounts.macaroon channelbalance

{
    "balance": "5000",
    "pending_open_balance": "0",
    "local_balance": {
        "sat": "5000",
        "msat": "5000000"
    },
    "remote_balance": {
        "sat": "0",
        "msat": "0"
    }
    ...
}
```
