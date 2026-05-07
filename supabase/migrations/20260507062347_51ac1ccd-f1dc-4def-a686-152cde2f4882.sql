
-- XP & level on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS xp integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level integer NOT NULL DEFAULT 1;

-- Friend requests
CREATE TABLE IF NOT EXISTS public.friend_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid NOT NULL,
  to_user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (from_user_id, to_user_id)
);
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "see requests involving me"
  ON public.friend_requests FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "send requests as self"
  ON public.friend_requests FOR INSERT
  WITH CHECK (auth.uid() = from_user_id AND from_user_id <> to_user_id);

CREATE POLICY "delete own requests"
  ON public.friend_requests FOR DELETE
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- Quests
CREATE TABLE IF NOT EXISTS public.quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind text NOT NULL CHECK (kind IN ('daily','weekly')),
  code text NOT NULL,
  title text NOT NULL,
  target integer NOT NULL DEFAULT 1,
  progress integer NOT NULL DEFAULT 0,
  xp_reward integer NOT NULL DEFAULT 50,
  expires_at timestamptz NOT NULL,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_quests_user ON public.quests(user_id);
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users select own quests"
  ON public.quests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users insert own quests"
  ON public.quests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own quests"
  ON public.quests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "users delete own quests"
  ON public.quests FOR DELETE USING (auth.uid() = user_id);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, created_at DESC);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users select own notifications"
  ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users insert own notifications"
  ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own notifications"
  ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "users delete own notifications"
  ON public.notifications FOR DELETE USING (auth.uid() = user_id);

-- Activity sessions (used for quest progress)
CREATE TABLE IF NOT EXISTS public.activity_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind text NOT NULL,
  key text,
  seconds integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_activity_user ON public.activity_sessions(user_id, created_at DESC);
ALTER TABLE public.activity_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users select own activity"
  ON public.activity_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users insert own activity"
  ON public.activity_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.friend_requests;

-- Profiles: allow public read of xp, level, tag (already allowed via "profiles readable by anyone")
