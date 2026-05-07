
CREATE OR REPLACE FUNCTION public.accept_friend_request(req_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  req record;
  requester_username text;
  accepter_username text;
BEGIN
  SELECT * INTO req FROM public.friend_requests WHERE id = req_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Friend request not found';
  END IF;
  IF auth.uid() <> req.to_user_id THEN
    RAISE EXCEPTION 'Not your request to accept';
  END IF;

  INSERT INTO public.friendships (user_id, friend_id)
    VALUES (req.to_user_id, req.from_user_id)
    ON CONFLICT DO NOTHING;
  INSERT INTO public.friendships (user_id, friend_id)
    VALUES (req.from_user_id, req.to_user_id)
    ON CONFLICT DO NOTHING;

  DELETE FROM public.friend_requests WHERE id = req_id;

  SELECT username INTO accepter_username FROM public.profiles WHERE id = req.to_user_id;

  INSERT INTO public.notifications (user_id, kind, title, body, link)
    VALUES (
      req.from_user_id,
      'friend_accepted',
      'Friend request accepted',
      '@' || coalesce(accepter_username,'someone') || ' accepted your request',
      '/messages?user=' || req.to_user_id::text
    );
END;
$$;
