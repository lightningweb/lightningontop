
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS tag text,
  ADD COLUMN IF NOT EXISTS banned_until timestamptz,
  ADD COLUMN IF NOT EXISTS ban_reason text;

UPDATE public.profiles
SET tag = 'STAFF'
WHERE id = '11111111-1111-1111-1111-111111111111';
