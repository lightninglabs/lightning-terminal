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
    value BLOB NOT NULL,

    -- Feature-scoped kv stores must always belong to a session group.
    CHECK (feature_id IS NULL OR group_id IS NOT NULL)
);

-- Mirror the legacy KVDB namespace semantics precisely. A kv store record is
-- uniquely identified by one of three namespace shapes:
--   1. Global: entry_key + rule_id + perm
--   2. Group scoped: entry_key + rule_id + perm + group_id
--   3. Feature scoped: entry_key + rule_id + perm + group_id + feature_id
--
-- A single UNIQUE index across nullable columns is not sufficient here, as
-- SQL NULL handling can allow duplicates for the global and group-scoped
-- cases that the KVDB bucket layout would never permit.
CREATE UNIQUE INDEX IF NOT EXISTS kvstores_global_lookup_idx
    ON kvstores (entry_key, rule_id, perm)
    WHERE group_id IS NULL AND feature_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS kvstores_group_lookup_idx
    ON kvstores (entry_key, rule_id, perm, group_id)
    WHERE group_id IS NOT NULL AND feature_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS kvstores_feature_lookup_idx
    ON kvstores (entry_key, rule_id, perm, group_id, feature_id)
    WHERE feature_id IS NOT NULL;
