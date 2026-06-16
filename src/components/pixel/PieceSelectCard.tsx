"use client";

import type { CSSProperties } from "react";
import ChessBuddy, { type BuddyPiece } from "@/components/characters/ChessBuddy";

/**
 * A piece tile in the collection grid. `selected` draws the brass border + reward
 * glow; locked pieces are dimmed and show a lock. Encapsulates the inline
 * border/box-shadow ternary the Profile screen used to repeat.
 */
export default function PieceSelectCard({
  piece,
  label,
  unlocked,
  selected,
  onClick,
}: {
  piece: BuddyPiece;
  label: string;
  unlocked: boolean;
  selected: boolean;
  onClick: () => void;
}) {
  const glow: CSSProperties = selected
    ? { boxShadow: "0 0 0 2px var(--px-edge), 0 0 12px -2px var(--glow-reward)" }
    : { boxShadow: "0 0 0 2px var(--px-edge)" };
  return (
    <button type="button" onClick={onClick} className="active:translate-y-0.5">
      <div
        className={`flex flex-col items-center gap-1 rounded-[7px] border-[3px] bg-[var(--color-ink)] px-1 py-2 ${selected ? "border-brass" : "border-[var(--px-edge)]"}`}
        style={glow}
      >
        <div className={unlocked ? "" : "opacity-30 grayscale"}>
          <ChessBuddy piece={piece} size={34} />
        </div>
        <span className={`px-label text-[0.5rem] ${unlocked ? "text-cream" : "text-muted2"}`}>
          {unlocked ? (selected ? "Wearing" : label) : "🔒"}
        </span>
      </div>
    </button>
  );
}
