"use client";

import { useEffect } from "react";
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
import ClaimableChest from "@/components/ui/ClaimableChest";
import ChessBuddy from "@/components/characters/ChessBuddy";

type MilestoneState = "done" | "current" | "locked";

function MissionCard({
  href,
  glyph,
  label,
  done,
  surface,
}: {
  href: string;
  glyph: string;
  label: string;
  done: boolean;
  surface: string;
}) {
  return (
    <Link href={href} className="block transition-transform active:scale-[0.97]">
      <div className={`flex h-full flex-col items-center gap-2 rounded-2xl border border-line p-3 text-center ${surface}`}>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full border text-2xl ${
            done ? "border-good/50 bg-good/20 text-gooddeep" : "border-line bg-panel text-cream"
          }`}
          aria-hidden
        >
          {done ? "✓" : glyph}
        </div>
        <span className="text-[11px] font-semibold leading-tight text-cream">{label}</span>
        <span className={`text-[10px] font-bold ${done ? "text-gooddeep" : "text-muted2"}`}>
          {done ? "Done" : "Go ›"}
        </span>
      </div>
    </Link>
  );
}

function MiniNode({ glyph, label, state }: { glyph: string; label: string; state: MilestoneState }) {
  const cls =
    state === "current"
      ? "border-[3px] border-brass bg-surf-blue text-brass tab-pulse"
      : state === "done"
        ? "border-2 border-good/50 bg-good/20 text-gooddeep"
        : "border border-line bg-ink2 text-muted2";
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold ${cls}`}>
        {state === "locked" ? "🔒" : state === "done" ? "✓" : glyph}
      </div>
      <span className="max-w-[64px] truncate text-[10px] text-muted2">{label}</span>
    </div>
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
  const playRating = useProfileStore((s) => s.playRating);
  const matches = useProfileStore((s) => s.matches);
  const attempts = usePuzzleStore((s) => s.attempts);

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
  const bossDone = Boolean(bossClearedMap["tier-0"]);
  const solved = puzzlesSolvedCount(solvedIds);
  const acc = overallAccuracy(attempts);
  const fresh = xp === 0;

  const daily = dailyForToday(dailyRaw, todayKey());
  const doneCount = dailyDoneCount(daily);
  const allDone = dailyAllComplete(daily);
  const claimable = dailyBonusClaimable(daily);
  const lastMatch = matches[0];
  const playTaskDone = daily.playTaskDone;

  const missions = [
    { key: "academy", href: step.href, glyph: "♟", label: "Academy", done: daily.academyTaskDone, surface: "bg-surf-blue" },
    { key: "puzzle", href: "/puzzles", glyph: "✦", label: "Puzzle", done: daily.puzzleTaskDone, surface: "bg-surf-mint" },
    { key: "play", href: "/play", glyph: "♞", label: "Play", done: daily.playTaskDone, surface: "bg-surf-lav" },
  ];

  // Mini-path milestone states.
  const t0State: MilestoneState = t0.total > 0 && t0.done === t0.total ? "done" : "current";
  const bossState: MilestoneState = bossDone ? "done" : t0State === "done" ? "current" : "locked";
  const t1State: MilestoneState = !tier1Open
    ? "locked"
    : t1.total > 0 && t1.done === t1.total
      ? "done"
      : "current";

  const recoTheme: PuzzleTheme | null =
    step.lesson?.relatedPuzzleTheme ??
    [...lessonsForTier(1)].reverse().find((l) => completed[l.id] && l.relatedPuzzleTheme)
      ?.relatedPuzzleTheme ??
    null;

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
          <span className="absolute right-10 bottom-1 text-4xl text-lav/30">♟</span>
          <span className="absolute left-2 -bottom-3 text-5xl text-mint/40">★</span>
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
          {/* Guide character + encouragement */}
          <div className="mb-3 flex items-center gap-2.5 rounded-2xl border border-line bg-surf-blue px-3 py-2">
            <ChessBuddy piece="pawn" size={42} />
            <p className="flex-1 text-xs text-cream">
              {allDone
                ? "Every mission done — open your chest! 🎉"
                : doneCount > 0
                  ? `Nice work — ${3 - doneCount} to go!`
                  : "Hi, I'm Pip! Let's finish 3 quick missions today."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-cream">{doneCount}/3 missions</span>
                <span className="text-[11px] text-muted2">resets daily</span>
              </div>
              <div className="mt-1.5">
                <XPBar value={doneCount / 3} />
              </div>
            </div>
            <ClaimableChest
              state={daily.bonusClaimed ? "claimed" : claimable ? "ready" : "locked"}
              size={64}
              onClaim={claimDailyBonus}
              rewardTitle="Daily Bonus!"
              rewardPiece="pawn"
              lockedMessage="Finish all 3 missions first!"
            />
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2.5">
            {missions.map((m) => (
              <MissionCard
                key={m.key}
                href={m.href}
                glyph={m.glyph}
                label={m.label}
                done={m.done}
                surface={m.surface}
              />
            ))}
          </div>

          {/* Bonus hint */}
          <p className="mt-3 text-center text-[11px] text-muted2">
            {daily.bonusClaimed
              ? `🎉 Daily bonus claimed · +${DAILY_BONUS_XP} XP`
              : claimable
                ? "Tap the glowing chest to claim your bonus!"
                : "Finish all 3 missions to open today's reward chest."}
          </p>
        </GameCard>
      </section>

      {/* Journey mini-path */}
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
        <GameCard className="p-4">
          <div className="flex items-center justify-between">
            <MiniNode glyph="♟" label="Foundations" state={t0State} />
            <div className={`mx-1 h-0.5 flex-1 rounded-full ${t0State === "done" ? "bg-good/40" : "bg-line"}`} />
            <MiniNode glyph="♛" label="Trial" state={bossState} />
            <div className={`mx-1 h-0.5 flex-1 rounded-full ${bossState === "done" ? "bg-good/40" : "bg-line"}`} />
            <MiniNode glyph="♝" label="Tactics" state={t1State} />
          </div>
          <Link
            href={step.href}
            className="mt-3 flex items-center gap-2 rounded-xl border border-brass/30 bg-surf-blue px-3 py-2.5 transition-transform active:scale-[0.99]"
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider text-brass">
              {step.kind === "boss" ? "Trial ready" : step.kind === "done" ? "All done" : "Up next"}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm text-cream">{step.title}</span>
            <span className="shrink-0 text-brass">›</span>
          </Link>
        </GameCard>
      </section>

      {/* Recommended tactic */}
      <section>
        <SectionHeader eyebrow="Practice" title="Recommended Tactic" />
        <Link
          href={recoTheme ? `/puzzles?theme=${recoTheme}` : "/puzzles"}
          className="block transition-transform active:scale-[0.99]"
        >
          <div className="flex items-center gap-3 rounded-[1.25rem] border border-lav/40 bg-surf-lav p-4 shadow-[0_8px_18px_-10px_rgba(124,58,237,0.25)]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-lav/50 bg-panel text-2xl text-lavdeep">
              ✦
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-base text-cream">
                {recoTheme ? THEME_LABELS[recoTheme] : "Mixed tactics"}
              </h3>
              <p className="truncate text-xs text-muted2">Sharpen this pattern in the arena</p>
            </div>
            <span className="shrink-0 rounded-full border border-lav/50 bg-panel px-3 py-1.5 text-xs font-bold text-lavdeep">
              Play ›
            </span>
          </div>
        </Link>
      </section>

      {/* Friendly match */}
      <section>
        <SectionHeader eyebrow="Play" title={playTaskDone ? "Friendly Match" : "Daily Match"} />
        <Link href="/play" className="block transition-transform active:scale-[0.99]">
          <div
            className={`relative flex items-center gap-3 overflow-hidden rounded-[1.25rem] border p-4 ${
              playTaskDone ? "border-line bg-panel" : "border-brass/40 bg-surf-blue tab-glow"
            }`}
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-line bg-panel">
              <ChessBuddy piece="rook" size={46} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base text-cream">
                  {playTaskDone ? "Play a friendly match" : "Play your Daily Match"}
                </h3>
              </div>
              <p className="truncate text-xs text-muted2">
                {lastMatch
                  ? `Last: ${lastMatch.result === "win" ? "Won vs" : lastMatch.result === "draw" ? "Drew vs" : "Lost to"} ${lastMatch.opponentName.split(" ")[0]}`
                  : "Beat Pip, Bramble or Gallop"}
                {" · Rating "}
                <span className="font-semibold text-brass">{playRating}</span>
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-brassdeep bg-brass px-3.5 py-2 text-xs font-bold text-[color:var(--color-on-accent)] shadow-[0_3px_0_0_var(--color-brassdeep)]">
              {playTaskDone ? "Play ›" : "Start ›"}
            </span>
          </div>
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
