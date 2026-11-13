ALTER TABLE users
    ADD COLUMN IF NOT EXISTS password_failures integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_password_failure_at timestamptz,
    ADD COLUMN IF NOT EXISTS auth_locked_until timestamptz;
