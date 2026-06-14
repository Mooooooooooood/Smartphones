import { create } from "zustand";
import type { PieceSymbol, Square } from "chess.js";
import {
  BEGINNER_PUZZLES,
  PUZZLE_THEMES,
  puzzlesByTheme,
  type Puzzle,
  type PuzzleTheme,
} from "@/content/puzzles/beginner";
import { evaluateMove, fenAfterUci, isCorrectMove } from "@/domain/puzzles/puzzleEngine";
import { loadPuzzleAttempts } from "@/data/puzzleRepository";
import type { PuzzleAttemptRow } from "@/data/db";
import { useProfileStore, type PuzzleResult } from "@/state/profileStore";

export type ThemeFilter = PuzzleTheme | "mixed";
export type PuzzleStatus = "idle" | "wrong" | "correct";

interface SessionStats {
  attempts: number;
  solved: number;
  streak: number; // consecutive correct this session
  best: number;
}

interface PuzzleState {
  hydrated: boolean;
  theme: ThemeFilter;
  queue: string[]; // puzzle ids
  index: number;

  /** Board position currently shown — diverges from the puzzle FEN once solved. */
  displayFen: string;
  status: PuzzleStatus;
  lastPlayedUci: string | null;
  feedback: string | null;
  hintShown: boolean;
  /** Rating/XP outcome of the current solve, for the feedback card. */
  result: PuzzleResult | null;

  session: SessionStats;
  attempts: PuzzleAttemptRow[]; // full history, newest first (for stats)

  hydrate: () => Promise<void>;
  setTheme: (theme: ThemeFilter) => void;
  /** Start with a specific puzzle first (used by the Puzzle of the Day). */
  startPuzzleById: (id: string) => void;
  /** Start a Smart Review session over the given (due/missed) puzzle ids. */
  startReview: (ids: string[]) => void;
  /** Handle a board move. Returns true if the piece should stay (legal answer). */
  submitMove: (from: Square, to: Square, promotion?: PieceSymbol) => boolean;
  showHint: () => void;
  resetPuzzle: () => void;
  nextPuzzle: () => void;
}

/** Deterministic queue so server and client first renders agree. */
function buildQueue(theme: ThemeFilter): string[] {
  if (theme !== "mixed") return puzzlesByTheme(theme).map((p) => p.id);
  // Round-robin across themes for a varied "mixed" set.
  const byTheme = PUZZLE_THEMES.map((t) => puzzlesByTheme(t));
  const out: string[] = [];
  const max = Math.max(...byTheme.map((g) => g.length));
  for (let i = 0; i < max; i++) {
    for (const group of byTheme) {
      if (group[i]) out.push(group[i].id);
    }
  }
  return out;
}

function puzzleFromId(id: string | undefined): Puzzle {
  return BEGINNER_PUZZLES.find((p) => p.id === id) ?? BEGINNER_PUZZLES[0];
}

const INITIAL_QUEUE = buildQueue("mixed");

export const usePuzzleStore = create<PuzzleState>((set, get) => ({
  hydrated: false,
  theme: "mixed",
  queue: INITIAL_QUEUE,
  index: 0,
  displayFen: puzzleFromId(INITIAL_QUEUE[0]).fen,
  status: "idle",
  lastPlayedUci: null,
  feedback: null,
  hintShown: false,
  result: null,
  session: { attempts: 0, solved: 0, streak: 0, best: 0 },
  attempts: [],

  hydrate: async () => {
    await useProfileStore.getState().hydrate();
    const attempts = await loadPuzzleAttempts();
    set({ attempts, hydrated: true });
  },

  setTheme: (theme) => {
    const queue = buildQueue(theme);
    const first = puzzleFromId(queue[0]);
    set({
      theme,
      queue,
      index: 0,
      displayFen: first.fen,
      status: "idle",
      lastPlayedUci: null,
      feedback: null,
      hintShown: false,
      result: null,
    });
  },

  startPuzzleById: (id) => {
    const rest = buildQueue("mixed").filter((q) => q !== id);
    const queue = [id, ...rest];
    const first = puzzleFromId(id);
    set({
      theme: "mixed",
      queue,
      index: 0,
      displayFen: first.fen,
      status: "idle",
      lastPlayedUci: null,
      feedback: null,
      hintShown: false,
      result: null,
    });
  },

  startReview: (ids) => {
    const queue = ids.length ? ids : buildQueue("mixed");
    const first = puzzleFromId(queue[0]);
    set({
      theme: "mixed",
      queue,
      index: 0,
      displayFen: first.fen,
      status: "idle",
      lastPlayedUci: null,
      feedback: null,
      hintShown: false,
      result: null,
    });
  },

  submitMove: (from, to, promotion = "q") => {
    const { queue, index, status } = get();
    if (status === "correct") return false; // already solved — board is locked
    const puzzle = puzzleFromId(queue[index]);

    const evald = evaluateMove(puzzle.fen, from, to, promotion);
    if (!evald.legal || !evald.uci) {
      set({ feedback: "That move isn't legal here." });
      return false; // snap the piece back
    }

    const correct = isCorrectMove(evald.uci, puzzle.correctUci);

    // Persist + update aggregates (XP / streak / rating) without blocking the UI.
    void useProfileStore
      .getState()
      .recordPuzzleResult({
        puzzleId: puzzle.id,
        theme: puzzle.theme,
        puzzleRating: puzzle.rating,
        correct,
        attemptedMove: evald.uci,
        correctMove: puzzle.correctUci,
        xpReward: puzzle.xpReward,
      })
      .then((result) => {
        // Refresh history for the profile screen.
        void loadPuzzleAttempts().then((attempts) => set({ attempts }));
        if (correct) set({ result });
      });

    const session = get().session;
    if (correct) {
      const streak = session.streak + 1;
      set({
        status: "correct",
        displayFen: fenAfterUci(puzzle.fen, evald.uci),
        lastPlayedUci: evald.uci,
        feedback: null,
        session: {
          attempts: session.attempts + 1,
          solved: session.solved + 1,
          streak,
          best: Math.max(session.best, streak),
        },
      });
      return true; // keep the piece on its new square
    }

    set({
      status: "wrong",
      lastPlayedUci: evald.uci,
      feedback: `${evald.san} is legal, but it isn't the solution. Try again.`,
      session: { ...session, attempts: session.attempts + 1, streak: 0 },
    });
    return false; // snap back so the player can retry
  },

  showHint: () => set({ hintShown: true }),

  resetPuzzle: () => {
    const { queue, index } = get();
    const puzzle = puzzleFromId(queue[index]);
    set({
      displayFen: puzzle.fen,
      status: "idle",
      lastPlayedUci: null,
      feedback: null,
      hintShown: false,
      result: null,
    });
  },

  nextPuzzle: () => {
    const { queue, index } = get();
    const nextIndex = queue.length ? (index + 1) % queue.length : 0;
    const puzzle = puzzleFromId(queue[nextIndex]);
    set({
      index: nextIndex,
      displayFen: puzzle.fen,
      status: "idle",
      lastPlayedUci: null,
      feedback: null,
      hintShown: false,
      result: null,
    });
  },
}));

/* ---------- pure selectors (not hooks) ---------- */

export function currentPuzzle(state: Pick<PuzzleState, "queue" | "index">): Puzzle {
  return puzzleFromId(state.queue[state.index]);
}

export function overallAccuracy(attempts: PuzzleAttemptRow[]): {
  total: number;
  correct: number;
  pct: number;
} {
  const total = attempts.length;
  const correct = attempts.filter((a) => a.correct).length;
  return { total, correct, pct: total ? correct / total : 0 };
}
