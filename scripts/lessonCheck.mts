/**
 * Interactive lesson engine checks (Sprint 13 QA).
 *
 * Verifies every Tier 0 lesson is hands-on (has a board interaction), that each
 * make-move answer is a legal move producing the claimed result, that tap-piece
 * targets actually hold a piece, and that the pure validators behave.
 * Run with:  npm run test:lessons
 */
import { Chess } from "chess.js";
import { ALL_LESSONS } from "../src/content/academy/index.ts";
import {
  hasBoardInteraction,
  isMoveCorrect,
  isTapCorrect,
  type LessonStep,
  type MakeMoveStep,
} from "../src/domain/academy/lessonSteps.ts";

/** Lessons whose make-move is claimed to be checkmate — verified below. */
const MATE_LESSONS = new Set([
  "checkmate",
  "t1-removing-the-defender",
  "t1-mate-in-one",
  "t3-queen-mate",
  "t3-rook-mate",
]);

let pass = 0;
let fail = 0;

function check(desc: string, got: unknown, want: unknown) {
  if (got === want) {
    pass++;
  } else {
    fail++;
    console.error(`✗ ${desc} — expected ${JSON.stringify(want)}, got ${JSON.stringify(got)}`);
  }
}

function ok(desc: string, cond: boolean) {
  check(desc, cond, true);
}

const SQUARE = /^[a-h][1-8]$/;

function firstUci(step: MakeMoveStep): string {
  return Array.isArray(step.correctUci) ? step.correctUci[0] : step.correctUci;
}

for (const lesson of ALL_LESSONS) {
  const steps = lesson.steps ?? [];
  ok(`${lesson.id}: has steps`, steps.length > 0);
  ok(`${lesson.id}: opens with an intro`, steps[0]?.type === "intro");
  ok(`${lesson.id}: has a board interaction`, hasBoardInteraction(steps as LessonStep[]));
  ok(
    `${lesson.id}: ends with a checkpoint`,
    ["multiple-choice", "true-false"].includes(steps[steps.length - 1]?.type),
  );

  for (const step of steps as LessonStep[]) {
    if (step.type === "board-demo" || step.type === "tap-square" || step.type === "tap-piece" || step.type === "make-move") {
      // Board layout must be structurally valid (8 ranks). chess.js additionally
      // rejects kingless positions, which is fine for the empty coordinates board.
      ok(`${lesson.id}: fen has 8 ranks (${step.type})`, step.fen.split(" ")[0].split("/").length === 8);
      let game: Chess | null = null;
      try {
        game = new Chess(step.fen);
      } catch {
        game = null;
      }
      // make-move and tap-piece need a legal, king-bearing position
      if (step.type === "make-move" || step.type === "tap-piece") {
        ok(`${lesson.id}: fen parses (${step.type})`, game !== null);
      }
      if (!game) continue;

      if (step.type === "board-demo" && step.highlights) {
        for (const sq of step.highlights) ok(`${lesson.id}: highlight ${sq} is a square`, SQUARE.test(sq));
      }

      if (step.type === "tap-square" || step.type === "tap-piece") {
        ok(`${lesson.id}: tap has targets`, step.targets.length > 0);
        for (const t of step.targets) ok(`${lesson.id}: target ${t} is a square`, SQUARE.test(t));
        // tap-piece targets must actually contain a piece
        if (step.type === "tap-piece") {
          for (const t of step.targets) {
            ok(`${lesson.id}: tap-piece ${t} holds a piece`, Boolean(game.get(t as never)));
          }
        }
      }

      if (step.type === "make-move") {
        const uci = firstUci(step);
        const from = uci.slice(0, 2);
        const to = uci.slice(2, 4);
        const promo = uci[4] as "q" | "r" | "b" | "n" | undefined;
        let legal = false;
        try {
          game.move({ from, to, promotion: promo ?? "q" });
          legal = true;
        } catch {
          legal = false;
        }
        ok(`${lesson.id}: make-move ${uci} is legal`, legal);
        // validator accepts the canonical answer (with or without promo suffix)
        ok(`${lesson.id}: validator accepts ${uci}`, isMoveCorrect(step, uci));
        ok(`${lesson.id}: validator accepts from-to`, isMoveCorrect(step, from + to));

        // lesson-specific outcomes
        if (MATE_LESSONS.has(lesson.id)) ok(`${lesson.id}: move is checkmate`, game.isCheckmate());
        if (lesson.id === "promotion" || lesson.id === "t3-promotion") {
          const piece = game.get(to as never);
          ok(`${lesson.id}: a queen now stands on the last rank`, piece?.type === "q");
        }
      }
    }
  }
}

// ---- validator unit checks ----
const tap = { type: "tap-square", fen: "8/8/8/8/8/8/8/8 w - - 0 1", prompt: "", targets: ["e4", "a1"], successText: "" } as const;
ok("isTapCorrect accepts a target", isTapCorrect(tap, "e4"));
ok("isTapCorrect is case-insensitive", isTapCorrect(tap, "A1"));
check("isTapCorrect rejects a non-target", isTapCorrect(tap, "h8"), false);

const mv: MakeMoveStep = {
  type: "make-move",
  fen: "8/4P3/8/8/8/8/8/k5K1 w - - 0 1",
  prompt: "",
  correctUci: "e7e8q",
  successText: "",
};
ok("isMoveCorrect accepts exact promotion uci", isMoveCorrect(mv, "e7e8q"));
ok("isMoveCorrect accepts move without promo suffix", isMoveCorrect(mv, "e7e8"));
check("isMoveCorrect rejects a different move", isMoveCorrect(mv, "g1f2"), false);

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
console.log("✓ All lesson checks passed");
