import { Chess } from "chess.js";
import type { PieceSymbol } from "chess.js";
import { staticEval, PIECE_VALUE, MATE_SCORE } from "./eval";

/**
 * Original alpha-beta search over chess.js move generation. Negamax with
 * MVV-LVA move ordering, a capture-only quiescence to dodge horizon blunders,
 * and a node/time budget so it never hangs the UI. Deterministic for a given
 * (fen, depth) — opponent "weakening" randomness lives in bot.ts, so this stays
 * unit-testable.
 */

export interface SearchOpts {
  maxDepth?: number;
  nodeBudget?: number;
  timeMs?: number;
}

export interface ScoredMove {
  uci: string;
  /** Centipawns from the side-to-move's perspective (positive = good for the mover). */
  scoreCp: number;
}

interface VMove {
  from: string;
  to: string;
  promotion?: PieceSymbol;
  captured?: PieceSymbol;
  piece: PieceSymbol;
  flags: string;
}

const uciOf = (m: VMove) => `${m.from}${m.to}${m.promotion ?? ""}`;

/** MVV-LVA: prefer capturing valuable pieces with cheap ones; promotions first. */
function orderScore(m: VMove): number {
  let s = 0;
  if (m.captured) s += 10 * PIECE_VALUE[m.captured] - PIECE_VALUE[m.piece];
  if (m.promotion) s += 800;
  return s;
}

function ordered(game: Chess, capturesOnly = false): VMove[] {
  const moves = game.moves({ verbose: true }) as unknown as VMove[];
  const list = capturesOnly ? moves.filter((m) => m.captured || m.promotion) : moves;
  return list.sort((a, b) => orderScore(b) - orderScore(a));
}

class Searcher {
  private nodes = 0;
  private deadline: number;
  constructor(private budget: number, timeMs: number) {
    this.deadline = Date.now() + timeMs;
  }
  private out() {
    return this.nodes >= this.budget || (this.nodes & 1023) === 0 && Date.now() > this.deadline;
  }

  /** Capture-only quiescence from the side-to-move's perspective. */
  quiesce(game: Chess, alpha: number, beta: number, qply: number): number {
    this.nodes++;
    const stm = game.turn() === "w" ? 1 : -1;
    const standPat = stm * staticEval(game);
    if (standPat >= beta || qply <= 0 || this.out()) return standPat >= beta ? beta : standPat;
    if (standPat > alpha) alpha = standPat;
    for (const m of ordered(game, true)) {
      game.move(m as never);
      const score = -this.quiesce(game, -beta, -alpha, qply - 1);
      game.undo();
      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }
    return alpha;
  }

  /** Negamax with alpha-beta; score from the side-to-move's perspective. */
  negamax(game: Chess, depth: number, alpha: number, beta: number, ply: number): number {
    if (game.isCheckmate()) return -(MATE_SCORE - ply); // side to move is mated
    if (game.isStalemate() || game.isInsufficientMaterial() || game.isDraw()) return 0;
    if (depth <= 0 || this.out()) return this.quiesce(game, alpha, beta, 5);

    let best = -Infinity;
    for (const m of ordered(game)) {
      game.move(m as never);
      const score = -this.negamax(game, depth - 1, -beta, -alpha, ply + 1);
      game.undo();
      if (score > best) best = score;
      if (best > alpha) alpha = best;
      if (alpha >= beta) break;
    }
    return best;
  }

  rootMoves(game: Chess, depth: number): ScoredMove[] {
    const scored: ScoredMove[] = [];
    for (const m of ordered(game)) {
      game.move(m as never);
      const score = -this.negamax(game, depth - 1, -Infinity, Infinity, 1);
      game.undo();
      scored.push({ uci: uciOf(m), scoreCp: score });
    }
    return scored.sort((a, b) => b.scoreCp - a.scoreCp);
  }
}

/** All legal root moves scored best-first (side-to-move perspective). */
export function searchRootMoves(fen: string, opts: SearchOpts = {}): { moves: ScoredMove[]; depth: number } {
  const { maxDepth = 3, nodeBudget = 250000, timeMs = 1500 } = opts;
  let game: Chess;
  try { game = new Chess(fen); } catch { return { moves: [], depth: 0 }; }
  if (game.isGameOver()) return { moves: [], depth: 0 };
  const s = new Searcher(nodeBudget, timeMs);
  return { moves: s.rootMoves(game, Math.max(1, maxDepth)), depth: maxDepth };
}

/** Best move for the side to move (or null if the game is over / illegal fen). */
export function searchBestMove(fen: string, opts: SearchOpts = {}): (ScoredMove & { depth: number }) | null {
  const { moves, depth } = searchRootMoves(fen, opts);
  return moves.length ? { ...moves[0], depth } : null;
}

/** Best achievable score for the side to move (centipawns, mover-positive). */
export function searchEval(fen: string, depth = 2, opts: SearchOpts = {}): number {
  const best = searchBestMove(fen, { ...opts, maxDepth: depth });
  return best ? best.scoreCp : 0;
}
