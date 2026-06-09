import { Chess } from "chess.js";
import type { PieceSymbol, Square } from "chess.js";

/**
 * Puzzle move validation, isolated from any UI. chess.js v1 throws on illegal
 * moves and invalid FENs, so every fallible call is guarded.
 *
 * UCI (a.k.a. long algebraic) is the source of truth for "the answer": a move
 * is `from` + `to` + an optional promotion piece, e.g. "e2e4" or "e7e8q".
 */

export interface EvaluatedMove {
  /** Was the move legal in the given position? */
  legal: boolean;
  /** UCI string of the move, or null if illegal. */
  uci: string | null;
  /** Standard algebraic notation, or null if illegal. */
  san: string | null;
  /** Did the move capture a piece? */
  isCapture: boolean;
  /** Did the move give check? */
  isCheck: boolean;
  /** Did the move deliver checkmate? */
  isMate: boolean;
}

const ILLEGAL: EvaluatedMove = {
  legal: false,
  uci: null,
  san: null,
  isCapture: false,
  isCheck: false,
  isMate: false,
};

/** Side to move encoded in a FEN, or null if the FEN cannot be parsed. */
export function sideToMove(fen: string): "w" | "b" | null {
  try {
    return new Chess(fen).turn();
  } catch {
    return null;
  }
}

/** True if the FEN describes a position chess.js can load. */
export function isValidFen(fen: string): boolean {
  return sideToMove(fen) !== null;
}

/** All legal destination squares for the piece on `square`. */
export function legalTargets(fen: string, square: Square): Square[] {
  try {
    return new Chess(fen).moves({ square, verbose: true }).map((m) => m.to);
  } catch {
    return [];
  }
}

/**
 * Apply a candidate move to a FEN and report what it did. The position is
 * loaded fresh every call, so this never mutates shared state.
 */
export function evaluateMove(
  fen: string,
  from: Square,
  to: Square,
  promotion: PieceSymbol = "q",
): EvaluatedMove {
  let game: Chess;
  try {
    game = new Chess(fen);
  } catch {
    return ILLEGAL;
  }

  try {
    const move = game.move({ from, to, promotion });
    return {
      legal: true,
      uci: move.lan,
      san: move.san,
      isCapture: Boolean(move.captured),
      isCheck: game.isCheck(),
      isMate: game.isCheckmate(),
    };
  } catch {
    return ILLEGAL;
  }
}

/** Case-insensitive comparison of two UCI strings. */
export function isCorrectMove(playedUci: string, correctUci: string): boolean {
  return playedUci.toLowerCase() === correctUci.toLowerCase();
}

/** FEN reached after playing `uci` from `fen`, or the original FEN if illegal. */
export function fenAfterUci(fen: string, uci: string): string {
  try {
    const game = new Chess(fen);
    game.move({
      from: uci.slice(0, 2) as Square,
      to: uci.slice(2, 4) as Square,
      promotion: (uci[4] as PieceSymbol) || "q",
    });
    return game.fen();
  } catch {
    return fen;
  }
}
