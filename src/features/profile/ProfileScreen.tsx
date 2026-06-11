"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useProfileStore, selectLevel, puzzlesSolvedCount, academyStateFrom } from "@/state/profileStore";
import { usePuzzleStore, overallAccuracy } from "@/state/puzzleStore";
import { rankForLevel } from "@/domain/progression/rank";
import { todayKey } from "@/domain/progression/leveling";
import {
  academyProgress,
  tierProgress,
  isTierUnlocked,
  bossStatus,
  currentStageLabel,
} from "@/domain/academy/progression";
import { dailyForToday, dailyDoneCount } from "@/domain/training/daily";
import { TIER0_BOSS } from "@/content/academy";
import { BEGINNER_PUZZLES, THEME_LABELS, type PuzzleCategory } from "@/content/puzzles/beginner";
import GameCard from "@/components/ui/GameCard";
import SectionHeader from "@/components/ui/SectionHeader";
import ProgressRing from "@/components/ui/ProgressRing";
import RankBadge from "@/components/ui/RankBadge";
import XPBar from "@/components/ui/XPBar";
import FlameIcon from "@/components/ui/FlameIcon";
import BadgeEmblem from "@/components/ui/BadgeEmblem";
import CoachBubble from "@/components/ui/CoachBubble";
import ThemeToggle from "@/components/ui/ThemeToggle";
import ChessBuddy, { BUDDIES, type BuddyPiece } from "@/components/characters/ChessBuddy";

const GUIDE_SURFACES: { piece: BuddyPiece; surface: string }[] = [
  { piece: "pawn", surface: "bg-surf-blue" },
  { piece: "knight", surface: "bg-surf-mint" },
  { piece: "rook", surface: "bg-surf-peach" },
  { piece: "bishop", surface: "bg-surf-lav" },
  { piece: "queen", surface: "bg-surf-sun" },
  { piece: "king", surface: "bg-surf-sun" },
];

const PUZZLE_CATEGORIES: { key: PuzzleCategory; label: string }[] = [
  { key: "tactics", label: "Tactics" },
  { key: "calculation", label: "Calculation" },
  { key: "mate", label: "Mates" },
];

const FUTURE = [
  { title: "Endgame World", note: "Tier 2", surface: "bg-surf-mint", glyph: "♚" },
  { title: "Opening World", note: "Tier 3", surface: "bg-surf-peach", glyph: "♟" },
];

const PUZZLE_BY_ID = new Map(BEGINNER_PUZZLES.map((p) => [p.id, p]));

