"use client";

import { useSyncExternalStore } from "react";

/**
 * Which opening repertoires the player has completed — device-local, like the
 * other cosmetic prefs. Used to show "Learned" badges and to grant the
 * completion reward only once.
 */
const KEY = "rang-openings-learned";
const listeners = new Set<() => void>();
const EMPTY: Record<string, true> = {};

function read(): Record<string, true> {
  if (typeof localStorage === "undefined") return EMPTY;
  try { return JSON.parse(localStorage.getItem(KEY) ?? "{}") || EMPTY; } catch { return EMPTY; }
}

export function isOpeningLearned(id: string): boolean {
  return Boolean(read()[id]);
}

/** Mark an opening complete. Returns true if it was newly learned. */
export function markOpeningLearned(id: string): boolean {
  const cur = read();
  if (cur[id]) return false;
  try { localStorage.setItem(KEY, JSON.stringify({ ...cur, [id]: true })); } catch { /* ignore */ }
  listeners.forEach((l) => l());
  return true;
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useLearnedOpenings(): Record<string, true> {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}
