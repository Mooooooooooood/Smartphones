"use client";

import { useEffect } from "react";
import { useProfileStore, selectLevel, academyProgress, puzzlesSolvedCount } from "@/state/profileStore";
import { usePuzzleStore, overallAccuracy } from "@/state/puzzleStore";
import { BEGINNER_PUZZLES, THEME_LABELS, type PuzzleCategory } from "@/content/puzzles/beginner";
import ProgressBar from "@/components/ProgressBar";
import StatTile from "@/components/StatTile";

const PUZZLE_CATEGORIES: { key: PuzzleCategory; label: string }[] = [
  { key: "tactics", label: "Tactics" },
  { key: "calculation", label: "Calculation" },
  { key: "mate", label: "Mates" },
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
  const prog = academyProgress(completed);
  const solved = puzzlesSolvedCount(solvedIds);
  const acc = overallAccuracy(attempts);
  const recent = attempts.slice(0, 5);

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs uppercase tracking-[0.16em] text-muted2">Profile</p>
        <h1 className="font-display text-3xl text-cream">Your progress</h1>
      </header>

      <section
        className="rounded-2xl border border-line p-4"
        style={{ backgroundImage: "linear-gradient(to bottom, #2a2116, #1f1810)" }}
      >
        <div className="flex items-baseline justify-between">
          <span className="font-display text-2xl text-cream">Level {lvl.level}</span>
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
        <StatTile label="Lessons" value={`${prog.done}/${prog.total}`} />
        <StatTile label="Academy" value={`${Math.round(prog.pct * 100)}%`} />
      </div>

      {/* Puzzle stats */}
      <section className="space-y-3">
        <h2 className="font-display text-lg text-cream">Puzzle training</h2>
        <div className="grid grid-cols-3 gap-3">
          <StatTile label="Rating" value={`${puzzleRating}`} />
          <StatTile label="Solved" value={`${solved}/${BEGINNER_PUZZLES.length}`} />
          <StatTile
            label="Accuracy"
            value={acc.total ? `${Math.round(acc.pct * 100)}%` : "—"}
            hint={acc.total ? `${acc.correct}/${acc.total}` : "no attempts"}
          />
        </div>
      </section>

      {/* Skill categories */}
      <section>
        <h2 className="mb-2 font-display text-lg text-cream">Skill categories</h2>
        <div className="space-y-2">
          {PUZZLE_CATEGORIES.map(({ key, label }) => {
            const inCat = attempts.filter((a) => PUZZLE_BY_ID.get(a.puzzleId)?.categories.includes(key));
            const correct = inCat.filter((a) => a.correct).length;
            const pct = inCat.length ? correct / inCat.length : 0;
            return (
              <div key={key} className="rounded-xl border border-line bg-panel/50 px-3.5 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">{label}</span>
                  <span className="text-xs text-muted2">
                    {inCat.length ? `${Math.round(pct * 100)}% · ${correct}/${inCat.length}` : "no data yet"}
                  </span>
                </div>
                {inCat.length ? (
                  <div className="mt-2">
                    <ProgressBar value={pct} />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent performance */}
      <section>
        <h2 className="mb-2 font-display text-lg text-cream">Recent puzzles</h2>
        {recent.length === 0 ? (
          <p className="rounded-xl border border-line bg-panel/50 px-3.5 py-3 text-center text-sm text-muted2">
            Solve a few puzzles to see your recent performance here.
          </p>
        ) : (
          <ul className="space-y-2">
            {recent.map((a, i) => (
              <li
                key={a.id ?? i}
                className="flex items-center justify-between rounded-xl border border-line bg-panel/50 px-3.5 py-2.5"
              >
                <span className="flex items-center gap-2 text-sm text-muted">
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                      a.correct ? "bg-good/20 text-good" : "bg-bad/20 text-bad"
                    }`}
                  >
                    {a.correct ? "✓" : "✗"}
                  </span>
                  {THEME_LABELS[a.theme as keyof typeof THEME_LABELS] ?? a.theme}
                </span>
                <span className="text-xs text-muted2">{a.ratingAfter}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
