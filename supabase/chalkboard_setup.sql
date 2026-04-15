-- ═══════════════════════════════════════════════════════════════
-- TENET5 Chalk Board — Supabase Setup
-- Run this in Supabase SQL Editor (supabase.com → project → SQL Editor)
-- SYSTEM_SEED = 118400
-- ═══════════════════════════════════════════════════════════════

-- 1. Create the chalkboard_marks table
CREATE TABLE IF NOT EXISTS public.chalkboard_marks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_key   text NOT NULL DEFAULT 'tenet5-public',
  user_id     text NOT NULL,
  user_name   text,
  user_email  text,
  user_avatar text,
  mode        text NOT NULL CHECK (mode IN ('draw', 'erase')) DEFAULT 'draw',
  color       text NOT NULL DEFAULT '#f5f2ec',
  size        integer NOT NULL DEFAULT 5,
  points      jsonb NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz NOT NULL DEFAULT (now() + interval '1 hour')
);

-- 2. Index for fast lookups by board_key + expiry
CREATE INDEX IF NOT EXISTS idx_chalkboard_board_expires
  ON public.chalkboard_marks (board_key, expires_at DESC);

-- 3. Enable Row Level Security
ALTER TABLE public.chalkboard_marks ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy: Anyone signed in can read all marks
CREATE POLICY "read_marks"
  ON public.chalkboard_marks
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- 5. RLS Policy: Signed-in users can insert their own marks
CREATE POLICY "insert_own_marks"
  ON public.chalkboard_marks
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- 6. RLS Policy: Anyone signed in can delete any mark (eraser)
CREATE POLICY "erase_any_mark"
  ON public.chalkboard_marks
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- 7. Enable Realtime on this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.chalkboard_marks;

-- 8. Auto-cleanup expired marks (runs every 5 minutes)
-- NOTE: pg_cron is available on Supabase Pro plans
-- If on free plan, skip this — client-side filtering handles expiry
SELECT cron.schedule(
  'cleanup_chalkboard',
  '*/5 * * * *',
  $$DELETE FROM public.chalkboard_marks WHERE expires_at < now()$$
);

-- ═══════════════════════════════════════════════════════════════
-- DONE. Next steps:
-- 1. Go to Authentication → Providers → Enable Google
-- 2. Add your Google Cloud OAuth Client ID + Secret
-- 3. Set redirect URL: https://<your-project>.supabase.co/auth/v1/callback
-- 4. Update js/config.js with your Supabase URL + anon key
-- 5. Set supabaseReady: true in js/config.js
-- ═══════════════════════════════════════════════════════════════
