
-- Drop FK so we can have a non-auth system profile
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name text;
UPDATE public.profiles SET display_name = username WHERE display_name IS NULL;

INSERT INTO public.profiles (id, username, display_name)
VALUES ('11111111-1111-1111-1111-111111111111', 'lightning', 'Lightning')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.friendships (
  user_id uuid NOT NULL,
  friend_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, friend_id)
);
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users see own friendships" ON public.friendships;
DROP POLICY IF EXISTS "users add own friendships" ON public.friendships;
DROP POLICY IF EXISTS "users delete own friendships" ON public.friendships;
CREATE POLICY "users see own friendships" ON public.friendships
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "users add own friendships" ON public.friendships
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users delete own friendships" ON public.friendships
  FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS messages_pair_idx ON public.messages (sender_id, recipient_id, created_at);
CREATE INDEX IF NOT EXISTS messages_recipient_idx ON public.messages (recipient_id, created_at);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users read own messages" ON public.messages;
DROP POLICY IF EXISTS "users send messages as self" ON public.messages;
CREATE POLICY "users read own messages" ON public.messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "users send messages as self" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

ALTER TABLE public.messages REPLICA IDENTITY FULL;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uname text;
  lightning_id uuid := '11111111-1111-1111-1111-111111111111';
BEGIN
  uname := coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1));
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (new.id, uname, uname)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.friendships (user_id, friend_id)
  VALUES (new.id, lightning_id)
  ON CONFLICT DO NOTHING;

  INSERT INTO public.messages (sender_id, recipient_id, content)
  VALUES (lightning_id, new.id, 'Welcome to lightning! Feel free to ask any questions or give any problems or suggestions here.');

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.friendships (user_id, friend_id)
SELECT p.id, '11111111-1111-1111-1111-111111111111'
FROM public.profiles p
WHERE p.id <> '11111111-1111-1111-1111-111111111111'
ON CONFLICT DO NOTHING;

INSERT INTO public.messages (sender_id, recipient_id, content)
SELECT '11111111-1111-1111-1111-111111111111', p.id,
  'Welcome to lightning! Feel free to ask any questions or give any problems or suggestions here.'
FROM public.profiles p
WHERE p.id <> '11111111-1111-1111-1111-111111111111'
  AND NOT EXISTS (
    SELECT 1 FROM public.messages m
    WHERE m.sender_id = '11111111-1111-1111-1111-111111111111'
      AND m.recipient_id = p.id
  );