function TierRow({
  label,
  done,
  total,
  pct,
  locked = false,
}: {
  label: string;
  done: number;
  total: number;
  pct: number;
  locked?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2.5 ${locked ? "opacity-50" : ""}`}>
      <span className="w-16 shrink-0 text-xs text-muted">{label}</span>
      <XPBar value={pct} />
      <span className="w-10 shrink-0 text-right text-[11px] text-muted2">
        {locked ? "🔒" : `${done}/${total}`}
      </span>
    </div>
  );
}

export default function ProfileScreen() {
  const xp = useProfileStore((s) => s.xp);
  const streak = useProfileStore((s) => s.streak);
  const completed = useProfileStore((s) => s.completed);
  const bossClearedMap = useProfileStore((s) => s.bossCleared);
  const puzzleRating = useProfileStore((s) => s.puzzleRating);
  const solvedIds = useProfileStore((s) => s.solvedPuzzleIds);
  const dailyRaw = useProfileStore((s) => s.daily);
  const playRating = useProfileStore((s) => s.playRating);
  const matches = useProfileStore((s) => s.matches);
  const attempts = usePuzzleStore((s) => s.attempts);

  useEffect(() => {
    void usePuzzleStore.getState().hydrate();
  }, []);

  const matchStats = {
    played: matches.length,
    wins: matches.filter((m) => m.result === "win").length,
    losses: matches.filter((m) => m.result === "loss").length,
    draws: matches.filter((m) => m.result === "draw").length,
  };
  const recentMatches = matches.slice(0, 4);

  const lvl = selectLevel(xp);
  const rank = rankForLevel(lvl.level);
  const state = academyStateFrom(completed, bossClearedMap);
  const acad = academyProgress(state);
  const t0 = tierProgress(0, state);
  const t1 = tierProgress(1, state);
  const tier1Open = isTierUnlocked(1, state);
  const bStatus = bossStatus(TIER0_BOSS.id, state);
  const stage = currentStageLabel(state);
  const daily = dailyForToday(dailyRaw, todayKey());
  const dailyDone = dailyDoneCount(daily);
  const solved = puzzlesSolvedCount(solvedIds);
  const acc = overallAccuracy(attempts);
  const recent = attempts.slice(0, 5);

  const badges = [
    { glyph: "♟", label: "First Solve", unlocked: solved >= 1 },
    { glyph: "♞", label: "Scholar", unlocked: acad.done >= 1 },
    { glyph: "♜", label: "Tactician", unlocked: solved >= 10 },
    { glyph: "✦", label: "Sharpshooter", unlocked: acc.total >= 5 && acc.pct >= 0.8 },
    { glyph: "★", label: "Streak ×3", unlocked: streak >= 3 },
    { glyph: "♚", label: "Foundations", unlocked: t0.done === t0.total && t0.total > 0 },
    { glyph: "♛", label: "Trial", unlocked: bStatus === "completed" },
    { glyph: "♝", label: "First Tactics", unlocked: t1.done === t1.total && t1.total > 0 },
  ];

  const bossLabel =
    bStatus === "completed" ? "Passed" : bStatus === "ready" ? "Ready" : "Locked";

  const unlockedBadges = badges.filter((b) => b.unlocked).length;
  const coachLine =
    xp === 0
      ? "Welcome, challenger! Begin your journey on the path."
      : t0.done < t0.total
        ? "Keep climbing the Foundations path — you're doing great!"
        : bStatus !== "completed"
          ? "The Tier 0 Trial awaits. I believe in you!"
          : `Strong work, ${rank.title}! Keep that streak alive.`;

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted2">Profile</p>
          <h1 className="font-display text-3xl text-cream">Player Card</h1>
        </div>
        <ThemeToggle compact />
      </header>

      {/* Player identity card */}
      <GameCard variant="accent" glow className="relative overflow-hidden p-5">
        <div aria-hidden className="pointer-events-none absolute inset-0 select-none">
          <span className="absolute -right-3 -top-4 text-8xl text-lav/15">♚</span>
          <span className="tab-twinkle absolute left-4 top-4 text-lg text-sun">✦</span>
          <span className="tab-twinkle absolute right-10 top-12 text-sm text-mint">✦</span>
        </div>
        <div className="relative flex items-center gap-3.5">
          <ProgressRing value={lvl.progress} size={104} stroke={11}>
            <span className="font-display text-4xl leading-none text-cream">{lvl.level}</span>
            <span className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-muted2">Level</span>
          </ProgressRing>
          <div className="min-w-0 flex-1">
            <RankBadge title={rank.title} />
            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted">
              <FlameIcon active={streak > 0} />
              <span className="font-semibold text-cream">{streak}</span>
              <span className="text-muted2">day{streak === 1 ? "" : "s"}</span>
            </div>
            <p className="mt-1 text-[11px] text-muted2">
              {xp} XP{rank.next ? ` · ${rank.next.title} next` : " · top rank"}
            </p>
          </div>
          <div className="tab-bob shrink-0 self-end">
            <ChessBuddy piece="king" size={54} />
          </div>
        </div>
        <div className="mt-4">
          <XPBar value={lvl.progress} />
          <p className="mt-1 text-[11px] text-muted2">
            {lvl.intoLevel} / {lvl.span} XP to Level {lvl.level + 1}
          </p>
        </div>
      </GameCard>

      {/* Cassius coach note */}
      <CoachBubble piece="king">{coachLine}</CoachBubble>

      {/* Your guides */}
      <section>
        <SectionHeader title="Your Guides" />
        <GameCard className="p-4">
          <div className="grid grid-cols-3 gap-3">
            {GUIDE_SURFACES.map(({ piece, surface }) => (
              <div key={piece} className="flex flex-col items-center gap-1.5">
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl border border-line ${surface}`}>
                  <ChessBuddy piece={piece} size={52} />
                </div>
                <span className="text-[11px] font-semibold text-cream">{BUDDIES[piece].name}</span>
                <span className="text-[9px] leading-tight text-muted2">{BUDDIES[piece].role}</span>
              </div>
            ))}
          </div>
        </GameCard>
      </section>

      {/* World progress */}
      <section>
        <SectionHeader title="World Progress" />
        <GameCard className="space-y-3 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-cream">Current stage</span>
            <span className="rounded-full border border-brass/40 bg-brass/10 px-2.5 py-1 text-[11px] font-semibold text-brass">
              {stage}
            </span>
          </div>
          <TierRow label="Tier 0" done={t0.done} total={t0.total} pct={t0.pct} />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">Tier 0 Trial</span>
            <span
              className={`text-[11px] font-semibold ${
                bStatus === "completed" ? "text-good" : bStatus === "ready" ? "text-brass" : "text-muted2"
              }`}
            >
              {bossLabel}
            </span>
          </div>
          <TierRow label="Tier 1" done={t1.done} total={t1.total} pct={t1.pct} locked={!tier1Open} />
        </GameCard>
      </section>

      {/* Daily training */}
      <section>
        <SectionHeader title="Daily Training" />
        <GameCard className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2.5">
            {(["academy", "puzzle", "play"] as const).map((k) => {
              const done =
                k === "academy" ? daily.academyTaskDone : k === "puzzle" ? daily.puzzleTaskDone : daily.playTaskDone;
              const glyph = k === "academy" ? "♟" : k === "puzzle" ? "✦" : "♞";
              return (
                <span
                  key={k}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl border text-base ${
                    done ? "border-good/50 bg-good/15 text-good" : "border-line bg-ink2 text-muted2"
                  }`}
                  aria-hidden
                >
                  {done ? "✓" : glyph}
                </span>
              );
            })}
          </div>
          <div className="text-right">
            <div className="font-display text-lg text-cream">{dailyDone}/3</div>
            <div className="text-[11px] text-muted2">{daily.bonusClaimed ? "bonus claimed" : "today"}</div>
          </div>
        </GameCard>
      </section>

      {/* Matches */}
      <section>
        <SectionHeader title="Matches" />
        <GameCard className="p-4">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <div className="font-display text-xl text-cream">{matchStats.played}</div>
              <div className="text-[10px] uppercase tracking-wide text-muted2">Played</div>
            </div>
            <div>
              <div className="font-display text-xl text-gooddeep">{matchStats.wins}</div>
              <div className="text-[10px] uppercase tracking-wide text-muted2">Wins</div>
            </div>
            <div>
              <div className="font-display text-xl text-muted">{matchStats.draws}</div>
              <div className="text-[10px] uppercase tracking-wide text-muted2">Draws</div>
            </div>
            <div>
              <div className="font-display text-xl text-bad">{matchStats.losses}</div>
              <div className="text-[10px] uppercase tracking-wide text-muted2">Losses</div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-line/70 pt-3">
            <span className="text-sm text-muted">Play rating</span>
            <span className="font-display text-lg text-brass">{playRating}</span>
          </div>

          {recentMatches.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {recentMatches.map((m, i) => {
                const delta = m.ratingAfter - m.ratingBefore;
                const replayable = Boolean(m.id && ((m.sans && m.sans.length) || m.pgn));
                const inner = (
                  <>
                    <span className="flex min-w-0 items-center gap-2 text-muted">
                      <span
                        className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                          m.result === "win"
                            ? "bg-good/20 text-gooddeep"
                            : m.result === "draw"
                              ? "bg-ink2 text-muted"
                              : "bg-bad/20 text-bad"
                        }`}
                      >
                        {m.result === "win" ? "W" : m.result === "draw" ? "D" : "L"}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-cream">{m.opponentName}</span>
                        <span className="text-[10px] text-muted2">
                          as {m.userColor === "w" ? "White" : "Black"} · {m.moves} moves
                        </span>
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2 text-right">
                      <span>
                        <span className={`block font-semibold ${delta >= 0 ? "text-gooddeep" : "text-bad"}`}>
                          {delta >= 0 ? "+" : ""}
                          {delta}
                        </span>
                        <span className="text-[10px] text-brass">+{m.xpAwarded} XP</span>
                      </span>
                      {replayable ? <span className="text-brass">›</span> : null}
                    </span>
                  </>
                );
                const cls =
                  "flex items-center justify-between gap-2 rounded-xl border border-line bg-ink2/50 px-2.5 py-2 text-xs";
                return (
                  <li key={m.id ?? i}>
                    {replayable ? (
                      <Link href={`/play/review?id=${m.id}`} className={`${cls} transition-transform active:scale-[0.99]`}>
                        {inner}
                      </Link>
                    ) : (
                      <div className={cls}>{inner}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-3 text-center text-[11px] text-muted2">
              Play a match to start your record.
            </p>
          )}
        </GameCard>
      </section>

      {/* Achievement shelf */}
      <section>
        <SectionHeader
          title="Achievements"
          action={
            <span className="rounded-full border border-brass/40 bg-brass/10 px-2.5 py-1 text-[11px] font-bold text-brass">
              {unlockedBadges}/{badges.length}
            </span>
          }
        />
        <GameCard className="p-4">
          <div className="grid grid-cols-4 gap-3">
            {badges.map((b) => (
              <BadgeEmblem key={b.label} glyph={b.glyph} label={b.label} unlocked={b.unlocked} />
            ))}
          </div>
        </GameCard>
      </section>

      {/* Tactics — puzzle stats + categories */}
      <section>
        <SectionHeader title="Tactics" />
        <GameCard className="mb-2.5 grid grid-cols-3 gap-2 p-3 text-center">
          <div>
            <div className="font-display text-xl text-brass">{puzzleRating}</div>
            <div className="text-[10px] uppercase tracking-wide text-muted2">Rating</div>
          </div>
          <div>
            <div className="font-display text-xl text-cream">{solved}<span className="text-sm text-muted2">/{BEGINNER_PUZZLES.length}</span></div>
            <div className="text-[10px] uppercase tracking-wide text-muted2">Solved</div>
          </div>
          <div>
            <div className={`font-display text-xl ${acc.total ? "text-gooddeep" : "text-muted2"}`}>
              {acc.total ? `${Math.round(acc.pct * 100)}%` : "—"}
            </div>
            <div className="text-[10px] uppercase tracking-wide text-muted2">Accuracy</div>
          </div>
        </GameCard>
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
            <div
              key={f.title}
              className={`flex items-center gap-2.5 rounded-2xl border border-line px-3.5 py-3 ${f.surface}`}
            >
              <span className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-panel text-lg text-muted2">
                {f.glyph}
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border border-line bg-panel text-[8px] text-muted2">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="5" y="11" width="14" height="9" rx="2" />
                    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                  </svg>
                </span>
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-cream">{f.title}</p>
                <p className="text-[11px] text-muted2">{f.note}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Appearance */}
      <section>
        <SectionHeader title="Appearance" />
        <GameCard className="flex flex-col items-center gap-3 p-4">
          <p className="text-xs text-muted">Choose your world: bright day or cozy night.</p>
          <ThemeToggle />
        </GameCard>
      </section>
    </div>
  );
}
