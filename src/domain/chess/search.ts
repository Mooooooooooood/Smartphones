import { Chess } from "chess.js";
import type { PieceSymbol } from "chess.js";
import { staticEval, PIECE_VALUE, MATE_SCORE } from "./eval";

/**
 * Original alpha-beta search over chess.js move generation. Negamax with
 * iterative deepening, a per-search transposition table, MVV-LVA + killer +
 * history move ordering, check extensions, and a capture-only quiescence with
 * delta pruning to dodge horizon blunders. A node/time budget means it never
 * hangs the UI. Deterministic for a given (fen, depth, nodeBudget) — opponent
 * "weakening" randomness lives in bot.ts, so this stays unit-testable.
 *
 * Hot path: chess.js's public verbose `moves()` builds SAN + before/after FENs
 * for every move (each SAN is itself a full legal-move generation), which is
 * ~10x the cost of generating the moves. The search therefore uses the
 * library's internal generator + make/unmake and its incremental zobrist hash
 * when available, with a public-API fallback so a future chess.js can't break
 * correctness — only speed.
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

/* ---------- move generation (fast internal path + public fallback) ---------- */

/** The search's view of a move; `raw` is whatever make() needs to replay it. */
interface SMove {
  from: string;
  to: string;
  piece: PieceSymbol;
  captured?: PieceSymbol;
  promotion?: PieceSymbol;
  raw: unknown;
}

interface InternalMove {
  from: number;
  to: number;
  piece: PieceSymbol;
  captured?: PieceSymbol;
  promotion?: PieceSymbol;
}
interface ChessInternals {
  _moves(opts: { legal: boolean }): InternalMove[];
  _makeMove(m: InternalMove): void;
  _undoMove(): unknown;
  _hash: bigint | number;
  _halfMoves: number;
}

const asInternals = (game: Chess) => game as unknown as ChessInternals;

/** Feature-probe the private API once; fall back to the public one if it moved. */
const FAST: boolean = (() => {
  try {
    const g = asInternals(new Chess());
    return (
      typeof g._moves === "function" &&
      typeof g._makeMove === "function" &&
      typeof g._undoMove === "function" &&
      (typeof g._hash === "bigint" || typeof g._hash === "number") &&
      typeof g._halfMoves === "number"
    );
  } catch {
    return false;
  }
})();

/** 0x88 square index → algebraic ("e4"). */
const alg = (sq: number) => "abcdefgh"[sq & 0xf] + String(8 - (sq >> 4));

function genMoves(game: Chess): SMove[] {
  if (FAST) {
    return asInternals(game)._moves({ legal: true }).map((m) => ({
      from: alg(m.from), to: alg(m.to), piece: m.piece, captured: m.captured, promotion: m.promotion, raw: m,
    }));
  }
  return (game.moves({ verbose: true }) as unknown as (SMove & { san: string })[]).map((m) => ({
    from: m.from, to: m.to, piece: m.piece, captured: m.captured, promotion: m.promotion, raw: m,
  }));
}

function makeMove(game: Chess, m: SMove) {
  if (FAST) asInternals(game)._makeMove(m.raw as InternalMove);
  else game.move({ from: m.from, to: m.to, promotion: m.promotion });
}

function unmakeMove(game: Chess) {
  if (FAST) asInternals(game)._undoMove();
  else game.undo();
}

/** Position identity for the TT and repetition checks (turn + castling + ep included). */
function posKey(game: Chess): bigint | number | string {
  if (FAST) return asInternals(game)._hash;
  const fen = game.fen();
  return fen.slice(0, fen.lastIndexOf(" ", fen.lastIndexOf(" ") - 1));
}

const fiftyMoves = (game: Chess) => (FAST ? asInternals(game)._halfMoves >= 100 : game.isDraw());

const uciOf = (m: SMove) => `${m.from}${m.to}${m.promotion ?? ""}`;

/* ---------- transposition table ---------- */

