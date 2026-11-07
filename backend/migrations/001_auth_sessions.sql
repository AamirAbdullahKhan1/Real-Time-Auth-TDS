CREATE TABLE IF NOT EXISTS auth_sessions (
    id uuid PRIMARY KEY,
    user_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at timestamptz NOT NULL,
    revoked_at timestamptz
);
