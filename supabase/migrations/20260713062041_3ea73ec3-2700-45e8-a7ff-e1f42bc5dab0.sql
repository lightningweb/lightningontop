ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar text,
  ADD COLUMN IF NOT EXISTS current_game text,
  ADD COLUMN IF NOT EXISTS current_game_at timestamptz;