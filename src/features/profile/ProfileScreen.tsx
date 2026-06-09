"use client";

import { useEffect } from "react";
import { useProfileStore, selectLevel, academyProgress, puzzlesSolvedCount } from "@/state/profileStore";
import { usePuzzleStore, overallAccuracy } from "@/state/puzzleStore";
import { rankForLevel } from "@/domain/progression/rank";
import { BEGINNER_PUZZLES, THEME_LABELS, type PuzzleCategory } from "@/content/puzzles/beginner";
import GameCard from "@/components/ui/GameCard";
import SectionHeader from "@/components/ui/SectionHeader";
import ProgressRing from "@/components/ui/ProgressRing";
import RankBadge from "@/components/ui/RankBadge";
import StatPill from "@/components/ui/StatPill";
import XPBar from "@/components/ui/XPBar";
import FlameIcon from "@/components/ui/FlameIcon";
import BadgeEmblem from "@/components/ui/BadgeEmblem";

const PUZZLE_CATEGORIES: { key: PuzzleCategory; label: string }[] = [
  { key: "tactics", label: "Tactics" },
  { key: "calculation", label: "Calculation" },
  { key: "mate", label: "Mates" },
];

const FUTURE = [
  { title: "Openings World", note: "Tier 1" },
  { title: "Endgame World", note: "Tier 2" },
];

const PUZZLE_BY_ID = new Map(BEGINNER_PUZZLES.map((p) => [p.id, p]));

export default function ProfileScreen() {
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
  const solved = puzzlesSolvedCount(solvedIds);
  const acc = overallAccuracy(attempts);
  const recent = attempts.slice(0, 5);

  const badges = [
    { glyph: "♟", label: "First Solve", unlocked: solved >= 1 },
    { glyph: "♞", label: "Scholar", unlocked: prog.done >= 1 },
    { glyph: "♜", label: "Tactician", unlocked: solved >= 10 },
    { glyph: "✦", label: "Sharpshooter", unlocked: acc.total >= 5 && acc.pct >= 0.8 },
    { glyph: "♛", label: "Streak ×3", unlocked: streak >= 3 },
    { glyph: "♚", label: "Foundations", unlocked: prog.done === prog.total && prog.total > 0 },
  ];

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs uppercase tracking-[0.16em] text-muted2">Profile</p>
        <h1 className="font-display text-3xl text-cream">Player Card</h1>
      </header>

      {/* Player identity card */}
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
              {xp} XP
              {rank.next ? ` · ${rank.next.title} at Lv ${rank.next.atLevel}` : " · top rank reached"}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <XPBar value={lvl.progress} />
          <p className="mt-1 text-[11px] text-muted2">
            {lvl.intoLevel} / {lvl.span} XP to Level {lvl.level + 1}
          </p>
        </div>
      </GameCard>

      {/* Achievement shelf */}
      <section>
        <SectionHeader title="Achievements" />
        <GameCard className="p-4">
          <div className="grid grid-cols-4 gap-3">
            {badges.map((b) => (
              <BadgeEmblem key={b.label} glyph={b.glyph} label={b.label} unlocked={b.unlocked} />
            ))}
          </div>
        </GameCard>
      </section>

      {/* Core stats */}
      <div className="grid grid-cols-3 gap-2.5">
        <StatPill label="Puzzle Rating" value={`${puzzleRating}`} tone="brass" />
        <StatPill label="Solved" value={`${solved}/${BEGINNER_PUZZLES.length}`} />
        <StatPill
          label="Accuracy"
          value={acc.total ? `${Math.round(acc.pct * 100)}%` : "—"}
          sub={acc.total ? `${acc.correct}/${acc.total}` : "no tries"}
          tone={acc.total ? "good" : "muted"}
        />
        <StatPill label="Streak" value={`${streak}`} sub={streak === 1 ? "day" : "days"} />
        <StatPill label="Lessons" value={`${prog.done}/${prog.total}`} />
        <StatPill label="Academy" value={`${Math.round(prog.pct * 100)}%`} />
      </div>

      {/* Skill categories */}
      <section>
        <SectionHeader title="Skill Categories" />
        <div className="space-y-2.5">
          {PUZZLE_CATEGORIES.map(({ key, label }) => {
            const inCat = attempts.filter((a) => PUZZLE_BY_ID.get(a.puzzleId)?.categories.includes(key));
            const correct = inCat.filter((a) => a.correct).length;
            const pct = inCat.length ? correct / inCat.length : 0;
            return (
              <GameCard key={key} className="px-3.5 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-cream">{label}</span>
                  <span className="text-xs text-muted2">
                    {inCat.length ? `${Math.round(pct * 100)}% · ${correct}/${inCat.length}` : "no data yet"}
                  </span>
                </div>
                <div className="mt-2">
                  <XPBar value={pct} />
                </div>
              </GameCard>
            );
          })}
        </div>
      </section>

      {/* Recent activity */}
      <section>
        <SectionHeader title="Recent Puzzles" />
        {recent.length === 0 ? (
          <GameCard className="px-4 py-6 text-center">
            <p className="text-sm text-muted2">Solve a few puzzles to build your history.</p>
          </GameCard>
        ) : (
          <ul className="space-y-2">
            {recent.map((a, i) => (
              <li key={a.id ?? i}>
                <GameCard className="flex items-center justify-between px-3.5 py-2.5">
                  <span className="flex items-center gap-2.5 text-sm text-cream">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                        a.correct ? "bg-good/20 text-good" : "bg-bad/20 text-bad"
                      }`}
                    >
                      {a.correct ? "✓" : "✗"}
                    </span>
                    {THEME_LABELS[a.theme as keyof typeof THEME_LABELS] ?? a.theme}
                  </span>
                  <span className="text-xs text-muted2">{a.ratingAfter} rating</span>
                </GameCard>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Future worlds */}
      <section>
        <SectionHeader title="Locked Worlds" />
        <div className="grid grid-cols-2 gap-2.5">
          {FUTURE.map((f) => (
            <GameCard key={f.title} className="flex items-center gap-2.5 px-3.5 py-3 opacity-70">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-panel2 text-muted2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="5" y="11" width="14" height="9" rx="2" />
                  <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                </svg>
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm text-cream">{f.title}</p>
                <p className="text-[11px] text-muted2">{f.note}</p>
              </div>
            </GameCard>
          ))}
        </div>
      </section>
    </div>
  );
}
