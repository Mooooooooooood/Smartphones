"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { usePuzzleStore, currentPuzzle, type ThemeFilter } from "@/state/puzzleStore";
import { useProfileStore } from "@/state/profileStore";
import { PUZZLE_THEMES, THEME_LABELS } from "@/content/puzzles/beginner";
import ActionButton from "@/components/ui/ActionButton";
import RewardPanel from "@/components/ui/RewardPanel";
import CoachBubble from "@/components/ui/CoachBubble";
import TopProgress from "@/components/ui/TopProgress";
import Skeleton, { BoardSkeleton } from "@/components/ui/Skeleton";

const PuzzleBoard = dynamic(() => import("@/components/PuzzleBoard"), {
  ssr: false,
  loading: () => <BoardSkeleton />,
});

const THEME_OPTIONS: { value: ThemeFilter; label: string }[] = [
  { value: "mixed", label: "Mixed" },
  ...PUZZLE_THEMES.map((t) => ({ value: t as ThemeFilter, label: THEME_LABELS[t] })),
];

function PuzzleLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-3 w-full rounded-full" />
      <Skeleton className="h-9 w-2/3" />
      <BoardSkeleton />
      <Skeleton className="h-12 w-full" />
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

  useEffect(() => {
    void usePuzzleStore.getState().hydrate();
  }, []);

  const puzzle = currentPuzzle({ queue, index });
  const toMove = puzzle.sideToMove === "w" ? "White" : "Black";
  const ratingDelta = result ? result.ratingAfter - result.ratingBefore : 0;
  const ratingText =
    ratingDelta !== 0 ? `${ratingDelta > 0 ? "+" : ""}${ratingDelta} rating` : "rating unchanged";

  if (!hydrated) {
    return <PuzzleLoading />;
  }

  return (
    <div className="space-y-3.5">
      {/* Arena top bar */}
      <TopProgress
        value={(index + 1) / queue.length}
        exitHref="/"
        trailing={`#${index + 1}/${queue.length}`}
      />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-brass">Tactics Arena</p>
          <h1 className="font-display text-xl text-cream">{THEME_LABELS[puzzle.theme]}</h1>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-muted2">
            Rating <span className="font-semibold text-brass">{puzzleRating}</span>
          </span>
          <span className="text-muted2">
            🔥 <span className="font-semibold text-cream">{session.streak}</span>
          </span>
        </div>
      </div>

      {/* Game-mode theme filters */}
      <div className="-mx-4 overflow-x-auto px-4">
        <div className="flex w-max gap-2">
          {THEME_OPTIONS.map((opt) => {
            const active = theme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTheme(opt.value)}
                className={`shrink-0 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors ${
                  active
                    ? "border-brass bg-brass/15 text-brass tab-glow"
                    : "border-line bg-panel/50 text-muted2 hover:text-muted"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Coach instruction (hidden once solved — reward takes over) */}
      {status !== "correct" ? (
        <CoachBubble tone={status === "wrong" ? "warn" : "default"}>
          {status === "wrong" ? (
            <span>{feedback ?? "Legal, but not the winning move. Try again."}</span>
          ) : (
            <span>
              <span className="font-semibold text-cream">{toMove} to move.</span> Find the best move —
              difficulty {puzzle.rating}.
              {hintShown && puzzle.hint ? (
                <span className="mt-1 block text-brass">Hint: {puzzle.hint}</span>
              ) : null}
            </span>
          )}
        </CoachBubble>
      ) : null}

      {/* Board dominates */}
      <div className="tabiya-board-wrap">
        <PuzzleBoard />
      </div>

      {/* Outcome */}
      {status === "correct" ? (
        <RewardPanel
          title={`Solved — ${puzzle.answerSan ?? "correct"}`}
          xp={result?.xpAwarded ?? 0}
          tone="good"
          subtitle={ratingText}
        >
          <p className="text-left text-sm text-muted">{puzzle.explanation}</p>
        </RewardPanel>
      ) : null}

      {/* Controls */}
      {status === "correct" ? (
        <ActionButton onClick={nextPuzzle}>Next puzzle →</ActionButton>
      ) : (
        <div className="grid grid-cols-3 gap-2.5">
          <ActionButton onClick={showHint} disabled={hintShown} variant="secondary">
            {hintShown ? "Hint ✓" : "Hint"}
          </ActionButton>
          <ActionButton onClick={resetPuzzle} variant="secondary">
            Reset
          </ActionButton>
          <ActionButton onClick={nextPuzzle} variant="secondary">
            Skip →
          </ActionButton>
        </div>
      )}
    </div>
  );
}
