"use client";

import { useGameStore } from "@/state/gameStore";
import ActionButton from "@/components/ui/ActionButton";

export default function Controls({ onFlip }: { orientation: "white" | "black"; onFlip: () => void }) {
  const undo = useGameStore((s) => s.undo);
  const reset = useGameStore((s) => s.reset);
  const requestHint = useGameStore((s) => s.requestHint);
  const hintThinking = useGameStore((s) => s.hintThinking);
  const canUndo = useGameStore((s) => s.snap.history.length > 0);
  const gameOver = useGameStore((s) => s.snap.isGameOver);

  return (
    <div className="grid grid-cols-4 gap-2">
      <ActionButton onClick={undo} disabled={!canUndo} variant="secondary">
        ↶ Undo
      </ActionButton>
      <ActionButton onClick={requestHint} disabled={hintThinking || gameOver} variant="secondary">
        {hintThinking ? "…" : "💡 Hint"}
      </ActionButton>
      <ActionButton onClick={onFlip} variant="secondary">
        ⇅ Flip
      </ActionButton>
      <ActionButton onClick={reset}>＋ New</ActionButton>
    </div>
  );
}
