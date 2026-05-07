import { supabase } from "@/integrations/supabase/client";

export type Notification = {
  id: string;
  user_id: string;
  kind: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

/** Insert a notification for `userId`. Caller must be that user (RLS). */
export async function notify(
  userId: string,
  n: { kind: string; title: string; body?: string; link?: string }
) {
  await supabase.from("notifications").insert({
    user_id: userId,
    kind: n.kind,
    title: n.title,
    body: n.body ?? null,
    link: n.link ?? null,
  });
}