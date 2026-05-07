import { supabase } from "@/integrations/supabase/client";
import { notify } from "@/lib/notifications";

export type Quest = {
  id: string;
  user_id: string;
  kind: "daily" | "weekly";
  code: string;
  title: string;
  target: number;
  progress: number;
  xp_reward: number;
  expires_at: string;
  completed_at: string | null;
};

const DAILY_POOL = [
  { code: "play_games_5", title: "Play 5 different games", target: 5, xp: 80 },
  { code: "play_lightning_15", title: "Spend 15 minutes on lightning", target: 15, xp: 60 },
  { code: "watch_videos_10", title: "Watch videos for 10 minutes", target: 10, xp: 60 },
  { code: "send_messages_3", title: "Send 3 direct messages", target: 3, xp: 40 },
  { code: "play_minutes_20", title: "Play games for 20 minutes total", target: 20, xp: 70 },
  { code: "open_apps_3", title: "Open 3 different apps", target: 3, xp: 50 },
  { code: "any_game_10", title: "Play any one game for 10 minutes", target: 10, xp: 60 },
];

const WEEKLY_POOL = [
  { code: "friend_someone", title: "Add a new friend", target: 1, xp: 200 },
  { code: "play_games_15", title: "Play 15 different games this week", target: 15, xp: 300 },
  { code: "play_minutes_120", title: "Play games for 2 hours this week", target: 120, xp: 250 },
  { code: "send_messages_15", title: "Send 15 messages this week", target: 15, xp: 200 },
  { code: "watch_videos_60", title: "Watch videos for an hour this week", target: 60, xp: 250 },
  { code: "play_lightning_60", title: "Spend an hour on lightning", target: 60, xp: 200 },
];

const pickRandom = <T,>(pool: T[], n: number) => {
  const copy = [...pool];
  const out: T[] = [];
  while (out.length < n && copy.length) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  }
  return out;
};

const endOfDay = () => {
  const d = new Date();
  d.setHours(24, 0, 0, 0);
  return d.toISOString();
};
const endOfWeek = () => {
  const d = new Date();
  const day = d.getDay() || 7; // Mon=1..Sun=7
  d.setHours(24, 0, 0, 0);
  d.setDate(d.getDate() + (8 - day));
  return d.toISOString();
};

export async function ensureQuests(userId: string): Promise<Quest[]> {
  const { data: existing } = await supabase
    .from("quests")
    .select("*")
    .eq("user_id", userId);

  const now = new Date();
  const valid = (existing ?? []).filter((q) => new Date(q.expires_at) > now) as Quest[];
  const expiredIds = (existing ?? []).filter((q) => new Date(q.expires_at) <= now).map((q) => q.id);
  if (expiredIds.length) await supabase.from("quests").delete().in("id", expiredIds);

  const haveDaily = valid.filter((q) => q.kind === "daily").length;
  const haveWeekly = valid.filter((q) => q.kind === "weekly").length;

  const inserts: Omit<Quest, "id" | "completed_at">[] = [];
  if (haveDaily < 3) {
    const usedCodes = new Set(valid.filter((q) => q.kind === "daily").map((q) => q.code));
    const pool = DAILY_POOL.filter((p) => !usedCodes.has(p.code));
    for (const p of pickRandom(pool, 3 - haveDaily)) {
      inserts.push({
        user_id: userId,
        kind: "daily",
        code: p.code,
        title: p.title,
        target: p.target,
        progress: 0,
        xp_reward: p.xp,
        expires_at: endOfDay(),
      });
    }
  }
  if (haveWeekly < 2) {
    const usedCodes = new Set(valid.filter((q) => q.kind === "weekly").map((q) => q.code));
    const pool = WEEKLY_POOL.filter((p) => !usedCodes.has(p.code));
    for (const p of pickRandom(pool, 2 - haveWeekly)) {
      inserts.push({
        user_id: userId,
        kind: "weekly",
        code: p.code,
        title: p.title,
        target: p.target,
        progress: 0,
        xp_reward: p.xp,
        expires_at: endOfWeek(),
      });
    }
  }
  if (inserts.length) {
    await supabase.from("quests").insert(inserts);
  }
  const { data: fresh } = await supabase
    .from("quests")
    .select("*")
    .eq("user_id", userId);
  return (fresh ?? []) as Quest[];
}

/** Bump progress on all matching active quests. Awards XP + notifies on completion. */
export async function bumpQuest(userId: string, code: string, amount = 1) {
  const now = new Date().toISOString();
  const { data: quests } = await supabase
    .from("quests")
    .select("*")
    .eq("user_id", userId)
    .eq("code", code)
    .is("completed_at", null)
    .gt("expires_at", now);
  if (!quests?.length) return;
  for (const q of quests as Quest[]) {
    const newProgress = Math.min(q.target, q.progress + amount);
    const completed = newProgress >= q.target;
    await supabase
      .from("quests")
      .update({
        progress: newProgress,
        completed_at: completed ? new Date().toISOString() : null,
      })
      .eq("id", q.id);
    if (completed) {
      // award xp
      const { data: prof } = await supabase
        .from("profiles")
        .select("xp")
        .eq("id", userId)
        .maybeSingle();
      const newXp = (prof?.xp ?? 0) + q.xp_reward;
      await supabase.from("profiles").update({ xp: newXp }).eq("id", userId);
      await notify(userId, {
        kind: "quest",
        title: "Quest complete!",
        body: `${q.title} · +${q.xp_reward} XP`,
        link: "/quests",
      });
    }
  }
}