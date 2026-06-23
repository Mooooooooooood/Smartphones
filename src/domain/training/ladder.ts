import type { Puzzle } from "@/content/puzzles/beginner";

/**
 * Puzzle rating ladder — pure helpers for the "Rated Climb": tier titles for a
 * rating, and an adaptive queue that serves unsolved puzzles closest to (and
 * gently above) the player's rating so the difficulty tracks their level.
 */

export type LadderHue = "gray" | "green" | "blue" | "purple" | "gold" | "red";

export interface RatingTier {
  title: string;
  /** Inclusive lower bound. */
  min: number;
  hue: LadderHue;
}

/** Ascending tiers. The last tier has no upper bound. */
export const RATING_TIERS: RatingTier[] = [
  { title: "Novice", min: 0, hue: "gray" },
  { title: "Apprentice", min: 600, hue: "green" },
  { title: "Adept", min: 900, hue: "blue" },
  { title: "Expert", min: 1200, hue: "purple" },
  { title: "Master", min: 1500, hue: "gold" },
  { title: "Grandmaster", min: 1800, hue: "red" },
];

export interface TierInfo {
  title: string;
  hue: LadderHue;
  index: number;
  min: number;
  /** Next tier's lower bound, or null at the top. */
  nextMin: number | null;
  nextTitle: string | null;
  /** 0..1 progress toward the next tier (1 at the top tier). */
  progress: number;
  /** Rating points still needed to reach the next tier (0 at the top). */
  toNext: number;
}

/** Resolve a rating to its tier + progress toward the next tier. */
export function ratingTier(rating: number): TierInfo {
  let index = 0;
  for (let i = 0; i < RATING_TIERS.length; i++) {
    if (rating >= RATING_TIERS[i].min) index = i;
  }
  const tier = RATING_TIERS[index];
  const next = RATING_TIERS[index + 1] ?? null;
  const nextMin = next ? next.min : null;
  const progress = next ? Math.max(0, Math.min(1, (rating - tier.min) / (next.min - tier.min))) : 1;
  return {
    title: tier.title,
    hue: tier.hue,
    index,
    min: tier.min,
    nextMin,
    nextTitle: next ? next.title : null,
    progress,
    toNext: next ? Math.max(0, next.min - rating) : 0,
  };
}

/**
 * Build the climb queue: unsolved puzzles ordered by how well they match the
 * player's rating, with a gentle upward bias (slightly prefers puzzles at or
 * above the rating so the player keeps stretching). Falls back to replaying the
 * nearest puzzles once everything has been solved.
 */
export function climbQueue(
  puzzles: Puzzle[],
  opts: { rating: number; solved: Record<string, unknown> },
): string[] {
  const { rating, solved } = opts;
  const cost = (p: Puzzle) => {
    const diff = p.rating - rating;
    // Easier-than-you puzzles are penalised 1.4× so the climb trends upward.
    return diff >= 0 ? diff : -diff * 1.4;
  };
  const sortFn = (a: Puzzle, b: Puzzle) => cost(a) - cost(b) || a.rating - b.rating;

  const unsolved = puzzles.filter((p) => !solved[p.id]).sort(sortFn);
  if (unsolved.length > 0) return unsolved.map((p) => p.id);
  return [...puzzles].sort(sortFn).map((p) => p.id);
}
