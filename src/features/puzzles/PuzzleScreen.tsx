"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { usePuzzleStore, currentPuzzle, type ThemeFilter } from "@/state/puzzleStore";
import { useProfileStore } from "@/state/profileStore";
import { PUZZLE_THEMES, THEME_LABELS, type PuzzleTheme } from "@/content/puzzles/beginner";
import RewardPanel from "@/components/ui/RewardPanel";
import TopProgress from "@/components/ui/TopProgress";
import Skeleton, { BoardSkeleton } from "@/components/ui/Skeleton";
import PixelTopBar from "@/components/pixel/PixelTopBar";
import PixelPanel from "@/components/pixel/PixelPanel";
import PixelButton from "@/components/pixel/PixelButton";
import PixelStat from "@/components/pixel/PixelStat";
import ChessBuddy from "@/components/characters/ChessBuddy";

const PuzzleBoard = dynamic(() => import("@/components/PuzzleBoard"), { ssr: false, loading: () => <BoardSkeleton /> });

const THEME_OPTIONS: { value: ThemeFilter; label: string }[] = [
  { value: "mixed", label: "Mixed" },
  ...PUZZLE_THEMES.map((t) => ({ value: t as ThemeFilter, label: THEME_LABELS[t] })),
];

function PuzzleLoading() {
  return (
    <div className="space-y-3">
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

  const searchParams = useSearchParams();
  const themeParam = searchParams.get("theme");
  const appliedTheme = useRef(false);

  useEffect(() => {
    void usePuzzleStore.getState().hydrate();
    if (!appliedTheme.current && themeParam && (PUZZLE_THEMES as string[]).includes(themeParam)) {
      usePuzzleStore.getState().setTheme(themeParam as PuzzleTheme);
      appliedTheme.current = true;
    }
  }, [themeParam]);

  const puzzle = currentPuzzle({ queue, index });
  const toMove = puzzle.sideToMove === "w" ? "White" : "Black";
  const ratingDelta = result ? result.ratingAfter - result.ratingBefore : 0;
  const ratingText = ratingDelta !== 0 ? `${ratingDelta > 0 ? "+" : ""}${ratingDelta} rating` : "rating unchanged";

  if (!hydrated) return <PuzzleLoading />;

  return (
    <div className="space-y-2.5">
      <PixelTopBar star />
      <TopProgress value={(index + 1) / queue.length} exitHref="/" trailing={`#${index + 1}/${queue.length}`} />

      {/* Header + stats */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="px-label text-[0.5rem] text-brass">Tactics Arena</p>
          <h1 className="px-title truncate text-[1rem] text-cream">{THEME_LABELS[puzzle.theme]}</h1>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <PixelStat label="Rating" value={puzzleRating} tone="gold" />
          <PixelStat label="Streak" value={session.streak} tone="good" />
        </div>
      </div>

      {/* Theme filters */}
      <div className="-mx-3 overflow-x-auto px-3">
        <div className="flex w-max gap-1.5">
          {THEME_OPTIONS.map((opt) => {
            const active = theme === opt.value;
            return (
              <button key={opt.value} type="button" onClick={() => setTheme(opt.value)}
                className={`px-label shrink-0 rounded-[5px] border-2 px-2.5 py-1.5 text-[0.5rem] ${
                  active ? "border-brass bg-[var(--color-ink)] text-brass" : "border-[var(--px-edge)] bg-panel text-muted2"
                }`}>
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Coach instruction */}
      {status !== "correct" ? (
        <PixelPanel hue={status === "wrong" ? "red" : "green"} className="flex items-center gap-2 px-2.5 py-2">
          <ChessBuddy piece="knight" size={30} className="shrink-0" />
          <p className="text-[0.62rem] leading-tight text-cream">
            {status === "wrong" ? (
              feedback ?? "So close! That's legal, but not the winning move. Try again."
            ) : (
              <>
                <span className="font-bold text-brass">{toMove} to move.</span> Find the best move · difficulty {puzzle.rating}.
                {hintShown && puzzle.hint ? <span className="mt-0.5 block font-bold text-brass">Hint: {puzzle.hint}</span> : null}
              </>
            )}
          </p>
        </PixelPanel>
      ) : null}

      {/* Board */}
      <div className="px-board-frame">
        <div className="tabiya-board-wrap overflow-hidden rounded-[4px]">
          <PuzzleBoard />
        </div>
      </div>

      {status === "correct" ? (
        <RewardPanel title={`Solved — ${puzzle.answerSan ?? "correct"}`} xp={result?.xpAwarded ?? 0} tone="good" piece="knight" subtitle={ratingText}>
          <p className="text-left text-[0.66rem] text-muted">{puzzle.explanation}</p>
        </RewardPanel>
      ) : null}

      {status === "correct" ? (
        <PixelButton onClick={nextPuzzle} tone="green">NEXT PUZZLE →</PixelButton>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          <PixelButton onClick={showHint} disabled={hintShown} variant="secondary" size="sm">{hintShown ? "Hint ✓" : "Hint"}</PixelButton>
          <PixelButton onClick={resetPuzzle} variant="secondary" size="sm">Reset</PixelButton>
          <PixelButton onClick={nextPuzzle} variant="secondary" size="sm">Skip →</PixelButton>
        </div>
      )}
    </div>
  );
}
