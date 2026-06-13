"use client";

import { useEffect } from "react";
import { useProfileStore, selectLevel, puzzlesSolvedCount, academyStateFrom } from "@/state/profileStore";
import { pieceViews, pieceTitle } from "@/content/pieceUnlocks";
import {
  useIdentity, getSeenPieces, markPiecesSeen, getSeenLevel, setSeenLevel,
  isCelebSeeded, markCelebSeeded, setPlayerPiece,
} from "@/lib/playerIdentity";
import { fx } from "@/lib/feedback";
import PieceUnlockModal from "@/components/pixel/PieceUnlockModal";
import LevelUpModal from "@/components/pixel/LevelUpModal";

/**
 * Watches progress and pops a celebration when a new avatar piece unlocks or the
 * player levels up. State is render-derived from the reactive identity store
 * (no setState-in-effect): the only effect seeds the "already seen" baseline
 * once so we celebrate FUTURE milestones, not the player's current standing.
 */
export default function HomeCelebrations() {
  useIdentity(); // re-render when seen/level bookkeeping changes
  const xp = useProfileStore((s) => s.xp);
  const completed = useProfileStore((s) => s.completed);
  const bossCleared = useProfileStore((s) => s.bossCleared);
  const solvedIds = useProfileStore((s) => s.solvedPuzzleIds);
  const matches = useProfileStore((s) => s.matches);
  const hydrated = useProfileStore((s) => s.hydrated);

  const academy = academyStateFrom(completed, bossCleared);
  const stats = { solved: puzzlesSolvedCount(solvedIds), wins: matches.filter((m) => m.result === "win").length, academy };
  const unlocked = pieceViews(stats).filter((p) => p.unlocked).map((p) => p.piece);
  const level = selectLevel(xp).level;

  // One-time baseline seed (localStorage only — not React state).
  useEffect(() => {
    if (!hydrated || isCelebSeeded()) return;
    markPiecesSeen(unlocked);
    setSeenLevel(level);
    markCelebSeeded();
  }, [hydrated, unlocked, level]);

  if (!hydrated || !isCelebSeeded()) return null;

  const seen = getSeenPieces();
  const newPiece = unlocked.find((p) => !seen[p]);
  if (newPiece) {
    return (
      <PieceUnlockModal
        piece={newPiece}
        title={pieceTitle(newPiece)}
        onEquip={() => { fx.tap(); setPlayerPiece(newPiece); markPiecesSeen([newPiece]); }}
        onClose={() => markPiecesSeen([newPiece])}
      />
    );
  }

  if (level > getSeenLevel()) {
    return <LevelUpModal level={level} onClose={() => setSeenLevel(level)} />;
  }
  return null;
}
