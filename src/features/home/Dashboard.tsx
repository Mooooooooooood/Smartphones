"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  useProfileStore,
  selectLevel,
  academyProgress,
  nextLesson,
  puzzlesSolvedCount,
} from "@/state/profileStore";
import { BEGINNER_PUZZLES } from "@/content/puzzles/beginner";
import ProgressBar from "@/components/ProgressBar";
import StatTile from "@/components/StatTile";

export default function Dashboard() {
  const xp = useProfileStore((s) => s.xp);
  const streak = useProfileStore((s) => s.streak);
  const completed = useProfileStore((s) => s.completed);
  const puzzleRating = useProfileStore((s) => s.puzzleRating);
  const solvedIds = useProfileStore((s) => s.solvedPuzzleIds);

  useEffect(() => {
    void useProfileStore.getState().hydrate();
  }, []);

  const lvl = selectLevel(xp);
  const prog = academyProgress(completed);
  const next = nextLesson(completed);
  const solved = puzzlesSolvedCount(solvedIds);

  return (
    <div className="space-y-5">
      <header className="pt-1">
        <p className="text-xs uppercase tracking-[0.18em] text-muted2">Welcome back to</p>
        <h1 className="font-display text-4xl font-semibold text-cream">Tabiya</h1>
      </header>

      <section
        className="rounded-2xl border border-line p-4"
        style={{ backgroundImage: "linear-gradient(to bottom, #2a2116, #1f1810)" }}
      >
        <div className="flex items-baseline justify-between">
          <span className="font-display text-xl text-cream">Level {lvl.level}</span>
          <span className="text-xs text-muted">
            {lvl.intoLevel} / {lvl.span} XP
          </span>
        </div>
        <div className="mt-2">
          <ProgressBar value={lvl.progress} />
        </div>
        <div className="mt-1 text-[11px] text-muted2">{xp} total XP</div>
      </section>

      <div className="grid grid-cols-3 gap-3">
        <StatTile label="Streak" value={`${streak}`} hint={streak === 1 ? "day" : "days"} />
        <StatTile
          label="Academy"
          value={`${Math.round(prog.pct * 100)}%`}
          hint={`${prog.done}/${prog.total}`}
        />
        <StatTile label="Rating" value={`${puzzleRating}`} hint="puzzles" />
      </div>

      <div className="space-y-3">
        {next ? (
          <Link
            href={`/academy/${next.id}`}
            className="block rounded-2xl border border-brass/40 bg-brass/10 p-4 transition-transform active:scale-[0.99]"
          >
            <p className="text-xs uppercase tracking-wider text-brass">Continue learning</p>
            <h2 className="font-display text-xl text-cream">{next.title}</h2>
            <p className="mt-0.5 text-sm text-muted">
              {next.subtitle} · +{next.xpReward} XP
            </p>
          </Link>
        ) : (
          <Link
            href="/academy"
            className="block rounded-2xl border border-brass/40 bg-brass/10 p-4 transition-transform active:scale-[0.99]"
          >
            <p className="text-xs uppercase tracking-wider text-brass">Tier 0 complete</p>
            <h2 className="font-display text-xl text-cream">Review your lessons</h2>
          </Link>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/play"
            className="rounded-2xl border border-line bg-panel p-4 transition-transform active:scale-[0.99]"
          >
            <h3 className="font-display text-lg text-cream">Play</h3>
            <p className="mt-0.5 text-xs text-muted2">Free board</p>
          </Link>
          <Link
            href="/puzzles"
            className="rounded-2xl border border-line bg-panel p-4 transition-transform active:scale-[0.99]"
          >
            <h3 className="font-display text-lg text-cream">Puzzles</h3>
            <p className="mt-0.5 text-xs text-muted2">
              {solved > 0 ? `${solved}/${BEGINNER_PUZZLES.length} solved` : "Train tactics"}
            </p>
          </Link>
        </div>

        <Link
          href="/puzzles"
          className="block rounded-2xl border border-brass/40 bg-brass/10 p-4 transition-transform active:scale-[0.99]"
        >
          <p className="text-xs uppercase tracking-wider text-brass">Continue training</p>
          <h2 className="font-display text-xl text-cream">Tactics Trainer</h2>
          <p className="mt-0.5 text-sm text-muted">
            Rating {puzzleRating} · {solved > 0 ? `${solved} solved` : "weak areas reveal as you play"}
          </p>
        </Link>
      </div>
    </div>
  );
}
