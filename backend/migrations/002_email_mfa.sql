ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at timestamptz;

CREATE TABLE IF NOT EXISTS auth_email_challenges (
    id uuid PRIMARY KEY,
    user_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    purpose text NOT NULL CHECK (purpose IN ('register', 'login')),
    code_digest text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz NOT NULL,
    failed_attempts integer NOT NULL DEFAULT 0 CHECK (failed_attempts BETWEEN 0 AND 5),
    consumed_at timestamptz,
    invalidated_at timestamptz
);

CREATE INDEX IF NOT EXISTS auth_email_challenges_account_time_idx
    ON auth_email_challenges (user_id, created_at DESC);

ALTER TABLE auth_sessions ADD COLUMN IF NOT EXISTS email_challenge_id uuid
    UNIQUE REFERENCES auth_email_challenges(id);
