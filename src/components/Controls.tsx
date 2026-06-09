"use client";

import { useGameStore } from "@/state/gameStore";

export default function Controls({
  orientation,
  onFlip,
}: {
  orientation: "white" | "black";
  onFlip: () => void;
}) {
  const undo = useGameStore((s) => s.undo);
  const reset = useGameStore((s) => s.reset);
  const canUndo = useGameStore((s) => s.snap.history.length > 0);

  return (
    <div className="grid grid-cols-3 gap-2">
      <Btn onClick={undo} disabled={!canUndo} label="Undo" />
      <Btn onClick={onFlip} label={orientation === "white" ? "Flip board" : "Flip board"} />
      <Btn onClick={reset} label="New game" emphasis />
    </div>
  );
}

function Btn({
  onClick,
  label,
  disabled,
  emphasis,
}: {
  onClick: () => void;
  label: string;
  disabled?: boolean;
  emphasis?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors active:scale-[0.98] disabled:opacity-40 ${
        emphasis
          ? "border-brass/50 bg-brass/15 text-brass"
          : "border-line bg-panel text-cream hover:border-muted2"
      }`}
    >
      {label}
    </button>
  );
}
