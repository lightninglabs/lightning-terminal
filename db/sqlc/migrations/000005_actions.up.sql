CREATE TABLE IF NOT EXISTS actions(
    -- The ID of the action.
    id INTEGER PRIMARY KEY,

    -- The session ID of the session that this action is associated with.
    -- This may be null for actions that are not coupled to a session.
    session_id BIGINT REFERENCES sessions(id) ON DELETE CASCADE,

    -- The account ID of the account that this action is associated with.
    -- This may be null for actions that are not coupled to an account.
    account_id BIGINT REFERENCES accounts(id) ON DELETE CASCADE,

    -- An ID derived from the macaroon used to perform the action.
    macaroon_identifier BLOB,

    -- The name of the entity who performed the action.
    actor_name TEXT,

    -- The name of the feature that the action is being performed by.
    feature_name TEXT,

    -- Meta info detailing what caused this action to be executed.
    action_trigger TEXT,

    -- Meta info detailing what the intended outcome of this action will be.
    intent TEXT,

    -- Extra structured JSON data that an actor can send along with the
    -- action as json.
    structured_json_data BLOB,

    -- The method URI that was called.
    rpc_method TEXT NOT NULL,

    -- The method parameters of the request in JSON form.
    rpc_params_json BLOB,

    -- The time at which this action was created.
    created_at TIMESTAMP NOT NULL,

    -- The current state of the action.
    action_state SMALLINT NOT NULL,

    -- Human-readable reason for why the action failed.
    -- It will only be set if state is ActionStateError (3).
    error_reason TEXT
);

CREATE INDEX IF NOT EXISTS actions_state_idx ON actions(action_state);
CREATE INDEX IF NOT EXISTS actions_session_id_idx ON actions(session_id);
CREATE INDEX IF NOT EXISTS actions_feature_name_idx ON actions(feature_name);
CREATE INDEX IF NOT EXISTS actions_created_at_idx ON actions(created_at);