-- The sessions table contains LNC session related information.
CREATE TABLE IF NOT EXISTS sessions (
    -- The auto incrementing primary key.
    id INTEGER PRIMARY KEY,

    -- The ID that was used to identify the session in the legacy KVDB store.
    -- This is derived directly from the local_public_key. In order to avoid
    -- breaking the API, we keep this field here so that we can still look up
    -- sessions by this ID.
    alias BLOB NOT NULL UNIQUE,

    -- The session's given label.
    label TEXT NOT NULL,

    -- The session's current state.
    state SMALLINT NOT NULL,

    -- The session type.
    type SMALLINT NOT NULL,

    -- expiry is the time that the session will expire.
    expiry TIMESTAMP NOT NULL,

    -- The session's creation time.
    created_at TIMESTAMP NOT NULL,

    -- The time at which the session was revoked.
    revoked_at TIMESTAMP,

    -- The mailbox server address.
    server_address TEXT NOT NULL,

    -- Whether the connection to the server should not use TLS.
    dev_server BOOLEAN NOT NULL,

    -- The root key ID to use when baking a macaroon for this session.
    macaroon_root_key BIGINT NOT NULL,

    -- The passphrase entropy to use when deriving the mnemonic for this LNC
    -- session.
    pairing_secret BLOB NOT NULL,

    -- The private key of the long term local static key for this LNC session.
    local_private_key BLOB NOT NULL,

    -- The public key of the long term local static key for this LNC session.
    -- This is derivable from the local_private_key but is stored here since
    -- the local public key was used to identify a session when the DB was KVDB
    -- based and so to keep the API consistent, we store it here so that we can
    -- still look up sessions by this public key.
    local_public_key BLOB NOT NULL UNIQUE,

    -- The public key of the long term remote static key for this LNC session.
    remote_public_key BLOB,

    -- Whether the privacy mapper should be used for this session.
    privacy BOOLEAN NOT NULL,

    -- An optional account ID that this session is linked to.
    account_id BIGINT REFERENCES accounts(id) ON DELETE CASCADE,

    -- The session ID of the first session in this linked session group. This
    -- is nullable for the case where the first session in the group is being
    -- inserted, and so we first need to insert the session before we know the
    -- ID to use for the group ID.
    group_id BIGINT REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS sessions_type_idx ON sessions(type);
CREATE INDEX IF NOT EXISTS sessions_state_idx ON sessions(state);
CREATE INDEX IF NOT EXISTS sessions_group_id_idx ON sessions(group_id);

-- The session_macaroon_permissions table contains the macaroon permissions
-- that are associated with a session.
CREATE TABLE IF NOT EXISTS session_macaroon_permissions (
    -- The auto incrementing primary key.
    id INTEGER PRIMARY KEY,

    -- The ID of the session in the sessions table that this permission is
    -- associated with.
    session_id BIGINT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,

    -- The entity that this permission is for.
    entity TEXT NOT NULL,

    -- The action that this permission is for.
    action TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_mac_perms_idx ON session_macaroon_permissions(session_id);

-- The session_macaroon_caveats table contains the macaroon caveats that are
-- associated with a session.
CREATE TABLE IF NOT EXISTS session_macaroon_caveats (
    -- The auto incrementing primary key.
    id INTEGER PRIMARY KEY,

    -- The ID of the session in the sessions table that this caveat is
    -- associated with.
    session_id BIGINT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,

    -- The caveat ID.
    caveat_id BLOB NOT NULL,

    -- The verification ID. If this is not-null, it's a third party caveat.
    verification_id BLOB,

    -- The location hint for third party caveats.
    location TEXT
);

CREATE INDEX IF NOT EXISTS sessions_mac_caveats_idx ON session_macaroon_caveats(session_id);

-- The session_feature_configs table contains the feature configs that are
-- associated with a session.
CREATE TABLE IF NOT EXISTS session_feature_configs (
    -- The ID of the session in the sessions table that this feature config is
    -- associated with.
    session_id BIGINT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,

    -- The feature name.
    feature_name TEXT NOT NULL,

    -- The feature config blob.
    config BLOB
);

CREATE UNIQUE INDEX session_feature_configs_unique ON session_feature_configs (
    session_id, feature_name
);

-- The session_privacy_flags table contains the privacy flags that are
-- associated with a session.
CREATE TABLE IF NOT EXISTS session_privacy_flags (
    -- The ID of the session in the sessions table that this privacy bit is
    -- associated with.
    session_id BIGINT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,

    -- The privacy flag bit.
    flag INTEGER NOT NULL
);

CREATE UNIQUE INDEX session_priv_flags_unique ON session_privacy_flags (
    session_id, flag
);
