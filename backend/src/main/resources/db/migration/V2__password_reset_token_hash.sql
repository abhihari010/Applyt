-- PasswordResetToken maps to token_hash, but V1 only created a plaintext "token" column.
-- Written to be safe whether or not token_hash was already added to this database by hand.
ALTER TABLE password_reset_tokens ADD COLUMN IF NOT EXISTS token_hash text;

-- Reset tokens last one hour and rows without a hash can never be looked up, so nothing usable is lost.
DELETE FROM password_reset_tokens WHERE token_hash IS NULL;

ALTER TABLE password_reset_tokens ALTER COLUMN token_hash SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_password_reset_tokens_token_hash ON password_reset_tokens(token_hash);
ALTER TABLE password_reset_tokens DROP COLUMN IF EXISTS token;
