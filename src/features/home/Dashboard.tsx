"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useProfileStore, selectLevel, puzzlesSolvedCount, academyStateFrom } from "@/state/profileStore";
import { usePuzzleStore, overallAccuracy } from "@/state/puzzleStore";
import { useGameStore } from "@/state/gameStore";
import { rankForLevel } from "@/domain/progression/rank";
import { todayKey } from "@/domain/progression/leveling";
import {
  nextRecommended,
  academyProgress,
  tierProgress,
  isTierUnlocked,
} from "@/domain/academy/progression";
import {
  dailyForToday,
  dailyDoneCount,
  dailyAllComplete,
  dailyBonusClaimable,
  DAILY_BONUS_XP,
} from "@/domain/training/daily";
import { lessonsForTier } from "@/content/academy";
import { BEGINNER_PUZZLES, THEME_LABELS, type PuzzleTheme } from "@/content/puzzles/beginner";
import GameCard from "@/components/ui/GameCard";
import SectionHeader from "@/components/ui/SectionHeader";
import ActionButton from "@/components/ui/ActionButton";
import ProgressRing from "@/components/ui/ProgressRing";
import RankBadge from "@/components/ui/RankBadge";
import StatPill from "@/components/ui/StatPill";
import XPBar from "@/components/ui/XPBar";
import FlameIcon from "@/components/ui/FlameIcon";
import RewardChest from "@/components/ui/RewardChest";

