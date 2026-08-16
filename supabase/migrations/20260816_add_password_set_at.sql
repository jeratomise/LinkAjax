-- Add password_set_at column to profiles table
-- This tracks when a user has set their password (null = no password set yet)

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS password_set_at timestamptz DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.password_set_at IS 'Timestamp when user set their password. NULL means password not yet set (magic-link only).';
