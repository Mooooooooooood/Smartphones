"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useProfileStore, selectLevel, puzzlesSolvedCount, academyStateFrom } from "@/state/profileStore";
import { usePuzzleStore, overallAccuracy } from "@/state/puzzleStore";
import { rankForLevel } from "@/domain/progression/rank";
import { academyProgress } from "@/domain/academy/progression";
import PixelTopBar from "@/components/pixel/PixelTopBar";
import PixelPanel from "@/components/pixel/PixelPanel";
import PixelStatPill from "@/components/pixel/PixelStatPill";
import PixelCharacterFrame from "@/components/pixel/PixelCharacterFrame";
import AvatarPortrait from "@/components/pixel/AvatarPortrait";
import PixelSettingsModal from "@/components/pixel/PixelSettingsModal";
import BadgeEmblem from "@/components/ui/BadgeEmblem";
import AchievementModal from "@/components/pixel/AchievementModal";
import StreakCalendar from "@/components/pixel/StreakCalendar";
import { achievementViews, type AchievementView } from "@/content/achievements";
import { fx } from "@/lib/feedback";
import ChessBuddy, { type BuddyPiece } from "@/components/characters/ChessBuddy";
import { PLAYER_PALETTES, type SpritePalette } from "@/components/pixel/PixelSprite";
import { CoinIcon, GearGlyph } from "@/components/pixel/PixelIcon";

const STONE: SpritePalette = { body: "#8b97c4", hi: "#aab6e0", line: "#3a4a8c", accent: "#cfd8f0" };
const TAN: SpritePalette = { body: "#e0b884", hi: "#f3d8aa", line: "#9a6f3c", accent: "#fff0d8" };

const GUIDE_ROSTER: { name: string; piece: BuddyPiece; hue: "gold" | "purple" | "blue" | "red" | "orange" | "green"; palette?: SpritePalette }[] = [
  { name: "King Arthur", piece: "king", hue: "gold", palette: PLAYER_PALETTES.gold },
  { name: "Queen Luna", piece: "queen", hue: "purple", palette: PLAYER_PALETTES.purple },
  { name: "Bishop Eli", piece: "bishop", hue: "blue", palette: PLAYER_PALETTES.blue },
  { name: "Knight Rex", piece: "knight", hue: "red", palette: PLAYER_PALETTES.red },
  { name: "Rooky", piece: "rook", hue: "gray" as "blue", palette: STONE },
  { name: "Pawnie", piece: "pawn", hue: "orange", palette: TAN },
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [openAch, setOpenAch] = useState<AchievementView | null>(null);
  const lastActiveDate = useProfileStore((s) => s.lastActiveDate);

  useEffect(() => {
    void usePuzzleStore.getState().hydrate();
  }, []);

  const lvl = selectLevel(xp);
  const rank = rankForLevel(lvl.level);
  const state = academyStateFrom(completed, bossClearedMap);
  const acad = academyProgress(state);
  const solved = puzzlesSolvedCount(solvedIds);
  const acc = overallAccuracy(attempts);

  const wins = matches.filter((m) => m.result === "win").length;
  const winRate = matches.length ? Math.round((wins / matches.length) * 100) : 0;
  const recent = matches.slice(0, 4);

  const achievements = achievementViews({
    wins,
    solved,
    streak,
    accGames: acc.total,
    accPct: acc.pct,
    academy: state,
  });
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="space-y-2.5">
      <PixelTopBar star />

      <h1 className="px-title text-center text-[1.4rem]">Profile</h1>

      {/* Player card */}
      <PixelPanel hue="blue" label="Player Card" className="flex items-stretch gap-2.5 px-2.5 pb-2.5 pt-3">
        <div className="flex shrink-0 flex-col items-center gap-1">
          <PixelCharacterFrame hue="gold" size={66}>
            <AvatarPortrait size={56} />
          </PixelCharacterFrame>
          <span className="px-label rounded-[4px] border-2 border-[var(--px-edge)] bg-brass px-1.5 py-0.5 text-[0.46rem] text-[color:var(--color-on-accent)]">Lv. {lvl.level}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="px-label text-[0.78rem] text-cream">TABIYA</span>
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

      {/* Streak calendar */}
      <PixelPanel hue="orange" label="Daily Streak" labelHue="orange" className="px-2.5 pb-2.5 pt-3">
        <StreakCalendar streak={streak} lastActiveDate={lastActiveDate} />
      </PixelPanel>

      {/* Guides */}
      <PixelPanel hue="purple" label="Your Guides" labelHue="purple" className="px-2.5 pb-2.5 pt-3">
        <div className="grid grid-cols-6 gap-1">
          {GUIDE_ROSTER.map(({ name, piece, hue, palette }) => (
            <div key={name} className="flex min-w-0 flex-col items-center gap-0.5">
              <PixelCharacterFrame hue={hue} size={40}>
                <ChessBuddy piece={piece} size={32} palette={palette} />
              </PixelCharacterFrame>
              <span className="px-label w-full truncate text-center text-[0.38rem] text-muted2">{name}</span>
            </div>
          ))}
        </div>
      </PixelPanel>

      {/* Achievements */}
      <PixelPanel hue="gold" label="Achievements" labelHue="gold" diamonds className="px-2.5 pb-2.5 pt-3">
        <div className="mb-1.5 flex justify-end">
          <span className="px-label text-[0.46rem] text-brass">{unlockedCount}/{achievements.length}</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {achievements.map((a) => (
            <button key={a.id} type="button" onClick={() => { fx.tap(); setOpenAch(a); }} className="active:translate-y-0.5">
              <BadgeEmblem glyph={a.glyph} label={a.name} unlocked={a.unlocked} />
            </button>
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

      {/* Settings button */}
      <button type="button" onClick={() => setSettingsOpen(true)} className="px-btn px-btn-secondary mx-auto flex w-[70%] items-center justify-center gap-2 !text-[0.62rem]">
        <GearGlyph size={14} /> SETTINGS ›
      </button>

      <PixelSettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <AchievementModal achievement={openAch} onClose={() => setOpenAch(null)} />
    </div>
  );
}
