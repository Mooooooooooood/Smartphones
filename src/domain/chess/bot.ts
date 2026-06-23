import { Chess } from "chess.js";
import type { PieceSymbol, Square } from "chess.js";
import { searchRootMoves } from "./search";

/**
 * Bot opponents. Move legality always comes from chess.js, so a bot can never
 * play an illegal move. Strength is real: `chooseOpponentMove` runs the homegrown
 * search at the opponent's `depth`, then weakens by `skill` so beginners still
 * get winnable games. Pure + testable — pass a custom `rng` for determinism.
 */

export type BotPersonality = "random" | "cautious" | "tactical";

export interface BotMove {
  from: Square;
  to: Square;
  promotion?: PieceSymbol;
}

export interface BotStrength {
  /** Search depth (1–4). Higher = stronger and slower. */
  depth: number;
  /** 0 = plays near-random, 1 = always the engine's best move. */
  skill: number;
}

function uciToMove(uci: string): BotMove {
  return { from: uci.slice(0, 2) as Square, to: uci.slice(2, 4) as Square, promotion: (uci[4] as PieceSymbol) || undefined };
}

/**
 * Engine-backed move for an opponent of a given strength. Searches at `depth`,
 * then applies `skill`-based weakening: weak bots occasionally play an outright
 * random move and otherwise pick from a wider, softmax-weighted band of top
 * moves; strong bots (skill 1) always play the best move.
 */
export function chooseOpponentMove(
  fen: string,
  { depth, skill }: BotStrength,
  rng: () => number = Math.random,
): BotMove | null {
  const { moves } = searchRootMoves(fen, { maxDepth: Math.max(1, depth) });
  if (moves.length === 0) return null;

  // Weak bots sometimes just blunder a random legal move.
  const blunderRate = Math.max(0, (1 - skill)) * 0.35;
  if (rng() < blunderRate) return uciToMove(moves[Math.floor(rng() * moves.length)].uci);

  // Otherwise sample from the top-K, softmax-weighted by score (temperature rises
  // as skill falls). skill = 1 collapses to always-best.
  const k = Math.max(1, Math.min(moves.length, Math.round(1 + (1 - skill) * 5)));
  const top = moves.slice(0, k);
  const temp = 40 + (1 - skill) * 260; // centipawns
  const best = top[0].scoreCp;
  const weights = top.map((m) => Math.exp((m.scoreCp - best) / temp));
  const sum = weights.reduce((a, b) => a + b, 0);
  let r = rng() * sum;
  for (let i = 0; i < top.length; i++) {
    r -= weights[i];
    if (r <= 0) return uciToMove(top[i].uci);
  }
  return uciToMove(top[0].uci);
}

const VALUE: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
const CENTER = new Set(["d4", "e4", "d5", "e5"]);

interface VMove {
  from: Square;
  to: Square;
  promotion?: PieceSymbol;
  captured?: PieceSymbol;
  piece: PieceSymbol;
  san: string;
  flags: string;
}

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)] ?? arr[0];
}

/** A capture that wins or trades evenly is a "good" capture for a cautious bot. */
function goodCaptures(moves: VMove[]): VMove[] {
  return moves.filter((m) => m.captured && VALUE[m.captured] >= VALUE[m.piece]);
}

function tacticalScore(m: VMove, rng: () => number): number {
  let s = rng() * 3; // playful jitter
  if (m.san.endsWith("#")) s += 1000;
  else if (m.san.includes("+")) s += 25;
  if (m.captured) s += VALUE[m.captured] * 10;
  if (m.promotion) s += 80;
  if (CENTER.has(m.to)) s += 6;
  // simple development: a minor piece leaving its back rank
  if ((m.piece === "n" || m.piece === "b") && (m.from[1] === "1" || m.from[1] === "8")) s += 5;
  return s;
}

/**
 * Choose a legal move for the side to move, or `null` if the game is over or
 * there are no legal moves.
 */
export function chooseBotMove(
  fen: string,
  personality: BotPersonality,
  rng: () => number = Math.random,
): BotMove | null {
  let game: Chess;
  try {
    game = new Chess(fen);
  } catch {
    return null;
  }
  if (game.isGameOver()) return null;

  const moves = game.moves({ verbose: true }) as unknown as VMove[];
  if (moves.length === 0) return null;

  let chosen: VMove;
  if (personality === "tactical") {
    if (rng() < 0.15) {
      chosen = pick(moves, rng); // sometimes play tricky/random
    } else {
      let best = moves[0];
      let bestScore = -Infinity;
      for (const m of moves) {
        const sc = tacticalScore(m, rng);
        if (sc > bestScore) {
          bestScore = sc;
          best = m;
        }
      }
      chosen = best;
    }
  } else if (personality === "cautious") {
    const good = goodCaptures(moves);
    chosen = good.length && rng() < 0.6 ? pick(good, rng) : pick(moves, rng);
  } else {
    chosen = pick(moves, rng); // random / newcomer
  }

  return { from: chosen.from, to: chosen.to, promotion: chosen.promotion };
}
