"use client";

import { useGameStore } from "@/state/gameStore";
import ActionButton from "@/components/ui/ActionButton";

export default function Controls({ onFlip }: { orientation: "white" | "black"; onFlip: () => void }) {
  const undo = useGameStore((s) => s.undo);
  const reset = useGameStore((s) => s.reset);
  const canUndo = useGameStore((s) => s.snap.history.length > 0);

  return (
    <div className="grid grid-cols-3 gap-2.5">
      <ActionButton onClick={undo} disabled={!canUndo} variant="secondary">
        ↶ Undo
      </ActionButton>
      <ActionButton onClick={onFlip} variant="secondary">
        ⇅ Flip
      </ActionButton>
      <ActionButton onClick={reset}>＋ New</ActionButton>
    </div>
  );
}
