-- Drop indexes first.
DROP INDEX IF EXISTS kvstores_lookup_idx;
DROP INDEX IF EXISTS features_name_idx;
DROP INDEX IF EXISTS rules_name_idx;

-- Drop tables in reverse dependency order.
DROP TABLE IF EXISTS kvstores;
DROP TABLE IF EXISTS features;
DROP TABLE IF EXISTS rules;
