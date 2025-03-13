-- privacy_pairs stores the privacy map pairs for a given session group.
CREATE TABLE IF NOT EXISTS privacy_pairs (
    -- The group ID of the session that this privacy pair is associated
    -- with.
    group_id BIGINT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,

    -- The real value of the privacy pair.
    real_val TEXT NOT NULL,

    -- The pseudo value of the privacy pair.
    pseudo_val TEXT NOT NULL
);

-- There should be no duplicate real values for a given group ID.
CREATE UNIQUE INDEX privacy_pairs_unique_real ON privacy_pairs (
    group_id, real_val
);

-- There should be no duplicate pseudo values for a given group ID.
CREATE UNIQUE INDEX privacy_pairs_unique_pseudo ON privacy_pairs (
    group_id, pseudo_val
);

