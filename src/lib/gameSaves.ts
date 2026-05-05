import { supabase } from "@/integrations/supabase/client";

/**
 * Sync localStorage to/from cloud for the signed-in user.
 * Each localStorage key/value becomes a row in game_saves.
 */
export async function pullSavesFromCloud(userId: string) {
  const { data, error } = await supabase
    .from("game_saves")
    .select("key,value")
    .eq("user_id", userId);
  if (error || !data) return;
  for (const row of data) {
    try {
      localStorage.setItem(row.key, row.value);
    } catch {}
  }
}

export async function pushSaveToCloud(userId: string, key: string, value: string) {
  await supabase
    .from("game_saves")
    .upsert({ user_id: userId, key, value }, { onConflict: "user_id,key" });
}

export async function pushAllLocalSavesToCloud(userId: string) {
  const rows: { user_id: string; key: string; value: string }[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k) continue;
    // skip our own app keys
    if (k.startsWith("lightning.") || k.startsWith("sb-") || k.startsWith("supabase.")) continue;
    const v = localStorage.getItem(k);
    if (v == null) continue;
    rows.push({ user_id: userId, key: k, value: v });
  }
  if (rows.length === 0) return;
  await supabase.from("game_saves").upsert(rows, { onConflict: "user_id,key" });
}

/**
 * Patch localStorage.setItem to mirror writes to the cloud while signed in.
 * Idempotent.
 */
let patched = false;
let currentUser: string | null = null;

export function setSyncUser(userId: string | null) {
  currentUser = userId;
  if (patched) return;
  patched = true;
  const orig = localStorage.setItem.bind(localStorage);
  localStorage.setItem = (k: string, v: string) => {
    orig(k, v);
    if (
      currentUser &&
      !k.startsWith("lightning.") &&
      !k.startsWith("sb-") &&
      !k.startsWith("supabase.")
    ) {
      pushSaveToCloud(currentUser, k, v).catch(() => {});
    }
  };
}