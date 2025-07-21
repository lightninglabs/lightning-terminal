-- rules holds the unique names of the various rules that are used
-- known to lit and used by the firewall db.
CREATE TABLE IF NOT EXISTS rules (
    -- The auto incrementing primary key.
    id INTEGER PRIMARY KEY,

    -- The unique name of the rule.
    name TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS rules_name_idx ON rules (name);

-- features holds the unique names of the various features that
-- kvstores can be associated with.
CREATE TABLE IF NOT EXISTS features (
    -- The auto incrementing primary key.
    id INTEGER PRIMARY KEY,

    -- The unique name of the feature.
    name TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS features_name_idx ON features (name);

-- kvstores houses key-value pairs under various namespaces determined
-- by the rule name, group ID, and feature name.
CREATE TABLE IF NOT EXISTS kvstores (
    -- The auto incrementing primary key.
    id INTEGER PRIMARY KEY,

    -- Whether this record is part of the permanent store.
    -- If false, it will be deleted on start-up.
    perm BOOLEAN NOT NULL,

    -- The rule that this kv_store belongs to.
    -- If only the rule name is set, then this kv_store is a global
    -- kv_store.
    rule_id BIGINT REFERENCES rules(id) NOT NULL,

    -- The group ID that this kv_store belongs to.
    -- If this is set, then this kv_store is a session-group specific
    -- kv_store for the given rule.
    group_id BIGINT REFERENCES sessions(id) ON DELETE CASCADE,

    -- The feature name that this kv_store belongs to.
    -- If this is set, then this kv_store is a feature-specific
    -- kvstore under the given group ID and rule name.
    -- If this is set, then group_id must also be set.
    feature_id BIGINT REFERENCES features(id),

    -- The key of the entry.
    entry_key TEXT NOT NULL,

    -- The value of the entry.
    value BLOB NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS kvstores_lookup_idx
    ON kvstores (entry_key, rule_id, perm, group_id, feature_id);
