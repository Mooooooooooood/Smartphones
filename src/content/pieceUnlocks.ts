import type { BuddyPiece } from "@/components/pixel/PixelSprite";
import type { AcademyState } from "@/domain/academy/progression";
import { academyProgress, isTierComplete, isBossCleared } from "@/domain/academy/progression";

/**
 * Avatar piece unlocks — you start as a pawn and earn fancier pieces by playing.
 * Pure + derived from existing progress (nothing extra persisted). Mirrors the
 * content/achievements.ts pattern.
 */
export interface PieceStats {
  solved: number;
  wins: number;
  academy: AcademyState;
}

export interface PieceUnlockDef {
  piece: BuddyPiece;
  hint: string;
  progress: (s: PieceStats) => { current: number; target: number };
}

export const PIECE_UNLOCKS: PieceUnlockDef[] = [
  { piece: "pawn", hint: "Your starter piece.", progress: () => ({ current: 1, target: 1 }) },
  { piece: "knight", hint: "Solve 3 puzzles.", progress: (s) => ({ current: Math.min(s.solved, 3), target: 3 }) },
  {
    piece: "bishop",
    hint: "Complete 3 Academy lessons.",
    progress: (s) => ({ current: Math.min(academyProgress(s.academy).done, 3), target: 3 }),
  },
  { piece: "rook", hint: "Win a match.", progress: (s) => ({ current: Math.min(s.wins, 1), target: 1 }) },
  {
    piece: "queen",
    hint: "Pass a Boss Trial.",
    progress: (s) => ({ current: isBossCleared("tier-0", s.academy) || isBossCleared("tier-1", s.academy) ? 1 : 0, target: 1 }),
  },
  {
    piece: "king",
    hint: "Complete all of Tier 0.",
    progress: (s) => ({ current: isTierComplete(0, s.academy) ? 1 : 0, target: 1 }),
  },
];

export interface PieceView extends PieceUnlockDef {
  current: number;
  target: number;
  unlocked: boolean;
  pct: number;
}

/** Resolve every piece against the player's stats. */
export function pieceViews(stats: PieceStats): PieceView[] {
  return PIECE_UNLOCKS.map((p) => {
    const { current, target } = p.progress(stats);
    const unlocked = current >= target;
    return { ...p, current, target, unlocked, pct: target ? Math.min(1, current / target) : 0 };
  });
}

/** True if a given piece is currently unlocked. */
export function isPieceUnlocked(piece: BuddyPiece, stats: PieceStats): boolean {
  return pieceViews(stats).find((p) => p.piece === piece)?.unlocked ?? false;
}
