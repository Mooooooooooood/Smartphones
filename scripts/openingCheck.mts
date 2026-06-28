/**
 * Opening trainer checks (Sprint 26, branching in Sprint 29): every variation in
 * every repertoire tree is legal, the learner plays the right colour, the
 * learner's book moves are not engine blunders, and each learner move carries a
 * teaching note. The opponent may branch; the learner may not (one book move per
 * decision). Run: npm run test:openings
 */
import { Chess } from "chess.js";
import {
  OPENINGS,
  openingById,
  moverAt,
  isLearnerTurn,
  enumeratePaths,
  variationCount,
  type OpeningNode,
} from "../src/content/openings.ts";
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
ok("at least one opening branches (an opponent variation)", OPENINGS.some((o) => variationCount(o) >= 2));

// The learner gets exactly one book move per decision; only the opponent branches.
function checkLearnerSingletons(o: (typeof OPENINGS)[number], nodes: OpeningNode[], ply: number): boolean {
  if (nodes.length === 0) return true;
  if (isLearnerTurn(o, ply) && nodes.length !== 1) return false;
  return nodes.every((n) => checkLearnerSingletons(o, n.replies, ply + 1));
}

for (const o of OPENINGS) {
  ok(`${o.id}: learner branches are single book moves`, checkLearnerSingletons(o, o.tree, 0));
  ok(`${o.id}: learner's first move belongs to their colour`, isLearnerTurn(o, o.side === "white" ? 0 : 1));

  const paths = enumeratePaths(o.tree);
  let allLegal = true;
  let everyLearnerHasNote = true;
  let minLearnerMoves = Infinity;
  let worstLearnerEval = 9999;

  for (const path of paths) {
    const g = new Chess();
    let learnerMoves = 0;
    for (let ply = 0; ply < path.length; ply++) {
      if (isLearnerTurn(o, ply)) {
        learnerMoves++;
        if (!path[ply].note || path[ply].note!.length === 0) everyLearnerHasNote = false;
        worstLearnerEval = Math.min(worstLearnerEval, searchEval(g.fen(), 2)); // mover-positive
      }
      const m = g.move(path[ply].san);
      if (!m) { allLegal = false; break; }
    }
    minLearnerMoves = Math.min(minLearnerMoves, learnerMoves);
  }

  ok(`${o.id}: every variation is legal`, allLegal);
  ok(`${o.id}: each variation has a few teaching moves`, minLearnerMoves >= 4);
  ok(`${o.id}: every learner move has a teaching note`, everyLearnerHasNote);
  ok(`${o.id}: learner's moves are sound (no blunders)`, worstLearnerEval >= -150);
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
console.log("✓ All opening checks passed");
