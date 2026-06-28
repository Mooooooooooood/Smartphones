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

// Cache the parsed snapshot so useSyncExternalStore gets a STABLE reference when
// the stored string is unchanged — returning a fresh object each call triggers
// an infinite render loop ("getSnapshot should be cached").
let cacheRaw: string | null = null;
let cacheVal: Record<string, ReviewCard> = EMPTY;

function read(): Record<string, ReviewCard> {
  if (typeof localStorage === "undefined") return EMPTY;
  let raw: string;
  try { raw = localStorage.getItem(KEY) ?? "{}"; } catch { return EMPTY; }
  if (raw === cacheRaw) return cacheVal;
  cacheRaw = raw;
  try { cacheVal = JSON.parse(raw) || EMPTY; } catch { cacheVal = EMPTY; }
  return cacheVal;
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
