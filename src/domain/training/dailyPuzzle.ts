import { useSyncExternalStore } from "react";
import { BEGINNER_PUZZLES } from "@/content/puzzles/beginner";
import { todayKey } from "@/domain/progression/leveling";

/**
 * Deterministic "Puzzle of the Day": the same puzzle for everyone on a given
 * calendar day, with no backend. Pure + testable. Completion is tracked
 * device-local (localStorage) so the Home card can show done/▶.
 */
const DONE_KEY = "rang-daily-puzzle";
export const DAILY_PUZZLE_BONUS = 20; // bonus coins for the daily solve

function hashDate(date: string): number {
  let h = 0;
  for (let i = 0; i < date.length; i++) h = (h * 31 + date.charCodeAt(i)) >>> 0;
  return h;
}

/** The id of today's puzzle (deterministic from the date). */
export function dailyPuzzleId(date: string = todayKey()): string {
  const list = BEGINNER_PUZZLES;
  return list[hashDate(date) % list.length].id;
}

export function isDailyPuzzleDone(date: string = todayKey()): boolean {
  if (typeof localStorage === "undefined") return false;
  return localStorage.getItem(DONE_KEY) === date;
}

export function markDailyPuzzleDone(date: string = todayKey()): void {
  try { localStorage.setItem(DONE_KEY, date); } catch { /* ignore */ }
}

/** SSR-safe reader for the Home card (server renders "not done"). */
export function useDailyPuzzleDone(): boolean {
  return useSyncExternalStore(() => () => {}, () => isDailyPuzzleDone(), () => false);
}
