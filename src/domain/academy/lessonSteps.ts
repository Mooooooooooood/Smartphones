/**
 * Interactive lesson step model — a small, reusable vocabulary of stage steps
 * so lessons read like a guided mini-game instead of a content page. Pure data
 * + pure validators (no React, no chess.js side effects) so it is unit-testable.
 */
import type { BuddyPiece } from "@/components/characters/ChessBuddy";

export type BoardOrientation = "white" | "black";

/** Story beat: a guide character introduces the concept. */
export interface IntroStep {
  type: "intro";
  guide: BuddyPiece;
  title: string;
  text: string;
}

/** Explanation card with optional bullet takeaways. */
export interface ExplainStep {
  type: "explain";
  guide?: BuddyPiece;
  title?: string;
  text: string;
  points?: string[];
}

/** Read-only board that demonstrates the idea, with highlighted squares. */
export interface BoardDemoStep {
  type: "board-demo";
  fen: string;
  orientation?: BoardOrientation;
  highlights?: string[];
  prompt: string;
  caption?: string;
  guide?: BuddyPiece;
}

/** Tap the correct square(s) — e.g. "tap e4" or "tap a square the rook attacks". */
export interface TapSquareStep {
  type: "tap-square";
  fen: string;
  orientation?: BoardOrientation;
  prompt: string;
  /** Any of these squares counts as correct. */
  targets: string[];
  successText: string;
  hint?: string;
  guide?: BuddyPiece;
  /** Show file/rank labels (helpful for the coordinates lesson). */
  showCoordinates?: boolean;
}

/** Tap the correct piece — same interaction, framed around picking a piece. */
export interface TapPieceStep {
  type: "tap-piece";
  fen: string;
  orientation?: BoardOrientation;
  prompt: string;
  targets: string[];
  successText: string;
  hint?: string;
  guide?: BuddyPiece;
}

/** Make the correct move on the board (validated with chess.js for legality). */
export interface MakeMoveStep {
  type: "make-move";
  fen: string;
  orientation?: BoardOrientation;
  prompt: string;
  /** One or more accepted moves in UCI form, e.g. "e1g1" or "e7e8q". */
  correctUci: string | string[];
  successText: string;
  failureText?: string;
  hint?: string;
  guide?: BuddyPiece;
}

/** Classic multiple-choice checkpoint (used sparingly). */
export interface MultipleChoiceStep {
  type: "multiple-choice";
  prompt: string;
  choices: string[];
  correctIndex: number;
  successText?: string;
  guide?: BuddyPiece;
}

/** A quick true / false checkpoint. */
export interface TrueFalseStep {
  type: "true-false";
  prompt: string;
  answer: boolean;
  successText?: string;
  guide?: BuddyPiece;
}

export type LessonStep =
  | IntroStep
  | ExplainStep
  | BoardDemoStep
  | TapSquareStep
  | TapPieceStep
  | MakeMoveStep
  | MultipleChoiceStep
  | TrueFalseStep;

/** Steps the player has to actively solve (vs. passive intro/explain/demo). */
export const INTERACTIVE_TYPES = [
  "tap-square",
  "tap-piece",
  "make-move",
  "multiple-choice",
  "true-false",
] as const;

export function isInteractive(step: LessonStep): boolean {
  return (INTERACTIVE_TYPES as readonly string[]).includes(step.type);
}

/** Does a step show a board the player can see/touch? */
export function hasBoard(
  step: LessonStep,
): step is BoardDemoStep | TapSquareStep | TapPieceStep | MakeMoveStep {
  return (
    step.type === "board-demo" ||
    step.type === "tap-square" ||
    step.type === "tap-piece" ||
    step.type === "make-move"
  );
}

/* ---------- pure validators ---------- */

/** Normalise a UCI string: lower-case, trimmed. */
export function normalizeUci(uci: string): string {
  return uci.trim().toLowerCase();
}

/** Is the tapped square one of the step's accepted targets? */
export function isTapCorrect(step: TapSquareStep | TapPieceStep, square: string): boolean {
  return step.targets.map((s) => s.toLowerCase()).includes(square.toLowerCase());
}

/** Does a UCI move match one of the step's accepted answers? */
export function isMoveCorrect(step: MakeMoveStep, uci: string): boolean {
  const want = Array.isArray(step.correctUci) ? step.correctUci : [step.correctUci];
  const got = normalizeUci(uci);
  // Accept with or without an explicit promotion suffix for convenience.
  return want.some((w) => {
    const nw = normalizeUci(w);
    return nw === got || nw === got + "q" || nw.slice(0, 4) === got.slice(0, 4) && nw.length === got.length;
  });
}

/** A lesson must contain at least one interactive board step to be "hands-on". */
export function hasBoardInteraction(steps: LessonStep[]): boolean {
  return steps.some(
    (s) => s.type === "tap-square" || s.type === "tap-piece" || s.type === "make-move",
  );
}