function TaskRow({
  href,
  glyph,
  label,
  done,
}: {
  href: string;
  glyph: ReactNode;
  label: string;
  done: boolean;
}) {
  return (
    <Link href={href} className="flex items-center gap-3 py-2.5">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-lg ${
          done ? "border-good/50 bg-good/15 text-good" : "border-line bg-ink2 text-muted2"
        }`}
        aria-hidden
      >
        {done ? "✓" : glyph}
      </div>
      <span className={`flex-1 text-sm ${done ? "text-cream line-through decoration-good/40" : "text-cream"}`}>
        {label}
      </span>
      <span className={`text-xs font-semibold ${done ? "text-good" : "text-muted2"}`}>
        {done ? "Done" : "Go ›"}
      </span>
    </Link>
  );
}

export default function Dashboard() {
  const xp = useProfileStore((s) => s.xp);
  const streak = useProfileStore((s) => s.streak);
  const completed = useProfileStore((s) => s.completed);
  const bossClearedMap = useProfileStore((s) => s.bossCleared);
  const puzzleRating = useProfileStore((s) => s.puzzleRating);
  const solvedIds = useProfileStore((s) => s.solvedPuzzleIds);
  const dailyRaw = useProfileStore((s) => s.daily);
  const claimDailyBonus = useProfileStore((s) => s.claimDailyBonus);
  const attempts = usePuzzleStore((s) => s.attempts);

  const [justClaimed, setJustClaimed] = useState(false);

  useEffect(() => {
    void usePuzzleStore.getState().hydrate();
    void useGameStore.getState().hydrate();
  }, []);

  const lvl = selectLevel(xp);
  const rank = rankForLevel(lvl.level);
  const state = academyStateFrom(completed, bossClearedMap);
  const step = nextRecommended(state);
  const acad = academyProgress(state);
  const t0 = tierProgress(0, state);
  const t1 = tierProgress(1, state);
  const tier1Open = isTierUnlocked(1, state);
  const solved = puzzlesSolvedCount(solvedIds);
  const acc = overallAccuracy(attempts);
  const fresh = xp === 0;

  // Persistent daily training (today's row, fresh if absent/stale).
  const daily = dailyForToday(dailyRaw, todayKey());
  const doneCount = dailyDoneCount(daily);
  const allDone = dailyAllComplete(daily);
  const claimable = dailyBonusClaimable(daily);

  const tasks = [
    { key: "academy", href: step.href, glyph: "♟", label: "Continue Academy", done: daily.academyTaskDone },
    { key: "puzzle", href: "/puzzles", glyph: "✦", label: "Solve a puzzle", done: daily.puzzleTaskDone },
    { key: "play", href: "/play", glyph: "♞", label: "Practice on the board", done: daily.playTaskDone },
  ];

  // Puzzle recommendation from the current/most-recent tactic lesson.
  const recoTheme: PuzzleTheme | null =
    step.lesson?.relatedPuzzleTheme ??
    [...lessonsForTier(1)].reverse().find((l) => completed[l.id] && l.relatedPuzzleTheme)
      ?.relatedPuzzleTheme ??
    null;

  async function onClaim() {
    const got = await claimDailyBonus();
    if (got > 0) setJustClaimed(true);
  }

  return (
    <div className="space-y-6">
      <header className="pt-1">
        <p className="text-xs uppercase tracking-[0.18em] text-muted2">
          {fresh ? "Welcome to" : "Welcome back to"}
        </p>
        <h1 className="font-display text-4xl font-semibold text-cream">Tabiya</h1>
      </header>

      {/* Hero */}
      <GameCard variant="accent" glow className="relative overflow-hidden p-5">
        <div aria-hidden className="pointer-events-none absolute inset-0 select-none">
          <span className="absolute -right-2 -top-3 text-7xl text-sky/10">♞</span>
          <span className="absolute right-10 bottom-1 text-4xl text-lav/20">♟</span>
          <span className="absolute left-2 -bottom-3 text-5xl text-mint/20">★</span>
        </div>
        <div className="relative flex items-center gap-4">
          <ProgressRing value={lvl.progress} size={108}>
            <span className="font-display text-3xl leading-none text-cream">{lvl.level}</span>
            <span className="mt-0.5 text-[9px] uppercase tracking-[0.18em] text-muted2">Level</span>
          </ProgressRing>
          <div className="min-w-0 flex-1">
            <RankBadge title={rank.title} />
            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted">
              <FlameIcon active={streak > 0} />
              <span className="font-semibold text-cream">{streak}</span>
              <span className="text-muted2">day{streak === 1 ? "" : "s"} streak</span>
            </div>
            <p className="mt-1 text-[11px] text-muted2">
              {fresh ? "Your journey starts now" : `${xp} XP · ${lvl.span - lvl.intoLevel} to next level`}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <ActionButton href={step.href}>
            {fresh ? "Begin your path →" : "Continue your journey →"}
          </ActionButton>
        </div>
      </GameCard>

      {/* Daily Training */}
      <section>
        <SectionHeader eyebrow="Today" title="Daily Training" />
        <GameCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-cream">{doneCount}/3 tasks</span>
                <span className="text-[11px] text-muted2">resets at midnight</span>
              </div>
              <div className="mt-1.5">
                <XPBar value={doneCount / 3} />
              </div>
            </div>
            <RewardChest state={daily.bonusClaimed ? "claimed" : allDone ? "ready" : "locked"} size={48} />
          </div>

          <div className="mt-1 divide-y divide-line/60">
            {tasks.map((t) => (
              <TaskRow key={t.key} href={t.href} glyph={t.glyph} label={t.label} done={t.done} />
            ))}
          </div>

          {/* Bonus state */}
          {daily.bonusClaimed || justClaimed ? (
            <div className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-good/40 bg-good/10 px-3 py-2.5 text-sm font-semibold text-good">
              ✓ Daily bonus claimed · +{DAILY_BONUS_XP} XP
            </div>
          ) : claimable ? (
            <button
              onClick={onClaim}
              className="mt-3 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border border-brassdeep bg-brass text-[color:var(--color-on-accent)] text-sm font-semibold shadow-[0_4px_0_0_#3b82f6] active:translate-y-0.5 active:shadow-[0_2px_0_0_#3b82f6]"
            >
              Claim daily bonus · +{DAILY_BONUS_XP} XP
            </button>
          ) : (
            <p className="mt-3 text-center text-[11px] text-muted2">
              Finish all 3 tasks to unlock today&apos;s bonus chest.
            </p>
          )}
        </GameCard>
      </section>

      {/* Current Journey / next step */}
      <section>
        <SectionHeader
          eyebrow="Academy"
          title="Your Journey"
          action={
            <Link href="/academy" className="text-xs font-semibold text-brass">
              View map ›
            </Link>
          }
        />
        <Link href={step.href} className="block transition-transform active:scale-[0.99]">
          <GameCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[3px] border-brass bg-ink2 text-lg font-bold text-brass tab-glow">
                {step.kind === "boss" ? "♛" : step.kind === "done" ? "✓" : "▶"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] uppercase tracking-wider text-brass">
                  {step.kind === "boss" ? "Trial ready" : step.kind === "done" ? "Complete" : "Up next"}
                </p>
                <h3 className="truncate font-display text-base text-cream">{step.title}</h3>
              </div>
              <span className="shrink-0 text-muted2">›</span>
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-14 shrink-0 text-[11px] text-muted2">Tier 0</span>
                <XPBar value={t0.pct} />
                <span className="w-9 shrink-0 text-right text-[11px] text-muted2">{t0.done}/{t0.total}</span>
              </div>
              <div className={`flex items-center gap-2 ${tier1Open ? "" : "opacity-50"}`}>
                <span className="w-14 shrink-0 text-[11px] text-muted2">Tier 1</span>
                <XPBar value={t1.pct} />
                <span className="w-9 shrink-0 text-right text-[11px] text-muted2">
                  {tier1Open ? `${t1.done}/${t1.total}` : "🔒"}
                </span>
              </div>
            </div>
          </GameCard>
        </Link>
      </section>

      {/* Puzzle recommendation */}
      <section>
        <SectionHeader eyebrow="Practice" title="Recommended Tactic" />
        <Link
          href={recoTheme ? `/puzzles?theme=${recoTheme}` : "/puzzles"}
          className="block transition-transform active:scale-[0.99]"
        >
          <GameCard variant="accent" className="flex items-center gap-3 p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brass/40 bg-brass/10 text-xl text-brass">
              ✦
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-base text-cream">
                {recoTheme ? THEME_LABELS[recoTheme] : "Mixed tactics"}
              </h3>
              <p className="truncate text-xs text-muted2">Sharpen this pattern in the arena</p>
            </div>
            <span className="shrink-0 rounded-full border border-brass/50 bg-brass/15 px-3 py-1.5 text-xs font-bold text-brass">
              Practice ›
            </span>
          </GameCard>
        </Link>
      </section>

      {/* Secondary stats */}
      <section>
        <SectionHeader eyebrow="Progress" title="Skill Snapshot" />
        <div className="grid grid-cols-4 gap-2">
          <StatPill label="Rating" value={`${puzzleRating}`} tone="brass" />
          <StatPill label="Academy" value={`${Math.round(acad.pct * 100)}%`} />
          <StatPill label="Solved" value={`${solved}`} sub={`/${BEGINNER_PUZZLES.length}`} />
          <StatPill
            label="Accuracy"
            value={acc.total ? `${Math.round(acc.pct * 100)}%` : "—"}
            tone={acc.total ? "good" : "muted"}
          />
        </div>
      </section>
    </div>
  );
}
