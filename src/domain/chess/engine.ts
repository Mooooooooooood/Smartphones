import { Chess } from "chess.js";
import type { Color, PieceSymbol, Square } from "chess.js";
import type { BoardCell, GameSnapshot, GameStatus, MoveRecord } from "./types";

/**
 * All chess rules live here, isolated from React. chess.js v1 throws on an
 * illegal move and on an invalid PGN, so every fallible call is guarded.
 */

export function createGame(pgn?: string): Chess {
  const game = new Chess();
  if (pgn) {
    try {
      game.loadPgn(pgn);
    } catch {
      /* corrupt/empty save — start from the initial position instead */
    }
  }
  return game;
}

export function legalTargets(game: Chess, square: Square): Square[] {
  return game.moves({ square, verbose: true }).map((m) => m.to);
}

export function tryMove(
  game: Chess,
  from: Square,
  to: Square,
  promotion: PieceSymbol = "q",
): boolean {
  try {
    game.move({ from, to, promotion });
    return true;
  } catch {
    return false;
  }
}

export function getStatus(game: Chess): GameStatus {
  if (game.isCheckmate()) return "checkmate";
  if (game.isStalemate()) return "stalemate";
  if (game.isDraw()) return "draw";
  if (game.isCheck()) return "check";
  return "playing";
}

export function snapshot(game: Chess): GameSnapshot {
  const verbose = game.history({ verbose: true });
  const capturedByWhite: PieceSymbol[] = [];
  const capturedByBlack: PieceSymbol[] = [];

  const history: MoveRecord[] = verbose.map((m) => {
    if (m.captured) {
      (m.color === "w" ? capturedByWhite : capturedByBlack).push(m.captured);
    }
    return { san: m.san, from: m.from, to: m.to, color: m.color, captured: m.captured };
  });

  const last = verbose.at(-1);

  return {
    fen: game.fen(),
    pgn: game.pgn(),
    turn: game.turn(),
    status: getStatus(game),
    history,
    lastMove: last ? { from: last.from, to: last.to } : null,
    capturedByWhite,
    capturedByBlack,
    isGameOver: game.isGameOver(),
  };
}

export function boardMatrix(game: Chess): (BoardCell | null)[][] {
  return game
    .board()
    .map((row) => row.map((c) => (c ? { type: c.type, color: c.color } : null)));
}

export function findKing(game: Chess, color: Color): Square | null {
  for (const row of game.board()) {
    for (const cell of row) {
      if (cell && cell.type === "k" && cell.color === color) return cell.square;
    }
  }
  return null;
}
