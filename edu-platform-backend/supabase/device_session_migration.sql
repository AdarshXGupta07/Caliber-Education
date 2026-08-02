-- Add single concurrent session management support

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS active_session_id text;

-- This column is updated perfectly with a random UUID on every successful /login or /register.
-- Any request hitting backend routers using an older JWT (with a mismatched session ID) 
-- will immediately return 403 FORBIDDEN.
