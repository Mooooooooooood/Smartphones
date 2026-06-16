"use client";

import { useSyncExternalStore } from "react";

/**
 * The player's equipped cosmetic title, persisted in localStorage (device-local,
 * mirrors playerColor.ts). "none" means no title — callers fall back to the
 * rank/piece title. Ownership of premium titles is gated by profileStore.owned.
 */
const KEY = "rang-player-title";
const listeners = new Set<() => void>();

export function getPlayerTitle(): string {
  if (typeof localStorage === "undefined") return "none";
  return localStorage.getItem(KEY) ?? "none";
}

export function setPlayerTitle(id: string): void {
  try { localStorage.setItem(KEY, id); } catch { /* storage unavailable */ }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function usePlayerTitle(): string {
  return useSyncExternalStore(subscribe, getPlayerTitle, () => "none");
}
