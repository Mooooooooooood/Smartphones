"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { usePuzzleStore, currentPuzzle, type ThemeFilter } from "@/state/puzzleStore";
import { useProfileStore } from "@/state/profileStore";
import { PUZZLE_THEMES, THEME_LABELS } from "@/content/puzzles/beginner";
import GameCard from "@/components/ui/GameCard";
import ActionButton from "@/components/ui/ActionButton";
import RewardPanel from "@/components/ui/RewardPanel";
import Skeleton, { BoardSkeleton } from "@/components/ui/Skeleton";

const PuzzleBoard = dynamic(() => import("@/components/PuzzleBoard"), {
  ssr: false,
  loading: () => <BoardSkeleton />,
});

const THEME_OPTIONS: { value: ThemeFilter; label: string }[] = [
  { value: "mixed", label: "Mixed" },
  ...PUZZLE_THEMES.map((t) => ({ value: t as ThemeFilter, label: THEME_LABELS[t] })),
];

function MiniStat({ label, value, tone = "cream" }: { label: string; value: string; tone?: "cream" | "brass" }) {
  return (
    <div className="tab-card px-2.5 py-2 text-center">
      <div className={`font-display text-lg leading-none ${tone === "brass" ? "text-brass" : "text-cream"}`}>
        {value}
      </div>
      <div className="mt-1 text-[9px] uppercase tracking-wider text-muted2">{label}</div>
    </div>
  );
}

function PuzzleLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-9 w-2/3" />
      <div className="grid grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-14" />
        ))}
      </div>
      <Skeleton className="h-9 w-full rounded-full" />
      <BoardSkeleton />
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
  const ratingText =
    ratingDelta !== 0 ? `${ratingDelta > 0 ? "+" : ""}${ratingDelta} rating` : "rating unchanged";

  if (!hydrated) {
    return <PuzzleLoading />;
  }

  return (
    <div className="space-y-4">
      <header>
        <p className="text-xs uppercase tracking-[0.16em] text-muted2">Puzzles</p>
        <h1 className="font-display text-3xl text-cream">Tactics Trainer</h1>
      </header>

      {/* Rating + session progress */}
      <div className="grid grid-cols-4 gap-2">
        <MiniStat label="Rating" value={`${puzzleRating}`} tone="brass" />
        <MiniStat label="Solved" value={`${session.solved}`} />
        <MiniStat label="Streak" value={`${session.streak}`} />
        <MiniStat label="Puzzle" value={`${index + 1}/${queue.length}`} />
      </div>

      {/* Theme filters */}
      <div className="-mx-4 overflow-x-auto px-4">
        <div className="flex w-max gap-2">
          {THEME_OPTIONS.map((opt) => {
            const active = theme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTheme(opt.value)}
                className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors ${
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

      {/* Current puzzle meta */}
      <GameCard className="flex items-center justify-between gap-3 p-3.5">
        <div className="min-w-0">
          <h2 className="truncate font-display text-base text-cream">{puzzle.title}</h2>
          <p className="text-xs text-muted2">
            {THEME_LABELS[puzzle.theme]} · difficulty {puzzle.rating}
            {alreadySolved ? " · solved before" : ""}
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-brass/40 bg-brass/10 px-2.5 py-1 text-[11px] font-semibold text-brass">
          {toMove} to move
        </span>
      </GameCard>

      <div className="tabiya-board-wrap">
        <PuzzleBoard />
      </div>

      {/* Feedback */}
      {status === "correct" ? (
        <RewardPanel
          title={`Solved — ${puzzle.answerSan ?? "correct"}`}
          xp={result?.xpAwarded ?? 0}
          tone="good"
          subtitle={ratingText}
        >
          <p className="text-left text-sm text-muted">{puzzle.explanation}</p>
        </RewardPanel>
      ) : status === "wrong" ? (
        <div className="rounded-2xl border border-warn/45 bg-warn/10 p-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-warn/20 font-bold text-warn">
              !
            </span>
            <span className="font-display text-base text-cream">Legal, but not the solution</span>
          </div>
          <p className="mt-1.5 text-sm text-muted">{feedback}</p>
        </div>
      ) : (
        <GameCard className="p-4">
          <p className="text-sm text-muted">
            Find the best move for {toMove}. Drag a piece or tap a square to move.
          </p>
          {feedback ? <p className="mt-1 text-xs text-bad">{feedback}</p> : null}
          {hintShown && puzzle.hint ? (
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-brass/30 bg-brass/10 px-3 py-2.5">
              <span className="text-brass" aria-hidden>
                ◆
              </span>
              <p className="text-sm text-brass">{puzzle.hint}</p>
            </div>
          ) : null}
        </GameCard>
      )}

      {/* Controls */}
      {status === "correct" ? (
        <ActionButton onClick={nextPuzzle}>Next puzzle →</ActionButton>
      ) : (
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            <ActionButton onClick={showHint} disabled={hintShown} variant="secondary">
              {hintShown ? "Hint shown" : "Show hint"}
            </ActionButton>
            <ActionButton onClick={resetPuzzle} variant="secondary">
              Reset puzzle
            </ActionButton>
          </div>
          <ActionButton onClick={nextPuzzle} variant="ghost">
            Skip to next →
          </ActionButton>
        </div>
      )}
    </div>
  );
}