/** Scores this close to MATE_SCORE are mate scores and carry a ply distance. */
const MATE_WINDOW = MATE_SCORE - 1000;
/** Mate scores are stored in the TT relative to the node, not the root. */
const toTT = (s: number, ply: number) => (s > MATE_WINDOW ? s + ply : s < -MATE_WINDOW ? s - ply : s);
const fromTT = (s: number, ply: number) => (s > MATE_WINDOW ? s - ply : s < -MATE_WINDOW ? s + ply : s);

const enum Bound { Exact, Lower, Upper }
interface TTEntry {
  depth: number;
  score: number;
  bound: Bound;
  best: string;
}

/* ---------- the search ---------- */

class Searcher {
  private nodes = 0;
  private deadline: number;
  private aborted = false;
  /** Transposition table for this search. */
  private tt = new Map<bigint | number | string, TTEntry>();
  /** Positions on the current search path — any repetition scores as a draw. */
  private path: (bigint | number | string)[] = [];
  /** Two killer moves per ply — quiet moves that recently caused a cutoff. */
  private killers: string[][] = [];
  /** History heuristic for quiet-move ordering, keyed on from+to. */
  private history = new Map<string, number>();

  constructor(private budget: number, timeMs: number) {
    this.deadline = Date.now() + timeMs;
  }

  private sinceClock = 0;

  private out(): boolean {
    if (this.aborted) return true;
    if (this.nodes >= this.budget) return (this.aborted = true);
    // Check the wall clock every 512 calls — cheap, and unlike keying off exact
    // node-counter multiples it can't be starved by early-return paths.
    if (++this.sinceClock >= 512) {
      this.sinceClock = 0;
      if (Date.now() > this.deadline) this.aborted = true;
    }
    return this.aborted;
  }

  /** MVV-LVA for captures, then killers, then history; the TT move always leads. */
  private orderScore(m: SMove, ttBest: string | undefined, ply: number): number {
    const uci = uciOf(m);
    if (ttBest && uci === ttBest) return Infinity;
    let s = 0;
    if (m.captured) s = 1_000_000 + 10 * PIECE_VALUE[m.captured] - PIECE_VALUE[m.piece];
    else {
      const k = this.killers[ply];
      if (k && (k[0] === uci || k[1] === uci)) s = 900_000;
      else s = this.history.get(m.from + m.to) ?? 0;
    }
    // Promotions rank with the best captures (a quiet queening beats a killer).
    if (m.promotion) s += 950_000 + PIECE_VALUE[m.promotion];
    return s;
  }

  private ordered(moves: SMove[], ttBest: string | undefined, ply: number): SMove[] {
    return moves
      .map((m) => ({ m, s: this.orderScore(m, ttBest, ply) }))
      .sort((a, b) => b.s - a.s)
      .map((x) => x.m);
  }

  private rememberCutoff(m: SMove, ply: number, depth: number) {
    if (m.captured || m.promotion) return;
    const uci = uciOf(m);
    const k = (this.killers[ply] ??= []);
    if (k[0] !== uci) {
      k[1] = k[0];
      k[0] = uci;
    }
    const hk = m.from + m.to;
    this.history.set(hk, (this.history.get(hk) ?? 0) + depth * depth);
  }

  /** Capture-only quiescence from the side-to-move's perspective. */
  quiesce(game: Chess, alpha: number, beta: number, qply: number, ply: number): number {
    this.nodes++;
    const stm = game.turn() === "w" ? 1 : -1;
    const standPat = stm * staticEval(game);
    if (standPat >= beta || qply <= 0 || this.out()) return standPat >= beta ? beta : standPat;
    const all = genMoves(game);
    if (all.length === 0) return game.isCheck() ? -(MATE_SCORE - ply) : 0; // mate/stalemate at the horizon
    if (standPat > alpha) alpha = standPat;
    for (const m of this.ordered(all.filter((x) => x.captured || x.promotion), undefined, ply)) {
      // Delta pruning: even winning this piece plus a margin can't lift alpha.
      if (!m.promotion && m.captured && standPat + PIECE_VALUE[m.captured] + 200 <= alpha) continue;
      makeMove(game, m);
      const score = -this.quiesce(game, -beta, -alpha, qply - 1, ply + 1);
      unmakeMove(game);
      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }
    return alpha;
  }

