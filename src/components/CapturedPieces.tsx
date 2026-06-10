"use client";

import { useGameStore } from "@/state/gameStore";
import { GLYPH, VALUE } from "@/features/play/pieceGlyphs";
import type { Color } from "chess.js";

/**
 * One side's captured material with a label and a friendly "+N" advantage pill.
 * `side` is the colour doing the capturing (so it shows the pieces it has won).
 */
export default function CapturedPieces({ side, label }: { side: Color; label?: string }) {
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
    <div className="flex h-6 items-center gap-2 px-1">
      {label ? (
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-muted2">{label}</span>
      ) : null}
      <div className="flex min-w-0 flex-1 items-center text-lg leading-none">
        {sorted.length === 0 ? (
          <span className="text-[11px] text-muted2/70">—</span>
        ) : (
          sorted.map((p, i) => (
            <span
              key={i}
              style={{
                color: pieceColor === "w" ? "var(--piece-white)" : "var(--piece-black)",
                WebkitTextStroke:
                  pieceColor === "w" ? "1px var(--piece-white-line)" : "0.7px var(--piece-black-line)",
              }}
            >
              {GLYPH[p]}
            </span>
          ))
        )}
      </div>
      {lead > 0 ? (
        <span className="shrink-0 rounded-full bg-good/15 px-1.5 py-0.5 text-[10px] font-bold text-gooddeep">
          +{lead}
        </span>
      ) : null}
    </div>
  );
}
