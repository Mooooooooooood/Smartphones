"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useProfileStore, selectLevel, puzzlesSolvedCount, academyStateFrom } from "@/state/profileStore";
import { usePuzzleStore, overallAccuracy } from "@/state/puzzleStore";
import { rankForLevel } from "@/domain/progression/rank";
import { academyProgress, tierProgress, bossStatus } from "@/domain/academy/progression";
import { TIER0_BOSS } from "@/content/academy";
import PixelTopBar from "@/components/pixel/PixelTopBar";
import PixelPanel from "@/components/pixel/PixelPanel";
import PixelStatPill from "@/components/pixel/PixelStatPill";
import PixelCharacterFrame from "@/components/pixel/PixelCharacterFrame";
import BadgeEmblem from "@/components/ui/BadgeEmblem";
import ThemeToggle from "@/components/ui/ThemeToggle";
import ChessBuddy, { BUDDIES, type BuddyPiece } from "@/components/characters/ChessBuddy";
import { CoinIcon } from "@/components/pixel/PixelIcon";
import SettingsSection from "./SettingsSection";

const GUIDES: { piece: BuddyPiece; hue: "gold" | "purple" | "blue" | "red" | "orange" | "green" }[] = [
  { piece: "king", hue: "gold" },
  { piece: "queen", hue: "red" },
  { piece: "bishop", hue: "purple" },
  { piece: "knight", hue: "green" },
  { piece: "rook", hue: "orange" },
  { piece: "pawn", hue: "blue" },
];