  /** Negamax with alpha-beta and the TT; score from the side-to-move's perspective. */
  negamax(game: Chess, depth: number, alpha: number, beta: number, ply: number): number {
    this.nodes++;
    if (fiftyMoves(game) || game.isInsufficientMaterial()) return 0;
    const key = posKey(game);
    if (this.path.includes(key)) return 0; // repetition inside the line — call it a draw

    const inCheck = game.isCheck();
    if (inCheck && ply < 32) depth += 1; // check extension — evasions are forcing
    if (depth <= 0 || this.out()) return this.quiesce(game, alpha, beta, 5, ply);

    const alphaOrig = alpha;
    const entry = this.tt.get(key);
    if (entry && entry.depth >= depth) {
      const s = fromTT(entry.score, ply);
      if (entry.bound === Bound.Exact) return s;
      if (entry.bound === Bound.Lower && s > alpha) alpha = s;
      else if (entry.bound === Bound.Upper && s < beta) beta = s;
      if (alpha >= beta) return s;
    }

    const moves = this.ordered(genMoves(game), entry?.best, ply);
    if (moves.length === 0) return inCheck ? -(MATE_SCORE - ply) : 0; // mate or stalemate

    this.path.push(key);
    let best = -Infinity;
    let bestUci = "";
    for (const m of moves) {
      makeMove(game, m);
      const score = -this.negamax(game, depth - 1, -beta, -alpha, ply + 1);
      unmakeMove(game);
      if (score > best) {
        best = score;
        bestUci = uciOf(m);
      }
      if (best > alpha) alpha = best;
      if (alpha >= beta) {
        this.rememberCutoff(m, ply, depth);
        break;
      }
    }
    this.path.pop();

    // Never store results from an aborted subtree — they're partial garbage.
    if (!this.aborted && bestUci) {
      const bound = best <= alphaOrig ? Bound.Upper : best >= beta ? Bound.Lower : Bound.Exact;
      this.tt.set(key, { depth, score: toTT(best, ply), bound, best: bestUci });
    }
    return best;
  }

  /**
   * Iterative deepening at the root. Every root move keeps an exact full-window
   * score (bot weakening and post-game analysis both need the whole list), while
   * the TT carries move ordering from one iteration into the next. If an
   * iteration runs out of budget, the last fully completed one is returned.
   */
  rootMoves(game: Chess, maxDepth: number): { moves: ScoredMove[]; depth: number } {
    const rootKey = posKey(game);
    let order = this.ordered(genMoves(game), undefined, 0);
    let result: ScoredMove[] = order.map((m) => ({ uci: uciOf(m), scoreCp: 0 }));
    let completed = 0;

    for (let d = 1; d <= maxDepth; d++) {
      const scored: ScoredMove[] = [];
      for (const m of order) {
        this.path = [rootKey];
        makeMove(game, m);
        const score = -this.negamax(game, d - 1, -Infinity, Infinity, 1);
        unmakeMove(game);
        if (this.aborted) break;
        scored.push({ uci: uciOf(m), scoreCp: score });
      }
      if (scored.length !== order.length) break; // budget hit — keep the previous depth
      scored.sort((a, b) => b.scoreCp - a.scoreCp);
      result = scored;
      completed = d;
      // Search the next iteration best-first.
      const rank = new Map(scored.map((s, i) => [s.uci, i]));
      order = [...order].sort((a, b) => (rank.get(uciOf(a)) ?? Infinity) - (rank.get(uciOf(b)) ?? Infinity));
    }
    return { moves: result, depth: completed };
  }
}

/** All legal root moves scored best-first (side-to-move perspective). */
export function searchRootMoves(fen: string, opts: SearchOpts = {}): { moves: ScoredMove[]; depth: number } {
  const { maxDepth = 3, nodeBudget = 250000, timeMs = 1500 } = opts;
  let game: Chess;
  try { game = new Chess(fen); } catch { return { moves: [], depth: 0 }; }
  if (game.isGameOver()) return { moves: [], depth: 0 };
  const s = new Searcher(nodeBudget, timeMs);
  return s.rootMoves(game, Math.max(1, maxDepth));
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
