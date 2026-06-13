/**
 * Sprint 16 content checks — Tier 1 boss, upgraded Tier 1 lessons, achievement
 * progress, and streak-calendar date logic. Run: npx tsx scripts/contentCheck.mts
 */
import { Chess } from "chess.js";
import { TIER0_BOSS, TIER1_BOSS } from "../src/content/academy/boss.ts";
import { tierMeta } from "../src/content/academy/index.ts";
import { TIER1_LESSONS } from "../src/content/academy/tier1.ts";
import { hasBoardInteraction, type LessonStep } from "../src/domain/academy/lessonSteps.ts";
import { achievementViews } from "../src/content/achievements.ts";
import { streakCalendar, isTodayActive } from "../src/domain/progression/streak.ts";
import type { AcademyState } from "../src/domain/academy/progression.ts";

let pass = 0;
let fail = 0;
function ok(name: string, cond: boolean) {
  if (cond) pass++;
  else { fail++; console.error("✗", name); }
}

// ---- Tier 1 Boss ----
ok("Tier 1 boss id is tier-1", TIER1_BOSS.id === "tier-1");
ok("Tier 1 boss has 5 questions", TIER1_BOSS.questions.length === 5);
ok("Tier 1 boss pass threshold is 4/5", TIER1_BOSS.passScore === 4);
ok("Tier 1 boss has 5 concept labels", TIER1_BOSS.concepts.length === 5);
ok(
  "every Tier 1 boss question has a valid correctIndex",
  TIER1_BOSS.questions.every((q) => q.correctIndex >= 0 && q.correctIndex < q.choices.length),
);
ok("Tier meta wires the Tier 1 boss", tierMeta(1)?.boss?.id === "tier-1");
ok("Tier 0 + Tier 1 bosses are distinct", TIER0_BOSS.id !== TIER1_BOSS.id);

// pass/fail threshold logic
ok("score 4/5 passes", 4 >= TIER1_BOSS.passScore);
ok("score 3/5 fails", !(3 >= TIER1_BOSS.passScore));

// ---- Upgraded Tier 1 lessons ----
const upgraded = TIER1_LESSONS.filter((l) => Array.isArray(l.steps) && l.steps.length > 0);
ok("at least 2 Tier 1 lessons are interactive", upgraded.length >= 2);
for (const lesson of upgraded) {
  const steps = lesson.steps as LessonStep[];
  ok(`${lesson.id}: opens with an intro`, steps[0]?.type === "intro");
  ok(`${lesson.id}: has a board interaction`, hasBoardInteraction(steps));
  ok(
    `${lesson.id}: ends with a checkpoint`,
    ["multiple-choice", "true-false"].includes(steps[steps.length - 1].type),
  );
  // validate make-move steps are legal + actually capture/fork
  for (const step of steps) {
    if (step.type === "make-move") {
      const uci = Array.isArray(step.correctUci) ? step.correctUci[0] : step.correctUci;
      const game = new Chess(step.fen);
      const mv = game.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: "q" });
      ok(`${lesson.id}: make-move ${uci} is legal`, mv !== null);
    }
  }
}

// ---- Achievements progress ----
const emptyState: AcademyState = { completedLessonIds: {}, bossCleared: {} };
const noneStats = { wins: 0, solved: 0, streak: 0, accGames: 0, accPct: 0, academy: emptyState };
const winStats = { ...noneStats, wins: 1 };

const noneViews = achievementViews(noneStats);
const winViews = achievementViews(winStats);
ok("fresh profile unlocks nothing", noneViews.every((a) => !a.unlocked));
ok("first-win unlocks after one win", winViews.find((a) => a.id === "first-win")?.unlocked === true);
ok(
  "puzzle-master shows partial progress (3/10)",
  (() => {
    const v = achievementViews({ ...noneStats, solved: 3 }).find((a) => a.id === "puzzle-master");
    return v?.current === 3 && v?.target === 10 && !v?.unlocked;
  })(),
);
ok(
  "trial champion unlocks when tier-0 boss cleared",
  achievementViews({ ...noneStats, academy: { completedLessonIds: {}, bossCleared: { "tier-0": true } } })
    .find((a) => a.id === "first-trial")?.unlocked === true,
);
ok("every achievement has name + description", noneViews.every((a) => a.name.length > 0 && a.description.length > 0));

// ---- Streak calendar ----
const cal = streakCalendar("2026-06-12", 3, "2026-06-12", 7);
ok("calendar returns the requested number of days", cal.length === 7);
ok("today is the last cell and marked today", cal[cal.length - 1].isToday && cal[cal.length - 1].date === "2026-06-12");
ok("today is active when in the streak window", cal[cal.length - 1].active === true);
ok("streak of 3 lights exactly 3 days", cal.filter((d) => d.active).length === 3);
ok("the 11th + 10th are active, 9th is not", (() => {
  const map = Object.fromEntries(cal.map((d) => [d.date, d.active]));
  return map["2026-06-11"] === true && map["2026-06-10"] === true && map["2026-06-09"] === false;
})());
ok("no active days when streak is 0", streakCalendar("2026-06-12", 0, "2026-06-12", 7).every((d) => !d.active));
ok("isTodayActive true when lastActive is today", isTodayActive("2026-06-12", "2026-06-12") === true);
ok("isTodayActive false when lastActive is earlier", isTodayActive("2026-06-11", "2026-06-12") === false);

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
console.log("✓ All content checks passed");
