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
import { rankForLevel } from "@/domain/progression/rank";
import { BEGINNER_PUZZLES } from "@/content/puzzles/beginner";
import GameCard from "@/components/ui/GameCard";
import SectionHeader from "@/components/ui/SectionHeader";
import ActionButton from "@/components/ui/ActionButton";
import ProgressRing from "@/components/ui/ProgressRing";
import RankBadge from "@/components/ui/RankBadge";
import StatPill from "@/components/ui/StatPill";
import FlameIcon from "@/components/ui/FlameIcon";

function TrainingRow({
  href,
  glyph,
  title,
  subtitle,
  accent = false,
}: {
  href: string;
  glyph: ReactNode;
  title: string;
  subtitle: string;
  accent?: boolean;
}) {
  return (
    <Link href={href} className="block transition-transform active:scale-[0.99]">
      <GameCard variant={accent ? "accent" : "default"} className="flex items-center gap-3 p-3.5">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-xl ${
            accent ? "border-brass/40 bg-brass/10 text-brass" : "border-line bg-ink2 text-muted"
          }`}
          aria-hidden
        >
          {glyph}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base text-cream">{title}</h3>
          <p className="truncate text-xs text-muted2">{subtitle}</p>
        </div>
        <span className="shrink-0 text-muted2">›</span>
      </GameCard>
    </Link>
  );
}

export default function Dashboard() {
  const xp = useProfileStore((s) => s.xp);
  const streak = useProfileStore((s) => s.streak);
  const completed = useProfileStore((s) => s.completed);
  const puzzleRating = useProfileStore((s) => s.puzzleRating);
  const solvedIds = useProfileStore((s) => s.solvedPuzzleIds);
  const attempts = usePuzzleStore((s) => s.attempts);

  useEffect(() => {
    void usePuzzleStore.getState().hydrate();
  }, []);

  const lvl = selectLevel(xp);
  const rank = rankForLevel(lvl.level);
  const prog = academyProgress(completed);
  const next = nextLesson(completed);
  const solved = puzzlesSolvedCount(solvedIds);
  const acc = overallAccuracy(attempts);
  const fresh = xp === 0;

  const continueHref = next ? `/academy/${next.id}` : "/puzzles";

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
          <ProgressRing value={lvl.progress} size={104}>
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
              {fresh
                ? "Your journey starts now"
                : `${xp} XP · ${lvl.span - lvl.intoLevel} XP to ${rank.next ? "Level " + (lvl.level + 1) : "next level"}`}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <ActionButton href={continueHref}>
            {fresh ? "Begin your path →" : "Continue your journey →"}
          </ActionButton>
        </div>
      </GameCard>

      {/* Today's Training */}
      <section>
        <SectionHeader eyebrow="Today" title="Today's Training" />
        <div className="space-y-2.5">
          <TrainingRow
            href={next ? `/academy/${next.id}` : "/academy"}
            glyph="♟"
            title={next ? next.title : "Foundations complete"}
            subtitle={next ? `Academy · +${next.xpReward} XP` : "Review your lessons"}
            accent
          />
          <TrainingRow
            href="/puzzles"
            glyph="✦"
            title="Tactics Trainer"
            subtitle={solved > 0 ? `${solved}/${BEGINNER_PUZZLES.length} solved · rating ${puzzleRating}` : "Start solving puzzles"}
          />
          <TrainingRow href="/play" glyph="♞" title="Practice Board" subtitle="Play out your ideas" />
        </div>
      </section>

      {/* Skill Snapshot */}
      <section>
        <SectionHeader eyebrow="Progress" title="Skill Snapshot" />
        <div className="grid grid-cols-2 gap-2.5">
          <StatPill label="Puzzle Rating" value={`${puzzleRating}`} tone="brass" />
          <StatPill
            label="Academy"
            value={`${Math.round(prog.pct * 100)}%`}
            sub={`${prog.done}/${prog.total} lessons`}
          />
          <StatPill
            label="Puzzles Solved"
            value={`${solved}`}
            sub={`of ${BEGINNER_PUZZLES.length}`}
          />
          <StatPill
            label="Accuracy"
            value={acc.total ? `${Math.round(acc.pct * 100)}%` : "—"}
            sub={acc.total ? `${acc.correct}/${acc.total} tries` : "no attempts yet"}
            tone={acc.total ? "good" : "muted"}
          />
        </div>
      </section>
    </div>
  );
}
