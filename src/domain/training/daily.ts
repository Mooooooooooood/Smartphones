/**
 * Pure daily-training helpers. The persistent row lives in Dexie; these
 * functions describe and transition it without side effects.
 */

export type DailyTask = "academy" | "puzzle" | "play";

export interface DailyTraining {
  date: string; // local day key, e.g. "2026-06-09"
  academyTaskDone: boolean;
  puzzleTaskDone: boolean;
  playTaskDone: boolean;
  bonusClaimed: boolean;
  completedAt: number | null; // when all three tasks first finished
  updatedAt: number;
}

/** XP awarded once for finishing all three daily tasks. */
export const DAILY_BONUS_XP = 40;
/** Coins awarded by the daily completion chest (all three tasks done). */
export const DAILY_BONUS_COINS = 25;
/** Coins granted the first time each daily task is completed today. */
export const DAILY_TASK_COINS: Record<DailyTask, number> = {
  play: 20,
  puzzle: 15,
  academy: 10,
};

const TASK_FIELD: Record<DailyTask, keyof DailyTraining> = {
  academy: "academyTaskDone",
  puzzle: "puzzleTaskDone",
  play: "playTaskDone",
};

export function emptyDaily(date: string, now: number = Date.now()): DailyTraining {
  return {
    date,
    academyTaskDone: false,
    puzzleTaskDone: false,
    playTaskDone: false,
    bonusClaimed: false,
    completedAt: null,
    updatedAt: now,
  };
}

/** Ensure we have today's row; if the stored one is from another day, start fresh. */
export function dailyForToday(
  stored: DailyTraining | null,
  date: string,
  now: number = Date.now(),
): DailyTraining {
  if (stored && stored.date === date) return stored;
  return emptyDaily(date, now);
}

export function dailyDoneCount(d: DailyTraining): number {
  return (
    (d.academyTaskDone ? 1 : 0) + (d.puzzleTaskDone ? 1 : 0) + (d.playTaskDone ? 1 : 0)
  );
}

export function dailyAllComplete(d: DailyTraining): boolean {
  return d.academyTaskDone && d.puzzleTaskDone && d.playTaskDone;
}

/** True if the bonus can be claimed right now (all done, not yet claimed). */
export function dailyBonusClaimable(d: DailyTraining): boolean {
  return dailyAllComplete(d) && !d.bonusClaimed;
}

/** Return a new row with `task` marked done (idempotent). */
export function withTaskDone(
  d: DailyTraining,
  task: DailyTask,
  now: number = Date.now(),
): DailyTraining {
  const field = TASK_FIELD[task];
  if (d[field]) return d; // already done — no change
  const next: DailyTraining = { ...d, [field]: true, updatedAt: now };
  if (dailyAllComplete(next) && next.completedAt === null) next.completedAt = now;
  return next;
}

/** Return a new row with the bonus marked claimed. */
export function withBonusClaimed(d: DailyTraining, now: number = Date.now()): DailyTraining {
  if (d.bonusClaimed) return d;
  return { ...d, bonusClaimed: true, updatedAt: now };
}
