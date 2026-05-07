import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { notify } from "@/lib/notifications";

/** Listens for new messages and friend requests addressed to me, and creates
 *  notifications for them (RLS lets me insert notifications for myself). */
export function useGlobalNotifications() {
  const { user } = useAuth();
  useEffect(() => {
    if (!user) return;

    const msgChan = supabase
      .channel(`global-msg-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `recipient_id=eq.${user.id}`,
        },
        async (payload) => {
          const m = payload.new as { sender_id: string; content: string };
          // Don't notify if you're already on that thread page (best-effort)
          const onThread =
            window.location.pathname === "/messages" &&
            new URLSearchParams(window.location.search).get("user") === m.sender_id;
          if (onThread) return;
          const { data: p } = await supabase
            .from("profiles")
            .select("username,display_name")
            .eq("id", m.sender_id)
            .maybeSingle();
          await notify(user.id, {
            kind: "message",
            title: `New message from ${p?.display_name || p?.username || "someone"}`,
            body: m.content.slice(0, 80),
            link: `/messages?user=${m.sender_id}`,
          });
        }
      )
      .subscribe();

    const reqChan = supabase
      .channel(`global-fr-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "friend_requests",
          filter: `to_user_id=eq.${user.id}`,
        },
        async (payload) => {
          const r = payload.new as { from_user_id: string };
          const { data: p } = await supabase
            .from("profiles")
            .select("username,display_name")
            .eq("id", r.from_user_id)
            .maybeSingle();
          await notify(user.id, {
            kind: "friend_request",
            title: "New friend request",
            body: `@${p?.username ?? "someone"} wants to be friends`,
            link: `/messages`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(msgChan);
      supabase.removeChannel(reqChan);
    };
  }, [user]);
}