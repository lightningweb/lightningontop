import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { bumpQuest } from "@/lib/quests";

/** Tracks the visitor's time on the site and credits quest progress.
 *  - "lightning" minutes credit the play_lightning_* quests
 *  - When `gameKey` is set, also credits play_minutes_* + any_game_* */
export function useActivityTracker(gameKey?: string) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    let lastBeat = Date.now();
    let visible = !document.hidden;
    let acc = 0; // accumulated seconds since last quest tick

    const tick = async () => {
      if (!visible) {
        lastBeat = Date.now();
        return;
      }
      const now = Date.now();
      const delta = Math.min(60, Math.round((now - lastBeat) / 1000));
      lastBeat = now;
      if (delta <= 0) return;
      acc += delta;
      // Credit per minute
      while (acc >= 60) {
        acc -= 60;
        if (!gameKey) {
          // Site-wide tracker
          await bumpQuest(user.id, "play_lightning_15", 1);
          await bumpQuest(user.id, "play_lightning_60", 1);
        } else {
          // Game-specific tracker
          await bumpQuest(user.id, "play_minutes_20", 1);
          await bumpQuest(user.id, "play_minutes_120", 1);
          await bumpQuest(user.id, "any_game_10", 1);
        }
      }
    };

    const onVis = () => {
      visible = !document.hidden;
      lastBeat = Date.now();
    };
    document.addEventListener("visibilitychange", onVis);
    const id = setInterval(tick, 15_000);

    // Track that the user opened this game (for play_games_* quests)
    if (gameKey) {
      (async () => {
        // dedupe via activity_sessions today
        const since = new Date();
        since.setHours(0, 0, 0, 0);
        const { data } = await supabase
          .from("activity_sessions")
          .select("id")
          .eq("user_id", user.id)
          .eq("kind", "game_open")
          .eq("key", gameKey)
          .gte("created_at", since.toISOString())
          .limit(1);
        if (!data?.length) {
          await supabase
            .from("activity_sessions")
            .insert({ user_id: user.id, kind: "game_open", key: gameKey, seconds: 0 });
          await bumpQuest(user.id, "play_games_5", 1);
          await bumpQuest(user.id, "play_games_15", 1);
        }
      })();
    }

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      clearInterval(id);
    };
  }, [user, gameKey]);
}