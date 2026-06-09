"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import {
  usePuzzleStore,
  currentPuzzle,
  type ThemeFilter,
} from "@/state/puzzleStore";
import { useProfileStore } from "@/state/profileStore";
import { PUZZLE_THEMES, THEME_LABELS } from "@/content/puzzles/beginner";

const PuzzleBoard = dynamic(() => import("@/components/PuzzleBoard"), {
  ssr: false,
  loading: () => (
    <div className="tabiya-board-wrap aspect-square animate-pulse rounded-lg bg-panel2" />
  ),
});

const THEME_OPTIONS: { value: ThemeFilter; label: string }[] = [
  { value: "mixed", label: "Mixed" },
  ...PUZZLE_THEMES.map((t) => ({ value: t as ThemeFilter, label: THEME_LABELS[t] })),
];

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-panel/60 px-3 py-2 text-center">
      <div className="font-display text-xl leading-none text-cream">{value}</div>
      <div className="mt-1 text-[10px] uppercase tracking-wider text-muted2">{label}</div>
    </div>
  );
}

export default function PuzzleScreen() {
  const hydrated = usePuzzleStore((s) => s.hydrated);
  const theme = usePuzzleStore((s) => s.theme);
  const queue = usePuzzleStore((s) => s.queue);
  const index = usePuzzleStore((s) => s.index);
  const status = usePuzzleStore((s) => s.status);
  const feedback = usePuzzleStore((s) => s.feedback);
  const hintShown = usePuzzleStore((s) => s.hintShown);
  const result = usePuzzleStore((s) => s.result);
  const session = usePuzzleStore((s) => s.session);

  const setTheme = usePuzzleStore((s) => s.setTheme);
  const showHint = usePuzzleStore((s) => s.showHint);
  const resetPuzzle = usePuzzleStore((s) => s.resetPuzzle);
  const nextPuzzle = usePuzzleStore((s) => s.nextPuzzle);

  const puzzleRating = useProfileStore((s) => s.puzzleRating);
  const solvedIds = useProfileStore((s) => s.solvedPuzzleIds);

  useEffect(() => {
    void usePuzzleStore.getState().hydrate();
  }, []);

  const puzzle = currentPuzzle({ queue, index });
  const alreadySolved = Boolean(solvedIds[puzzle.id]);
  const toMove = puzzle.sideToMove === "w" ? "White" : "Black";
  const ratingDelta = result ? result.ratingAfter - result.ratingBefore : 0;

  if (!hydrated) {
    return <div className="py-20 text-center text-sm text-muted2">Loading trainer…</div>;
  }

  return (
    <div className="space-y-4">
      <header>
        <p className="text-xs uppercase tracking-[0.16em] text-muted2">Puzzles</p>
        <h1 className="font-display text-3xl text-cream">Tactics Trainer</h1>
      </header>

      {/* Rating + session progress */}
      <div className="grid grid-cols-4 gap-2">
        <MiniStat label="Rating" value={`${puzzleRating}`} />
        <MiniStat label="Solved" value={`${session.solved}`} />
        <MiniStat label="Streak" value={`${session.streak}`} />
        <MiniStat label="Puzzle" value={`${index + 1}/${queue.length}`} />
      </div>

      {/* Theme selector */}
      <div className="-mx-4 overflow-x-auto px-4">
        <div className="flex w-max gap-2">
          {THEME_OPTIONS.map((opt) => {
            const active = theme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTheme(opt.value)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? "border-brass bg-brass/15 text-brass"
                    : "border-line bg-panel/50 text-muted2 hover:text-muted"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current puzzle meta */}
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h2 className="truncate font-display text-lg text-cream">{puzzle.title}</h2>
          <p className="text-xs text-muted2">
            {THEME_LABELS[puzzle.theme]} · difficulty {puzzle.rating}
            {alreadySolved ? " · solved before" : ""}
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-line px-2.5 py-1 text-[11px] font-semibold text-brass">
          {toMove} to move
        </span>
      </div>

      <div className="tabiya-board-wrap">
        <PuzzleBoard />
      </div>

      {/* Feedback */}
      {status === "correct" ? (
        <div className="rounded-2xl border border-good/40 bg-good/10 p-4">
          <div className="flex items-center justify-between">
            <span className="font-display text-lg text-cream">Correct — {puzzle.answerSan ?? "solved"}</span>
            <span className="text-sm font-semibold text-good">
              {ratingDelta !== 0 ? `${ratingDelta > 0 ? "+" : ""}${ratingDelta} rating` : "rating unchanged"}
            </span>
          </div>
          {result && result.xpAwarded > 0 ? (
            <p className="mt-0.5 text-xs font-semibold text-brass">+{result.xpAwarded} XP</p>
          ) : (
            <p className="mt-0.5 text-xs text-muted2">No XP — this puzzle was already solved.</p>
          )}
          <p className="mt-2 text-sm text-muted">{puzzle.explanation}</p>
        </div>
      ) : status === "wrong" ? (
        <div className="rounded-2xl border border-bad/40 bg-bad/10 p-4">
          <span className="font-display text-base text-cream">Not the solution</span>
          <p className="mt-1 text-sm text-muted">{feedback}</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-line bg-panel/50 p-4">
          <p className="text-sm text-muted">
            Find the best move for {toMove}. Drag a piece or tap a square to move.
          </p>
          {feedback ? <p className="mt-1 text-xs text-bad">{feedback}</p> : null}
          {hintShown && puzzle.hint ? (
            <p className="mt-2 text-sm text-brass">Hint: {puzzle.hint}</p>
          ) : null}
        </div>
      )}

      {/* Controls */}
      <div className="grid grid-cols-2 gap-3">
        {status === "correct" ? (
          <button
            type="button"
            onClick={nextPuzzle}
            className="col-span-2 rounded-2xl border border-brass/50 bg-brass/15 py-3 font-display text-base text-brass transition-transform active:scale-[0.99]"
          >
            Next puzzle →
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={showHint}
              disabled={hintShown}
              className="rounded-2xl border border-line bg-panel py-3 text-sm font-semibold text-cream transition-transform active:scale-[0.99] disabled:opacity-40"
            >
              {hintShown ? "Hint shown" : "Show hint"}
            </button>
            <button
              type="button"
              onClick={resetPuzzle}
              className="rounded-2xl border border-line bg-panel py-3 text-sm font-semibold text-cream transition-transform active:scale-[0.99]"
            >
              Reset puzzle
            </button>
            <button
              type="button"
              onClick={nextPuzzle}
              className="col-span-2 rounded-2xl border border-line bg-panel/50 py-2.5 text-sm font-semibold text-muted transition-transform active:scale-[0.99]"
            >
              Skip to next
            </button>
          </>
        )}
      </div>
    </div>
  );
}
