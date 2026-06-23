"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { usePuzzleStore, currentPuzzle, type ThemeFilter } from "@/state/puzzleStore";
import { useProfileStore } from "@/state/profileStore";
import { PUZZLE_THEMES, THEME_LABELS, THEME_INTROS, type PuzzleTheme } from "@/content/puzzles/beginner";
import RewardPanel from "@/components/ui/RewardPanel";
import TopProgress from "@/components/ui/TopProgress";
import Skeleton, { BoardSkeleton } from "@/components/ui/Skeleton";
import PixelTopBar from "@/components/pixel/PixelTopBar";
import PixelPanel from "@/components/pixel/PixelPanel";
import PixelButton from "@/components/pixel/PixelButton";
import PixelStat from "@/components/pixel/PixelStat";
import SegmentControl from "@/components/pixel/SegmentControl";
import Modal from "@/components/ui/Modal";
import ChessBuddy from "@/components/characters/ChessBuddy";
import { fx } from "@/lib/feedback";
import { dailyPuzzleId, isDailyPuzzleDone, markDailyPuzzleDone, DAILY_PUZZLE_BONUS } from "@/domain/training/dailyPuzzle";
import { loadDueReviewIds, recordReviewResult } from "@/domain/training/reviewSession";
import { ratingTier } from "@/domain/training/ladder";

const PuzzleBoard = dynamic(() => import("@/components/PuzzleBoard"), { ssr: false, loading: () => <BoardSkeleton /> });

const THEME_OPTIONS: { value: ThemeFilter; label: string }[] = [
  { value: "mixed", label: "Mixed" },
  ...PUZZLE_THEMES.map((t) => ({ value: t as ThemeFilter, label: THEME_LABELS[t] })),
];

