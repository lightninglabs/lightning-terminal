-- Scripts table: stores script definitions with their macaroon permissions
CREATE TABLE IF NOT EXISTS scripts (
    -- The unique identifier for the script.
    id INTEGER PRIMARY KEY,

    -- A user-assigned unique name for the script.
    name TEXT NOT NULL UNIQUE,

    -- An optional description of what the script does.
    description TEXT,

    -- The Starlark source code of the script.
    source TEXT NOT NULL,

    -- The hex-encoded macaroon baked with specific permissions for this script.
    -- This macaroon is used to authenticate RPC calls made by the script.
    macaroon TEXT NOT NULL,

    -- Timeout in seconds for script execution. 0 means no timeout (for long-running scripts).
    timeout_secs INTEGER DEFAULT 0,

    -- Maximum memory in bytes the script can use. Default is 100MB.
    max_memory_bytes BIGINT DEFAULT 104857600,

    -- JSON array of URL patterns that the script is allowed to access via http_get.
    allowed_urls TEXT,

    -- JSON array of KV bucket names the script can access beyond its own bucket.
    allowed_buckets TEXT,

    -- Timestamp when the script was created.
    created_at TIMESTAMP NOT NULL,

    -- Timestamp when the script was last updated.
    updated_at TIMESTAMP NOT NULL
);

-- Index for quick lookups by name.
CREATE INDEX IF NOT EXISTS scripts_name_idx ON scripts(name);
CREATE INDEX IF NOT EXISTS scripts_created_at_idx ON scripts(created_at);

-- Script executions table: records execution history for auditing
CREATE TABLE IF NOT EXISTS script_executions (
    -- The unique identifier for the execution.
    id INTEGER PRIMARY KEY,

    -- The script that was executed.
    script_id BIGINT NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,

    -- When the execution started.
    started_at TIMESTAMP NOT NULL,

    -- When the execution ended (NULL if still running).
    ended_at TIMESTAMP,

    -- The current state of the execution: 'running', 'completed', 'failed', 'stopped'.
    state TEXT NOT NULL DEFAULT 'running',

    -- JSON-encoded result of the script execution.
    result_json TEXT,

    -- Error message if the script failed.
    error_message TEXT,

    -- Duration of the execution in milliseconds.
    duration_ms BIGINT
);

CREATE INDEX IF NOT EXISTS script_executions_script_id_idx ON script_executions(script_id);
CREATE INDEX IF NOT EXISTS script_executions_state_idx ON script_executions(state);
CREATE INDEX IF NOT EXISTS script_executions_started_at_idx ON script_executions(started_at);

-- KV store table: persistent key-value storage for scripts
CREATE TABLE IF NOT EXISTS script_kv_store (
    -- The unique identifier for the KV entry.
    id INTEGER PRIMARY KEY,

    -- The bucket name. Default bucket for each script is its script name.
    bucket TEXT NOT NULL,

    -- The key within the bucket.
    key TEXT NOT NULL,

    -- The value stored (binary data).
    value BLOB,

    -- When the entry was created.
    created_at TIMESTAMP NOT NULL,

    -- When the entry was last updated.
    updated_at TIMESTAMP NOT NULL,

    -- Ensure unique key within each bucket.
    UNIQUE(bucket, key)
);

CREATE INDEX IF NOT EXISTS script_kv_store_bucket_idx ON script_kv_store(bucket);
CREATE INDEX IF NOT EXISTS script_kv_store_bucket_key_idx ON script_kv_store(bucket, key);

-- Running scripts table: tracks currently running scripts for restart recovery
CREATE TABLE IF NOT EXISTS running_scripts (
    -- The unique identifier for the running script entry.
    id INTEGER PRIMARY KEY,

    -- The script that is running.
    script_id BIGINT NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,

    -- The execution record for this running instance.
    execution_id BIGINT REFERENCES script_executions(id),

    -- When the script was started.
    started_at TIMESTAMP NOT NULL,

    -- Only one instance of each script can run at a time.
    UNIQUE(script_id)
);

CREATE INDEX IF NOT EXISTS running_scripts_script_id_idx ON running_scripts(script_id);
