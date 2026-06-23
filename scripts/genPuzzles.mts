/**
 * Engine-assisted puzzle generator (Sprint 25).
 *
 * Plays seeded random games and keeps positions that contain a UNIQUE, statically
 * verifiable tactic (a mate-in-one or a single clearly material-winning capture)
 * via src/domain/puzzles/tactics.ts. No deep search — fast and fully deterministic
 * (seeded RNG + pure detector), so the output is reproducible and the soundness
 * test re-verifies every entry with the same `findTactic`.
 *
 * Run: npm run genpuzzles
 */
import { writeFileSync } from "node:fs";
import { Chess } from "chess.js";
import { findTactic } from "../src/domain/puzzles/tactics.ts";

const SEED = 0xC0FFEE;
const TARGET = 26;
const MAX_POSITIONS = 8000;

function mulberry32(a: number) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(SEED);
const pick = <T>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];

const accepted: Record<string, unknown>[] = [];
const seen = new Set<string>();
let positions = 0;

while (accepted.length < TARGET && positions < MAX_POSITIONS) {
  const game = new Chess();
  const plies = 6 + Math.floor(rng() * 34);
  for (let i = 0; i < plies; i++) {
    if (game.isGameOver()) break;
    game.move(pick(game.moves()));
  }
  if (game.isGameOver()) continue;
  const fen = game.fen();
  if (seen.has(fen)) continue;
  positions++;

  const tac = findTactic(fen);
  if (!tac) continue;
  seen.add(fen);

  const pieceCount = fen.split(" ")[0].replace(/[^a-zA-Z]/g, "").length;
  const isMate = tac.kind === "mate";
  let rating = isMate
    ? 720 + (pieceCount - 6) * 16
    : 980 - (tac.gain - 3) * 28 + (pieceCount - 8) * 12;
  rating = Math.max(620, Math.min(1300, Math.round(rating / 10) * 10));

  const idx = accepted.length + 1;
  accepted.push({
    id: `g${String(idx).padStart(2, "0")}-${isMate ? "mate-in-1" : "undefended-capture"}`,
    title: isMate ? "Find the checkmate" : "Win the material",
    theme: isMate ? "mate-in-1" : "undefended-capture",
    rating,
    fen,
    sideToMove: game.turn(),
    correctUci: tac.uci,
    answerSan: tac.san,
    explanation: isMate
      ? `${tac.san} is checkmate — there is no legal defence.`
      : `${tac.san} wins material cleanly: the captured piece cannot be recovered.`,
    xpReward: 20 + Math.round((rating - 620) / 40),
    categories: isMate ? ["tactics", "mate"] : ["tactics"],
    hint: isMate ? "Look for the forcing check the king cannot escape." : "Scan for an enemy piece you can take for free.",
  });
}

accepted.sort((a, b) => (a.rating as number) - (b.rating as number));

const body = accepted
  .map((p) => `  {
    id: ${JSON.stringify(p.id)},
    title: ${JSON.stringify(p.title)},
    theme: ${JSON.stringify(p.theme)},
    rating: ${p.rating},
    fen: ${JSON.stringify(p.fen)},
    sideToMove: ${JSON.stringify(p.sideToMove)},
    correctUci: ${JSON.stringify(p.correctUci)},
    answerSan: ${JSON.stringify(p.answerSan)},
    explanation: ${JSON.stringify(p.explanation)},
    xpReward: ${p.xpReward},
    categories: ${JSON.stringify(p.categories)},
    hint: ${JSON.stringify(p.hint)},
  },`)
  .join("\n");

const file = `import type { Puzzle } from "./beginner";

/**
 * Engine-generated tactics (Sprint 25) — produced by scripts/genPuzzles.mts from
 * seeded random self-play, each a UNIQUE statically-verified mate-in-1 or clean
 * material win. Do not edit by hand; regenerate with \`npm run genpuzzles\`. The
 * engine soundness test (scripts/engineCheck.mts) re-verifies every entry.
 */
export const GENERATED_PUZZLES: Puzzle[] = [
${body}
];
`;

writeFileSync("src/content/puzzles/generated.ts", file);
console.log(`✓ Generated ${accepted.length} puzzles (scanned ${positions} positions) → src/content/puzzles/generated.ts`);
console.log("  ratings:", accepted.map((p) => p.rating).join(", "));