/** Visible combo meter — pips light up as the session streak grows. */
function ComboMeter({ streak, best }: { streak: number; best: number }) {
  const pips = 5;
  const lit = Math.min(streak, pips);
  const hot = streak >= pips;
  return (
    <div className={`px-inset flex items-center gap-2 px-2.5 py-2 ${hot ? "tab-pulse" : ""}`}>
      <span className="px-label flex items-center gap-1 text-[0.46rem] text-muted2">
        {hot ? <span className="tab-flame-icon text-[0.7rem]" aria-hidden>🔥</span> : null}
        Combo
      </span>
      <div className="flex flex-1 items-center gap-1">
        {Array.from({ length: pips }).map((_, i) => (
          <span
            key={i}
            className="h-2.5 flex-1 rounded-[3px] border border-[var(--px-edge)]"
            style={{
              background: i < lit
                ? (hot ? "linear-gradient(180deg, var(--color-sun), var(--color-brass))" : "linear-gradient(180deg, var(--color-mint), var(--color-good))")
                : "var(--color-ink)",
              boxShadow: i < lit ? "inset 0 1px 0 rgba(255,255,255,0.4)" : undefined,
            }}
            aria-hidden
          />
        ))}
      </div>
      <span className={`font-display text-[0.74rem] ${hot ? "text-sun" : "text-brass"}`}>
        {streak > 0 ? `×${streak}` : "—"}
      </span>
      <span className="px-label text-[0.42rem] text-muted2">best {best}</span>
    </div>
  );
}

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
  const bestPuzzleRating = useProfileStore((s) => s.bestPuzzleRating);
  const tier = ratingTier(puzzleRating);
  const consumables = useProfileStore((s) => s.consumables);
  const consume = useProfileStore((s) => s.consumeItem);
  const hintCount = consumables["consumable-hint"] ?? 0;
  const skipCount = consumables["consumable-skip"] ?? 0;

  const searchParams = useSearchParams();
  const themeParam = searchParams.get("theme");
  const daily = searchParams.get("daily") === "1";
  const review = searchParams.get("review") === "1";
  const climb = searchParams.get("climb") === "1";
  const applied = useRef(false);
  const dailyAwarded = useRef(false);

  const puzzle = currentPuzzle({ queue, index });
  const toMove = puzzle.sideToMove === "w" ? "White" : "Black";
  const ratingDelta = result ? result.ratingAfter - result.ratingBefore : 0;
  const ratingText = ratingDelta !== 0 ? `${ratingDelta > 0 ? "+" : ""}${ratingDelta} rating` : "rating unchanged";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await usePuzzleStore.getState().hydrate();
      if (cancelled || applied.current) return;
      applied.current = true;
      if (climb) {
        usePuzzleStore.getState().startClimb();
      } else if (review) {
        const ids = await loadDueReviewIds();
        if (!cancelled) usePuzzleStore.getState().startReview(ids);
      } else if (daily) {
        usePuzzleStore.getState().startPuzzleById(dailyPuzzleId());
      } else if (themeParam && (PUZZLE_THEMES as string[]).includes(themeParam)) {
        usePuzzleStore.getState().setTheme(themeParam as PuzzleTheme);
      }
    })();
    return () => { cancelled = true; };
  }, [themeParam, daily, review, climb]);

  useEffect(() => {
    if (status === "wrong") {
      fx.wrong();
      if (review) void recordReviewResult(puzzle.id, false);
    }
    // Daily puzzle solved → bonus coins, once per day.
    if (status === "correct" && daily && !dailyAwarded.current && !isDailyPuzzleDone()) {
      dailyAwarded.current = true;
      markDailyPuzzleDone();
      void useProfileStore.getState().addCoins(DAILY_PUZZLE_BONUS);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, daily, review]);

  // Solved popup auto-advances to the next puzzle after 5s.
  useEffect(() => {
    if (status !== "correct") return;
    const t = setTimeout(() => nextPuzzle(), 5000);
    return () => clearTimeout(t);
  }, [status, nextPuzzle]);

  if (!hydrated) return <PuzzleLoading />;

  return (
    <div className="space-y-2.5">
      <PixelTopBar star />
      <TopProgress value={(index + 1) / queue.length} exitHref="/" trailing={`#${index + 1}/${queue.length}`} />

      {/* Header + stats */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="px-label text-[0.5rem] text-brass">{climb ? "↑ Rated Climb" : review ? "↻ Review Mistakes" : daily ? "★ Puzzle of the Day" : "Tactics Arena"}</p>
          <h1 className="px-title truncate text-[1rem] text-cream">{climb ? tier.title : THEME_LABELS[puzzle.theme]}</h1>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <PixelStat label="Rating" value={puzzleRating} tone="gold" />
          <PixelStat label={climb ? "Best" : "Streak"} value={climb ? bestPuzzleRating : session.streak} tone={climb ? "purple" : "good"} />
        </div>
      </div>

      {/* Ladder progress (climb) or combo meter (practice) */}
      {climb ? (
        <div className="px-inset px-2.5 py-2">
          <div className="flex items-center justify-between text-[0.46rem]">
            <span className="px-label text-brass">{tier.title}</span>
            <span className="px-label text-muted2">{tier.nextTitle ? `${tier.toNext} to ${tier.nextTitle}` : "Top tier!"}</span>
          </div>
          <div className="px-track mt-1 h-2"><div className="px-track-fill" style={{ width: `${Math.round(tier.progress * 100)}%`, "--fill": "var(--color-brass)" } as React.CSSProperties} /></div>
        </div>
      ) : (
        <ComboMeter streak={session.streak} best={session.best} />
      )}

      {/* Theme filters (practice only) */}
      {!climb ? <SegmentControl options={THEME_OPTIONS} value={theme} onChange={setTheme} layout="scroll" /> : null}

      {/* Coach instruction */}
      {status !== "correct" ? (
        <PixelPanel hue={status === "wrong" ? "red" : "green"} className="flex items-center gap-2 px-2.5 py-2">
          <ChessBuddy piece="knight" size={30} className="shrink-0" />
          <p className="text-[0.62rem] leading-tight text-cream">
            {status === "wrong" ? (
              feedback ?? "So close! That's legal, but not the winning move. Try again."
            ) : (
              <>
                <span className="block text-[0.56rem] text-good">{THEME_INTROS[puzzle.theme]}</span>
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

      {/* Centered solved popup — auto-advances after 5s, or tap Next now */}
      {status === "correct" ? (
        <Modal open onClose={nextPuzzle}>
          <RewardPanel title={`Solved — ${puzzle.answerSan ?? "correct"}`} xp={result?.xpAwarded ?? 0} tone="good" piece="knight" subtitle={ratingText}>
            <p className="text-center text-[0.66rem] text-muted">{puzzle.explanation}</p>
            <div className="mt-3">
              <PixelButton onClick={nextPuzzle} tone="green">NEXT PUZZLE →</PixelButton>
            </div>
          </RewardPanel>
        </Modal>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          <PixelButton onClick={async () => { if (hintShown) return; if (await consume("consumable-hint")) showHint(); }} disabled={hintShown || hintCount <= 0} variant="secondary" size="sm">{hintShown ? "Hint ✓" : `Hint (${hintCount})`}</PixelButton>
          <PixelButton onClick={resetPuzzle} variant="secondary" size="sm">Reset</PixelButton>
          <PixelButton onClick={async () => { if (await consume("consumable-skip")) nextPuzzle(); }} disabled={skipCount <= 0} variant="secondary" size="sm">{`Skip (${skipCount})`}</PixelButton>
        </div>
      )}
    </div>
  );
}
