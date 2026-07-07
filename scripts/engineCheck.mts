/**
 * Homegrown engine checks (Sprint 23): evaluation, alpha-beta search, and
 * post-game analysis. Run: npm run test:engine
 */
import { evaluatePosition, MATE_SCORE } from "../src/domain/chess/eval.ts";
import { searchBestMove, searchRootMoves } from "../src/domain/chess/search.ts";
import { analyzeGame } from "../src/domain/chess/analysis.ts";
import { BEGINNER_PUZZLES } from "../src/content/puzzles/beginner.ts";
import { findTactic } from "../src/domain/puzzles/tactics.ts";
import { Chess } from "chess.js";

let pass = 0;
let fail = 0;
function ok(name: string, cond: boolean) {
  if (cond) pass++;
  else { fail++; console.error("✗", name); }
}

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

// ---- Evaluation ----
ok("start position is balanced (≈0)", Math.abs(evaluatePosition(START)) < 5);
ok("a rook up scores clearly for White", evaluatePosition("4k3/8/8/8/8/8/8/R3K3 w - - 0 1") > 300);
ok("a queen down scores clearly for Black", evaluatePosition("3qk3/8/8/8/8/8/8/4K3 w - - 0 1") < -700);
ok("checkmate returns -MATE for the mated side (White)", evaluatePosition("rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3") === -MATE_SCORE);
ok("a draw/stalemate is 0", evaluatePosition("7k/8/5KQ1/8/8/8/8/8 b - - 0 1") === 0);

// ---- Search ----
const mate = searchBestMove("6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1", { maxDepth: 2 });
ok("finds the mate-in-1 (Ra8#)", mate?.uci === "a1a8");
ok("mate score is near MATE_SCORE", (mate?.scoreCp ?? 0) > MATE_SCORE - 100);

const grab = searchBestMove("4k3/pp6/8/3q4/8/4N3/PP6/4K3 w - - 0 1", { maxDepth: 3 });
ok("grabs the free hanging queen (Nxd5)", grab?.uci?.startsWith("e3d5") === true);
ok("winning the queen leaves White a piece up", (grab?.scoreCp ?? 0) > 200);

const start = searchBestMove(START, { maxDepth: 2 });
ok("returns a legal move from the start", !!start && /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(start.uci));
ok("search is deterministic", searchBestMove(START, { maxDepth: 2 })?.uci === start?.uci);
ok("no move when the game is already over", searchBestMove("rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3", { maxDepth: 2 }) === null);

// ---- Iterative deepening + transposition table (Sprint 30) ----
// A ladder mate-in-2: 1.Ra7 (any) 2.Rb8#. Depth 3 must see the forced mate.
const mate2 = searchBestMove("7k/8/8/8/8/8/R7/1R5K w - - 0 1", { maxDepth: 3 });
ok("finds a forced mate-in-2 at depth 3", (mate2?.scoreCp ?? 0) > MATE_SCORE - 100);
ok("search reports the completed depth", searchBestMove(START, { maxDepth: 3 })?.depth === 3);
// Root list: every legal move exactly once, scored best-first.
const rootList = searchRootMoves(START, { maxDepth: 2 });
ok("root list scores all 20 opening moves", rootList.moves.length === 20 && new Set(rootList.moves.map((m) => m.uci)).size === 20);
ok("root list is sorted best-first", rootList.moves.every((m, i) => i === 0 || rootList.moves[i - 1].scoreCp >= m.scoreCp));
ok("root scores are identical across runs (TT stays deterministic)",
  JSON.stringify(searchRootMoves(START, { maxDepth: 2 }).moves) === JSON.stringify(rootList.moves));
// A starved budget falls back to the deepest fully-completed iteration but stays legal.
const starved = searchRootMoves(START, { maxDepth: 5, nodeBudget: 3000 });
ok("a tiny node budget still returns every legal move", starved.moves.length === 20);
ok("a tiny node budget reports a shallower depth", starved.depth < 5);

