"use client";

import { useGameStore } from "@/state/gameStore";
import { GLYPH, VALUE } from "@/features/play/pieceGlyphs";
import type { Color } from "chess.js";

export default function CapturedPieces({ side }: { side: Color }) {
  const snap = useGameStore((s) => s.snap);

  const captured = side === "w" ? snap.capturedByWhite : snap.capturedByBlack;
  const mine = captured.reduce((sum, p) => sum + VALUE[p], 0);
  const theirs = (side === "w" ? snap.capturedByBlack : snap.capturedByWhite).reduce(
    (sum, p) => sum + VALUE[p],
    0,
  );
  const lead = mine - theirs;

  // Captured pieces belong to the opposing colour.
  const pieceColor: Color = side === "w" ? "b" : "w";
  const sorted = [...captured].sort((a, b) => VALUE[b] - VALUE[a]);

  return (
    <div className="flex h-6 items-center gap-1 px-1">
      <div className="flex items-center text-xl leading-none">
        {sorted.map((p, i) => (
          <span
            key={i}
            style={{
              color: pieceColor === "w" ? "#ffffff" : "#334155",
              WebkitTextStroke: pieceColor === "w" ? "1px #94a3b8" : "0.7px #1e293b",
            }}
          >
            {GLYPH[p]}
          </span>
        ))}
      </div>
      {lead > 0 && <span className="text-xs font-semibold text-muted">+{lead}</span>}
    </div>
  );
}
