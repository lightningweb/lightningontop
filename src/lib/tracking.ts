/** Play/open tracking for dynamic Trending & New categories. */
const PLAYS_KEY = "thunder.plays.v1";
const FIRSTSEEN_KEY = "thunder.firstseen.v1";

type PlayEvent = { id: string; ts: number };

function read<T>(k: string, fb: T): T {
  try { return JSON.parse(localStorage.getItem(k) || "null") ?? fb; } catch { return fb; }
}
function write(k: string, v: unknown) {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
}

export function recordPlay(id: string) {
  const list = read<PlayEvent[]>(PLAYS_KEY, []);
  list.push({ id, ts: Date.now() });
  // Cap
  write(PLAYS_KEY, list.slice(-500));
}

/** Ensure each id has a first-seen timestamp for "New" detection. */
export function seedFirstSeen(ids: string[]) {
  const seen = read<Record<string, number>>(FIRSTSEEN_KEY, {});
  const now = Date.now();
  let changed = false;
  for (const id of ids) if (!(id in seen)) { seen[id] = now; changed = true; }
  if (changed) write(FIRSTSEEN_KEY, seen);
  return seen;
}

/** Top N by play count in the last `windowMs` ms. */
export function trending(ids: string[], windowMs = 7 * 24 * 3600 * 1000): string[] {
  const cutoff = Date.now() - windowMs;
  const counts = new Map<string, number>();
  for (const p of read<PlayEvent[]>(PLAYS_KEY, [])) {
    if (p.ts < cutoff) continue;
    if (!ids.includes(p.id)) continue;
    counts.set(p.id, (counts.get(p.id) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, c]) => c >= 2) // only "really trending"
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);
}

/** Ids seen for the first time in the last `windowMs` ms — "really new". */
export function fresh(ids: string[], windowMs = 14 * 24 * 3600 * 1000): string[] {
  const seen = seedFirstSeen(ids);
  const cutoff = Date.now() - windowMs;
  return ids.filter((id) => (seen[id] ?? 0) >= cutoff);
}

/** Favourites = top played all-time. */
export function favourites(ids: string[]): string[] {
  const counts = new Map<string, number>();
  for (const p of read<PlayEvent[]>(PLAYS_KEY, [])) {
    if (!ids.includes(p.id)) continue;
    counts.set(p.id, (counts.get(p.id) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
}