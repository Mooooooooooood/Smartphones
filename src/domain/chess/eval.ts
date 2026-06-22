import { Chess } from "chess.js";
import type { Color, PieceSymbol } from "chess.js";

/**
 * Original static position evaluation (centipawns, White-positive). Pure and
 * dependency-free — material + piece-square tables + a few light positional
 * terms. Used by both the opponent search (search.ts) and post-game analysis
 * (analysis.ts). Tables are written rank-8-first (row 0 = rank 8) so they align
 * directly with chess.js `board()`; Black reads the vertically-mirrored square.
 */

export const PIECE_VALUE: Record<PieceSymbol, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };
/** A mate is worth more than any material swing; search subtracts ply to prefer faster mates. */
export const MATE_SCORE = 100000;

// prettier-ignore
const PST_PAWN = [
   0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 25, 25, 10,  5,  5,
   0,  0,  0, 20, 20,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0,
];
// prettier-ignore
const PST_KNIGHT = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50,
];
// prettier-ignore
const PST_BISHOP = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20,
];
// prettier-ignore
const PST_ROOK = [
    0,  0,  0,  0,  0,  0,  0,  0,
    5, 10, 10, 10, 10, 10, 10,  5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
    0,  0,  0,  5,  5,  0,  0,  0,
];
// prettier-ignore
const PST_QUEEN = [
  -20,-10,-10, -5, -5,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5,  5,  5,  5,  0,-10,
   -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0, -5,
  -10,  5,  5,  5,  5,  5,  0,-10,
  -10,  0,  5,  0,  0,  0,  0,-10,
  -20,-10,-10, -5, -5,-10,-10,-20,
];
// prettier-ignore
const PST_KING_MID = [
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -20,-30,-30,-40,-40,-30,-30,-20,
  -10,-20,-20,-20,-20,-20,-20,-10,
   20, 20,  0,  0,  0,  0, 20, 20,
   20, 30, 10,  0,  0, 10, 30, 20,
];
// prettier-ignore
const PST_KING_END = [
  -50,-40,-30,-20,-20,-30,-40,-50,
  -30,-20,-10,  0,  0,-10,-20,-30,
  -30,-10, 20, 30, 30, 20,-10,-30,
  -30,-10, 30, 40, 40, 30,-10,-30,
  -30,-10, 30, 40, 40, 30,-10,-30,
  -30,-10, 20, 30, 30, 20,-10,-30,
  -30,-30,  0,  0,  0,  0,-30,-30,
  -50,-30,-30,-30,-30,-30,-30,-50,
];

const PST: Record<Exclude<PieceSymbol, "k">, number[]> = {
  p: PST_PAWN, n: PST_KNIGHT, b: PST_BISHOP, r: PST_ROOK, q: PST_QUEEN,
};

function asGame(input: Chess | string): Chess | null {
  if (typeof input !== "string") return input;
  try { return new Chess(input); } catch { return null; }
}

/**
 * Static evaluation in centipawns, positive = good for White. Terminal nodes:
 * checkmate → ±MATE_SCORE (loser's turn), any draw → 0.
 */
export function evaluatePosition(input: Chess | string): number {
  const game = asGame(input);
  if (!game) return 0;
  if (game.isCheckmate()) return game.turn() === "w" ? -MATE_SCORE : MATE_SCORE;
  if (game.isStalemate() || game.isInsufficientMaterial() || game.isDraw()) return 0;
  return staticEval(game);
}

/**
 * Material + piece-square + light positional score (White-positive), WITHOUT
 * terminal detection — the search checks checkmate/draw itself (with mate
 * distance), so this stays cheap on the hot path.
 */
export function staticEval(game: Chess): number {
  const board = game.board(); // row 0 = rank 8, col 0 = file a
  let score = 0;
  let nonPawnMaterial = 0;
  const bishops = { w: 0, b: 0 };
  // pawn counts per file for doubled/isolated detection
  const pawnFiles = { w: new Array<number>(8).fill(0), b: new Array<number>(8).fill(0) };

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const sq = board[r][c];
      if (!sq) continue;
      const type = sq.type as PieceSymbol;
      const color = sq.color as Color;
      const idx = color === "w" ? r * 8 + c : (7 - r) * 8 + c; // mirror rank for Black
      const material = PIECE_VALUE[type];
      let v = material;
      if (type !== "k") v += PST[type][idx];
      score += color === "w" ? v : -v;

      if (type === "b") bishops[color]++;
      if (type === "p") pawnFiles[color][c]++;
      else if (type !== "k") nonPawnMaterial += material;
    }
  }

  // King PST — choose mid/endgame table by remaining non-pawn material.
  const endgame = nonPawnMaterial <= 1300; // ~ a couple of minor/rook pieces left
  const kingTable = endgame ? PST_KING_END : PST_KING_MID;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const sq = board[r][c];
      if (sq?.type !== "k") continue;
      const idx = sq.color === "w" ? r * 8 + c : (7 - r) * 8 + c;
      score += sq.color === "w" ? kingTable[idx] : -kingTable[idx];
    }
  }

  // Bishop pair.
  if (bishops.w >= 2) score += 30;
  if (bishops.b >= 2) score -= 30;

  // Doubled + isolated pawn penalties.
  for (let f = 0; f < 8; f++) {
    for (const color of ["w", "b"] as const) {
      const n = pawnFiles[color][f];
      if (n === 0) continue;
      const sign = color === "w" ? 1 : -1;
      if (n > 1) score -= sign * 12 * (n - 1); // doubled
      const left = f > 0 ? pawnFiles[color][f - 1] : 0;
      const right = f < 7 ? pawnFiles[color][f + 1] : 0;
      if (left === 0 && right === 0) score -= sign * 14 * n; // isolated
    }
  }

  return score;
}
