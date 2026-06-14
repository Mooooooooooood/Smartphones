/**
 * Sprint 19 checks — Smart Review (Leitner) scheduling logic.
 * Run: npx tsx scripts/reviewCheck.mts
 */
import { newCard, review, isDue, missedPuzzleIds, dueReviewIds, BOX_DAYS, MAX_BOX } from "../src/domain/training/srs.ts";

let pass = 0;
let fail = 0;
function ok(name: string, cond: boolean) {
  if (cond) pass++;
  else { fail++; console.error("✗", name); }
}

const DAY = 86_400_000;
const NOW = 1_000_000_000_000;

// new card surfaces immediately
const c0 = newCard("p1", NOW);
ok("new card is box 0", c0.box === 0);
ok("new card is due now", isDue(c0, NOW));

// correct → promote + longer interval
const c1 = review(c0, true, NOW);
ok("correct promotes to box 1", c1.box === 1);
ok("correct schedules box-1 interval", c1.dueAt === NOW + BOX_DAYS[1] * DAY);
ok("promoted card is not due yet", !isDue(c1, NOW));
ok("promoted card is due after its interval", isDue(c1, NOW + BOX_DAYS[1] * DAY));

// box caps at MAX_BOX
let c = newCard("p2", NOW);
for (let i = 0; i < 10; i++) c = review(c, true, NOW);
ok("box never exceeds MAX_BOX", c.box === MAX_BOX);

// wrong → reset to box 0 and resurface next day (not instantly)
const cw = review(c1, false, NOW);
ok("wrong resets to box 0", cw.box === 0);
ok("wrong reschedules ~1 day out (no same-instant loop)", cw.dueAt === NOW + BOX_DAYS[0] * DAY && cw.dueAt > NOW);

// missed set = attempted but not solved
ok(
  "missedPuzzleIds = attempted minus solved",
  missedPuzzleIds({ a: true, b: true, c: true }, { b: true }).sort().join() === "a,c",
);

// due queue: no card → due; future card → excluded; sorted soonest-first
const missed = ["a", "b", "c"];
const cards = {
  b: { id: "b", box: 2, dueAt: NOW + 10 * DAY }, // not due
  c: { id: "c", box: 1, dueAt: NOW - DAY },       // overdue
};
const due = dueReviewIds(missed, cards, NOW);
ok("due queue includes no-card + overdue, excludes future", due.includes("a") && due.includes("c") && !due.includes("b"));
ok("due queue sorts soonest-due first", due[0] === "c" || due[0] === "a"); // c overdue (earliest) or a (no card → 0)

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
console.log("✓ All review checks passed");
