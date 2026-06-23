/**
 * Puzzle rating ladder checks (Sprint 24): tier resolution, calibrating K, and
 * the adaptive climb queue. Run: npm run test:ladder
 */
import { ratingTier, climbQueue, RATING_TIERS } from "../src/domain/training/ladder.ts";
import { provisionalK } from "../src/domain/progression/rating.ts";
import { BEGINNER_PUZZLES } from "../src/content/puzzles/beginner.ts";

let pass = 0;
let fail = 0;
function ok(name: string, cond: boolean) {
  if (cond) pass++;
  else { fail++; console.error("✗", name); }
}

// ---- Tiers ----
ok("400 → Novice", ratingTier(400).title === "Novice");
ok("700 → Apprentice", ratingTier(700).title === "Apprentice");
ok("1250 → Expert", ratingTier(1250).title === "Expert");
ok("2000 → Grandmaster (top tier)", ratingTier(2000).title === "Grandmaster");
ok("top tier has no next + full progress", ratingTier(2000).nextMin === null && ratingTier(2000).progress === 1);
ok("progress within a tier is 0..1", (() => { const t = ratingTier(750); return t.progress > 0 && t.progress < 1 && t.nextTitle === "Adept"; })());
ok("toNext counts points to the next tier", ratingTier(800).toNext === 100); // 900 - 800
ok("tiers are strictly ascending", RATING_TIERS.every((t, i) => i === 0 || t.min > RATING_TIERS[i - 1].min));

// ---- Calibrating K ----
ok("K is large while provisional (<15)", provisionalK(5) === 48);
ok("K settles mid (15–39)", provisionalK(20) === 32);
ok("K stabilises (40+)", provisionalK(60) === 24);

// ---- Climb queue ----
{
  const q = climbQueue(BEGINNER_PUZZLES, { rating: 700, solved: {} });
  ok("climb queue covers every puzzle", q.length === BEGINNER_PUZZLES.length);
  const byId = Object.fromEntries(BEGINNER_PUZZLES.map((p) => [p.id, p.rating]));
  const firstRating = byId[q[0]];
  ok("climb serves a puzzle near the rating first", Math.abs(firstRating - 700) <= 250);
  // A far-easier puzzle should not be first when nearer ones exist.
  ok("climb doesn't open with the easiest puzzle", firstRating >= 500);
  // Solved puzzles are skipped (unless everything is solved).
  const solved = { [q[0]]: true, [q[1]]: true };
  const q2 = climbQueue(BEGINNER_PUZZLES, { rating: 700, solved });
  ok("solved puzzles are excluded", !q2.includes(q[0]) && !q2.includes(q[1]) && q2.length === BEGINNER_PUZZLES.length - 2);
  // When all solved, it still returns a full (replay) queue.
  const allSolved = Object.fromEntries(BEGINNER_PUZZLES.map((p) => [p.id, true]));
  ok("all-solved falls back to a replay queue", climbQueue(BEGINNER_PUZZLES, { rating: 700, solved: allSolved }).length === BEGINNER_PUZZLES.length);
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
console.log("✓ All ladder checks passed");
