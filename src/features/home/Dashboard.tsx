"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  useProfileStore,
  selectLevel,
  academyProgress,
  nextLesson,
  puzzlesSolvedCount,
} from "@/state/profileStore";
import { usePuzzleStore, overallAccuracy } from "@/state/puzzleStore";
import { useGameStore } from "@/state/gameStore";
import { rankForLevel } from "@/domain/progression/rank";
import { todayKey } from "@/domain/progression/leveling";
import { TIER0_LESSONS } from "@/content/academy/tier0";
import { BEGINNER_PUZZLES } from "@/content/puzzles/beginner";
import GameCard from "@/components/ui/GameCard";
import SectionHeader from "@/components/ui/SectionHeader";
import ActionButton from "@/components/ui/ActionButton";
import ProgressRing from "@/components/ui/ProgressRing";
import RankBadge from "@/components/ui/RankBadge";
import StatPill from "@/components/ui/StatPill";
import FlameIcon from "@/components/ui/FlameIcon";
import RewardChest from "@/components/ui/RewardChest";

function QuestRow({
  href,
  glyph,
  label,
  current,
  target,
}: {
  href: string;
  glyph: ReactNode;
  label: string;
  current: number;
  target: number;
}) {
  const done = current >= target;
  const pct = Math.max(0, Math.min(1, current / target)) * 100;
  return (
    <Link href={href} className="flex items-center gap-3 py-2">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-base ${
          done ? "border-brass/50 bg-brass/15 text-brass" : "border-line bg-ink2 text-muted2"
        }`}
        aria-hidden
      >
        {done ? "✓" : glyph}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <span className={`text-sm ${done ? "text-cream" : "text-muted"}`}>{label}</span>
          <span className="text-[11px] font-semibold text-muted2">
            {Math.min(current, target)}/{target}
          </span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-ink2">
          <div
            className="h-full rounded-full bg-brass transition-[width] duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </Link>
  );
}

function JourneyNode({
  label,
  glyph,
  state,
}: {
  label: string;
  glyph: string;
  state: "done" | "current" | "locked";
}) {
  const cls =
    state === "current"
      ? "border-[3px] border-brass bg-ink2 text-brass tab-glow"
      : state === "done"
        ? "border-2 border-brass bg-brass text-ink"
        : "border border-line bg-panel2 text-muted2";
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`flex h-12 w-12 items-center justify-center rounded-full text-base font-bold ${cls}`}>
        {glyph}
      </div>
      <span className="max-w-[72px] truncate text-[10px] text-muted2">{label}</span>
    </div>
  );
}

export default function Dashboard() {
  const xp = useProfileStore((s) => s.xp);
  const streak = useProfileStore((s) => s.streak);
  const lastActiveDate = useProfileStore((s) => s.lastActiveDate);
  const completed = useProfileStore((s) => s.completed);
  const puzzleRating = useProfileStore((s) => s.puzzleRating);
  const solvedIds = useProfileStore((s) => s.solvedPuzzleIds);
  const attempts = usePuzzleStore((s) => s.attempts);
  const session = usePuzzleStore((s) => s.session);
  const moves = useGameStore((s) => s.snap.history.length);

  useEffect(() => {
    void usePuzzleStore.getState().hydrate();
    void useGameStore.getState().hydrate();
  }, []);

  const lvl = selectLevel(xp);
  const rank = rankForLevel(lvl.level);
  const prog = academyProgress(completed);
  const next = nextLesson(completed);
  const solved = puzzlesSolvedCount(solvedIds);
  const acc = overallAccuracy(attempts);
  const fresh = xp === 0;

  const activeToday = lastActiveDate === todayKey();
  const continueHref = next ? `/academy/${next.id}` : "/puzzles";

  // Daily quests (derived from existing state — no extra persistence).
  const quests = [
    { href: continueHref, glyph: "♟", label: "Earn lesson XP", current: activeToday ? 1 : 0, target: 1 },
    { href: "/puzzles", glyph: "✦", label: "Solve 3 puzzles", current: Math.min(session.solved, 3), target: 3 },
    { href: "/play", glyph: "♞", label: "Play 5 moves", current: Math.min(moves, 5), target: 5 },
  ];
  const questFraction = quests.reduce((s, q) => s + Math.min(q.current / q.target, 1), 0) / quests.length;
  const questsDone = quests.filter((q) => q.current >= q.target).length;

  // Current Journey preview.
  const nextSeq = next ? TIER0_LESSONS.find((l) => l.order === next.order + 1) ?? null : null;

  return (
    <div className="space-y-6">
      <header className="pt-1">
        <p className="text-xs uppercase tracking-[0.18em] text-muted2">
          {fresh ? "Welcome to" : "Welcome back to"}
        </p>
        <h1 className="font-display text-4xl font-semibold text-cream">Tabiya</h1>
      </header>

      {/* Hero */}
      <GameCard variant="accent" glow className="p-5">
        <div className="flex items-center gap-4">
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
          <ActionButton href={continueHref}>
            {fresh ? "Begin your path →" : "Continue your journey →"}
          </ActionButton>
        </div>
      </GameCard>

      {/* Daily Quest */}
      <section>
        <SectionHeader eyebrow="Today" title="Daily Quest" />
        <GameCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-cream">
                  {questsDone}/{quests.length} complete
                </span>
                <span className="text-[11px] text-muted2">resets daily</span>
              </div>
              <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-ink2">
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{
                    width: `${questFraction * 100}%`,
                    backgroundImage: "linear-gradient(90deg, #b8923c, #d9b25a)",
                  }}
                />
              </div>
            </div>
            <RewardChest state={questsDone === quests.length ? "ready" : "locked"} size={48} />
          </div>

          <div className="mt-2 divide-y divide-line/60">
            {quests.map((q) => (
              <QuestRow key={q.label} {...q} />
            ))}
          </div>

          {/* Locked upcoming teaser */}
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-line bg-ink2/60 px-3 py-2 opacity-70">
            <RewardChest state="locked" size={28} />
            <span className="text-[11px] text-muted2">New quests unlock tomorrow</span>
          </div>
        </GameCard>
      </section>

      {/* Current Journey */}
      <section>
        <SectionHeader
          eyebrow="Academy"
          title="Your Journey"
          action={
            <Link href="/academy" className="text-xs font-semibold text-brass">
              View path ›
            </Link>
          }
        />
        <GameCard className="p-4">
          {next ? (
            <div className="flex items-center justify-between gap-2">
              <JourneyNode label={next.title} glyph={`${next.order}`} state="current" />
              <div className="h-0.5 flex-1 bg-line" />
              <JourneyNode
                label={nextSeq ? nextSeq.title : "Tier Trial"}
                glyph={nextSeq ? `${nextSeq.order}` : "♛"}
                state="locked"
              />
              <div className="h-0.5 flex-1 bg-line" />
              <JourneyNode label="Boss Gate" glyph="♛" state="locked" />
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <JourneyNode label="Foundations" glyph="✓" state="done" />
              <div className="h-0.5 flex-1 bg-brass/50" />
              <JourneyNode label="Boss Gate" glyph="♛" state="current" />
            </div>
          )}
          <p className="mt-3 text-center text-xs text-muted2">
            {next ? `Up next · ${next.title}` : "All lessons mastered — the Trial awaits"}
          </p>
        </GameCard>
      </section>

      {/* Secondary stats */}
      <section>
        <SectionHeader eyebrow="Progress" title="Skill Snapshot" />
        <div className="grid grid-cols-4 gap-2">
          <StatPill label="Rating" value={`${puzzleRating}`} tone="brass" />
          <StatPill label="Academy" value={`${Math.round(prog.pct * 100)}%`} />
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
