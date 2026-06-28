"use client";

import { useSyncExternalStore } from "react";
import { newCard, review, isDue, type ReviewCard } from "@/domain/training/srs";

/**
 * Spaced-repetition scheduling for learned openings — device-local, mirroring
 * openingProgress.ts. Each completed drill of a repertoire promotes its Leitner
 * box (longer interval); a learned opening with no card yet is due immediately.
 * Reuses the same `srs.ts` engine the puzzle Smart Review runs on.
 */
const KEY = "rang-openings-srs";
const listeners = new Set<() => void>();
const EMPTY: Record<string, ReviewCard> = {};

function read(): Record<string, ReviewCard> {
  if (typeof localStorage === "undefined") return EMPTY;
  try { return JSON.parse(localStorage.getItem(KEY) ?? "{}") || EMPTY; } catch { return EMPTY; }
}

function write(cards: Record<string, ReviewCard>) {
  try { localStorage.setItem(KEY, JSON.stringify(cards)); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}

/** Record one completed drill of an opening (correct = finished the line). */
export function recordOpeningRep(id: string, correct: boolean, now: number = Date.now()): void {
  const cards = read();
  const card = cards[id] ?? newCard(id, now);
  write({ ...cards, [id]: review(card, correct, now) });
}

/** Learned openings whose review is due (or that have never been drilled). */
export function dueOpeningIds(
  learned: Record<string, true>,
  cards: Record<string, ReviewCard>,
  now: number = Date.now(),
): string[] {
  return Object.keys(learned).filter((id) => {
    const c = cards[id];
    return !c || isDue(c, now);
  });
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useOpeningReviewCards(): Record<string, ReviewCard> {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}
