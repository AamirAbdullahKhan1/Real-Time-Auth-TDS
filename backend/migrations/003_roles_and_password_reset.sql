ALTER TABLE users ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'customer'
    CHECK (role IN ('admin', 'employee', 'customer'));

ALTER TABLE auth_events ADD COLUMN IF NOT EXISTS account_role text
    CHECK (account_role IN ('admin', 'employee', 'customer'));

ALTER TABLE auth_email_challenges DROP CONSTRAINT IF EXISTS auth_email_challenges_purpose_check;
ALTER TABLE auth_email_challenges ADD CONSTRAINT auth_email_challenges_purpose_check
    CHECK (purpose IN ('register', 'login', 'password_reset'));
