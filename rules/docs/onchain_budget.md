# On-chain budget rule

The on-chain budget rule enforces constraints on the funds that can be spent
through on-chain related RPC calls, for example those that deal with channel
opening. The rule maintains a per-session budget that is spent down by
successive API calls. An incoming request's amount (say for `BatchOpenChannel`)
is checked against the already total spent and pending budget and persisted as a
pending balance entry if enough balance is available. The request is then
transmitted to LND. In case of errors or responses from LND, pending amounts are
either deleted or moved to the spent budget accordingly.

Pending amounts are persisted to handle requests with unclear outcomes and to
ensure safety from intermediate restarts or crashes. However, this approach has
a downside as there is currently no mechanism to remove pending balances after a
restart, leading to stronger constraints on the budget than needed, as the
pending balance is counted towards the total spent budget.

To identify unprocessed pending actions later, a unique identifier is added to
the request that corresponds to the pending balance's storage key. For the
channel opening RPC specifically, it's `Memo` field is prefixed with a unique
request identifier, which is exposed in `ListChannels` and `PendingChannels`.
This identifier could be used in the future to clean up any unprocessed pending
actions provided the `ClosedChannels` API gets support for the `Memo` field.