export default function ProfileScreen() {
  const xp = useProfileStore((s) => s.xp);
  const streak = useProfileStore((s) => s.streak);
  const completed = useProfileStore((s) => s.completed);
  const bossClearedMap = useProfileStore((s) => s.bossCleared);
  const puzzleRating = useProfileStore((s) => s.puzzleRating);
  const solvedIds = useProfileStore((s) => s.solvedPuzzleIds);
  const matches = useProfileStore((s) => s.matches);
  const attempts = usePuzzleStore((s) => s.attempts);

  useEffect(() => {
    void usePuzzleStore.getState().hydrate();
  }, []);

  const lvl = selectLevel(xp);
  const rank = rankForLevel(lvl.level);
  const state = academyStateFrom(completed, bossClearedMap);
  const acad = academyProgress(state);
  const t1 = tierProgress(1, state);
  const bStatus = bossStatus(TIER0_BOSS.id, state);
  const solved = puzzlesSolvedCount(solvedIds);
  const acc = overallAccuracy(attempts);

  const wins = matches.filter((m) => m.result === "win").length;
  const winRate = matches.length ? Math.round((wins / matches.length) * 100) : 0;
  const recent = matches.slice(0, 4);

  const badges = [
    { glyph: "♟", label: "First Win", unlocked: wins >= 1 },
    { glyph: "✦", label: "Puzzle Master", unlocked: solved >= 10 },
    { glyph: "♞", label: "Tactics Fan", unlocked: acc.total >= 5 && acc.pct >= 0.8 },
    { glyph: "★", label: "Weekly Warrior", unlocked: streak >= 7 },
    { glyph: "♚", label: "Endgame", unlocked: t1.done === t1.total && t1.total > 0 },
    { glyph: "♛", label: "Legend", unlocked: bStatus === "completed" },
  ];

  return (
    <div className="space-y-2.5">
      <PixelTopBar star />

      <div className="flex items-center justify-between px-1">
        <span className="w-9" />
        <h1 className="px-title text-[1.4rem]">Profile</h1>
        <ThemeToggle compact />
      </div>

      {/* Player card */}
      <PixelPanel hue="blue" label="Player Card" className="flex items-stretch gap-2.5 px-2.5 pb-2.5 pt-3">
        <div className="flex shrink-0 flex-col items-center gap-1">
          <PixelCharacterFrame hue="gold" size={66}>
            <ChessBuddy piece="king" size={54} />
          </PixelCharacterFrame>
          <span className="px-label rounded-[4px] border-2 border-[var(--px-edge)] bg-brass px-1.5 py-0.5 text-[0.46rem] text-[color:var(--color-on-accent)]">Lv. {lvl.level}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="px-label text-[0.78rem] text-cream">Player</span>
            <span className="text-[0.6rem] text-muted2" aria-hidden>✎</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <ChessBuddy piece="pawn" size={18} />
            <span className="px-label text-[0.56rem] text-good">{rank.title}</span>
          </div>
          <p className="mt-0.5 text-[0.52rem] text-muted2">Keep learning, future master!</p>
          <div className="mt-1.5 flex items-center gap-1.5">
            <div className="px-track h-3 flex-1">
              <div className="px-track-fill" style={{ width: `${Math.round(lvl.progress * 100)}%`, "--fill": "var(--color-good)" } as React.CSSProperties} />
            </div>
            <span className="px-label text-[0.46rem] text-muted2">{lvl.intoLevel}/{lvl.span}</span>
          </div>
        </div>
      </PixelPanel>

      {/* Stat pills */}
      <div className="grid grid-cols-3 gap-2">
        <PixelStatPill label="Win Rate" value={`${winRate}%`} icon={<span aria-hidden>🏆</span>} tone="good" />
        <PixelStatPill label="Rating" value={puzzleRating} icon={<span aria-hidden>🧩</span>} tone="purple" />
        <PixelStatPill label="Academy" value={`${acad.done}/${acad.total}`} icon={<span aria-hidden>📖</span>} tone="blue" />
      </div>

      {/* Guides */}
      <PixelPanel hue="purple" label="Your Guides" labelHue="purple" className="px-2.5 pb-2.5 pt-3">
        <div className="grid grid-cols-6 gap-1">
          {GUIDES.map(({ piece, hue }) => (
            <div key={piece} className="flex min-w-0 flex-col items-center gap-0.5">
              <PixelCharacterFrame hue={hue} size={40}>
                <ChessBuddy piece={piece} size={32} />
              </PixelCharacterFrame>
              <span className="px-label w-full truncate text-center text-[0.4rem] text-muted2">{BUDDIES[piece].name}</span>
            </div>
          ))}
        </div>
      </PixelPanel>

      {/* Achievements */}
      <PixelPanel hue="gold" label="Achievements" labelHue="gold" className="px-2.5 pb-2.5 pt-3">
        <div className="grid grid-cols-6 gap-1">
          {badges.map((b) => (
            <BadgeEmblem key={b.label} glyph={b.glyph} label={b.label} unlocked={b.unlocked} />
          ))}
        </div>
      </PixelPanel>

      {/* Recent activity */}
      <PixelPanel hue="green" label="Recent Activity" labelHue="green" className="px-2.5 pb-2.5 pt-3">
        {recent.length === 0 ? (
          <p className="py-2 text-center text-[0.6rem] text-muted2">Play a match to start your record.</p>
        ) : (
          <ul className="space-y-1.5">
            {recent.map((m, i) => {
              const delta = m.ratingAfter - m.ratingBefore;
              const replayable = Boolean(m.id && ((m.sans && m.sans.length) || m.pgn));
              const win = m.result === "win";
              const row = (
                <div className="px-inset flex items-center gap-2 px-2 py-1.5">
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] border-2 border-[var(--px-edge)] font-display text-[0.52rem] ${win ? "bg-good text-[color:#06220f]" : m.result === "draw" ? "bg-[var(--color-ink)] text-muted" : "bg-bad text-[color:#2a0709]"}`}>
                    {win ? "W" : m.result === "draw" ? "D" : "L"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[0.58rem] text-cream">{m.opponentName}</div>
                    <div className="px-label text-[0.4rem] text-muted2">Quick Match</div>
                  </div>
                  <span className={`px-label text-[0.5rem] ${win ? "text-good" : "text-bad"}`}>{delta >= 0 ? "+" : ""}{delta}</span>
                  <span className="flex items-center gap-0.5"><CoinIcon size={10} /><span className="font-display text-[0.48rem] text-brass">{m.xpAwarded}</span></span>
                  {replayable ? <span className="text-brass">▶</span> : <span className="w-2" />}
                </div>
              );
              return <li key={m.id ?? i}>{replayable ? <Link href={`/play/review?id=${m.id}`}>{row}</Link> : row}</li>;
            })}
          </ul>
        )}
      </PixelPanel>

      <SettingsSection />
    </div>
  );
}
