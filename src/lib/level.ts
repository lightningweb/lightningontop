/** XP → level math. Each level requires 100 * level XP cumulatively. */
export const xpForLevel = (lvl: number) => Math.round(100 * lvl * (lvl + 1) / 2);
export const levelForXp = (xp: number) => {
  let lvl = 1;
  while (xp >= xpForLevel(lvl)) lvl++;
  return lvl;
};
export const levelProgress = (xp: number) => {
  const lvl = levelForXp(xp);
  const prev = xpForLevel(lvl - 1);
  const next = xpForLevel(lvl);
  return {
    level: lvl,
    current: xp - prev,
    needed: next - prev,
    pct: Math.min(100, ((xp - prev) / (next - prev)) * 100),
  };
};