// ---- Eval positional terms (Sprint 30) ----
// Same material; only the black pawn's file changes: e6 blocks White's e5 pawn,
// g6 leaves it passed (and g6 is itself passed) — the passer bonus must show.
const blocked = evaluatePosition("k7/8/4p3/4P3/8/8/8/K7 w - - 0 1");
const passed = evaluatePosition("k7/8/6p1/4P3/8/8/8/K7 w - - 0 1");
ok("a passed pawn evaluates above a blocked one", passed - blocked >= 20);
// Same material; the white a-pawn moves off the rook's file, opening it.
const rookClosed = evaluatePosition("k7/8/8/8/8/8/P7/R6K w - - 0 1");
const rookOpen = evaluatePosition("k7/8/8/8/8/8/1P6/R6K w - - 0 1");
ok("a rook on an open file evaluates higher", rookOpen - rookClosed >= 20);

// ---- Analysis ----
// White hangs the queen: 1.Qh5 g6?? loses nothing; instead play a blunder line.
// Game: 1.e4 e5 2.Qh5 Nc6 3.Qxe5+?? (grabs a pawn but exposes queen) — keep it simple:
// a short game where Black blunders the queen with ...Qd4?? into Nxd4 is hard to script;
// use a game where White plays a clear blunder (hangs a rook) and check it's flagged.
// 1.e4 e5 2.Bc4 Bc5 3.Qh5 Qe7 4.Qxf7+?? Qxf7 — White throws the queen away for a pawn (ply 6).
const blunderGame = ["e2e4", "e7e5", "f1c4", "f8c5", "d1h5", "d8e7", "h5f7", "e7f7"];
const analysis = await analyzeGame(blunderGame, { depth: 2 });
ok("analysis returns one entry per move", analysis.perMove.length === blunderGame.length);
ok("the Qxf7+ blunder is flagged mistake/blunder", ["mistake", "blunder"].includes(analysis.perMove[6]?.classification));
ok("accuracy is reported for both sides", analysis.accuracy.white >= 0 && analysis.accuracy.white <= 100 && analysis.accuracy.black >= 0 && analysis.accuracy.black <= 100);
ok("a best-move suggestion exists for the blunder", typeof analysis.perMove[6]?.bestUci === "string" && analysis.perMove[6].bestUci.length >= 4);

// ---- Puzzle soundness ----
let allLegal = true;
for (const p of BEGINNER_PUZZLES) {
  try {
    const g = new Chess(p.fen);
    const m = g.move({ from: p.correctUci.slice(0, 2), to: p.correctUci.slice(2, 4), promotion: (p.correctUci[4] as never) ?? "q" });
    if (!m) allLegal = false;
  } catch { allLegal = false; }
}
ok("every puzzle's solution is a legal move", allLegal);
// The new advanced (a0*) puzzles must match the engine's best move at depth 3.
let advancedSound = true;
for (const p of BEGINNER_PUZZLES.filter((q) => q.id.startsWith("a0"))) {
  const best = searchBestMove(p.fen, { maxDepth: 3 });
  if (!best || best.uci.slice(0, 4) !== p.correctUci.slice(0, 4)) advancedSound = false;
}
ok("advanced ladder puzzles match the engine's best move", advancedSound);
ok("puzzle rating range now extends past 800", BEGINNER_PUZZLES.some((p) => p.rating >= 1000));

// Generated (g*) puzzles must each re-verify as a unique static tactic.
const generated = BEGINNER_PUZZLES.filter((p) => p.id.startsWith("g0") || p.id.startsWith("g1") || p.id.startsWith("g2"));
let genSound = generated.length >= 10;
for (const p of generated) {
  const t = findTactic(p.fen);
  if (!t || t.uci !== p.correctUci) genSound = false;
}
ok("every generated puzzle re-verifies as a unique tactic", genSound);
ok("puzzle ids are unique", new Set(BEGINNER_PUZZLES.map((p) => p.id)).size === BEGINNER_PUZZLES.length);

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
console.log("✓ All engine checks passed");
