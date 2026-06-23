import { Chess } from "chess.js";

/**
 * Static tactic finder — no search, fully deterministic. Detects the two cheap,
 * verifiable puzzle motifs the generator (scripts/genPuzzles.mts) uses and the
 * soundness test re-checks: a UNIQUE mate-in-one, or a single clearly
 * material-winning capture (simple one-recapture SEE). Pure + fast so it can run
 * over thousands of positions and re-verify generated puzzles at test time.
 */

const VAL: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

export interface Tactic {
  uci: string;
  san: string;
  kind: "mate" | "capture";
  /** Material won (pawns); 100 for a mate. */
  gain: number;
}

interface VMove {
  from: string; to: string; promotion?: string; captured?: string; piece: string; san: string;
}

const uci = (m: VMove) => `${m.from}${m.to}${m.promotion ?? ""}`;

/** The single best forcing tactic in a position, or null if none is clean/unique. */
export function findTactic(fen: string): Tactic | null {
  let game: Chess;
  try { game = new Chess(fen); } catch { return null; }
  if (game.isGameOver()) return null;
  const moves = game.moves({ verbose: true }) as unknown as VMove[];

  // 1) Mate in one — only accept a UNIQUE mating move (single clear solution).
  const mates: VMove[] = [];
  for (const m of moves) {
    const g = new Chess(fen);
    g.move({ from: m.from, to: m.to, promotion: (m.promotion as never) ?? "q" });
    if (g.isCheckmate()) mates.push(m);
  }
  if (mates.length === 1) return { uci: uci(mates[0]), san: mates[0].san, kind: "mate", gain: 100 };
  if (mates.length > 1) return null; // ambiguous → skip

  // 2) Winning capture — exactly one capture that wins material after one recapture.
  const winning: { m: VMove; gain: number }[] = [];
  for (const m of moves) {
    if (!m.captured) continue;
    const g = new Chess(fen);
    g.move({ from: m.from, to: m.to, promotion: (m.promotion as never) ?? "q" });
    const recapture = (g.moves({ verbose: true }) as unknown as VMove[]).some((r) => r.to === m.to && r.captured);
    const gain = VAL[m.captured] - (recapture ? VAL[m.piece] : 0);
    if (gain >= 3) winning.push({ m, gain });
  }
  if (winning.length === 1) {
    const w = winning[0];
    return { uci: uci(w.m), san: w.m.san, kind: "capture", gain: w.gain };
  }
  return null;
}
