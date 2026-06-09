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
