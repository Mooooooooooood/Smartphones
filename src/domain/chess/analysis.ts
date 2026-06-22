import { Chess } from "chess.js";
import { searchRootMoves } from "./search";

/**
 * Post-game analysis built on the homegrown search. For every played move we
 * compare it to the engine's best at the same position: the centipawn loss
 * classifies the move (best → blunder) and feeds an accuracy %. Runs chunked so
 * a full game never blocks the UI.
 */

export type MoveQuality = "best" | "good" | "inaccuracy" | "mistake" | "blunder";

export interface MoveEval {
  /** 0-based ply index. */
  ply: number;
  side: "w" | "b";
  /** The move actually played, in UCI. */
  uci: string;
  /** The engine's preferred move at that position, in UCI. */
  bestUci: string;
  /** Centipawns lost vs the best move (≥ 0, capped for sanity). */
  cpLoss: number;
  /** White-positive evaluation after the move, in centipawns. */
  evalCp: number;
  classification: MoveQuality;
}

export interface GameAnalysis {
  perMove: MoveEval[];
  accuracy: { white: number; black: number };
}

export interface AnalyzeOpts {
  depth?: number;
  /** Called with progress 0..1 as plies are analysed. */
  onProgress?: (done: number, total: number) => void;
  /** Optional starting position (defaults to the standard start). */
  startFen?: string;
}

function classify(cpLoss: number, isBest: boolean): MoveQuality {
  if (isBest || cpLoss < 10) return "best";
  if (cpLoss < 50) return "good";
  if (cpLoss < 120) return "inaccuracy";
  if (cpLoss < 250) return "mistake";
  return "blunder";
}

/** Per-move accuracy from centipawn loss (transparent linear model, capped). */
function moveAccuracy(cpLoss: number): number {
  return Math.max(0, 100 - Math.min(cpLoss, 1000) / 8);
}

const nextTick = () => new Promise<void>((r) => setTimeout(r, 0));

/**
 * Analyse a game given its moves in UCI (played from `startFen`, default start).
 * Async + chunked (yields every few plies) so the UI stays responsive.
 */
export async function analyzeGame(moves: string[], opts: AnalyzeOpts = {}): Promise<GameAnalysis> {
  const { depth = 2, onProgress, startFen } = opts;
  const game = startFen ? new Chess(startFen) : new Chess();
  const perMove: MoveEval[] = [];
  const accSum = { w: 0, b: 0 };
  const accCount = { w: 0, b: 0 };

  for (let i = 0; i < moves.length; i++) {
    const uci = moves[i];
    const side = game.turn();
    const fenBefore = game.fen();
    const { moves: scored } = searchRootMoves(fenBefore, { maxDepth: depth });

    const best = scored[0];
    const played = scored.find((m) => m.uci === uci) ?? scored.find((m) => m.uci.slice(0, 4) === uci.slice(0, 4));
    const bestScore = best?.scoreCp ?? 0;
    const playedScore = played?.scoreCp ?? bestScore;
    const cpLoss = Math.max(0, bestScore - playedScore);
    const isBest = !!best && (best.uci === uci || best.uci.slice(0, 4) === uci.slice(0, 4));
    const evalCp = side === "w" ? playedScore : -playedScore; // White-positive eval bar

    perMove.push({ ply: i, side, uci, bestUci: best?.uci ?? uci, cpLoss, evalCp, classification: classify(cpLoss, isBest) });
    accSum[side] += moveAccuracy(cpLoss);
    accCount[side]++;

    // Advance the game by the played move.
    try {
      game.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: (uci[4] as never) ?? "q" });
    } catch {
      break; // malformed move list — stop gracefully
    }
    onProgress?.(i + 1, moves.length);
    if ((i & 3) === 3) await nextTick();
  }

  return {
    perMove,
    accuracy: {
      white: accCount.w ? Math.round(accSum.w / accCount.w) : 100,
      black: accCount.b ? Math.round(accSum.b / accCount.b) : 100,
    },
  };
}
