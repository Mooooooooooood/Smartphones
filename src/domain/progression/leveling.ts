export interface LevelInfo {
  level: number;
  intoLevel: number; // XP earned within the current level
  span: number; // XP needed to clear the current level
  progress: number; // 0..1
}

/** Cumulative XP required to *reach* a given level. Level 1 = 0 XP. */
function cumulativeXp(level: number): number {
  return 50 * level * (level - 1); // 0, 100, 300, 600, 1000, 1500, ...
}

export function levelInfo(xp: number): LevelInfo {
  const safe = Math.max(0, Math.floor(xp));
  let level = 1;
  while (cumulativeXp(level + 1) <= safe) level++;
  const base = cumulativeXp(level);
  const next = cumulativeXp(level + 1);
  const span = next - base;
  const intoLevel = safe - base;
  return { level, intoLevel, span, progress: span > 0 ? intoLevel / span : 0 };
}

const DAY_MS = 86_400_000;

export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Streak after activity today, given the previous active day and streak count. */
export function nextStreak(prevDate: string | null, prevStreak: number, today: string = todayKey()): number {
  if (prevDate === today) return prevStreak; // already counted today
  if (!prevDate) return 1;
  const yesterday = todayKey(new Date(new Date(`${today}T00:00:00`).getTime() - DAY_MS));
  return prevDate === yesterday ? prevStreak + 1 : 1;
}

/**
 * Streak after activity, honouring a Streak Freeze. If the normal rule would
 * reset the streak (a day was missed) but the player holds a freeze AND there
 * was an existing streak to protect, the freeze is consumed to continue the
 * streak (+1) instead of resetting to 1.
 */
export function streakWithFreeze(
  prevDate: string | null,
  prevStreak: number,
  hasFreeze: boolean,
  today: string = todayKey(),
): { streak: number; consumedFreeze: boolean } {
  const normal = nextStreak(prevDate, prevStreak, today);
  const wouldReset = normal === 1 && prevStreak > 0 && prevDate !== today && prevDate !== null;
  if (wouldReset && hasFreeze) {
    return { streak: prevStreak + 1, consumedFreeze: true };
  }
  return { streak: normal, consumedFreeze: false };
}
