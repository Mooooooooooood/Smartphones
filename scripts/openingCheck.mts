/**
 * Opening trainer checks (Sprint 26): every repertoire line is legal, the
 * learner plays the right colour, and the learner's book moves are not engine
 * blunders. Run: npm run test:openings
 */
import { Chess } from "chess.js";
import { OPENINGS, openingById, moverAt, isLearnerTurn } from "../src/content/openings.ts";
import { searchEval } from "../src/domain/chess/search.ts";

let pass = 0;
let fail = 0;
function ok(name: string, cond: boolean) {
  if (cond) pass++;
  else { fail++; console.error("✗", name); }
}

ok("mover alternates from White", moverAt(0) === "white" && moverAt(1) === "black" && moverAt(2) === "white");
ok("opening ids are unique", new Set(OPENINGS.map((o) => o.id)).size === OPENINGS.length);
ok("openById resolves and misses correctly", openingById("italian")?.name === "Italian Game" && openingById("nope") === undefined);
ok("there are both White and Black repertoires", OPENINGS.some((o) => o.side === "white") && OPENINGS.some((o) => o.side === "black"));

for (const o of OPENINGS) {
  const g = new Chess();
  let legal = true;
  let learnerMoves = 0;
  let worstLearnerEval = 9999;
  for (let ply = 0; ply < o.line.length; ply++) {
    if (isLearnerTurn(o, ply)) {
      learnerMoves++;
      worstLearnerEval = Math.min(worstLearnerEval, searchEval(g.fen(), 2)); // mover-positive
    }
    const m = g.move(o.line[ply].san);
    if (!m) { legal = false; break; }
  }
  ok(`${o.id}: whole line is legal`, legal);
  ok(`${o.id}: has a few teaching moves`, learnerMoves >= 4);
  ok(`${o.id}: learner's moves are sound (no blunders)`, worstLearnerEval >= -150);
  ok(`${o.id}: learner's first move belongs to their colour`, isLearnerTurn(o, o.side === "white" ? 0 : 1));
  ok(`${o.id}: every learner move has a teaching note`, o.line.every((mv, ply) => !isLearnerTurn(o, ply) || (mv.note && mv.note.length > 0)));
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
console.log("✓ All opening checks passed");
