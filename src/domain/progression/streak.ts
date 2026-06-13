import { todayKey } from "@/domain/progression/leveling";

export interface StreakDay {
  /** ISO date key, YYYY-MM-DD. */
  date: string;
  /** Day-of-month number for display. */
  dom: number;
  /** Short weekday letter (S M T W T F S). */
  dow: string;
  active: boolean;
  isToday: boolean;
}

const DAY_MS = 86_400_000;
const DOW = ["S", "M", "T", "W", "T", "F", "S"];

/**
 * Build a streak calendar for the last `days` days WITHOUT storing history:
 * the active window is the `streak` consecutive days ending on `lastActiveDate`.
 * Pure + testable. Marks today, and which days were active.
 */
export function streakCalendar(
  lastActiveDate: string | null,
  streak: number,
  today: string = todayKey(),
  days = 14,
): StreakDay[] {
  // The set of active dates: lastActiveDate back (streak - 1) days.
  const active = new Set<string>();
  if (lastActiveDate && streak > 0) {
    const end = new Date(`${lastActiveDate}T00:00:00`).getTime();
    for (let i = 0; i < streak; i++) {
      active.add(todayKey(new Date(end - i * DAY_MS)));
    }
  }
  const t = new Date(`${today}T00:00:00`).getTime();
  const out: StreakDay[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(t - i * DAY_MS);
    const key = todayKey(d);
    out.push({
      date: key,
      dom: d.getDate(),
      dow: DOW[d.getDay()],
      active: active.has(key),
      isToday: key === today,
    });
  }
  return out;
}

/** True if today is already counted toward the streak. */
export function isTodayActive(lastActiveDate: string | null, today: string = todayKey()): boolean {
  return lastActiveDate === today;
}
