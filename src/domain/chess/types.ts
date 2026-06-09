import type { Color, PieceSymbol, Square } from "chess.js";

export type { Color, PieceSymbol, Square };

export type GameStatus = "playing" | "check" | "checkmate" | "stalemate" | "draw";

export interface MoveRecord {
  san: string;
  from: Square;
  to: Square;
  color: Color;
  captured?: PieceSymbol;
}

export interface BoardCell {
  type: PieceSymbol;
  color: Color;
}

export interface GameSnapshot {
  fen: string;
  pgn: string;
  turn: Color;
  status: GameStatus;
  history: MoveRecord[];
  lastMove: { from: Square; to: Square } | null;
  /** Black pieces that White has captured. */
  capturedByWhite: PieceSymbol[];
  /** White pieces that Black has captured. */
  capturedByBlack: PieceSymbol[];
  isGameOver: boolean;
}
