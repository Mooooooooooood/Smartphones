import type { PieceSymbol } from "chess.js";

/** Solid Unicode chess glyphs; colour is applied via CSS, not the glyph itself. */
export const GLYPH: Record<PieceSymbol, string> = {
  k: "\u265A",
  q: "\u265B",
  r: "\u265C",
  b: "\u265D",
  n: "\u265E",
  p: "\u265F",
};

export const VALUE: Record<PieceSymbol, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
