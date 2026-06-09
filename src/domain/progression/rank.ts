/**
 * Rank / title system for Sprint 4 — pure and testable.
 *
 * Levels come from {@link levelInfo}; this maps a level onto a chess-themed
 * mastery title so the player always has an identity to climb toward. The
 * titles are original to Tabiya.
 */

export interface Rank {
  /** Title shown to the player, e.g. "Knight Initiate". */
  title: string;
  /** Ordinal tier (1-based) of the rank within the ladder. */
  tier: number;
  /** Lowest level that still belongs to this rank. */
  minLevel: number;
  /** The next rank, or null if already at the summit. */
  next: { title: string; atLevel: number } | null;
}

interface RankDef {
  title: string;
  minLevel: number;
}

/** The rank ladder, in ascending order. Each entry starts at its `minLevel`. */
const LADDER: RankDef[] = [
  { title: "Pawn Recruit", minLevel: 1 },
  { title: "Pawn Adept", minLevel: 3 },
  { title: "Knight Initiate", minLevel: 5 },
  { title: "Bishop Scholar", minLevel: 8 },
  { title: "Rook Sentinel", minLevel: 12 },
  { title: "Queen's Vanguard", minLevel: 16 },
  { title: "Master Tactician", minLevel: 22 },
  { title: "Grand Strategist", minLevel: 30 },
];

/** Resolve the rank for a given level. */
export function rankForLevel(level: number): Rank {
  const safe = Math.max(1, Math.floor(level));
  let idx = 0;
  for (let i = 0; i < LADDER.length; i++) {
    if (safe >= LADDER[i].minLevel) idx = i;
  }
  const current = LADDER[idx];
  const upcoming = LADDER[idx + 1] ?? null;
  return {
    title: current.title,
    tier: idx + 1,
    minLevel: current.minLevel,
    next: upcoming ? { title: upcoming.title, atLevel: upcoming.minLevel } : null,
  };
}

export const TOTAL_RANKS = LADDER.length;
