-- Drop all script-related tables and indexes

DROP INDEX IF EXISTS running_scripts_script_id_idx;
DROP TABLE IF EXISTS running_scripts;

DROP INDEX IF EXISTS script_kv_store_bucket_key_idx;
DROP INDEX IF EXISTS script_kv_store_bucket_idx;
DROP TABLE IF EXISTS script_kv_store;

DROP INDEX IF EXISTS script_executions_started_at_idx;
DROP INDEX IF EXISTS script_executions_state_idx;
DROP INDEX IF EXISTS script_executions_script_id_idx;
DROP TABLE IF EXISTS script_executions;

DROP INDEX IF EXISTS scripts_created_at_idx;
DROP INDEX IF EXISTS scripts_name_idx;
DROP TABLE IF EXISTS scripts;
